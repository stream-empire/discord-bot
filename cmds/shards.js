'use strict';

const request = require('request');

module.exports = {
    name: 'shards',

    exec: (client, msg, args) => {
        var user
        if (args[0] === undefined) user = msg.author.id;
        else user = args[0].replace(/(<@!?|>)/g, '');

        request.get(`http://api.streamempires.live/user/get?discordid=${user}`, (err, res, body) => {
            if (err || res.statusCode === 500) {
                msg.channel.createMessage('You aren\'t supposed to see this, please let a developer know what you were doing to cause this to happen.')
            }else if (res.statusCode === 200) {
                body = JSON.parse(body);
                msg.channel.createMessage({embed: {
                    color: 65280,
                    title: 'Shards',
                    description: `You have ${body.shards} shards.`,
                    footer: {
                        text: `${msg.author.username}#${msg.author.discriminator}`,
                        icon_url: msg.author.avatarURL
                    }
                }})
            }else if (JSON.parse(body).error === 'Not found') {
                msg.channel.createMessage('I couldn\'t find your user on the site, you may not have linked your discord account to the site, please do that.')
            }
        })
    },
    
    options: {
        description: 'See how many shards you or someone else has!',
        fullDescription: 'See how many shards you or someone else has!',
        usage: '[userID|user mention]'
    }
}