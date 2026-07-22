import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from "discord.js";
import { formatStock, truncate } from "../utils/formatters.js";
import { componentEmoji } from "../utils/componentEmoji.js";
import { UI_EMOJI } from "../config/constants.js";
// ╭──────────────────────────────────────────────────────────────╮
// │  PREMIUM DASHBOARD COMPONENTS - ROGT SHOPZZZ                 │
// │  Style: Luxury • Fantasy • Minimal • Dark                    │
// │  Reference: Dapex Boost, Mickey Boost, Steam Store           │
// ╰──────────────────────────────────────────────────────────────╯
export function dashboardMenu() {
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
        .setCustomId("setup:section")
        .setPlaceholder(`${UI_EMOJI.text.section} เลือกส่วนจัดการ`)
        .addOptions({ label: "หมวดหมู่", value: "categories", description: "สร้าง • เรียงลำดับ • แสดงผล", emoji: UI_EMOJI.component.category }, { label: "สินค้า", value: "products", description: "ราคา • สต็อก • สถานะ", emoji: UI_EMOJI.component.product }, { label: "ดีไซน์ร้าน", value: "appearance", description: "แบรนด์ • สี • ภาพ", emoji: UI_EMOJI.component.gem }, { label: "การชำระเงิน", value: "payment", description: "ช่องทางและบัญชีรับเงิน", emoji: UI_EMOJI.component.payment }, { label: "Ticket", value: "tickets", description: "หมวดหมู่และทีมงาน", emoji: UI_EMOJI.component.ticket }, { label: "ตั้งค่าระบบ", value: "bot", description: "สิทธิ์และสถานะบอต", emoji: UI_EMOJI.component.settings }));
}
export function backButton() {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("setup:home").setLabel("กลับแดชบอร์ด").setStyle(ButtonStyle.Secondary).setEmoji(UI_EMOJI.component.back));
}
export function refreshButtons(publishedMessageId) {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("setup:refresh:shop").setLabel("อัปเดตหน้าร้าน").setStyle(ButtonStyle.Primary).setEmoji(UI_EMOJI.component.refresh).setDisabled(!publishedMessageId), new ButtonBuilder().setCustomId("setup:refresh:dashboard").setLabel("รีเฟรชสรุป").setStyle(ButtonStyle.Secondary).setEmoji(UI_EMOJI.component.analytics));
}
export function categoryButtons() {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("category:create").setLabel("สร้าง").setStyle(ButtonStyle.Success).setEmoji(UI_EMOJI.component.categories), new ButtonBuilder().setCustomId("category:edit:pick").setLabel("แก้ไข").setStyle(ButtonStyle.Primary).setEmoji(UI_EMOJI.component.edit), new ButtonBuilder().setCustomId("category:visibility:pick").setLabel("แสดงผล").setStyle(ButtonStyle.Secondary).setEmoji(UI_EMOJI.component.star), new ButtonBuilder().setCustomId("category:sort:pick").setLabel("เรียงลำดับ").setStyle(ButtonStyle.Secondary).setEmoji(UI_EMOJI.component.analytics), new ButtonBuilder().setCustomId("category:delete:pick").setLabel("ลบ").setStyle(ButtonStyle.Danger).setEmoji(UI_EMOJI.component.remove));
}
export function categoryManagerMenu(categories, mode) {
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId(`category:pick:${mode}`).setPlaceholder(`${UI_EMOJI.component.category} เลือกหมวดหมู่`).addOptions(categories.slice(0, 25).map((category) => ({
        label: truncate(category.name, 100), value: category.id,
        description: truncate(`${category.hidden ? `${UI_EMOJI.text.inactive} ซ่อน` : `${UI_EMOJI.text.active} แสดง`}  •  ลำดับ ${category.position}`, 100),
        emoji: componentEmoji(category.emoji, UI_EMOJI.component.category)
    }))));
}
export function categorySortButtons(categoryId) {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`category:move:${categoryId}:up`).setLabel("เลื่อนขึ้น").setStyle(ButtonStyle.Primary).setEmoji(UI_EMOJI.component.analytics), new ButtonBuilder().setCustomId(`category:move:${categoryId}:down`).setLabel("เลื่อนลง").setStyle(ButtonStyle.Primary).setEmoji(UI_EMOJI.component.decrease));
}
export function productButtons() {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("product:create:pick").setLabel("เพิ่มสินค้า").setStyle(ButtonStyle.Success).setEmoji(UI_EMOJI.component.product), new ButtonBuilder().setCustomId("product:edit:pick").setLabel("แก้ไข").setStyle(ButtonStyle.Primary).setEmoji(UI_EMOJI.component.edit), new ButtonBuilder().setCustomId("product:visibility:pick").setLabel("แสดงผล").setStyle(ButtonStyle.Secondary).setEmoji(UI_EMOJI.component.star), new ButtonBuilder().setCustomId("product:delete:pick").setLabel("ลบ").setStyle(ButtonStyle.Danger).setEmoji(UI_EMOJI.component.remove));
}
export function productManagerMenu(products, mode) {
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId(`product:pick:${mode}`).setPlaceholder(`${UI_EMOJI.component.product} เลือกสินค้า`).addOptions(products.slice(0, 25).map((product) => ({
        label: truncate(product.name, 100), value: product.id,
        description: truncate(`${product.hidden ? `${UI_EMOJI.text.inactive} ซ่อน` : product.status === "active" ? `${UI_EMOJI.text.active} พร้อมขาย` : `${UI_EMOJI.text.inactive} ปิดขาย`}  •  ${formatStock(product.stock)}`, 100),
        emoji: componentEmoji(product.emoji, UI_EMOJI.component.product)
    }))));
}
export function productCategoryMenu(categories) {
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId("product:pick:create").setPlaceholder(`${UI_EMOJI.component.category} เลือกหมวดหมู่`).addOptions(categories.slice(0, 25).map((category) => ({ label: truncate(category.name, 100), value: category.id, emoji: componentEmoji(category.emoji, UI_EMOJI.component.category) }))));
}
export function sectionButtons(section) {
    const map = {
        appearance: [
            { label: "ข้อมูลร้าน", id: "basic", emoji: UI_EMOJI.component.edit },
            { label: "รูปภาพ", id: "images", emoji: UI_EMOJI.component.image },
            { label: "แบรนด์", id: "branding", emoji: UI_EMOJI.component.gem }
        ],
        payment: [{ label: "การชำระเงิน", id: "payment", emoji: UI_EMOJI.component.payment }],
        tickets: [
            { label: "หมวดหมู่", id: "ticket-categories", emoji: UI_EMOJI.component.categories },
            { label: "ทีมงาน", id: "ticket-staff", emoji: UI_EMOJI.component.owner }
        ],
        bot: [{ label: "ตั้งค่าบอต", id: "bot", emoji: UI_EMOJI.component.settings }]
    };
    const options = map[section];
    const row = new ActionRowBuilder();
    for (const opt of options) {
        row.addComponents(new ButtonBuilder().setCustomId(`setup:modal:${section}:${opt.id}`).setLabel(opt.label).setStyle(ButtonStyle.Primary).setEmoji(opt.emoji));
    }
    return row.addComponents(new ButtonBuilder().setCustomId("setup:home").setLabel("กลับ").setStyle(ButtonStyle.Secondary).setEmoji(UI_EMOJI.component.back));
}
export function stockManagerButtons() {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("stock:view:all").setLabel("ดูสต็อก").setStyle(ButtonStyle.Primary).setEmoji(UI_EMOJI.component.product), new ButtonBuilder().setCustomId("stock:alerts").setLabel("แจ้งเตือน").setStyle(ButtonStyle.Danger).setEmoji(UI_EMOJI.component.alert), new ButtonBuilder().setCustomId("stock:restock").setLabel("เติมสต็อก").setStyle(ButtonStyle.Success).setEmoji(UI_EMOJI.component.product));
}
export function stockActionButtons(productId) {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`stock:add:${productId}`).setLabel("เพิ่ม").setStyle(ButtonStyle.Success).setEmoji(UI_EMOJI.component.product), new ButtonBuilder().setCustomId(`stock:remove:${productId}`).setLabel("ตัดออก").setStyle(ButtonStyle.Danger).setEmoji(UI_EMOJI.component.remove), new ButtonBuilder().setCustomId(`stock:history:${productId}`).setLabel("ประวัติ").setStyle(ButtonStyle.Secondary).setEmoji(UI_EMOJI.component.analytics));
}
export function stockHistoryMenu(transactions) {
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId("stock:history:view").setPlaceholder(`${UI_EMOJI.component.analytics} ดูรายการเคลื่อนไหว`).addOptions(transactions.slice(0, 25).map((t) => ({
        label: `${t.type} ${t.quantity > 0 ? "+" : ""}${t.quantity}`,
        value: t.id,
        description: `${t.previousStock} → ${t.newStock}  •  <@${t.performedBy}>`,
        emoji: t.type === "purchase" ? UI_EMOJI.component.browse : t.type === "restock" ? UI_EMOJI.component.product : UI_EMOJI.component.edit
    }))));
}
