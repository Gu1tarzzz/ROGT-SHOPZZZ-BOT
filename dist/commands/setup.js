import { SlashCommandBuilder } from "discord.js";
import { showDashboard } from "../handlers/setupHandler.js";
export const setupCommand = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("เปิดศูนย์ควบคุมร้านค้า"),
    execute: showDashboard
};
