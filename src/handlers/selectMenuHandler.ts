import type { StringSelectMenuInteraction } from "discord.js";
import { categoryMenu, productMenu, purchaseButton, productBrowserComponents } from "../components/shopComponents.js";
import { categoryRepository, productRepository, settingsRepository } from "../database/repositories.js";
import { premiumEmbed } from "../utils/discord.js";
import { formatPrice, formatStock } from "../utils/formatters.js";
import { hasAdminAccess } from "../utils/permissions.js";
import { DIVIDER, SMALL_DIVIDER, UI_EMOJI } from "../config/constants.js";
import { showSetupSection } from "./setupHandler.js";

async function admin(interaction: StringSelectMenuInteraction): Promise<boolean> {
  if (!interaction.guild) return false;
  const member = await interaction.guild.members.fetch(interaction.user.id);
  if (await hasAdminAccess(member)) return true;
  await interaction.reply({ content: "○ คุณไม่มีสิทธิ์เข้าถึง Admin Panel", ephemeral: true });
  return false;
}

/**
 * Builds the permanent Main Shop Embed that should NEVER be edited during browsing.
 * Contains ONLY: Store Name, Subtitle, Store Statistics, Payment Methods, Store Features, Banner
 */
async function buildMainShopEmbed(guildId: string) {
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
  
  // Premium storefront layout matching reference image
  const description = [
    `**${UI_EMOJI.text.brand} ${settings.shop.storeName}**`,
    `${settings.shop.description || "Premium marketplace"}`,
    "",
    `${settings.shop.status === "open" ? "🟢" : "🔴"} **${settings.shop.status === "open" ? "เปิดให้บริการ" : "ปิดปรับปรุง"}**`,
    "",
    DIVIDER,
    "",
    "**✦ Store Statistics**",
    "",
    "```┌──────────────┬──────────────┬──────────────┬──────────────┐",
    "│  สินค้า     │  หมวดหมู่   │  พร้อมขาย    │  สต็อก       │",
    "├──────────────┼──────────────┼──────────────┼──────────────┤",
    `│  ${String(products.length).padEnd(10)} │  ${String(categories.length).padEnd(10)} │  ${String(availableProducts).padEnd(10)} │  ${String(totalStock < 0 ? "∞" : totalStock).padEnd(10)} │`,
    "└──────────────┴──────────────┴──────────────┴──────────────┘```",
    "",
    "**✦ Payment Methods**",
    "> 💳 `PromptPay` • `TrueMoney` • `Bank Transfer`",
    "",
    "**✦ Store Features**",
    features.map((f, i) => `${i === 0 ? "▸" : " "} ${f}`).join("\n"),
    "",
    DIVIDER,
    "เลือกหมวดหมู่จากเมนูด้านล่างเพื่อดูสินค้า"
  ].join("\n");
  
  const embed = await premiumEmbed(guildId, settings.shop.storeName, description);
  
  // Large banner image (priority: GIF > static)
  if (settings.shop.bannerGif) {
    embed.setImage(settings.shop.bannerGif);
  } else if (settings.shop.banner) {
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
async function buildProductBrowserEmbed(guildId: string, categoryName: string, products: any[]) {
  const description = [
    `**${UI_EMOJI.component.category} ${categoryName}**`,
    "",
    DIVIDER,
    "",
    `**◆ สินค้าทั้งหมด ${products.length} รายการ**`,
    "",
    ...products.slice(0, 10).map((p, i) => 
      `**${i + 1}. ${p.name}**\n   └ ${formatPrice(p.price)} • ${p.stock < 0 ? "ไม่จำกัด" : `สต็อก ${p.stock}`}`
    ),
    products.length > 10 ? `\n▸ และอีก ${products.length - 10} รายการ...` : ""
  ].filter(line => line !== "").join("\n");
  
  return premiumEmbed(guildId, "📦 PRODUCT BROWSER", description);
}

/**
 * Builds the ephemeral Product Preview shown when a product is selected.
 * Contains: Product Image, Product Name, Description, Price, Stock, Purchase Button
 */
async function buildProductPreviewEmbed(guildId: string, product: any) {
  const stockStatus = product.stock < 0 ? "ไม่จำกัด" : formatStock(product.stock);
  
  const description = [
    `**${UI_EMOJI.component.product} ${product.name}**`,
    "",
    `*${product.description || "ไม่มีรายละเอียด"}*`,
    "",
    DIVIDER,
    "",
    "**◆ รายละเอียดสินค้า**",
    "",
    `\`ราคา\`  **${formatPrice(product.price)}**`,
    `\`สต็อก\`  **${stockStatus}**`,
    product.requiredRoleId ? `\`Role\`  <@&${product.requiredRoleId}>` : "",
    "",
    SMALL_DIVIDER,
    "▸ กดปุ่มด้านล่างเพื่อสั่งซื้อ"
  ].filter(line => line !== "").join("\n");
  
  const embed = await premiumEmbed(guildId, `🛒 ${product.name}`, description);
  
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
async function buildCheckoutEmbed(guildId: string, product: any) {
  const description = [
    `**${UI_EMOJI.component.payment} CHECKOUT**`,
    "",
    DIVIDER,
    "",
    "**◆ คำสั่งซื้อ**",
    "",
    `\`สินค้า\`  **${product.name}**`,
    `\`ราคา\`  **${formatPrice(product.price)}**`,
    `\`จำนวน\`  **1**`,
    "",
    "**◆ ช่องทางชำระเงิน**",
    "💳 PromptPay  •  TrueMoney  •  Bank Transfer",
    "",
    SMALL_DIVIDER,
    "▸ ยืนยันการสั่งซื้อหรือยกเลิก"
  ].join("\n");
  
  return premiumEmbed(guildId, "✅ CONFIRM ORDER", description);
}

export async function handleSelectMenu(interaction: StringSelectMenuInteraction) {
  if (!interaction.guildId) return;
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
        "▸ ติดต่อทีมงานเพื่อเติมเครดิต",
        "▸ หรือใช้คำสั่งซื้อเพื่อชำระเงิน"
      ].join("\n"));
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    
    if (action === "credit") {
      const embed = await premiumEmbed(interaction.guildId, "💎 CHECK CREDIT", [
        "*ตรวจสอบยอดเครดิตของคุณ*",
        "",
        DIVIDER,
        "▸ ระบบเครดิตกำลังพัฒนา",
        "▸ ติดต่อทีมงานสำหรับข้อมูลเพิ่มเติม"
      ].join("\n"));
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    
    if (action === "history") {
      const embed = await premiumEmbed(interaction.guildId, "📜 PURCHASE HISTORY", [
        "*ประวัติการสั่งซื้อของคุณ*",
        "",
        DIVIDER,
        "▸ ระบบประวัติการซื้อกำลังพัฒนา",
        "▸ ติดต่อทีมงานสำหรับข้อมูลเพิ่มเติม"
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
      if (!product) return interaction.reply({ content: "○ ไม่พบสินค้า", ephemeral: true });
      
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
  
  if (!(await admin(interaction))) return;
  if (scope === "setup" && action === "section") return showSetupSection(interaction, interaction.values[0]);
}
