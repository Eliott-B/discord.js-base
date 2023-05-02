const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { informations, settings } = require('./config.json');

const client = new Client({ 
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers
    ]
  });

// Loading commands path
const commands = [];
client.commands = new Collection();

const commandsPath = path.join(__dirname, settings.commandsPath);
const commandsFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandsFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
}

const rest = new REST({ version: '10'}).setToken(informations.token);

rest.put(Routes.applicationGuildCommands(informations.clientId, informations.guildId), { body: commands})
    .then((data => console.log(`Successfully registered ${data.length} application commands.`)))
    .catch(console.error);

// Loading events path
const eventsPath = path.join(__dirname, settings.eventsPath);
const eventsFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventsFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Console log
client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));

client.login(informations.token);