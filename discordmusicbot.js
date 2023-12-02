const { Client, GatewayIntentBits } = require('discord.js');
const { createAudioPlayer, createAudioResource, joinVoiceChannel, NoSubscriberBehavior } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const yts = require('yt-search');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});
let player;
client.on('messageCreate', async (message) => {
  if (!message.guild) return;

  if (message.content.startsWith('!play')) {

    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      return message.reply('You need to be in a voice channel to play music!');
    }

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    // Search for the video by name
    const searchTerm = message.content.slice(6);
    const videoResult = await yts(searchTerm);
    
    
    const videoUrl = videoResult.videos[0].url;
    
    // Adjust options for better sound quality
    const stream = ytdl(videoUrl, { quality: 'highestaudio', filter: 'audioonly' });
    const resource = createAudioResource(stream);
    
    console.log('Voice Channel:', voiceChannel);
    console.log('Stream:', stream);

    player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      },
    });

    connection.subscribe(player);
    player.play(resource);
    message.reply(`YtMusic is now Playing: ${videoResult.videos[0].title}`);

  }
  if (message.content.startsWith('!pause')) {
    if (!player) {
      return message.reply('No song is currently playing!');
    }

    player.pause();
    message.reply('YtbMusic paused');
  }

  if (message.content.startsWith('!resume')) {
    if (!player) {
      return message.reply('No song is currently paused!');
    }

    player.unpause();
    message.reply('YtbMusic resumed');
  }
  if (message.content.startsWith('!skip')) {
    if (!player) {
      return message.reply('No song is currently paused!');
    }

    player.skip();
    message.reply('Song Skipped');
  }
});



client.login('Bot Token');
