import { EmbedBuilder, type Guild, type GuildMember, type InteractionReplyOptions } from "discord.js";
import { DIVIDER, SECTION_SPACER, UI_EMOJI } from "../config/constants.js";
import { settingsRepository, categoryRepository, productRepository } from "../database/repositories.js";
import { truncate, formatNumber } from "./formatters.js";

const uiTitle = (title: string): string => title.startsWith(UI_EMOJI.text.brand) ? title : `${UI_EMOJI.text.brand} ${title}`;
const uiFooter = (footer: string): string => `${UI_EMOJI.text.brand} ${footer}`;

export const statusMark = (isPositive: boolean, positive: string, negative: string): string =>
  `${isPositive ? UI_EMOJI.text.active : UI_EMOJI.text.inactive} ${isPositive ? positive : negative}`;

/**
 * Premium metric block with visually separated title and value
 * Format: icon
         **title**
         `value`
 */
export const premiumMetricBlock = (icon: string, label: string, value: string | number): string => 
  `${icon}\n**${label}**\n\`${value}\``;

/**
 * Compact premium metric for inline display
 * Format: `icon` **label**  `value`
 */
export const premiumMetric = (icon: string, label: string, value: string | number): string => 
  `\`${value}\` **${label}**`;

/**
 * Compact 2x2 metric card for statistics section
 * Creates a more compact layout for dashboard statistics
 */
export const compactMetricCard = (icon: string, label: string, value: string | number): string =>
  `◈ ${label}  \`${value}\``;

/**
 * Status indicator with modern premium icons
 */
export const statusIndicator = (status: string): string => {
  switch (status) {
    case "open": return "🟢 **Online**";
    case "maintenance": return "🟠 **Maintenance**";
    case "closed": return "🔴 **Offline**";
    default: return "⚪ **Unknown**";
  }
};

export async function premiumEmbed(guildId: string, title: string, description?: string): Promise<EmbedBuilder> {
  const { shop, backOffice } = await settingsRepository.get(guildId);
  const embed = new EmbedBuilder()
    .setColor(shop.embedColor)
    .setTitle(uiTitle(title))
    .setDescription(description ?? null)
    .setFooter({ text: uiFooter(shop.footer), iconURL: shop.storeLogo })
    .setTimestamp();
  if (shop.thumbnail) embed.setThumbnail(shop.thumbnail);
  embed.setAuthor({
    name: shop.authorName || "Realm of Gu1tarzzz  •  Premium Marketplace",
    iconURL: shop.authorIcon || shop.storeLogo
  });
  if (backOffice.imageUrl) embed.setImage(backOffice.imageUrl);
  return embed;
}

export async function shopEmbed(guildId: string, showAdminControls = false): Promise<EmbedBuilder> {
  const { shop } = await settingsRepository.get(guildId);
  const [categories, products] = await Promise.all([
    categoryRepository.list(guildId, false),
    productRepository.list(guildId, false)
  ]);
  
  let totalStock = 0;
  for (const product of products) {
    if (product.stock < 0) {
      totalStock = -1;
      break;
    }
    totalStock += product.stock;
  }
  
  const features = shop.marketplaceFeatures?.length
    ? shop.marketplaceFeatures.slice(0, 4)
    : ["จัดส่งรวดเร็ว", "ชำระเงินปลอดภัย", "ดูแลโดยทีมงาน"];
    
  const availableProducts = products.filter((product) => product.stock !== 0).length;
  
  // Premium storefront layout matching reference image with compact 2x2 metric cards
  const description = [
    `**${UI_EMOJI.text.brand} ${shop.storeName}**`,
    `${shop.description || "Premium marketplace"}`,
    "",
    statusIndicator(shop.status),
    "",
    DIVIDER,
    "",
    `**${UI_EMOJI.text.section} Store Statistics**`,
    "",
    `${compactMetricCard("📦", "Products", formatNumber(products.length))}  ${compactMetricCard("📁", "Categories", formatNumber(categories.length))}`,
    `${compactMetricCard("✨", "Available", formatNumber(availableProducts))}  ${compactMetricCard("💎", "Total Stock", totalStock < 0 ? "Unlimited" : formatNumber(totalStock))}`,
    "",
    DIVIDER,
    "",
    `**${UI_EMOJI.text.section} Payment Methods**`,
    "> 💳 `PromptPay` • `TrueMoney` • `Bank Transfer`",
    "",
    DIVIDER,
    "",
    `**${UI_EMOJI.text.section} Store Features**`,
    features.map((f) => `${UI_EMOJI.text.bullet} ${f}`).join("\n"),
    "",
    DIVIDER,
    "เลือกหมวดหมู่จากเมนูด้านล่างเพื่อดูสินค้า"
  ].join("\n");
  
  const embed = new EmbedBuilder()
    .setColor(shop.embedColor)
    .setTitle(shop.storeName)
    .setAuthor({ 
      name: shop.authorName || "Realm of Gu1tarzzz  •  Premium Marketplace", 
      iconURL: shop.authorIcon || shop.storeLogo 
    })
    .setDescription(description)
    .setFooter({ text: shop.footer, iconURL: shop.storeLogo })
    .setTimestamp();
  
  // Large banner image (priority: GIF > static)
  if (shop.bannerGif) {
    embed.setImage(shop.bannerGif);
  } else if (shop.banner) {
    embed.setImage(shop.banner);
  }
  
  // Thumbnail for branding
  if (shop.thumbnail) {
    embed.setThumbnail(shop.thumbnail);
  }
  
  return embed;
}

export const ephemeral = (content: string): InteractionReplyOptions => ({ content, ephemeral: true });
export const memberDisplayName = (member: GuildMember): string => truncate(member.displayName, 40);
