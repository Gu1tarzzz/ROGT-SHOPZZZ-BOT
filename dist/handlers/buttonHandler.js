import { ActionRowBuilder, ButtonBuilder, ButtonStyle, DiscordAPIError } from "discord.js";
import { categoryManagerMenu, categorySortButtons, productCategoryMenu, productManagerMenu, stockActionButtons, dashboardMenu, refreshButtons } from "../components/setupComponents.js";
import { shopButtons } from "../components/shopComponents.js";
import { categoryRepository, productRepository, settingsRepository, stockRepository } from "../database/repositories.js";
import { openCategoryModal, openModal, openProductModal } from "./modalHandler.js";
import { showDashboard } from "./setupHandler.js";
import { cancelTicket, closeTicket, createOrderTicket, promptSlip, reviewSlip } from "./ticketHandler.js";
import { premiumEmbed, shopEmbed, statusIndicator, compactMetricCard } from "../utils/discord.js";
import { hasAdminAccess } from "../utils/permissions.js";
import { formatStock, formatNumber } from "../utils/formatters.js";
import { DIVIDER, UI_EMOJI } from "../config/constants.js";
function statusMark(isPositive, positive, negative) {
    return `${isPositive ? UI_EMOJI.text.active : UI_EMOJI.text.inactive} **${isPositive ? positive : negative}**`;
}
async function assertAdmin(interaction) {
    if (!interaction.guild)
        return false;
    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (await hasAdminAccess(member))
        return true;
    await interaction.reply({ content: "○ เฉพาะ Owner, Administrator หรือ Staff Role ที่ตั้งค่าไว้", ephemeral: true });
    return false;
}
export async function handleButton(interaction) {
    if (!interaction.guildId)
        return;
    const [scope, action, id, extra] = interaction.customId.split(":");
    if (scope === "shop") {
        // Handle topup and credit button interactions
        if (action === "topup") {
            const embed = await premiumEmbed(interaction.guildId, "TOP UP CREDIT", [
                "*เติมเครดิตเพื่อซื้อสินค้า*",
                "",
                DIVIDER,
                "▸ ติดต่อทีมงานเพื่อเติมเครดิต",
                "▸ หรือใช้คำสั่งซื้อเพื่อชำระเงิน"
            ].join("\n"));
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        if (action === "credit") {
            const embed = await premiumEmbed(interaction.guildId, "CHECK CREDIT", [
                "*ตรวจสอบยอดเครดิตของคุณ*",
                "",
                DIVIDER,
                "▸ ระบบเครดิตกำลังพัฒนา",
                "▸ ติดต่อทีมงานสำหรับข้อมูลเพิ่มเติม"
            ].join("\n"));
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
    if (scope === "order" && action === "create") {
        const product = await productRepository.find(id);
        if (!product)
            return interaction.reply({ content: "○ ไม่พบสินค้านี้", ephemeral: true });
        return createOrderTicket(interaction, product);
    }
    if (scope === "ticket") {
        if (action === "slip")
            return promptSlip(interaction);
        if (action === "cancel")
            return cancelTicket(interaction);
        if (action === "close")
            return closeTicket(interaction);
    }
    if (scope === "review")
        return reviewSlip(interaction, id, action);
    if (!await assertAdmin(interaction))
        return;
    if (scope === "setup") {
        if (action === "home") {
            // Back to Dashboard - creates NEW dashboard embed (not editing)
            return showDashboard(interaction);
        }
        if (action === "modal")
            return openModal(interaction, id);
        if (action === "preview" && id === "shop") {
            // Preview shop - creates new ephemeral embed showing shop appearance
            const { shopEmbed } = await import("../utils/discord.js");
            return interaction.reply({ embeds: [await shopEmbed(interaction.guildId)], ephemeral: true });
        }
        if (action === "preview" && id === "dashboard") {
            // Preview dashboard - creates new ephemeral embed showing back office dashboard appearance
            return showDashboard(interaction);
        }
        if (action === "refresh") {
            if (id === "dashboard") {
                // Refresh Summary - updates the SAME dashboard message (not creating new one)
                return refreshDashboard(interaction);
            }
            if (id === "shop") {
                return refreshShopMessage(interaction);
            }
        }
    }
    if (scope === "category") {
        const categories = await categoryRepository.list(interaction.guildId);
        if (action === "create")
            return openCategoryModal(interaction);
        if (["edit", "delete", "visibility", "sort"].includes(action) && id === "pick") {
            if (!categories.length)
                return interaction.reply({ content: "○ ยังไม่มีหมวดหมู่", ephemeral: true });
            return interaction.reply({ content: "◆ เลือกหมวดหมู่ที่ต้องการจัดการ", components: [categoryManagerMenu(categories, action)], ephemeral: true });
        }
        if (action === "move") {
            const category = await categoryRepository.find(id);
            if (!category)
                return interaction.reply({ content: "○ ไม่พบหมวดหมู่", ephemeral: true });
            const ordered = categories.sort((a, b) => a.position - b.position);
            const currentIndex = ordered.findIndex((item) => item.id === category.id);
            const otherIndex = extra === "up" ? currentIndex - 1 : currentIndex + 1;
            if (otherIndex < 0 || otherIndex >= ordered.length)
                return interaction.reply({ content: "○ ไม่สามารถเลื่อนต่อได้", ephemeral: true });
            const other = ordered[otherIndex];
            [category.position, other.position] = [other.position, category.position];
            await Promise.all([categoryRepository.save(category), categoryRepository.save(other)]);
            return interaction.reply({ content: "✔ อัปเดตลำดับหมวดหมู่แล้ว", ephemeral: true });
        }
    }
    if (scope === "product") {
        const products = await productRepository.list(interaction.guildId);
        if (action === "create" && id === "pick") {
            const categories = await categoryRepository.list(interaction.guildId);
            if (!categories.length)
                return interaction.reply({ content: "○ สร้างหมวดหมู่ก่อนเพิ่มสินค้า", ephemeral: true });
            return interaction.reply({ content: "◆ เลือกหมวดหมู่สำหรับสินค้าใหม่", components: [productCategoryMenu(categories)], ephemeral: true });
        }
        if (["edit", "delete", "visibility"].includes(action) && id === "pick") {
            if (!products.length)
                return interaction.reply({ content: "○ ยังไม่มีสินค้า", ephemeral: true });
            return interaction.reply({ content: "◆ เลือกสินค้าที่ต้องการจัดการ", components: [productManagerMenu(products, action)], ephemeral: true });
        }
    }
    if (scope === "stock") {
        if (!await assertAdmin(interaction))
            return;
        if (action === "history" && id) {
            const product = await productRepository.find(id);
            if (!product)
                return interaction.reply({ content: "○ ไม่พบสินค้า", ephemeral: true });
            const transactions = await stockRepository.getTransactionHistory(id, 25);
            const embed = await premiumEmbed(interaction.guildId, `STOCK HISTORY • ${product.name}`, transactions.length > 0
                ? ["*รายการเคลื่อนไหวล่าสุด*", "", DIVIDER, ...transactions.map((t) => `▸ **${t.type}**  \`${t.previousStock}\` → \`${t.newStock}\`  (${t.quantity > 0 ? "+" : ""}${t.quantity})`)].join("\n")
                : "○ ยังไม่มีประวัติการเคลื่อนไหว");
            embed.setFooter({ text: `คงเหลือปัจจุบัน: ${formatStock(product.stock)}` });
            return interaction.reply({
                embeds: [embed],
                components: transactions.length > 0
                    ? [stockActionButtons(id), new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("setup:home").setLabel("กลับ").setStyle(ButtonStyle.Secondary).setEmoji("🔙"))]
                    : [],
                ephemeral: true
            });
        }
    }
}
async function refreshShopMessage(interaction) {
    if (!interaction.guildId || !interaction.guild)
        return;
    const settings = await settingsRepository.get(interaction.guildId);
    const publishedMessageId = settings.shop.publishedMessageId;
    const publishedChannelId = settings.shop.publishedChannelId;
    console.log("DEBUG refreshShopMessage:", { publishedMessageId, publishedChannelId, guildId: interaction.guildId });
    if (!publishedMessageId || !publishedChannelId) {
        await interaction.reply({ content: "○ ยังไม่พบหน้าร้านที่เผยแพร่  •  ใช้ `/shop` ก่อน", ephemeral: true });
        return;
    }
    try {
        const channel = await interaction.guild.channels.fetch(publishedChannelId).catch(() => null);
        console.log("DEBUG channel fetch:", channel ? channel.id : "null");
        if (!channel?.isTextBased()) {
            await interaction.reply({ content: "○ ไม่พบช่องหน้าร้านที่เผยแพร่", ephemeral: true });
            return;
        }
        const message = await channel.messages.fetch(publishedMessageId);
        console.log("DEBUG message fetch:", message.id);
        const categories = await categoryRepository.list(interaction.guildId, false);
        const buttonRows = shopButtons(settings.shop, false, categories);
        await message.edit({ embeds: [await shopEmbed(interaction.guildId)], components: buttonRows });
        await interaction.reply({ content: "✔ อัปเดตหน้าร้านแล้ว", ephemeral: true });
    }
    catch (error) {
        console.log("DEBUG error in refreshShopMessage:", error);
        // Check if the error is Discord API error 10008 (Unknown Message)
        const isUnknownMessageError = error instanceof DiscordAPIError &&
            error.code === 10008;
        if (isUnknownMessageError) {
            await interaction.reply({
                content: "○ ไม่พบข้อความหน้าร้าน  •  กรุณาเผยแพร่อีกครั้ง",
                ephemeral: true
            });
            return;
        }
        console.error("Error refreshing shop message:", error);
        await interaction.reply({ content: "○ ไม่สามารถอัปเดตหน้าร้านได้  •  กรุณาลองอีกครั้ง", ephemeral: true });
    }
}
async function refreshDashboard(interaction) {
    if (!interaction.guildId || !interaction.message)
        return;
    try {
        // Re-fetch fresh data and update the SAME dashboard message
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
            `${compactMetricCard("◈", "Categories", formatNumber(categories.length))}  ${compactMetricCard("◈", "Products", formatNumber(products.length))}`,
            `${compactMetricCard("◈", "Total Stock", totalStock < 0 ? "Unlimited" : formatNumber(totalStock))}  ${compactMetricCard("◈", "Available", products.filter(p => p.stock !== 0).length.toString())}`,
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
        const baseEmbed = await premiumEmbed(interaction.guildId, "⟡ DASHBOARD", description);
        const components = [dashboardMenu(), refreshButtons(settings.shop.publishedMessageId)];
        await interaction.update({ embeds: [baseEmbed], components });
        // Show small ephemeral confirmation message (like Update Shop)
        await interaction.followUp({ content: "✓ สรุป refreshed แล้ว", ephemeral: true });
    }
    catch (error) {
        console.error("Error refreshing dashboard:", error);
        await interaction.reply({ content: "○ ไม่สามารถรีเฟรชแดชบอร์ดได้  •  กรุณาลองอีกครั้ง", ephemeral: true });
    }
}
export async function handleCategoryPick(interaction, action) {
    const category = await categoryRepository.find(interaction.values[0]);
    if (!category)
        return interaction.reply({ content: "○ ไม่พบหมวดหมู่", ephemeral: true });
    if (action === "edit")
        return openCategoryModal(interaction, category.id);
    if (action === "delete") {
        const products = await productRepository.list(interaction.guildId);
        if (products.some((product) => product.categoryId === category.id))
            return interaction.reply({ content: "○ ลบไม่ได้  •  ยังมีสินค้าอยู่ในหมวดหมู่นี้", ephemeral: true });
        await categoryRepository.remove(category.id);
        return interaction.update({ content: `✔ ลบหมวดหมู่ **${category.name}** แล้ว`, components: [] });
    }
    if (action === "visibility") {
        category.hidden = !category.hidden;
        await categoryRepository.save(category);
        return interaction.update({ content: `✔ ${category.hidden ? "ซ่อน" : "แสดง"}หมวดหมู่ **${category.name}** แล้ว`, components: [] });
    }
    const embed = await premiumEmbed(interaction.guildId, "CATEGORY ORDER", [`**◆ ${category.name}**`, "", DIVIDER, "▸ ใช้ปุ่มด้านล่างเพื่อปรับตำแหน่ง"].join("\n"));
    return interaction.update({ embeds: [embed], components: [categorySortButtons(category.id)] });
}
export async function handleProductPick(interaction, action) {
    if (action === "create")
        return openProductModal(interaction, interaction.values[0]);
    const product = await productRepository.find(interaction.values[0]);
    if (!product)
        return interaction.reply({ content: "○ ไม่พบสินค้า", ephemeral: true });
    if (action === "edit")
        return openProductModal(interaction, undefined, product);
    if (action === "delete") {
        await productRepository.remove(product.id);
        return interaction.update({ content: `✔ ลบสินค้า **${product.name}** แล้ว`, components: [] });
    }
    product.hidden = !product.hidden;
    product.updatedAt = new Date().toISOString();
    await productRepository.save(product);
    return interaction.update({ content: `✔ ${product.hidden ? "ซ่อน" : "แสดง"}สินค้า **${product.name}** แล้ว`, components: [] });
}
