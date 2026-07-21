import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from "discord.js";
import { BUTTON_STYLES } from "../config/constants.js";
import { formatPrice, formatStock, truncate } from "../utils/formatters.js";
// ═══════════════════════════════════════════════════════════════
// PREMIUM SHOP COMPONENTS - ROGT SHOPZZZ MARKETPLACE
// ═══════════════════════════════════════════════════════════════
export function shopButtons(shop, allowRefresh = false) {
    const rows = [];
    const mainRow = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("shop:browse").setLabel(shop.buttons.browse).setStyle(ButtonStyle.Primary), new ButtonBuilder().setCustomId("shop:order").setLabel(shop.buttons.order).setStyle(ButtonStyle.Success), new ButtonBuilder().setCustomId("shop:support").setLabel(shop.buttons.support).setStyle(ButtonStyle.Secondary), new ButtonBuilder().setCustomId("shop:info").setLabel(shop.buttons.information).setStyle(ButtonStyle.Secondary));
    rows.push(mainRow);
    return rows;
}
export function shopAdminButtons(hasLiveShop = false) {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("shop:preview").setLabel("👁️ Preview").setStyle(ButtonStyle.Primary), new ButtonBuilder().setCustomId("shop:publish").setLabel("📤 Publish Shop").setStyle(ButtonStyle.Success), new ButtonBuilder().setCustomId("shop:appearance").setLabel("🏪 Premium Appearance").setStyle(ButtonStyle.Secondary));
}
export function categoryMenu(categories, customId = "shop:category") {
    const options = categories.slice(0, 25).map((category) => ({
        label: truncate(category.name, 100),
        value: category.id,
        description: truncate(category.description || "Browse products in this category", 100)
    }));
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
        .setCustomId(customId)
        .setPlaceholder("✧ Browse categories ✧")
        .addOptions(options));
}
export function productMenu(products, customId = "shop:product") {
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
        .setCustomId(customId)
        .setPlaceholder("✧ Select a product ✧")
        .addOptions(products.slice(0, 25).map((product) => ({
        label: truncate(product.name, 100),
        value: product.id,
        description: truncate(`${formatPrice(product.price)} • ${formatStock(product.stock)} available`, 100)
    }))));
}
export function productOrderButton(product) {
    return new ActionRowBuilder().addComponents(new ButtonBuilder()
        .setCustomId(`order:create:${product.id}`)
        .setLabel("Purchase Now")
        .setStyle(BUTTON_STYLES[product.buttonColor])
        .setEmoji(product.emoji || "🛒"));
}
