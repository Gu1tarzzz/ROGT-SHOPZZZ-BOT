import { SlashCommandBuilder } from "discord.js";
import { shopButtons } from "../components/shopComponents.js";
import { settingsRepository } from "../database/repositories.js";
import { shopEmbed } from "../utils/discord.js";

export const shopCommand = {
  data: new SlashCommandBuilder().setName("shop").setDescription("เปิดหน้าร้าน ROGT SHOPZZZ"),
  async execute(interaction: import("discord.js").ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guildId) return;
    const settings = await settingsRepository.get(interaction.guildId);
    await interaction.reply({ embeds: [await shopEmbed(interaction.guildId)], components: [shopButtons(settings.shop)] });
  }
};
