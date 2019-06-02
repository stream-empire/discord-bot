'use strict';

const fetch = require('node-fetch');
const MaximumResults = 15;

module.exports = {
    name: 'topshards',

    exec: (client, msg, args) => {
        var user;

        if (args[0] === undefined)
            user = msg.author.id;
        else
            user = args[0].replace(/(<@!?|>)/g, '');

        fetch(`http://api.streamempires.live/users/getall`)
            .then(res => {
                if (res.statusCode === 500) {
                    msg.channel.createMessage('You aren\'t supposed to see this, please let a developer know what you were doing to cause this to happen.')
                }

                return res;
            })
            .then(res => res.json())
            .then(json => {
                if (json.error === undefined) {
                    var topShards = json.sort((a, b) => a.shards < b.shards)
                        .slice(0, MaximumResults)
                        .map((m, idx) => {
                            return {
                                name: `${idx+1} - ${m.discordName || m.siteName}`,
                                value: m.shards,
                                inline: false
                            }
                        });

                    msg.channel.createMessage({
                        embed: {
                            color: 65280,
                            title: `Top ${MaximumResults} Users by Shards`,
                            description: "```" + topShards.map(m => `${m.name} - ${m.value}`).join('\r\n') + "```",
                            footer: {
                                text: `Requested by ${msg.author.username}#${msg.author.discriminator}`,
                                icon_url: msg.author.avatarURL
                            }
                        }
                    });
                }
            })
    },

    options: {
        description: `List the servers top ${MaximumResults} members with the most shards and how much.`,
    }
}