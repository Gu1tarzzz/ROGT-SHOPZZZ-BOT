import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder } from "discord.js";
import type { Category, Product, StockTransaction, ShopSettings } from "../types.js";
import { formatStock, truncate, formatPrice } from "../utils/formatters.js";
import { componentEmoji } from "../utils/componentEmoji.js";
import { UI_EMOJI, DIVIDER } from "../config/constants.js";

// ╭──────────────────────────────────────────────────────────────╮
// │  PREMIUM DASHBOARD COMPONENTS - ROGT SHOPZZZ                 │
// │  Style: Luxury • Fantasy • Minimal • Dark                    │
// │  Reference: Dapex Boost, Mickey Boost, Steam Store           │
// ╰──────────────────────────────────────────────────────────────╯

export function dashboardMenu(): ActionRowBuilder<StringSelectMenuBuilder> {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("setup:section")
      .setPlaceholder(`${UI_EMOJI.text.section} เลือกส่วนจัดการ`)
      .addOptions(
        { label: "หมวดหมู่", value: "categories", description: "สร้าง • เรียงลำดับ • แสดงผล", emoji: UI_EMOJI.component.category },
        { label: "สินค้า", value: "products", description: "ราคา • สต็อก • สถานะ", emoji: UI_EMOJI.component.product },
        { label: "ดีไซน์ร้าน", value: "appearance", description: "แบรนด์ • สี • ภาพ", emoji: UI_EMOJI.component.gem },
        { label: "การชำระเงิน", value: "payment", description: "ช่องทางและบัญชีรับเงิน", emoji: UI_EMOJI.component.payment },
        { label: "Ticket", value: "tickets", description: "หมวดหมู่และทีมงาน", emoji: UI_EMOJI.component.ticket },
        { label: "ตั้งค่าระบบ", value: "bot", description: "สิทธิ์และสถานะบอต", emoji: UI_EMOJI.component.settings }
      )
  );
}

export function backButton(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("setup:home").setLabel("กลับแดชบอร์ด").setStyle(ButtonStyle.Secondary).setEmoji(UI_EMOJI.component.back)
  );
}

export function refreshButtons(publishedMessageId?: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("setup:refresh:shop").setLabel("อัปเดตหน้าร้าน").setStyle(ButtonStyle.Primary).setEmoji(UI_EMOJI.component.refresh).setDisabled(!publishedMessageId),
    new ButtonBuilder().setCustomId("setup:refresh:dashboard").setLabel("รีเฟรชสรุป").setStyle(ButtonStyle.Secondary).setEmoji(UI_EMOJI.component.analytics)
  );
}

export function categoryButtons(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("category:create").setLabel("สร้าง").setStyle(ButtonStyle.Success).setEmoji(UI_EMOJI.component.categories),
    new ButtonBuilder().setCustomId("category:edit:pick").setLabel("แก้ไข").setStyle(ButtonStyle.Primary).setEmoji(UI_EMOJI.component.edit),
    new ButtonBuilder().setCustomId("category:visibility:pick").setLabel("แสดงผล").setStyle(ButtonStyle.Secondary).setEmoji(UI_EMOJI.component.star),
    new ButtonBuilder().setCustomId("category:sort:pick").setLabel("เรียงลำดับ").setStyle(ButtonStyle.Secondary).setEmoji(UI_EMOJI.component.analytics),
    new ButtonBuilder().setCustomId("category:delete:pick").setLabel("ลบ").setStyle(ButtonStyle.Danger).setEmoji(UI_EMOJI.component.remove)
  );
}

export function categoryManagerMenu(categories: Category[], mode: "edit" | "delete" | "visibility" | "sort"): ActionRowBuilder<StringSelectMenuBuilder> {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder().setCustomId(`category:pick:${mode}`).setPlaceholder(`${UI_EMOJI.component.category} เลือกหมวดหมู่`).addOptions(categories.slice(0, 25).map((category) => ({
      label: truncate(category.name, 100), value: category.id,
      description: truncate(`${category.hidden ? `${UI_EMOJI.text.inactive} ซ่อน` : `${UI_EMOJI.text.active} แสดง`}  •  ลำดับ ${category.position}`, 100),
      emoji: componentEmoji(category.emoji, UI_EMOJI.component.category)
    })))
  );
}

export function categorySortButtons(categoryId: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`category:move:${categoryId}:up`).setLabel("เลื่อนขึ้น").setStyle(ButtonStyle.Primary).setEmoji(UI_EMOJI.component.analytics),
    new ButtonBuilder().setCustomId(`category:move:${categoryId}:down`).setLabel("เลื่อนลง").setStyle(ButtonStyle.Primary).setEmoji(UI_EMOJI.component.decrease)
  );
}

export function productButtons(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("product:create:pick").setLabel("เพิ่มสินค้า").setStyle(ButtonStyle.Success).setEmoji(UI_EMOJI.component.product),
    new ButtonBuilder().setCustomId("product:edit:pick").setLabel("แก้ไข").setStyle(ButtonStyle.Primary).setEmoji(UI_EMOJI.component.edit),
    new ButtonBuilder().setCustomId("product:visibility:pick").setLabel("แสดงผล").setStyle(ButtonStyle.Secondary).setEmoji(UI_EMOJI.component.star),
    new ButtonBuilder().setCustomId("product:delete:pick").setLabel("ลบ").setStyle(ButtonStyle.Danger).setEmoji(UI_EMOJI.component.remove)
  );
}

export function productManagerMenu(products: Product[], mode: "edit" | "delete" | "visibility"): ActionRowBuilder<StringSelectMenuBuilder> {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder().setCustomId(`product:pick:${mode}`).setPlaceholder(`${UI_EMOJI.component.product} เลือกสินค้า`).addOptions(products.slice(0, 25).map((product) => ({
      label: truncate(product.name, 100), value: product.id,
      description: truncate(`${product.hidden ? `${UI_EMOJI.text.inactive} ซ่อน` : product.status === "active" ? `${UI_EMOJI.text.active} พร้อมขาย` : `${UI_EMOJI.text.inactive} ปิดขาย`}  •  ${formatStock(product.stock)}`, 100),
      emoji: componentEmoji(product.emoji, UI_EMOJI.component.product)
    })))
  );
}

export function productCategoryMenu(categories: Category[]): ActionRowBuilder<StringSelectMenuBuilder> {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder().setCustomId("product:pick:create").setPlaceholder(`${UI_EMOJI.component.category} เลือกหมวดหมู่`).addOptions(categories.slice(0, 25).map((category) => ({ label: truncate(category.name, 100), value: category.id, emoji: componentEmoji(category.emoji, UI_EMOJI.component.category) })))
  );
}

export function sectionButtons(section: "appearance" | "payment" | "tickets" | "bot"): ActionRowBuilder<ButtonBuilder> {
  const map = {
    appearance: [
      { label: "ข้อมูลร้าน", id: "basic", emoji: UI_EMOJI.component.edit },
      { label: "รูปภาพ", id: "images", emoji: UI_EMOJI.component.image },
      { label: "แบรนด์", id: "branding", emoji: UI_EMOJI.component.gem }
    ],
    payment: [{ label: "การชำระเงิน", id: "payment", emoji: UI_EMOJI.component.payment }],
    tickets: [
      { label: "หมวดหมู่", id: "ticket-categories", emoji: UI_EMOJI.component.categories },
      { label: "ทีมงาน", id: "ticket-staff", emoji: UI_EMOJI.component.owner }
    ],
    bot: [{ label: "ตั้งค่าบอต", id: "bot", emoji: UI_EMOJI.component.settings }]
  } as const;
  
  const options = map[section];
  const row = new ActionRowBuilder<ButtonBuilder>();
  
  for (const opt of options) {
    row.addComponents(
      new ButtonBuilder().setCustomId(`setup:modal:${section}:${opt.id}`).setLabel(opt.label).setStyle(ButtonStyle.Primary).setEmoji(opt.emoji)
    );
  }
  
  return row.addComponents(new ButtonBuilder().setCustomId("setup:home").setLabel("กลับ").setStyle(ButtonStyle.Secondary).setEmoji(UI_EMOJI.component.back));
}

export function stockManagerButtons(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("stock:view:all").setLabel("ดูสต็อก").setStyle(ButtonStyle.Primary).setEmoji(UI_EMOJI.component.product),
    new ButtonBuilder().setCustomId("stock:alerts").setLabel("แจ้งเตือน").setStyle(ButtonStyle.Danger).setEmoji(UI_EMOJI.component.alert),
    new ButtonBuilder().setCustomId("stock:restock").setLabel("เติมสต็อก").setStyle(ButtonStyle.Success).setEmoji(UI_EMOJI.component.product)
  );
}

export function stockActionButtons(productId: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`stock:add:${productId}`).setLabel("เพิ่ม").setStyle(ButtonStyle.Success).setEmoji(UI_EMOJI.component.product),
    new ButtonBuilder().setCustomId(`stock:remove:${productId}`).setLabel("ตัดออก").setStyle(ButtonStyle.Danger).setEmoji(UI_EMOJI.component.remove),
    new ButtonBuilder().setCustomId(`stock:history:${productId}`).setLabel("ประวัติ").setStyle(ButtonStyle.Secondary).setEmoji(UI_EMOJI.component.analytics)
  );
}

export function stockHistoryMenu(transactions: StockTransaction[]): ActionRowBuilder<StringSelectMenuBuilder> {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder().setCustomId("stock:history:view").setPlaceholder(`${UI_EMOJI.component.analytics} ดูรายการเคลื่อนไหว`).addOptions(
      transactions.slice(0, 25).map((t) => ({
        label: `${t.type} ${t.quantity > 0 ? "+" : ""}${t.quantity}`,
        value: t.id,
        description: `${t.previousStock} → ${t.newStock}  •  <@${t.performedBy}>`,
        emoji: t.type === "purchase" ? UI_EMOJI.component.browse : t.type === "restock" ? UI_EMOJI.component.product : UI_EMOJI.component.edit
      }))
    )
  );
}

/**
 * Creates a NEW embed for category manager page (not editing existing dashboard)
 */
export function categoryManagerEmbed(guildId: string, categories: Category[]): { embed: EmbedBuilder, components: ActionRowBuilder<any>[] } {
  const summary = categories.length
    ? categories.map((c) => `${UI_EMOJI.text.bullet} **${truncate(c.name, 40)}**  ${c.hidden ? "○ ซ่อน" : "● แสดง"}  •  ลำดับ ${c.position}`).join("\n")
    : "○ ยังไม่มีหมวดหมู่สินค้า";
    
  const embed = new EmbedBuilder()
    .setColor("#8B5CF6")
    .setTitle(`${UI_EMOJI.text.brand} CATEGORY MANAGER`)
    .setDescription([
      "*จัดการหมวดหมู่สินค้าและการแสดงผล*",
      "",
      DIVIDER,
      "",
      `${UI_EMOJI.text.bullet} ทั้งหมด **${categories.length}** หมวดหมู่`,
      "",
      summary || "ไม่มีข้อมูล"
    ].join("\n"))
    .setFooter({ text: `${UI_EMOJI.text.brand} ROGT SHOPZZZ` })
    .setTimestamp();
    
  return { embed, components: [categoryButtons(), backButton()] };
}

/**
 * Creates a NEW embed for product manager page (not editing existing dashboard)
 */
export function productManagerEmbed(guildId: string, products: Product[]): { embed: EmbedBuilder, components: ActionRowBuilder<any>[] } {
  const summary = products.length
    ? products.slice(0, 15).map((p) => `${UI_EMOJI.text.bullet} **${truncate(p.name, 35)}**  ${formatPrice(p.price)}  •  ${p.stock < 0 ? "ไม่จำกัด" : `สต็อก ${p.stock}`}`).join("\n")
    : "○ ยังไม่มีสินค้า";
    
  const embed = new EmbedBuilder()
    .setColor("#8B5CF6")
    .setTitle(`${UI_EMOJI.text.brand} PRODUCT MANAGER`)
    .setDescription([
      "*จัดการสินค้า ราคา และสต็อก*",
      "",
      DIVIDER,
      "",
      `${UI_EMOJI.text.bullet} ทั้งหมด **${products.length}** รายการ`,
      "",
      summary || "ไม่มีข้อมูล"
    ].join("\n"))
    .setFooter({ text: `${UI_EMOJI.text.brand} ROGT SHOPZZZ` })
    .setTimestamp();
    
  return { embed, components: [productButtons(), backButton()] };
}
