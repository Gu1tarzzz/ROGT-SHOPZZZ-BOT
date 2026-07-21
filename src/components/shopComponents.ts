import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, type APISelectMenuOption } from "discord.js";
import { BUTTON_STYLES } from "../config/constants.js";
import type { Category, Product, ShopSettings } from "../types.js";
import { formatPrice, formatStock, truncate } from "../utils/formatters.js";

// ═══════════════════════════════════════════════════════════════
// PREMIUM SHOP COMPONENTS - ROGT SHOPZZZ
// Modern • Clean • Professional UI
// ═══════════════════════════════════════════════════════════════

export function shopButtons(shop: ShopSettings, allowRefresh = false): ActionRowBuilder<ButtonBuilder>[] {
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  
  const mainRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("shop:browse").setLabel(shop.buttons.browse).setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("shop:order").setLabel(shop.buttons.order).setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("shop:support").setLabel(shop.buttons.support).setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("shop:info").setLabel(shop.buttons.information).setStyle(ButtonStyle.Secondary)
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

export function categoryMenu(categories: Category[], customId = "shop:category"): ActionRowBuilder<StringSelectMenuBuilder> {
  const options: APISelectMenuOption[] = categories.slice(0, 25).map((category) => ({
    label: truncate(category.name, 100), 
    value: category.id, 
    description: truncate(category.description || "Browse products in this category", 100)
  }));
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(customId)
      .setPlaceholder("Browse categories...")
      .addOptions(options)
  );
}

export function productMenu(products: Product[], customId = "shop:product"): ActionRowBuilder<StringSelectMenuBuilder> {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(customId)
      .setPlaceholder("Select a product...")
      .addOptions(products.slice(0, 25).map((product) => ({
        label: truncate(product.name, 100), 
        value: product.id, 
        description: truncate(`${formatPrice(product.price)} • ${formatStock(product.stock)} available`, 100)
      })))
  );
}

export function productOrderButton(product: Product): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`order:create:${product.id}`)
      .setLabel("Purchase Now")
      .setStyle(BUTTON_STYLES[product.buttonColor])
      .setEmoji(product.emoji || "🛒")
  );
}
