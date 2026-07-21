import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, type APISelectMenuOption, type APIMessageComponentEmoji } from "discord.js";
import { BUTTON_STYLES } from "../config/constants.js";
import type { Category, Product, ShopSettings } from "../types.js";
import { formatPrice, formatStock, truncate } from "../utils/formatters.js";

// ╭──────────────────────────────────────────────────────────────╮
// │  PREMIUM SHOP COMPONENTS - ROGT SHOPZZZ                     │
// │  Style: Luxury • Fantasy • Minimal • Dark                   │
// │  Reference: Dapex Boost, Mickey Boost, Steam Store          │
// ╰──────────────────────────────────────────────────────────────╯

export function shopButtons(shop: ShopSettings, allowRefresh = false): ActionRowBuilder<ButtonBuilder>[] {
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  
  const mainRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("shop:browse").setLabel("Browse").setStyle(ButtonStyle.Primary).setEmoji("🛒"),
    new ButtonBuilder().setCustomId("shop:order").setLabel("Orders").setStyle(ButtonStyle.Success).setEmoji("📦"),
    new ButtonBuilder().setCustomId("shop:support").setLabel("Support").setStyle(ButtonStyle.Secondary).setEmoji("🎫"),
    new ButtonBuilder().setCustomId("shop:info").setLabel("Info").setStyle(ButtonStyle.Secondary).setEmoji("ℹ️")
  );
  rows.push(mainRow);
  
  return rows;
}

export function shopAdminButtons(hasLiveShop: boolean = false): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("shop:preview").setLabel("Preview").setStyle(ButtonStyle.Primary).setEmoji("👁️"),
    new ButtonBuilder().setCustomId("shop:publish").setLabel("Publish").setStyle(ButtonStyle.Success).setEmoji("📤"),
    new ButtonBuilder().setCustomId("shop:appearance").setLabel("Appearance").setStyle(ButtonStyle.Secondary).setEmoji("🏪")
  );
}

function parseEmoji(emojiStr: string): APIMessageComponentEmoji | undefined {
  if (!emojiStr) return undefined;
  return { name: emojiStr };
}

export function categoryMenu(categories: Category[], customId = "shop:category"): ActionRowBuilder<StringSelectMenuBuilder> {
  const options: APISelectMenuOption[] = categories.slice(0, 25).map((category) => ({
    label: truncate(category.name, 100), 
    value: category.id, 
    description: truncate(category.description || "View products", 100),
    emoji: parseEmoji(category.emoji || "📂")
  }));
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(customId)
      .setPlaceholder("✦ Select Category")
      .addOptions(options)
  );
}

export function productMenu(products: Product[], customId = "shop:product"): ActionRowBuilder<StringSelectMenuBuilder> {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(customId)
      .setPlaceholder("✦ Select Product")
      .addOptions(products.slice(0, 25).map((product) => {
        const stockStatus = product.stock > 0 
          ? `● ${product.stock} left` 
          : "○ Out of Stock";
        return {
          label: truncate(product.name, 100), 
          value: product.id, 
          description: truncate(`${formatPrice(product.price)} • ${stockStatus}`, 100),
          emoji: parseEmoji(product.emoji || "📦")
        };
      }))
  );
}

export function productOrderButton(product: Product): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`order:create:${product.id}`)
      .setLabel("Confirm Order")
      .setStyle(BUTTON_STYLES[product.buttonColor])
      .setEmoji("💳")
  );
}
