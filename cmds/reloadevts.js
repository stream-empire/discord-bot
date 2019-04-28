'use strict';

const fs = require('fs');
const owners = require('../functions/getOwners');

module.exports = {
    name: 'reloadevts',

    exec: (client, msg, args) => {
        if (owners.isAdminOwner(msg.author.id)) {
            var events = fs.readdirSync('./events');
            console.log(`Loading ${events.length} events, please wait...`);
            msg.channel.createMessage(`Reloading ${events.length} event handlers.`)
            client.eventNames().forEach(e => {
                if (e !== 'ready') {
                    var eventlisteners = client.rawListeners(e);
                    if (e === 'messageReactionAdd' || e === 'messageReactionRemove' || e === 'messageCreate') {
                        eventlisteners = eventlisteners.slice(1);
                    }
                    eventlisteners.forEach(ev => {
                        client.removeListener(e, ev);
                    })
                    
                }
            });
            events.forEach(e => {
                delete require.cache[require.resolve(`../events/${e}`)];
                var eventFile = require(`../events/${e}`);
                client.on(eventFile.name, (...args) => {
                    eventFile.exec(client, ...args);
                });
            });
        }
    },

    options: {
        hidden: true,
        fullDescription: 'Reloads all event handlers.'
    }
}