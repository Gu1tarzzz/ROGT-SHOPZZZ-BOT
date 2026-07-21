import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
export function createModal(id, title, fields) {
    const modal = new ModalBuilder().setCustomId(id).setTitle(title);
    for (const field of fields) {
        const input = new TextInputBuilder()
            .setCustomId(field.id)
            .setLabel(field.label)
            .setStyle(field.style ?? TextInputStyle.Short)
            .setRequired(field.required ?? false)
            .setMaxLength(field.maxLength ?? 1024);
        if (field.value)
            input.setValue(field.value);
        if (field.placeholder)
            input.setPlaceholder(field.placeholder);
        modal.addComponents(new ActionRowBuilder().addComponents(input));
    }
    return modal;
}
