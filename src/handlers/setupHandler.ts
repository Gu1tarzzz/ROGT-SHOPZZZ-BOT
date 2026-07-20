import type { ButtonInteraction, ChatInputCommandInteraction, StringSelectMenuInteraction } from "discord.js";
import { categoryRepository, productRepository, settingsRepository } from "../database/repositories.js";
import { backButton, categoryButtons, dashboardMenu, productButtons, sectionButtons } from "../components/setupComponents.js";
import { premiumEmbed } from "../utils/discord.js";
import { formatPrice, truncate } from "../utils/formatters.js";

type SetupInteraction = ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction;

export async function showDashboard(interaction: SetupInteraction): Promise<void> {
  if (!interaction.guildId) return;
  const settings = await settingsRepository.get(interaction.guildId);
  const embed = await premiumEmbed(interaction.guildId, "ROGT ADMIN DASHBOARD", [
    "จัดการ Marketplace ของคุณจาก Discord ได้ทั้งหมด",
    "",
    `**ร้านค้า:** ${settings.shop.storeName}`,
    `**สถานะ:** ${settings.shop.status === "open" ? "เปิดให้บริการ" : "ปิดปรับปรุง"}`,
    "",
    "เลือกหมวดการตั้งค่าจากเมนูด้านล่าง"
  ].join("\n"));
  const payload = { embeds: [embed], components: [dashboardMenu()] };
  if (interaction.isChatInputCommand()) await interaction.reply({ ...payload, ephemeral: true });
  else await interaction.update(payload);
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
  const sectionContent: Record<string, { title: string; text: string; key: "design" | "banner" | "payment" | "tickets" | "bot" }> = {
    design: { title: "SHOP DESIGN", key: "design", text: `**ชื่อร้าน:** ${settings.shop.storeName}\n**คำอธิบาย:** ${truncate(settings.shop.description, 300)}\n**สี Embed:** ${settings.shop.embedColor}\n**สถานะ:** ${settings.shop.status}` },
    banner: { title: "BANNER SETTINGS", key: "banner", text: `**Banner:** ${settings.shop.banner || "ยังไม่ได้ตั้งค่า"}\n**Thumbnail:** ${settings.shop.thumbnail || "ยังไม่ได้ตั้งค่า"}` },
    payment: { title: "PAYMENT SETTINGS", key: "payment", text: `**เปิดรับชำระเงิน:** ${settings.payment.enabled ? "ใช่" : "ไม่"}\n**TrueMoney:** ${settings.payment.trueMoneyWallet || "-"}\n**PromptPay:** ${settings.payment.promptPay || "-"}\n**ธนาคาร:** ${settings.payment.bankAccount || "-"}\n**Slip Channel:** ${settings.payment.slipChannelId ? `<#${settings.payment.slipChannelId}>` : "ยังไม่ได้ตั้งค่า"}` },
    tickets: { title: "TICKET SETTINGS", key: "tickets", text: `**หมวด Order:** ${settings.tickets.categoryId ? `<#${settings.tickets.categoryId}>` : "ยังไม่ได้ตั้งค่า"}\n**หมวด Support:** ${settings.tickets.supportCategoryId ? `<#${settings.tickets.supportCategoryId}>` : "ใช้หมวด Order"}\n**Prefix:** ${settings.tickets.ticketPrefix}\n**ทีมงาน:** ${settings.tickets.staffRoleIds.length || 0} Role` },
    bot: { title: "BOT SETTINGS", key: "bot", text: `**Owner override:** ${settings.bot.ownerId ? `<@${settings.bot.ownerId}>` : "Guild Owner"}\n**Staff Roles:** ${settings.bot.staffRoleIds.length || 0} Role\n**Maintenance:** ${settings.bot.maintenanceMode ? "เปิด" : "ปิด"}` }
  };
  const view = sectionContent[section];
  if (!view) return;
  const embed = await premiumEmbed(guildId, view.title, view.text);
  await interaction.update({ embeds: [embed], components: [sectionButtons(view.key)] });
}
