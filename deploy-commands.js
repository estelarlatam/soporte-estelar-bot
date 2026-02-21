require('dotenv').config();
const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Envia el panel de soporte de ESTELAR OFICIAL')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .toJSON(),
  new SlashCommandBuilder()
    .setName('cerrar')
    .setDescription('Cierra el ticket actual')
    .toJSON(),
  new SlashCommandBuilder()
    .setName('anadir')
    .setDescription('Anade un usuario al ticket')
    .addUserOption(opt =>
      opt.setName('usuario').setDescription('Usuario a anadir').setRequired(true)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName('remover')
    .setDescription('Remueve un usuario del ticket')
    .addUserOption(opt =>
      opt.setName('usuario').setDescription('Usuario a remover').setRequired(true)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName('renombrar')
    .setDescription('Renombra el canal del ticket')
    .addStringOption(opt =>
      opt.setName('nombre').setDescription('Nuevo nombre').setRequired(true)
    )
    .toJSON(),
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Registrando slash commands...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('Slash commands registrados correctamente.');
  } catch (error) {
    console.error(error);
  }
})();
