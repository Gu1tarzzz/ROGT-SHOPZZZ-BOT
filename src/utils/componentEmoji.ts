import type { APIMessageComponentEmoji } from "discord.js";

const INVALID_COMPONENT_SYMBOLS = new Set([
  "✦", "✧", "◆", "◇", "▸", "▪", "▫", "○", "●", "✔", "▲", "▼", "◀"
]);

const CUSTOM_EMOJI = /^<(a?):([\w-]+):(\d+)>$/;
const UNICODE_EMOJI = /^(?:\p{Extended_Pictographic}|\p{Emoji_Presentation})(?:\uFE0F|\u200D|\p{Extended_Pictographic}|\p{Emoji_Presentation}|\p{Emoji_Modifier})*$/u;

/**
 * Produces a Discord-safe component emoji. Decorative glyphs belong in embed
 * text only; invalid configured values fall back to the supplied real emoji.
 */
export function componentEmoji(value: string | undefined, fallback: string): APIMessageComponentEmoji {
  const candidate = value?.trim();
  if (!candidate || INVALID_COMPONENT_SYMBOLS.has(candidate)) return { name: fallback };

  const custom = candidate.match(CUSTOM_EMOJI);
  if (custom) return { id: custom[3], name: custom[2], animated: custom[1] === "a" };

  return UNICODE_EMOJI.test(candidate) ? { name: candidate } : { name: fallback };
}
