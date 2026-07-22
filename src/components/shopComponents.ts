import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, type APISelectMenuOption } from "discord.js";
import { BUTTON_STYLES, UI_EMOJI } from "../config/constants.js";
import type { Category, Product, ShopSettings } from "../types.js";
import { formatPrice, formatStock, truncate } from "../utils/formatters.js";

// ╭──────────────────────────────────────────────────────────────╮
// │  PREMIUM SHOP COMPONENTS - ROGT SHOPZZZ                     │
// │  Style: Luxury • Fantasy • Minimal • Dark                   │
// │  Reference: Discord Marketplace UI                          │
// ╰──────────────────────────────────────────────────────────────╯

/**
 * Safely resolves an emoji for select menu options.
 * Returns undefined if invalid, otherwise a valid emoji string or object.
 */
function resolveEmoji(value: string | undefined, fallback: string): string | { id: string; name: string; animated?: boolean } | undefined {
  const candidate = value?.trim();
  if (!candidate) return undefined;
  
  // Check for custom emoji: <a:name:id> or <:name:id>
  const customMatch = candidate.match(/^<(a?):([\w-]+):(\d+)>$/);
  if (customMatch) {
    return { id: customMatch[3], name: customMatch[2], animated: customMatch[1] === "a" };
  }
  
  // Check for valid Unicode emoji
  const unicodeEmoji = /^(?:\p{Extended_Pictographic}|\p{Emoji_Presentation})(?:\uFE0F|\u200D|\p{Extended_Pictographic}|\p{Emoji_Presentation}|\p{Emoji_Modifier})*$/u;
  if (unicodeEmoji.test(candidate)) {
    return candidate;
  }
  
  // Fallback to default Unicode emoji
  return fallback;
}

/**
 * Main shop components: Category Select Menu + Three Utility Buttons
 * Used on the permanent Main Shop Embed message
 */
export function shopButtons(shop: ShopSettings, allowRefresh = false, categories: Category[] = []): (ActionRowBuilder<ButtonBuilder> | ActionRowBuilder<StringSelectMenuBuilder>)[] {
  const rows: (ActionRowBuilder<ButtonBuilder> | ActionRowBuilder<StringSelectMenuBuilder>)[] = [];
  
  // Single category select menu row
  if (categories.length) rows.push(categoryMenu(categories));
  
  // Three utility buttons: Top Up / Credit / History
  const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("shop:topup").setLabel("เติมเครดิต").setStyle(ButtonStyle.Primary).setEmoji("🪙"),
    new ButtonBuilder().setCustomId("shop:credit").setLabel("ตรวจสอบเครดิต").setStyle(ButtonStyle.Secondary).setEmoji("💎"),
    new ButtonBuilder().setCustomId("shop:history").setLabel("ประวัติการซื้อ").setStyle(ButtonStyle.Secondary).setEmoji("📜")
  );
  rows.push(actionRow);
  
  return rows;
}

/**
 * Category select menu for the Main Shop Embed
 */
export function categoryMenu(categories: Category[], customId = "shop:category"): ActionRowBuilder<StringSelectMenuBuilder> {
  const options: APISelectMenuOption[] = categories.slice(0, 25).map((category) => {
    const emoji = resolveEmoji(category.emoji, UI_EMOJI.component.category);
    const option: APISelectMenuOption = {
      label: truncate(category.name, 100), 
      value: category.id, 
      description: truncate(category.description || "เลือกเพื่อดูสินค้า", 100)
    };
    if (emoji) option.emoji = emoji as never;
    return option;
  });
  
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(customId)
      .setPlaceholder(`${UI_EMOJI.component.catalog} เลือกหมวดหมู่สินค้า`)
      .addOptions(options)
  );
}

/**
 * Product browser components for ephemeral Product Browser message
 * Contains: Product Select Menu + Product List with Price/Stock
 */
export function productBrowserComponents(products: Product[]): (ActionRowBuilder<StringSelectMenuBuilder> | ActionRowBuilder<ButtonBuilder>)[] {
  const rows: (ActionRowBuilder<StringSelectMenuBuilder> | ActionRowBuilder<ButtonBuilder>)[] = [];
  
  // Product select menu
  if (products.length) {
    rows.push(productMenu(products));
  }
  
  return rows;
}

/**
 * Product select menu for Product Browser
 */
export function productMenu(products: Product[], customId = "shop:product"): ActionRowBuilder<StringSelectMenuBuilder> {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(customId)
      .setPlaceholder(`${UI_EMOJI.component.product} เลือกสินค้า`)
      .addOptions(products.slice(0, 25).map((product) => {
        const stockStatus = product.stock < 0
          ? `${UI_EMOJI.text.active} พร้อมจำหน่าย`
          : product.stock > 0
            ? `${UI_EMOJI.text.active} คงเหลือ ${formatStock(product.stock)}`
            : `${UI_EMOJI.text.inactive} สินค้าหมด`;
        const emoji = resolveEmoji(product.emoji, UI_EMOJI.component.product);
        const option: APISelectMenuOption = {
          label: truncate(product.name, 100), 
          value: product.id, 
          description: truncate(`${formatPrice(product.price)} • ${stockStatus}`, 100)
        };
        if (emoji) option.emoji = emoji as never;
        return option;
      }))
  );
}

/**
 * Purchase button for Product Preview ephemeral
 */
export function purchaseButton(product: Product): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`purchase:${product.id}`)
      .setLabel("ซื้อสินค้า")
      .setStyle(BUTTON_STYLES[product.buttonColor])
      .setEmoji(UI_EMOJI.component.browse)
  );
}

/**
 * Checkout confirmation buttons (Confirm / Cancel)
 */
export function checkoutButtons(productId: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`checkout:confirm:${productId}`).setLabel("ยืนยันการซื้อ").setStyle(ButtonStyle.Success).setEmoji("✅"),
    new ButtonBuilder().setCustomId(`checkout:cancel:${productId}`).setLabel("ยกเลิก").setStyle(ButtonStyle.Danger).setEmoji("❌")
  );
}

export function shopAdminButtons(hasLiveShop: boolean = false): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("shop:preview").setLabel("ดูตัวอย่าง").setStyle(ButtonStyle.Primary).setEmoji(UI_EMOJI.component.catalog),
    new ButtonBuilder().setCustomId("shop:publish").setLabel("เผยแพร่").setStyle(ButtonStyle.Success).setEmoji(UI_EMOJI.component.star),
    new ButtonBuilder().setCustomId("shop:appearance").setLabel("ดีไซน์ร้าน").setStyle(ButtonStyle.Secondary).setEmoji(UI_EMOJI.component.gem)
  );
}
