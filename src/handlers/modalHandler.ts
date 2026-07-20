import type { ModalSubmitInteraction } from "discord.js";
import { TextInputStyle } from "discord.js";
import { createModal } from "../components/modal.js";
import { categoryRepository, productRepository, settingsRepository } from "../database/repositories.js";
import type { ButtonColor, Product } from "../types.js";
import { isValidHex, parseOptional, parseThaiNumber } from "../utils/formatters.js";

const value = (interaction: ModalSubmitInteraction, id: string): string => interaction.fields.getTextInputValue(id).trim();
const splitLines = (input: string): string[] => input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
const validColor = (input: string): ButtonColor => (["Primary", "Secondary", "Success", "Danger"] as const).includes(input as ButtonColor) ? input as ButtonColor : "Primary";

export async function openModal(interaction: import("discord.js").ButtonInteraction): Promise<unknown> {
  if (!interaction.guildId) return;
  const settings = await settingsRepository.get(interaction.guildId);
  const [, , type] = interaction.customId.split(":");
  if (type === "appearance") {
    return interaction.showModal(createModal("settings:appearance", "ตั้งค่าหน้าตา Premium Shop", [
      { id: "name", label: "ชื่อร้าน", value: settings.shop.storeName, required: true, maxLength: 100 },
      { id: "description", label: "คำอธิบายร้าน", value: settings.shop.description, required: true, style: TextInputStyle.Paragraph, maxLength: 1000 },
      { id: "footer", label: "Footer", value: settings.shop.footer, required: true, maxLength: 200 },
      { id: "color", label: "สี Embed (#RRGGBB)", value: settings.shop.embedColor, required: true, maxLength: 7 },
      { id: "banner", label: "Banner URL (ภาพปกติ)", value: settings.shop.banner, placeholder: "https://...", maxLength: 1024 },
      { id: "bannerGif", label: "Banner GIF (ภาพเคลื่อนไหว)", value: settings.shop.bannerGif, placeholder: "https://...", maxLength: 1024 },
      { id: "thumbnail", label: "Thumbnail URL", value: settings.shop.thumbnail, placeholder: "https://...", maxLength: 1024 },
      { id: "authorName", label: "Author Name", value: settings.shop.authorName, placeholder: "ชื่อที่แสดงด้านบน", maxLength: 100 },
      { id: "authorIcon", label: "Author Icon URL", value: settings.shop.authorIcon, placeholder: "https://...", maxLength: 1024 },
      { id: "storeLogo", label: "Store Logo URL", value: settings.shop.storeLogo, placeholder: "https://...", maxLength: 1024 },
      { id: "status", label: "สถานะ (open / closed)", value: settings.shop.status, required: true, maxLength: 10 }
    ]));
  }
  if (type === "labels") {
    return interaction.showModal(createModal("settings:labels", "ข้อความบนปุ่มหน้าร้าน", [
      { id: "browse", label: "ปุ่ม Browse", value: settings.shop.buttons.browse, required: true, maxLength: 80 },
      { id: "order", label: "ปุ่ม Create Order", value: settings.shop.buttons.order, required: true, maxLength: 80 },
      { id: "support", label: "ปุ่ม Support", value: settings.shop.buttons.support, required: true, maxLength: 80 },
      { id: "information", label: "ปุ่ม Store Information", value: settings.shop.buttons.information, required: true, maxLength: 80 }
    ]));
  }
  if (type === "payment") {
    const bank = [settings.payment.bankName, settings.payment.accountName, settings.payment.bankAccount].filter(Boolean).join("\n");
    const details = [settings.payment.qrImage, settings.payment.paymentChannelId, settings.payment.slipChannelId, settings.payment.instructions].filter(Boolean).join("\n");
    return interaction.showModal(createModal("settings:payment", "ตั้งค่าการชำระเงิน", [
      { id: "enabled", label: "เปิดรับชำระเงิน (yes / no)", value: settings.payment.enabled ? "yes" : "no", required: true, maxLength: 3 },
      { id: "wallet", label: "TrueMoney Wallet", value: settings.payment.trueMoneyWallet, placeholder: "เบอร์โทร หรือ -", maxLength: 100 },
      { id: "promptpay", label: "PromptPay", value: settings.payment.promptPay, placeholder: "เบอร์โทร/เลขบัตร หรือ -", maxLength: 100 },
      { id: "bank", label: "ธนาคาร (ชื่อธนาคาร / ชื่อบัญชี / เลขบัญชี)", value: bank, style: TextInputStyle.Paragraph, maxLength: 400 },
      { id: "details", label: "รายละเอียดการชำระเงิน", value: details, placeholder: "QR URL / Payment Channel ID / Slip Channel ID / คำแนะนำ (บรรทัดละ 1)", style: TextInputStyle.Paragraph, maxLength: 1024 }
    ]));
  }
  if (type === "tickets") {
    return interaction.showModal(createModal("settings:tickets", "ตั้งค่า Ticket", [
      { id: "category", label: "Order Category ID", value: settings.tickets.categoryId, placeholder: "ใส่ - เพื่อล้าง", maxLength: 30 },
      { id: "supportCategory", label: "Support Category ID", value: settings.tickets.supportCategoryId, placeholder: "ใส่ - เพื่อใช้ Order Category", maxLength: 30 },
      { id: "roles", label: "Staff Role ID (คั่นด้วย ,)", value: settings.tickets.staffRoleIds.join(","), maxLength: 500 },
      { id: "transcript", label: "Transcript Channel ID", value: settings.tickets.transcriptChannelId, placeholder: "ใส่ - เพื่อล้าง", maxLength: 30 },
      { id: "prefix", label: "Ticket Prefix", value: settings.tickets.ticketPrefix, required: true, maxLength: 20 }
    ]));
  }
  if (type === "bot") {
    return interaction.showModal(createModal("settings:bot", "ตั้งค่า Bot", [
      { id: "owner", label: "Owner User ID (ว่าง = Guild Owner)", value: settings.bot.ownerId, maxLength: 30 },
      { id: "roles", label: "Admin Staff Role ID (คั่นด้วย ,)", value: settings.bot.staffRoleIds.join(","), maxLength: 500 },
      { id: "maintenance", label: "Maintenance Mode (yes / no)", value: settings.bot.maintenanceMode ? "yes" : "no", required: true, maxLength: 3 }
    ]));
  }
}

export async function openCategoryModal(interaction: import("discord.js").ButtonInteraction, categoryId?: string): Promise<unknown> {
  const category = categoryId ? await categoryRepository.find(categoryId) : undefined;
  return interaction.showModal(createModal(category ? `category:edit:${category.id}` : "category:create", category ? "แก้ไขหมวดหมู่" : "สร้างหมวดหมู่", [
    { id: "name", label: "ชื่อหมวดหมู่", value: category?.name, required: true, maxLength: 100 },
    { id: "description", label: "คำอธิบาย", value: category?.description, style: TextInputStyle.Paragraph, maxLength: 500 }
  ]));
}

export async function openProductModal(interaction: import("discord.js").ButtonInteraction, categoryId?: string, product?: Product): Promise<unknown> {
  const details = product ? [product.imageUrl, product.requiredRoleId, product.buttonColor, product.emoji, product.status].map((item) => item || "-").join("\n") : "-\n-\nPrimary\n-\nactive";
  return interaction.showModal(createModal(product ? `product:edit:${product.id}` : `product:create:${categoryId}`, product ? "แก้ไขสินค้า" : "เพิ่มสินค้า", [
    { id: "name", label: "ชื่อสินค้า", value: product?.name, required: true, maxLength: 100 },
    { id: "description", label: "คำอธิบาย", value: product?.description, required: true, style: TextInputStyle.Paragraph, maxLength: 1000 },
    { id: "price", label: "ราคา (บาท)", value: product?.price.toString(), required: true, placeholder: "100", maxLength: 20 },
    { id: "stock", label: "จำนวนสต็อก (-1 = ไม่จำกัด)", value: product?.stock.toString() ?? "0", required: true, maxLength: 12 },
    { id: "details", label: "รายละเอียดสินค้า", value: details, placeholder: "รูป URL / Role ID / สี / Emoji / status (บรรทัดละ 1)", style: TextInputStyle.Paragraph, maxLength: 1024 }
  ]));
}

export async function handleModal(interaction: ModalSubmitInteraction): Promise<unknown> {
  if (!interaction.guildId) return;
  const parts = interaction.customId.split(":");
const scope = parts[0];
const action = parts[1];
const id = parts.slice(2).join(":");
console.log("Modal ID =", id);
  if (scope === "category") {
    const name = value(interaction, "name");
    const description = value(interaction, "description");
    if (action === "create") {
      const all = await categoryRepository.list(interaction.guildId);
      const category = categoryRepository.create(interaction.guildId, { name, description, hidden: false, featured: false, guildId: interaction.guildId });
      category.position = all.length + 1;
      await categoryRepository.save(category);
      return interaction.reply({ content: `สร้างหมวดหมู่ **${name}** แล้ว`, ephemeral: true });
    }
    const category = await categoryRepository.find(id);
    if (!category) return interaction.reply({ content: "ไม่พบหมวดหมู่นี้", ephemeral: true });
    category.name = name;
    category.description = description;
    category.updatedAt = new Date().toISOString();
    await categoryRepository.save(category);
    return interaction.reply({ content: `บันทึกหมวดหมู่ **${name}** แล้ว`, ephemeral: true });
  }
  if (scope === "product") {
    const price = parseThaiNumber(value(interaction, "price"));
    const stock = Number(value(interaction, "stock"));
    if (price === undefined || !Number.isInteger(stock) || stock < -1) return interaction.reply({ content: "ราคา หรือสต็อกไม่ถูกต้อง", ephemeral: true });
    const [imageUrl, requiredRoleId, color, emoji, status] = splitLines(value(interaction, "details"));
    const fields = { name: value(interaction, "name"), description: value(interaction, "description"), price, stock, imageUrl: parseOptional(imageUrl), requiredRoleId: parseOptional(requiredRoleId), buttonColor: validColor(color), emoji: parseOptional(emoji), status: status === "inactive" ? "inactive" as const : "active" as const, featured: false, guildId: interaction.guildId, tags: [] };
    if (action === "create") {
      if (!id) return interaction.reply({ content: "ไม่พบหมวดหมู่สินค้า", ephemeral: true });
      console.log("Modal ID =", id);
console.log("Guild ID =", interaction.guildId);
      const product = productRepository.create(interaction.guildId, { ...fields, categoryId: id, hidden: false });
      await productRepository.save(product);
      return interaction.reply({ content: `เพิ่มสินค้า **${product.name}** แล้ว`, ephemeral: true });
    }
    const product = await productRepository.find(id);
    if (!product) return interaction.reply({ content: "ไม่พบสินค้านี้", ephemeral: true });
    Object.assign(product, fields, { updatedAt: new Date().toISOString() });
    await productRepository.save(product);
    return interaction.reply({ content: `บันทึกสินค้า **${product.name}** แล้ว`, ephemeral: true });
  }
  if (scope !== "settings") return;
  if (action === "appearance") {
    const color = value(interaction, "color");
    if (!isValidHex(color)) return interaction.reply({ content: "สี Embed ต้องอยู่ในรูปแบบ #RRGGBB", ephemeral: true });
    await settingsRepository.update(interaction.guildId, (settings) => ({ 
      ...settings, 
      shop: { 
        ...settings.shop, 
        storeName: value(interaction, "name"), 
        description: value(interaction, "description"), 
        footer: value(interaction, "footer"), 
        embedColor: color, 
        banner: parseOptional(value(interaction, "banner")),
        bannerGif: parseOptional(value(interaction, "bannerGif")),
        thumbnail: parseOptional(value(interaction, "thumbnail")),
        authorName: parseOptional(value(interaction, "authorName")),
        authorIcon: parseOptional(value(interaction, "authorIcon")),
        storeLogo: parseOptional(value(interaction, "storeLogo")),
        status: value(interaction, "status").toLowerCase() === "closed" ? "closed" : "open" 
      } 
    }));
  } else if (action === "labels") {
    await settingsRepository.update(interaction.guildId, (settings) => ({ ...settings, shop: { ...settings.shop, buttons: { browse: value(interaction, "browse"), order: value(interaction, "order"), support: value(interaction, "support"), information: value(interaction, "information") } } }));
  } else if (action === "payment") {
    const bank = splitLines(value(interaction, "bank"));
    const details = splitLines(value(interaction, "details"));
    await settingsRepository.update(interaction.guildId, (settings) => ({ ...settings, payment: { ...settings.payment, enabled: value(interaction, "enabled").toLowerCase() === "yes", trueMoneyWallet: parseOptional(value(interaction, "wallet")), promptPay: parseOptional(value(interaction, "promptpay")), bankName: parseOptional(bank[0]), accountName: parseOptional(bank[1]), bankAccount: parseOptional(bank[2]), qrImage: parseOptional(details[0]), paymentChannelId: parseOptional(details[1]), slipChannelId: parseOptional(details[2]), instructions: details.slice(3).join("\n") || settings.payment.instructions } }));
  } else if (action === "tickets") {
    await settingsRepository.update(interaction.guildId, (settings) => ({ ...settings, tickets: { categoryId: parseOptional(value(interaction, "category")), supportCategoryId: parseOptional(value(interaction, "supportCategory")), staffRoleIds: value(interaction, "roles").split(",").map((item) => item.trim()).filter(Boolean), transcriptChannelId: parseOptional(value(interaction, "transcript")), ticketPrefix: value(interaction, "prefix").replace(/[^a-z0-9-]/gi, "").toLowerCase() || "order" }, }));
  } else if (action === "bot") {
    await settingsRepository.update(interaction.guildId, (settings) => ({ ...settings, bot: { ...settings.bot, ownerId: parseOptional(value(interaction, "owner")), staffRoleIds: value(interaction, "roles").split(",").map((item) => item.trim()).filter(Boolean), maintenanceMode: value(interaction, "maintenance").toLowerCase() === "yes" } }));
  }
  return interaction.reply({ content: "บันทึกการตั้งค่าแล้ว — หน้าร้านจะอัปเดตทันที", ephemeral: true });
}
