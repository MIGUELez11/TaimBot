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
   var h = (date.getHours())+2;
   var min = date.getMinutes();
   if ((h >= minH && h <= maxH)) {
      if ((h = maxH) && (min >= (maxMin-5) && min <= maxMin)) {
         https.get("http://taimbotmadrugada.herokuapp.com");
      }

      https.get("http://taimbot.herokuapp.com");
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
   	if (msg.author.bot) return undefined;
   	if (!msg.content.startsWith(PREFIX)) return undefined;

   	const args = msg.content.split(' ');
   	const searchString = args.slice(1).join(' ');
   	const url = args[2] ? args[2].replace(/<(.+)>/g, '$1') : '';
   	const serverQueue = queue.get(msg.guild.id);

   	let command = msg.content.toLowerCase().split(' ')[0];
   	command = command.slice(PREFIX.length)

      let arg1 = msg.content.toLowerCase().split(' ')[1];
   	//arg1 = command.slice(PREFIX.length)

      if (command === 'musica' || command === 'music' || command === 'dj') {
      	if (arg1 === 'play' || arg1 === "song" || arg1 === 'reproducir' || arg1 === 'cancion') {
      		const voiceChannel = msg.member.voiceChannel;
      		if (!voiceChannel) return msg.channel.send('Necesitas estar en un canal de voz para reproducir canciones');
      		const permissions = voiceChannel.permissionsFor(msg.client.user);
      		if (!permissions.has('CONNECT')) {
      			return msg.channel.send('Llama a un ADMIN, que no tengo permisos');
      		}
      		if (!permissions.has('SPEAK')) {
      			return msg.channel.send('No puedo hablar, habla con MIGUELez11 para que me desmutee');
      		}

      		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
      			const playlist = await youtube.getPlaylist(url);
      			const videos = await playlist.getVideos();
      			for (const video of Object.values(videos)) {
      				const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
      				await handleVideo(video2, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop
      			}
      			return msg.channel.send(`✅ Playlist: **${playlist.title}** Ha sido añadida a la lista`);
      		} else {
      			try {
      				var video = await youtube.getVideo(url);
      			} catch (error) {
      				try {
      					var videos = await youtube.searchVideos(searchString, 10);
      					let index = 0;
      					msg.channel.send(`
      __**Busca Musica 2000:**__
      ${videos.map(video2 => `**${++index} -** ${video2.title}`).join('\n')}
      Selecciona un valor del 1-10.
      					`);
      					// eslint-disable-next-line max-depth
      					try {
      						var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
      							maxMatches: 1,
      							time: 10000,
      							errors: ['time']
      						});
      					} catch (err) {
      						console.error(err);
      						return msg.channel.send('Ninguna? Vale, lo pillo');
      					}
      					const videoIndex = parseInt(response.first().content);
      					var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
      				} catch (err) {
      					console.error(err);
      					return msg.channel.send('🆘 UPS, no encuentro nada.');
      				}
      			}
      			return handleVideo(video, msg, voiceChannel);
      		}
      	} else if (arg1 === 'skip' || arg1 === 'saltar' || arg1 === 'siguiente' || arg1 === 'next') {
      		if (!msg.member.voiceChannel) return msg.channel.send('No estás en un canal de voz!');
      		if (!serverQueue) return msg.channel.send('No hay ninguna canción reproduciéndose.');
      		serverQueue.connection.dispatcher.end('Y... Siguiente canción');
      		return undefined;
      	} else if (arg1 === 'stop' || arg1 === 'parar' || arg1 === 'terminar') {
      		if (!msg.member.voiceChannel) return msg.channel.send('no estás en un canal de voz!');
      		if (!serverQueue) return msg.channel.send('Por aquí no hay nada .');
      		serverQueue.songs = [];
      		serverQueue.connection.dispatcher.end('Y adios a la musica :(');
      		return undefined;
      	} else if (arg1 === 'volume' || arg1 === 'volumen') {
      		if (!msg.member.voiceChannel) return msg.channel.send('No estás en un canal de voz!');
      		if (!serverQueue) return msg.channel.send('Pero a que le quieres subir el volumen.');
      		if (!args[2]) return msg.channel.send(`El volumen actual es: **${serverQueue.volume}**`);
            if(args[2] > 5) {
               serverQueue.volume = 5
               serverQueue.connection.dispatcher.setVolumeLogarithmic(5 / 5);
               return msg.channel.send(`El nuevo volumen es: **5**`);
            }
            else {
               serverQueue.volume = args[2];
               serverQueue.connection.dispatcher.setVolumeLogarithmic(args[2] / 5);
               return msg.channel.send(`El nuevo volumen es: **${args[2]}**`);
            }


      	} else if (arg1 === 'np' || arg1 === 'playing' || arg1 === 'sonando') {
      		if (!serverQueue) return msg.channel.send('No hay nada reproduciendo.');
      		return msg.channel.send(`🎶 Sonando: **${serverQueue.songs[0].title}**`);
      	} else if (arg1 === 'queue' || arg1 === 'playlist' || arg1 === 'cola') {
      		if (!serverQueue) return msg.channel.send('Nada en la cola.');
      		return msg.channel.send(`
      __**LA COLA ^.^ :**__
      ${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}
      **SONANDO:** ${serverQueue.songs[0].title}
      		`);
      	} else if (arg1 === 'pause' || arg1 === 'pausar' || arg1 === 'pausa') {
      		if (serverQueue && serverQueue.playing) {
      			serverQueue.playing = false;
      			serverQueue.connection.dispatcher.pause();
      			return msg.channel.send('⏸ Yo te lo paro!');
      		}
      		return msg.channel.send('No oigo nada.');
      	} else if (arg1 === 'resume' || arg1 === 'resumir' || arg1 === 'continuar') {
      		if (serverQueue && !serverQueue.playing) {
      			serverQueue.playing = true;
      			serverQueue.connection.dispatcher.resume();
      			return msg.channel.send('▶ Te devuelvo la musica guap@!');
      		}
      		return msg.channel.send('No hay ninguna canción parada :P.');
      	}
      }
   	return undefined;
   });

   async function handleVideo(video, msg, voiceChannel, playlist = false) {
   	const serverQueue = queue.get(msg.guild.id);
   	console.log(video);
   	const song = {
   		id: video.id,
   		title: Util.escapeMarkdown(video.title),
   		url: `https://www.youtube.com/watch?v=${video.id}`
   	};
   	if (!serverQueue) {
   		const queueConstruct = {
   			textChannel: msg.channel,
   			voiceChannel: voiceChannel,
   			connection: null,
   			songs: [],
   			volume: 0.25,
   			playing: true
   		};
   		queue.set(msg.guild.id, queueConstruct);

   		queueConstruct.songs.push(song);

   		try {
   			var connection = await voiceChannel.join();
   			queueConstruct.connection = connection;
   			play(msg.guild, queueConstruct.songs[0]);
   		} catch (error) {
   			console.error(`I could not join the voice channel: ${error}`);
   			queue.delete(msg.guild.id);
   			return msg.channel.send(`No me puedo unir al canal: ${error}`);
   		}
   	} else {
   		serverQueue.songs.push(song);
   		console.log(serverQueue.songs);
   		if (playlist) return undefined;
   		else return msg.channel.send(`✅ **${song.title}** Se ha agregado a la cola!`);
   	}

   	return undefined;
   }

   function play(guild, song) {
   	const serverQueue = queue.get(guild.id);

   	if (!song) {
   		serverQueue.voiceChannel.leave();
   		queue.delete(guild.id);
   		return;
   	}
   	console.log(serverQueue.songs);

   	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
   		.on('end', reason => {
   			if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
   			else console.log(reason);
   			serverQueue.songs.shift();
   			play(guild, serverQueue.songs[0]);
   		})
   		.on('error', error => console.error(error));
   	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

   	serverQueue.textChannel.send(`🎶 Reproduciendo: **${song.title}**`);
   }





   client.on('message', message => {
      msg = message.content.toLowerCase();
      if (msg[0] == PREFIX) {
         switch (msg) {
            case PREFIX + 'hola':
            case PREFIX + 'hello':
            case PREFIX + 'ey':
            case PREFIX + 'hey':
               console.log(msg);
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
            case PREFIX + 'adios':
            case PREFIX + 'adeu':
            case PREFIX + 'chao':
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
            case PREFIX + 'role':
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
