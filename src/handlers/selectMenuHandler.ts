import type { StringSelectMenuInteraction } from "discord.js";
import { productMenu, productOrderButton, browseMenu } from "../components/shopComponents.js";
import { categoryRepository, productRepository, settingsRepository } from "../database/repositories.js";
import { handleCategoryPick, handleProductPick } from "./buttonHandler.js";
import { showSetupSection } from "./setupHandler.js";
import { premiumEmbed, shopEmbed } from "../utils/discord.js";
import { formatPrice } from "../utils/formatters.js";
import { hasAdminAccess } from "../utils/permissions.js";

async function admin(interaction: StringSelectMenuInteraction): Promise<boolean> {
  if (!interaction.guild) return false;
  const member = await interaction.guild.members.fetch(interaction.user.id);
  if (await hasAdminAccess(member)) return true;
  await interaction.reply({ content: "คุณไม่มีสิทธิ์เข้าถึง Admin Panel", ephemeral: true });
  return false;
}

export async function handleSelectMenu(interaction: StringSelectMenuInteraction): Promise<unknown> {
  if (!interaction.guildId) return;
  const [scope, action, extra] = interaction.customId.split(":");
  if (scope === "shop") {
    if (action === "browse") {
      const selectedValue = interaction.values[0];
      
      // Handle category selection (cat:categoryId)
      if (selectedValue.startsWith("cat:")) {
        const categoryId = selectedValue.replace("cat:", "");
        const category = await categoryRepository.find(categoryId);
        const products = (await productRepository.list(interaction.guildId, false)).filter((product) => product.categoryId === categoryId && product.stock !== 0);
        if (!products.length) return interaction.update({ content: "This category has no available products.", components: [] });
        const embed = await premiumEmbed(interaction.guildId, category?.name ?? "Products", category?.description || "Select a product to view details.");
        return interaction.update({ embeds: [embed], components: [productMenu(products)] });
      }
      
      // Handle direct product selection (prod:productId)
      if (selectedValue.startsWith("prod:")) {
        const productId = selectedValue.replace("prod:", "");
        const product = await productRepository.find(productId);
        if (!product || product.hidden || product.status !== "active") return interaction.update({ content: "This product is not available.", components: [] });
        const embed = await premiumEmbed(interaction.guildId, product.name, `${product.description}\n\n**Price:** ${formatPrice(product.price)}\n**Stock:** ${product.stock < 0 ? "Unlimited" : product.stock}`);
        if (product.imageUrl) embed.setImage(product.imageUrl);
        return interaction.update({ embeds: [embed], components: [productOrderButton(product)] });
      }
      
      return interaction.update({ content: "Invalid selection.", components: [] });
    }
    if (action === "category") {
      const category = await categoryRepository.find(interaction.values[0]);
      const products = (await productRepository.list(interaction.guildId, false)).filter((product) => product.categoryId === category?.id && (product.stock !== 0));
      if (!products.length) return interaction.update({ content: "หมวดหมู่นี้ยังไม่มีสินค้าที่พร้อมจำหน่าย", components: [] });
      const embed = await premiumEmbed(interaction.guildId, category?.name ?? "สินค้า", category?.description || "เลือกสินค้าที่ต้องการ");
      return interaction.update({ embeds: [embed], components: [productMenu(products)] });
    }
    if (action === "product") {
      const product = await productRepository.find(interaction.values[0]);
      if (!product || product.hidden || product.status !== "active") return interaction.update({ content: "สินค้านี้ไม่พร้อมจำหน่าย", components: [] });
      const embed = await premiumEmbed(interaction.guildId, product.name, `${product.description}\n\n**ราคา:** ${formatPrice(product.price)}\n**สต็อก:** ${product.stock < 0 ? "ไม่จำกัด" : product.stock}`);
      if (product.imageUrl) embed.setImage(product.imageUrl);
      return interaction.update({ embeds: [embed], components: [productOrderButton(product)] });
    }
  }
  if (!(await admin(interaction))) return;
  if (scope === "setup" && action === "section") return showSetupSection(interaction, interaction.values[0]);
  if (scope === "category" && action === "pick") return handleCategoryPick(interaction, extra as "edit" | "delete" | "visibility" | "sort");
  if (scope === "product" && action === "pick") return handleProductPick(interaction, extra as "create" | "edit" | "delete" | "visibility");
}
