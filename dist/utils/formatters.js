import { escapeMarkdown } from "discord.js";
export const truncate = (value, max = 100) => value.length > max ? `${value.slice(0, max - 1)}…` : value;
export const cleanText = (value) => escapeMarkdown(value.trim());
export const formatPrice = (price) => new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0 }).format(price);
export const formatNumber = (num) => new Intl.NumberFormat("th-TH").format(num);
export const formatStock = (stock, reserved = 0) => {
    if (stock < 0)
        return "ไม่จำกัด";
    if (reserved > 0)
        return `${stock - reserved} / ${stock}`;
    return stock.toString();
};
export const parseOptional = (value) => {
    const trimmed = value?.trim();
    return trimmed && trimmed !== "-" ? trimmed : undefined;
};
export const parseThaiNumber = (value) => {
    const parsed = Number(value.replace(/,/g, "").trim());
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};
export const isValidHex = (value) => /^#[0-9a-fA-F]{6}$/.test(value);
export const channelSlug = (value) => value.toLowerCase().replace(/[^a-z0-9ก-๙]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "customer";
