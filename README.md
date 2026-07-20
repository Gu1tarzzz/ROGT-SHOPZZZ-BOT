# ROGT SHOPZZZ

Discord marketplace bot for **Realm of Gu1tarzzz**, fully administered from Discord.

## Setup

1. Install Node.js 20+ and run `npm install`.
2. Copy `.env.example` to `.env` and fill in the values.
3. Run `npm run deploy` to register `/shop` and `/setup`.
4. Run `npm run dev` for development, or `npm run build` then `npm start` for production.

On first run, JSON data files are created in `database/`. Use `/setup` as the guild owner or an administrator to configure the shop, payments, tickets, and staff roles. Products and categories are never defined in source code.

## Required bot permissions

View Channels, Send Messages, Embed Links, Attach Files, Manage Channels, Manage Roles, Read Message History, and Use Application Commands.

For new Discord servers, configure a ticket category in **Ticket Settings** before creating orders.
