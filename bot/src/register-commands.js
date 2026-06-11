import "dotenv/config";
import { REST, Routes } from "discord.js";
import { commandJSON } from "./commands/index.js";

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
const route = process.env.DEV_GUILD_ID
  ? Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DEV_GUILD_ID)
  : Routes.applicationCommands(process.env.DISCORD_CLIENT_ID);

console.log(`Registering ${commandJSON.length} commands...`);
await rest.put(route, { body: commandJSON });
console.log("Done.");
