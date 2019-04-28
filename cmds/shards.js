'use strict';

const fetch = require('node-fetch');

module.exports = {
    name: 'shards',

    exec: (client, msg, args) => {
        var user
        if (args[0] === undefined) user = msg.author.id;
        else user = args[0].replace(/(<@!?|>)/g, '');

        fetch(`http://api.streamempires.live/user/get?discordid=${user}&sitename=${user}`)
        .then(res => {
            if (res.statusCode === 500) {
                msg.channel.createMessage('You aren\'t supposed to see this, please let a developer know what you were doing to cause this to happen.')
            }else if (res.statusCode !== 500) {
                return res;
            }
        })
        .then(res => res.json())
        .then(json => {
            if (json.error === undefined) {
                msg.channel.createMessage({embed: {
                    color: 65280,
                    title: 'Shards',
                    description: args[0] ? `${json.siteName} has ${json.shards} shards.` : `You have ${json.shards} shards.`,
                    footer: {
                        text: `Requested by ${msg.author.username}#${msg.author.discriminator}`,
                        icon_url: msg.author.avatarURL
                    }
                }})
            }else if (json.error === 'Not found') {
                msg.channel.createMessage('I couldn\'t find your user on the site, you may not have linked your discord account to the site, please do that.')
            }
        })
    },
    
    options: {
        description: 'See how many shards you or someone else has!',
        fullDescription: 'See how many shards you or someone else has!',
        usage: '[userID|user mention|site name]'
    }
}