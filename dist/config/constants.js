import { ButtonStyle } from "discord.js";
export const BRAND = "ROGT SHOPZZZ";
export const DIVIDER = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
export const SMALL_DIVIDER = "────────────────────";
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
        storeName: "✦ ROGT SHOPZZZ ✦",
        description: "⋆˙⟡ Premium Digital Marketplace ⟡˙⋆",
        footer: "Realm of Gu1tarzzz • Luxury Shopping Experience",
        embedColor: THEME.primary,
        status: "open",
        supportText: "Need assistance? Our team is here to help 24/7",
        marketplaceFeatures: [
            "✨ Instant Delivery — Automated fulfillment system",
            "🔒 Secure Trading — Verified & protected transactions",
            "💎 Premium Quality — Curated digital products",
            "⭐ 24/7 Support — Always available assistance"
        ],
        buttons: {
            browse: "🛒 Browse Store",
            order: "📦 My Orders",
            support: "🎫 Support",
            information: "ℹ️ Information"
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
