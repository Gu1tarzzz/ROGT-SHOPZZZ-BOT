import { EmbedBuilder } from "discord.js";
import { DIVIDER, SMALL_DIVIDER } from "../config/constants.js";
import { settingsRepository, categoryRepository, productRepository } from "../database/repositories.js";
import { truncate, formatNumber } from "./formatters.js";
// ═══════════════════════════════════════════════════════════════
// PREMIUM MARKETPLACE EMBED - ROGT SHOPZZZ
// Fantasy • Magic • Luxury • Dark Mode
// Inspired by: Steam Store, Riot Games, Epic Games Store
// ═══════════════════════════════════════════════════════════════
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
    const statusEmoji = shop.status === "open" ? "🟢" : "🔴";
    const statusText = shop.status === "open" ? "Open for Business" : "Currently Closed";
    // Build premium, modern description with clean hierarchy
    const lines = [];
    // Hero Section - Store branding
    lines.push(`# ✦ ${shop.storeName} ✦`);
    lines.push("");
    // Store Description
    if (shop.description) {
        lines.push(`*${shop.description}*`);
        lines.push("");
    }
    // Status Indicator with visual separator
    lines.push(`${SMALL_DIVIDER}`);
    lines.push(`${statusEmoji} │ **${statusText}**`);
    lines.push("");
    lines.push(DIVIDER);
    lines.push("");
    // Statistics - Premium inline format
    lines.push("**📊 Marketplace Overview**");
    lines.push("");
    lines.push(`📂 Categories ─ **${formatNumber(categories.length)}**`);
    lines.push(`📦 Products ── **${formatNumber(products.length)}**`);
    lines.push(`💾 Stock ───── **${totalStock < 0 ? "Unlimited" : formatNumber(totalStock)}**`);
    lines.push("");
    lines.push(DIVIDER);
    lines.push("");
    // Payment Methods - Clean presentation
    lines.push("**💳 Accepted Payment Methods**");
    lines.push("");
    lines.push("⚡ PromptPay — Instant bank transfer");
    lines.push("💎 TrueMoney Wallet — E-wallet payment");
    lines.push("🏦 Bank Transfer — Direct banking");
    lines.push("");
    lines.push(DIVIDER);
    lines.push("");
    // Features - Premium benefits display
    lines.push("**✨ Why Choose ROGT SHOPZZZ?**");
    lines.push("");
    const features = shop.marketplaceFeatures || [];
    if (features.length > 0) {
        for (const feature of features.slice(0, 4)) {
            lines.push(`${feature}`);
        }
    }
    else {
        lines.push("⚡ Instant Delivery — Automated fulfillment");
        lines.push("🔒 Secure Trading — Protected transactions");
        lines.push("💬 24/7 Support — Always available help");
        lines.push("⭐ Premium Quality — Curated products");
    }
    lines.push("");
    lines.push(DIVIDER);
    lines.push("");
    // Footer branding
    lines.push(`*Powered by ROGT SHOPZZZ* │ *Realm of Gu1tarzzz*`);
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
