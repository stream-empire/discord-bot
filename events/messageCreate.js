'use strict';

const nums = require('../functions/numbers');

module.exports = {
    name: 'messageCreate',

    exec: (client, err) => {
        nums.msgsRead ++
    }
}