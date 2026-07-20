import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, type APISelectMenuOption } from "discord.js";
import { BUTTON_STYLES } from "../config/constants.js";
import type { Category, Product, ShopSettings } from "../types.js";
import { formatPrice, formatStock, truncate } from "../utils/formatters.js";

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
    new ButtonBuilder().setCustomId("shop:preview").setLabel("👁️ แสดงตัวอย่าง").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("shop:publish").setLabel("📤 เผยแพร่ร้าน").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("shop:appearance").setLabel("🏪 ตั้งค่าหน้าตา Premium").setStyle(ButtonStyle.Secondary)
  );
}

export function categoryMenu(categories: Category[], customId = "shop:category"): ActionRowBuilder<StringSelectMenuBuilder> {
  const options: APISelectMenuOption[] = categories.slice(0, 25).map((category) => ({
    label: truncate(category.name, 100), value: category.id, description: truncate(category.description || "เลือกดูสินค้า", 100)
  }));
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder().setCustomId(customId).setPlaceholder("เลือกหมวดหมู่สินค้า").addOptions(options)
  );
}

export function productMenu(products: Product[], customId = "shop:product"): ActionRowBuilder<StringSelectMenuBuilder> {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder().setCustomId(customId).setPlaceholder("เลือกสินค้า").addOptions(products.slice(0, 25).map((product) => ({
      label: truncate(product.name, 100), value: product.id, description: truncate(`${formatPrice(product.price)} • คงเหลือ ${formatStock(product.stock)}`, 100), emoji: product.emoji || undefined
    })))
  );
}

export function productOrderButton(product: Product): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`order:create:${product.id}`).setLabel("สร้างคำสั่งซื้อ").setStyle(BUTTON_STYLES[product.buttonColor]).setEmoji(product.emoji || "🛒")
  );
}
