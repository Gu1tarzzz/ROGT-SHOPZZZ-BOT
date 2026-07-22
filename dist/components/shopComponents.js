import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from "discord.js";
import { BUTTON_STYLES } from "../config/constants.js";
import { formatPrice, truncate } from "../utils/formatters.js";
// ╭──────────────────────────────────────────────────────────────╮
// │  PREMIUM SHOP COMPONENTS - ROGT SHOPZZZ                     │
// │  Style: Luxury • Fantasy • Minimal • Dark                   │
// │  Reference: Dapex Boost, Mickey Boost, Steam Store          │
// ╰──────────────────────────────────────────────────────────────╯
export function shopButtons(shop, allowRefresh = false) {
    const rows = [];
    // Only two action buttons: Top Up & Check Credit
    const actionRow = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("shop:topup").setLabel("Top Up Credit").setStyle(ButtonStyle.Primary).setEmoji("🪙"), new ButtonBuilder().setCustomId("shop:credit").setLabel("Check Credit").setStyle(ButtonStyle.Secondary).setEmoji("🍎"));
    rows.push(actionRow);
    return rows;
}
export function browseMenu(categories, products) {
    const options = [];
    // Add categories first (with folder emoji)
    for (const category of categories.slice(0, 20)) {
        const categoryProducts = products.filter(p => p.categoryId === category.id && p.stock !== 0);
        if (categoryProducts.length > 0) {
            options.push({
                label: truncate(category.name, 100),
                value: `cat:${category.id}`,
                description: truncate(`${categoryProducts.length} products`, 100),
                emoji: parseEmoji(category.emoji || "📂")
            });
        }
    }
    // Add individual products (if space remains)
    const remainingSlots = 25 - options.length;
    if (remainingSlots > 0) {
        for (const product of products.slice(0, remainingSlots)) {
            if (!product.hidden && product.status === "active" && product.stock !== 0) {
                const stockStatus = product.stock > 0 ? `${product.stock} left` : "Unlimited";
                options.push({
                    label: truncate(product.name, 100),
                    value: `prod:${product.id}`,
                    description: truncate(`${formatPrice(product.price)} • ${stockStatus}`, 100),
                    emoji: parseEmoji(product.emoji || "📦")
                });
            }
        }
    }
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
        .setCustomId("shop:browse")
        .setPlaceholder("✦ Browse Products")
        .addOptions(options));
}
export function shopAdminButtons(hasLiveShop = false) {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("shop:preview").setLabel("Preview").setStyle(ButtonStyle.Primary).setEmoji("👁️"), new ButtonBuilder().setCustomId("shop:publish").setLabel("Publish").setStyle(ButtonStyle.Success).setEmoji("📤"), new ButtonBuilder().setCustomId("shop:appearance").setLabel("Appearance").setStyle(ButtonStyle.Secondary).setEmoji("🏪"));
}
function parseEmoji(emojiStr) {
    if (!emojiStr)
        return undefined;
    return { name: emojiStr };
}
export function categoryMenu(categories, customId = "shop:category") {
    const options = categories.slice(0, 25).map((category) => ({
        label: truncate(category.name, 100),
        value: category.id,
        description: truncate(category.description || "View products", 100),
        emoji: parseEmoji(category.emoji || "📂")
    }));
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
        .setCustomId(customId)
        .setPlaceholder("✦ Select Category")
        .addOptions(options));
}
export function productMenu(products, customId = "shop:product") {
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
        .setCustomId(customId)
        .setPlaceholder("✦ Select Product")
        .addOptions(products.slice(0, 25).map((product) => {
        const stockStatus = product.stock > 0
            ? `● ${product.stock} left`
            : "○ Out of Stock";
        return {
            label: truncate(product.name, 100),
            value: product.id,
            description: truncate(`${formatPrice(product.price)} • ${stockStatus}`, 100),
            emoji: parseEmoji(product.emoji || "📦")
        };
    })));
}
export function productOrderButton(product) {
    return new ActionRowBuilder().addComponents(new ButtonBuilder()
        .setCustomId(`order:create:${product.id}`)
        .setLabel("Confirm Order")
        .setStyle(BUTTON_STYLES[product.buttonColor])
        .setEmoji("💳"));
}
