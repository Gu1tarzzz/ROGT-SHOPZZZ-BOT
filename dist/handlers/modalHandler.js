import { TextInputStyle } from "discord.js";
import { createModal } from "../components/modal.js";
import { categoryRepository, productRepository, settingsRepository, UserRepository } from "../database/repositories.js";
import { isValidHex, parseOptional, parseThaiNumber, formatNumber } from "../utils/formatters.js";
import { balanceEmbed } from "../utils/discord.js";
import { bankSetupEmbed, notificationSetupEmbed } from "../components/setupComponents.js";
const value = (interaction, id) => interaction.fields.getTextInputValue(id).trim();
const splitLines = (input) => input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
const validColor = (input) => ["Primary", "Secondary", "Success", "Danger"].includes(input) ? input : "Primary";
export async function openModal(interaction, section) {
    if (!interaction.guildId)
        return;
    const settings = await settingsRepository.get(interaction.guildId);
    // If section is provided, use it directly instead of parsing customId
    if (section) {
        const sectionParts = section.split(":");
        // TrueMoney Setup
        if (section === "truemoney") {
            return interaction.showModal(createModal("payment:truemoney:save", "✦ TrueMoney Setup", [
                { id: "phone", label: "Phone Number (10 digits)", value: settings.payment.trueMoneyPhone, placeholder: "0812345678", required: true, maxLength: 10 }
            ]));
        }
        // Bank Edit
        if (sectionParts[0] === "bank" && sectionParts[1] === "edit") {
            return interaction.showModal(createModal("payment:bank:save", "✦ Edit Bank Account", [
                { id: "bankName", label: "Bank Name", value: settings.payment.bank?.bankName, placeholder: "Kasikornbank", required: true, maxLength: 100 },
                { id: "accountName", label: "Account Name", value: settings.payment.bank?.accountName, placeholder: "John Doe", required: true, maxLength: 100 },
                { id: "accountNumber", label: "Account Number", value: settings.payment.bank?.accountNumber, placeholder: "123-4-56789-0", required: true, maxLength: 20 }
            ]));
        }
        // QR Edit
        if (sectionParts[0] === "qr" && sectionParts[1] === "edit") {
            return interaction.showModal(createModal("payment:qr:save", "✦ Edit QR Image", [
                { id: "qrImage", label: "QR Image URL", value: settings.payment.bank?.qrImage, placeholder: "https://...", required: true, maxLength: 1024 }
            ]));
        }
        return;
    }
    const parts = interaction.customId.split(":");
    const scope = parts[0]; // e.g., "payment", "setup", "category"
    const type = parts[1]; // e.g., "setup", "modal", "bank", "qr"
    const subType = parts[2]; // e.g., "truemoney", "bank", "notification", "edit"
    const subSection = parts[3]; // e.g., "edit"
    // Handle appearance with subsections (basic, images, branding)
    if (scope === "setup" && type === "modal") {
        if (subType === "appearance") {
            const appearanceSubSection = parts[3];
            if (appearanceSubSection === "basic") {
                return interaction.showModal(createModal("settings:appearance:basic", "✦ ดีไซน์ร้าน • ข้อมูล", [
                    { id: "name", label: "ชื่อร้าน", value: settings.shop.storeName, required: true, maxLength: 100 },
                    { id: "description", label: "คำอธิบายร้าน", value: settings.shop.description, required: true, style: TextInputStyle.Paragraph, maxLength: 1000 },
                    { id: "footer", label: "ข้อความท้าย Embed", value: settings.shop.footer, required: true, maxLength: 200 },
                    { id: "status", label: "สถานะ (open / closed)", value: settings.shop.status, required: true, maxLength: 10 }
                ]));
            }
            if (appearanceSubSection === "images") {
                return interaction.showModal(createModal("settings:appearance:images", "✦ ดีไซน์ร้าน • รูปภาพ", [
                    { id: "banner", label: "Banner URL", value: settings.shop.banner, placeholder: "ภาพปกติ  •  https://...", maxLength: 1024 },
                    { id: "bannerGif", label: "Banner GIF URL", value: settings.shop.bannerGif, placeholder: "ภาพเคลื่อนไหว  •  https://...", maxLength: 1024 },
                    { id: "thumbnail", label: "Thumbnail URL", value: settings.shop.thumbnail, placeholder: "https://...", maxLength: 1024 },
                    { id: "storeLogo", label: "Store Logo URL", value: settings.shop.storeLogo, placeholder: "https://...", maxLength: 1024 }
                ]));
            }
            if (appearanceSubSection === "branding") {
                return interaction.showModal(createModal("settings:appearance:branding", "✦ ดีไซน์ร้าน • แบรนด์", [
                    { id: "color", label: "สี Embed (#RRGGBB)", value: settings.shop.embedColor, required: true, maxLength: 7 },
                    { id: "authorName", label: "Author Name", value: settings.shop.authorName, placeholder: "ชื่อที่แสดงด้านบน", maxLength: 100 },
                    { id: "authorIcon", label: "Author Icon URL", value: settings.shop.authorIcon, placeholder: "https://...", maxLength: 1024 }
                ]));
            }
            // Fallback for old format
            return openAppearanceModal(interaction, settings);
        }
    }
    if (type === "labels") {
        return interaction.showModal(createModal("settings:labels", "✦ ปุ่มหน้าร้าน", [
            { id: "browse", label: "ปุ่ม เลือกชม", value: settings.shop.buttons.browse, required: true, maxLength: 80 },
            { id: "order", label: "ปุ่ม คำสั่งซื้อ", value: settings.shop.buttons.order, required: true, maxLength: 80 },
            { id: "support", label: "ปุ่ม ช่วยเหลือ", value: settings.shop.buttons.support, required: true, maxLength: 80 },
            { id: "information", label: "ปุ่ม ข้อมูลร้าน", value: settings.shop.buttons.information, required: true, maxLength: 80 }
        ]));
    }
    if (type === "payment") {
        const bank = [settings.payment.bankName, settings.payment.accountName, settings.payment.bankAccount].filter(Boolean).join("\n");
        const details = [settings.payment.qrImage, settings.payment.paymentChannelId, settings.payment.slipChannelId, settings.payment.instructions].filter(Boolean).join("\n");
        return interaction.showModal(createModal("settings:payment", "✦ การชำระเงิน", [
            { id: "enabled", label: "เปิดรับชำระเงิน (yes / no)", value: settings.payment.enabled ? "yes" : "no", required: true, maxLength: 3 },
            { id: "wallet", label: "TrueMoney Wallet", value: settings.payment.trueMoneyWallet, placeholder: "เบอร์โทร หรือ -", maxLength: 100 },
            { id: "promptpay", label: "PromptPay", value: settings.payment.promptPay, placeholder: "เบอร์โทร/เลขบัตร หรือ -", maxLength: 100 },
            { id: "bank", label: "ธนาคาร (ชื่อ / ชื่อบัญชี / เลข)", value: bank, style: TextInputStyle.Paragraph, maxLength: 400 }
        ]));
    }
    // Payment Dashboard button handlers
    if (type === "setup") {
        const subType = parts[3];
        // TrueMoney Setup - Phone Number only
        if (subType === "truemoney") {
            return interaction.showModal(createModal("payment:truemoney:save", "✦ TrueMoney Setup", [
                { id: "phone", label: "Phone Number (10 digits)", value: settings.payment.trueMoneyPhone, placeholder: "0812345678", required: true, maxLength: 10 }
            ]));
        }
        // Bank Setup - Display current config with edit buttons
        if (subType === "bank") {
            return showBankSetupPage(interaction, settings);
        }
        // Notification Setup - Channel selectors
        if (subType === "notification") {
            return showNotificationSetupPage(interaction, settings);
        }
    }
    // Bank Edit Modal
    if (type === "bank" && subSection === "edit") {
        return interaction.showModal(createModal("payment:bank:save", "✦ Edit Bank Account", [
            { id: "bankName", label: "Bank Name", value: settings.payment.bank?.bankName, placeholder: "Kasikornbank", required: true, maxLength: 100 },
            { id: "accountName", label: "Account Name", value: settings.payment.bank?.accountName, placeholder: "John Doe", required: true, maxLength: 100 },
            { id: "accountNumber", label: "Account Number", value: settings.payment.bank?.accountNumber, placeholder: "123-4-56789-0", required: true, maxLength: 20 }
        ]));
    }
    // QR Edit Modal
    if (type === "qr" && subSection === "edit") {
        return interaction.showModal(createModal("payment:qr:save", "✦ Edit QR Image", [
            { id: "qrImage", label: "QR Image URL", value: settings.payment.bank?.qrImage, placeholder: "https://...", required: true, maxLength: 1024 }
        ]));
    }
    if (type === "tickets") {
        const subSection = parts[3];
        if (subSection === "ticket-categories") {
            return interaction.showModal(createModal("settings:tickets:categories", "✦ Ticket • หมวดหมู่", [
                { id: "category", label: "Order Category ID", value: settings.tickets.categoryId, placeholder: "ใส่ - เพื่อล้าง", maxLength: 30 },
                { id: "supportCategory", label: "Support Category ID", value: settings.tickets.supportCategoryId, placeholder: "ใส่ - เพื่อใช้ Order Category", maxLength: 30 }
            ]));
        }
        if (subSection === "ticket-staff") {
            return interaction.showModal(createModal("settings:tickets:staff", "✦ Ticket • ทีมงาน", [
                { id: "roles", label: "Staff Role ID (คั่นด้วย ,)", value: settings.tickets.staffRoleIds.join(","), maxLength: 500 },
                { id: "transcript", label: "Transcript Channel ID", value: settings.tickets.transcriptChannelId, placeholder: "ใส่ - เพื่อล้าง", maxLength: 30 },
                { id: "prefix", label: "Ticket Prefix", value: settings.tickets.ticketPrefix, required: true, maxLength: 20 }
            ]));
        }
        // Fallback for old format
        return interaction.showModal(createModal("settings:tickets", "✦ ตั้งค่า Ticket", [
            { id: "category", label: "Order Category ID", value: settings.tickets.categoryId, placeholder: "ใส่ - เพื่อล้าง", maxLength: 30 },
            { id: "supportCategory", label: "Support Category ID", value: settings.tickets.supportCategoryId, placeholder: "ใส่ - เพื่อใช้ Order Category", maxLength: 30 },
            { id: "roles", label: "Staff Role ID (คั่นด้วย ,)", value: settings.tickets.staffRoleIds.join(","), maxLength: 500 },
            { id: "transcript", label: "Transcript Channel ID", value: settings.tickets.transcriptChannelId, placeholder: "ใส่ - เพื่อล้าง", maxLength: 30 },
            { id: "prefix", label: "Ticket Prefix", value: settings.tickets.ticketPrefix, required: true, maxLength: 20 }
        ]));
    }
    if (type === "bot") {
        return interaction.showModal(createModal("settings:bot", "✦ ตั้งค่าบอต", [
            { id: "owner", label: "Owner User ID (ว่าง = Guild Owner)", value: settings.bot.ownerId, maxLength: 30 },
            { id: "roles", label: "Admin Staff Role ID (คั่นด้วย ,)", value: settings.bot.staffRoleIds.join(","), maxLength: 500 },
            { id: "maintenance", label: "Maintenance Mode (yes / no)", value: settings.bot.maintenanceMode ? "yes" : "no", required: true, maxLength: 3 }
        ]));
    }
    // Handle backoffice with subsections (banner-image, user-balance)
    if (type === "backoffice") {
        if (subSection === "banner-image") {
            return interaction.showModal(createModal("settings:backoffice:banner-image", "✦ ดีไซน์หลังร้าน • รูปภาพ", [
                { id: "imageUrl", label: "Image Banner URL", value: settings.backOffice.imageUrl, placeholder: "https://...", maxLength: 1024 },
                { id: "thumbnailUrl", label: "Thumbnail URL", value: settings.backOffice.thumbnailUrl, placeholder: "https://...", maxLength: 1024 }
            ]));
        }
        if (subSection === "user-balance") {
            return interaction.showModal(createModal("balance:action", "✦ จัดการยอดผู้ใช้", [
                { id: "action", label: "เลือกการจัดการ (add/remove/check)", value: "check", required: true, maxLength: 10 },
                { id: "userId", label: "Discord User ID", placeholder: "1442163370223730789", required: true, maxLength: 30 },
                { id: "amount", label: "จำนวน (ถ้ามี)", placeholder: "500", maxLength: 20 }
            ]));
        }
    }
    // Handle user-balance with subsections (add-balance, remove-balance, check-balance)
    if (type === "user-balance") {
        if (subSection === "add-balance") {
            return interaction.showModal(createModal("balance:add", "✦ Add Balance", [
                { id: "userId", label: "Discord User ID", placeholder: "1442163370223730789", required: true, maxLength: 30 },
                { id: "amount", label: "Amount", placeholder: "500", required: true, maxLength: 20 }
            ]));
        }
        if (subSection === "remove-balance") {
            return interaction.showModal(createModal("balance:remove", "✦ Remove Balance", [
                { id: "userId", label: "Discord User ID", placeholder: "1442163370223730789", required: true, maxLength: 30 },
                { id: "amount", label: "Amount", placeholder: "200", required: true, maxLength: 20 }
            ]));
        }
        if (subSection === "check-balance") {
            return interaction.showModal(createModal("balance:check", "✦ Check Balance", [
                { id: "userId", label: "Discord User ID", placeholder: "1442163370223730789", required: true, maxLength: 30 }
            ]));
        }
    }
}
/**
 * Shows the Bank Setup page with current configuration and edit buttons
 */
export async function showBankSetupPage(interaction, settings) {
    const { embed, components } = bankSetupEmbed(interaction.guildId, settings);
    await interaction.reply({ embeds: [embed], components, ephemeral: true });
}
/**
 * Shows the Notification Setup page with channel selectors
 */
export async function showNotificationSetupPage(interaction, settings) {
    const { embed, components } = notificationSetupEmbed(interaction.guildId, settings);
    await interaction.reply({ embeds: [embed], components, ephemeral: true });
}
async function openAppearanceModal(interaction, settings) {
    return interaction.showModal(createModal("settings:appearance", "✦ ดีไซน์ร้าน", [
        { id: "name", label: "ชื่อร้าน", value: settings.shop.storeName, required: true, maxLength: 100 },
        { id: "description", label: "คำอธิบายร้าน", value: settings.shop.description, required: true, style: TextInputStyle.Paragraph, maxLength: 1000 },
        { id: "footer", label: "ข้อความท้าย Embed", value: settings.shop.footer, required: true, maxLength: 200 },
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
export async function openCategoryModal(interaction, categoryId) {
    const category = categoryId ? await categoryRepository.find(categoryId) : undefined;
    return interaction.showModal(createModal(category ? `category:edit:${category.id}` : "category:create", category ? "✦ แก้ไขหมวดหมู่" : "✦ สร้างหมวดหมู่", [
        { id: "name", label: "ชื่อหมวดหมู่", value: category?.name, required: true, maxLength: 100 },
        { id: "description", label: "คำอธิบาย", value: category?.description, style: TextInputStyle.Paragraph, maxLength: 500 }
    ]));
}
export async function openProductModal(interaction, categoryId, product) {
    const details = product ? [product.imageUrl, product.requiredRoleId, product.buttonColor, product.emoji, product.status].map((item) => item || "-").join("\n") : "-\n-\nPrimary\n-\nactive";
    return interaction.showModal(createModal(product ? `product:edit:${product.id}` : `product:create:${categoryId}`, product ? "✦ แก้ไขสินค้า" : "✦ เพิ่มสินค้า", [
        { id: "name", label: "ชื่อสินค้า", value: product?.name, required: true, maxLength: 100 },
        { id: "description", label: "คำอธิบาย", value: product?.description, required: true, style: TextInputStyle.Paragraph, maxLength: 1000 },
        { id: "price", label: "ราคา (บาท)", value: product?.price.toString(), required: true, placeholder: "100", maxLength: 20 },
        { id: "stock", label: "จำนวนสต็อก (-1 = ไม่จำกัด)", value: product?.stock.toString() ?? "0", required: true, maxLength: 12 },
        { id: "details", label: "รายละเอียดสินค้า", value: details, placeholder: "รูป URL / Role ID / สี / Emoji / status (บรรทัดละ 1)", style: TextInputStyle.Paragraph, maxLength: 1024 }
    ]));
}
export async function handleModal(interaction) {
    if (!interaction.guildId)
        return;
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
            return interaction.reply({ content: `✔ สร้างหมวดหมู่ **${name}** แล้ว`, ephemeral: true });
        }
        const category = await categoryRepository.find(id);
        if (!category)
            return interaction.reply({ content: "○ ไม่พบหมวดหมู่นี้", ephemeral: true });
        category.name = name;
        category.description = description;
        category.updatedAt = new Date().toISOString();
        await categoryRepository.save(category);
        return interaction.reply({ content: `✔ บันทึกหมวดหมู่ **${name}** แล้ว`, ephemeral: true });
    }
    if (scope === "product") {
        const price = parseThaiNumber(value(interaction, "price"));
        const stock = Number(value(interaction, "stock"));
        if (price === undefined || !Number.isInteger(stock) || stock < -1)
            return interaction.reply({ content: "○ ราคา หรือสต็อกไม่ถูกต้อง", ephemeral: true });
        const [imageUrl, requiredRoleId, color, emoji, status] = splitLines(value(interaction, "details"));
        const fields = { name: value(interaction, "name"), description: value(interaction, "description"), price, stock, imageUrl: parseOptional(imageUrl), requiredRoleId: parseOptional(requiredRoleId), buttonColor: validColor(color), emoji: parseOptional(emoji), status: status === "inactive" ? "inactive" : "active", featured: false, guildId: interaction.guildId, tags: [] };
        if (action === "create") {
            if (!id)
                return interaction.reply({ content: "○ ไม่พบหมวดหมู่สินค้า", ephemeral: true });
            console.log("Modal ID =", id);
            console.log("Guild ID =", interaction.guildId);
            const product = productRepository.create(interaction.guildId, { ...fields, categoryId: id, hidden: false });
            await productRepository.save(product);
            return interaction.reply({ content: `✔ เพิ่มสินค้า **${product.name}** แล้ว`, ephemeral: true });
        }
        const product = await productRepository.find(id);
        if (!product)
            return interaction.reply({ content: "○ ไม่พบสินค้านี้", ephemeral: true });
        Object.assign(product, fields, { updatedAt: new Date().toISOString() });
        await productRepository.save(product);
        return interaction.reply({ content: `✔ บันทึกสินค้า **${product.name}** แล้ว`, ephemeral: true });
    }
    // Handle balance modals separately (scope = "balance")
    if (scope === "balance") {
        const userRepo = new UserRepository();
        const userId = value(interaction, "userId").trim();
        // Validate Discord User ID (must be numeric)
        if (!/^\d+$/.test(userId)) {
            return interaction.reply({ content: "○ Discord User ID ต้องเป็นตัวเลขเท่านั้น", ephemeral: true });
        }
        try {
            if (action === "add") {
                const amountStr = value(interaction, "amount");
                const amount = Number(amountStr);
                if (!Number.isInteger(amount) || amount <= 0) {
                    return interaction.reply({ content: "○ จำนวนต้องเป็นจำนวนเต็มบวก", ephemeral: true });
                }
                const user = await userRepo.updateBalance(interaction.guildId, userId, amount);
                return interaction.reply({ content: `✔ เพิ่มยอดแล้ว **${formatNumber(amount)}** คะแนน\nผู้ใช้: <@${userId}>\nยอดคงเหลือใหม่: **${formatNumber(user.balance)}**`, ephemeral: true });
            }
            if (action === "remove") {
                const amountStr = value(interaction, "amount");
                const amount = Number(amountStr);
                if (!Number.isInteger(amount) || amount <= 0) {
                    return interaction.reply({ content: "○ จำนวนต้องเป็นจำนวนเต็มบวก", ephemeral: true });
                }
                try {
                    const user = await userRepo.updateBalance(interaction.guildId, userId, -amount);
                    return interaction.reply({ content: `✔ ลบยอดแล้ว **${formatNumber(amount)}** คะแนน\nผู้ใช้: <@${userId}>\nยอดคงเหลือใหม่: **${formatNumber(user.balance)}**`, ephemeral: true });
                }
                catch (err) {
                    if (err.message === "INSUFFICIENT_BALANCE") {
                        return interaction.reply({ content: `○ ผู้ใช้มียอดไม่เพียงพอ\nยอดปัจจุบัน: **${formatNumber(await userRepo.getBalance(interaction.guildId, userId))}**`, ephemeral: true });
                    }
                    throw err;
                }
            }
            if (action === "check") {
                const client = interaction.client;
                return interaction.reply({
                    embeds: [await balanceEmbed(interaction.guildId, userId, client)],
                    ephemeral: true
                });
            }
            return interaction.reply({ content: "○ การดำเนินการไม่ถูกต้อง ใช้ add, remove หรือ check", ephemeral: true });
        }
        catch (error) {
            console.error("Error in balance management:", error);
            return interaction.reply({ content: "○ เกิดข้อผิดพลาดในการประมวลผล", ephemeral: true });
        }
    }
    // Handle settings modals (scope = "settings")
    if (scope === "payment") {
        const currentSettings = await settingsRepository.get(interaction.guildId);
        // TrueMoney phone number save
        if (action === "truemoney") {
            const phone = value(interaction, "phone").trim();
            // Validate 10 digits, numbers only
            if (!/^\d{10}$/.test(phone)) {
                return interaction.reply({ content: "○ Phone number must be exactly 10 digits", ephemeral: true });
            }
            await settingsRepository.update(interaction.guildId, (settings) => ({
                ...settings,
                payment: {
                    ...settings.payment,
                    trueMoneyPhone: phone
                }
            }));
            // Refresh the payment setup page
            const updatedSettings = await settingsRepository.get(interaction.guildId);
            const { paymentDashboardEmbed } = await import("../components/setupComponents.js");
            const { embed, components } = paymentDashboardEmbed(interaction.guildId, updatedSettings);
            return interaction.reply({ embeds: [embed], components, ephemeral: true });
        }
        // Bank account save
        if (action === "bank") {
            const bankName = value(interaction, "bankName").trim();
            const accountName = value(interaction, "accountName").trim();
            const accountNumber = value(interaction, "accountNumber").trim();
            if (!bankName || !accountName || !accountNumber) {
                return interaction.reply({ content: "○ All bank fields are required", ephemeral: true });
            }
            await settingsRepository.update(interaction.guildId, (settings) => ({
                ...settings,
                payment: {
                    ...settings.payment,
                    bank: {
                        ...settings.payment.bank,
                        bankName,
                        accountName,
                        accountNumber
                    }
                }
            }));
            // Refresh the bank setup page
            const updatedSettings = await settingsRepository.get(interaction.guildId);
            const { bankSetupEmbed } = await import("../components/setupComponents.js");
            const { embed, components } = bankSetupEmbed(interaction.guildId, updatedSettings);
            return interaction.reply({ embeds: [embed], components, ephemeral: true });
        }
        // QR image save
        if (action === "qr") {
            const qrImage = value(interaction, "qrImage").trim();
            if (!qrImage || !qrImage.startsWith("http")) {
                return interaction.reply({ content: "○ QR Image must be a valid URL", ephemeral: true });
            }
            await settingsRepository.update(interaction.guildId, (settings) => ({
                ...settings,
                payment: {
                    ...settings.payment,
                    bank: {
                        ...settings.payment.bank,
                        qrImage
                    }
                }
            }));
            // Refresh the bank setup page
            const updatedSettings = await settingsRepository.get(interaction.guildId);
            const { bankSetupEmbed } = await import("../components/setupComponents.js");
            const { embed, components } = bankSetupEmbed(interaction.guildId, updatedSettings);
            return interaction.reply({ embeds: [embed], components, ephemeral: true });
        }
        // Manual channel ID input for notification setup
        if (id === "topup:manual:submit") {
            const channelId = value(interaction, "channel_id").trim();
            // Validate Discord Snowflake (numeric, 17-19 digits)
            if (!/^\d{17,19}$/.test(channelId)) {
                return interaction.reply({ content: "Invalid channel ID. Please enter a valid text channel from this server.", ephemeral: true });
            }
            // Verify channel exists and is a text channel in this guild
            const guild = await interaction.client.guilds.fetch(interaction.guildId);
            const channel = guild.channels.cache.get(channelId);
            if (!channel || !channel.isTextBased()) {
                return interaction.reply({ content: "Invalid channel ID. Please enter a valid text channel from this server.", ephemeral: true });
            }
            await settingsRepository.update(interaction.guildId, (settings) => ({
                ...settings,
                payment: {
                    ...settings.payment,
                    logs: {
                        ...settings.payment.logs,
                        topupChannel: channelId
                    }
                }
            }));
            // Refresh the notification setup page
            const updatedSettings = await settingsRepository.get(interaction.guildId);
            const channels = guild.channels.cache.filter(c => c.isTextBased()).map(c => c);
            const { notificationSetupEmbed } = await import("../components/setupComponents.js");
            const { embed, components } = notificationSetupEmbed(interaction.guildId, updatedSettings, Array.from(channels));
            return interaction.reply({ embeds: [embed], components, ephemeral: true });
        }
        if (id === "purchase:manual:submit") {
            const channelId = value(interaction, "channel_id").trim();
            // Validate Discord Snowflake (numeric, 17-19 digits)
            if (!/^\d{17,19}$/.test(channelId)) {
                return interaction.reply({ content: "Invalid channel ID. Please enter a valid text channel from this server.", ephemeral: true });
            }
            // Verify channel exists and is a text channel in this guild
            const guild = await interaction.client.guilds.fetch(interaction.guildId);
            const channel = guild.channels.cache.get(channelId);
            if (!channel || !channel.isTextBased()) {
                return interaction.reply({ content: "Invalid channel ID. Please enter a valid text channel from this server.", ephemeral: true });
            }
            await settingsRepository.update(interaction.guildId, (settings) => ({
                ...settings,
                payment: {
                    ...settings.payment,
                    logs: {
                        ...settings.payment.logs,
                        purchaseChannel: channelId
                    }
                }
            }));
            // Refresh the notification setup page
            const updatedSettings = await settingsRepository.get(interaction.guildId);
            const channels = guild.channels.cache.filter(c => c.isTextBased()).map(c => c);
            const { notificationSetupEmbed } = await import("../components/setupComponents.js");
            const { embed, components } = notificationSetupEmbed(interaction.guildId, updatedSettings, Array.from(channels));
            return interaction.reply({ embeds: [embed], components, ephemeral: true });
        }
        return interaction.reply({ content: "○ Invalid payment action", ephemeral: true });
    }
    if (scope !== "settings")
        return;
    const subAction = parts[2]; // e.g., "appearance:basic" -> "basic"
    // Handle appearance subsections
    if (action === "appearance") {
        const currentSettings = await settingsRepository.get(interaction.guildId);
        const colorField = subAction === "branding" ? value(interaction, "color") :
            subAction === "basic" ? "#FFFFFF" : currentSettings.shop.embedColor;
        if (subAction === "branding" && !isValidHex(colorField)) {
            return interaction.reply({ content: "○ สี Embed ต้องอยู่ในรูปแบบ #RRGGBB", ephemeral: true });
        }
        await settingsRepository.update(interaction.guildId, (settings) => ({
            ...settings,
            shop: {
                ...settings.shop,
                storeName: subAction === "basic" ? value(interaction, "name") : settings.shop.storeName,
                description: subAction === "basic" ? value(interaction, "description") : settings.shop.description,
                footer: subAction === "basic" ? value(interaction, "footer") : settings.shop.footer,
                status: subAction === "basic" ? (value(interaction, "status").toLowerCase() === "closed" ? "closed" : "open") : settings.shop.status,
                banner: subAction === "images" ? parseOptional(value(interaction, "banner")) : settings.shop.banner,
                bannerGif: subAction === "images" ? parseOptional(value(interaction, "bannerGif")) : settings.shop.bannerGif,
                thumbnail: subAction === "images" ? parseOptional(value(interaction, "thumbnail")) : settings.shop.thumbnail,
                storeLogo: subAction === "images" ? parseOptional(value(interaction, "storeLogo")) : settings.shop.storeLogo,
                embedColor: (subAction === "branding" ? colorField : settings.shop.embedColor),
                authorName: subAction === "branding" ? parseOptional(value(interaction, "authorName")) : settings.shop.authorName,
                authorIcon: subAction === "branding" ? parseOptional(value(interaction, "authorIcon")) : settings.shop.authorIcon
            }
        }));
    }
    else if (action === "tickets:categories") {
        await settingsRepository.update(interaction.guildId, (settings) => ({
            ...settings,
            tickets: {
                ...settings.tickets,
                categoryId: parseOptional(value(interaction, "category")),
                supportCategoryId: parseOptional(value(interaction, "supportCategory"))
            }
        }));
    }
    else if (action === "tickets:staff") {
        await settingsRepository.update(interaction.guildId, (settings) => ({
            ...settings,
            tickets: {
                ...settings.tickets,
                staffRoleIds: value(interaction, "roles").split(",").map((r) => r.trim()).filter(Boolean),
                transcriptChannelId: parseOptional(value(interaction, "transcript")),
                ticketPrefix: value(interaction, "prefix")
            }
        }));
    }
    else if (action === "labels") {
        await settingsRepository.update(interaction.guildId, (settings) => ({ ...settings, shop: { ...settings.shop, buttons: { browse: value(interaction, "browse"), order: value(interaction, "order"), support: value(interaction, "support"), information: value(interaction, "information") } } }));
    }
    else if (action === "payment") {
        const bank = splitLines(value(interaction, "bank"));
        await settingsRepository.update(interaction.guildId, (settings) => ({ ...settings, payment: { ...settings.payment, enabled: value(interaction, "enabled").toLowerCase() === "yes", trueMoneyWallet: parseOptional(value(interaction, "wallet")), promptPay: parseOptional(value(interaction, "promptpay")), bankName: parseOptional(bank[0]), accountName: parseOptional(bank[1]), bankAccount: parseOptional(bank[2]) } }));
    }
    else if (action === "tickets") {
        await settingsRepository.update(interaction.guildId, (settings) => ({ ...settings, tickets: { categoryId: parseOptional(value(interaction, "category")), supportCategoryId: parseOptional(value(interaction, "supportCategory")), staffRoleIds: value(interaction, "roles").split(",").map((item) => item.trim()).filter(Boolean), transcriptChannelId: parseOptional(value(interaction, "transcript")), ticketPrefix: value(interaction, "prefix").replace(/[^a-z0-9-]/gi, "").toLowerCase() || "order" }, }));
    }
    else if (action === "bot") {
        await settingsRepository.update(interaction.guildId, (settings) => ({ ...settings, bot: { ...settings.bot, ownerId: parseOptional(value(interaction, "owner")), staffRoleIds: value(interaction, "roles").split(",").map((item) => item.trim()).filter(Boolean), maintenanceMode: value(interaction, "maintenance").toLowerCase() === "yes" } }));
    }
    else if (action === "backoffice" && subAction === "banner-image") {
        console.log("DEBUG backoffice save:", { action, subAction, imageUrl: value(interaction, "imageUrl"), thumbnailUrl: value(interaction, "thumbnailUrl") });
        await settingsRepository.update(interaction.guildId, (settings) => {
            const updated = {
                ...settings,
                backOffice: {
                    ...settings.backOffice,
                    imageUrl: parseOptional(value(interaction, "imageUrl")),
                    thumbnailUrl: parseOptional(value(interaction, "thumbnailUrl"))
                }
            };
            console.log("DEBUG backoffice updated settings.backOffice:", updated.backOffice);
            return updated;
        });
    }
    return interaction.reply({ content: "✔ บันทึกการตั้งค่าแล้ว  •  หน้าร้านจะอัปเดตทันที", ephemeral: true });
}
