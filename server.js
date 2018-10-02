/*
----------------------------------------------------
   DEFINE VARIABLES AND CONSTANTS
----------------------------------------------------
*/
//requirements
const Util = require('discord.js');
const Discord = require('discord.js');
const config = require("./config");
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const {PREFIX, DEFAULTROLE } = require('./config');

//CREATE A CLIENT
const client = new Discord.Client();

//Variable declaration
var msg;
var guild;
var Role;
var MainText;
var send;

//colors
var Reset = "\x1b[0m";
var Bright = "\x1b[1m";
var Dim = "\x1b[2m";
var Underscore = "\x1b[4m";
var Blink = "\x1b[5m";
var Reverse = "\x1b[7m";
var Hidden = "\x1b[8m";

var FgBlack = "\x1b[30m";
var FgRed = "\x1b[31m";
var FgGreen = "\x1b[32m";
var FgYellow = "\x1b[33m";
var FgBlue = "\x1b[34m";
var FgMagenta = "\x1b[35m";
var FgCyan = "\x1b[36m";
var FgWhite = "\x1b[37m";

var BgBlack = "\x1b[40m";
var BgRed = "\x1b[41m";
var BgGreen = "\x1b[42m";
var BgYellow = "\x1b[43m";
var BgBlue = "\x1b[44m";
var BgMagenta = "\x1b[45m";
var BgCyan = "\x1b[46m";
var BgWhite = "\x1b[47m";

const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))


//Initialize variables
//if (TOKEN== undefined && GOOGLE_API_KEY == undefined) {
   const TOKEN = process.env.TOKEN;
   const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

   const minH =  process.env.minH;
   const maxH =  process.env.maxH;
   const minMin = process.env.minMin;
   const maxMin = process.env.maxMin;

   const url = process.env.url;
   const awakeUrl = process.env.awakeUrl;
//}


const youtube = new YouTube(GOOGLE_API_KEY);
const queue = new Map();

/*
------------------------------------------------------
                        FUNCTIONS
------------------------------------------------------
*/
var https = require("http");
var date = new Date();
var h = date.getHours();
var min = date.getMinutes();
if ((h >= minH && h <= maxH)) {
   var inTime = true;
}

console.log(h,":",min,",",inTime);

setInterval (function() {
   var date = new Date();
   var h = (date.getHours());
   var min = date.getMinutes();
   if ((h >= minH && h <= maxH)) {
      if ((h == maxH) && (min >= (maxMin-5) && min <= maxMin)) {
         https.get(awakeUrl);
         console.log("awaking ", awakeUrl);
      }

      https.get(url);
      console.log("pinged");
      inTime = true;
   }
   else {
      inTime = false;
   }
}, 5*60*1000);

//Mantener servidor abierto 12 horas al día, y entonces pingear a otro igual, pero que este esté abierto las otras
//12, al terminar de nuevo ese ciclo de 12 horas, pingear a este para que se encienda


function RandomNumber(min,max) {
   var number = Math.random()*max + min;
   return number;
}


/*
------------------------------------------------------
                        ON START
------------------------------------------------------
*/
client.on('ready', () => {
   //Clears the console, prints I'm ready and set the playing game to TAIM GAMING
   console.clear();
   console.log(BgGreen,'Toy Ready', Reset);
   console.log('\n');

   client.user.setActivity('TAIM GAMING', { type: 'watching' })
      .then(presence => console.log(`Activity set to ${presence.game ? presence.game.name : 'none'}`))
      .catch(console.error);

   guild = client.guilds.get('380446323205210112');
   Role = guild.roles.find(x => x.name === DEFAULTROLE);
   MainText = '493355326536548356';
   send = true;
   console.log(`Role is`, BgYellow,`${Role.name}`, Reset);

});

//DETECT DIFFERENT PROBLEMS
client.on('warn', console.warn);

client.on('error', console.error);

client.on('disconnect', () => console.log('I just disconnected, making sure you know, I will reconnect now...'));

client.on('reconnecting', () => console.log('I am reconnecting now!'));



//If it is this bot time then keep idle
if ((h >= minH && h <= maxH)) {

   //WHEN A MESSAGE IS SENT
   client.on('message', async msg => { // eslint-disable-line
      //Music code
      const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
      const command = args.shift().toLowerCase();

      // The list of if/else is replaced with those simple 2 lines:
      if (command == "musica" || command == "music") {
         try {
           let commandFile = require(`./commands/${command}.js`);
           commandFile.run(client, message, args);
         } catch (err) {
           console.error(err);
         }
      }
   }


   client.on('message', message => {
      const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
      const command = args.shift().toLowerCase();


      if (message.content[0] == PREFIX) {
         switch (command) {
            case 'hola':
            case 'hello':
            case 'ey':
            case 'hey':
               console.log(command);
               // Send "pong" to the same channel
               //console.log(message.member.GuildMember.username);
               //message.member.addRole("name","TAIMERS");
               switch (Math.round(RandomNumber(0,3))) {
                  case 0 : message.channel.send(`Ey, que pasa ${message.author}?`); break;
                  case 1 : message.channel.send(`Allo ${message.author}`); break;
                  case 2 : message.channel.send(`Cómo vamos ${message.author}?`); break;
                  case 3 : message.channel.send(`Buenas ${message.author}`); break;
               }

               //message.member.voiceChannel.join();
               break;
            case 'adios':
            case 'adeu':
            case 'chao':
               console.log(msg);
               // Send "pong" to the same channel
               switch (Math.round(RandomNumber(0,3))) {
                  case 0 : message.channel.send(`Hasta otra ${message.author}`); break;
                  case 1 : message.channel.send(`Chao pescao ${message.author}!`); break;
                  case 2 : message.channel.send(`Nos vemos ;P ${message.author}!!`); break;
                  case 3 : message.channel.send(`${message.author} Volverás verdad? `); break;
               }
               //message.member.voiceChannel.leave();
               break;
            case 'role':
               console.log(`${Role.name}`);
               break;
         }
      }
   });
}



// Create an event listener for new guild members
client.on('guildMemberAdd', member => {
   console.log('User ' + member.username + 'has joined the server!');
   console.log(Role.id);
   member.addRole(Role.id);
});

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login(TOKEN);
