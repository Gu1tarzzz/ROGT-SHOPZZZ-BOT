import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from "discord.js";
import type { Category, Product } from "../types.js";
import { truncate } from "../utils/formatters.js";

export function dashboardMenu(): ActionRowBuilder<StringSelectMenuBuilder> {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder().setCustomId("setup:section").setPlaceholder("เลือกส่วนที่ต้องการจัดการ").addOptions(
      { label: "Category Manager", value: "categories", description: "สร้าง แก้ไข ซ่อน และเรียงหมวดหมู่", emoji: "📂" },
      { label: "Product Manager", value: "products", description: "จัดการสินค้า ราคา สต็อก และสิทธิ์", emoji: "📦" },
      { label: "Shop Design", value: "design", description: "ชื่อร้าน คำอธิบาย สี และปุ่ม", emoji: "📝" },
      { label: "Banner Settings", value: "banner", description: "รูป Banner และ Thumbnail", emoji: "🖼" },
      { label: "Payment Settings", value: "payment", description: "ช่องทางชำระเงินและสลิป", emoji: "💳" },
      { label: "Ticket Settings", value: "tickets", description: "ห้อง Ticket และทีมงาน", emoji: "🎫" },
      { label: "Bot Settings", value: "bot", description: "เจ้าของ สิทธิ์ทีมงาน และสถานะระบบ", emoji: "⚙" }
    )
  );
}

export function backButton(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("setup:home").setLabel("กลับแดชบอร์ด").setStyle(ButtonStyle.Secondary)
  );
}

export function categoryButtons(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("category:create").setLabel("สร้างหมวดหมู่").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("category:edit:pick").setLabel("แก้ไข").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("category:visibility:pick").setLabel("ซ่อน / แสดง").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("category:sort:pick").setLabel("เรียงลำดับ").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("category:delete:pick").setLabel("ลบ").setStyle(ButtonStyle.Danger)
  );
}

export function categoryManagerMenu(categories: Category[], mode: "edit" | "delete" | "visibility" | "sort"): ActionRowBuilder<StringSelectMenuBuilder> {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder().setCustomId(`category:pick:${mode}`).setPlaceholder("เลือกหมวดหมู่").addOptions(categories.slice(0, 25).map((category) => ({
      label: truncate(category.name, 100), value: category.id,
      description: truncate(`${category.hidden ? "ซ่อน" : "แสดง"} • ลำดับ ${category.position}`, 100)
    })))
  );
}

export function categorySortButtons(categoryId: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`category:move:${categoryId}:up`).setLabel("เลื่อนขึ้น").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`category:move:${categoryId}:down`).setLabel("เลื่อนลง").setStyle(ButtonStyle.Primary)
  );
}

export function productButtons(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("product:create:pick").setLabel("เพิ่มสินค้า").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("product:edit:pick").setLabel("แก้ไข").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("product:visibility:pick").setLabel("ซ่อน / แสดง").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("product:delete:pick").setLabel("ลบ").setStyle(ButtonStyle.Danger)
  );
}

export function productManagerMenu(products: Product[], mode: "edit" | "delete" | "visibility"): ActionRowBuilder<StringSelectMenuBuilder> {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder().setCustomId(`product:pick:${mode}`).setPlaceholder("เลือกสินค้า").addOptions(products.slice(0, 25).map((product) => ({
      label: truncate(product.name, 100), value: product.id,
      description: truncate(`${product.hidden ? "ซ่อน" : product.status} • คงเหลือ ${product.stock}`, 100)
    })))
  );
}

export function productCategoryMenu(categories: Category[]): ActionRowBuilder<StringSelectMenuBuilder> {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder().setCustomId("product:pick:create").setPlaceholder("เลือกหมวดหมู่สำหรับสินค้าใหม่").addOptions(categories.slice(0, 25).map((category) => ({ label: truncate(category.name, 100), value: category.id })))
  );
}

export function sectionButtons(section: "design" | "banner" | "payment" | "tickets" | "bot"): ActionRowBuilder<ButtonBuilder> {
  const map = {
    design: ["แก้ไขดีไซน์ร้าน", "setup:modal:design", ButtonStyle.Primary],
    banner: ["แก้ไขรูปภาพ", "setup:modal:banner", ButtonStyle.Primary],
    payment: ["แก้ไขการชำระเงิน", "setup:modal:payment", ButtonStyle.Primary],
    tickets: ["แก้ไข Ticket", "setup:modal:tickets", ButtonStyle.Primary],
    bot: ["แก้ไข Bot", "setup:modal:bot", ButtonStyle.Primary]
  } as const;
  const [label, customId, style] = map[section];
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style),
  );
  if (section === "design") row.addComponents(new ButtonBuilder().setCustomId("setup:modal:labels").setLabel("ข้อความบนปุ่ม").setStyle(ButtonStyle.Secondary));
  return row.addComponents(new ButtonBuilder().setCustomId("setup:home").setLabel("กลับแดชบอร์ด").setStyle(ButtonStyle.Secondary));
}
