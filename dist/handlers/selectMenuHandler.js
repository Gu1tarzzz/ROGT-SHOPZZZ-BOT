import { purchaseButton, productBrowserComponents } from "../components/shopComponents.js";
import { categoryRepository, productRepository, settingsRepository } from "../database/repositories.js";
import { premiumEmbed, compactMetricCard, premiumMetricBlock, statusIndicator } from "../utils/discord.js";
import { formatPrice, formatStock, formatNumber } from "../utils/formatters.js";
import { hasAdminAccess } from "../utils/permissions.js";
import { DIVIDER, UI_EMOJI } from "../config/constants.js";
import { showSetupSection } from "./setupHandler.js";
async function admin(interaction) {
    if (!interaction.guild)
        return false;
    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (await hasAdminAccess(member))
        return true;
    await interaction.reply({ content: "○ คุณไม่มีสิทธิ์เข้าถึง Admin Panel", ephemeral: true });
    return false;
}
/**
 * Builds the permanent Main Shop Embed that should NEVER be edited during browsing.
 * Contains ONLY: Store Name, Subtitle, Store Statistics, Payment Methods, Store Features, Banner
 */
async function buildMainShopEmbed(guildId) {
    const settings = await settingsRepository.get(guildId);
    const categories = await categoryRepository.list(guildId, false);
    const products = await productRepository.list(guildId, false);
    let totalStock = 0;
    for (const product of products) {
        if (product.stock < 0) {
            totalStock = -1;
            break;
        }
        totalStock += product.stock;
    }
    const features = settings.shop.marketplaceFeatures?.length
        ? settings.shop.marketplaceFeatures.slice(0, 4)
        : ["จัดส่งรวดเร็ว", "ชำระเงินปลอดภัย", "ดูแลโดยทีมงาน"];
    const availableProducts = products.filter((product) => product.stock !== 0).length;
    // Premium storefront layout matching reference image with compact 2x2 metric cards
    const description = [
        `**${UI_EMOJI.text.brand} ${settings.shop.storeName}**`,
        `${settings.shop.description || "Premium marketplace"}`,
        "",
        statusIndicator(settings.shop.status),
        "",
        DIVIDER,
        "",
        `**${UI_EMOJI.text.section} Store Statistics**`,
        "",
        `${compactMetricCard("📦", "Products", formatNumber(products.length))}  ${compactMetricCard("📁", "Categories", formatNumber(categories.length))}`,
        `${compactMetricCard("✨", "Available", formatNumber(availableProducts))}  ${compactMetricCard("💎", "Total Stock", totalStock < 0 ? "Unlimited" : formatNumber(totalStock))}`,
        "",
        DIVIDER,
        "",
        `**${UI_EMOJI.text.section} Payment Methods**`,
        "> 💳 `PromptPay` • `TrueMoney` • `Bank Transfer`",
        "",
        DIVIDER,
        "",
        `**${UI_EMOJI.text.section} Store Features**`,
        features.map((f) => `${UI_EMOJI.text.bullet} ${f}`).join("\n"),
        "",
        DIVIDER,
        "เลือกหมวดหมู่จากเมนูด้านล่างเพื่อดูสินค้า"
    ].join("\n");
    const embed = await premiumEmbed(guildId, settings.shop.storeName, description);
    // Large banner image (priority: GIF > static)
    if (settings.shop.bannerGif) {
        embed.setImage(settings.shop.bannerGif);
    }
    else if (settings.shop.banner) {
        embed.setImage(settings.shop.banner);
    }
    // Thumbnail for branding
    if (settings.shop.thumbnail) {
        embed.setThumbnail(settings.shop.thumbnail);
    }
    return embed;
}
/**
 * Builds the ephemeral Product Browser shown when a category is selected.
 * Contains: Product Select Menu, Product List with Price and Stock
 */
async function buildProductBrowserEmbed(guildId, categoryName, products) {
    const description = [
        `**${UI_EMOJI.text.section} ${categoryName}**`,
        "",
        DIVIDER,
        "",
        `${UI_EMOJI.text.bullet} สินค้าทั้งหมด **${products.length}** รายการ`,
        "",
        ...products.slice(0, 10).map((p, i) => `**${i + 1}. ${p.name}**\n   ${formatPrice(p.price)} • ${p.stock < 0 ? "ไม่จำกัด" : `สต็อก ${p.stock}`}`),
        products.length > 10 ? `\n${UI_EMOJI.text.bullet} และอีก ${products.length - 10} รายการ...` : ""
    ].filter(line => line !== "").join("\n");
    return premiumEmbed(guildId, "🛍️ PRODUCT BROWSER", description);
}
/**
 * Builds the ephemeral Product Preview shown when a product is selected.
 * Contains: Product Image, Product Name, Description, Price, Stock, Purchase Button
 */
async function buildProductPreviewEmbed(guildId, product) {
    const stockStatus = product.stock < 0 ? "ไม่จำกัด" : formatStock(product.stock);
    const description = [
        `**${UI_EMOJI.text.section} ${product.name}**`,
        "",
        `*${product.description || "ไม่มีรายละเอียด"}*`,
        "",
        DIVIDER,
        "",
        premiumMetricBlock("💰", "Price", formatPrice(product.price)),
        premiumMetricBlock("📦", "Stock", stockStatus),
        product.requiredRoleId ? premiumMetricBlock("🎭", "Role", `<@&${product.requiredRoleId}>`) : "",
        "",
        DIVIDER,
        `${UI_EMOJI.text.bullet} กดปุ่มด้านล่างเพื่อสั่งซื้อ`
    ].filter(line => line !== "").join("\n");
    const embed = await premiumEmbed(guildId, product.name, description);
    // Add image if available
    if (product.imageUrl) {
        embed.setImage(product.imageUrl);
    }
    return embed;
}
/**
 * Builds the ephemeral Checkout Embed shown when Purchase is clicked.
 * Contains: Product, Quantity, Payment Method, Confirm, Cancel
 */
async function buildCheckoutEmbed(guildId, product) {
    const description = [
        `**${UI_EMOJI.text.section} คำสั่งซื้อ**`,
        "",
        DIVIDER,
        "",
        premiumMetricBlock("🛒", "Product", product.name),
        premiumMetricBlock("💰", "Price", formatPrice(product.price)),
        premiumMetricBlock("🔢", "Quantity", "1"),
        "",
        `**${UI_EMOJI.text.section} ช่องทางชำระเงิน**`,
        "> 💳 `PromptPay` • `TrueMoney` • `Bank Transfer`",
        "",
        DIVIDER,
        `${UI_EMOJI.text.bullet} ยืนยันการสั่งซื้อหรือยกเลิก`
    ].join("\n");
    return premiumEmbed(guildId, "📦 CONFIRM ORDER", description);
}
export async function handleSelectMenu(interaction) {
    if (!interaction.guildId)
        return;
    const [scope, action, extra] = interaction.customId.split(":");
    if (scope === "shop") {
        if (action === "category") {
            const categoryId = interaction.values[0];
            const category = await categoryRepository.find(categoryId);
            if (!category) {
                return interaction.reply({
                    content: "○ ไม่พบหมวดหมู่นี้",
                    ephemeral: true
                });
            }
            // Get products in this category
            const allProducts = await productRepository.list(interaction.guildId, false);
            const products = allProducts.filter((p) => p.categoryId === categoryId && p.stock !== 0 && !p.hidden);
            if (!products.length) {
                return interaction.reply({
                    content: "○ ไม่มีสินค้าในหมวดหมู่นี้",
                    ephemeral: true
                });
            }
            // Create NEW EPHEMERAL Product Browser
            const productBrowserEmbed = await buildProductBrowserEmbed(interaction.guildId, category.name, products);
            return interaction.reply({
                embeds: [productBrowserEmbed],
                components: productBrowserComponents(products),
                ephemeral: true
            });
        }
        if (action === "product") {
            const product = await productRepository.find(interaction.values[0]);
            if (!product || product.hidden || product.status !== "active") {
                return interaction.reply({
                    content: "○ สินค้านี้ไม่พร้อมจำหน่าย",
                    ephemeral: true
                });
            }
            // Create NEW EPHEMERAL Product Preview
            const productPreviewEmbed = await buildProductPreviewEmbed(interaction.guildId, product);
            return interaction.reply({
                embeds: [productPreviewEmbed],
                components: [purchaseButton(product)],
                ephemeral: true
            });
        }
        // Handle utility buttons - show only ephemeral replies
        if (action === "topup") {
            const embed = await premiumEmbed(interaction.guildId, "🪙 TOP UP CREDIT", [
                "*เติมเครดิตเพื่อซื้อสินค้า*",
                "",
                DIVIDER,
                `${UI_EMOJI.text.bullet} ติดต่อทีมงานเพื่อเติมเครดิต`,
                `${UI_EMOJI.text.bullet} หรือใช้คำสั่งซื้อเพื่อชำระเงิน`
            ].join("\n"));
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        if (action === "credit") {
            const embed = await premiumEmbed(interaction.guildId, "💎 CHECK CREDIT", [
                "*ตรวจสอบยอดเครดิตของคุณ*",
                "",
                DIVIDER,
                `${UI_EMOJI.text.bullet} ระบบเครดิตกำลังพัฒนา`,
                `${UI_EMOJI.text.bullet} ติดต่อทีมงานสำหรับข้อมูลเพิ่มเติม`
            ].join("\n"));
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        if (action === "history") {
            const embed = await premiumEmbed(interaction.guildId, "📜 PURCHASE HISTORY", [
                "*ประวัติการสั่งซื้อของคุณ*",
                "",
                DIVIDER,
                `${UI_EMOJI.text.bullet} ระบบประวัติการซื้อกำลังพัฒนา`,
                `${UI_EMOJI.text.bullet} ติดต่อทีมงานสำหรับข้อมูลเพิ่มเติม`
            ].join("\n"));
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
    if (scope === "purchase") {
        const product = await productRepository.find(action);
        if (!product || product.hidden || product.status !== "active") {
            return interaction.reply({
                content: "○ สินค้านี้ไม่พร้อมจำหน่าย",
                ephemeral: true
            });
        }
        // Create NEW EPHEMERAL Checkout Embed
        const checkoutEmbed = await buildCheckoutEmbed(interaction.guildId, product);
        return interaction.reply({
            embeds: [checkoutEmbed],
            components: [],
            ephemeral: true
        });
    }
    if (scope === "checkout") {
        if (action === "confirm") {
            const product = await productRepository.find(extra);
            if (!product)
                return interaction.reply({ content: "○ ไม่พบสินค้า", ephemeral: true });
            // TODO: Implement actual purchase logic here
            return interaction.reply({
                content: "✔ คำสั่งซื้อของคุณถูกสร้างแล้ว  •  ทีมงานจะติดต่อคุณเร็วๆ นี้",
                ephemeral: true
            });
        }
        if (action === "cancel") {
            return interaction.update({
                content: "○ ยกเลิกการสั่งซื้อแล้ว",
                embeds: [],
                components: []
            });
        }
    }
    if (!(await admin(interaction)))
        return;
    if (scope === "setup" && action === "section")
        return showSetupSection(interaction, interaction.values[0]);
}
