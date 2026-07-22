import { EmbedBuilder, type Guild, type GuildMember, type InteractionReplyOptions } from "discord.js";
import { DIVIDER, SECTION_DIVIDER, UI_EMOJI } from "../config/constants.js";
import { settingsRepository, categoryRepository, productRepository } from "../database/repositories.js";
import { truncate, formatNumber } from "./formatters.js";

const uiTitle = (title: string): string => title.startsWith(UI_EMOJI.text.brand) ? title : `${UI_EMOJI.text.brand} ${title}`;
const uiFooter = (footer: string): string => `${UI_EMOJI.text.brand} ${footer}`;

export const statusMark = (isPositive: boolean, positive: string, negative: string): string =>
  `${isPositive ? UI_EMOJI.text.active : UI_EMOJI.text.inactive} ${isPositive ? positive : negative}`;

export const metric = (label: string, value: string | number): string => "`" + label + "`  **" + value + "**";

export async function premiumEmbed(guildId: string, title: string, description?: string): Promise<EmbedBuilder> {
  const { shop } = await settingsRepository.get(guildId);
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
  
  // Premium storefront layout matching reference image
  const description = [
    `**${UI_EMOJI.text.brand} ${shop.storeName}**`,
    `${shop.description || "Premium marketplace"}`,
    "",
    `${shop.status === "open" ? "🟢" : "🔴"} **${shop.status === "open" ? "เปิดให้บริการ" : "ปิดปรับปรุง"}**`,
    "",
    DIVIDER,
    "",
    `**${UI_EMOJI.text.section} Store Statistics**`,
    "",
    "```┌──────────────┬──────────────┬──────────────┬──────────────┐",
    "│  สินค้า     │  หมวดหมู่   │  พร้อมขาย    │  สต็อก       │",
    "├──────────────┼──────────────┼──────────────┼──────────────┤",
    `│  ${String(products.length).padEnd(10)} │  ${String(categories.length).padEnd(10)} │  ${String(availableProducts).padEnd(10)} │  ${String(totalStock < 0 ? "∞" : totalStock).padEnd(10)} │`,
    "└──────────────┴──────────────┴──────────────┴──────────────┘```",
    "",
    `**${UI_EMOJI.text.section} Payment Methods**`,
    "> 💳 `PromptPay` • `TrueMoney` • `Bank Transfer`",
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
