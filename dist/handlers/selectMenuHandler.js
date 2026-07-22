import { productOrderButton, catalogMenu } from "../components/shopComponents.js";
import { categoryRepository, productRepository } from "../database/repositories.js";
import { handleCategoryPick, handleProductPick } from "./buttonHandler.js";
import { showSetupSection } from "./setupHandler.js";
import { premiumEmbed } from "../utils/discord.js";
import { formatPrice, formatStock } from "../utils/formatters.js";
import { hasAdminAccess } from "../utils/permissions.js";
import { DIVIDER } from "../config/constants.js";
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
 * Builds the main shop embed that should always remain visible
 */
async function buildMainShopEmbed(guildId, guildName) {
    const categories = await categoryRepository.list(guildId);
    const products = await productRepository.list(guildId, false);
    const enabledProducts = products.filter(p => p.stock !== 0);
    // Category doesn't have status property, use hidden instead
    const activeCategories = categories.filter(c => !c.hidden);
    const baseEmbed = await premiumEmbed(guildId, `🛒 ${guildName}`, [
        "*Welcome to our premium marketplace.*",
        "*Browse categories below to view products.*",
        "",
        DIVIDER,
        "**◆ Store Statistics**",
        "┌──────────────┬──────────────┬──────────────┬──────────────",
        `│  \`Products\` **${enabledProducts.length}**  │  \`Categories\` **${activeCategories.length}**  │  \`Available\` **${enabledProducts.length}**  │  \`Stock\` **∞**`,
        "└──────────────┴──────────────┴──────────────┴──────────────",
        "",
        "**◆ Payment Methods**",
        "💳 PromptPay  •  TrueMoney  •  Bank Transfer",
        "",
        "**◆ Store Features**",
        "• Instant Delivery  •  Secure Payments  •  24/7 Support"
    ].join("\n"));
    return baseEmbed;
}
/**
 * Builds the product preview embed shown alongside the main shop embed
 */
async function buildProductPreviewEmbed(guildId, product) {
    const stockStatus = product.stock < 0 ? "ไม่จำกัด" : formatStock(product.stock);
    const baseEmbed = await premiumEmbed(guildId, `📦 ${product.name}`, [
        `*${product.description || "No description available."}*`,
        "",
        DIVIDER,
        "**◆ รายละเอียดสินค้า**",
        `\`ราคา\`  **${formatPrice(product.price)}**  •  \`สต็อก\`  **${stockStatus}**`,
        product.requiredRoleId ? `▸ ต้องมี Role <@&${product.requiredRoleId}>` : "▸ พร้อมสำหรับลูกค้าทุกคน"
    ].join("\n"));
    // Add image if available
    if (product.imageUrl) {
        baseEmbed.setImage(product.imageUrl);
    }
    return baseEmbed;
}
export async function handleSelectMenu(interaction) {
    if (!interaction.guildId)
        return;
    const [scope, action, extra] = interaction.customId.split(":");
    if (scope === "shop") {
        // Always build the main shop embed first
        const mainShopEmbed = await buildMainShopEmbed(interaction.guildId, interaction.guild?.name || "Store");
        if (action === "catalog") {
            const value = interaction.values[0];
            // Handle "All Products" or specific category
            if (value === "cat:all") {
                const allProducts = (await productRepository.list(interaction.guildId, false)).filter((product) => product.stock !== 0);
                if (!allProducts.length) {
                    return interaction.update({
                        embeds: [mainShopEmbed],
                        components: [catalogMenu(await categoryRepository.list(interaction.guildId))]
                    });
                }
                // Show first product as preview
                const firstProduct = allProducts[0];
                const productPreviewEmbed = await buildProductPreviewEmbed(interaction.guildId, firstProduct);
                return interaction.update({
                    embeds: [mainShopEmbed, productPreviewEmbed],
                    components: [
                        catalogMenu(await categoryRepository.list(interaction.guildId)),
                        productOrderButton(firstProduct)
                    ]
                });
            }
            // Handle specific category (cat:{categoryId})
            const categoryId = value.replace("cat:", "");
            const category = await categoryRepository.find(categoryId);
            const products = (await productRepository.list(interaction.guildId, false)).filter((product) => product.categoryId === categoryId && (product.stock !== 0));
            if (!products.length) {
                return interaction.update({
                    embeds: [mainShopEmbed],
                    components: [catalogMenu(await categoryRepository.list(interaction.guildId))]
                });
            }
            // Show first product as preview
            const firstProduct = products[0];
            const productPreviewEmbed = await buildProductPreviewEmbed(interaction.guildId, firstProduct);
            return interaction.update({
                embeds: [mainShopEmbed, productPreviewEmbed],
                components: [
                    catalogMenu(await categoryRepository.list(interaction.guildId)),
                    productOrderButton(firstProduct)
                ]
            });
        }
        if (action === "product") {
            const product = await productRepository.find(interaction.values[0]);
            if (!product || product.hidden || product.status !== "active") {
                return interaction.update({
                    embeds: [mainShopEmbed],
                    components: [catalogMenu(await categoryRepository.list(interaction.guildId))]
                });
            }
            // Keep main shop embed, update only product preview
            const productPreviewEmbed = await buildProductPreviewEmbed(interaction.guildId, product);
            return interaction.update({
                embeds: [mainShopEmbed, productPreviewEmbed],
                components: [
                    catalogMenu(await categoryRepository.list(interaction.guildId)),
                    productOrderButton(product)
                ]
            });
        }
        // Handle topup and credit buttons - show only main shop embed in reply
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
    if (!(await admin(interaction)))
        return;
    if (scope === "setup" && action === "section")
        return showSetupSection(interaction, interaction.values[0]);
    if (scope === "category" && action === "pick")
        return handleCategoryPick(interaction, extra);
    if (scope === "product" && action === "pick")
        return handleProductPick(interaction, extra);
}
