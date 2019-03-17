var viewersArray = [];
var confirmAccountArray = [];
var pendingRewardInvites = [];
var invites = {};

//WAITING WITHOUT BLOCKING THE SCRIPT
const wait = require('util').promisify(setTimeout);

//TWITCH NEW API
const https = require('https');

//READ FILE DATA
const fs = require("fs");
var file = fs.readFileSync("config.json");
var config = JSON.parse(file);
//DATABASE
const User = require("./user.js");
const mongoose = require("mongoose");
mongoose.connect('mongodb://localhost/DiscordDB');

//DISCORD
const Discord = require('discord.js');
const bot = new Discord.Client();

//TWITCH
const tmi = require("tmi.js");
const options = require("./twitchconfig");
const client = new tmi.client(options);

var firstTimePrintingMessageInRank = true;
var rankEmbedMsgID = [];
var channelRankID = ["514259128818991115","514259170745253889","514259490036776960","514263406732378112","514259528657928192","514259019267833877","515611247748579353"];
var channelRankName = ["Basic", "Trooper", "Elite","Titan","Mythical","Legend","Global Legend"];
var channelRankColor = [0xf46920, 0xe9ef27, 0x33e255, 0x28cfdd, 0xe721e4, 0x7a2fef, 0xffffff];

client.connect();

/*const newUser = {
    name: "theastralcookie",
    chatting: false,
    watching: "theastralcookie"
}

viewersArray.push(newUser);*/
 
bot.on('ready', () => {
  wait(1000);
  bot.guilds.get("513539271844691979").fetchInvites()
  .then(fetchedInvites => invites = fetchedInvites)
  .catch(console.error);
  console.log(invites);
  console.log(`Logged in as ${bot.user.tag}!`);
});
 
bot.on('message', message => {
    let prefix = '!';
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.slice(1);
    console.log(cmd + " " + args);
        switch(cmd) {
            /*case '!testwhisper':
            if(message.channel.id == "514257837531070476"){
                client.whisper(args.toString(), 'Reply to this message by typing "confirmaccount" to link your twitch account with Stream Empires');
            }
            break;*/
            case '!shardshelp':
            if(message.channel.id == "514257837531070476"){
                message.channel.send('Yeah what do you need?');
            }
            break;
            case '!topshards':
            if(message.channel.id == "514257837531070476"){
                var topString = "```Here are the top 15 users! ```\n";
                User.find({ twitchName: { $ne: "" }}, function(err, users) {
                    for(var i = 0; i < users.length; i++){
                        topString += "**" + (i + 1) + " : " + "<@"+ users[i].userID +">  | ** `"+ users[i].shards +" shards ` \n";
                    }
                    message.channel.send({
                        "embed": {
                        "color": 5636096,
                        "description": topString
                        }
                    });
                }).sort( { shards: -1 } ).limit(15);
            }
            break;
            case '!upgrade':
            if(message.channel.id == "514257837531070476"){
                User.find({ twitchName: { $ne: "" }}, function(err, users) {
                    User.findOne({ userID: message.member.id}, function(err, user) {
                        var globalAmout = Math.round(users.length * 0.003);
                        var legendAmout = Math.round(users.length * 0.01);
                        var mythicalAmout = Math.round(users.length * 0.05);
                        var titanAmout = Math.round(users.length * 0.1);
                        var eliteAmout = Math.round(users.length * 0.25);
                        var trooperAmout = Math.round(users.length * 0.5);
                        var position = 0;

                        for(var i = 0; i < users.length; i++){
                            if(users[i].userID == user.userID){
                                position = i + 1;
                                break;
                            }
                        }

                        var userRequest = bot.guilds.get("513539271844691979").members.get(user.userID);
                        //BASIC RANK
                        if (userRequest.roles.has("513548164595187734")){
                            var shardsNeeded = users[trooperAmout].shards - user.shards;
                            message.channel.send({
                                "embed": {
                                "color": 5636096,
                                "description": "<@" + users[i].userID + "> | You're position " + position + " \n You need to pass " + (position - trooperAmout) + " or more members to get to Trooper <:Trooper:514688097296842766>. It will require ```" + shardsNeeded.toFixed(2) + " Shards```" 
                                }
                            });
                        }
                        //TROOPER RANK
                        else if (userRequest.roles.has("513548143967600646")){
                            var shardsNeeded = users[eliteAmout].shards - user.shards;
                            message.channel.send({
                                "embed": {
                                "color": 5636096,
                                "description": "<@" + users[i].userID + "> | You're position " + position + "\n You need to pass " + (position - eliteAmout) + " or more members to get to Elite <:Elite:514688117975023636>. It will require ```" + shardsNeeded.toFixed(2) + " Shards```" 
                                }
                            });
                        }
                        //ELITE RANK
                        else if (userRequest.roles.has("513548083456376842")){
                            var shardsNeeded = users[titanAmout].shards - user.shards;
                            message.channel.send({
                                "embed": {
                                "color": 5636096,
                                "description": "<@" + users[i].userID + "> | You're position " + position + " \n You need to pass " + (position - titanAmout) + " or more members to get to Titan <:Titan:514688131233218560>. It will require ```" + shardsNeeded.toFixed(2) + " Shards```" 
                                }
                            });
                        }
                        //TITAN RANK
                        else if (userRequest.roles.has("513548109972766731")){
                            var shardsNeeded = users[mythicalAmout].shards - user.shards;
                            message.channel.send({
                                "embed": {
                                "color": 5636096,
                                "description": "<@" + users[i].userID + "> | You're position " + position + " \n You need to pass " + (position - mythicalAmout) + " or more members to get to Mythical <:Mythical:514690692262526986>. It will require ```" + shardsNeeded.toFixed(2) + " Shards``` " 
                                }
                            });
                        }
                        //MYTHICAL RANK
                        else if (userRequest.roles.has("513548047574368256")){
                            var shardsNeeded = users[legendAmout].shards - user.shards;
                            message.channel.send({
                                "embed": {
                                "color": 5636096,
                                "description": "<@" + users[i].userID + "> | You're position " + position + " \n You need to pass " + (position - legendAmout) + " or more members to get to Legend <:Legend:515689931461623810>. It will require ```" + shardsNeeded.toFixed(2) + " Shards```" 
                                }
                            });
                        }
                        //LEGEND RANK
                        else if (userRequest.roles.has("513547553099218945")){
                            var shardsNeeded = users[globalAmout].shards - user.shards;
                            message.channel.send({
                                "embed": {
                                "color": 5636096,
                                "description": "<@" + users[i].userID + "> | You're position " + position + " \n You need to pass " + (position - globalAmout) + " or more members to get to Global <:GlobalLegend:515634365838000129>. It will require ```" + shardsNeeded.toFixed(2) + " Shards```" 
                                }
                            });
                        }
                        //GLOBAL RANK
                        else if (userRequest.roles.has("515707601405607961")){
                            message.channel.send({
                                "embed": {
                                "color": 5636096,
                                "description": "<@" + users[i].userID + "> | You're position " + position + " \n You have the highest role, Congrats!"  
                                }
                            });
                        }
                    });
                }).sort( { shards: -1 } );
            }
            break;
            case '!scale':
            if(message.channel.id == "514257837531070476"){
                if(message.member.roles.has("513541100535808025") || message.member.roles.has("513917545560932384")){
                    if(parseFloat(args[0]) > 0){
                        User.find({ twitchName: { $ne: "" }}, function(err, users) {
                            for(var i = 0; i < users.length; i++){
                                users[i].shards = (users[i].shards * parseFloat(args[0])).toFixed(2);
                                users[i].save();
                            }
                        });
                    }
                    else{
                        message.channel.send("The scale multiplier needs to be above 0");
                    }
                }
            }
            break;            
            case '!resetpoints':
            /*if(message.channel.id == "514257837531070476"){
                if(message.member.roles.has("513541100535808025") || message.member.roles.has("513917545560932384")){
                    User.find({ twitchName: { $ne: "" }}, function(err, users) {
                        if(users){
                            for(var i = 0; i < users.length; i++){
                                users[i].shards = 0;
                                users[i].save();
                            }
                        }
                    });
                }
            }*/
            break;
            case '!modunlink':
            if(message.channel.id == "514260240087384095"){
                if(message.member.roles.has("513541100535808025") || message.member.roles.has("513917545560932384")){
                    if(args[0].toString() != ""){
                        var ID_user = args[0].substr(3);
                        ID_user = ID_user.substr( 0, ID_user.length - 1)
                        console.log("ARGS " + ID_user);
                        User.findOne({ userID: ID_user}, function(err, user) {
                            if(user){
                                var tempUser = bot.guilds.get("513539271844691979").members.get(user.userID);
                                var basicRole = bot.guilds.get("513539271844691979").roles.get("513548164595187734");
                                var trooperRole = bot.guilds.get("513539271844691979").roles.get("513548143967600646");
                                var eliteRole = bot.guilds.get("513539271844691979").roles.get("513548083456376842");
                                var titanRole = bot.guilds.get("513539271844691979").roles.get("513548109972766731");
                                var mythicalRole = bot.guilds.get("513539271844691979").roles.get("513548047574368256");
                                var legendRole = bot.guilds.get("513539271844691979").roles.get("513547553099218945");
                                var globalRole = bot.guilds.get("513539271844691979").roles.get("515707601405607961");
                                var globalRole = bot.guilds.get("513539271844691979").roles.get("515707601405607961");
                                var roleNotApproved = bot.guilds.get("513539271844691979").roles.get("514260352989397032");
                                var liveRole = bot.guilds.get("513539271844691979").roles.get("513548839777730560");
                                tempUser.removeRole(basicRole);
                                tempUser.removeRole(trooperRole);
                                tempUser.removeRole(eliteRole);
                                tempUser.removeRole(titanRole);
                                tempUser.removeRole(mythicalRole);
                                tempUser.removeRole(legendRole);
                                tempUser.removeRole(globalRole);
                                tempUser.removeRole(globalRole);
                                tempUser.addRole(roleNotApproved);

                                
                                user.verified = false;
                                user.twitchName = "";
                                user.isLive = false;
                                user.thumbnail = "";
                                user.save();
                                message.channel.send("User <@" + message.member.id + "> has unlinked his twitch account");
                            }
                        });
                    }
                }
            }
            break;
            case '!noctua':
                message.channel.send('Noctua or the king of twitch?');
            break;
            case '!unlink':
                if(message.channel.id == "514260240087384095"){
                    User.findOne({ userID: message.member.id }, function (err, user) {
                        if (err) throw err;
                        if(user){
                            var tempUser = bot.guilds.get("513539271844691979").members.get(user.userID);
                            var basicRole = bot.guilds.get("513539271844691979").roles.get("513548164595187734");
                            var trooperRole = bot.guilds.get("513539271844691979").roles.get("513548143967600646");
                            var eliteRole = bot.guilds.get("513539271844691979").roles.get("513548083456376842");
                            var titanRole = bot.guilds.get("513539271844691979").roles.get("513548109972766731");
                            var mythicalRole = bot.guilds.get("513539271844691979").roles.get("513548047574368256");
                            var legendRole = bot.guilds.get("513539271844691979").roles.get("513547553099218945");
                            var globalRole = bot.guilds.get("513539271844691979").roles.get("515707601405607961");
                            var globalRole = bot.guilds.get("513539271844691979").roles.get("515707601405607961");
                            var roleNotApproved = bot.guilds.get("513539271844691979").roles.get("514260352989397032");
                            var liveRole = bot.guilds.get("513539271844691979").roles.get("513548839777730560");
                            tempUser.removeRole(basicRole);
                            tempUser.removeRole(trooperRole);
                            tempUser.removeRole(eliteRole);
                            tempUser.removeRole(titanRole);
                            tempUser.removeRole(mythicalRole);
                            tempUser.removeRole(legendRole);
                            tempUser.removeRole(globalRole);
                            tempUser.removeRole(globalRole);
                            tempUser.addRole(roleNotApproved);

                            
                            user.verified = false;
                            user.twitchName = "";
                            user.isLive = false;
                            user.thumbnail = "";
                            user.save();
                            message.channel.send("User <@" + message.member.id + "> has unlinked his twitch account");
                        }
                    });
                }
            break;
            case '!give':
            if(message.channel.id == "514257837531070476"){
                if(message.member.roles.has("513541100535808025") || message.member.roles.has("513917545560932384")){
                    var ID_user = args[0].substr(3);
                    ID_user = ID_user.substr( 0, ID_user.length - 1)
                    User.findOne({ userID: ID_user}, function(err, user) {
                        if (err) throw err;
                        if(user){
                            if(args[1]){
                                if(parseInt(args[1]) <= 0){
                                    message.channel.send("The number of shards need to be above 0");
                                }
                                else{
                                    user.shards += parseInt(args[1]);
                                    user.save();
                                    message.channel.send( args[1].toString() + " shards were added to " + args[0].toString());
                                }
                            }
                        }
                    });
                }
            }
            break;
            case '!take':
            if(message.channel.id == "514257837531070476"){
                if(message.member.roles.has("513541100535808025") || message.member.roles.has("513917545560932384")){
                    var ID_user = args[0].substr(3);
                    ID_user = ID_user.substr( 0, ID_user.length - 1)
                    User.findOne({ userID: ID_user}, function(err, user) {
                        if (err) throw err;
                        if(user){
                            if(args[1]){
                                if(parseInt(args[1]) <= 0){
                                    message.channel.send("The number of shards need to be below 0");
                                }
                                else{
                                    user.shards -= parseInt(args[1]);
                                    user.save();
                                    message.channel.send( args[1].toString() + " shards were removed from " + args[0].toString());
                                }
                            }
                        }
                    });
                }
            }
            break;
            case '!twitchlink':
            if(message.channel.id == "514260240087384095"){
                var discordLink = false;
                var twitchLink = false;
                if(args.toString() != ""){
                User.findOne({ userID: message.member.id }, function(err, user) {
                    if (err) throw err;
                    if(user){
                        if(user.twitchName != ""){
                            //IF THE DISCORD ACCOUNT IS ALREADY LINKED TO A TWITCH ACCOUNT
                            discordLink = true;
                            message.channel.send('Your discord account is already link to ' + user.twitchName);
                        }
                    }
                    User.findOne({ twitchName:  args.toString().toLowerCase()}, function(err, user) {
                        if (err) throw err;
                        if(user){
                            //IF THE TWITCH ACCOUNT IS ALREADY LINKED TO A DISCORD ACCOUNT
                            twitchLink = true;
                            message.channel.send(user.twitchName + ' is already linked to <@' + user.userID + ">");
                        }
                        if(!discordLink && !twitchLink){
                            //IF THE DISCORD ACCOUNT IS CLEAN AND THE TWITCH ACCOUNT TOO
                            message.member.send({
                                "embed": {
                                  "color": 5636096,
                                  "description": "__**Next Link Step**__ \n\n:one: Go to <https://www.twitch.tv/settings/security> -> `Allow strangers to whisper you`.\n\n :two: If you had users blocked go back to Bot_Spam and retype `!twitchlink (Twitch Name)`. If you didn't skip to step **3**.\n\n :three: Now go to your <https://www.twitch.tv> whispers & reply to  __StreamEmpiresBot__ with `confirmaccount`"
                                }
                              });
                            client.whisper(args.toString(), 'Reply to this message by typing "confirmaccount" to link your twitch account with Stream Empires');

                            var userToConfirm = {
                                "id": message.member.id,
                                "twitchName": args.toString()
                            }

                            confirmAccountArray.push(userToConfirm);
                            client.on("whisper", function (from, userstate, msg, self) {
                                // Don't listen to my own messages..
                                if (self) return;
                                if(msg.toLowerCase() == "confirmaccount"){
                                    //IF THE GUY REPLIED WITH "CONFIRMACCTION"
                                    console.log("guys typed confirmaccount");
                                    for(var i = 0; i < confirmAccountArray.length; i++){
                                        if(confirmAccountArray[i].twitchName.toLowerCase() == userstate.username.toLowerCase()){
                                            console.log("Found Tha Dude");
                                            var index = i;
                                            User.findOne({ userID: confirmAccountArray[index].id }, function(err, user) {
                                                if (err) throw err;
                                                if(user){
                                                    var tempUser = bot.guilds.get("513539271844691979").members.get(user.userID);

                                                    user.verified = true;
                                                    user.twitchName = confirmAccountArray[index].twitchName.toLowerCase();

                                                    console.log("LENGTH OF PENDING REWARDS " + pendingRewardInvites.length);
                                                    for(var a = 0; a < pendingRewardInvites.length; a++){
                                                        console.log("THE INVITER ID ISSSSSS " + pendingRewardInvites[a].inviterID);
                                                        if(pendingRewardInvites[a].invitedID == user.userID){
                                                            User.findOne({ userID: pendingRewardInvites[a].inviterID }, function(err, inviterExist) {
                                                                if (err) throw err;
                                                                if(inviterExist){
                                                                    console.log("I FOUND THE INVITER OMG!!!!");
                                                                    inviterExist.shards += 1000;
                                                                    inviterExist.save(function(err) {
                                                                        if (err) throw err;
                                                                    });
                                                                }
                                                            });
                                                            bot.channels.get("514257837531070476").send({
                                                                "embed": {
                                                                  "color": 5636096,
                                                                  "description": "<@" + pendingRewardInvites[a].inviterID + "> **| :heavy_plus_sign: `1000` shards for inviting ** <@" + pendingRewardInvites[a].invitedID + "> to the server!"
                                                                }
                                                              });
                                                            pendingRewardInvites.splice(a);
                                                            break;
                                                        }
                                                    }
                                                    // save the user
                                                    user.save(function(err) {
                                                        if (err) throw err;
                                                        let roleBasic = message.guild.roles.get("513548164595187734");
                                                        let roleNotApproved = message.guild.roles.get("514260352989397032");
                                                        let roleApproved = message.guild.roles.get("514704944968892426");
                                                        tempUser.addRole(roleBasic);
                                                        tempUser.addRole(roleApproved);
                                                        tempUser.removeRole(roleNotApproved);
                                                        tempUser.setNickname("twitch.tv/" + confirmAccountArray[index].twitchName);
                                                        console.log('User successfully linked twitch and discord');
                                                        tempUser.send('You have successfully linked your twitch and discord accounts');
                                                    });
                                                }
                                            });
                                        }
                                    }
                                }
                                else{
                                    //WHISPER THE MESSAGE TO TYPE AGAIN
                                    client.whisper('Incorrect confirm message');
                                }
                            });
                        }
                    });
                });
              }
              else{
                message.channel.send("You need to add a twitch channel name after !twitchlink");
              }
            }
            break;
            case '!shards' :
            if(message.channel.id == "514257837531070476"){
                User.findOne({ userID: message.member.id }, function(err, user) {
                if (err) throw err;
                if(user){
                        message.channel.send({
                            "embed": {
                            "color": 5636096,
                            "description": "**<@" + user.userID + "> | Shards `" + user.shards + "`**"
                            }
                        });
                    }
                });
            }
         }
});

bot.on('guildMemberAdd', member => {
    member.send('Welcome to Stream Empire');
    const user = new User({
        userID: member.id,
        username: member.user.username,
        twitchName: "",
        shards: 0,
        verified: false,
        thumbnail: "",
        isLive: false
    });

    let roleNotApproved = bot.guilds.get("513539271844691979").roles.get("514260352989397032");
    member.addRole(roleNotApproved);


    member.guild.fetchInvites().then(guildInvites => {
        // This is the *existing* invites for the guild.
        const ei = invites;

        invites = guildInvites;
        // Look through the invites, find the one for which the uses went up.
        console.log("EI IS " + ei);
        console.log("INVITES IS " + invites);

        if(invites && ei){
            const invite = guildInvites.find(i => ei.get(i.code).uses < i.uses);

            console.log(invite.inviter.id + " invited " + member.id);
            
            var pendingReward = {
                inviterID: invite.inviter.id,
                invitedID: member.id 
            }

            pendingRewardInvites.push(pendingReward);
        }
    });

    user.save()
    .then(result => console.log(result))
    .catch(err => console.log(err));  
});

bot.on('guildMemberRemove', member => {
    User.findOne({ userID: member.id }, function(err, userExist) {}).remove().exec();
});


client.on("join", function (channel, username, self) {
    console.log("USER HAS JOINED " + channel + "HIS NAME IS " + username);
    var subChannel = channel.substr(1);
    const newUser = {
        name: username,
        chatting: false,
        watching: subChannel
    }
    viewersArray.push(newUser);
});

client.on("chat", function (channel, userstate, message, self) {
    if (self) return;
    for(var i = 0; i < viewersArray.length; i++){
        if(viewersArray[i].name == userstate.username){
            viewersArray[i].chatting = true;
        }
    }
});

/*client.on("chat", function (channel, userstate, message, self) {
    // Don't listen to my own messages..
    if (self) return;

    viewersArray.forEach(function(element) {
        if(element.name == userstate.username){
            element.chatting = true;
        }
    });
});*/

client.on("subscription", function (channel, username, method, message, userstate) {
    let name = username.toLowerCase();
    User.findOne({ twitchName:  name}, function(err, user) {
        if (err) throw err;
        if(user){
            user.shards += 500;
            user.save(function(err) {
                bot.channels.get("514257837531070476").send({
                    "embed": {
                      "color": 5636096,
                      "description": "<@" + user.userID + "> **| :heavy_plus_sign: `500` shards subscribing to**  *** https://twitch.tv/" + channel.substr(1) + ") *** "
                    }
                });
            });
        }
    });
});

client.on("resub", function (channel, username, months, message, userstate, methods) {
    let name = username.toLowerCase();
    console.log(name);
    User.findOne({ twitchName:  name}, function(err, user) {
        if (err) throw err;
        if(user){
            user.shards += 500;

            user.save(function(err) {
                bot.channels.get("514257837531070476").send({
                    "embed": {
                      "color": 5636096,
                      "description": "<@" + user.userID + "> **| :heavy_plus_sign: `500` shards resubbing to**  *** https://twitch.tv/" + channel.substr(1) + ") *** "
                    }
                });
            });
        }
    });
});

client.on("cheer", function (channel, userstate, message) {
    if(userstate.bits >= 25){
        let name = userstate.username;
        console.log(name);
        User.findOne({ twitchName:  name}, function(err, user) {
            if (err) throw err;
            console.log(user);
            if(user){
                user.shards += userstate.bits * 1.75;

                user.save(function(err) {
                    bot.channels.get("514257837531070476").send({
                        "embed": {
                          "color": 5636096,
                          "description": "<@" + user.userID + "> **| :heavy_plus_sign: `" + userstate.bits * 1.75 + "` shards donating to**  *** https://twitch.tv/" + channel.substr(1) + ") *** **   for `" + userstate.bits + "` bits!**"
                        }
                      });
                });
            }
        });
    }
});

client.on("hosting", function (channel, target, viewers) {
    name = channel.substr(1);
    User.findOne({ twitchName:  name}, function(err, user) {
        if(user){
            user.shards += 20 * viewers;

            user.save(function(err) {
                bot.channels.get("514257837531070476").send({
                    "embed": {
                      "color": 5636096,
                      "description": "<@" + user.userID + "> **| :heavy_plus_sign: `" + 20 * viewers + "` shards hosting **  *** https://twitch.tv/" + target + ") *** **   for `" + viewers + "` viewers!**"
                    }
                  });
            });
        }
    });
});

client.on("part", function (channel, username, self) {
    console.log("SOMEONE LEFT : " + username);
    for (var i = 0; i < viewersArray.length; i++) {
        if(username == viewersArray[i].name){
            viewersArray.splice(i,1);
            break;
        }
    }
});

function checkViewersForShards() {
    viewersArray.forEach(function(element) {
        let name = element.name;
        User.findOne({ twitchName: name }, function(err, user) {
            if (err) throw err;
            User.findOne({ twitchName:  element.watching}, function(err, channel) {
                    if(channel){
                        if(user){
                        //TODO Fix this, you need to get the guild and then a member. not only a user
                        var streamer = bot.guilds.get("513539271844691979").members.get(channel.userID);
                        var watcher = bot.guilds.get("513539271844691979").members.get(user.userID);
                            if(streamer){
                            //BASIC RANK
                            if (streamer.roles.has("513548164595187734")){
                                if(element.chatting){
                                    user.shards += 4.5;
                                }
                                user.shards += 0.5;
                            }
                            //TROOPER RANK
                            else if (streamer.roles.has("513548143967600646")){
                                if(element.chatting){
                                    user.shards += 6.25;
                                }
                                user.shards += 0.75;
                            }
                            //ELITE RANK
                            else if (streamer.roles.has("513548083456376842")){
                                if(element.chatting){
                                    user.shards += 8.5;
                                }
                                user.shards += 1.5;
                            }
                            //TITAN RANK
                            else if (streamer.roles.has("513548109972766731")){
                                if(element.chatting){
                                    user.shards += 11.75;
                                }
                                user.shards += 2.25;
                            }
                            //MYTHICAL RANK
                            else if (streamer.roles.has("513548047574368256")){
                                if(element.chatting){
                                    user.shards += 13.75;
                                }
                                user.shards += 3.25;
                            }
                            //LEGEND RANK
                            else if (streamer.roles.has("513547553099218945")){
                                if(element.chatting){
                                    user.shards += 16.5;
                                }
                                user.shards += 4.50;
                            }
                            //GLOBAL RANK
                            else if (streamer.roles.has("515707601405607961")){
                                if(element.chatting){
                                    user.shards += 19;
                                }
                                user.shards += 5;
                            }
                            if(watcher){
                                //BOOSTER 1
                                if(watcher.roles.has("515607066241531905")){
                                    if(element.chatting){
                                        user.shards += 1.5;
                                    }
                                    user.shards += 0.5;
                                }
                                //BOOSTER 2
                                else if (watcher.roles.has("515607227684356120")){
                                    if(element.chatting){
                                        user.shards += 3;
                                    }
                                    user.shards += 1;
                                }
                                //BOOSTER 3
                                else if (watcher.roles.has("515607256708939804")){
                                    if(element.chatting){
                                        user.shards += 5;
                                    }
                                    user.shards += 2;
                                }
                            }

                            user.save(function(err) {});  
                        }
                    }
                }
            });
        });
    });
}

function resetChattersForShards(){
    viewersArray.forEach(function(element) {
        element.chatting = false;
    });
    
}

function checkStreamersForConnection(){
    var isFirst = true;
    var tracker = 1;
    var twitchNames = [];
    var tempUsers = [];
    var liveRole = bot.guilds.get("513539271844691979").roles.get('513548839777730560');
    User.find({ twitchName: { $ne: "" }}, function(err, users) {
        var usersRequest = "";
        var userArray = [];
        if(users){
            for(var i = 0; i < users.length; i++){
                if(isFirst){
                    isFirst = false;
                    usersRequest += "user_login=" + users[i].twitchName;
                }
                else{
                    usersRequest += "&user_login=" + users[i].twitchName;
                }
                tempUsers.push(users[i]);
                if(i == (99 * tracker) || i == (users.length - 1)){
                    tracker++;
                    isFirst = true;
                    if(usersRequest != ""){
                    const options = {
                        host: 'api.twitch.tv',
                        port: 443,
                        path: '/helix/streams?' + usersRequest,
                        method: 'GET',
                        headers: {
                        'Client-ID': 'ce8f36l5nqdfhdol9q3m1oz09lefuh'
                        }
                        //?user_login=theastralcookie,pkpandasauce
                    };
                    usersRequest = "";
                    let buffer = [];
                    var req = https.request(options, function(res) {
                        res.on('data', function(data) {
                            buffer.push(data);
                        }).on('end', function() {
                            var streamersJSON = JSON.parse(Buffer.concat(buffer));
                        if(streamersJSON["data"]){
                            for(var a = 0; a < streamersJSON["data"].length ; a++){
                                var name = streamersJSON["data"][a]["user_name"].toLowerCase();
                                var status = streamersJSON["data"][a]["type"];
                                var title = streamersJSON["data"][a]["title"];
                                var viewers = streamersJSON["data"][a]["viewer_count"];
                                var thumbnailUrl = streamersJSON["data"][a]["thumbnail_url"];
                                var userForArray = {
                                    "name": name,
                                    "viewers": viewers,
                                    "title": title
                                }
                                userArray.push(userForArray);
                                if(status == "live"){
                                    twitchNames.push(name);
                                    User.findOne({ twitchName: name }, function(err, user) {
                                        if (err) throw err;
                                        if(user){
                                            if (user.isLive == false){
                                                user.isLive = true;
                                                for(var i = 0; i < userArray.length; i++){
                                                    
                                                    if(userArray[i].name == user.twitchName){
                                                        client.join(userArray[i].name);
                                                        var lurk = 0;
                                                        var chat = 0;
                                                        var streamer = bot.guilds.get("513539271844691979").members.get(user.userID);
                                                        if(streamer){
                                                            //BASIC RANK
                                                            if (streamer.roles.has("513548164595187734")){
                                                                chat = 4.5;
                                                                lurk = 0.5;
                                                            }
                                                            //TROOPER RANK
                                                            else if (streamer.roles.has("513548143967600646")){
                                                                chat = 6.25;
                                                                lurk = 0.75;
                                                            }
                                                            //ELITE RANK
                                                            else if (streamer.roles.has("513548083456376842")){
                                                                chat = 8.5;
                                                                lurk = 1.5;
                                                            }
                                                            //TITAN RANK
                                                            else if (streamer.roles.has("513548109972766731")){
                                                                chat = 11.75;
                                                                lurk = 2.25;
                                                            }
                                                            //MYTHICAL RANK
                                                            else if (streamer.roles.has("513548047574368256")){
                                                                chat = 13.75;
                                                                lurk = 3.25;
                                                            }
                                                            //LEGEND RANK
                                                            else if (streamer.roles.has("513547553099218945")){
                                                                chat = 16.5;
                                                                lurk = 4.50;
                                                            }
                                                            //GLOBAL RANK
                                                            else if (streamer.roles.has("515707601405607961")){
                                                                chat = 19;
                                                                lurk = 5;
                                                            }
                                                            bot.channels.get("514259894745038859").send({
                                                                "embed": {
                                                                "description": "** <@" + user.userID + "> is now streaming!** \n __ \n__ https://twitch.tv/" + user.twitchName,
                                                                "color": 4929148,
                                                                "footer": {
                                                                    "text": "Bot made by TheAstralCookie"
                                                                },
                                                                "thumbnail": {
                                                                    "url": user.thumbnail
                                                                    },
                                                                "fields": [
                                                                    {
                                                                    "name": "Title",
                                                                    "value": userArray[i].title,
                                                                    },
                                                                    {
                                                                    "name": "Shards",
                                                                    "value": "Lurk : " + lurk + "/min\nChat : " + chat + "/min ",
                                                                    }
                                                                ]
                                                                }
                                                            });
                                                            var member = bot.guilds.get("513539271844691979").members.get(user.userID);
                                                            member.addRole(liveRole);
                                                            break;
                                                        }
                                                    }
                                                }
                                            }
                                            else if(user.isLive){
                                                for(var i = 0; i < userArray.length; i++){
                                                    if(user.twitchName == userArray[i].name){
                                                        var tempUser = bot.guilds.get("513539271844691979").members.get(user.userID);
                                                        if(tempUser){
                                                            if(tempUser.roles.has("515002977560297482")){
                                                                if(userArray[i].viewers >= 5  && userArray[i].viewers <= 15){
                                                                    user.shards += 1;
                                                                }
                                                                else if(userArray[i].viewers >= 16  && userArray[i].viewers <= 25){
                                                                    user.shards += 2.5;
                                                                }
                                                                else if(userArray[i].viewers >= 26  && userArray[i].viewers <= 35){
                                                                    user.shards += 5;
                                                                }
                                                                else if(userArray[i].viewers >= 36  && userArray[i].viewers <= 45){
                                                                    user.shards += 7.5;
                                                                }
                                                                else if(userArray[i].viewers >= 46  && userArray[i].viewers <= 59){
                                                                    user.shards += 10;
                                                                }
                                                                else if(userArray[i].viewers >= 60){
                                                                    user.shards += 12.5;
                                                                }
                                                            }
                                                            else if (tempUser.roles.has("515228075978653708")){
                                                                user.shards += 20;
                                                            }
                                                        }
                                                    /*user.isLive = false;
                                                        console.log("worked");*/
                                                    }
                                                }
                                            }
                                            user.save(function(err) {});
                                        }
                                    });
                                }
                            }
                        }
                        tempUsers.forEach(function(element) {
                            if(element.isLive){
                                if(!twitchNames.includes(element.twitchName)){
                                    var member = bot.guilds.get("513539271844691979").members.get(element.userID);
                                    if(member){
                                        element.isLive = false;
                                        member.removeRole(liveRole);
                                        client.part(element.twitchName);
                                    }
                                }
                            }
                        });
                        tempUsers = [];
                        });
                    });
                    req.end();
                 }
            }
          }
        }
    });
}

function checkStreamersForThumbnail(){
    var isFirst = true;
    var tracker = 1;
    var usersRequest = "";
    User.find({ twitchName: { $ne: "" }}, function(err, users) {
    if(users){
        for(var i = 0; i < users.length; i++){
            if(isFirst){
                isFirst = false;
                usersRequest += "login=" + users[i].twitchName;
            }
            else{
                usersRequest += "&login=" + users[i].twitchName;
            }
            if(i == (99 * tracker) || i == (users.length - 1)){
                tracker++;
                isFirst = true;
                if(usersRequest != ""){
                const options = {
                    host: 'api.twitch.tv',
                    port: 443,
                    path: '/helix/users?' + usersRequest,
                    method: 'GET',
                    headers: {
                    'Client-ID': 'ce8f36l5nqdfhdol9q3m1oz09lefuh'
                    }
                    //?user_login=theastralcookie,pkpandasauce
                };
                usersRequest = "";
                let buffer = [];
                var req = https.request(options, function(res) {
                res.on('data', function(data) {
                    buffer.push(data);
                    }).on('end', function() {
                        if(buffer){
                            var streamersJSON = JSON.parse(Buffer.concat(buffer));
                            for(var a = 0; a < streamersJSON["data"].length ; a++){
                                let name = streamersJSON["data"][a]["login"].toLowerCase();
                                let tn = streamersJSON["data"][a]["profile_image_url"];
                                if(tn != ""){
                                    User.findOne({ twitchName: name }, function(err, user) {
                                        if (err) throw err;
                                        if(user){
                                            if(user.thumbnail != tn){
                                                console.log("NEW THUMBNAIL " + tn);
                                                user.thumbnail = tn;
                                            }
                                            user.save(function(err) {});
                                        }
                                    });
                                }
                            }
                        }
                    });
                });
                req.end();
             }
        }
      }
    }
    });
}

function checkUsersForRank(){
    const basicRole = bot.guilds.get("513539271844691979").roles.get("513548164595187734");
    const trooperRole = bot.guilds.get("513539271844691979").roles.get("513548143967600646");
    const eliteRole = bot.guilds.get("513539271844691979").roles.get("513548083456376842");
    const titanRole = bot.guilds.get("513539271844691979").roles.get("513548109972766731");
    const mythicalRole = bot.guilds.get("513539271844691979").roles.get("513548047574368256");
    const legendRole = bot.guilds.get("513539271844691979").roles.get("513547553099218945");
    const globalRole = bot.guilds.get("513539271844691979").roles.get("515707601405607961");

    User.find({ twitchName: { $ne: "" }}, function(err, users) {
        var globalAmout = Math.round(users.length * 0.003);
        var legendAmout = Math.round(users.length * 0.01);
        var mythicalAmout = Math.round(users.length * 0.05);
        var titanAmout = Math.round(users.length * 0.1);
        var eliteAmout = Math.round(users.length * 0.25);
        var trooperAmout = Math.round(users.length * 0.5);
        for(var i = 0; i < users.length; i++ ){
            var tempUser = bot.guilds.get("513539271844691979").members.get(users[i].userID);
            var foundRole = false;
            var rankIndex = -1;
            if(tempUser){
            //BASIC RANK
            if (tempUser.roles.has("513548164595187734")){
                rankIndex = 0;
            }
            //TROOPER RANK
            else if (tempUser.roles.has("513548143967600646")){
                rankIndex = 1;
            }
            //ELITE RANK
            else if (tempUser.roles.has("513548083456376842")){
                rankIndex = 2;
            }
            //TITAN RANK
            else if (tempUser.roles.has("513548109972766731")){
                rankIndex = 3;
            }
            //MYTHICAL RANK
            else if (tempUser.roles.has("513548047574368256")){
                rankIndex = 4;
            }
            //LEGEND RANK
            else if (tempUser.roles.has("513547553099218945")){
                rankIndex = 5;
            }
            //GLOBAL RANK
            else if (tempUser.roles.has("515707601405607961")){
                rankIndex = 6;
            }
            if(i + 1 <= globalAmout && foundRole == false){
                foundRole = true;
                if (!tempUser.roles.has("515707601405607961")){
                    tempUser.removeRole(basicRole);
                    tempUser.removeRole(trooperRole);
                    tempUser.removeRole(eliteRole);
                    tempUser.removeRole(titanRole);
                    tempUser.removeRole(mythicalRole);
                    tempUser.removeRole(legendRole);
                    tempUser.addRole(globalRole);
                    bot.channels.get("514257837531070476").send({
                        "embed": {
                        "color": 5636096,
                        "description": "```Upgrade``` :arrow_up_small: | <@" + users[i].userID + ">  Has upgraded to Global <:GlobalLegend:515634365838000129>"
                        }
                    });
                }
            }
            else if(i + 1 <= legendAmout && foundRole == false){
                foundRole = true;
                if (!tempUser.roles.has("513547553099218945")){
                    tempUser.removeRole(basicRole);
                    tempUser.removeRole(trooperRole);
                    tempUser.removeRole(eliteRole);
                    tempUser.removeRole(titanRole);
                    tempUser.removeRole(mythicalRole);
                    tempUser.addRole(legendRole);
                    tempUser.removeRole(globalRole);
                    if(rankIndex < 5){
                        bot.channels.get("514257837531070476").send({
                            "embed": {
                            "color": 5636096,
                            "description": "```Upgrade``` :arrow_up_small: | <@" + users[i].userID + ">  Has upgraded to Legend <:Legend:515689931461623810>"
                            }
                        });
                    }
                    else{
                        bot.channels.get("514257837531070476").send({
                            "embed": {
                            "color": 5636096,
                            "description": "```Downgrade``` :arrow_down_small: | <@" + users[i].userID + ">  Has downgraded to Legend <:Legend:515689931461623810>"
                            }
                        });
                    }
                }
            }
            else if(i + 1 <= mythicalAmout && foundRole == false){
                foundRole = true;
                if (!tempUser.roles.has("513548047574368256")){
                    tempUser.removeRole(basicRole);
                    tempUser.removeRole(trooperRole);
                    tempUser.removeRole(eliteRole);
                    tempUser.removeRole(titanRole);
                    tempUser.addRole(mythicalRole);
                    tempUser.removeRole(legendRole);
                    tempUser.removeRole(globalRole);
                    if(rankIndex < 4){
                        bot.channels.get("514257837531070476").send({
                            "embed": {
                            "color": 5636096,
                            "description": "```Upgrade``` :arrow_up_small: | <@" + users[i].userID + ">  Has upgraded to Mythical <:Mythical:514690692262526986>"
                            }
                        });
                    }
                    else{
                        bot.channels.get("514257837531070476").send({
                            "embed": {
                            "color": 5636096,
                            "description": "```Downgrade``` :arrow_down_small: | <@" + users[i].userID + ">  Has downgraded to Mythical <:Mythical:514690692262526986>"
                            }
                        });
                    }
                }
            }
            else if(i + 1 <= titanAmout && foundRole == false){
                foundRole = true;
                if (!tempUser.roles.has("513548109972766731")){
                    tempUser.removeRole(basicRole);
                    tempUser.removeRole(trooperRole);
                    tempUser.removeRole(eliteRole);
                    tempUser.addRole(titanRole);
                    tempUser.removeRole(mythicalRole);
                    tempUser.removeRole(legendRole);
                    tempUser.removeRole(globalRole);
                    if(rankIndex < 3){
                        bot.channels.get("514257837531070476").send({
                            "embed": {
                            "color": 5636096,
                            "description": "```Upgrade``` :arrow_up_small: | <@" + users[i].userID + ">  Has upgraded to Titan <:Titan:514688131233218560>"
                            }
                        });
                    }
                    else{
                        bot.channels.get("514257837531070476").send({
                            "embed": {
                            "color": 5636096,
                            "description": "```Downgrade``` :arrow_down_small: | <@" + users[i].userID + ">  Has downgraded to Titan <:Titan:514688131233218560>"
                            }
                        });
                    }
                }
            }
            else if(i + 1 <= eliteAmout && foundRole == false){
                foundRole = true;
                if (!tempUser.roles.has("513548083456376842")){
                    tempUser.removeRole(basicRole);
                    tempUser.removeRole(trooperRole);
                    tempUser.addRole(eliteRole);
                    tempUser.removeRole(titanRole);
                    tempUser.removeRole(mythicalRole);
                    tempUser.removeRole(legendRole);
                    tempUser.removeRole(globalRole);
                    if(rankIndex < 2){
                        bot.channels.get("514257837531070476").send({
                            "embed": {
                            "color": 5636096,
                            "description": "```Upgrade``` :arrow_up_small: | <@" + users[i].userID + ">  Has upgraded to Elite <:Elite:514688117975023636>"
                            }
                        });
                    }
                    else{
                        bot.channels.get("514257837531070476").send({
                            "embed": {
                            "color": 5636096,
                            "description": "```Downgrade``` :arrow_down_small: | <@" + users[i].userID + ">  Has downgraded to Elite <:Elite:514688117975023636>"
                            }
                        });
                    }
                }
            }
            else if(i + 1 <= trooperAmout && foundRole == false){
                foundRole = true;
                if (!tempUser.roles.has("513548143967600646")){
                    tempUser.removeRole(basicRole);
                    tempUser.addRole(trooperRole);
                    tempUser.removeRole(eliteRole);
                    tempUser.removeRole(titanRole);
                    tempUser.removeRole(mythicalRole);
                    tempUser.removeRole(legendRole);
                    tempUser.removeRole(globalRole);
                    if(rankIndex < 1){
                        bot.channels.get("514257837531070476").send({
                            "embed": {
                            "color": 5636096,
                            "description": "```Upgrade``` :arrow_up_small: | <@" + users[i].userID + ">  Has upgraded to Trooper <:Trooper:514688097296842766>"
                            }
                        });
                    }
                    else{
                        bot.channels.get("514257837531070476").send({
                            "embed": {
                            "color": 5636096,
                            "description": "```Downgrade``` :arrow_down_small: | <@" + users[i].userID + ">  Has downgraded to Trooper <:Trooper:514688097296842766>"
                            }
                        });
                    }
                }
            }
            else if (!tempUser.roles.has("513548164595187734")){
                tempUser.addRole(basicRole);
                tempUser.removeRole(trooperRole);
                tempUser.removeRole(eliteRole);
                tempUser.removeRole(titanRole);
                tempUser.removeRole(mythicalRole);
                tempUser.removeRole(legendRole);
                tempUser.removeRole(globalRole);
                bot.channels.get("514257837531070476").send({
                    "embed": {
                    "color": 5636096,
                    "description": "```Downgrade``` :arrow_down_small: | <@" + users[i].userID + ">  Has downgraded to Basic <:Basic:514690675741163520>"
                    }
                });
            }
          }
        }
    }).sort( { shards: -1 } );
}

function printMessageInRank(){
    User.find({ twitchName: { $ne: "" }}, function(err, users) {
        var isStreaminRanks = ["","","","","","","",""];
        
        for(var i = 0; i < users.length; i ++){
            if(users[i].isLive){
                var tempUser = bot.guilds.get("513539271844691979").members.get(users[i].userID);
                //BASIC RANK
                if(tempUser){
                    if (tempUser.roles.has("513548164595187734")){
                        isStreaminRanks[0] += "<:Basic:514690675741163520> **<@" + users[i].userID + ">** \n**https://www.twitch.tv/" + users[i].twitchName + "**\n";
                    }
                    //TROOPER RANK
                    else if (tempUser.roles.has("513548143967600646")){
                        isStreaminRanks[1] += "<:Trooper:514688097296842766> **<@" + users[i].userID + ">** \n**https://www.twitch.tv/" + users[i].twitchName + "**\n";
                    }
                    //ELITE RANK
                    else if (tempUser.roles.has("513548083456376842")){
                        isStreaminRanks[2] += "<:Elite:514688117975023636> **<@" + users[i].userID + ">** \n**https://www.twitch.tv/" + users[i].twitchName + "**\n";
                    }
                    //TITAN RANK
                    else if (tempUser.roles.has("513548109972766731")){
                        isStreaminRanks[3] += "<:Titan:514688131233218560> **<@" + users[i].userID + ">** \n**https://www.twitch.tv/" + users[i].twitchName + "**\n";
                    }
                    //MYTHICAL RANK
                    else if (tempUser.roles.has("513548047574368256")){
                        isStreaminRanks[4] += "<:Mythical:514690692262526986> **<@" + users[i].userID + ">** \n**https://www.twitch.tv/" + users[i].twitchName + "**\n";
                    }
                    //LEGEND RANK
                    else if (tempUser.roles.has("513547553099218945")){
                        isStreaminRanks[5] += "<:Legend:515689931461623810> **<@" + users[i].userID + ">** \n**https://www.twitch.tv/" + users[i].twitchName + "**\n";
                    }
                    //GLOBAL RANK
                    else if (tempUser.roles.has("515707601405607961")){
                        isStreaminRanks[6] += "<:GlobalLegend:515634365838000129> **<@" + users[i].userID + ">** \n**https://www.twitch.tv/" + users[i].twitchName + "**\n";
                    }
                }   
            }
        }
        if(firstTimePrintingMessageInRank){
            firstTimePrintingMessageInRank = false;
            /*for(var i = 0; i < channelRankName.length; i++){
                bot.channels.get(channelRankID[i]).send({
                    "embed": {
                    "color": channelRankColor[i],
                    "description": "<:Twitch:515733728450838538> `" + channelRankName[i] + " [LIVE]` <:Twitch:515733728450838538> \n    " + isStreaminRanks[i] + "\n"
                    }
                }).then(newEmbed => rankEmbedMsgID[i] = newEmbed.id);
            }*/

            bot.channels.get("514259128818991115").bulkDelete(100);
            bot.channels.get("514259170745253889").bulkDelete(100);
            bot.channels.get("514259490036776960").bulkDelete(100);
            bot.channels.get("514263406732378112").bulkDelete(100);
            bot.channels.get("514259528657928192").bulkDelete(100);
            bot.channels.get("514259019267833877").bulkDelete(100);
            bot.channels.get("515611247748579353").bulkDelete(100);

            //BASIC
            bot.channels.get("514259128818991115").send({
                "embed": {
                "color": 4929148,
                "description": "<:Twitch:515733728450838538> Basic [LIVE] <:Twitch:515733728450838538> \n" + isStreaminRanks[0]
                }
            }).then(newEmbed => rankEmbedMsgID[0] = newEmbed.id);
            //TROOPER
            bot.channels.get("514259170745253889").send({
                "embed": {
                "color": 4929148,
                "description": "<:Twitch:515733728450838538> Trooper [LIVE] <:Twitch:515733728450838538> \n" + isStreaminRanks[1]
                }
            }).then(newEmbed => rankEmbedMsgID[1] = newEmbed.id);
            //ELITE
            bot.channels.get("514259490036776960").send({
                "embed": {
                "color": 4929148,
                "description": "<:Twitch:515733728450838538> Elite [LIVE] <:Twitch:515733728450838538> \n" + isStreaminRanks[2]
                }
            }).then(newEmbed => rankEmbedMsgID[2] = newEmbed.id);
            //TITAN
            bot.channels.get("514263406732378112").send({
                "embed": {
                "color": 4929148,
                "description": "<:Twitch:515733728450838538> Titan [LIVE] <:Twitch:515733728450838538> \n" + isStreaminRanks[3]
                }
            }).then(newEmbed => rankEmbedMsgID[3] = newEmbed.id);
            //MYTHICAL
            bot.channels.get("514259528657928192").send({
                "embed": {
                "color": 4929148,
                "description": "<:Twitch:515733728450838538> Mythical [LIVE] <:Twitch:515733728450838538> \n" + isStreaminRanks[4]
                }
            }).then(newEmbed => rankEmbedMsgID[4] = newEmbed.id);
            //LEGEND
            bot.channels.get("514259019267833877").send({
                "embed": {
                "color": 4929148,
                "description": "<:Twitch:515733728450838538> Legend [LIVE] <:Twitch:515733728450838538> \n" + isStreaminRanks[5]
                }
            }).then(newEmbed => rankEmbedMsgID[5] = newEmbed.id);
            //GLOBAL LEGEND     
            bot.channels.get("515611247748579353").send({
                "embed": {
                "color": 4929148,
                "description": "<:Twitch:515733728450838538> Global Legend [LIVE] <:Twitch:515733728450838538> \n" + isStreaminRanks[6]
                }
            }).then(newEmbed => rankEmbedMsgID[6] = newEmbed.id);
        }
        else{
            for(var i = 0; i < channelRankName.length; i++){
                if(bot.channels.get(channelRankID[i]).messages.get(rankEmbedMsgID[i])){
                    bot.channels.get(channelRankID[i]).messages.get(rankEmbedMsgID[i]).edit({
                        "embed": {
                            "color": channelRankColor[i],
                            "description": "<:Twitch:515733728450838538> `" + channelRankName[i] + " [LIVE]` <:Twitch:515733728450838538> \n    " + isStreaminRanks[i] + "\n"
                        }
                    });
                }
                else{
                    firstTimePrintingMessageInRank = true;
                }
            }
        }
    });
}
  
setInterval(checkViewersForShards, 60000);
setInterval(resetChattersForShards, 180000);
setInterval(checkStreamersForConnection, 60000);
setInterval(checkStreamersForThumbnail, 60000);
setInterval(checkUsersForRank, 10000);
setInterval(printMessageInRank, 60000)
 
bot.login(config.token);

