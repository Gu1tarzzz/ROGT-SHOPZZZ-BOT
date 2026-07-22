import { EmbedBuilder } from "discord.js";
import { SMALL_DIVIDER } from "../config/constants.js";
import { settingsRepository, categoryRepository, productRepository } from "../database/repositories.js";
import { truncate, formatNumber } from "./formatters.js";
// ╭──────────────────────────────────────────────────────────────╮
// │  PREMIUM MARKETPLACE EMBED - ROGT SHOPZZZ                    │
// │  Style: Luxury • Fantasy • Minimal • Dark                    │
// │  Reference: Dapex Boost, Mickey Boost, Steam Store           │
// ╰──────────────────────────────────────────────────────────────╯
export async function premiumEmbed(guildId, title, description) {
    const { shop } = await settingsRepository.get(guildId);
    const embed = new EmbedBuilder()
        .setColor(shop.embedColor)
        .setTitle(title)
        .setDescription(description ?? null)
        .setFooter({ text: shop.footer, iconURL: shop.storeLogo })
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
    // Calculate total stock
    let totalStock = 0;
    for (const product of products) {
        if (product.stock < 0) {
            totalStock = -1;
            break;
        }
        totalStock += product.stock;
    }
    // Calculate total orders (from stock transactions or use a placeholder)
    const totalOrders = 0; // Would need order repository for real count
    const statusEmoji = shop.status === "open" ? "●" : "○";
    const statusText = shop.status === "open" ? "Open" : "Closed";
    // Build premium storefront description
    const lines = [];
    // Hero Section
    lines.push(`# ✦ ${shop.storeName}`);
    lines.push("");
    lines.push(`${shop.description || "Premium Digital Marketplace"}`);
    lines.push("");
    lines.push(`${statusEmoji} ${statusText}`);
    lines.push("");
    lines.push(SMALL_DIVIDER);
    lines.push("");
    // Statistics Cards - 4 metrics in clean format
    lines.push(`**◆ Statistics**`);
    lines.push("");
    lines.push(`▸ Products ──── ${formatNumber(products.length)}`);
    lines.push(`▸ Categories ─ ${formatNumber(categories.length)}`);
    lines.push(`▸ Orders ────── ${formatNumber(totalOrders)}`);
    lines.push(`▸ Stock ─────── ${totalStock < 0 ? "Unlimited" : formatNumber(totalStock)}`);
    lines.push("");
    lines.push(SMALL_DIVIDER);
    lines.push("");
    // Payment Methods
    lines.push(`**◆ Payment**`);
    lines.push("");
    lines.push("▸ PromptPay");
    lines.push("▸ TrueMoney");
    lines.push("▸ Bank Transfer");
    lines.push("");
    lines.push(SMALL_DIVIDER);
    lines.push("");
    // Features
    lines.push(`**◆ Features**`);
    lines.push("");
    const features = shop.marketplaceFeatures || [];
    if (features.length > 0) {
        for (const feature of features.slice(0, 4)) {
            lines.push(`✔ ${feature}`);
        }
    }
    else {
        lines.push("✔ Instant Delivery");
        lines.push("✔ Secure Trade");
        lines.push("✔ 24/7 Support");
        lines.push("✔ Premium Quality");
    }
    lines.push("");
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
