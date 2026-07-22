import { EmbedBuilder } from "discord.js";
import { DIVIDER, UI_EMOJI } from "../config/constants.js";
import { settingsRepository, categoryRepository, productRepository } from "../database/repositories.js";
import { truncate, formatNumber } from "./formatters.js";
const uiTitle = (title) => title.startsWith(UI_EMOJI.text.brand) ? title : `${UI_EMOJI.text.brand} ${title}`;
const uiFooter = (footer) => `${UI_EMOJI.text.brand} ${footer}`;
export const statusMark = (isPositive, positive, negative) => `${isPositive ? UI_EMOJI.text.active : UI_EMOJI.text.inactive} ${isPositive ? positive : negative}`;
/**
 * Premium metric block with visually separated title and value
 * Format: icon
         **title**
         `value`
 */
export const premiumMetricBlock = (icon, label, value) => `${icon}\n**${label}**\n\`${value}\``;
/**
 * Compact premium metric for inline display
 * Format: `icon` **label**  `value`
 */
export const premiumMetric = (icon, label, value) => `\`${value}\` **${label}**`;
/**
 * Status indicator with modern premium icons
 */
export const statusIndicator = (status) => {
    switch (status) {
        case "open": return "🟢 **Online**";
        case "maintenance": return "🟠 **Maintenance**";
        case "closed": return "🔴 **Offline**";
        default: return "⚪ **Unknown**";
    }
};
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
    embed.setAuthor({
        name: shop.authorName || "Realm of Gu1tarzzz  •  Premium Marketplace",
        iconURL: shop.authorIcon || shop.storeLogo
    });
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
    const availableProducts = products.filter((product) => product.stock !== 0).length;
    // Premium storefront layout matching reference image with metric blocks
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
        premiumMetricBlock("📦", "Products", formatNumber(products.length)),
        premiumMetricBlock("📁", "Categories", formatNumber(categories.length)),
        premiumMetricBlock("✨", "Available", formatNumber(availableProducts)),
        premiumMetricBlock("💎", "Total Stock", totalStock < 0 ? "Unlimited" : formatNumber(totalStock)),
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
