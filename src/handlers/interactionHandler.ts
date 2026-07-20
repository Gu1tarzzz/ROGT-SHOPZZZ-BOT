import type { Client, Interaction } from "discord.js";
import { commands } from "../commands/index.js";
import { handleButton } from "./buttonHandler.js";
import { handleModal } from "./modalHandler.js";
import { handleSelectMenu } from "./selectMenuHandler.js";
import { hasAdminAccess } from "../utils/permissions.js";

export function registerInteractionHandler(client: Client): void {
  client.on("interactionCreate", async (interaction: Interaction) => {
    try {
      if (interaction.isChatInputCommand()) {
        const command = commands.find((item) => item.data.name === interaction.commandName);
        if (!command) return;
        if (interaction.commandName === "setup") {
          if (!interaction.guild) return interaction.reply({ content: "คำสั่งนี้ใช้ได้เฉพาะในเซิร์ฟเวอร์", ephemeral: true });
          const member = await interaction.guild.members.fetch(interaction.user.id);
          if (!(await hasAdminAccess(member))) return interaction.reply({ content: "เฉพาะ Owner, Administrator หรือ Staff Role ที่ตั้งค่าไว้เท่านั้น", ephemeral: true });
        }
        await command.execute(interaction);
      } else if (interaction.isButton()) {
        await handleButton(interaction);
      } else if (interaction.isStringSelectMenu()) {
        await handleSelectMenu(interaction);
      } else if (interaction.isModalSubmit()) {
        const member = interaction.guild ? await interaction.guild.members.fetch(interaction.user.id) : undefined;
        if (!member || !(await hasAdminAccess(member))) return interaction.reply({ content: "คุณไม่มีสิทธิ์แก้ไขการตั้งค่า", ephemeral: true });
        await handleModal(interaction);
      }
    } catch (error) {
      console.error("Interaction handler error", error);
      const message = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      if (interaction.isRepliable()) {
        if (interaction.replied || interaction.deferred) await interaction.followUp({ content: message, ephemeral: true }).catch(() => undefined);
        else await interaction.reply({ content: message, ephemeral: true }).catch(() => undefined);
      }
    }
  });
}
