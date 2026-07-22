import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type ButtonInteraction, DiscordAPIError } from "discord.js";
import { categoryManagerMenu, categorySortButtons, productCategoryMenu, productManagerMenu, stockActionButtons } from "../components/setupComponents.js";
import { categoryMenu, shopButtons } from "../components/shopComponents.js";
import { categoryRepository, productRepository, settingsRepository, stockRepository } from "../database/repositories.js";
import { openCategoryModal, openModal, openProductModal } from "./modalHandler.js";
import { showDashboard } from "./setupHandler.js";
import { cancelTicket, closeTicket, createOrderTicket, promptSlip, reviewSlip } from "./ticketHandler.js";
import { premiumEmbed, shopEmbed } from "../utils/discord.js";
import { hasAdminAccess } from "../utils/permissions.js";
import { formatStock } from "../utils/formatters.js";
import { DIVIDER } from "../config/constants.js";

async function assertAdmin(interaction: ButtonInteraction): Promise<boolean> {
  if (!interaction.guild) return false;
  const member = await interaction.guild.members.fetch(interaction.user.id);
  if (await hasAdminAccess(member)) return true;
  await interaction.reply({ content: "○ เฉพาะ Owner, Administrator หรือ Staff Role ที่ตั้งค่าไว้", ephemeral: true });
  return false;
}

export async function handleButton(interaction: ButtonInteraction): Promise<unknown> {
  if (!interaction.guildId) return;
  const [scope, action, id, extra] = interaction.customId.split(":");
  if (scope === "shop") {
    if (action === "browse" || action === "order") {
      const categories = await categoryRepository.list(interaction.guildId, false);
      if (!categories.length) return interaction.reply({ content: "○ ร้านค้ายังไม่มีหมวดหมู่สินค้า", ephemeral: true });
      const embed = await premiumEmbed(interaction.guildId, action === "order" ? "CREATE ORDER" : "PRODUCT CATALOG", [
        action === "order" ? "*เริ่มคำสั่งซื้อด้วยการเลือกหมวดหมู่สินค้า*" : "*เลือกหมวดหมู่เพื่อดูสินค้าที่พร้อมจำหน่าย*",
        "",
        DIVIDER,
        "▸ เลือกหมวดหมู่จากเมนูด้านล่าง"
      ].join("\n"));
      return interaction.reply({ embeds: [embed], components: [categoryMenu(categories)], ephemeral: true });
    }
    if (action === "support") return createOrderTicket(interaction);
    if (action === "info") {
      const embed = await premiumEmbed(interaction.guildId, "STORE INFORMATION", [
        "**◆ ROGT SHOPZZZ**",
        "*Realm of Gu1tarzzz • Premium Marketplace*",
        "",
        DIVIDER,
        "▸ สินค้าดูแลโดยทีมงาน",
        "▸ ต้องการความช่วยเหลือ เลือกปุ่ม ช่วยเหลือ"
      ].join("\n"));
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
  if (scope === "order" && action === "create") {
    const product = await productRepository.find(id);
    if (!product) return interaction.reply({ content: "○ ไม่พบสินค้านี้", ephemeral: true });
    return createOrderTicket(interaction, product);
  }
  if (scope === "ticket") {
    if (action === "slip") return promptSlip(interaction);
    if (action === "cancel") return cancelTicket(interaction);
    if (action === "close") return closeTicket(interaction);
  }
  if (scope === "review") return reviewSlip(interaction, id, action as "approve" | "reject" | "refund");

  if (!await assertAdmin(interaction)) return;
  if (scope === "setup") {
    if (action === "home") return showDashboard(interaction);
    if (action === "modal") return openModal(interaction, id);
    if (action === "refresh") {
      if (id === "dashboard") return showDashboard(interaction);
      if (id === "shop") {
        return refreshShopMessage(interaction);
      }
    }
  }
  if (scope === "category") {
    const categories = await categoryRepository.list(interaction.guildId);
    if (action === "create") return openCategoryModal(interaction);
    if (["edit", "delete", "visibility", "sort"].includes(action) && id === "pick") {
      if (!categories.length) return interaction.reply({ content: "○ ยังไม่มีหมวดหมู่", ephemeral: true });
      return interaction.reply({ content: "◆ เลือกหมวดหมู่ที่ต้องการจัดการ", components: [categoryManagerMenu(categories, action as "edit" | "delete" | "visibility" | "sort")], ephemeral: true });
    }
    if (action === "move") {
      const category = await categoryRepository.find(id);
      if (!category) return interaction.reply({ content: "○ ไม่พบหมวดหมู่", ephemeral: true });
      const ordered = categories.sort((a, b) => a.position - b.position);
      const currentIndex = ordered.findIndex((item) => item.id === category.id);
      const otherIndex = extra === "up" ? currentIndex - 1 : currentIndex + 1;
      if (otherIndex < 0 || otherIndex >= ordered.length) return interaction.reply({ content: "○ ไม่สามารถเลื่อนต่อได้", ephemeral: true });
      const other = ordered[otherIndex];
      [category.position, other.position] = [other.position, category.position];
      await Promise.all([categoryRepository.save(category), categoryRepository.save(other)]);
      return interaction.reply({ content: "✔ อัปเดตลำดับหมวดหมู่แล้ว", ephemeral: true });
    }
  }
  if (scope === "product") {
    const products = await productRepository.list(interaction.guildId);
    if (action === "create" && id === "pick") {
      const categories = await categoryRepository.list(interaction.guildId);
      if (!categories.length) return interaction.reply({ content: "○ สร้างหมวดหมู่ก่อนเพิ่มสินค้า", ephemeral: true });
      return interaction.reply({ content: "◆ เลือกหมวดหมู่สำหรับสินค้าใหม่", components: [productCategoryMenu(categories)], ephemeral: true });
    }
    if (["edit", "delete", "visibility"].includes(action) && id === "pick") {
      if (!products.length) return interaction.reply({ content: "○ ยังไม่มีสินค้า", ephemeral: true });
      return interaction.reply({ content: "◆ เลือกสินค้าที่ต้องการจัดการ", components: [productManagerMenu(products, action as "edit" | "delete" | "visibility")], ephemeral: true });
    }
  }
  
  if (scope === "stock") {
    if (!await assertAdmin(interaction)) return;
    if (action === "history" && id) {
      const product = await productRepository.find(id);
      if (!product) return interaction.reply({ content: "○ ไม่พบสินค้า", ephemeral: true });
      const transactions = await stockRepository.getTransactionHistory(id, 25);
      const embed = await premiumEmbed(
        interaction.guildId,
        `STOCK HISTORY • ${product.name}`,
        transactions.length > 0
          ? ["*รายการเคลื่อนไหวล่าสุด*", "", DIVIDER, ...transactions.map((t) => `▸ **${t.type}**  \`${t.previousStock}\` → \`${t.newStock}\`  (${t.quantity > 0 ? "+" : ""}${t.quantity})`)].join("\n")
          : "○ ยังไม่มีประวัติการเคลื่อนไหว"
      );
      embed.setFooter({ text: `คงเหลือปัจจุบัน: ${formatStock(product.stock)}` });
      return interaction.reply({ 
        embeds: [embed], 
        components: transactions.length > 0 
          ? [stockActionButtons(id), new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId("setup:home").setLabel("กลับ").setStyle(ButtonStyle.Secondary).setEmoji("🔙"))] 
          : [],
        ephemeral: true 
      });
    }
  }
}

async function refreshShopMessage(interaction: ButtonInteraction): Promise<void> {
  if (!interaction.guildId || !interaction.guild) return;
  
  const settings = await settingsRepository.get(interaction.guildId);
  const publishedMessageId = settings.shop.publishedMessageId;
  const publishedChannelId = settings.shop.publishedChannelId;
  
  console.log("DEBUG refreshShopMessage:", { publishedMessageId, publishedChannelId, guildId: interaction.guildId });
  
  if (!publishedMessageId || !publishedChannelId) {
    await interaction.reply({ content: "○ ยังไม่พบหน้าร้านที่เผยแพร่  •  ใช้ `/shop` ก่อน", ephemeral: true });
    return;
  }
  
  try {
    const channel = await interaction.guild.channels.fetch(publishedChannelId).catch(() => null);
    console.log("DEBUG channel fetch:", channel ? channel.id : "null");
    if (!channel?.isTextBased()) {
      await interaction.reply({ content: "○ ไม่พบช่องหน้าร้านที่เผยแพร่", ephemeral: true });
      return;
    }
    
    const message = await channel.messages.fetch(publishedMessageId);
    console.log("DEBUG message fetch:", message.id);
    const categories = await categoryRepository.list(interaction.guildId, false);
    const buttonRows = shopButtons(settings.shop, false, categories);
    
    await message.edit({ embeds: [await shopEmbed(interaction.guildId)], components: buttonRows });
    
    await interaction.reply({ content: "✔ อัปเดตหน้าร้านแล้ว", ephemeral: true });
  } catch (error) {
    console.log("DEBUG error in refreshShopMessage:", error);
    // Check if the error is Discord API error 10008 (Unknown Message)
    const isUnknownMessageError = 
      error instanceof DiscordAPIError && 
      error.code === 10008;
    
    if (isUnknownMessageError) {
      await interaction.reply({ 
        content: "○ ไม่พบข้อความหน้าร้าน  •  กรุณาเผยแพร่อีกครั้ง", 
        ephemeral: true 
      });
      return;
    }
    
    console.error("Error refreshing shop message:", error);
    await interaction.reply({ content: "○ ไม่สามารถอัปเดตหน้าร้านได้  •  กรุณาลองอีกครั้ง", ephemeral: true });
  }
}

export async function handleCategoryPick(interaction: import("discord.js").StringSelectMenuInteraction, action: "edit" | "delete" | "visibility" | "sort"): Promise<unknown> {
  const category = await categoryRepository.find(interaction.values[0]);
  if (!category) return interaction.reply({ content: "○ ไม่พบหมวดหมู่", ephemeral: true });
  if (action === "edit") return openCategoryModal(interaction as never, category.id);
  if (action === "delete") {
    const products = await productRepository.list(interaction.guildId!);
    if (products.some((product) => product.categoryId === category.id)) return interaction.reply({ content: "○ ลบไม่ได้  •  ยังมีสินค้าอยู่ในหมวดหมู่นี้", ephemeral: true });
    await categoryRepository.remove(category.id);
    return interaction.update({ content: `✔ ลบหมวดหมู่ **${category.name}** แล้ว`, components: [] });
  }
  if (action === "visibility") {
    category.hidden = !category.hidden;
    await categoryRepository.save(category);
    return interaction.update({ content: `✔ ${category.hidden ? "ซ่อน" : "แสดง"}หมวดหมู่ **${category.name}** แล้ว`, components: [] });
  }
  const embed = await premiumEmbed(interaction.guildId!, "CATEGORY ORDER", [`**◆ ${category.name}**`, "", DIVIDER, "▸ ใช้ปุ่มด้านล่างเพื่อปรับตำแหน่ง"].join("\n"));
  return interaction.update({ embeds: [embed], components: [categorySortButtons(category.id)] });
}

export async function handleProductPick(interaction: import("discord.js").StringSelectMenuInteraction, action: "create" | "edit" | "delete" | "visibility"): Promise<unknown> {
  if (action === "create") return openProductModal(interaction as never, interaction.values[0]);
  const product = await productRepository.find(interaction.values[0]);
  if (!product) return interaction.reply({ content: "○ ไม่พบสินค้า", ephemeral: true });
  if (action === "edit") return openProductModal(interaction as never, undefined, product);
  if (action === "delete") {
    await productRepository.remove(product.id);
    return interaction.update({ content: `✔ ลบสินค้า **${product.name}** แล้ว`, components: [] });
  }
  product.hidden = !product.hidden;
  product.updatedAt = new Date().toISOString();
  await productRepository.save(product);
  return interaction.update({ content: `✔ ${product.hidden ? "ซ่อน" : "แสดง"}สินค้า **${product.name}** แล้ว`, components: [] });
}
