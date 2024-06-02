require('dotenv').config();
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const express = require('express');
const socketio = require('socket.io');
const fs = require('fs');
const http = require('http');
const axios = require('axios');
const cors = require('cors');
const gtts = require('gtts');
const md = require('mp3-duration')

const STREAMERS = require('../class/streamers.js');
const CLIENT = require('../util/client.js');
const dragonFlyDB = require('../util/database/dragonflydb');

const { encrypt, decrypt } = require('../util/crypto');
const jwt = require('../util/auth.js')

const channelSchema = require('../schemas/channel.schema');
const commandSchema = require('../schemas/command');
const countdownTimerSchema = require('../schemas/countdowntimer');
const { getUrl } = require('../util/dev.js');

//* ROUTES
const eventsubRoute = require('./routes/eventsub.routes.js');
const triggerRoutes = require('./routes/trigger.routes.js');
const rewardsRoutes = require('./routes/rewards.routes.js');
const commandRoutes = require('./routes/commands.routes.js');
const countdownTimerRoutes = require('./routes/countdowntimer.routes.js');

const authMiddleware = require('../middlewares/auth.js');

const CHANNEL = require('../functions/channel');

const { SubscritpionsData, subscribeTwitchEvent, getEventsubs } = require('../util/eventsub.js');

const downloadPath = `${__dirname}/routes/public/downloads/`;
const htmlPath = `${__dirname}/routes/public/`;

const COMMANDSJSON = require('../config/reservedcommands.json');

let io;
let cache;

let timerMap = new Map();

let speachMap = new Map();

async function init() {
  const PORT = process.env.PORT || 3000;

  const app = express();
  const server = http.createServer(app);
  io = await socketio(server);

  cache = await dragonFlyDB.getClient();

  io.of(/^\/clip\/\w+$/).on('connection', (socket) => {
    const channel = socket.nsp.name.split('/')[2];
    io.of(`/clip/${channel}`).emit('prepare-clips');
  });

  io.of(/^\/speach\/\w+$/).on('connection', (socket) => {
    const channel = socket.nsp.name.split('/')[2];
    io.of(`/clip/${channel}`).emit('prepare-speach');
  });

  io.of(/^\/speech\/\w+$/).on('finished', (socket) => {
    const channel = socket.nsp.name.split('/')[2];
    let channelMap = speachMap.get(channel);
    console.log({ channelMap , channel })
    channelMap.shift();
    if(channelMap.length === 0) return false;
    let newID = channelMap[0];
    speachMap.set(channel, channelMap);
    io.of(`/speach/${channel}`).emit('speach', { id });
  });

  io.of(/^\/sumimetro\/\w+\/\w+$/).on('connection', (socket) => {
    const type = socket.nsp.name.split('/')[2];
    const channel = socket.nsp.name.split('/')[3];
    io.of(`/sumimetro/${type}/${channel}`).emit('active');
  });

  io.of(/^\/overlays\/triggers\/\w+$/).on('connection', (socket) => {
    const channel = socket.nsp.name.split('/')[3];
    io.of(`/overlay/triggers/${channel}`).emit('prepareTriggers');
  });

  io.of(/^\/overlays\/ariascarletvt\/furry/).on('connection', (socket) => {
    const channel = socket.nsp.name.split('/')[3];
    io.of(`/overlays/${channel}/furry`).emit('active');
  });

  io.of(/^\/countdowntimer\/\w+$/).on('connection', async (socket) => {
    const channel = socket.nsp.name.split('/')[2];

    let timer;

    timer = await cache.get(`${channel}:countdown:timer`);

    if(!timer) {
      timer = await countdownTimerSchema.findOne({ channel, active: true });
      if (!timer) return false;

      timer = {
        time: timer.time,
        paused: timer.paused,
      }

      timer = JSON.stringify(timer);

      cache.set(`${channel}:countdown:timer`, timer, { EX: 60 * 60 * 24 * 2});
    }

    timer = JSON.parse(timer);
    
    let data = {
      time: timer.time,
      paused: timer.paused,
    }
    
    io.of(`/countdowntimer/${channel}`).emit('active', data);
  });
  
  //* Routes *//
  let soSent = [];

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static(__dirname + "/routes/public"));
  app.use(cors());

  //? DEV ROUTES ?//

  app.post('/dev/speach', (req, res) => {
    let text = req.body.text;
    let lang = req.body.lang;
    let tts = new gtts(text, lang);
    
    tts.save(`${__dirname}/routes/public/speach/speach.mp3`);

    res.status(200).json({ message: 'Speach created', error: false });
  });
  
  app.post('/dev/create/commands', async (req, res) => {
    let streamers = await STREAMERS.getStreamers();

    streamers.forEach(async (streamer) => {
      let res = await fetch(`${getUrl()}/dev/create/command/${streamer.name}`, {
        method: 'POST'
      });
    })
    
    res.status(200).json({ message: 'Commands created', error: false });
  });

  app.get('/dev/eventsubs', async (req, res) => {
    let eventsubs = await getEventsubs();
    res.status(200).json(eventsubs);
  });
  
  app.post('/dev/create/command/:channel', async (req, res) => {
    const { channel } = req.params;
    let streamer = await STREAMERS.getStreamer(channel);

    let commandsJSON = COMMANDSJSON.commands;

    for (let command in commandsJSON) {
      let commandExists = await commandSchema.exists({ name: commandsJSON[command].name, channel: streamer.name, channelID: streamer.user_id });

      if (commandExists) {
        console.log(`Command ${commandsJSON[command].name} already exists for ${streamer.name}`)
        continue;
      };

      let newCommand = new commandSchema({
        name: commandsJSON[command].name,
        cmd: commandsJSON[command].cmd,
        func: commandsJSON[command].func,
        type: commandsJSON[command].type,
        channel: streamer.name,
        channelID: streamer.user_id,
        cooldown: commandsJSON[command].cooldown,
        enabled: commandsJSON[command].enabled,
        userLevel: commandsJSON[command].userLevel,
        userLevelName: commandsJSON[command].userLevelName,
        reserved: commandsJSON[command].reserved,
      });

      await newCommand.save();
    }
    
    res.status(200).json({ message: 'Commands created', error: false });
    
  });
  
  app.get('/commands/reserved', async (req, res) => {
    res.status(200).json(COMMANDSJSON);
  });

  //? CLIP ROUTES ?//

  app.get('/clip/:channel', (req, res) => {
    const channel = req.params.channel;
    res.status(200).sendFile(`${htmlPath}clip.html`);
  })

  app.post('/clip/:channel', async (req, res) => {
    const channel = req.params.channel;
    const { duration, thumbnail, title, game, streamer, profileImg, streamerColor, description } = req.body;
    const body = req.body;

    if (soSent.includes(channel)) {
      res.status(400).json({ message: `Clip already playing on ${channel} channel` });
      return false;
    }

    let clip = getVideoURL(thumbnail);

    let fileName = `${channel}-clip.mp4`;

    let path = `${downloadPath}${fileName}`;

    if (!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath, { recursive: true })
    }

    const response = await fetch(clip);
    if (!response.ok) {
      const err = new Error(`Error bla bla bla`)
      throw err
    }
    const file = fs.createWriteStream(path);
    const stream = response.body.pipe(file);

    await new Promise((resolve, reject) => {
      stream.on('finish', () => {
        io.of(`/clip/${channel}`).emit('play-clip', body);
        soSent.push(streamer);
        setTimeout(() => {
          soSent = soSent.filter(so => so !== streamer);
        }, 1000 * Number(duration));
        resolve()
      });
    });

    file.on('error', (err) => {
      console.error(err);
      return false;
    });

    res.status(200).json({ message: `Playing clip on ${channel} channel`, status: 'success' });

  });

  //? VIDEO ROUTES ?//

  app.get('/video/:channel', (req, res) => {
    const { channel } = req.params;
    res.status(200).sendFile(`${__dirname}/routes/public/downloads/${channel}-clip.mp4`);
  });

  //? SPEACH ROUTES ?//

  app.get('/speach/:channel', (req, res) => {
    const channel = req.params.channel;
    res.status(200).sendFile(`${__dirname}/routes/public/speach.html`);
  });

  app.post('/speach/:channel', (req, res) => {
    const channel = req.params.channel;
    const speach = req.body.speach;
    const msgID = req.body.msgID;
    const lang = req.body.lang ?? 'es';
    const tts = new gtts(speach, lang);

    tts.save(`${__dirname}/routes/public/speach/${msgID}.mp3`, (err, result) => {
      if (err) {
        console.log(err);
        return false;
      }
    
      if(!speachMap.has(channel)) {
        speachMap.set(channel, []);
      }
      
      let channelMap = speachMap.get(channel);
      if(channelMap.length === 0) {
        md(`${__dirname}/routes/public/speach/${msgID}.mp3`, (err, duration) => {
          io.of(`/speach/${channel}`).emit('speach', { id: msgID });
          setTimeout(() => {
            fetch(`${getUrl()}/speach/send/${channel}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ id: msgID })
            });
          }, duration * 1000);
        });
      }
      channelMap.push(msgID);
      speachMap.set(channel, channelMap);
    });

    // io.of(`/speach/${channel}`).emit('speach', { message: speach, id: msgID });

    res.status(200).json({ message: `Playing speach on ${channel} channel` });
  });

  app.post('/speach/send/:channel', (req, res) => {
    const channel = req.params.channel;
    const id = req.body.id;

    let channelMap = speachMap.get(channel);
    if(channelMap.length === 0) return false;
    let newID = channelMap.shift();

    speachMap.set(channel, channelMap);
    
    md(`${__dirname}/routes/public/speach/${newID}.mp3`, (err, duration) => {
      io.of(`/speach/${channel}`).emit('speach', { id: newID });
      setTimeout(() => {
        fs.unlinkSync(`${__dirname}/routes/public/speach/${newID}.mp3`);
      }, (duration * 1000) - 1000);
      setTimeout(() => {
        fetch(`${getUrl()}/speach/send/${channel}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: newID })
        });
      }, duration * 1000);
    });

    res.status(200).json({ message: `Playing speach on ${channel} channel` });
  });

  app.get('/speech/:channel', (req, res) => {
    const channel = req.params.channel;
    res.status(200).sendFile(`${__dirname}/routes/public/speech.html`);
  });
  
  app.get('/speach/:channel/:id', (req, res) => {
    const { channel, id } = req.params;
    res.header('Content-Type', 'audio/mpeg');
    res.header('Content-Disposition', `attachment; filename=${id}.mp3`)
    res.header('Content-Transfer-Encoding', 'binary')
    res.status(200).sendFile(`${__dirname}/routes/public/speach/${id}.mp3`);
  });

  //? AUTH ROUTES

  app.get('/auth', async (req, res) => {
    let token = req.query.code;
    let username = req.query.state;

    let updatedChannel;

    if (!token) {
      res.status(400).send('No token provided, there was an error getting your token');
      return false;
    }

    axios({
      method: 'post',
      url: 'https://id.twitch.tv/oauth2/token',
      params: {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code: token,
        grant_type: 'authorization_code',
        redirect_uri: 'https://domdimabot.com/login'
      },
      headers: {
        'Content-Type': 'www-form-urlencoded'
      }
    })
      .then(async (response) => {
        let token = response.data.access_token;
        let refreshToken = response.data.refresh_token;
        let tokenType = response.data.token_type;
        let expiresIn = response.data.expires_in;
        let scope = response.data.scope;
        let tokenID = response.data.id_token;

        token = encrypt(token);
        refreshToken = encrypt(refreshToken);

        updatedChannel = await channelSchema.findOneAndUpdate({ name: username }, { twitch_user_token: token, twitch_user_refresh_token: refreshToken, twitch_user_token_id: tokenID, actived: true });

        if (!updatedChannel) {
          res.status(400).send('There was an error updating your channel');
          return false;
        } else {
          await STREAMERS.updateStreamers();

          let addedMod = await CHANNEL.setModerator(username);

          if (addedMod.error) {
            console.log({ error: addedMod.reason, where: 'auth.js', for: username });
            if (addedMod.reason == 'user is already a mod') { }
            else {
              return res.status(400).json({ error: true, message: `There was an error setting up your account and the bot in your channel` });
            }
          }

          let eventData = SubscritpionsData;

          for (let event of eventData) {
            if (event.type === 'channel.raid') {
              event.condition.to_broadcaster_user_id = updatedChannel.twitch_user_id;
            } else {
              event.condition.broadcaster_user_id = updatedChannel.twitch_user_id;
            }
            let response = await subscribeTwitchEvent(updatedChannel.twitch_user_id, event.type, event.version, event.condition);
          }

          let commandsJSON = COMMANDSJSON.commands;

          for (let command in commandsJSON) {
            let commandExists = await commandSchema.exists({ name: commandsJSON[command].name, channel: updatedChannel.name, channelID: updatedChannel.twitch_user_id });

            if (commandExists) {
              console.log(`Command ${commandsJSON[command].name} already exists for ${updatedChannel.name}`)
              continue;
            };

            let newCommand = new commandSchema({
              name: commandsJSON[command].name,
              cmd: commandsJSON[command].cmd,
              func: commandsJSON[command].func,
              type: commandsJSON[command].type,
              channel: updatedChannel.name,
              channelID: updatedChannel.twitch_user_id,
              cooldown: commandsJSON[command].cooldown,
              enabled: commandsJSON[command].enabled,
              userLevel: commandsJSON[command].userLevel,
              userLevelName: commandsJSON[command].userLevelName,
              reserved: commandsJSON[command].reserved,
            });

            await newCommand.save();
          }

          CLIENT.connectChannel(username);

          res.status(200).sendFile(`${htmlPath}login.html`);

        }
      })
      .catch((err) => {
        console.log(err);
      });

  });

  app.post('/premium', async (req, res) => {
    let { channel, channelID } = req.body;

    let exists = await channelSchema.findOne({ name: channel, twitch_user_id: channelID }, 'premium premium_plus');

    if (!exists) {
      res.status(400).json({ error: true, reason: 'Channel not found' });
      return false;
    }

    if (exists.premium_plus) {
      return res.status(200).json({ error: false, message: 'Channel is premium plus', premium: 'premium_plus' });
    } else if (exists.premium) {
      return res.status(200).json({ error: false, message: 'Channel is premium', premium: 'premium' });
    } else {
      return res.status(200).json({ error: false, message: 'Channel is not premium', premium: 'none' });
    }
  });

  //? LOGIN ROUTES ?//

  app.post('/login', async (req, res) => {
    const { name, id, email, action } = req.body;

    let exists = await channelSchema.findOne({ twitch_user_id: id });

    let token = jwt.generateToken(id);

    if (exists) {
      res.status(200).json({
        message: 'User already exists',
        exists: true,
        token,
      });
      return false;
    } else {
      if (action === 'login') {
        let newChannel = new channelSchema({
          name,
          email,
          twitch_user_id: id,
        });

        await newChannel.save();

        res.status(200).json({
          message: 'User created',
          saved: true,
          token,
        });
      } else {
        res.status(200).json({
          message: 'User not found',
          exists: false,
        });
      }
    }

  });

  app.get('/active/:channel', async (req, res) => {
    const { channel } = req.params;
    let exists = await channelSchema.findOne({ name: channel });

    if (!exists) return res.status(404).json({ message: 'Channel not found', error: true });

    if (exists.actived) {
      res.status(200).json({ message: 'Channel is active', active: true, error: false });
    } else {
      res.status(200).json({ message: 'Channel is not active', active: false, error: false });
    }

  })
  //? BOT ROUTES ?//

  app.post('/bot/:action', async (req, res) => {
    const action = req.params.action;
    const { id } = req.body;

    let exists = await channelSchema.findOne({ twitch_user_id: id });

    if (exists) {
      if (action === 'join') {
        CLIENT.connectChannel(exists.name);
        exists.actived = true;
        await exists.save();
        res.status(200).json({ message: 'Joined channel', error: false });
      } else if (action === 'leave') {
        CLIENT.disconnectChannel(exists.name);
        exists.actived = false;
        await exists.save();
        res.status(200).json({ message: 'Left channel', error: false });
      } else {
        res.status(400).json({ message: 'Action not found', error: true });
      }
      await STREAMERS.updateStreamers();
    } else {
      res.status(400).json({ message: 'User not found', error: true });
      return false;
    }


  })

  //? SUMIMETRO ROUTES ?//
  app.get('/sumimetro/:type/:channel', async (req, res) => {
    res.sendFile(`${htmlPath}sumimetro.html`);
  });

  app.post('/sumimetro/:type/:channel', async (req, res) => {
    const { type, channel } = req.params;
    const { username, value } = req.body;

    io.of(`/sumimetro/${type}/${channel}`).emit('sumimetro', { username, value });
    res.status(204).send();
  });

  //? Trigger ROUTES ?//
  app.use('/triggers', triggerRoutes);

  app.get('/overlays/triggers/:channel', async (req, res) => {
    res.sendFile(`${htmlPath}trigger.html`);
  });

  app.get('/media/:channel/:trigger', async (req, res) => {
    const { channel, trigger } = req.params;
    if (!fs.existsSync(`${__dirname}/routes/public/uploads/triggers/${channel}/${trigger}`)) return res.status(404).json({ message: 'File not found', error: true });
    res.sendFile(`${__dirname}/routes/public/uploads/triggers/${channel}/${trigger}`);
  });

  app.get('/points/:channel', async (req, res) => {
    let ch = req.params.channel;
    let streamer = await STREAMERS.getStreamer(ch);
    let response = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${streamer.user_id}`, {
      method: 'GET',
      headers: {
        'Client-ID': process.env.CLIENT_ID,
        'Authorization': `Bearer ${decrypt(streamer.token)}`
      }
    })

    let data = await response.json();

    res.status(200).json(data);

  });

  //? REDEMPTION ROUTES ?//
  app.use('/rewards', rewardsRoutes);

  //? COMMANDS ROUTES ?//
  app.use('/commands', commandRoutes)

  app.get('/logout', async (req, res) => {
    res.status(200).sendFile(`${htmlPath}logout.html`);
  });

  //? OVERLAY ROUTES ?//

  app.get('/overlays/:channel/furry', async (req, res) => {
    res.sendFile(`${htmlPath}furry.html`);
  });

  app.post('/overlays/:channel/furry', async (req, res) => {
    const { channel } = req.params;
    const { username, value } = req.body;

    io.of(`/overlays/${channel}/furry`).emit('furry', { username, value });
    res.status(204).send();
  });

  //? EVENTSUB ROUTES ?//
  app.use('/eventsubs', eventsubRoute);

  //? COUNTDOWN TIMER ROUTES ?//
  app.use('/countdowntimer', countdownTimerRoutes)

  app.post('/countdowntimer/:channelID/timer/resume', async (req, res) => {
    const { channelID } = req.params;

    let streamer = await STREAMERS.getStreamerById(channelID);
    
    let countdownTimer = await countdownTimerSchema.findOne({ channelID: channelID, active: true });

    if (!countdownTimer) {
      return res.status(400).json({ error: true, message: 'No active countdown timer found' });
    }

    countdownTimer.paused = false;
    countdownTimer.resumedAt = Date.now();
    
    await countdownTimer.save();

    io.of(`/countdowntimer/${streamer.name}`).emit('resume');
    
    return res.status(200).json({ error: false, message: 'Timer resumed' });    
    
  });

  app.post('/countdowntimer/:channelID/timer/pause', async (req, res) => {
    const { channelID } = req.params;
    let streamer = await STREAMERS.getStreamerById(channelID);
    
    let countdownTimer = await countdownTimerSchema.findOne({ channelID: channelID, active: true });

    if (!countdownTimer) {
      return res.status(400).json({ error: true, message: 'No active countdown timer found' });
    }

    if(countdownTimer.paused) {
      return res.status(400).json({ error: true, message: 'Timer already paused' });
    }

    countdownTimer.paused = true;
    countdownTimer.pausedAt = Date.now();

    let countdownTimerGone = Math.floor((countdownTimer.pausedAt - countdownTimer.resumedAt) / 1000);
    countdownTimer.time -= countdownTimerGone;

    if (countdownTimer.time < 0) {
      countdownTimer.time = 0;
    }
    
    await countdownTimer.save();

    cache.set(`${streamer.name}:countdown:timer`, JSON.stringify({ time: countdownTimer.time, paused: countdownTimer.paused }), { EX: 60 * 60 * 24 * 2 });

    io.of(`/countdowntimer/${streamer.name}`).emit('pause');
    
    return res.status(200).json({ error: false, message: 'Timer paused' });
  });

  app.post('/countdowntimer/:channelID/timer/add', async (req, res) => {
    const { channelID } = req.params;
    let streamer = await STREAMERS.getStreamerById(channelID);
    let body = req.body;

    let countdownTimer = await countdownTimerSchema.findOne({ channelID: channelID, active: true });

    if (!countdownTimer) {
      return res.status(400).json({ error: true, message: 'No active countdown timer found' });
    }

    countdownTimer.time += Number(body.time);

    await countdownTimer.save();

    cache.set(`${streamer.name}:countdown:timer`, JSON.stringify({ time: countdownTimer.time, paused: countdownTimer.paused }), { EX: 60 * 60 * 24 * 2 });

    io.of(`/countdowntimer/${streamer.name}`).emit('add', { time: body.time });
    
    return res.status(200).json({ error: false, message: 'Time added' });
  });

  app.post('/countdowntimer/:channelID/timer/substract', async (req, res) => {
    const { channelID } = req.params;
    let streamer = await STREAMERS.getStreamerById(channelID);
    let body = req.body;

    let countdownTimer = await countdownTimerSchema.findOne({ channelID: channelID, active: true });

    if (!countdownTimer) {
      return res.status(400).json({ error: true, message: 'No active countdown timer found' });
    }

    countdownTimer.time -= Number(body.time);

    if (countdownTimer.time < 0) {
      countdownTimer.time = 0;
    }

    await countdownTimer.save();

    cache.set(`${streamer.name}:countdown:timer`, JSON.stringify({ time: countdownTimer.time, paused: countdownTimer.paused }), { EX: 60 * 60 * 24 * 2 });

    io.of(`/countdowntimer/${streamer.name}`).emit('substract', { time: body.time });
    
    return res.status(200).json({ error: false, message: 'Time substracted' });
  });
  
  //? Server ?//
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

function sendTrigger(channel, triggerData) {
  io.of(`/overlays/triggers/${channel}`).emit('trigger', triggerData);
}

module.exports = {
  init,
  sendTrigger
}

function getVideoURL(thumbnailUrl) {
  let firstPart = `${thumbnailUrl.split('tv/')[0]}tv/`;

  let clipPart = thumbnailUrl.split('tv/')[1];

  let clipId = clipPart.split('-preview')[0];
  let extension = clipPart.split('.')[1]

  if (extension === 'jpg' || extension === 'png' || extension === 'jpeg') {
    extension = 'mp4';
  }

  let finalUrl = `${firstPart}${clipId}.${extension}`;

  return finalUrl;
}
