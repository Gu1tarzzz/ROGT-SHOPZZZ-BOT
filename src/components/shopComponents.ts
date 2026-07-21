import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, type APISelectMenuOption, type APIMessageComponentEmoji } from "discord.js";
import { BUTTON_STYLES } from "../config/constants.js";
import type { Category, Product, ShopSettings } from "../types.js";
import { formatPrice, formatStock, truncate } from "../utils/formatters.js";

// ═══════════════════════════════════════════════════════════════
// PREMIUM SHOP COMPONENTS - ROGT SHOPZZZ
// Fantasy • Magic • Luxury • Minimal Design
// Inspired by: Steam Store, Riot Games, Epic Games Store
// ═══════════════════════════════════════════════════════════════

export function shopButtons(shop: ShopSettings, allowRefresh = false): ActionRowBuilder<ButtonBuilder>[] {
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  
  const mainRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("shop:browse").setLabel(shop.buttons.browse).setStyle(ButtonStyle.Primary).setEmoji("🛒"),
    new ButtonBuilder().setCustomId("shop:order").setLabel(shop.buttons.order).setStyle(ButtonStyle.Success).setEmoji("📦"),
    new ButtonBuilder().setCustomId("shop:support").setLabel(shop.buttons.support).setStyle(ButtonStyle.Secondary).setEmoji("🎫"),
    new ButtonBuilder().setCustomId("shop:info").setLabel(shop.buttons.information).setStyle(ButtonStyle.Secondary).setEmoji("ℹ️")
  );
  rows.push(mainRow);
  
  return rows;
}

export function shopAdminButtons(hasLiveShop: boolean = false): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("shop:preview").setLabel("Preview").setStyle(ButtonStyle.Primary).setEmoji("👁️"),
    new ButtonBuilder().setCustomId("shop:publish").setLabel("Publish Shop").setStyle(ButtonStyle.Success).setEmoji("📤"),
    new ButtonBuilder().setCustomId("shop:appearance").setLabel("Appearance").setStyle(ButtonStyle.Secondary).setEmoji("🏪")
  );
}

function parseEmoji(emojiStr: string): APIMessageComponentEmoji | undefined {
  // Simple emoji parser - Discord.js handles most emojis as just the unicode character
  if (!emojiStr) return undefined;
  // For unicode emojis, we just need to return the emoji object
  return { name: emojiStr };
}

export function categoryMenu(categories: Category[], customId = "shop:category"): ActionRowBuilder<StringSelectMenuBuilder> {
  const options: APISelectMenuOption[] = categories.slice(0, 25).map((category) => ({
    label: truncate(category.name, 100), 
    value: category.id, 
    description: truncate(category.description || "Browse products in this category", 100),
    emoji: parseEmoji(category.emoji || "📂")
  }));
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(customId)
      .setPlaceholder("✨ Select a category...")
      .addOptions(options)
  );
}

export function productMenu(products: Product[], customId = "shop:product"): ActionRowBuilder<StringSelectMenuBuilder> {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(customId)
      .setPlaceholder("💎 Select a product...")
      .addOptions(products.slice(0, 25).map((product) => ({
        label: truncate(product.name, 100), 
        value: product.id, 
        description: truncate(`${formatPrice(product.price)} • ${formatStock(product.stock)} available`, 100),
        emoji: parseEmoji(product.emoji || "📦")
      })))
  );
}

export function productOrderButton(product: Product): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`order:create:${product.id}`)
      .setLabel("Purchase Now")
      .setStyle(BUTTON_STYLES[product.buttonColor])
      .setEmoji(product.emoji || "💳")
  );
}
