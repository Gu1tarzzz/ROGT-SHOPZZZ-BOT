import type { StringSelectMenuInteraction } from "discord.js";
import { productMenu, productOrderButton, catalogMenu } from "../components/shopComponents.js";
import { categoryRepository, productRepository } from "../database/repositories.js";
import { handleCategoryPick, handleProductPick } from "./buttonHandler.js";
import { showSetupSection } from "./setupHandler.js";
import { premiumEmbed } from "../utils/discord.js";
import { formatPrice, formatStock } from "../utils/formatters.js";
import { hasAdminAccess } from "../utils/permissions.js";
import { DIVIDER, UI_EMOJI } from "../config/constants.js";

async function admin(interaction: StringSelectMenuInteraction): Promise<boolean> {
  if (!interaction.guild) return false;
  const member = await interaction.guild.members.fetch(interaction.user.id);
  if (await hasAdminAccess(member)) return true;
  await interaction.reply({ content: "○ คุณไม่มีสิทธิ์เข้าถึง Admin Panel", ephemeral: true });
  return false;
}

export async function handleSelectMenu(interaction: StringSelectMenuInteraction): Promise<unknown> {
  if (!interaction.guildId) return;
  const [scope, action, extra] = interaction.customId.split(":");
  
  if (scope === "shop") {
    if (action === "catalog") {
      const value = interaction.values[0];
      
      // Handle "All Products" or specific category
      if (value === "cat:all") {
        const allProducts = (await productRepository.list(interaction.guildId, false)).filter((product) => product.stock !== 0);
        if (!allProducts.length) return interaction.update({ content: "○ ยังไม่มีสินค้าที่พร้อมจำหน่าย", components: [] });
        
        const embed = await premiumEmbed(interaction.guildId, "ALL PRODUCTS", [
          "*สินค้าทั้งหมดที่พร้อมจำหน่าย*",
          "",
          DIVIDER,
          "▸ เลือกสินค้าที่ต้องการจากเมนูด้านล่าง"
        ].join("\n"));
        return interaction.update({ embeds: [embed], components: [productMenu(allProducts)] });
      }
      
      // Handle specific category (cat:{categoryId})
      const categoryId = value.replace("cat:", "");
      const category = await categoryRepository.find(categoryId);
      const products = (await productRepository.list(interaction.guildId, false)).filter((product) => product.categoryId === categoryId && (product.stock !== 0));
      
      if (!products.length) return interaction.update({ content: "○ หมวดหมู่นี้ยังไม่มีสินค้าที่พร้อมจำหน่าย", components: [] });
      
      const embed = await premiumEmbed(interaction.guildId, category?.name ?? "PRODUCTS", [
        `*${category?.description || "สินค้าที่คัดสรรสำหรับคุณ"}*`,
        "",
        DIVIDER,
        "▸ เลือกสินค้าที่ต้องการจากเมนูด้านล่าง"
      ].join("\n"));
      return interaction.update({ embeds: [embed], components: [productMenu(products)] });
    }
    
    if (action === "product") {
      const product = await productRepository.find(interaction.values[0]);
      if (!product || product.hidden || product.status !== "active") return interaction.update({ content: "○ สินค้านี้ไม่พร้อมจำหน่าย", components: [] });
      const embed = await premiumEmbed(interaction.guildId, product.name, [
        `*${product.description}*`,
        "",
        DIVIDER,
        "**◆ รายละเอียดสินค้า**",
        `\`ราคา\`  **${formatPrice(product.price)}**  •  \`สต็อก\`  **${product.stock < 0 ? "ไม่จำกัด" : formatStock(product.stock)}**`,
        product.requiredRoleId ? `▸ ต้องมี Role <@&${product.requiredRoleId}>` : "▸ พร้อมสำหรับลูกค้าทุกคน"
      ].join("\n"));
      if (product.imageUrl) embed.setImage(product.imageUrl);
      return interaction.update({ embeds: [embed], components: [productOrderButton(product)] });
    }
    
    // Handle topup and credit buttons
    if (action === "topup") {
      const embed = await premiumEmbed(interaction.guildId, "TOP UP CREDIT", [
        "*เติมเครดิตเพื่อซื้อสินค้า*",
        "",
        DIVIDER,
        "▸ ติดต่อทีมงานเพื่อเติมเครดิต",
        "▸ หรือใช้คำสั่งซื้อเพื่อชำระเงิน"
      ].join("\n"));
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    
    if (action === "credit") {
      const embed = await premiumEmbed(interaction.guildId, "CHECK CREDIT", [
        "*ตรวจสอบยอดเครดิตของคุณ*",
        "",
        DIVIDER,
        "▸ ระบบเครดิตกำลังพัฒนา",
        "▸ ติดต่อทีมงานสำหรับข้อมูลเพิ่มเติม"
      ].join("\n"));
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
  
  if (!(await admin(interaction))) return;
  if (scope === "setup" && action === "section") return showSetupSection(interaction, interaction.values[0]);
  if (scope === "category" && action === "pick") return handleCategoryPick(interaction, extra as "edit" | "delete" | "visibility" | "sort");
  if (scope === "product" && action === "pick") return handleProductPick(interaction, extra as "create" | "edit" | "delete" | "visibility");
}
