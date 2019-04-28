 const dotenv = require('dotenv'),
    fs = require('fs');
dotenv.config();
const token = process.env.DISCORDTOKEN,
    Eris = require('eris'),
    client = new Eris.CommandClient(token, {getAllUsers: true}, {description: `Stream Empires Bot`, owner: `Stream Empires Team`, prefix: `!`}),
    stats = require('./functions/commandStatistics'), 
    manager = require('./functions/blacklistManager'),
    owners = require('./functions/getOwners');

client.on('ready', () => {
    console.log('Connected to Discord.');

});

manager.manageBlacklist({action: 'refresh', blklist: 'gblk'}).then(list => {
    console.log(`Loaded global user blacklist. There are currently ${list.users.length} user entry(s).`);
}, (err) => {
    console.error(err);
});
owners.initializeOwners().then(list => {
    console.log(`Loaded owners. There are currently ${list.users.length} owners.`);
}, (err) => {
    console.error(err);
});

var events = fs.readdirSync('./events');
console.log(`Loading ${events.length} events, please wait...`);
events.forEach(e => {
    var eventFile = require(`./events/${e}`);
    client.on(eventFile.name, (...args) => {
        eventFile.exec(client, ...args);
    })
})
var commands = fs.readdirSync('./cmds');
console.log(`Loading ${commands.length} commands, please wait...`)
commands.forEach(c => {
    var cmdFile = require(`./cmds/${c}`);
    stats.initializeCommand(cmdFile.name);
    client.registerCommand(cmdFile.name, (msg, args) => {
        stats.updateUses(cmdFile.name);
        if (manager.gblacklist.users.includes(msg.author.id)) {
            msg.author.getDMChannel().then(chn => {
                chn.createMessage('You have been blacklisted from The Stream Empires Bot. If you think this is a mistake, please speak with an admin.').catch(() => {
                    msg.channel.createMessage(`<@${msg.author.id}> You have been blacklisted from The Stream Empires Bot. If you think this is a mistake, please speak with an admin.`)
                })
            })
        }else {
            cmdFile.exec(client, msg, args);
        }
    }, cmdFile.options);
});
client.connect();