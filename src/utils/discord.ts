import { EmbedBuilder, type Guild, type GuildMember, type InteractionReplyOptions } from "discord.js";
import { DIVIDER } from "../config/constants.js";
import { settingsRepository, categoryRepository, productRepository } from "../database/repositories.js";
import { truncate } from "./formatters.js";

export async function premiumEmbed(guildId: string, title: string, description?: string): Promise<EmbedBuilder> {
  const { shop } = await settingsRepository.get(guildId);
  const embed = new EmbedBuilder()
    .setColor(shop.embedColor)
    .setTitle(`✦ ${title}`)
    .setDescription(description ?? null)
    .setFooter({ text: shop.footer })
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
  
  let totalStock = 0;
  for (const product of products) {
    if (product.stock < 0) {
      totalStock = -1;
      break;
    }
    totalStock += product.stock;
  }
  
  const status = shop.status === "open" ? "🟢 เปิดให้บริการ" : "🔴 ปิดปรับปรุง";
  const features = shop.marketplaceFeatures?.length 
    ? `\n${shop.marketplaceFeatures.join("\n")}` 
    : "";
  
  const statsText = [
    `📂 หมวดหมู่: **${categories.length}**`,
    `📦 สินค้า: **${products.length}**`,
    `💾 สต็อกพร้อมส่ง: **${totalStock < 0 ? "ไม่จำกัด" : totalStock}**`
  ].join("\n");
  
  const description = `${shop.description}${features}\n\n${DIVIDER}\n${statsText}\n${DIVIDER}\n**สถานะร้านค้า**  ${status}`;
  
  const embed = new EmbedBuilder()
    .setColor(shop.embedColor)
    .setTitle(`✦ ${shop.storeName}`)
    .setDescription(description)
    .setFooter({ text: shop.footer })
    .setTimestamp();
    
  if (shop.bannerGif) {
    embed.setImage(shop.bannerGif);
  } else if (shop.banner) {
    embed.setImage(shop.banner);
  }
  if (shop.thumbnail) embed.setThumbnail(shop.thumbnail);
  if (shop.authorName || shop.authorIcon) {
    embed.setAuthor({ name: shop.authorName || shop.storeName, iconURL: shop.authorIcon });
  }
  
  return embed;
}

export const ephemeral = (content: string): InteractionReplyOptions => ({ content, ephemeral: true });
export const memberDisplayName = (member: GuildMember): string => truncate(member.displayName, 40);
