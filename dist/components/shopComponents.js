import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from "discord.js";
import { BUTTON_STYLES, UI_EMOJI } from "../config/constants.js";
import { formatPrice, formatStock, truncate } from "../utils/formatters.js";
// ╭──────────────────────────────────────────────────────────────╮
// │  PREMIUM SHOP COMPONENTS - ROGT SHOPZZZ                     │
// │  Style: Luxury • Fantasy • Minimal • Dark                   │
// │  Reference: Dapex Boost, Mickey Boost, Steam Store          │
// ╰──────────────────────────────────────────────────────────────╯
/**
 * Safely resolves an emoji for select menu options.
 * Returns undefined if invalid, otherwise a valid emoji string or object.
 */
function resolveEmoji(value, fallback) {
    const candidate = value?.trim();
    if (!candidate)
        return undefined;
    // Check for custom emoji: <a:name:id> or <:name:id>
    const customMatch = candidate.match(/^<(a?):([\w-]+):(\d+)>$/);
    if (customMatch) {
        return { id: customMatch[3], name: customMatch[2], animated: customMatch[1] === "a" };
    }
    // Check for valid Unicode emoji
    const unicodeEmoji = /^(?:\p{Extended_Pictographic}|\p{Emoji_Presentation})(?:\uFE0F|\u200D|\p{Extended_Pictographic}|\p{Emoji_Presentation}|\p{Emoji_Modifier})*$/u;
    if (unicodeEmoji.test(candidate)) {
        return candidate;
    }
    // Fallback to default Unicode emoji
    return fallback;
}
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
    const options = categories.slice(0, 25).map((category) => {
        const emoji = resolveEmoji(category.emoji, UI_EMOJI.component.category);
        const option = {
            label: truncate(category.name, 100),
            value: `cat:${category.id}`,
            description: truncate(category.description || "เลือกเพื่อดูสินค้า", 100)
        };
        if (emoji)
            option.emoji = emoji;
        return option;
    });
    // Add an "All Products" option at the top
    options.unshift({
        label: "สินค้าทั้งหมด",
        value: "cat:all",
        description: "ดูสินค้าทุกหมวดหมู่",
        emoji: UI_EMOJI.component.catalog
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
    const options = categories.slice(0, 25).map((category) => {
        const emoji = resolveEmoji(category.emoji, UI_EMOJI.component.category);
        const option = {
            label: truncate(category.name, 100),
            value: category.id,
            description: truncate(category.description || "เลือกเพื่อดูสินค้า", 100)
        };
        if (emoji)
            option.emoji = emoji;
        return option;
    });
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
        const emoji = resolveEmoji(product.emoji, UI_EMOJI.component.product);
        const option = {
            label: truncate(product.name, 100),
            value: product.id,
            description: truncate(`${formatPrice(product.price)} • ${stockStatus}`, 100)
        };
        if (emoji)
            option.emoji = emoji;
        return option;
    })));
}
export function productOrderButton(product) {
    return new ActionRowBuilder().addComponents(new ButtonBuilder()
        .setCustomId(`order:create:${product.id}`)
        .setLabel("ยืนยันคำสั่งซื้อ")
        .setStyle(BUTTON_STYLES[product.buttonColor])
        .setEmoji(UI_EMOJI.component.browse));
}
