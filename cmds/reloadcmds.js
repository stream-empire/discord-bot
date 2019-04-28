'use strict';

const fs = require('fs');
const stats = require('../functions/commandStatistics');
const owners = require('../functions/getOwners');

module.exports = {
    name: 'reloadcmds',

    exec: (client, msg, args) => {
        if (owners.isAdminOwner(msg.author.id)) {
            var commands = fs.readdirSync('./cmds');
            msg.channel.createMessage(`Unloading ${Object.values(client.commands).map(c => c.label).filter(c => c !== 'help').length} commands and loading ${commands.length} commands.`)
            Object.values(client.commands).map(c => c.label).filter(c => c !== 'help').forEach(c => {
                client.unregisterCommand(c);
            });
            console.log(`Loading ${commands.length} commands, please wait...`)
            commands.forEach(c => {
                delete require.cache[require.resolve(`../cmds/${c}`)]
                var cmdFile = require(`../cmds/${c}`);
                stats.initializeCommand(cmdFile.name);
                client.registerCommand(cmdFile.name, (msg, args) => cmdFile.exec(client, msg, args, nums.shardCount), cmdFile.options)
            });
        }
    },

    options: {
        hidden: true,
        fullDescription: 'Reloads all commands.'
    }
}