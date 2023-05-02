const { informations } = require('../config.json');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.member.id == informations.clientId) return;

        // Commands interaction
        if (interaction.isChatInputCommand()){
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) return;

            try {
                console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'Une erreur est survenue pendant l\'exécution de la commande. Contactez un administrateur du serveur.', ephemeral: true });
            }
        }
    },
};