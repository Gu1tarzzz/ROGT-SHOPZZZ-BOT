import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from "discord.js";
import type { Category, Product, StockTransaction } from "../types.js";
import { formatStock, truncate } from "../utils/formatters.js";

export function dashboardMenu(): ActionRowBuilder<StringSelectMenuBuilder> {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder().setCustomId("setup:section").setPlaceholder("เลือกส่วนที่ต้องการจัดการ").addOptions(
      { label: "Category Manager", value: "categories", description: "สร้าง แก้ไข ซ่อน และเรียงหมวดหมู่", emoji: "📂" },
      { label: "Product Manager", value: "products", description: "จัดการสินค้า ราคา สต็อก และสิทธิ์", emoji: "📦" },
      { label: "Shop Appearance", value: "appearance", description: "ชื่อร้าน Banner สี และหน้าตาพรีเมียม", emoji: "🏪" },
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
      description: truncate(`${product.hidden ? "ซ่อน" : product.status} • คงเหลือ ${formatStock(product.stock)}`, 100)
    })))
  );
}

export function productCategoryMenu(categories: Category[]): ActionRowBuilder<StringSelectMenuBuilder> {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder().setCustomId("product:pick:create").setPlaceholder("เลือกหมวดหมู่สำหรับสินค้าใหม่").addOptions(categories.slice(0, 25).map((category) => ({ label: truncate(category.name, 100), value: category.id })))
  );
}

export function sectionButtons(section: "appearance" | "payment" | "tickets" | "bot"): ActionRowBuilder<ButtonBuilder> {
  const map = {
    appearance: [
      { label: "ข้อมูลพื้นฐาน", id: "basic" },
      { label: "รูปภาพและแบนเนอร์", id: "images" },
      { label: "แบรนด์และการตั้งค่า", id: "branding" }
    ],
    payment: [{ label: "แก้ไขการชำระเงิน", id: "payment" }],
    tickets: [
      { label: "หมวดหมู่ Ticket", id: "ticket-categories" },
      { label: "ทีมงานและ Transcripts", id: "ticket-staff" }
    ],
    bot: [{ label: "แก้ไข Bot", id: "bot" }]
  } as const;
  
  const options = map[section];
  const row = new ActionRowBuilder<ButtonBuilder>();
  
  for (const opt of options) {
    row.addComponents(
      new ButtonBuilder().setCustomId(`setup:modal:${section}:${opt.id}`).setLabel(opt.label).setStyle(ButtonStyle.Primary)
    );
  }
  
  return row.addComponents(new ButtonBuilder().setCustomId("setup:home").setLabel("กลับแดชบอร์ด").setStyle(ButtonStyle.Secondary));
}

export function stockManagerButtons(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("stock:view:all").setLabel("ดูสต็อกทั้งหมด").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("stock:alerts").setLabel("การแจ้งเตือน").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("stock:restock").setLabel("ขอเติมสต็อก").setStyle(ButtonStyle.Success)
  );
}

export function stockActionButtons(productId: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`stock:add:${productId}`).setLabel("+ เพิ่มสต็อก").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`stock:remove:${productId}`).setLabel("- ลดสต็อก").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId(`stock:history:${productId}`).setLabel("ประวัติ").setStyle(ButtonStyle.Secondary)
  );
}

export function stockHistoryMenu(transactions: StockTransaction[]): ActionRowBuilder<StringSelectMenuBuilder> {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder().setCustomId("stock:history:view").setPlaceholder("ดูรายการธุรกรรม").addOptions(
      transactions.slice(0, 25).map((t) => ({
        label: `${t.type} ${t.quantity > 0 ? "+" : ""}${t.quantity}`,
        value: t.id,
        description: `${t.previousStock} → ${t.newStock} • โดย <@${t.performedBy}>`
      }))
    )
  );
}
