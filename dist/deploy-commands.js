import "dotenv/config";
import { REST, Routes } from "discord.js";
import { commands } from "./commands/index.js";
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
if (!token || !clientId)
    throw new Error("DISCORD_TOKEN and CLIENT_ID are required in .env");
const rest = new REST({ version: "10" }).setToken(token);
const body = commands.map((command) => command.data.toJSON());
const route = guildId ? Routes.applicationGuildCommands(clientId, guildId) : Routes.applicationCommands(clientId);
await rest.put(route, { body });
console.log(`Registered ${body.length} command(s) ${guildId ? `for guild ${guildId}` : "globally"}.`);
