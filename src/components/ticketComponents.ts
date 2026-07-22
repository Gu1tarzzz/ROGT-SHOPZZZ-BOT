import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import type { OrderStatus } from "../types.js";

export function ticketButtons(status: OrderStatus): ActionRowBuilder<ButtonBuilder> {
  const locked = ["approved", "cancelled", "closed", "refunded"].includes(status);
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("ticket:slip").setLabel("ส่งสลิป").setStyle(ButtonStyle.Primary).setEmoji("💳").setDisabled(locked),
    new ButtonBuilder().setCustomId("ticket:cancel").setLabel("ยกเลิก").setStyle(ButtonStyle.Secondary).setEmoji("💬").setDisabled(locked),
    new ButtonBuilder().setCustomId("ticket:close").setLabel("ปิด Ticket").setStyle(ButtonStyle.Danger).setEmoji("🎫")
  );
}

export function reviewButtons(orderId: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`review:approve:${orderId}`).setLabel("อนุมัติ").setStyle(ButtonStyle.Success).setEmoji("✅"),
    new ButtonBuilder().setCustomId(`review:reject:${orderId}`).setLabel("ปฏิเสธ").setStyle(ButtonStyle.Danger).setEmoji("❌"),
    new ButtonBuilder().setCustomId(`review:refund:${orderId}`).setLabel("คืนเงิน").setStyle(ButtonStyle.Secondary).setEmoji("💳")
  );
}
