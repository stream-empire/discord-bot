'use strict';

const owners = require('../functions/getOwners');
const fetch = require('node-fetch');

module.exports = {
    name: 'give', 

    exec: (client, msg, args) => {
        if (owners.isAdminOwner(msg.author.id)) {
            fetch('http://api.streamempires.live/users/shards/give', {method: 'put', body: JSON.stringify({authorization: process.env.SHARDKEY, shards: parseInt(args[1]), name: args[0]}), headers: {'Content-Type': 'application/json'}})
            .then(res => {
                if (res.status === 200) return res;
                else if (res.status === 404) msg.channel.createMessage('There is no user by that name.');
                else if (res.status === 401) msg.channel.createMessage('The auth is incorrect.');
                else if (res.status === 500) msg.channel.createMessage('An error occurred.')
            })
            .then(res => res.json())
            .then(json => msg.channel.createMessage(`The user \`${json.siteName}\` now has \`${shards}\` shards.`))
        }
    },

    options: {
        hidden: true,
        fullDescription: 'Give shards to a user',
        usage: '<site name|discordid|twitch name> <number of shards>'
    }
}