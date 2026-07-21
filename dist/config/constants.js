import { ButtonStyle } from "discord.js";
export const BRAND = "ROGT SHOPZZZ";
export const DIVIDER = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
export const THEME = {
    primary: "#8B5CF6",
    dark: "#0D0D0D",
    accent: "#A78BFA"
};
export const DEFAULT_STOCK_SETTINGS = {
    lowStockThreshold: 5,
    reservationDurationMinutes: 15,
    autoAlertsEnabled: true
};
export const DEFAULT_GUILD_SETTINGS = {
    shop: {
        storeName: "✦ ROGT SHOPZZZ ✦",
        description: "⋆˙⟡ ตลาดดิจิทัลพรีเมียมแห่ง Realm of Gu1tarzzz ⟡˙⋆",
        footer: "✦ Realm of Gu1tarzzz • Secure Marketplace ✦",
        embedColor: THEME.primary,
        status: "open",
        supportText: "ติดต่อทีมงานผ่านปุ่ม Support ได้ตลอดเวลา",
        marketplaceFeatures: [
            "⚡ จัดส่งอัตโนมัติ — รวดเร็ว ทันใจ",
            "🔒 ปลอดภัย 100% — การค้าที่ไว้ใจได้",
            "💬 ซัพพอร์ตตลอด 24ชม. — เราพร้อมช่วยเหลือคุณ",
            "⭐ สินค้าคุณภาพพรีเมียม — คัดสรรเพื่อคุณเท่านั้น"
        ],
        buttons: {
            browse: "🛒 Browse Store",
            order: "📦 Orders",
            support: "🎫 Support",
            information: "ℹ Information"
        }
    },
    payment: {
        enabled: false,
        instructions: "กรุณาชำระเงินตามช่องทางที่ร้านค้ากำหนด แล้วอัปโหลดสลิปในห้องนี้"
    },
    tickets: {
        staffRoleIds: [],
        ticketPrefix: "order"
    },
    bot: {
        staffRoleIds: [],
        locale: "th",
        maintenanceMode: false
    }
};
export const BUTTON_STYLES = {
    Primary: ButtonStyle.Primary,
    Secondary: ButtonStyle.Secondary,
    Success: ButtonStyle.Success,
    Danger: ButtonStyle.Danger
};
export const PRODUCT_BUTTON_COLORS = ["Primary", "Secondary", "Success", "Danger"];
