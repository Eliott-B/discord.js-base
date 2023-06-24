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
for (let file of commandsFiles) {
    var filePath = path.join(commandsPath, file);
    var command = require(filePath);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
}

// Subfolders
const folders = fs.readdirSync(commandsPath).filter(file => !file.endsWith('.js'));
for (let folder of folders) {
    var folderPath = path.join(commandsPath, folder);
    var files = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    for (let file of files) {
        var filePath = path.join(folderPath, file);
        var command = require(filePath);
        commands.push(command.data.toJSON());
        client.commands.set(command.data.name, command);
    }
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