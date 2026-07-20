import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export interface ModalField {
  id: string;
  label: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  style?: TextInputStyle;
  maxLength?: number;
}

export function createModal(id: string, title: string, fields: ModalField[]): ModalBuilder {
  const modal = new ModalBuilder().setCustomId(id).setTitle(title);
  for (const field of fields) {
    const input = new TextInputBuilder()
      .setCustomId(field.id)
      .setLabel(field.label)
      .setStyle(field.style ?? TextInputStyle.Short)
      .setRequired(field.required ?? false)
      .setMaxLength(field.maxLength ?? 1024);
    if (field.value) input.setValue(field.value);
    if (field.placeholder) input.setPlaceholder(field.placeholder);
    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(
      input
    ));
  }
  return modal;
}
