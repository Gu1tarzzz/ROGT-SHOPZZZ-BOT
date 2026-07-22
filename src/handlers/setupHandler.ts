import type { ButtonInteraction, ChatInputCommandInteraction, StringSelectMenuInteraction } from "discord.js";
import { categoryRepository, productRepository, settingsRepository } from "../database/repositories.js";
import { backButton, categoryButtons, dashboardMenu, productButtons, sectionButtons, refreshButtons } from "../components/setupComponents.js";
import { metric, premiumEmbed, statusMark } from "../utils/discord.js";
import { formatPrice, truncate, formatNumber } from "../utils/formatters.js";
import { SMALL_DIVIDER, DIVIDER } from "../config/constants.js";

type SetupInteraction = ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction;

export async function showDashboard(interaction: SetupInteraction): Promise<void> {
  if (!interaction.guildId) return;
  const settings = await settingsRepository.get(interaction.guildId);
  const categories = await categoryRepository.list(interaction.guildId, false);
  const products = await productRepository.list(interaction.guildId, false);
  
  // Calculate total stock
  let totalStock = 0;
  for (const product of products) {
    if (product.stock === -1) continue;
    totalStock += product.stock;
  }
  
  const timestamp = Math.floor(Date.now() / 1000);
  const paymentStatus = statusMark(settings.payment.enabled, "พร้อมรับชำระ", "ยังไม่เปิด");
  const ticketStatus = statusMark(Boolean(settings.tickets.categoryId), "พร้อมใช้งาน", "ต้องตั้งค่า");
  const publishStatus = statusMark(Boolean(settings.shop.publishedMessageId), "เผยแพร่แล้ว", "ยังไม่เผยแพร่");
  const lines: string[] = [
    `**◆ ${settings.shop.storeName}**`,
    statusMark(settings.shop.status === "open", "เปิดให้บริการ", "ปิดปรับปรุง"),
    "",
    DIVIDER,
    "**◆ ภาพรวม Marketplace**",
    `${metric("หมวดหมู่", formatNumber(categories.length))}  •  ${metric("สินค้า", formatNumber(products.length))}`,
    metric("สต็อก", totalStock < 0 ? "ไม่จำกัด" : formatNumber(totalStock)),
    "",
    "**◆ สถานะระบบ**",
    `💳 ชำระเงิน  ${paymentStatus}`,
    `◆ Ticket  ${ticketStatus}`,
    `🛒 หน้าร้าน  ${publishStatus}`
  ];
  if (settings.shop.publishedChannelId && settings.shop.publishedMessageId) {
    lines.push(`▸ เผยแพร่ใน <#${settings.shop.publishedChannelId}>`);
  }
  lines.push("", SMALL_DIVIDER, `▸ อัปเดต <t:${timestamp}:R>  •  เลือกส่วนจัดการด้านล่าง`);
  
  const description = lines.join("\n");
  
  const baseEmbed = await premiumEmbed(interaction.guildId, "ROGT COMMAND CENTER", description);
  
  const components = [dashboardMenu(), refreshButtons(settings.shop.publishedMessageId)];
  const payload = { embeds: [baseEmbed], components };
  
  if (interaction.isChatInputCommand()) {
    await interaction.reply({ ...payload, ephemeral: false });
  } else {
    await interaction.update(payload);
  }
}

export async function showSetupSection(interaction: StringSelectMenuInteraction, section: string): Promise<void> {
  if (!interaction.guildId) return;
  const guildId = interaction.guildId;
  if (section === "categories") {
    const categories = await categoryRepository.list(guildId);
    const summary = categories.length
      ? categories.map((c) => `▸ **${truncate(c.name, 40)}**  ${c.hidden ? "○ ซ่อน" : "● แสดง"}  •  ลำดับ ${c.position}`).join("\n")
      : "○ ยังไม่มีหมวดหมู่สินค้า";
    const embed = await premiumEmbed(guildId, "CATEGORY MANAGER", [
      "*โครงสร้างหน้าร้านและการแสดงผล*",
      "",
      DIVIDER,
      `**◆ ทั้งหมด ${formatNumber(categories.length)} หมวดหมู่**`,
      summary
    ].join("\n"));
    await interaction.update({ embeds: [embed], components: [categoryButtons(), backButton()] });
    return;
  }
  if (section === "products") {
    const products = await productRepository.list(guildId);
    const summary = products.length
      ? products.slice(0, 15).map((p) => `▸ **${truncate(p.name, 35)}**  ${formatPrice(p.price)}  •  ${p.stock < 0 ? "ไม่จำกัด" : `สต็อก ${p.stock}`}`).join("\n")
      : "○ ยังไม่มีสินค้า";
    const embed = await premiumEmbed(guildId, "PRODUCT MANAGER", [
      "*สินค้า ราคา และสต็อกของร้าน*",
      "",
      DIVIDER,
      `**◆ ทั้งหมด ${formatNumber(products.length)} รายการ**`,
      summary
    ].join("\n"));
    await interaction.update({ embeds: [embed], components: [productButtons(), backButton()] });
    return;
  }
  const settings = await settingsRepository.get(guildId);
  const sectionContent: Record<string, { title: string; text: string; key: "appearance" | "payment" | "tickets" | "bot" }> = {
    appearance: { title: "SHOP APPEARANCE", key: "appearance", text: [
      `**◆ ${settings.shop.storeName}**`,
      `*${truncate(settings.shop.description, 200)}*`,
      "",
      DIVIDER,
      `${metric("สี", settings.shop.embedColor)}  •  ${statusMark(settings.shop.status === "open", "เปิด", "ปิด")}`,
      `▸ Banner  ${settings.shop.bannerGif || settings.shop.banner ? "● ตั้งค่าแล้ว" : "○ ยังไม่ได้ตั้งค่า"}`,
      `▸ Thumbnail  ${settings.shop.thumbnail ? "● ตั้งค่าแล้ว" : "○ ยังไม่ได้ตั้งค่า"}`,
      `▸ Branding  ${settings.shop.authorName || "ค่าเริ่มต้น"}`
    ].join("\n") },
    payment: { title: "PAYMENT SETTINGS", key: "payment", text: [
      statusMark(settings.payment.enabled, "เปิดรับชำระเงิน", "ยังไม่เปิดรับชำระเงิน"),
      "",
      DIVIDER,
      "**◆ ช่องทางชำระเงิน**",
      `▸ TrueMoney  ${settings.payment.trueMoneyWallet || "—"}`,
      `▸ PromptPay  ${settings.payment.promptPay || "—"}`,
      `▸ Bank  ${settings.payment.bankAccount || "—"}`,
      `▸ Slip Channel  ${settings.payment.slipChannelId ? `<#${settings.payment.slipChannelId}>` : "—"}`
    ].join("\n") },
    tickets: { title: "TICKET SETTINGS", key: "tickets", text: [
      "*พื้นที่ดูแลคำสั่งซื้อและการช่วยเหลือ*",
      "",
      DIVIDER,
      `▸ Order Category  ${settings.tickets.categoryId ? `<#${settings.tickets.categoryId}>` : "—"}`,
      `▸ Support Category  ${settings.tickets.supportCategoryId ? `<#${settings.tickets.supportCategoryId}>` : "ใช้ Order Category"}`,
      `${metric("Prefix", settings.tickets.ticketPrefix)}  •  ${metric("ทีมงาน", settings.tickets.staffRoleIds.length)}`
    ].join("\n") },
    bot: { title: "BOT SETTINGS", key: "bot", text: [
      "*สิทธิ์ผู้ดูแลและสถานะการให้บริการ*",
      "",
      DIVIDER,
      `▸ Owner  ${settings.bot.ownerId ? `<@${settings.bot.ownerId}>` : "Guild Owner"}`,
      metric("Staff Roles", settings.bot.staffRoleIds.length),
      statusMark(!settings.bot.maintenanceMode, "ระบบพร้อมให้บริการ", "กำลังปิดปรับปรุง")
    ].join("\n") }
  };
  const view = sectionContent[section];
  if (!view) return;
  const embed = await premiumEmbed(guildId, view.title, view.text);
  await interaction.update({ embeds: [embed], components: [sectionButtons(view.key)] });
}
