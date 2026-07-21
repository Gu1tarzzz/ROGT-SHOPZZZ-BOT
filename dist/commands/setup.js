import { SlashCommandBuilder } from "discord.js";
import { showDashboard } from "../handlers/setupHandler.js";
export const setupCommand = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("เปิดแผงควบคุมผู้ดูแลร้านค้า"),
    execute: showDashboard
};
