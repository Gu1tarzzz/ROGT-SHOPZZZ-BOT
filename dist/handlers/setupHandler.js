import { categoryRepository, productRepository, settingsRepository } from "../database/repositories.js";
import { backButton, categoryButtons, dashboardMenu, productButtons, sectionButtons, refreshButtons } from "../components/setupComponents.js";
import { metric, premiumEmbed, statusMark } from "../utils/discord.js";
import { formatPrice, truncate, formatNumber } from "../utils/formatters.js";
import { SECTION_DIVIDER, DIVIDER, UI_EMOJI } from "../config/constants.js";
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
    const timestamp = Math.floor(Date.now() / 1000);
    const paymentStatus = statusMark(settings.payment.enabled, "พร้อมรับชำระ", "ยังไม่เปิด");
    const ticketStatus = statusMark(Boolean(settings.tickets.categoryId), "พร้อมใช้งาน", "ต้องตั้งค่า");
    const publishStatus = statusMark(Boolean(settings.shop.publishedMessageId), "เผยแพร่แล้ว", "ยังไม่เผยแพร่");
    // Premium metric cards layout
    const description = [
        `**${UI_EMOJI.text.brand} ${settings.shop.storeName}**`,
        statusMark(settings.shop.status === "open", "เปิดให้บริการ", "ปิดปรับปรุง"),
        "",
        DIVIDER,
        "",
        `**${UI_EMOJI.text.section} Marketplace Metrics**`,
        "",
        "```┌─────────────────────────────────────",
        `│  ${metric("หมวดหมู่", formatNumber(categories.length))}  │  ${metric("สินค้า", formatNumber(products.length))}`,
        "├─────────────────────────────────────",
        `│  ${metric("สต็อกรวม", totalStock < 0 ? "ไม่จำกัด" : formatNumber(totalStock))}  │  ${metric("สถานะ", settings.shop.status === "open" ? "🟢 เปิด" : "🔴 ปิด")}`,
        "└─────────────────────────────────────```",
        "",
        `**${UI_EMOJI.text.section} System Status**`,
        "",
        `${UI_EMOJI.component.payment}  **ชำระเงิน**  ${paymentStatus}`,
        `${UI_EMOJI.component.ticket}  **Ticket**  ${ticketStatus}`,
        `${UI_EMOJI.component.catalog}  **หน้าร้าน**  ${publishStatus}`,
        "",
        settings.shop.publishedChannelId && settings.shop.publishedMessageId
            ? `${UI_EMOJI.text.bullet} เผยแพร่ใน <#${settings.shop.publishedChannelId}>`
            : "",
        "",
        SECTION_DIVIDER,
        `${UI_EMOJI.text.bullet} อัปเดต <t:${timestamp}:R>  •  เลือกส่วนจัดการด้านล่าง`
    ].filter(line => line !== "").join("\n");
    const baseEmbed = await premiumEmbed(interaction.guildId, "ROGT COMMAND CENTER", description);
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
        const embed = await premiumEmbed(guildId, "CATEGORY MANAGER", [
            "*โครงสร้างหน้าร้านและการแสดงผล*",
            "",
            DIVIDER,
            "",
            `**${UI_EMOJI.text.section} ทั้งหมด ${formatNumber(categories.length)} หมวดหมู่**`,
            summary
        ].join("\n"));
        await interaction.update({ embeds: [embed], components: [categoryButtons(), backButton()] });
        return;
    }
    if (section === "products") {
        const products = await productRepository.list(guildId);
        const summary = products.length
            ? products.slice(0, 15).map((p) => `${UI_EMOJI.text.bullet} **${truncate(p.name, 35)}**  ${formatPrice(p.price)}  •  ${p.stock < 0 ? "ไม่จำกัด" : `สต็อก ${p.stock}`}`).join("\n")
            : "○ ยังไม่มีสินค้า";
        const embed = await premiumEmbed(guildId, "PRODUCT MANAGER", [
            "*สินค้า ราคา และสต็อกของร้าน*",
            "",
            DIVIDER,
            "",
            `**${UI_EMOJI.text.section} ทั้งหมด ${formatNumber(products.length)} รายการ**`,
            summary
        ].join("\n"));
        await interaction.update({ embeds: [embed], components: [productButtons(), backButton()] });
        return;
    }
    const settings = await settingsRepository.get(guildId);
    const sectionContent = {
        appearance: { title: "SHOP APPEARANCE", key: "appearance", text: [
                `**${UI_EMOJI.text.section} ${settings.shop.storeName}**`,
                `*${truncate(settings.shop.description, 200)}*`,
                "",
                DIVIDER,
                "",
                `${metric("สี", settings.shop.embedColor)}  •  ${statusMark(settings.shop.status === "open", "เปิด", "ปิด")}`,
                `${UI_EMOJI.text.bullet} Banner  ${settings.shop.bannerGif || settings.shop.banner ? "● ตั้งค่าแล้ว" : "○ ยังไม่ได้ตั้งค่า"}`,
                `${UI_EMOJI.text.bullet} Thumbnail  ${settings.shop.thumbnail ? "● ตั้งค่าแล้ว" : "○ ยังไม่ได้ตั้งค่า"}`,
                `${UI_EMOJI.text.bullet} Branding  ${settings.shop.authorName || "ค่าเริ่มต้น"}`
            ].join("\n") },
        payment: { title: "PAYMENT SETTINGS", key: "payment", text: [
                statusMark(settings.payment.enabled, "เปิดรับชำระเงิน", "ยังไม่เปิดรับชำระเงิน"),
                "",
                DIVIDER,
                "",
                `**${UI_EMOJI.text.section} ช่องทางชำระเงิน**`,
                `${UI_EMOJI.text.bullet} TrueMoney  ${settings.payment.trueMoneyWallet || "—"}`,
                `${UI_EMOJI.text.bullet} PromptPay  ${settings.payment.promptPay || "—"}`,
                `${UI_EMOJI.text.bullet} Bank  ${settings.payment.bankAccount || "—"}`,
                `${UI_EMOJI.text.bullet} Slip Channel  ${settings.payment.slipChannelId ? `<#${settings.payment.slipChannelId}>` : "—"}`
            ].join("\n") },
        tickets: { title: "TICKET SETTINGS", key: "tickets", text: [
                "*พื้นที่ดูแลคำสั่งซื้อและการช่วยเหลือ*",
                "",
                DIVIDER,
                "",
                `${UI_EMOJI.text.bullet} Order Category  ${settings.tickets.categoryId ? `<#${settings.tickets.categoryId}>` : "—"}`,
                `${UI_EMOJI.text.bullet} Support Category  ${settings.tickets.supportCategoryId ? `<#${settings.tickets.supportCategoryId}>` : "ใช้ Order Category"}`,
                `${metric("Prefix", settings.tickets.ticketPrefix)}  •  ${metric("ทีมงาน", settings.tickets.staffRoleIds.length)}`
            ].join("\n") },
        bot: { title: "BOT SETTINGS", key: "bot", text: [
                "*สิทธิ์ผู้ดูแลและสถานะการให้บริการ*",
                "",
                DIVIDER,
                "",
                `${UI_EMOJI.text.bullet} Owner  ${settings.bot.ownerId ? `<@${settings.bot.ownerId}>` : "Guild Owner"}`,
                `${metric("Staff Roles", settings.bot.staffRoleIds.length)}`,
                statusMark(!settings.bot.maintenanceMode, "ระบบพร้อมให้บริการ", "กำลังปิดปรับปรุง")
            ].join("\n") }
    };
    const view = sectionContent[section];
    if (!view)
        return;
    const embed = await premiumEmbed(guildId, view.title, view.text);
    await interaction.update({ embeds: [embed], components: [sectionButtons(view.key)] });
}
