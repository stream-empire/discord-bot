'use strict';

let nums = require('../functions/numbers');
let guildCount = require('../functions/getGuilds');

module.exports = {
    name: 'info',

    exec: (client, msg, args) => {
        msg.channel.sendTyping()
        guildCount(client).then(guilds => {
            msg.channel.createMessage({
                embed: {
                    title: 'Info',
                    fields: [
                        {
                            name: 'Commands ran',
                            value: nums.cmdsRan,
                            inline: true
                        },
                        {
                            name: 'Messages Read',
                            value: nums.msgsRead,
                            inline: true
                        }
                    ]
                }
            });
        });
    },

    options: {
        description: 'shows basic info about the bot!'
    }
}