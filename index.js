require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;
const CONTAINER = process.env.CONTAINER;
const CHANNEL = process.env.CHANNEL;

const {Docker} = require('node-docker-api');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

bot.login(TOKEN);

let timeoutObj;

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {
  if(msg.channel.id === CHANNEL) {

    console.log(msg.content);
    if (msg.content.startsWith('!restart')) {

      docker.container.get(CONTAINER).status().then(a => {
        if(a && a.data && a.data.State && a.data.State.Running) {

          msg.channel.send('@here Server will restart in 10 seconds. !abort to abort the restart');
        } else {

          msg.channel.send('@here Server was stopped and will start in 10 seconds. !abort to abort the start');
        }

        clearTimeout(timeoutObj);
        timeoutObj = setTimeout(() => {
          msg.channel.send('Restarting Server');
          docker.container.get(CONTAINER).restart().then(container => {

            msg.channel.send('Restarted Server');
          })
        }, 10000);
      })

    } else if (msg.content.startsWith('!stop')) {

      docker.container.get(CONTAINER).status().then(a => {
        if(a && a.data && a.data.State && a.data.State.Running) {

          msg.channel.send('@here Server will stop in 10 seconds. !abort to abort the restart');
          clearTimeout(timeoutObj);
          timeoutObj = setTimeout(() => {
            msg.channel.send('Stopping Server');
            docker.container.get(CONTAINER).stop().then(container => {

              msg.channel.send('Stopped Server');
            })
          }, 10000);
        } else {
          msg.channel.send('Server is already stopped');
        }
      })

    } else if (msg.content.startsWith('!abort')) {

      clearTimeout(timeoutObj);
      msg.channel.send('Action aborted');
    } else if (msg.content.startsWith('!help')) {

      msg.channel.send('Help: !stop will stop the server. !restart will restart/start the server');
    }
  }
});
