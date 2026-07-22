import { categoryRepository, productRepository, settingsRepository } from "../database/repositories.js";
import { backButton, categoryButtons, dashboardMenu, productButtons, sectionButtons, refreshButtons } from "../components/setupComponents.js";
import { premiumEmbed, statusMark, premiumMetric, statusIndicator } from "../utils/discord.js";
import { formatPrice, truncate, formatNumber } from "../utils/formatters.js";
import { DIVIDER, UI_EMOJI } from "../config/constants.js";
export async function showDashboard(interaction) {
    if (!interaction.guildId)
        return;
    const settings = await settingsRepository.get(interaction.guildId);
    const categories = await categoryRepository.list(interaction.guildId, false);
    const products = await productRepository.list(interaction.guildId, false);
    // Calculate total stock
    let totalStock = 0;
    for (const product of products) {
        if (product.stock === -1)
            continue;
        totalStock += product.stock;
    }
    const paymentStatus = statusMark(settings.payment.enabled, "พร้อมรับชำระ", "ยังไม่เปิด");
    const ticketStatus = statusMark(Boolean(settings.tickets.categoryId), "พร้อมใช้งาน", "ต้องตั้งค่า");
    const publishStatus = statusMark(Boolean(settings.shop.publishedMessageId), "เผยแพร่แล้ว", "ยังไม่เผยแพร่");
    // Premium dashboard layout with metric cards
    const description = [
        `**${UI_EMOJI.text.brand} ${settings.shop.storeName}**`,
        statusIndicator(settings.shop.status),
        "",
        DIVIDER,
        "",
        `**${UI_EMOJI.text.section} Marketplace Metrics**`,
        "",
        premiumMetric("📁", "Categories", formatNumber(categories.length)),
        premiumMetric("📦", "Products", formatNumber(products.length)),
        premiumMetric("💎", "Total Stock", totalStock < 0 ? "Unlimited" : formatNumber(totalStock)),
        premiumMetric("✨", "Available", products.filter(p => p.stock !== 0).length.toString()),
        "",
        `**${UI_EMOJI.text.section} System Status**`,
        "",
        `${UI_EMOJI.component.payment} **Payment**  ${paymentStatus}`,
        `${UI_EMOJI.component.ticket} **Tickets**  ${ticketStatus}`,
        `${UI_EMOJI.component.catalog} **Shop Front**  ${publishStatus}`,
        "",
        settings.shop.publishedChannelId && settings.shop.publishedMessageId
            ? `${UI_EMOJI.text.bullet} Published in <#${settings.shop.publishedChannelId}>`
            : "",
        "",
        DIVIDER,
        "เลือกส่วนจัดการด้านล่าง"
    ].filter(line => line !== "").join("\n");
    const baseEmbed = await premiumEmbed(interaction.guildId, "✦ ROGT COMMAND CENTER", description);
    const components = [dashboardMenu(), refreshButtons(settings.shop.publishedMessageId)];
    const payload = { embeds: [baseEmbed], components };
    if (interaction.isChatInputCommand()) {
        await interaction.reply({ ...payload, ephemeral: false });
    }
    else {
        await interaction.update(payload);
    }
}
export async function showSetupSection(interaction, section) {
    if (!interaction.guildId)
        return;
    const guildId = interaction.guildId;
    if (section === "categories") {
        const categories = await categoryRepository.list(guildId);
        const summary = categories.length
            ? categories.map((c) => `${UI_EMOJI.text.bullet} **${truncate(c.name, 40)}**  ${c.hidden ? "○ ซ่อน" : "● แสดง"}  •  ลำดับ ${c.position}`).join("\n")
            : "○ ยังไม่มีหมวดหมู่สินค้า";
        const embed = await premiumEmbed(guildId, "📁 CATEGORY MANAGER", [
            "*จัดการหมวดหมู่สินค้าและการแสดงผล*",
            "",
            DIVIDER,
            "",
            `${UI_EMOJI.text.bullet} ทั้งหมด **${formatNumber(categories.length)}** หมวดหมู่`,
            "",
            summary || "ไม่มีข้อมูล"
        ].join("\n"));
        await interaction.update({ embeds: [embed], components: [categoryButtons(), backButton()] });
        return;
    }
    if (section === "products") {
        const products = await productRepository.list(guildId);
        const summary = products.length
            ? products.slice(0, 15).map((p) => `${UI_EMOJI.text.bullet} **${truncate(p.name, 35)}**  ${formatPrice(p.price)}  •  ${p.stock < 0 ? "ไม่จำกัด" : `สต็อก ${p.stock}`}`).join("\n")
            : "○ ยังไม่มีสินค้า";
        const embed = await premiumEmbed(guildId, "📦 PRODUCT MANAGER", [
            "*จัดการสินค้า ราคา และสต็อก*",
            "",
            DIVIDER,
            "",
            `${UI_EMOJI.text.bullet} ทั้งหมด **${formatNumber(products.length)}** รายการ`,
            "",
            summary || "ไม่มีข้อมูล"
        ].join("\n"));
        await interaction.update({ embeds: [embed], components: [productButtons(), backButton()] });
        return;
    }
    const settings = await settingsRepository.get(guildId);
    const sectionContent = {
        appearance: { title: "🎨 SHOP APPEARANCE", key: "appearance", text: [
                `**${UI_EMOJI.text.section} ${settings.shop.storeName}**`,
                `*${truncate(settings.shop.description, 200)}*`,
                "",
                DIVIDER,
                "",
                premiumMetric("🎨", "Color", settings.shop.embedColor),
                premiumMetric("🖼️", "Banner", settings.shop.bannerGif || settings.shop.banner ? "Set" : "Not Set"),
                premiumMetric("✨", "Thumbnail", settings.shop.thumbnail ? "Set" : "Not Set"),
                premiumMetric("🏷️", "Branding", settings.shop.authorName || "Default"),
                "",
                `${UI_EMOJI.text.bullet} กดปุ่มด้านล่างเพื่อแก้ไข`
            ].join("\n") },
        payment: { title: "💳 PAYMENT SETTINGS", key: "payment", text: [
                statusMark(settings.payment.enabled, "เปิดรับชำระเงิน", "ยังไม่เปิดรับชำระเงิน"),
                "",
                DIVIDER,
                "",
                `**${UI_EMOJI.text.section} ช่องทางชำระเงิน**`,
                "",
                `${UI_EMOJI.text.bullet} TrueMoney  ${settings.payment.trueMoneyWallet || "—"}`,
                `${UI_EMOJI.text.bullet} PromptPay  ${settings.payment.promptPay || "—"}`,
                `${UI_EMOJI.text.bullet} Bank  ${settings.payment.bankAccount || "—"}`,
                `${UI_EMOJI.text.bullet} Slip Channel  ${settings.payment.slipChannelId ? `<#${settings.payment.slipChannelId}>` : "—"}`
            ].join("\n") },
        tickets: { title: "🎫 TICKET SETTINGS", key: "tickets", text: [
                "*ระบบ Ticket สำหรับดูแลคำสั่งซื้อ*",
                "",
                DIVIDER,
                "",
                premiumMetric("📁", "Order Category", settings.tickets.categoryId ? `<#${settings.tickets.categoryId}>` : "Not Set"),
                premiumMetric("💬", "Support Category", settings.tickets.supportCategoryId ? `<#${settings.tickets.supportCategoryId}>` : "Use Order Category"),
                premiumMetric("🏷️", "Prefix", settings.tickets.ticketPrefix),
                premiumMetric("👥", "Staff Roles", settings.tickets.staffRoleIds.length.toString()),
                "",
                `${UI_EMOJI.text.bullet} กดปุ่มด้านล่างเพื่อแก้ไข`
            ].join("\n") },
        bot: { title: "⚙️ BOT SETTINGS", key: "bot", text: [
                "*ตั้งค่าสิทธิ์และสถานะบอต*",
                "",
                DIVIDER,
                "",
                premiumMetric("👑", "Owner", settings.bot.ownerId ? `<@${settings.bot.ownerId}>` : "Guild Owner"),
                premiumMetric("🛡️", "Staff Roles", settings.bot.staffRoleIds.length.toString()),
                statusMark(!settings.bot.maintenanceMode, "ระบบพร้อมให้บริการ", "กำลังปิดปรับปรุง"),
                "",
                `${UI_EMOJI.text.bullet} กดปุ่มด้านล่างเพื่อแก้ไข`
            ].join("\n") }
    };
    const view = sectionContent[section];
    if (!view)
        return;
    const embed = await premiumEmbed(guildId, view.title, view.text);
    await interaction.update({ embeds: [embed], components: [sectionButtons(view.key)] });
}
