import { categoryRepository, productRepository, settingsRepository } from "../database/repositories.js";
import { dashboardMenu, sectionButtons, refreshButtons, categoryManagerEmbed, productManagerEmbed } from "../components/setupComponents.js";
import { premiumEmbed, premiumMetricBlock, statusIndicator, compactMetricCard } from "../utils/discord.js";
import { truncate, formatNumber } from "../utils/formatters.js";
import { DIVIDER, UI_EMOJI } from "../config/constants.js";
const statusMark = (isPositive, positive, negative) => `${isPositive ? "🟢" : "🔴"} **${isPositive ? positive : negative}**`;
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
    // Premium dashboard layout with compact 2x2 metric cards matching reference
    const description = [
        `**${UI_EMOJI.text.brand} ${settings.shop.storeName}**`,
        statusIndicator(settings.shop.status),
        "",
        DIVIDER,
        "",
        `**${UI_EMOJI.text.section} Marketplace Metrics**`,
        "",
        `${compactMetricCard("📁", "Categories", formatNumber(categories.length))}  ${compactMetricCard("📦", "Products", formatNumber(products.length))}`,
        `${compactMetricCard("💎", "Total Stock", totalStock < 0 ? "Unlimited" : formatNumber(totalStock))}  ${compactMetricCard("✨", "Available", products.filter(p => p.stock !== 0).length.toString())}`,
        "",
        DIVIDER,
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
        const { embed, components } = categoryManagerEmbed(guildId, categories);
        await interaction.update({ embeds: [embed], components });
        return;
    }
    if (section === "products") {
        const products = await productRepository.list(guildId);
        const { embed, components } = productManagerEmbed(guildId, products);
        await interaction.update({ embeds: [embed], components });
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
                premiumMetricBlock("🎨", "Color", settings.shop.embedColor),
                premiumMetricBlock("🖼️", "Banner", settings.shop.bannerGif || settings.shop.banner ? "Set" : "Not Set"),
                premiumMetricBlock("✨", "Thumbnail", settings.shop.thumbnail ? "Set" : "Not Set"),
                premiumMetricBlock("🏷️", "Branding", settings.shop.authorName || "Default"),
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
                premiumMetricBlock("📁", "Order Category", settings.tickets.categoryId ? `<#${settings.tickets.categoryId}>` : "Not Set"),
                premiumMetricBlock("💬", "Support Category", settings.tickets.supportCategoryId ? `<#${settings.tickets.supportCategoryId}>` : "Use Order Category"),
                premiumMetricBlock("🏷️", "Prefix", settings.tickets.ticketPrefix),
                premiumMetricBlock("👥", "Staff Roles", settings.tickets.staffRoleIds.length.toString()),
                "",
                `${UI_EMOJI.text.bullet} กดปุ่มด้านล่างเพื่อแก้ไข`
            ].join("\n") },
        bot: { title: "⚙️ BOT SETTINGS", key: "bot", text: [
                "*ตั้งค่าสิทธิ์และสถานะบอต*",
                "",
                DIVIDER,
                "",
                premiumMetricBlock("👑", "Owner", settings.bot.ownerId ? `<@${settings.bot.ownerId}>` : "Guild Owner"),
                premiumMetricBlock("🛡️", "Staff Roles", settings.bot.staffRoleIds.length.toString()),
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
