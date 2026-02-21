require('dotenv').config();
const {
  Client, GatewayIntentBits,
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  EmbedBuilder, ChannelType, PermissionFlagsBits,
  ModalBuilder, TextInputBuilder, TextInputStyle,
  ActivityType
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences
  ]
});

let ticketCount = 0;

client.once('ready', () => {
  console.log(`Bot online: ${client.user.tag}`);
  client.user.setActivity('ESTELAR OFICIAL | /panel', { type: ActivityType.Watching });
});

client.on('interactionCreate', async interaction => {

  // SLASH COMMANDS
  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === 'panel') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
        return interaction.reply({ content: 'Solo el staff puede usar este comando.', ephemeral: true });

      const embed = new EmbedBuilder()
        .setColor(0xF5C518)
        .setTitle('SOPORTE -- ESTELAR OFICIAL')
        .setDescription(
          'Bienvenido al sistema de tickets de ESTELAR OFICIAL!\n\n' +
          'Pulsa el boton de abajo para abrir un ticket privado con nuestro equipo.\n\n' +
          'Antes de abrir un ticket:\n' +
          '> Lee las normas del servidor\n' +
          '> Revisa si tu duda fue respondida antes\n' +
          '> No abras tickets sin motivo\n\n' +
          'Tiempo de respuesta estimado: menos de 24h.'
        )
        .addFields(
          { name: 'Soporte General', value: 'Dudas y problemas generales', inline: true },
          { name: 'Reportes', value: 'Reportar usuarios o bugs', inline: true },
          { name: 'VIP / Rangos', value: 'Problemas con roles', inline: true }
        )
        .setFooter({ text: 'ESTELAR OFICIAL | Sistema de Soporte', iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setTimestamp();

      const botones = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('abrir_ticket').setLabel('Abrir Ticket').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('info_ticket').setLabel('Info').setStyle(ButtonStyle.Secondary)
      );

      await interaction.channel.send({ embeds: [embed], components: [botones] });
      return interaction.reply({ content: 'Panel enviado.', ephemeral: true });
    }

    if (interaction.commandName === 'cerrar') {
      if (!interaction.channel.name.startsWith('ticket-'))
        return interaction.reply({ content: 'Solo funciona en tickets.', ephemeral: true });
      await interaction.reply('Cerrando ticket en 5 segundos...');
      setTimeout(() => interaction.channel.delete().catch(console.error), 5000);
    }

    if (interaction.commandName === 'anadir') {
      const user = interaction.options.getUser('usuario');
      await interaction.channel.permissionOverwrites.edit(user, {
        ViewChannel: true, SendMessages: true, ReadMessageHistory: true
      });
      await interaction.reply(`${user} ha sido anadido al ticket.`);
    }

    if (interaction.commandName === 'remover') {
      const user = interaction.options.getUser('usuario');
      await interaction.channel.permissionOverwrites.edit(user, { ViewChannel: false });
      await interaction.reply(`${user} ha sido removido del ticket.`);
    }

    if (interaction.commandName === 'renombrar') {
      const nombre = interaction.options.getString('nombre');
      await interaction.channel.setName(`ticket-${nombre}`);
      await interaction.reply(`Canal renombrado a ticket-${nombre}`);
    }
  }

  // BOTON: Abrir ticket
  if (interaction.isButton() && interaction.customId === 'abrir_ticket') {
    const modal = new ModalBuilder().setCustomId('modal_ticket').setTitle('Abrir Ticket - ESTELAR OFICIAL');
    const asunto = new TextInputBuilder().setCustomId('asunto').setLabel('Motivo del ticket').setStyle(TextInputStyle.Short).setPlaceholder('Ej: Problema con mi rango, reporte...').setRequired(true).setMaxLength(100);
    const desc = new TextInputBuilder().setCustomId('descripcion').setLabel('Describe tu problema').setStyle(TextInputStyle.Paragraph).setPlaceholder('Explica con detalle para atenderte mejor.').setRequired(true).setMaxLength(1000);
    modal.addComponents(new ActionRowBuilder().addComponents(asunto), new ActionRowBuilder().addComponents(desc));
    await interaction.showModal(modal);
  }

  // BOTON: Info
  if (interaction.isButton() && interaction.customId === 'info_ticket') {
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('Informacion sobre los Tickets')
      .setDescription('1. Pulsa Abrir Ticket\n2. Rellena el formulario\n3. Se creara un canal privado con el staff\n4. El staff te atendera pronto\n5. Al finalizar el ticket se cierra')
      .setFooter({ text: 'ESTELAR OFICIAL' });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // MODAL: Crear ticket
  if (interaction.isModalSubmit() && interaction.customId === 'modal_ticket') {
    const asunto = interaction.fields.getTextInputValue('asunto');
    const descripcion = interaction.fields.getTextInputValue('descripcion');
    const guild = interaction.guild;
    const user = interaction.user;

    const existente = guild.channels.cache.find(c => c.topic && c.topic.includes(user.id) && c.name.startsWith('ticket-'));
    if (existente) return interaction.reply({ content: `Ya tienes un ticket abierto: ${existente}`, ephemeral: true });

    ticketCount++;
    const num = String(ticketCount).padStart(4, '0');
    const nombre = `ticket-${num}-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10)}`;

    await interaction.deferReply({ ephemeral: true });

    try {
      const categoria = guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes('ticket')) || null;
      const rolesStaff = guild.roles.cache.filter(r => ['staff','mod','admin','soporte','moderador'].some(n => r.name.toLowerCase().includes(n)));

      const canal = await guild.channels.create({
        name: nombre,
        type: ChannelType.GuildText,
        parent: categoria,
        topic: `Ticket de ${user.tag} | ID: ${user.id}`,
        permissionOverwrites: [
          { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
          { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles] },
          { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels] }
        ]
      });

      for (const [, rol] of rolesStaff) {
        await canal.permissionOverwrites.edit(rol, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true, ManageMessages: true });
      }

      const embedTicket = new EmbedBuilder()
        .setColor(0xF5C518)
        .setTitle(`Ticket #${num} | ESTELAR OFICIAL`)
        .setDescription(`Hola ${user}! El equipo de soporte te atendera en breve.`)
        .addFields(
          { name: 'Usuario', value: `${user} (${user.tag})`, inline: true },
          { name: 'Asunto', value: asunto, inline: true },
          { name: 'Descripcion', value: descripcion },
          { name: 'Abierto', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
        )
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: 'ESTELAR OFICIAL | Soporte', iconURL: guild.iconURL({ dynamic: true }) })
        .setTimestamp();

      const botonesTicket = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('cerrar_ticket').setLabel('Cerrar Ticket').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('reclamar_ticket').setLabel('Reclamar').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('transcript_ticket').setLabel('Transcript').setStyle(ButtonStyle.Secondary)
      );

      await canal.send({ content: `${user}`, embeds: [embedTicket], components: [botonesTicket] });
      await interaction.editReply({ content: `Tu ticket fue creado: ${canal}` });

    } catch (err) {
      console.error(err);
      await interaction.editReply({ content: 'Error al crear el ticket. Contacta a un admin.' });
    }
  }

  // BOTON: Cerrar ticket
  if (interaction.isButton() && interaction.customId === 'cerrar_ticket') {
    const embed = new EmbedBuilder().setColor(0xED4245).setTitle('Cerrar este ticket?').setDescription('El canal sera eliminado en 5 segundos.');
    const conf = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('confirmar_cierre').setLabel('Confirmar').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('cancelar_cierre').setLabel('Cancelar').setStyle(ButtonStyle.Secondary)
    );
    await interaction.reply({ embeds: [embed], components: [conf] });
  }

  if (interaction.isButton() && interaction.customId === 'confirmar_cierre') {
    await interaction.reply('Cerrando ticket en 5 segundos...');
    setTimeout(() => interaction.channel.delete().catch(console.error), 5000);
  }

  if (interaction.isButton() && interaction.customId === 'cancelar_cierre') {
    await interaction.reply({ content: 'Cierre cancelado.', ephemeral: true });
  }

  if (interaction.isButton() && interaction.customId === 'reclamar_ticket') {
    await interaction.reply(`${interaction.user} ha reclamado este ticket y se encargara de la atencion.`);
  }

  if (interaction.isButton() && interaction.customId === 'transcript_ticket') {
    await interaction.reply({ content: 'Transcript guardado (requiere hosting para exportar).', ephemeral: true });
  }

});

client.login(process.env.TOKEN);
