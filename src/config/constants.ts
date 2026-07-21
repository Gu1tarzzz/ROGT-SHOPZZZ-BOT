import { ButtonStyle } from "discord.js";
import type { ButtonColor, GuildSettings, HexColor } from "../types.js";

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
  primary: "#8B5CF6" as HexColor,      // Vibrant purple
  primaryDark: "#6D28D9" as HexColor,  // Deep purple
  primaryLight: "#A78BFA" as HexColor, // Soft lavender
  
  // Accent colors (gold/magic)
  accent: "#FBBF24" as HexColor,       // Magical gold
  accentDark: "#D97706" as HexColor,   // Amber
  
  // Background & Surface colors (dark mode)
  dark: "#0D0D0D" as HexColor,         // Deep black
  surface: "#1A1A1A" as HexColor,      // Card background
  surfaceElevated: "#242424" as HexColor, // Elevated cards
  
  // Status colors
  success: "#10B981" as HexColor,      // Emerald green
  danger: "#EF4444" as HexColor,       // Ruby red
  warning: "#F59E0B" as HexColor,      // Amber
  
  // Text colors
  textPrimary: "#FFFFFF" as HexColor,
  textSecondary: "#A3A3A3" as HexColor,
  textMuted: "#737373" as HexColor
};

export const DEFAULT_STOCK_SETTINGS = {
  lowStockThreshold: 5,
  reservationDurationMinutes: 15,
  autoAlertsEnabled: true
} as const;

export const DEFAULT_GUILD_SETTINGS: GuildSettings = {
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

export const BUTTON_STYLES: Record<ButtonColor, ButtonStyle> = {
  Primary: ButtonStyle.Primary,
  Secondary: ButtonStyle.Secondary,
  Success: ButtonStyle.Success,
  Danger: ButtonStyle.Danger
};

export const PRODUCT_BUTTON_COLORS: ButtonColor[] = ["Primary", "Secondary", "Success", "Danger"];
