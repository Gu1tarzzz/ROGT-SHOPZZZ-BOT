import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from "discord.js";
import { BUTTON_STYLES, UI_EMOJI } from "../config/constants.js";
import { formatPrice, formatStock, truncate } from "../utils/formatters.js";
import { componentEmoji } from "../utils/componentEmoji.js";
// ╭──────────────────────────────────────────────────────────────╮
// │  PREMIUM SHOP COMPONENTS - ROGT SHOPZZZ                     │
// │  Style: Luxury • Fantasy • Minimal • Dark                   │
// │  Reference: Dapex Boost, Mickey Boost, Steam Store          │
// ╰──────────────────────────────────────────────────────────────╯
export function shopButtons(shop, allowRefresh = false, categories = []) {
    const rows = [];
    // Single catalog select menu row
    if (categories.length)
        rows.push(catalogMenu(categories));
    // Only TWO action buttons: Top Up Credit and Check Credit
    const actionRow = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("shop:topup").setLabel("เติมเครดิต").setStyle(ButtonStyle.Primary).setEmoji("🪙"), new ButtonBuilder().setCustomId("shop:credit").setLabel("ตรวจสอบเครดิต").setStyle(ButtonStyle.Secondary).setEmoji("🍎"));
    rows.push(actionRow);
    return rows;
}
/**
 * Unified catalog menu for browsing all products by category
 */
export function catalogMenu(categories, customId = "shop:catalog") {
    const options = categories.slice(0, 25).map((category) => ({
        label: truncate(category.name, 100),
        value: `cat:${category.id}`,
        description: truncate(category.description || "เลือกเพื่อดูสินค้า", 100),
        emoji: componentEmoji(category.emoji, UI_EMOJI.component.category)
    }));
    // Add an "All Products" option at the top
    options.unshift({
        label: "สินค้าทั้งหมด",
        value: "cat:all",
        description: "ดูสินค้าทุกหมวดหมู่",
        emoji: { id: null, name: UI_EMOJI.component.catalog }
    });
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
        .setCustomId(customId)
        .setPlaceholder(`${UI_EMOJI.component.catalog} เลือกหมวดหมู่สินค้า`)
        .addOptions(options));
}
export function shopAdminButtons(hasLiveShop = false) {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("shop:preview").setLabel("ดูตัวอย่าง").setStyle(ButtonStyle.Primary).setEmoji(UI_EMOJI.component.catalog), new ButtonBuilder().setCustomId("shop:publish").setLabel("เผยแพร่").setStyle(ButtonStyle.Success).setEmoji(UI_EMOJI.component.star), new ButtonBuilder().setCustomId("shop:appearance").setLabel("ดีไซน์ร้าน").setStyle(ButtonStyle.Secondary).setEmoji(UI_EMOJI.component.gem));
}
export function categoryMenu(categories, customId = "shop:category") {
    const options = categories.slice(0, 25).map((category) => ({
        label: truncate(category.name, 100),
        value: category.id,
        description: truncate(category.description || "เลือกเพื่อดูสินค้า", 100),
        emoji: componentEmoji(category.emoji, UI_EMOJI.component.category)
    }));
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
        .setCustomId(customId)
        .setPlaceholder(`${UI_EMOJI.component.category} เลือกหมวดหมู่สินค้า`)
        .addOptions(options));
}
export function productMenu(products, customId = "shop:product") {
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
        .setCustomId(customId)
        .setPlaceholder(`${UI_EMOJI.component.product} เลือกสินค้า`)
        .addOptions(products.slice(0, 25).map((product) => {
        const stockStatus = product.stock < 0
            ? `${UI_EMOJI.text.active} พร้อมจำหน่าย`
            : product.stock > 0
                ? `${UI_EMOJI.text.active} คงเหลือ ${formatStock(product.stock)}`
                : `${UI_EMOJI.text.inactive} สินค้าหมด`;
        return {
            label: truncate(product.name, 100),
            value: product.id,
            description: truncate(`${formatPrice(product.price)} • ${stockStatus}`, 100),
            emoji: componentEmoji(product.emoji, UI_EMOJI.component.product)
        };
    })));
}
export function productOrderButton(product) {
    return new ActionRowBuilder().addComponents(new ButtonBuilder()
        .setCustomId(`order:create:${product.id}`)
        .setLabel("ยืนยันคำสั่งซื้อ")
        .setStyle(BUTTON_STYLES[product.buttonColor])
        .setEmoji(UI_EMOJI.component.browse));
}
