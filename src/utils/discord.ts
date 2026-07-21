import { EmbedBuilder, type Guild, type GuildMember, type InteractionReplyOptions } from "discord.js";
import { DIVIDER, THEME } from "../config/constants.js";
import { settingsRepository, categoryRepository, productRepository } from "../database/repositories.js";
import { truncate, formatNumber } from "./formatters.js";

// ═══════════════════════════════════════════════════════════════
// PREMIUM MARKETPLACE EMBED - ROGT SHOPZZZ
// Modern • Clean • Professional • Fantasy Theme
// ═══════════════════════════════════════════════════════════════

export async function premiumEmbed(guildId: string, title: string, description?: string): Promise<EmbedBuilder> {
  const { shop } = await settingsRepository.get(guildId);
  const embed = new EmbedBuilder()
    .setColor(shop.embedColor)
    .setTitle(title)
    .setDescription(description ?? null)
    .setFooter({ text: shop.footer, iconURL: shop.storeLogo })
    .setTimestamp();
  if (shop.thumbnail) embed.setThumbnail(shop.thumbnail);
  if (shop.authorName || shop.authorIcon) embed.setAuthor({ name: shop.authorName || shop.storeName, iconURL: shop.authorIcon });
  return embed;
}

export async function shopEmbed(guildId: string, showAdminControls = false): Promise<EmbedBuilder> {
  const { shop } = await settingsRepository.get(guildId);
  const [categories, products] = await Promise.all([
    categoryRepository.list(guildId, false),
    productRepository.list(guildId, false)
  ]);
  
  // Calculate total stock
  let totalStock = 0;
  for (const product of products) {
    if (product.stock < 0) {
      totalStock = -1;
      break;
    }
    totalStock += product.stock;
  }
  
  const statusEmoji = shop.status === "open" ? "🟢" : "🔴";
  const statusText = shop.status === "open" ? "Open for Business" : "Currently Closed";
  
  // Build clean, modern description
  const lines: string[] = [];
  
  // Store Description
  if (shop.description) {
    lines.push(`${shop.description}`);
    lines.push("");
  }
  
  // Status Indicator
  lines.push(`${statusEmoji} │ **${statusText}**`);
  lines.push("");
  lines.push(DIVIDER);
  lines.push("");
  
  // Statistics - Clean inline format
  lines.push("**📊 Marketplace Overview**");
  lines.push("");
  lines.push(`📂 Categories: **${formatNumber(categories.length)}**`);
  lines.push(`📦 Products: **${formatNumber(products.length)}**`);
  lines.push(`💾 Total Stock: **${totalStock < 0 ? "Unlimited" : formatNumber(totalStock)}**`);
  lines.push("");
  lines.push(DIVIDER);
  lines.push("");
  
  // Payment Methods
  lines.push("**💳 Accepted Payment Methods**");
  lines.push("");
  lines.push("⚡ PromptPay — พร้อมเพย์");
  lines.push("💎 TrueMoney Wallet — กระเป๋าอิเล็กทรอนิกส์");
  lines.push("🏦 Bank Transfer — โอนธนาคาร");
  lines.push("");
  lines.push(DIVIDER);
  lines.push("");
  
  // Features
  lines.push("**✨ Why Choose Us?**");
  lines.push("");
  
  const features = shop.marketplaceFeatures || [];
  if (features.length > 0) {
    for (const feature of features.slice(0, 4)) {
      lines.push(`${feature}`);
    }
  } else {
    lines.push("⚡ Instant Delivery — จัดส่งอัตโนมัติ");
    lines.push("🔒 Secure Trading — การค้าที่ปลอดภัย");
    lines.push("💬 24/7 Support — ซัพพอร์ตตลอด 24 ชม.");
    lines.push("⭐ Premium Quality — สินค้าคุณภาพพรีเมียม");
  }
  lines.push("");
  lines.push(DIVIDER);
  lines.push("");
  lines.push(`*Powered by ROGT SHOPZZZ* │ Realm of Gu1tarzzz`);
  
  const description = lines.join("\n");
  
  const embed = new EmbedBuilder()
    .setColor(shop.embedColor)
    .setAuthor({ 
      name: shop.authorName || shop.storeName, 
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
