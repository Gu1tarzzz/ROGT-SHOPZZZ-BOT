import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
export function ticketButtons(status) {
    const locked = ["approved", "cancelled", "closed", "refunded"].includes(status);
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("ticket:slip").setLabel("อัปโหลดสลิป").setStyle(ButtonStyle.Primary).setDisabled(locked), new ButtonBuilder().setCustomId("ticket:cancel").setLabel("ยกเลิกคำสั่งซื้อ").setStyle(ButtonStyle.Secondary).setDisabled(locked), new ButtonBuilder().setCustomId("ticket:close").setLabel("ปิด Ticket").setStyle(ButtonStyle.Danger));
}
export function reviewButtons(orderId) {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`review:approve:${orderId}`).setLabel("อนุมัติ").setStyle(ButtonStyle.Success), new ButtonBuilder().setCustomId(`review:reject:${orderId}`).setLabel("ปฏิเสธ").setStyle(ButtonStyle.Danger), new ButtonBuilder().setCustomId(`review:refund:${orderId}`).setLabel("คืนเงิน").setStyle(ButtonStyle.Secondary));
}
