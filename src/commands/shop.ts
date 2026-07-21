import { SlashCommandBuilder } from "discord.js";
import { shopButtons } from "../components/shopComponents.js";
import { settingsRepository } from "../database/repositories.js";
import { shopEmbed } from "../utils/discord.js";

export const shopCommand = {
  data: new SlashCommandBuilder().setName("shop").setDescription("เปิดหน้าร้าน ROGT SHOPZZZ"),
  async execute(interaction: import("discord.js").ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guildId) return;
    const settings = await settingsRepository.get(interaction.guildId);
    const buttonRows = shopButtons(settings.shop, false);
    const reply = await interaction.reply({ embeds: [await shopEmbed(interaction.guildId)], components: buttonRows });
    
    // Save published shop message ID and channel ID
    await settingsRepository.update(interaction.guildId, (currentSettings) => ({
      ...currentSettings,
      shop: {
        ...currentSettings.shop,
        publishedMessageId: reply.id,
        publishedChannelId: interaction.channelId
      }
    }));
  }
};
