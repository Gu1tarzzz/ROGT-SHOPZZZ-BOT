import type { GuildMember } from "discord.js";
import { PermissionFlagsBits } from "discord.js";
import { settingsRepository } from "../database/repositories.js";

export async function hasAdminAccess(member: GuildMember): Promise<boolean> {
  const settings = await settingsRepository.get(member.guild.id);
  if (member.id === member.guild.ownerId || member.id === settings.bot.ownerId || member.permissions.has(PermissionFlagsBits.Administrator)) return true;
  const staffRoles = new Set([...settings.bot.staffRoleIds, ...settings.tickets.staffRoleIds]);
  return member.roles.cache.some((role) => staffRoles.has(role.id));
}

export async function hasStaffAccess(member: GuildMember): Promise<boolean> {
  return hasAdminAccess(member);
}
