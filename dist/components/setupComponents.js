import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from "discord.js";
import { formatStock, truncate } from "../utils/formatters.js";
// ╭──────────────────────────────────────────────────────────────╮
// │  PREMIUM DASHBOARD COMPONENTS - ROGT SHOPZZZ                 │
// │  Style: Luxury • Fantasy • Minimal • Dark                    │
// │  Reference: Dapex Boost, Mickey Boost, Steam Store           │
// ╰──────────────────────────────────────────────────────────────╯
export function dashboardMenu() {
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
        .setCustomId("setup:section")
        .setPlaceholder("✦ Select Section")
        .addOptions({ label: "Categories", value: "categories", description: "Manage shop categories", emoji: "📂" }, { label: "Products", value: "products", description: "Manage products & stock", emoji: "📦" }, { label: "Appearance", value: "appearance", description: "Store branding & style", emoji: "✨" }, { label: "Payment", value: "payment", description: "Payment channels", emoji: "💳" }, { label: "Tickets", value: "tickets", description: "Support settings", emoji: "🎫" }, { label: "Settings", value: "bot", description: "System configuration", emoji: "⚙️" }));
}
export function backButton() {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("setup:home").setLabel("Back").setStyle(ButtonStyle.Secondary).setEmoji("◀️"));
}
export function refreshButtons(publishedMessageId) {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("setup:refresh:shop").setLabel("Refresh").setStyle(ButtonStyle.Primary).setEmoji("🔄").setDisabled(!publishedMessageId), new ButtonBuilder().setCustomId("setup:refresh:dashboard").setLabel("Refresh Dashboard").setStyle(ButtonStyle.Secondary).setEmoji("🔄"));
}
export function categoryButtons() {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("category:create").setLabel("Create").setStyle(ButtonStyle.Success).setEmoji("➕"), new ButtonBuilder().setCustomId("category:edit:pick").setLabel("Edit").setStyle(ButtonStyle.Primary).setEmoji("✏️"), new ButtonBuilder().setCustomId("category:visibility:pick").setLabel("Toggle").setStyle(ButtonStyle.Secondary).setEmoji("👁️"), new ButtonBuilder().setCustomId("category:sort:pick").setLabel("Sort").setStyle(ButtonStyle.Secondary).setEmoji("📊"), new ButtonBuilder().setCustomId("category:delete:pick").setLabel("Delete").setStyle(ButtonStyle.Danger).setEmoji("🗑️"));
}
export function categoryManagerMenu(categories, mode) {
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId(`category:pick:${mode}`).setPlaceholder("✦ Select Category").addOptions(categories.slice(0, 25).map((category) => ({
        label: truncate(category.name, 100), value: category.id,
        description: truncate(`${category.hidden ? "Hidden" : "Visible"} • Pos ${category.position}`, 100),
        emoji: category.emoji || "📂"
    }))));
}
export function categorySortButtons(categoryId) {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`category:move:${categoryId}:up`).setLabel("Up").setStyle(ButtonStyle.Primary).setEmoji("⬆️"), new ButtonBuilder().setCustomId(`category:move:${categoryId}:down`).setLabel("Down").setStyle(ButtonStyle.Primary).setEmoji("⬇️"));
}
export function productButtons() {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("product:create:pick").setLabel("Add").setStyle(ButtonStyle.Success).setEmoji("➕"), new ButtonBuilder().setCustomId("product:edit:pick").setLabel("Edit").setStyle(ButtonStyle.Primary).setEmoji("✏️"), new ButtonBuilder().setCustomId("product:visibility:pick").setLabel("Toggle").setStyle(ButtonStyle.Secondary).setEmoji("👁️"), new ButtonBuilder().setCustomId("product:delete:pick").setLabel("Delete").setStyle(ButtonStyle.Danger).setEmoji("🗑️"));
}
export function productManagerMenu(products, mode) {
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId(`product:pick:${mode}`).setPlaceholder("✦ Select Product").addOptions(products.slice(0, 25).map((product) => ({
        label: truncate(product.name, 100), value: product.id,
        description: truncate(`${product.hidden ? "Hidden" : product.status} • ${formatStock(product.stock)}`, 100),
        emoji: product.emoji || "📦"
    }))));
}
export function productCategoryMenu(categories) {
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId("product:pick:create").setPlaceholder("✦ Select Category").addOptions(categories.slice(0, 25).map((category) => ({ label: truncate(category.name, 100), value: category.id, emoji: category.emoji || "📂" }))));
}
export function sectionButtons(section) {
    const map = {
        appearance: [
            { label: "Basic", id: "basic", emoji: "📝" },
            { label: "Images", id: "images", emoji: "🖼️" },
            { label: "Branding", id: "branding", emoji: "✨" }
        ],
        payment: [{ label: "Payment", id: "payment", emoji: "💳" }],
        tickets: [
            { label: "Categories", id: "ticket-categories", emoji: "🎫" },
            { label: "Staff", id: "ticket-staff", emoji: "👥" }
        ],
        bot: [{ label: "Bot", id: "bot", emoji: "🤖" }]
    };
    const options = map[section];
    const row = new ActionRowBuilder();
    for (const opt of options) {
        row.addComponents(new ButtonBuilder().setCustomId(`setup:modal:${section}:${opt.id}`).setLabel(opt.label).setStyle(ButtonStyle.Primary).setEmoji(opt.emoji));
    }
    return row.addComponents(new ButtonBuilder().setCustomId("setup:home").setLabel("Back").setStyle(ButtonStyle.Secondary).setEmoji("🔙"));
}
export function stockManagerButtons() {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("stock:view:all").setLabel("View Stock").setStyle(ButtonStyle.Primary).setEmoji("📦"), new ButtonBuilder().setCustomId("stock:alerts").setLabel("Alerts").setStyle(ButtonStyle.Danger).setEmoji("⚠️"), new ButtonBuilder().setCustomId("stock:restock").setLabel("Restock").setStyle(ButtonStyle.Success).setEmoji("➕"));
}
export function stockActionButtons(productId) {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`stock:add:${productId}`).setLabel("Add").setStyle(ButtonStyle.Success).setEmoji("➕"), new ButtonBuilder().setCustomId(`stock:remove:${productId}`).setLabel("Remove").setStyle(ButtonStyle.Danger).setEmoji("➖"), new ButtonBuilder().setCustomId(`stock:history:${productId}`).setLabel("History").setStyle(ButtonStyle.Secondary).setEmoji("📜"));
}
export function stockHistoryMenu(transactions) {
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId("stock:history:view").setPlaceholder("✦ View Transactions").addOptions(transactions.slice(0, 25).map((t) => ({
        label: `${t.type} ${t.quantity > 0 ? "+" : ""}${t.quantity}`,
        value: t.id,
        description: `${t.previousStock} → ${t.newStock} • By <@${t.performedBy}>`,
        emoji: t.type === "purchase" ? "🛒" : t.type === "restock" ? "📦" : "📝"
    }))));
}
