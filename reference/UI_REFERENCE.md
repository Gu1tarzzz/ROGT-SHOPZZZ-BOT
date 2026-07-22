You are a Senior Discord Bot Architect, UI/UX Designer and TypeScript Engineer.

Before making ANY code changes:

1. Open the folder:

/reference

2. Read every file inside it.

3. Inspect every PNG image inside the folder.

Those images are the OFFICIAL design reference.

The UI shown in those images is the source of truth.

If the current implementation differs from the reference images,
always follow the reference images.

Never invent your own UI.

Never redesign freely.

====================================================
PROJECT RULES
====================================================

This is a COMPLETE UI/UX redesign.

Do NOT change business logic.

Do NOT change database structure unless absolutely required.

Preserve:

• payment system
• stock system
• purchase system
• ticket system
• admin system
• slash commands
• backend logic

Only redesign the UI architecture.

====================================================
GOAL
====================================================

Create a Premium Discord Marketplace similar to:

• FriendBooster
• Flexzy
• Valen Shop

The final UI should feel:

• Modern
• Minimal
• Luxury
• Fantasy
• Professional

Compact spacing.

Small sections.

No huge paragraphs.

====================================================
SHOP FLOW
====================================================

/shop

↓

Main Shop Embed
(Always stays forever)

↓

Category Select Menu

↓

User selects category

↓

Create a NEW Ephemeral Product Browser

↓

User selects product

↓

Create a NEW Ephemeral Product Preview

↓

User clicks Purchase

↓

Create a NEW Checkout Embed

↓

Payment

↓

Ticket

IMPORTANT

Never replace the Main Shop Embed.

Never edit the Main Shop Embed after publishing.

====================================================
MAIN SHOP EMBED
====================================================

Contains ONLY

• Shop Name
• Subtitle
• Store Statistics
• Payment Methods
• Store Features
• Banner Image

Below:

Category Select Menu

Below:

Top Up
Credit
History

No Product Preview here.

====================================================
PRODUCT BROWSER
====================================================

Selecting a category opens a NEW Ephemeral Product Browser.

This browser contains:

• Product Select Menu
• Product List
• Stock
• Price

It should never edit the Main Shop Embed.

====================================================
PRODUCT PREVIEW
====================================================

Selecting a product opens another NEW Ephemeral Embed.

Contains

• Product Name
• Description
• Price
• Stock
• Product Image
• Purchase Button

====================================================
CHECKOUT
====================================================

Purchase Button

↓

NEW Embed

Contains

• Product
• Price
• Quantity
• Payment Method
• Confirm
• Cancel

====================================================
SETUP DASHBOARD
====================================================

Redesign /setup completely.

Make it feel like a Dashboard.

Use sections.

💎 Store Design

📦 Categories

🛒 Products

💳 Payment

🎟 Ticket

⚙ System

📊 Statistics

🖼 Media

====================================================
STORE DESIGN
====================================================

Store Design opens a Modal.

Fields

Store Name

Subtitle

Description

Banner URL

Thumbnail URL

Footer

Accent Color

Save

After saving

Automatically update the Main Shop Embed.

====================================================
REMOVE
====================================================

Remove hardcoded texts like

"Welcome to our premium marketplace."

"Browse categories below."

Everything should come from Store Design settings.

If empty

Use clean defaults.

====================================================
STORE FEATURES
====================================================

Configurable

Owner can enable/disable

• Instant Delivery

• Secure Payment

• Auto Stock

• Support

• Warranty

• Refund

====================================================
STATISTICS
====================================================

Automatically calculate

• Categories

• Products

• Available

• Total Stock

====================================================
STYLE
====================================================

Inspired by

• FriendBooster
• Flexzy
• Valen Shop

Premium

Minimal

Luxury

Dark Mode

Fantasy

Apple

Steam

Epic Games

Compact spacing.

====================================================
EMOJI STYLE
====================================================

Use ONLY clean Unicode emoji.

Examples

🏪
🛒
📦
📂
💳
💎
🎟
📊
🖼
⚙
📁
💰
⭐
✨
🔥
📜
🧾
📬
📌
🔔
📈
📉
💬
🔒
🟢
🔴
🟡

Never use ASCII decorations.

Never spam emoji.

Maximum one emoji per heading.

====================================================
ARCHITECTURE
====================================================

Keep everything modular.

Separate:

• Embed Builders

• Modal Builders

• Dashboard Components

• UI Components

• Shop Components

• Setup Components

Keep the code clean and maintainable.

====================================================
FINAL TASK
====================================================

Before writing any code:

1. Inspect every image inside /reference.

2. Follow those images as closely as possible.

3. If there is any conflict between the current UI and the reference images,

ALWAYS FOLLOW THE REFERENCE IMAGES.

When finished:

• Build successfully.
• No TypeScript errors.
• Create a Pull Request.