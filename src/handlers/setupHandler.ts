import { EmbedBuilder, type ButtonInteraction, type ChatInputCommandInteraction, type StringSelectMenuInteraction } from "discord.js";
import { categoryRepository, productRepository, settingsRepository } from "../database/repositories.js";
import { backButton, categoryButtons, dashboardMenu, productButtons, sectionButtons, refreshButtons, categoryManagerEmbed, productManagerEmbed, designSettingsEmbed, paymentSettingsEmbed, ticketSettingsEmbed, botSettingsEmbed, backOfficeDesignEmbed } from "../components/setupComponents.js";
import { premiumEmbed, premiumMetricBlock, statusIndicator, compactMetricCard } from "../utils/discord.js";
import { formatPrice, truncate, formatNumber } from "../utils/formatters.js";
import { DIVIDER, UI_EMOJI } from "../config/constants.js";

type SetupInteraction = ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction;

const statusMark = (isPositive: boolean, positive: string, negative: string): string =>
  `${isPositive ? UI_EMOJI.text.active : UI_EMOJI.text.inactive} **${isPositive ? positive : negative}**`;

export async function showDashboard(interaction: SetupInteraction, previewMode = false): Promise<void> {
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
  
  const paymentStatus = statusMark(settings.payment.enabled, "พร้อมรับชำระ", "ยังไม่เปิด");
  const ticketStatus = statusMark(Boolean(settings.tickets.categoryId), "พร้อมใช้งาน", "ต้องตั้งค่า");
  const publishStatus = statusMark(Boolean(settings.shop.publishedMessageId), "เผยแพร่แล้ว", "ยังไม่เผยแพร่");
  
  // Premium dashboard layout with compact 2x2 metric cards matching reference
  const description = [
    `**${UI_EMOJI.text.brand} ${settings.shop.storeName}**`,
    statusIndicator(settings.shop.status),
    "",
    DIVIDER,
    "",
    `**${UI_EMOJI.text.section} Marketplace Metrics**`,
    "",
    `${compactMetricCard("◈", "Categories", formatNumber(categories.length))}  ${compactMetricCard("◈", "Products", formatNumber(products.length))}`,
    `${compactMetricCard("◈", "Total Stock", totalStock < 0 ? "Unlimited" : formatNumber(totalStock))}  ${compactMetricCard("◈", "Available", products.filter(p => p.stock !== 0).length.toString())}`,
    "",
    DIVIDER,
    "",
    `**${UI_EMOJI.text.section} System Status**`,
    "",
    `${UI_EMOJI.component.payment} **Payment**  ${paymentStatus}`,
    `${UI_EMOJI.component.ticket} **Tickets**  ${ticketStatus}`,
    `${UI_EMOJI.component.catalog} **Shop Front**  ${publishStatus}`,
    "",
    settings.shop.publishedChannelId && settings.shop.publishedMessageId 
      ? `${UI_EMOJI.text.bullet} Published in <#${settings.shop.publishedChannelId}>` 
      : "",
    "",
    DIVIDER,
    "เลือกส่วนจัดการด้านล่าง"
  ].filter(line => line !== "").join("\n");
  
  const baseEmbed = await premiumEmbed(interaction.guildId, "⟡ DASHBOARD", description);
  
  const components = previewMode ? [] : [dashboardMenu(), refreshButtons(settings.shop.publishedMessageId)];
  const payload = { embeds: [baseEmbed], components };
  
  if (interaction.isChatInputCommand()) {
    await interaction.reply({ ...payload, ephemeral: false });
  } else {
    // Always send as NEW ephemeral message, never edit existing
    await interaction.reply({ ...payload, ephemeral: true });
  }
}

export async function showSetupSection(interaction: StringSelectMenuInteraction, section: string): Promise<void> {
  if (!interaction.guildId) return;
  const guildId = interaction.guildId;
  
  // Each management page creates its OWN new embed (not editing existing dashboard)
  if (section === "categories") {
    const categories = await categoryRepository.list(guildId);
    const { embed, components } = categoryManagerEmbed(guildId, categories);
    await interaction.reply({ embeds: [embed], components, ephemeral: true });
    return;
  }
  
  if (section === "products") {
    const products = await productRepository.list(guildId);
    const { embed, components } = productManagerEmbed(guildId, products);
    await interaction.reply({ embeds: [embed], components, ephemeral: true });
    return;
  }
  
  // Design Settings - creates new dedicated embed
  if (section === "appearance") {
    const settings = await settingsRepository.get(guildId);
    const { embed, components } = designSettingsEmbed(guildId, settings);
    await interaction.reply({ embeds: [embed], components, ephemeral: true });
    return;
  }
  
  // Back Office Design - creates new dedicated embed
  if (section === "backoffice") {
    const settings = await settingsRepository.get(guildId);
    const { embed, components } = backOfficeDesignEmbed(guildId, settings);
    await interaction.reply({ embeds: [embed], components, ephemeral: true });
    return;
  }
  
  // Payment Settings - creates new dedicated embed
  if (section === "payment") {
    const settings = await settingsRepository.get(guildId);
    const { embed, components } = paymentSettingsEmbed(guildId, settings);
    await interaction.reply({ embeds: [embed], components, ephemeral: true });
    return;
  }
  
  // Ticket Settings - creates new dedicated embed
  if (section === "tickets") {
    const settings = await settingsRepository.get(guildId);
    const { embed, components } = ticketSettingsEmbed(guildId, settings);
    await interaction.reply({ embeds: [embed], components, ephemeral: true });
    return;
  }
  
  // Bot Settings - creates new dedicated embed
  if (section === "bot") {
    const settings = await settingsRepository.get(guildId);
    const { embed, components } = botSettingsEmbed(guildId, settings);
    await interaction.reply({ embeds: [embed], components, ephemeral: true });
    return;
  }
}
