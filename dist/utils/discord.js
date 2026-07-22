import { EmbedBuilder } from "discord.js";
import { DIVIDER, SMALL_DIVIDER } from "../config/constants.js";
import { settingsRepository, categoryRepository, productRepository } from "../database/repositories.js";
import { truncate, formatNumber } from "./formatters.js";
const uiTitle = (title) => title.startsWith("✦") ? title : `✦ ${title}`;
const uiFooter = (footer) => `✦ ${footer}`;
export const statusMark = (isPositive, positive, negative) => `${isPositive ? "●" : "○"} ${isPositive ? positive : negative}`;
export const metric = (label, value) => "`" + label + "`  **" + value + "**";
export async function premiumEmbed(guildId, title, description) {
    const { shop } = await settingsRepository.get(guildId);
    const embed = new EmbedBuilder()
        .setColor(shop.embedColor)
        .setTitle(uiTitle(title))
        .setDescription(description ?? null)
        .setFooter({ text: uiFooter(shop.footer), iconURL: shop.storeLogo })
        .setTimestamp();
    if (shop.thumbnail)
        embed.setThumbnail(shop.thumbnail);
    if (shop.authorName || shop.authorIcon)
        embed.setAuthor({ name: shop.authorName || shop.storeName, iconURL: shop.authorIcon });
    return embed;
}
export async function shopEmbed(guildId, showAdminControls = false) {
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
    const description = [
        `*${shop.description || "Premium marketplace of Realm of Gu1tarzzz"}*`,
        "",
        statusMark(shop.status === "open", "เปิดให้บริการ", "ปิดปรับปรุง"),
        "",
        DIVIDER,
        "**◆ ภาพรวมร้านค้า**",
        `${metric("หมวดหมู่", formatNumber(categories.length))}  •  ${metric("สินค้า", formatNumber(products.length))}`,
        metric("สต็อก", totalStock < 0 ? "ไม่จำกัด" : formatNumber(totalStock)),
        "",
        "**◆ ช่องทางชำระเงิน**",
        "PromptPay  •  TrueMoney  •  Bank Transfer",
        "",
        SMALL_DIVIDER,
        `▸ ${features.join("  •  ")}`
    ].join("\n");
    const embed = new EmbedBuilder()
        .setColor(shop.embedColor)
        .setTitle(uiTitle(shop.storeName))
        .setAuthor({
        name: shop.authorName || "Realm of Gu1tarzzz  •  Premium Marketplace",
        iconURL: shop.authorIcon || shop.storeLogo
    })
        .setDescription(description)
        .setFooter({ text: uiFooter(shop.footer), iconURL: shop.storeLogo })
        .setTimestamp();
    // Large banner image (priority: GIF > static)
    if (shop.bannerGif) {
        embed.setImage(shop.bannerGif);
    }
    else if (shop.banner) {
        embed.setImage(shop.banner);
    }
    // Thumbnail for branding
    if (shop.thumbnail) {
        embed.setThumbnail(shop.thumbnail);
    }
    return embed;
}
export const ephemeral = (content) => ({ content, ephemeral: true });
export const memberDisplayName = (member) => truncate(member.displayName, 40);
