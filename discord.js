//Require time counter
const ms = require('ms');
const util = require('util');
//Retrieve Config
const config = require('./config');
//Connect to database
const Sequelize = require('sequelize');
const sequelize = new Sequelize('postgres://alekeagle:yougaylol@localhost:5432/alekeagle', {logging: false});
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
    console.log('Connected to Discord!');
    bot.guilds.forEach(g => { //since the bot may be offline when new members join, this forEach loop will take care of all users that are in the server without any database entries
        g.members.forEach(m => {
            streamer.findAll({where: {userID: m.id}}).then(streamers => {
                if(streamers[0 === undefined]) {
                    streamer.create({userID: m.id, shards: 0, verified: false}).then(() => {
                        console.log(`Created entry for: ${m.username}#${m.discriminator}`);
                    });
                }    
            });
        });
    });
})
//Prepare the streamer data model
class streamer extends Sequelize.Model {}
streamer.init({
    userID: {type: Sequelize.STRING, unique: true},
    twitchName: {type: Sequelize.STRING, unique: true},
    siteName: {type: Sequelize.STRING, unique: true},
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
    streamer.findAll({where: {userID: msg.author.id}}).then(streamers => {
        if (streamers[0].twitchName === null) { //here we are checking if the discord account is connected to a twitch account already, if it isn't then it moves to the next check.
            if (args[0] !== undefined) {
                args[0] = args[0].toLowerCase();
                streamer.findAll({where: {twitchName: args[0]}}).then(streamerss => {
                    if (streamerss[0] === undefined) { //here we check if the twitch account they are trying to link is already connected to a discord account, if it isn't then the actual connection of the two accounts happens.
                        msg.channel.createMessage(`To verify your identity, we are going to send you a whisper to the twitch channel ${args[0]}. Follow the instructions in the message to verify yourself. (if you do not recieve it, make sure you have the "strangers can whisper to you" setting enabled)`)
                        var timeout = setTimeout(() => {
                            client.removeListener('whisper', handleMessage); //this destroys the handler specific to the user, so we don't have a possible memory leak.
                            msg.channel.createMessage('You didn\'t respond to the message in time, verification failed!')
                        }, ms('5min')); //ms('5min') sets the timeout to 5 minutes, if the user doesn't respond in time, they will have to try again.
                        function handleMessage(from, userstate, message, self) {
                            if (self) return;
                            else if (from !== `#${args[0]}`) return; //if the message isnt from the user trying to connect to trying to connect the tiwtch account to their discord then don't do anything.
                            else if (from === `#${args[0]}` && message !== `${msg.author.username}#${msg.author.discriminator}`) client.whisper(args[0], 'Incorrect, please try again.');
                            else if (from === `#${args[0]}` && message === `${msg.author.username}#${msg.author.discriminator}`) { //this successfully confirms that the identity is the same
                                clearTimeout(timeout); //this ensures that the timeout message doesn't fire after auth
                                client.removeListener('whisper', handleMessage); //this ensures that the auth method doesnt continue to wait for a message
                                client.whisper(args[0], 'Done! Check discord!');
                                streamer.update({twitchName: args[0], verified: true}, {where: {userID: msg.author.id}}).then((number, streamers) => { //this will update the old user database entry with the new values (twitch channel name and verified)
                                    msg.channel.createMessage(`You've just finished connecting your twitch (${args[0]}) account to your discord account (${msg.author.username}#${msg.author.discriminator})!`);
                                })
                            }
                        }
                        client.whisper(args[0], 'You requested to link your twitch account with your discord account via Stream Empires, if you didn\'t request this, please ignore this message, if you did, reply with your discord username and the 4 numbers in this format "username#0000" (CASE SENSITIVE)');
                        client.on('whisper', handleMessage); //this will start listening for the confrim message from the twitch account
                    }else {
                        msg.channel.createMessage(`It appears that the twitch account \`${args[0]}\` is already assigned to a discord account. If you think this is a mistake please contact an administrator.`);
                    }
                });
            }else {
                msg.channel.createMessage('Please specify your channel!');
            }
        }else {
            msg.channel.createMessage(`It appears that your Discord account is already connected to a twitch account (${streamers[0].twitchName}), if you think this is a mistake, feel free to unlink this twitch account from your Discord account and link your twitch with this command.`);
        }
    });
});
bot.registerCommand('eval', (msg, args) => {
    try {
        var evalCommand = args.join(' ');
        let evaluation = eval(evalCommand);
        if (typeof evaluation !== "string") {
            evaluation = util.inspect(evaluation).replace(bot.token, '(insert token here)')
        }else {
            evaluation = evaluation.replace(bot.token, '(insert token here)')
        }
        if (evaluation.length > 2000) {
            bot.createMessage(msg.channel.id, 'Output too large, it should be on your website at https://alekeagle.tk/eval_out').then(() => {
                fs.writeFile('/home/pi/node_server/root/eval_out/eval_output.txt', evaluation.replace(/\n/g, '<br>'), (err) => {
                    if (err != undefined) {
                        bot.createMessage(msg.channel.id, 'An error occurred while this action was being preformed error code: `' + err.code + '`')
                    }
                });
            });
        }else {
            bot.createMessage(msg.channel.id, evaluation)
        }
    } catch (err) {
        bot.createMessage(msg.channel.id, 'OOF ERROR:\ninput: ```' + evalCommand + '``` output: ```' + err + '```')
    }
})

bot.on('guildMemberAdd', (guild, member) => { //this will take care of any user that has joined and doesnt have an entry
    streamer.findAll({
        where: {
            userID: member.id
        }
    }).then(streamers => {
        if (streamers[0] === undefined) {
            streamer.create({userID: member.id, shards: 0, verified: false}).then(() => {
                console.log(`Created entry for: ${member.username}#${member.discriminator}`);
            });
        }
    });
});

bot.registerCommand('twitchunlink', (msg, args) => {
        streamer.findAll({where: {userID: msg.author.id}}).then(streamers => {
            if (streamers[0] !== [] && streamers[0].twitchName === null) {
                msg.channel.createMessage('There is not a twitch account linked to you!')
            }else if (streamers[0] !== [] && streamers[0].twitchName !== null) {
                msg.channel.createMessage('To unlink this twitch account from your discord account, you will need to say the name of the twitch channel again!');
                var timeout = setTimeout(() => {
                    bot.removeListener('messageCreate', handleMessage); //this destroys the handler specific to the user, so we don't have a possible memory leak.
                    msg.channel.createMessage('You didn\'t respond in with the correct channel in time! Unlink failed!')
                }, ms('5min')); //ms('5min') sets the timeout to 5 minutes, if the user doesn't respond in time, they will have to try again.
                function handleMessage(message) {
                    if (message.channel.id !== msg.channel.id) return;
                    else if (message.author.id !== msg.author.id) return;
                    else if (message.content !== streamers[0].twitchName) message.channel.createMessage('Doesn\'t match your twitch name! Twitch usernames are all lowercase, try that!');
                    else if (message.content === streamers[0].twitchName) {
                        clearTimeout(timeout);
                        streamer.update({twitchName: null, verified: false}, {where:{userID: msg.author.id}}).then(() =>{
                            msg.channel.createMessage('Your twitch account is successfully unlinked!');
                            bot.removeListener('messageCreate', handleMessage); //this destroys the handler specific to the user, so it doesn't continue waiting for a message.
                        });
                    }
                }
                bot.on('messageCreate', handleMessage);
            }
        });
});

/* sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    }); */
bot.connect();