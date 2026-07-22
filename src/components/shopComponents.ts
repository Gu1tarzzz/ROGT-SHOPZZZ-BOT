import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, type APISelectMenuOption } from "discord.js";
import { BUTTON_STYLES, UI_EMOJI } from "../config/constants.js";
import type { Category, Product, ShopSettings } from "../types.js";
import { formatPrice, formatStock, truncate } from "../utils/formatters.js";
import { componentEmoji } from "../utils/componentEmoji.js";

// ╭──────────────────────────────────────────────────────────────╮
// │  PREMIUM SHOP COMPONENTS - ROGT SHOPZZZ                     │
// │  Style: Luxury • Fantasy • Minimal • Dark                   │
// │  Reference: Dapex Boost, Mickey Boost, Steam Store          │
// ╰──────────────────────────────────────────────────────────────╯

export function shopButtons(shop: ShopSettings, allowRefresh = false, categories: Category[] = []): ActionRowBuilder<ButtonBuilder>[] {
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  if (categories.length) rows.push(categoryMenu(categories));
  
  const mainRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("shop:browse").setLabel("แคตตาล็อก").setStyle(ButtonStyle.Primary).setEmoji(UI_EMOJI.component.browse),
    new ButtonBuilder().setCustomId("shop:order").setLabel("สร้างคำสั่งซื้อ").setStyle(ButtonStyle.Success).setEmoji(UI_EMOJI.component.product),
    new ButtonBuilder().setCustomId("shop:support").setLabel("ช่วยเหลือ").setStyle(ButtonStyle.Secondary).setEmoji(UI_EMOJI.component.support),
    new ButtonBuilder().setCustomId("shop:info").setLabel("ข้อมูลร้าน").setStyle(ButtonStyle.Secondary).setEmoji(UI_EMOJI.component.star)
  );
  rows.push(mainRow);
  
  return rows;
}

export function shopAdminButtons(hasLiveShop: boolean = false): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("shop:preview").setLabel("ดูตัวอย่าง").setStyle(ButtonStyle.Primary).setEmoji(UI_EMOJI.component.catalog),
    new ButtonBuilder().setCustomId("shop:publish").setLabel("เผยแพร่").setStyle(ButtonStyle.Success).setEmoji(UI_EMOJI.component.star),
    new ButtonBuilder().setCustomId("shop:appearance").setLabel("ดีไซน์ร้าน").setStyle(ButtonStyle.Secondary).setEmoji(UI_EMOJI.component.gem)
  );
}

export function categoryMenu(categories: Category[], customId = "shop:category"): ActionRowBuilder<StringSelectMenuBuilder> {
  const options: APISelectMenuOption[] = categories.slice(0, 25).map((category) => ({
    label: truncate(category.name, 100), 
    value: category.id, 
    description: truncate(category.description || "เลือกเพื่อดูสินค้า", 100),
    emoji: componentEmoji(category.emoji, UI_EMOJI.component.category)
  }));
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(customId)
      .setPlaceholder(`${UI_EMOJI.component.category} เลือกหมวดหมู่สินค้า`)
      .addOptions(options)
  );
}

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
        return {
          label: truncate(product.name, 100), 
          value: product.id, 
          description: truncate(`${formatPrice(product.price)} • ${stockStatus}`, 100),
          emoji: componentEmoji(product.emoji, UI_EMOJI.component.product)
        };
      }))
  );
}

export function productOrderButton(product: Product): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`order:create:${product.id}`)
      .setLabel("ยืนยันคำสั่งซื้อ")
      .setStyle(BUTTON_STYLES[product.buttonColor])
      .setEmoji(UI_EMOJI.component.browse)
  );
}
