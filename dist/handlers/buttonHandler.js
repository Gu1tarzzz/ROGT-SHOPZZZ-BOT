import { ActionRowBuilder, ButtonBuilder, ButtonStyle, DiscordAPIError } from "discord.js";
import { categoryManagerMenu, categorySortButtons, productCategoryMenu, productManagerMenu, stockActionButtons } from "../components/setupComponents.js";
import { categoryMenu, shopButtons } from "../components/shopComponents.js";
import { categoryRepository, productRepository, settingsRepository, stockRepository } from "../database/repositories.js";
import { openCategoryModal, openModal, openProductModal } from "./modalHandler.js";
import { showDashboard } from "./setupHandler.js";
import { cancelTicket, closeTicket, createOrderTicket, promptSlip, reviewSlip } from "./ticketHandler.js";
import { premiumEmbed, shopEmbed } from "../utils/discord.js";
import { hasAdminAccess } from "../utils/permissions.js";
import { formatStock } from "../utils/formatters.js";
async function assertAdmin(interaction) {
    if (!interaction.guild)
        return false;
    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (await hasAdminAccess(member))
        return true;
    await interaction.reply({ content: "เฉพาะ Owner, Administrator หรือ Staff Role ที่ตั้งค่าไว้เท่านั้น", ephemeral: true });
    return false;
}
export async function handleButton(interaction) {
    if (!interaction.guildId)
        return;
    const [scope, action, id, extra] = interaction.customId.split(":");
    if (scope === "shop") {
        if (action === "browse" || action === "order") {
            const categories = await categoryRepository.list(interaction.guildId, false);
            if (!categories.length)
                return interaction.reply({ content: "ร้านค้ายังไม่มีหมวดหมู่สินค้า", ephemeral: true });
            const embed = await premiumEmbed(interaction.guildId, action === "order" ? "สร้างคำสั่งซื้อ" : "เลือกชมสินค้า", "เลือกหมวดหมู่ แล้วเลือกสินค้าที่ต้องการ");
            return interaction.reply({ embeds: [embed], components: [categoryMenu(categories)], ephemeral: true });
        }
        if (action === "support")
            return createOrderTicket(interaction);
        if (action === "info") {
            const embed = await premiumEmbed(interaction.guildId, "ข้อมูลร้านค้า", "ROGT SHOPZZZ — Realm of Gu1tarzzz\n\nสินค้าทุกรายการจัดการโดยทีมงานผ่านระบบ Marketplace\nหากต้องการความช่วยเหลือ กรุณากดปุ่ม Support");
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
    if (scope === "order" && action === "create") {
        const product = await productRepository.find(id);
        if (!product)
            return interaction.reply({ content: "ไม่พบสินค้านี้", ephemeral: true });
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
        if (action === "home")
            return showDashboard(interaction);
        if (action === "modal")
            return openModal(interaction, id);
        if (action === "refresh") {
            if (id === "dashboard")
                return showDashboard(interaction);
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
                return interaction.reply({ content: "ยังไม่มีหมวดหมู่", ephemeral: true });
            return interaction.reply({ content: "เลือกหมวดหมู่ที่ต้องการจัดการ", components: [categoryManagerMenu(categories, action)], ephemeral: true });
        }
        if (action === "move") {
            const category = await categoryRepository.find(id);
            if (!category)
                return interaction.reply({ content: "ไม่พบหมวดหมู่", ephemeral: true });
            const ordered = categories.sort((a, b) => a.position - b.position);
            const currentIndex = ordered.findIndex((item) => item.id === category.id);
            const otherIndex = extra === "up" ? currentIndex - 1 : currentIndex + 1;
            if (otherIndex < 0 || otherIndex >= ordered.length)
                return interaction.reply({ content: "ไม่สามารถเลื่อนต่อได้", ephemeral: true });
            const other = ordered[otherIndex];
            [category.position, other.position] = [other.position, category.position];
            await Promise.all([categoryRepository.save(category), categoryRepository.save(other)]);
            return interaction.reply({ content: "อัปเดตลำดับหมวดหมู่แล้ว", ephemeral: true });
        }
    }
    if (scope === "product") {
        const products = await productRepository.list(interaction.guildId);
        if (action === "create" && id === "pick") {
            const categories = await categoryRepository.list(interaction.guildId);
            if (!categories.length)
                return interaction.reply({ content: "สร้างหมวดหมู่ก่อนเพิ่มสินค้า", ephemeral: true });
            return interaction.reply({ content: "เลือกหมวดหมู่สำหรับสินค้าใหม่", components: [productCategoryMenu(categories)], ephemeral: true });
        }
        if (["edit", "delete", "visibility"].includes(action) && id === "pick") {
            if (!products.length)
                return interaction.reply({ content: "ยังไม่มีสินค้า", ephemeral: true });
            return interaction.reply({ content: "เลือกสินค้าที่ต้องการจัดการ", components: [productManagerMenu(products, action)], ephemeral: true });
        }
    }
    if (scope === "stock") {
        if (!await assertAdmin(interaction))
            return;
        if (action === "history" && id) {
            const product = await productRepository.find(id);
            if (!product)
                return interaction.reply({ content: "ไม่พบสินค้า", ephemeral: true });
            const transactions = await stockRepository.getTransactionHistory(id, 25);
            const embed = await premiumEmbed(interaction.guildId, `📦 ประวัติสต็อก: ${product.name}`, transactions.length > 0
                ? transactions.map((t) => `• **${t.type}**: \`${t.previousStock}\` → \`${t.newStock}\` (${t.quantity > 0 ? "+" : ""}${t.quantity})`).join("\n")
                : "ยังไม่มีประวัติการทำธุรกรรม");
            embed.setFooter({ text: `คงเหลือปัจจุบัน: ${formatStock(product.stock)}` });
            return interaction.reply({
                embeds: [embed],
                components: transactions.length > 0
                    ? [stockActionButtons(id), new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("setup:home").setLabel("กลับ").setStyle(ButtonStyle.Secondary))]
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
        await interaction.reply({ content: "❌ ยังไม่ได้เผยแพร่หน้าร้าน กรุณาใช้คำสั่ง `/shop` ก่อน", ephemeral: true });
        return;
    }
    try {
        const channel = await interaction.guild.channels.fetch(publishedChannelId).catch(() => null);
        console.log("DEBUG channel fetch:", channel ? channel.id : "null");
        if (!channel?.isTextBased()) {
            await interaction.reply({ content: "❌ ไม่พบช่องที่เผยแพร่หน้าร้าน", ephemeral: true });
            return;
        }
        const message = await channel.messages.fetch(publishedMessageId);
        console.log("DEBUG message fetch:", message.id);
        const buttonRows = shopButtons(settings.shop, false);
        await message.edit({ embeds: [await shopEmbed(interaction.guildId)], components: buttonRows });
        await interaction.reply({ content: "✅ Shop refreshed successfully.", ephemeral: true });
    }
    catch (error) {
        console.log("DEBUG error in refreshShopMessage:", error);
        // Check if the error is Discord API error 10008 (Unknown Message)
        const isUnknownMessageError = error instanceof DiscordAPIError &&
            error.code === 10008;
        if (isUnknownMessageError) {
            await interaction.reply({
                content: "Published shop message was not found. Please publish the shop again.",
                ephemeral: true
            });
            return;
        }
        console.error("Error refreshing shop message:", error);
        await interaction.reply({ content: "❌ เกิดข้อผิดพลาดในการรีเฟรชหน้าร้าน กรุณาลองใหม่อีกครั้ง", ephemeral: true });
    }
}
export async function handleCategoryPick(interaction, action) {
    const category = await categoryRepository.find(interaction.values[0]);
    if (!category)
        return interaction.reply({ content: "ไม่พบหมวดหมู่", ephemeral: true });
    if (action === "edit")
        return openCategoryModal(interaction, category.id);
    if (action === "delete") {
        const products = await productRepository.list(interaction.guildId);
        if (products.some((product) => product.categoryId === category.id))
            return interaction.reply({ content: "ลบไม่ได้: ยังมีสินค้าอยู่ในหมวดหมู่นี้", ephemeral: true });
        await categoryRepository.remove(category.id);
        return interaction.update({ content: `ลบหมวดหมู่ **${category.name}** แล้ว`, components: [] });
    }
    if (action === "visibility") {
        category.hidden = !category.hidden;
        await categoryRepository.save(category);
        return interaction.update({ content: `${category.hidden ? "ซ่อน" : "แสดง"}หมวดหมู่ **${category.name}** แล้ว`, components: [] });
    }
    const embed = await premiumEmbed(interaction.guildId, "เรียงลำดับหมวดหมู่", `กำลังจัดตำแหน่ง **${category.name}**\nใช้ปุ่มเพื่อเลื่อนหมวดหมู่นี้`);
    return interaction.update({ embeds: [embed], components: [categorySortButtons(category.id)] });
}
export async function handleProductPick(interaction, action) {
    if (action === "create")
        return openProductModal(interaction, interaction.values[0]);
    const product = await productRepository.find(interaction.values[0]);
    if (!product)
        return interaction.reply({ content: "ไม่พบสินค้า", ephemeral: true });
    if (action === "edit")
        return openProductModal(interaction, undefined, product);
    if (action === "delete") {
        await productRepository.remove(product.id);
        return interaction.update({ content: `ลบสินค้า **${product.name}** แล้ว`, components: [] });
    }
    product.hidden = !product.hidden;
    product.updatedAt = new Date().toISOString();
    await productRepository.save(product);
    return interaction.update({ content: `${product.hidden ? "ซ่อน" : "แสดง"}สินค้า **${product.name}** แล้ว`, components: [] });
}
