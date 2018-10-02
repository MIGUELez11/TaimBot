exports.run = (client, message, args) => {
   const YouTube = require('simple-youtube-api');
   const ytdl = require('ytdl-core');
   const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

   const youtube = new YouTube(GOOGLE_API_KEY);
   const queue = new Map();
   //if (msg.author.bot) return undefined;
   //if (!msg.content.startsWith(PREFIX)) return undefined;

   //const args = msg.content.split(' ');
   //const searchString = args.slice(1).join(' ');
   const url = args[2] ? args[2].replace(/<(.+)>/g, '$1') : '';
   const serverQueue = queue.get(msg.guild.id);

   //let command = msg.content.toLowerCase().split(' ')[0];
   //command = command.slice(PREFIX.length)

   //let args[1] = msg.content.toLowerCase().split(' ')[1];
   //args[1] = command.slice(PREFIX.length)

   //if (command === 'musica' || command === 'music' || command === 'dj') {
      if (args[1] === 'play' || args[1] === "song" || args[1] === 'reproducir' || args[1] === 'cancion') {
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
      } else if (args[1] === 'skip' || args[1] === 'saltar' || args[1] === 'siguiente' || args[1] === 'next') {
         if (!msg.member.voiceChannel) return msg.channel.send('No estás en un canal de voz!');
         if (!serverQueue) return msg.channel.send('No hay ninguna canción reproduciéndose.');
         serverQueue.connection.dispatcher.end('Y... Siguiente canción');
         return undefined;
      } else if (args[1] === 'stop' || args[1] === 'parar' || args[1] === 'terminar') {
         if (!msg.member.voiceChannel) return msg.channel.send('no estás en un canal de voz!');
         if (!serverQueue) return msg.channel.send('Por aquí no hay nada .');
         serverQueue.songs = [];
         serverQueue.connection.dispatcher.end('Y adios a la musica :(');
         return undefined;
      } else if (args[1] === 'volume' || args[1] === 'volumen') {
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


      } else if (args[1] === 'np' || args[1] === 'playing' || args[1] === 'sonando') {
         if (!serverQueue) return msg.channel.send('No hay nada reproduciendo.');
         return msg.channel.send(`🎶 Sonando: **${serverQueue.songs[0].title}**`);
      } else if (args[1] === 'queue' || args[1] === 'playlist' || args[1] === 'cola') {
         if (!serverQueue) return msg.channel.send('Nada en la cola.');
         return msg.channel.send(`
   __**LA COLA ^.^ :**__
   ${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}
   **SONANDO:** ${serverQueue.songs[0].title}
         `);
      } else if (args[1] === 'pause' || args[1] === 'pausar' || args[1] === 'pausa') {
         if (serverQueue && serverQueue.playing) {
            serverQueue.playing = false;
            serverQueue.connection.dispatcher.pause();
            return msg.channel.send('⏸ Yo te lo paro!');
         }
         return msg.channel.send('No oigo nada.');
      } else if (args[1] === 'resume' || args[1] === 'resumir' || args[1] === 'continuar') {
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

};
