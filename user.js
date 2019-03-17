const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    userID: String,
    username: String,
    twitchName: String,
    shards: Number,
    verified: Boolean,
    thumbnail: String,
    isLive: Boolean
});

module.exports = mongoose.model("User", userSchema);