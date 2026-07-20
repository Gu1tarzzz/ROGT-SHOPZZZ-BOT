import { shopCommand } from "./shop.js";
import { setupCommand } from "./setup.js";

export const commands = [shopCommand, setupCommand] as const;
