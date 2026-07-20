import { escapeMarkdown } from "discord.js";

export const truncate = (value: string, max = 100): string => value.length > max ? `${value.slice(0, max - 1)}…` : value;
export const cleanText = (value: string): string => escapeMarkdown(value.trim());
export const formatPrice = (price: number): string => new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0 }).format(price);
export const parseOptional = (value: string | null | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed && trimmed !== "-" ? trimmed : undefined;
};
export const parseThaiNumber = (value: string): number | undefined => {
  const parsed = Number(value.replace(/,/g, "").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};
export const isValidHex = (value: string): value is `#${string}` => /^#[0-9a-fA-F]{6}$/.test(value);
export const channelSlug = (value: string): string => value.toLowerCase().replace(/[^a-z0-9ก-๙]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "customer";
