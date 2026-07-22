import { ButtonStyle } from "discord.js";
export const BRAND = "ROGT SHOPZZZ";
/** Shared visual language. `text` symbols stay inside embeds; `component`
 * values are valid Unicode emoji intended for buttons and select menus. */
export const UI_EMOJI = {
    text: {
        brand: "✦",
        section: "✦",
        bullet: "•",
        active: "●",
        inactive: "○",
        success: "✔"
    },
    component: {
        browse: "🛒",
        product: "📦",
        catalog: "🛍️",
        payment: "💳",
        bank: "🏦",
        category: "📁",
        categories: "📂",
        analytics: "📈",
        history: "📜",
        ticket: "🎫",
        support: "💬",
        star: "⭐",
        refresh: "🔄",
        gem: "💎",
        settings: "⚙️",
        back: "🔙",
        image: "🖼️",
        edit: "📝",
        remove: "🗑️",
        owner: "👑",
        alert: "🔥",
        approve: "✅",
        reject: "❌",
        decrease: "📉"
    }
};
// Single consistent divider style - clean line with brand markers
export const DIVIDER = `${UI_EMOJI.text.brand}━━━━━━━━━━━━━━━━━━━━${UI_EMOJI.text.brand}`;
export const SECTION_SPACER = "\n\u200b\n"; // Zero-width space for clean section breaks
// ═══════════════════════════════════════════════════════════════
// PREMIUM THEME - ROGT SHOPZZZ
// Fantasy • Magic • Luxury • Dark Mode
// Inspired by: Steam Store, Riot Games, Epic Games Store
// ═══════════════════════════════════════════════════════════════
export const THEME = {
    // Primary gradient colors (purple/violet magic theme)
    primary: "#8B5CF6", // Vibrant purple
    primaryDark: "#6D28D9", // Deep purple
    primaryLight: "#A78BFA", // Soft lavender
    // Accent colors (gold/magic)
    accent: "#FBBF24", // Magical gold
    accentDark: "#D97706", // Amber
    // Background & Surface colors (dark mode)
    dark: "#0D0D0D", // Deep black
    surface: "#1A1A1A", // Card background
    surfaceElevated: "#242424", // Elevated cards
    // Status colors
    success: "#10B981", // Emerald green
    danger: "#EF4444", // Ruby red
    warning: "#F59E0B", // Amber
    // Text colors
    textPrimary: "#FFFFFF",
    textSecondary: "#A3A3A3",
    textMuted: "#737373"
};
export const DEFAULT_STOCK_SETTINGS = {
    lowStockThreshold: 5,
    reservationDurationMinutes: 15,
    autoAlertsEnabled: true
};
export const DEFAULT_GUILD_SETTINGS = {
    shop: {
        storeName: "ROGT SHOPZZZ",
        description: "Premium marketplace of Realm of Gu1tarzzz",
        footer: "Realm of Gu1tarzzz  •  Premium Marketplace",
        embedColor: THEME.primary,
        status: "open",
        supportText: "ทีมงานพร้อมดูแลทุกคำสั่งซื้อ",
        marketplaceFeatures: [
            "จัดส่งรวดเร็ว",
            "ชำระเงินอย่างปลอดภัย",
            "สินค้าคัดสรรคุณภาพ",
            "ดูแลโดยทีมงาน"
        ],
        buttons: {
            browse: "เลือกชมสินค้า",
            order: "สร้างคำสั่งซื้อ",
            support: "ติดต่อทีมงาน",
            information: "ข้อมูลร้าน"
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
