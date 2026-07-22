import { SlashCommandBuilder } from "discord.js";
import { shopButtons } from "../components/shopComponents.js";
import { settingsRepository } from "../database/repositories.js";
import { shopEmbed } from "../utils/discord.js";
export const shopCommand = {
    data: new SlashCommandBuilder().setName("shop").setDescription("เปิดหน้าร้านพรีเมียม ROGT SHOPZZZ"),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const settings = await settingsRepository.get(interaction.guildId);
        const buttonRows = shopButtons(settings.shop, false);
        await interaction.reply({ embeds: [await shopEmbed(interaction.guildId)], components: buttonRows });
        // Fetch the actual message to get correct ID and channelId
        const message = await interaction.fetchReply();
        // Save published shop message ID and channel ID
        await settingsRepository.update(interaction.guildId, (currentSettings) => ({
            ...currentSettings,
            shop: {
                ...currentSettings.shop,
                publishedMessageId: message.id,
                publishedChannelId: message.channelId
            }
        }));
    }
};
