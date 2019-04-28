'use strict';

let stats = require('../functions/commandStatistics');
let nums = require('../functions/numbers');
let manager = require('../functions/blacklistManager');
let owners = require('../functions/getOwners');
let util = require('util');
let guildCount = require('../functions/getGuilds');

module.exports = {
    name: 'eval',

    exec: (client, msg, args) => {
        if (owners.isOwner(msg.author.id)) {
            try {
                var evalCommand = args.join(' ');
                let evaluation = eval(evalCommand);
                if (typeof evaluation !== "string") {
                    evaluation = util.inspect(evaluation).replace(client.token, '(insert token here)')
                }else {
                    evaluation = evaluation.replace(client.token, '(insert token here)')
                }
                if (evaluation.length > 2000) {
                    msg.channel.createMessage('Output too large.')
                }else {
                    client.createMessage(msg.channel.id, evaluation)
                }
            } catch (err) {
                client.createMessage(msg.channel.id, 'OOF ERROR:\ninput: ```' + evalCommand + '``` output: ```' + err + '```')
            }
        }
    },

    options: {
        hidden: true,
        fullDescription: 'Evaluates code with a command (owner only)',
        aliases: [
            'evaluate',
            'ev'
        ]
    }
}