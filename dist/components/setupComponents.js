import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from "discord.js";
import { formatStock, truncate } from "../utils/formatters.js";
import { componentEmoji } from "../utils/componentEmoji.js";
// ╭──────────────────────────────────────────────────────────────╮
// │  PREMIUM DASHBOARD COMPONENTS - ROGT SHOPZZZ                 │
// │  Style: Luxury • Fantasy • Minimal • Dark                    │
// │  Reference: Dapex Boost, Mickey Boost, Steam Store           │
// ╰──────────────────────────────────────────────────────────────╯
export function dashboardMenu() {
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
        .setCustomId("setup:section")
        .setPlaceholder("◆ เลือกส่วนจัดการ")
        .addOptions({ label: "หมวดหมู่", value: "categories", description: "สร้าง • เรียงลำดับ • แสดงผล", emoji: "📁" }, { label: "สินค้า", value: "products", description: "ราคา • สต็อก • สถานะ", emoji: "📦" }, { label: "ดีไซน์ร้าน", value: "appearance", description: "แบรนด์ • สี • ภาพ", emoji: "💎" }, { label: "การชำระเงิน", value: "payment", description: "ช่องทางและบัญชีรับเงิน", emoji: "💳" }, { label: "Ticket", value: "tickets", description: "หมวดหมู่และทีมงาน", emoji: "🎫" }, { label: "ตั้งค่าระบบ", value: "bot", description: "สิทธิ์และสถานะบอต", emoji: "⚡" }));
}
export function backButton() {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("setup:home").setLabel("กลับแดชบอร์ด").setStyle(ButtonStyle.Secondary).setEmoji("🔙"));
}
export function refreshButtons(publishedMessageId) {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("setup:refresh:shop").setLabel("อัปเดตหน้าร้าน").setStyle(ButtonStyle.Primary).setEmoji("🔄").setDisabled(!publishedMessageId), new ButtonBuilder().setCustomId("setup:refresh:dashboard").setLabel("รีเฟรชสรุป").setStyle(ButtonStyle.Secondary).setEmoji("📈"));
}
export function categoryButtons() {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("category:create").setLabel("สร้าง").setStyle(ButtonStyle.Success).setEmoji("📂"), new ButtonBuilder().setCustomId("category:edit:pick").setLabel("แก้ไข").setStyle(ButtonStyle.Primary).setEmoji("📝"), new ButtonBuilder().setCustomId("category:visibility:pick").setLabel("แสดงผล").setStyle(ButtonStyle.Secondary).setEmoji("⭐"), new ButtonBuilder().setCustomId("category:sort:pick").setLabel("เรียงลำดับ").setStyle(ButtonStyle.Secondary).setEmoji("📈"), new ButtonBuilder().setCustomId("category:delete:pick").setLabel("ลบ").setStyle(ButtonStyle.Danger).setEmoji("🗑️"));
}
export function categoryManagerMenu(categories, mode) {
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId(`category:pick:${mode}`).setPlaceholder("📁 เลือกหมวดหมู่").addOptions(categories.slice(0, 25).map((category) => ({
        label: truncate(category.name, 100), value: category.id,
        description: truncate(`${category.hidden ? "○ ซ่อน" : "● แสดง"}  •  ลำดับ ${category.position}`, 100),
        emoji: componentEmoji(category.emoji, "📁")
    }))));
}
export function categorySortButtons(categoryId) {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`category:move:${categoryId}:up`).setLabel("เลื่อนขึ้น").setStyle(ButtonStyle.Primary).setEmoji("📈"), new ButtonBuilder().setCustomId(`category:move:${categoryId}:down`).setLabel("เลื่อนลง").setStyle(ButtonStyle.Primary).setEmoji("📉"));
}
export function productButtons() {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("product:create:pick").setLabel("เพิ่มสินค้า").setStyle(ButtonStyle.Success).setEmoji("📦"), new ButtonBuilder().setCustomId("product:edit:pick").setLabel("แก้ไข").setStyle(ButtonStyle.Primary).setEmoji("📝"), new ButtonBuilder().setCustomId("product:visibility:pick").setLabel("แสดงผล").setStyle(ButtonStyle.Secondary).setEmoji("⭐"), new ButtonBuilder().setCustomId("product:delete:pick").setLabel("ลบ").setStyle(ButtonStyle.Danger).setEmoji("🗑️"));
}
export function productManagerMenu(products, mode) {
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId(`product:pick:${mode}`).setPlaceholder("📦 เลือกสินค้า").addOptions(products.slice(0, 25).map((product) => ({
        label: truncate(product.name, 100), value: product.id,
        description: truncate(`${product.hidden ? "○ ซ่อน" : product.status === "active" ? "● พร้อมขาย" : "○ ปิดขาย"}  •  ${formatStock(product.stock)}`, 100),
        emoji: componentEmoji(product.emoji, "📦")
    }))));
}
export function productCategoryMenu(categories) {
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId("product:pick:create").setPlaceholder("📁 เลือกหมวดหมู่").addOptions(categories.slice(0, 25).map((category) => ({ label: truncate(category.name, 100), value: category.id, emoji: componentEmoji(category.emoji, "📁") }))));
}
export function sectionButtons(section) {
    const map = {
        appearance: [
            { label: "ข้อมูลร้าน", id: "basic", emoji: "📝" },
            { label: "รูปภาพ", id: "images", emoji: "🖼️" },
            { label: "แบรนด์", id: "branding", emoji: "💎" }
        ],
        payment: [{ label: "การชำระเงิน", id: "payment", emoji: "💳" }],
        tickets: [
            { label: "หมวดหมู่", id: "ticket-categories", emoji: "📂" },
            { label: "ทีมงาน", id: "ticket-staff", emoji: "👑" }
        ],
        bot: [{ label: "ตั้งค่าบอต", id: "bot", emoji: "⚡" }]
    };
    const options = map[section];
    const row = new ActionRowBuilder();
    for (const opt of options) {
        row.addComponents(new ButtonBuilder().setCustomId(`setup:modal:${section}:${opt.id}`).setLabel(opt.label).setStyle(ButtonStyle.Primary).setEmoji(opt.emoji));
    }
    return row.addComponents(new ButtonBuilder().setCustomId("setup:home").setLabel("กลับ").setStyle(ButtonStyle.Secondary).setEmoji("🔙"));
}
export function stockManagerButtons() {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("stock:view:all").setLabel("ดูสต็อก").setStyle(ButtonStyle.Primary).setEmoji("📦"), new ButtonBuilder().setCustomId("stock:alerts").setLabel("แจ้งเตือน").setStyle(ButtonStyle.Danger).setEmoji("🔥"), new ButtonBuilder().setCustomId("stock:restock").setLabel("เติมสต็อก").setStyle(ButtonStyle.Success).setEmoji("📦"));
}
export function stockActionButtons(productId) {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`stock:add:${productId}`).setLabel("เพิ่ม").setStyle(ButtonStyle.Success).setEmoji("📦"), new ButtonBuilder().setCustomId(`stock:remove:${productId}`).setLabel("ตัดออก").setStyle(ButtonStyle.Danger).setEmoji("🗑️"), new ButtonBuilder().setCustomId(`stock:history:${productId}`).setLabel("ประวัติ").setStyle(ButtonStyle.Secondary).setEmoji("📊"));
}
export function stockHistoryMenu(transactions) {
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId("stock:history:view").setPlaceholder("📊 ดูรายการเคลื่อนไหว").addOptions(transactions.slice(0, 25).map((t) => ({
        label: `${t.type} ${t.quantity > 0 ? "+" : ""}${t.quantity}`,
        value: t.id,
        description: `${t.previousStock} → ${t.newStock}  •  <@${t.performedBy}>`,
        emoji: t.type === "purchase" ? "🛒" : t.type === "restock" ? "📦" : "📝"
    }))));
}
