import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";
import { registerInteractionHandler } from "./handlers/interactionHandler.js";
import { forwardSlip } from "./handlers/ticketHandler.js";

const token = process.env.DISCORD_TOKEN;
if (!token) throw new Error("DISCORD_TOKEN is missing. Copy .env.example to .env and add your bot token.");

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

registerInteractionHandler(client);
client.on("messageCreate", (message) => forwardSlip(message).catch((error) => console.error("Slip forwarding error", error)));
client.once("clientReady", (readyClient) => console.log(`ROGT SHOPZZZ is online as ${readyClient.user.tag}`));
client.login(token);
