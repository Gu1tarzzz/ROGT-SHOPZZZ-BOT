import { EmbedBuilder, type Guild, type GuildMember, type InteractionReplyOptions } from "discord.js";
import { DIVIDER } from "../config/constants.js";
import { settingsRepository } from "../database/repositories.js";
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
  return embed;
}

export async function shopEmbed(guildId: string): Promise<EmbedBuilder> {
  const { shop } = await settingsRepository.get(guildId);
  const status = shop.status === "open" ? "● เปิดให้บริการ" : "● ปิดปรับปรุง";
  const embed = new EmbedBuilder()
    .setColor(shop.embedColor)
    .setTitle(`✦ ${shop.storeName}`)
    .setDescription(`${shop.description}\n\n${DIVIDER}\n**สถานะร้านค้า**  ${status}\n${DIVIDER}`)
    .setFooter({ text: shop.footer })
    .setTimestamp();
  if (shop.banner) embed.setImage(shop.banner);
  if (shop.thumbnail) embed.setThumbnail(shop.thumbnail);
  return embed;
}

export const ephemeral = (content: string): InteractionReplyOptions => ({ content, ephemeral: true });
export const memberDisplayName = (member: GuildMember): string => truncate(member.displayName, 40);
