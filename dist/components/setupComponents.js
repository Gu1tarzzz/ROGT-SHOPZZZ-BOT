import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder } from "discord.js";
import { formatStock, truncate, formatPrice } from "../utils/formatters.js";
import { componentEmoji } from "../utils/componentEmoji.js";
import { UI_EMOJI, DIVIDER } from "../config/constants.js";
// ╭──────────────────────────────────────────────────────────────╮
// │  PREMIUM DASHBOARD COMPONENTS - ROGT SHOPZZZ                 │
// │  Style: Luxury • Fantasy • Minimal • Dark                    │
// │  Reference: Dapex Boost, Mickey Boost, Steam Store           │
// ╰──────────────────────────────────────────────────────────────╯
export function dashboardMenu() {
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
        .setCustomId("setup:section")
        .setPlaceholder(`${UI_EMOJI.text.section} เลือกส่วนจัดการ`)
        .addOptions({ label: "หมวดหมู่", value: "categories", description: "สร้าง • เรียงลำดับ • แสดงผล", emoji: UI_EMOJI.component.category }, { label: "สินค้า", value: "products", description: "ราคา • สต็อก • สถานะ", emoji: UI_EMOJI.component.product }, { label: "ดีไซน์ร้าน", value: "appearance", description: "แบรนด์ • สี • ภาพ", emoji: UI_EMOJI.component.gem }, { label: "ดีไซน์หลังร้าน", value: "backoffice", description: "รูปลักษณ์แดชบอร์ด", emoji: UI_EMOJI.component.gem }, { label: "การชำระเงิน", value: "payment", description: "ช่องทางและบัญชีรับเงิน", emoji: UI_EMOJI.component.payment }, { label: "Ticket", value: "tickets", description: "หมวดหมู่และทีมงาน", emoji: UI_EMOJI.component.ticket }, { label: "ตั้งค่าระบบ", value: "bot", description: "สิทธิ์และสถานะบอต", emoji: UI_EMOJI.component.settings }));
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
        backoffice: [
            { label: "Embed Design", id: "embed-design", emoji: UI_EMOJI.component.gem },
            { label: "Banner & Image", id: "banner-image", emoji: UI_EMOJI.component.image },
            { label: "Preview", id: "preview", emoji: UI_EMOJI.component.browse }
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
/**
 * Creates a NEW embed for Back Office Design Manager page (not editing existing dashboard)
 */
export function backOfficeDesignEmbed(guildId, settings) {
    const backOffice = settings.backOffice;
    const embed = new EmbedBuilder()
        .setColor(backOffice.embedColor)
        .setTitle(`${UI_EMOJI.text.brand} BACK OFFICE DESIGN`)
        .setDescription([
        "*ปรับแต่งรูปลักษณ์แดชบอร์ดและหน้าจัดการ*",
        "",
        DIVIDER,
        "",
        `${UI_EMOJI.text.section} Embed Configuration`,
        "",
        `${UI_EMOJI.text.bullet} **Title**  ${backOffice.embedTitle}`,
        `${UI_EMOJI.text.bullet} **Description**  ${truncate(backOffice.embedDescription, 60)}`,
        `${UI_EMOJI.text.bullet} **Color**  \`${backOffice.embedColor}\``,
        "",
        DIVIDER,
        "",
        `${UI_EMOJI.text.section} Visual Elements`,
        "",
        `${UI_EMOJI.text.bullet} **Thumbnail**  ${backOffice.thumbnailUrl ? "✓ Set" : "○ Not Set"}`,
        `${UI_EMOJI.text.bullet} **Image Banner**  ${backOffice.imageUrl ? "✓ Set" : "○ Not Set"}`,
        `${UI_EMOJI.text.bullet} **Footer**  ${backOffice.footerText}`,
        `${UI_EMOJI.text.bullet} **Footer Icon**  ${backOffice.footerIcon ? "✓ Set" : "○ Not Set"}`,
        "",
        DIVIDER,
        "",
        `${UI_EMOJI.text.section} Author Info`,
        "",
        `${UI_EMOJI.text.bullet} **Author Name**  ${backOffice.authorName || "Default"}`,
        `${UI_EMOJI.text.bullet} **Author Icon**  ${backOffice.authorIcon ? "✓ Set" : "○ Not Set"}`,
        "",
        DIVIDER,
        "",
        `${UI_EMOJI.text.section} Style Options`,
        "",
        `${UI_EMOJI.text.bullet} **Divider**  ${backOffice.dividerStyle}`,
        `${UI_EMOJI.text.bullet} **Status Icons**  ${backOffice.statusIconStyle}`,
        "",
        DIVIDER,
        "",
        `${UI_EMOJI.text.bullet} กดปุ่มด้านล่างเพื่อแก้ไขหรือดูตัวอย่าง`
    ].join("\n"))
        .setFooter({ text: `${UI_EMOJI.text.brand} ROGT SHOPZZZ` })
        .setTimestamp();
    if (backOffice.thumbnailUrl)
        embed.setThumbnail(backOffice.thumbnailUrl);
    if (backOffice.imageUrl)
        embed.setImage(backOffice.imageUrl);
    if (backOffice.authorName)
        embed.setAuthor({ name: backOffice.authorName, iconURL: backOffice.authorIcon || undefined });
    return {
        embed,
        components: [
            new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("setup:modal:backoffice:embed-design").setLabel("Embed Design").setStyle(ButtonStyle.Primary).setEmoji(UI_EMOJI.component.gem), new ButtonBuilder().setCustomId("setup:modal:backoffice:banner-image").setLabel("Banner & Image").setStyle(ButtonStyle.Primary).setEmoji(UI_EMOJI.component.image), new ButtonBuilder().setCustomId("setup:preview:backoffice").setLabel("ดูตัวอย่าง").setStyle(ButtonStyle.Secondary).setEmoji(UI_EMOJI.component.browse), new ButtonBuilder().setCustomId("setup:home").setLabel("กลับ").setStyle(ButtonStyle.Secondary).setEmoji(UI_EMOJI.component.back))
        ]
    };
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
/**
 * Creates a NEW embed for category manager page (not editing existing dashboard)
 */
export function categoryManagerEmbed(guildId, categories) {
    const summary = categories.length
        ? categories.map((c) => `${UI_EMOJI.text.bullet} **${truncate(c.name, 40)}**  ${c.hidden ? "○ ซ่อน" : "● แสดง"}  •  ลำดับ ${c.position}`).join("\n")
        : "○ ยังไม่มีหมวดหมู่สินค้า";
    const embed = new EmbedBuilder()
        .setColor("#8B5CF6")
        .setTitle(`${UI_EMOJI.text.brand} CATEGORY MANAGER`)
        .setDescription([
        "*จัดการหมวดหมู่สินค้าและการแสดงผล*",
        "",
        DIVIDER,
        "",
        `${UI_EMOJI.text.bullet} ทั้งหมด **${categories.length}** หมวดหมู่`,
        "",
        summary || "ไม่มีข้อมูล"
    ].join("\n"))
        .setFooter({ text: `${UI_EMOJI.text.brand} ROGT SHOPZZZ` })
        .setTimestamp();
    return { embed, components: [categoryButtons(), backButton()] };
}
/**
 * Creates a NEW embed for product manager page (not editing existing dashboard)
 */
export function productManagerEmbed(guildId, products) {
    const summary = products.length
        ? products.slice(0, 15).map((p) => `${UI_EMOJI.text.bullet} **${truncate(p.name, 35)}**  ${formatPrice(p.price)}  •  ${p.stock < 0 ? "ไม่จำกัด" : `สต็อก ${p.stock}`}`).join("\n")
        : "○ ยังไม่มีสินค้า";
    const embed = new EmbedBuilder()
        .setColor("#8B5CF6")
        .setTitle(`${UI_EMOJI.text.brand} PRODUCT MANAGER`)
        .setDescription([
        "*จัดการสินค้า ราคา และสต็อก*",
        "",
        DIVIDER,
        "",
        `${UI_EMOJI.text.bullet} ทั้งหมด **${products.length}** รายการ`,
        "",
        summary || "ไม่มีข้อมูล"
    ].join("\n"))
        .setFooter({ text: `${UI_EMOJI.text.brand} ROGT SHOPZZZ` })
        .setTimestamp();
    return { embed, components: [productButtons(), backButton()] };
}
/**
 * Creates a NEW embed for Design Settings page (not editing existing dashboard)
 * Premium design settings with all customization options
 */
export function designSettingsEmbed(guildId, settings) {
    const shop = settings.shop;
    const embed = new EmbedBuilder()
        .setColor(shop.embedColor)
        .setTitle(`${UI_EMOJI.text.brand} DESIGN SETTINGS`)
        .setDescription([
        "*ปรับแต่งรูปลักษณ์ร้านค้าของคุณ*",
        "",
        DIVIDER,
        "",
        `${UI_EMOJI.text.section} Store Information`,
        "",
        `${UI_EMOJI.text.bullet} **Store Name**  ${shop.storeName}`,
        `${UI_EMOJI.text.bullet} **Description**  ${truncate(shop.description, 80)}`,
        `${UI_EMOJI.text.bullet} **Footer**  ${shop.footer}`,
        `${UI_EMOJI.text.bullet} **Status**  ${shop.status === "open" ? "● Online" : "○ Offline"}`,
        "",
        DIVIDER,
        "",
        `${UI_EMOJI.text.section} Visual Design`,
        "",
        `${UI_EMOJI.text.bullet} **Embed Color**  \`${shop.embedColor}\``,
        `${UI_EMOJI.text.bullet} **Banner**  ${shop.bannerGif || shop.banner ? "✓ Set" : "○ Not Set"}`,
        `${UI_EMOJI.text.bullet} **Thumbnail**  ${shop.thumbnail ? "✓ Set" : "○ Not Set"}`,
        `${UI_EMOJI.text.bullet} **Logo**  ${shop.storeLogo ? "✓ Set" : "○ Not Set"}`,
        "",
        DIVIDER,
        "",
        `${UI_EMOJI.text.section} Branding`,
        "",
        `${UI_EMOJI.text.bullet} **Author Name**  ${shop.authorName || "Default"}`,
        `${UI_EMOJI.text.bullet} **Author Icon**  ${shop.authorIcon ? "✓ Set" : "○ Not Set"}`,
        "",
        DIVIDER,
        "",
        `${UI_EMOJI.text.bullet} กดปุ่มด้านล่างเพื่อแก้ไขหรือดูตัวอย่าง`
    ].join("\n"))
        .setFooter({ text: `${UI_EMOJI.text.brand} ROGT SHOPZZZ` })
        .setTimestamp();
    if (shop.thumbnail)
        embed.setThumbnail(shop.thumbnail);
    if (shop.bannerGif)
        embed.setImage(shop.bannerGif);
    else if (shop.banner)
        embed.setImage(shop.banner);
    return {
        embed,
        components: [
            new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("setup:modal:appearance:basic").setLabel("ข้อมูลร้าน").setStyle(ButtonStyle.Primary).setEmoji(UI_EMOJI.component.edit), new ButtonBuilder().setCustomId("setup:modal:appearance:images").setLabel("รูปภาพ").setStyle(ButtonStyle.Primary).setEmoji(UI_EMOJI.component.image), new ButtonBuilder().setCustomId("setup:modal:appearance:branding").setLabel("แบรนด์").setStyle(ButtonStyle.Primary).setEmoji(UI_EMOJI.component.gem), new ButtonBuilder().setCustomId("setup:preview:shop").setLabel("ดูตัวอย่าง").setStyle(ButtonStyle.Secondary).setEmoji(UI_EMOJI.component.browse), new ButtonBuilder().setCustomId("setup:home").setLabel("กลับ").setStyle(ButtonStyle.Secondary).setEmoji(UI_EMOJI.component.back))
        ]
    };
}
/**
 * Creates a NEW embed for Payment Settings page (not editing existing dashboard)
 */
export function paymentSettingsEmbed(guildId, settings) {
    const payment = settings.payment;
    const embed = new EmbedBuilder()
        .setColor("#8B5CF6")
        .setTitle(`${UI_EMOJI.text.brand} PAYMENT SETTINGS`)
        .setDescription([
        "*จัดการช่องทางชำระเงิน*",
        "",
        DIVIDER,
        "",
        `${UI_EMOJI.text.section} Status`,
        "",
        `${payment.enabled ? "●" : "○"} **Payment**  ${payment.enabled ? "เปิดรับชำระเงิน" : "ยังไม่เปิด"}`,
        "",
        DIVIDER,
        "",
        `${UI_EMOJI.text.section} Payment Methods`,
        "",
        `${UI_EMOJI.text.bullet} **TrueMoney Wallet**  ${payment.trueMoneyWallet || "—"}`,
        `${UI_EMOJI.text.bullet} **PromptPay**  ${payment.promptPay || "—"}`,
        `${UI_EMOJI.text.bullet} **Bank Account**  ${payment.bankAccount || "—"}`,
        `${UI_EMOJI.text.bullet} **Slip Channel**  ${payment.slipChannelId ? `<#${payment.slipChannelId}>` : "—"}`,
        "",
        DIVIDER,
        "",
        `${UI_EMOJI.text.bullet} กดปุ่มด้านล่างเพื่อแก้ไข`
    ].join("\n"))
        .setFooter({ text: `${UI_EMOJI.text.brand} ROGT SHOPZZZ` })
        .setTimestamp();
    return {
        embed,
        components: [
            new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("setup:modal:payment:payment").setLabel("การชำระเงิน").setStyle(ButtonStyle.Primary).setEmoji(UI_EMOJI.component.payment), new ButtonBuilder().setCustomId("setup:home").setLabel("กลับ").setStyle(ButtonStyle.Secondary).setEmoji(UI_EMOJI.component.back))
        ]
    };
}
/**
 * Creates a NEW embed for Ticket Settings page (not editing existing dashboard)
 */
export function ticketSettingsEmbed(guildId, settings) {
    const tickets = settings.tickets;
    const embed = new EmbedBuilder()
        .setColor("#8B5CF6")
        .setTitle(`${UI_EMOJI.text.brand} TICKET SETTINGS`)
        .setDescription([
        "*ระบบ Ticket สำหรับดูแลคำสั่งซื้อ*",
        "",
        DIVIDER,
        "",
        `${UI_EMOJI.text.section} Categories`,
        "",
        `${UI_EMOJI.text.bullet} **Order Category**  ${tickets.categoryId ? `<#${tickets.categoryId}>` : "○ Not Set"}`,
        `${UI_EMOJI.text.bullet} **Support Category**  ${tickets.supportCategoryId ? `<#${tickets.supportCategoryId}>` : "Use Order Category"}`,
        "",
        DIVIDER,
        "",
        `${UI_EMOJI.text.section} Configuration`,
        "",
        `${UI_EMOJI.text.bullet} **Prefix**  \`${tickets.ticketPrefix}\``,
        `${UI_EMOJI.text.bullet} **Staff Roles**  ${tickets.staffRoleIds.length} roles`,
        `${UI_EMOJI.text.bullet} **Transcript Channel**  ${tickets.transcriptChannelId ? `<#${tickets.transcriptChannelId}>` : "—"}`,
        "",
        DIVIDER,
        "",
        `${UI_EMOJI.text.bullet} กดปุ่มด้านล่างเพื่อแก้ไข`
    ].join("\n"))
        .setFooter({ text: `${UI_EMOJI.text.brand} ROGT SHOPZZZ` })
        .setTimestamp();
    return {
        embed,
        components: [
            new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("setup:modal:tickets:ticket-categories").setLabel("หมวดหมู่").setStyle(ButtonStyle.Primary).setEmoji(UI_EMOJI.component.categories), new ButtonBuilder().setCustomId("setup:modal:tickets:ticket-staff").setLabel("ทีมงาน").setStyle(ButtonStyle.Primary).setEmoji(UI_EMOJI.component.owner), new ButtonBuilder().setCustomId("setup:home").setLabel("กลับ").setStyle(ButtonStyle.Secondary).setEmoji(UI_EMOJI.component.back))
        ]
    };
}
/**
 * Creates a NEW embed for Bot Settings page (not editing existing dashboard)
 */
export function botSettingsEmbed(guildId, settings) {
    const bot = settings.bot;
    const embed = new EmbedBuilder()
        .setColor("#8B5CF6")
        .setTitle(`${UI_EMOJI.text.brand} BOT SETTINGS`)
        .setDescription([
        "*ตั้งค่าสิทธิ์และสถานะบอต*",
        "",
        DIVIDER,
        "",
        `${UI_EMOJI.text.section} Access Control`,
        "",
        `${UI_EMOJI.text.bullet} **Owner**  ${bot.ownerId ? `<@${bot.ownerId}>` : "Guild Owner"}`,
        `${UI_EMOJI.text.bullet} **Staff Roles**  ${bot.staffRoleIds.length} roles`,
        "",
        DIVIDER,
        "",
        `${UI_EMOJI.text.section} System Status`,
        "",
        `${!bot.maintenanceMode ? "●" : "◐"} **Maintenance Mode**  ${!bot.maintenanceMode ? "ระบบพร้อมให้บริการ" : "กำลังปิดปรับปรุง"}`,
        "",
        DIVIDER,
        "",
        `${UI_EMOJI.text.bullet} กดปุ่มด้านล่างเพื่อแก้ไข`
    ].join("\n"))
        .setFooter({ text: `${UI_EMOJI.text.brand} ROGT SHOPZZZ` })
        .setTimestamp();
    return {
        embed,
        components: [
            new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("setup:modal:bot:bot").setLabel("ตั้งค่าบอต").setStyle(ButtonStyle.Primary).setEmoji(UI_EMOJI.component.settings), new ButtonBuilder().setCustomId("setup:home").setLabel("กลับ").setStyle(ButtonStyle.Secondary).setEmoji(UI_EMOJI.component.back))
        ]
    };
}
