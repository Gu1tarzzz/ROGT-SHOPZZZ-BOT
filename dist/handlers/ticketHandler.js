import { ChannelType, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { ticketButtons, reviewButtons } from "../components/ticketComponents.js";
import { orderRepository, productRepository, settingsRepository, stockRepository } from "../database/repositories.js";
import { channelSlug, formatPrice } from "../utils/formatters.js";
import { hasStaffAccess } from "../utils/permissions.js";
import { DIVIDER, UI_EMOJI } from "../config/constants.js";
function paymentInstructions(settings) {
    const options = [
        settings.payment.trueMoneyWallet && `▸ TrueMoney  ${settings.payment.trueMoneyWallet}`,
        settings.payment.promptPay && `▸ PromptPay  ${settings.payment.promptPay}`,
        settings.payment.bankAccount && `▸ Bank  ${[settings.payment.bankName, settings.payment.accountName, settings.payment.bankAccount].filter(Boolean).join("  •  ")}`,
        settings.payment.qrImage && `▸ QR  ${settings.payment.qrImage}`
    ].filter(Boolean);
    return [settings.payment.instructions, ...options].filter(Boolean).join("\n");
}
export async function createOrderTicket(interaction, product) {
    if (!interaction.guild || !interaction.guildId)
        return;
    const guild = interaction.guild;
    const customer = await guild.members.fetch(interaction.user.id);
    const settings = await settingsRepository.get(guild.id);
    if (settings.bot.maintenanceMode)
        return interaction.reply({ content: "○ ขณะนี้ร้านอยู่ระหว่างปรับปรุง", ephemeral: true });
    if (settings.shop.status === "closed")
        return interaction.reply({ content: "○ ขณะนี้ร้านปิดปรับปรุง  •  กรุณาลองใหม่ภายหลัง", ephemeral: true });
    let availableStock = product?.stock ?? 0;
    if (product && product.stock >= 0) {
        const reservations = await stockRepository.getActiveReservations(product.id);
        const reservedQuantity = reservations.reduce((sum, r) => sum + r.quantity, 0);
        availableStock = product.stock - reservedQuantity;
    }
    if (product && (product.hidden || product.status !== "active" || availableStock <= 0))
        return interaction.reply({ content: "○ สินค้านี้ไม่พร้อมจำหน่าย", ephemeral: true });
    if (product?.requiredRoleId && !customer.roles.cache.has(product.requiredRoleId))
        return interaction.reply({ content: "○ คุณไม่มี Role ที่จำเป็นสำหรับสินค้านี้", ephemeral: true });
    if (product && !settings.payment.enabled)
        return interaction.reply({ content: "○ ร้านค้ายังไม่เปิดรับชำระเงิน  •  กรุณาติดต่อทีมงาน", ephemeral: true });
    await interaction.deferReply({ ephemeral: true });
    const label = product?.name ?? "support";
    const ticketCategory = product ? settings.tickets.categoryId : (settings.tickets.supportCategoryId || settings.tickets.categoryId);
    const overwrites = [
        { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: customer.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles] },
        ...[...new Set([...settings.tickets.staffRoleIds, ...settings.bot.staffRoleIds])].map((id) => ({ id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }))
    ];
    const channel = await guild.channels.create({
        name: `${product ? settings.tickets.ticketPrefix : "support"}-${channelSlug(customer.displayName)}-${Date.now().toString().slice(-4)}`,
        type: ChannelType.GuildText,
        parent: ticketCategory || undefined,
        permissionOverwrites: overwrites,
        reason: `ROGT marketplace ticket: ${label}`
    });
    const order = orderRepository.create({
        guildId: guild.id,
        channelId: channel.id,
        customerId: customer.id,
        customerName: customer.displayName,
        productId: product?.id,
        productName: label,
        price: product?.price ?? 0,
        finalPrice: product?.price ?? 0,
        discountAmount: 0,
        status: "pending_payment",
        type: product ? "order" : "support"
    });
    await orderRepository.save(order);
    if (product && product.stock >= 0) {
        await stockRepository.createReservation(guild.id, product.id, customer.id, 1, order.id, 15);
    }
    const embed = new EmbedBuilder()
        .setColor(settings.shop.embedColor)
        .setTitle("✦ ORDER DESK")
        .setDescription(product ? [
        `**${UI_EMOJI.text.section} คำสั่งซื้อใหม่**`,
        "",
        `${UI_EMOJI.text.bullet} สินค้า  **${product.name}**`,
        `${UI_EMOJI.text.bullet} ราคา  **${formatPrice(product.price)}**`,
        `${UI_EMOJI.text.bullet} ลูกค้า  <@${customer.id}>`,
        "",
        DIVIDER,
        "",
        `**${UI_EMOJI.text.section} ชำระเงิน**`,
        paymentInstructions(settings) || "กรุณารอทีมงานแจ้งรายละเอียดการชำระเงิน",
        "",
        DIVIDER,
        `${UI_EMOJI.text.bullet} หลังชำระเงิน เลือก **ส่งสลิป** แล้วแนบหลักฐานในห้องนี้`
    ].join("\n") : [
        `**${UI_EMOJI.text.section} ยินดีต้อนรับ <@${customer.id}>**`,
        "",
        DIVIDER,
        `${UI_EMOJI.text.bullet} แจ้งรายละเอียดที่ต้องการให้ทีมงานช่วยเหลือได้เลย`
    ].join("\n"))
        .setFooter({ text: `✦ Order ID: ${order.id}` })
        .setTimestamp();
    if (product?.imageUrl)
        embed.setThumbnail(product.imageUrl);
    await channel.send({ content: `<@${customer.id}>`, embeds: [embed], components: [ticketButtons(order.status)] });
    await interaction.editReply({ content: `✔ เปิด Ticket แล้ว  •  ${channel}` });
}
export async function promptSlip(interaction) {
    return interaction.reply({ content: "◆ ส่งรูปหรือไฟล์สลิปในห้องนี้  •  ระบบจะส่งให้ทีมงานตรวจสอบ", ephemeral: true });
}
export async function cancelTicket(interaction) {
    if (!interaction.guildId || !interaction.channelId)
        return;
    const order = await orderRepository.byChannel(interaction.channelId);
    if (!order || order.customerId !== interaction.user.id)
        return interaction.reply({ content: "○ เฉพาะผู้สร้าง Ticket เท่านั้นที่ยกเลิกได้", ephemeral: true });
    if (["approved", "closed", "refunded"].includes(order.status))
        return interaction.reply({ content: "○ ไม่สามารถยกเลิกรายการนี้ได้", ephemeral: true });
    if (order.productId && order.status === "pending_payment") {
        const reservations = await stockRepository.getActiveReservations(order.productId);
        const reservation = reservations.find((r) => r.orderId === order.id);
        if (reservation) {
            await stockRepository.cancelReservation(reservation.id);
        }
    }
    await setOrderStatus(order, "cancelled");
    await interaction.reply({ content: "✔ ยกเลิกคำสั่งซื้อแล้ว  •  ทีมงานได้รับแจ้ง", ephemeral: true });
    if (interaction.channel?.isSendable())
        await interaction.channel.send("○ คำสั่งซื้อนี้ถูกยกเลิกโดยลูกค้า");
}
export async function closeTicket(interaction) {
    if (!interaction.guild || !interaction.channel?.isSendable() || !interaction.channelId)
        return;
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const order = await orderRepository.byChannel(interaction.channelId);
    if (!order || (order.customerId !== member.id && !(await hasStaffAccess(member))))
        return interaction.reply({ content: "○ คุณไม่มีสิทธิ์ปิด Ticket นี้", ephemeral: true });
    if (order.status !== "approved" && order.status !== "cancelled")
        await setOrderStatus(order, "closed");
    const channel = interaction.channel;
    if ("permissionOverwrites" in channel)
        await channel.permissionOverwrites.edit(order.customerId, { SendMessages: false }, { reason: "ROGT ticket closed" });
    if ("setName" in channel && !channel.name.startsWith("closed-"))
        await channel.setName(`closed-${channel.name}`.slice(0, 100));
    await interaction.reply({ content: "✔ ปิด Ticket แล้ว", ephemeral: true });
    await channel.send("◆ Ticket นี้ถูกปิดแล้ว  •  หากต้องการความช่วยเหลือเพิ่มเติม กรุณาสร้าง Ticket ใหม่");
}
export async function forwardSlip(message) {
    if (!message.guild || !message.attachments.size || message.author.bot)
        return;
    const order = await orderRepository.byChannel(message.channelId);
    if (!order || order.type !== "order" || order.customerId !== message.author.id || ["approved", "cancelled", "closed", "refunded"].includes(order.status))
        return;
    const settings = await settingsRepository.get(message.guild.id);
    if (!settings.payment.slipChannelId) {
        await message.reply("○ ได้รับสลิปแล้ว แต่ร้านค้ายังไม่ได้ตั้งค่า Slip Channel");
        return;
    }
    const slipChannel = await message.guild.channels.fetch(settings.payment.slipChannelId).catch(() => null);
    if (!slipChannel?.isTextBased()) {
        await message.reply("○ ไม่พบ Slip Channel ที่ตั้งค่าไว้");
        return;
    }
    const attachment = message.attachments.first();
    const embed = new EmbedBuilder()
        .setColor(settings.shop.embedColor)
        .setTitle("✦ PAYMENT REVIEW")
        .setDescription([
        "**◆ สลิปรอการตรวจสอบ**",
        "",
        DIVIDER,
        `▸ สินค้า  **${order.productName}**`,
        `▸ ยอดชำระ  **${formatPrice(order.price)}**`,
        `▸ ลูกค้า  <@${order.customerId}>`,
        `▸ Ticket  <#${order.channelId}>`
    ].join("\n"))
        .setFooter({ text: `✦ Order ID: ${order.id}` })
        .setTimestamp();
    if (attachment?.contentType?.startsWith("image/"))
        embed.setImage(attachment.url);
    const review = await slipChannel.send({ embeds: [embed], files: attachment ? [attachment.url] : [], components: [reviewButtons(order.id)] });
    await setOrderStatus(order, "pending_review", review.id);
    await message.reply("✔ ส่งสลิปให้ทีมงานตรวจสอบแล้ว  •  กรุณารอการยืนยัน");
}
export async function reviewSlip(interaction, orderId, decision) {
    if (!interaction.guild)
        return;
    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (!(await hasStaffAccess(member)))
        return interaction.reply({ content: "○ เฉพาะทีมงานเท่านั้นที่ตรวจสอบสลิปได้", ephemeral: true });
    const order = await orderRepository.find(orderId);
    if (!order || order.guildId !== interaction.guild.id)
        return interaction.reply({ content: "○ ไม่พบคำสั่งซื้อนี้", ephemeral: true });
    const target = decision === "approve" ? "approved" : decision === "reject" ? "rejected" : "refunded";
    if (target === "approved" && order.productId) {
        const product = await productRepository.find(order.productId);
        if (product && product.stock >= 0) {
            const reservations = await stockRepository.getActiveReservations(product.id);
            const reservation = reservations.find((r) => r.orderId === order.id);
            const previousStock = product.stock;
            product.stock -= 1;
            product.updatedAt = new Date().toISOString();
            await productRepository.save(product);
            await stockRepository.logTransaction(interaction.guild.id, product.id, "purchase", -1, previousStock, member.id, order.id);
            if (reservation) {
                await stockRepository.cancelReservation(reservation.id);
            }
            // Auto-delivery: Find and deliver a stock item
            const availableItems = await stockRepository.getAvailableStockItems(product.id, 1);
            if (availableItems.length > 0) {
                const item = availableItems[0];
                await stockRepository.reserveStockItem(item.id, 5);
                await stockRepository.deliverStockItem(item.id, order.customerId);
                const ticketChannel = await interaction.guild.channels.fetch(order.channelId).catch(() => null);
                if (ticketChannel?.isSendable()) {
                    await ticketChannel.send({
                        content: `<@${order.customerId}> **✦ จัดส่งสินค้าแล้ว**\n${DIVIDER}\n\`\`\`${item.content}\`\`\`\n${DIVIDER}\n${UI_EMOJI.text.bullet} หากมีปัญหา กรุณาติดต่อทีมงาน`
                    });
                }
                await stockRepository.logPurchase({
                    guildId: interaction.guild.id,
                    customerId: order.customerId,
                    customerName: order.customerName,
                    productId: product.id,
                    productName: order.productName,
                    price: order.price,
                    finalPrice: order.finalPrice,
                    discountAmount: order.discountAmount,
                    couponCode: order.couponCode,
                    quantity: 1,
                    stockItemId: item.id,
                    orderId: order.id,
                    deliveredAt: new Date().toISOString()
                });
            }
            const settings = await settingsRepository.get(interaction.guild.id);
            if (product.stock <= 5 && product.stock > 0) {
                await stockRepository.createAlert(interaction.guild.id, product.id, "low_stock", 5, product.stock);
            }
            else if (product.stock === 0) {
                await stockRepository.createAlert(interaction.guild.id, product.id, "out_of_stock", 0, 0);
            }
            // Log order history
            await stockRepository.logOrderHistory({
                id: order.id,
                guildId: interaction.guild.id,
                customerId: order.customerId,
                customerName: ``,
                productId: product.id,
                productName: order.productName,
                price: order.price,
                finalPrice: order.price,
                discountAmount: 0,
                paymentStatus: "paid",
                deliveryStatus: "delivered",
                status: "approved",
                createdAt: order.createdAt,
                completedAt: new Date().toISOString()
            });
        }
    }
    else if (target === "rejected" || target === "refunded") {
        if (order.productId && order.status === "pending_review") {
            const reservations = await stockRepository.getActiveReservations(order.productId);
            const reservation = reservations.find((r) => r.orderId === order.id);
            if (reservation) {
                await stockRepository.cancelReservation(reservation.id);
                const product = await productRepository.find(order.productId);
                if (product) {
                    await stockRepository.logTransaction(interaction.guild.id, product.id, target === "refunded" ? "refund" : "cancellation", 0, product.stock, member.id, order.id, target === "refunded" ? "คืนเงินให้ลูกค้า" : "ปฏิเสธการชำระเงิน");
                }
            }
        }
    }
    await setOrderStatus(order, target);
    const labels = { approve: "อนุมัติ", reject: "ปฏิเสธ", refund: "คืนเงิน" };
    await interaction.update({ content: `✔ **${labels[decision]}แล้ว**  •  <@${member.id}>`, components: [] });
    const ticketChannel = await interaction.guild.channels.fetch(order.channelId).catch(() => null);
    if (ticketChannel?.isSendable())
        await ticketChannel.send(`◆ ทีมงานได้ **${labels[decision]}** การชำระเงินของ <@${order.customerId}> แล้ว`);
}
async function setOrderStatus(order, status, slipMessageId) {
    order.status = status;
    order.updatedAt = new Date().toISOString();
    if (slipMessageId)
        order.slipMessageId = slipMessageId;
    await orderRepository.save(order);
}
