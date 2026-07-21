import type { ButtonInteraction, ChatInputCommandInteraction, StringSelectMenuInteraction } from "discord.js";
import { categoryRepository, productRepository, settingsRepository } from "../database/repositories.js";
import { backButton, categoryButtons, dashboardMenu, productButtons, sectionButtons, refreshButtons } from "../components/setupComponents.js";
import { premiumEmbed } from "../utils/discord.js";
import { formatPrice, truncate, formatNumber } from "../utils/formatters.js";

type SetupInteraction = ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction;

// ═══════════════════════════════════════════════════════════════
// PREMIUM ADMIN DASHBOARD - ROGT SHOPZZZ
// Modern • Clean • Professional UI
// ═══════════════════════════════════════════════════════════════

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
  const statusEmoji = settings.shop.status === "open" ? "🟢" : "🔴";
  const paymentStatus = settings.payment.enabled ? "🟢 Enabled" : "🔴 Disabled";
  const ticketStatus = settings.tickets.categoryId ? "✅ Configured" : "⚠️ Not Set";
  const publishStatus = settings.shop.publishedMessageId ? "✅ Live" : "⚠️ Offline";
  
  // Build clean, modern dashboard description
  const lines: string[] = [];
  
  // Header
  lines.push(`# 👑 ROGT Admin Dashboard`);
  lines.push("");
  lines.push("*Premium Marketplace Management System*");
  lines.push("");
  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  lines.push("");
  
  // Store Info
  lines.push("**🏪 Store Information**");
  lines.push("");
  lines.push(`**Name:** ${settings.shop.storeName}`);
  lines.push(`**Status:** ${statusEmoji} ${settings.shop.status === "open" ? "Open" : "Closed"}`);
  lines.push("");
  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  lines.push("");
  
  // Statistics
  lines.push("**📊 Marketplace Statistics**");
  lines.push("");
  lines.push(`📂 Categories: **${formatNumber(categories.length)}**`);
  lines.push(`📦 Products: **${formatNumber(products.length)}**`);
  lines.push(`💾 Total Stock: **${totalStock < 0 ? "Unlimited" : formatNumber(totalStock)}**`);
  lines.push("");
  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  lines.push("");
  
  // System Status
  lines.push("**⚙️ System Status**");
  lines.push("");
  lines.push(`💳 Payment: ${paymentStatus}`);
  lines.push(`🎫 Tickets: ${ticketStatus}`);
  lines.push(`🛒 Published: ${publishStatus}`);
  if (settings.shop.publishedChannelId && settings.shop.publishedMessageId) {
    lines.push(`📍 Channel: <#${settings.shop.publishedChannelId}>`);
  }
  lines.push("");
  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  lines.push("");
  lines.push(`Last Refresh: <t:${timestamp}:R> • <t:${timestamp}:f>`);
  lines.push("");
  lines.push("*Select a management section from the menu below*");
  
  const description = lines.join("\n");
  
  const baseEmbed = await premiumEmbed(interaction.guildId, "Admin Dashboard", description);
  
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
    const summary = categories.length ? categories.map((c) => `• **${truncate(c.name, 40)}** — ${c.hidden ? "ซ่อน" : "แสดง"} · ลำดับ ${c.position}`).join("\n") : "ยังไม่มีหมวดหมู่สินค้า";
    const embed = await premiumEmbed(guildId, "CATEGORY MANAGER", `จัดการหมวดหมู่ที่แสดงในหน้าร้าน\n\n${summary}`);
    await interaction.update({ embeds: [embed], components: [categoryButtons(), backButton()] });
    return;
  }
  if (section === "products") {
    const products = await productRepository.list(guildId);
    const summary = products.length ? products.slice(0, 15).map((p) => `• **${truncate(p.name, 35)}** — ${formatPrice(p.price)} · สต็อก ${p.stock}`).join("\n") : "ยังไม่มีสินค้า";
    const embed = await premiumEmbed(guildId, "PRODUCT MANAGER", `สินค้าทั้งหมด ${products.length} รายการ\n\n${summary}`);
    await interaction.update({ embeds: [embed], components: [productButtons(), backButton()] });
    return;
  }
  const settings = await settingsRepository.get(guildId);
  const sectionContent: Record<string, { title: string; text: string; key: "appearance" | "payment" | "tickets" | "bot" }> = {
    appearance: { title: "SHOP APPEARANCE", key: "appearance", text: [
      `**ชื่อร้าน:** ${settings.shop.storeName}`,
      `**คำอธิบาย:** ${truncate(settings.shop.description, 200)}`,
      `**สี Embed:** ${settings.shop.embedColor}`,
      `**Banner:** ${settings.shop.bannerGif || settings.shop.banner || "ยังไม่ได้ตั้งค่า"}`,
      `**Thumbnail:** ${settings.shop.thumbnail || "ยังไม่ได้ตั้งค่า"}`,
      `**Author:** ${settings.shop.authorName || "-"}`,
      `**Store Logo:** ${settings.shop.storeLogo || "-"}`,
      `**สถานะ:** ${settings.shop.status}`
    ].join("\n") },
    payment: { title: "PAYMENT SETTINGS", key: "payment", text: `**เปิดรับชำระเงิน:** ${settings.payment.enabled ? "ใช่" : "ไม่"}\n**TrueMoney:** ${settings.payment.trueMoneyWallet || "-"}\n**PromptPay:** ${settings.payment.promptPay || "-"}\n**ธนาคาร:** ${settings.payment.bankAccount || "-"}\n**Slip Channel:** ${settings.payment.slipChannelId ? `<#${settings.payment.slipChannelId}>` : "ยังไม่ได้ตั้งค่า"}` },
    tickets: { title: "TICKET SETTINGS", key: "tickets", text: `**หมวด Order:** ${settings.tickets.categoryId ? `<#${settings.tickets.categoryId}>` : "ยังไม่ได้ตั้งค่า"}\n**หมวด Support:** ${settings.tickets.supportCategoryId ? `<#${settings.tickets.supportCategoryId}>` : "ใช้หมวด Order"}\n**Prefix:** ${settings.tickets.ticketPrefix}\n**ทีมงาน:** ${settings.tickets.staffRoleIds.length || 0} Role` },
    bot: { title: "BOT SETTINGS", key: "bot", text: `**Owner override:** ${settings.bot.ownerId ? `<@${settings.bot.ownerId}>` : "Guild Owner"}\n**Staff Roles:** ${settings.bot.staffRoleIds.length || 0} Role\n**Maintenance:** ${settings.bot.maintenanceMode ? "เปิด" : "ปิด"}` }
  };
  const view = sectionContent[section];
  if (!view) return;
  const embed = await premiumEmbed(guildId, view.title, view.text);
  await interaction.update({ embeds: [embed], components: [sectionButtons(view.key)] });
}
