import { ButtonStyle } from "discord.js";
export const BRAND = "ROGT SHOPZZZ";
export const DIVIDER = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
export const DEFAULT_STOCK_SETTINGS = {
    lowStockThreshold: 5,
    reservationDurationMinutes: 15,
    autoAlertsEnabled: true
};
export const DEFAULT_GUILD_SETTINGS = {
    shop: {
        storeName: BRAND,
        description: "ตลาดดิจิทัลพรีเมียมแห่ง Realm of Gu1tarzzz",
        footer: "Realm of Gu1tarzzz • Secure Marketplace",
        embedColor: "#9B7BFF",
        status: "open",
        supportText: "ติดต่อทีมงานผ่านปุ่ม Support ได้ตลอดเวลา",
        marketplaceFeatures: ["✅ จัดส่งอัตโนมัติ", "🔒 ปลอดภัย 100%", "💬 ซัพพอร์ตตลอด 24ชม.", "⭐ สินค้าคุณภาพพรีเมียม"],
        buttons: {
            browse: "เลือกชมสินค้า",
            order: "สร้างคำสั่งซื้อ",
            support: "ติดต่อทีมงาน",
            information: "ข้อมูลร้านค้า"
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
