import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from "discord.js";
import { formatStock, truncate } from "../utils/formatters.js";
// ═══════════════════════════════════════════════════════════════
// PREMIUM DASHBOARD COMPONENTS - ROGT SHOPZZZ
// Modern • Clean • Professional UI
// ═══════════════════════════════════════════════════════════════
export function dashboardMenu() {
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
        .setCustomId("setup:section")
        .setPlaceholder("Select management section...")
        .addOptions({ label: "Category Manager", value: "categories", description: "Create, edit, hide & organize categories", emoji: "📂" }, { label: "Product Manager", value: "products", description: "Manage products, prices, stock & permissions", emoji: "📦" }, { label: "Shop Appearance", value: "appearance", description: "Store name, banner, colors & premium styling", emoji: "🏪" }, { label: "Payment Settings", value: "payment", description: "Payment channels and slip configuration", emoji: "💳" }, { label: "Ticket Settings", value: "tickets", description: "Ticket rooms and staff configuration", emoji: "🎫" }, { label: "Bot Settings", value: "bot", description: "Owner, staff roles and system status", emoji: "⚙️" }));
}
export function backButton() {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("setup:home").setLabel("Back").setStyle(ButtonStyle.Secondary).setEmoji("◀️"));
}
export function refreshButtons(publishedMessageId) {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("setup:refresh:shop").setLabel("Refresh Shop").setStyle(ButtonStyle.Primary).setEmoji("🔄").setDisabled(!publishedMessageId), new ButtonBuilder().setCustomId("setup:refresh:dashboard").setLabel("Refresh Dashboard").setStyle(ButtonStyle.Secondary).setEmoji("🔄"));
}
export function categoryButtons() {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("category:create").setLabel("Create Category").setStyle(ButtonStyle.Success).setEmoji("➕"), new ButtonBuilder().setCustomId("category:edit:pick").setLabel("Edit").setStyle(ButtonStyle.Primary).setEmoji("✏️"), new ButtonBuilder().setCustomId("category:visibility:pick").setLabel("Hide / Show").setStyle(ButtonStyle.Secondary).setEmoji("👁️"), new ButtonBuilder().setCustomId("category:sort:pick").setLabel("Sort Order").setStyle(ButtonStyle.Secondary).setEmoji("📊"), new ButtonBuilder().setCustomId("category:delete:pick").setLabel("Delete").setStyle(ButtonStyle.Danger).setEmoji("🗑️"));
}
export function categoryManagerMenu(categories, mode) {
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId(`category:pick:${mode}`).setPlaceholder("Select a category...").addOptions(categories.slice(0, 25).map((category) => ({
        label: truncate(category.name, 100), value: category.id,
        description: truncate(`${category.hidden ? "Hidden" : "Visible"} • Position ${category.position}`, 100)
    }))));
}
export function categorySortButtons(categoryId) {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`category:move:${categoryId}:up`).setLabel("Move Up").setStyle(ButtonStyle.Primary).setEmoji("⬆️"), new ButtonBuilder().setCustomId(`category:move:${categoryId}:down`).setLabel("Move Down").setStyle(ButtonStyle.Primary).setEmoji("⬇️"));
}
export function productButtons() {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("product:create:pick").setLabel("Add Product").setStyle(ButtonStyle.Success).setEmoji("➕"), new ButtonBuilder().setCustomId("product:edit:pick").setLabel("Edit").setStyle(ButtonStyle.Primary).setEmoji("✏️"), new ButtonBuilder().setCustomId("product:visibility:pick").setLabel("Hide / Show").setStyle(ButtonStyle.Secondary).setEmoji("👁️"), new ButtonBuilder().setCustomId("product:delete:pick").setLabel("Delete").setStyle(ButtonStyle.Danger).setEmoji("🗑️"));
}
export function productManagerMenu(products, mode) {
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId(`product:pick:${mode}`).setPlaceholder("Select a product...").addOptions(products.slice(0, 25).map((product) => ({
        label: truncate(product.name, 100), value: product.id,
        description: truncate(`${product.hidden ? "Hidden" : product.status} • Stock ${formatStock(product.stock)}`, 100)
    }))));
}
export function productCategoryMenu(categories) {
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId("product:pick:create").setPlaceholder("📂 Select category for new product").addOptions(categories.slice(0, 25).map((category) => ({ label: truncate(category.name, 100), value: category.id }))));
}
export function sectionButtons(section) {
    const map = {
        appearance: [
            { label: "Basic Info", id: "basic" },
            { label: "Images & Banner", id: "images" },
            { label: "Branding & Settings", id: "branding" }
        ],
        payment: [{ label: "Edit Payment", id: "payment" }],
        tickets: [
            { label: "Ticket Categories", id: "ticket-categories" },
            { label: "Staff & Transcripts", id: "ticket-staff" }
        ],
        bot: [{ label: "Edit Bot", id: "bot" }]
    };
    const options = map[section];
    const row = new ActionRowBuilder();
    for (const opt of options) {
        row.addComponents(new ButtonBuilder().setCustomId(`setup:modal:${section}:${opt.id}`).setLabel(opt.label).setStyle(ButtonStyle.Primary));
    }
    return row.addComponents(new ButtonBuilder().setCustomId("setup:home").setLabel("◀ Back to Dashboard").setStyle(ButtonStyle.Secondary));
}
export function stockManagerButtons() {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("stock:view:all").setLabel("📦 View All Stock").setStyle(ButtonStyle.Primary), new ButtonBuilder().setCustomId("stock:alerts").setLabel("⚠️ Alerts").setStyle(ButtonStyle.Danger), new ButtonBuilder().setCustomId("stock:restock").setLabel("➕ Request Restock").setStyle(ButtonStyle.Success));
}
export function stockActionButtons(productId) {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`stock:add:${productId}`).setLabel("+ Add Stock").setStyle(ButtonStyle.Success), new ButtonBuilder().setCustomId(`stock:remove:${productId}`).setLabel("- Remove Stock").setStyle(ButtonStyle.Danger), new ButtonBuilder().setCustomId(`stock:history:${productId}`).setLabel("📜 History").setStyle(ButtonStyle.Secondary));
}
export function stockHistoryMenu(transactions) {
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId("stock:history:view").setPlaceholder("📜 View transactions").addOptions(transactions.slice(0, 25).map((t) => ({
        label: `${t.type} ${t.quantity > 0 ? "+" : ""}${t.quantity}`,
        value: t.id,
        description: `${t.previousStock} → ${t.newStock} • By <@${t.performedBy}>`
    }))));
}
