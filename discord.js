//Require time counter
const ms = require('ms');
//Retrieve Config
const config = require('./config');
//Connect to database
const Sequelize = require('sequelize');
const sequelize = new Sequelize('postgres://alekeagle:yougaylol@localhost:5432/alekeagle');
//Prepare Discord Bot
const Eris = require('eris');
const bot = new Eris.CommandClient(config.token, {}, {description: 'Stream Empires Discord Bot', owner: 'Stream Empires', prefix: '!'});
//Prepare twitch IRC Client
const tmi = require("tmi.js");
const options = require("./twitchconfig");
const client = new tmi.client(options);
//Connect to Twitch
client.connect();

client.on('connected', () => {
    console.log('Connected to Twitch!')
});
bot.on('ready', () => {
    console.log('Connected to Discord!')
})
//Prepare the streamer data model
class streamer extends Sequelize.Model {}
streamer.init({
    userID: Sequelize.STRING,
    twitchName: Sequelize.STRING,
    shards: Sequelize.INTEGER,
    verified: Sequelize.BOOLEAN,
    thumbnail: Sequelize.STRING,
    isLive: Sequelize.BOOLEAN
}, { sequelize });
//Send streamer model to database to create table
streamer.sync({force: false}).then(() => {
    console.log('Synced to database successfully!');
}).catch(err => {
    console.error('an error occured while proforming this operation', err);
});
//Create verifytwitch command
bot.registerCommand('twitchlink', (msg, args) => {
    if (args[0] === undefined) {
        msg.channel.createMessage('Please specify your channel!')
    }else {
        msg.channel.createMessage(`To verify your identity, we are going to send you a whisper to the channel ${args[0]}. Follow the instructions in the message to verify yourself.`)
        var timeout = setTimeout(() => {
            client.removeListener('whisper', handleMessage);
            msg.channel.createMessage('You didn\'t respond to the message in time, verification failed!')
        }, ms('5min'));
        function handleMessage(from, userstate, message, self) {
            if (self) return;
            else if (from !== `#${args[0]}`) return;
            else if (from === `#${args[0]}` && message === `${msg.author.username}#${msg.author.discriminator}`) {
                clearTimeout(timeout);
                client.removeListener('whisper', handleMessage);
                client.whisper(args[0], 'Done! Check discord!');
                streamer.create({userID: msg.author.id, twitchName: args[0], shards: 0, verified: true, isLive: false}).then(() => {
                    streamer.findAll().then(streamers => {
                        console.log("All streamers:", JSON.stringify(streamers, null, 4));
                      });
                    msg.channel.createMessage(`You've just finished connecting your twitch (${args[0]}) account to your discord account (${msg.author.username}#${msg.author.discriminator})!`);
                });
            }
        }
        client.whisper(args[0], 'You requested to link your twitch account with your discord account via Stream Empires, if you didn\'t request this, please ignore this message, if you did, reply with your discord username and the 4 numbers in this format "username#0000" (CASE SENSITIVE)');
        client.on('whisper', handleMessage);
    }
})

bot.guilds

/* sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    }); */
bot.connect();