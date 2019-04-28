'use strict';

module.exports = (client) => {
    return new Promise((resolve, reject) => {
        resolve(client.guilds.size);
    })
}