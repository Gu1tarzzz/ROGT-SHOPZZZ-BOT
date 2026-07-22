import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from "discord.js";
import { BUTTON_STYLES } from "../config/constants.js";
import { formatPrice, formatStock, truncate } from "../utils/formatters.js";
import { componentEmoji } from "../utils/componentEmoji.js";
// ╭──────────────────────────────────────────────────────────────╮
// │  PREMIUM SHOP COMPONENTS - ROGT SHOPZZZ                     │
// │  Style: Luxury • Fantasy • Minimal • Dark                   │
// │  Reference: Dapex Boost, Mickey Boost, Steam Store          │
// ╰──────────────────────────────────────────────────────────────╯
export function shopButtons(shop, allowRefresh = false) {
    const rows = [];
    const mainRow = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("shop:browse").setLabel("เลือกชม").setStyle(ButtonStyle.Primary).setEmoji("🛒"), new ButtonBuilder().setCustomId("shop:order").setLabel("สั่งซื้อ").setStyle(ButtonStyle.Success).setEmoji("📦"), new ButtonBuilder().setCustomId("shop:support").setLabel("ช่วยเหลือ").setStyle(ButtonStyle.Secondary).setEmoji("💬"), new ButtonBuilder().setCustomId("shop:info").setLabel("ข้อมูลร้าน").setStyle(ButtonStyle.Secondary).setEmoji("⭐"));
    rows.push(mainRow);
    return rows;
}
export function shopAdminButtons(hasLiveShop = false) {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("shop:preview").setLabel("ดูตัวอย่าง").setStyle(ButtonStyle.Primary).setEmoji("🛍️"), new ButtonBuilder().setCustomId("shop:publish").setLabel("เผยแพร่").setStyle(ButtonStyle.Success).setEmoji("⭐"), new ButtonBuilder().setCustomId("shop:appearance").setLabel("ดีไซน์ร้าน").setStyle(ButtonStyle.Secondary).setEmoji("💎"));
}
export function categoryMenu(categories, customId = "shop:category") {
    const options = categories.slice(0, 25).map((category) => ({
        label: truncate(category.name, 100),
        value: category.id,
        description: truncate(category.description || "เลือกเพื่อดูสินค้า", 100),
        emoji: componentEmoji(category.emoji, "📁")
    }));
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
        .setCustomId(customId)
        .setPlaceholder("📁 เลือกหมวดหมู่")
        .addOptions(options));
}
export function productMenu(products, customId = "shop:product") {
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
        .setCustomId(customId)
        .setPlaceholder("📦 เลือกสินค้า")
        .addOptions(products.slice(0, 25).map((product) => {
        const stockStatus = product.stock < 0
            ? "● พร้อมจำหน่าย"
            : product.stock > 0
                ? `● คงเหลือ ${formatStock(product.stock)}`
                : "○ สินค้าหมด";
        return {
            label: truncate(product.name, 100),
            value: product.id,
            description: truncate(`${formatPrice(product.price)} • ${stockStatus}`, 100),
            emoji: componentEmoji(product.emoji, "📦")
        };
    })));
}
export function productOrderButton(product) {
    return new ActionRowBuilder().addComponents(new ButtonBuilder()
        .setCustomId(`order:create:${product.id}`)
        .setLabel("ยืนยันคำสั่งซื้อ")
        .setStyle(BUTTON_STYLES[product.buttonColor])
        .setEmoji("🛒"));
}
