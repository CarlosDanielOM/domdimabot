require('dotenv').config();
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const express = require('express');
const socketio = require('socket.io');
const fs = require('fs');
const https = require('https');
const http = require('http');
const axios = require('axios');

const STREAMERS = require('../class/streamers.js');
const CLIENT = require('../util/client.js');

const { encrypt, decrypt } = require('../util/crypto');

const channelSchema = require('../schemas/channel.schema');
const appConfigSchema = require('../schemas/app_config');
const eventsubSchema = require('../schemas/eventsub');
const { getTwitchHelixURL } = require('../util/links.js');
const { getNewAppToken, getAppToken } = require('../util/token.js');
const { getStreamerHeader } = require('../util/headers.js');

const eventsubHandler = require('../handlers/eventsub.js');
const { subscribeTwitchEventFollow, getEventsubs, SubscritpionsData, unsubscribeTwitchEvent, subscribeTwitchEvent } = require('../util/eventsub.js');

const downloadPath = `${__dirname}/routes/public/downloads/`;
const htmlPath = `${__dirname}/routes/public/`;

async function init() {
  const PORT = process.env.PORT || 3000;

  const app = express();
  const server = http.createServer(app);
  const io = await socketio(server);

  io.of(/^\/clip\/\w+$/).on('connection', (socket) => {
    const channel = socket.nsp.name.split('/')[2];
    io.of(`/clip/${channel}`).emit('prepare-clips');
  });

  io.of(/^\/speach\/\w+$/).on('connection', (socket) => {
    const channel = socket.nsp.name.split('/')[2];
    io.of(`/clip/${channel}`).emit('prepare-speach');
  });

  io.of(/^\/sumimetro\/\w+\/\w+$/).on('connection', (socket) => {
    const type = socket.nsp.name.split('/')[2];
    const channel = socket.nsp.name.split('/')[3];
    io.of(`/sumimetro/${type}/${channel}`).emit('active');
  });

  //* Routes *//
  const clipRoute = require('./routes/clip.route.js');

  let soSent = [];

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static(__dirname + "/routes/public"));
  // app.use("/", express.static(__dirname + "/routes/public"));
  // app.use(express.static('routes/public/assets'));

  //! Routes !//

  app.get('/test/:channel', (req, res) => {
    let channel = req.params.channel;
    subscribeTwitchEventFollow(channel);
    res.status(200).send('Hello World!');
  });

  app.get('/eventsubs', async (req, res) => {
    let data = await getEventsubs();
    res.status(200).json(data);
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

  //? Just so I can show saved clips
  app.get('/video/:channel/:clip', (req, res) => {
    const { channel, clip } = req.params;
    res.status(200).sendFile(`${__dirname}/routes/public/downloads/${channel}-clip-${clip}.mp4`);
  });

  //? SPEACH ROUTES ?//

  app.get('/speach/:channel', (req, res) => {
    const channel = req.params.channel;
    res.status(200).sendFile(`${__dirname}/routes/public/speach.html`);
  });

  app.post('/speach/:channel', (req, res) => {
    const channel = req.params.channel;
    const speach = req.body.speach;

    io.of(`/speach/${channel}`).emit('speach', { message: speach });

    res.status(200).json({ message: `Playing speach on ${channel} channel` });
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
          CLIENT.connectChannel(username);

          let eventData = SubscritpionsData;

          for (let event of eventData) {
            if (event.type === 'channel.raid') {
              event.condition.to_broadcaster_user_id = updatedChannel.twitch_user_id;
            } else {
              event.condition.broadcaster_user_id = updatedChannel.twitch_user_id;
            }
            let response = await subscribeTwitchEvent(username, event.type, event.version, event.condition);
          }

        }
      })
      .catch((err) => {
        console.log(err);
      });

  });

  //? LOGIN ROUTES ?//
  app.get('/login', (req, res) => {
    res.status(200).sendFile(`${htmlPath}login.html`);
  });

  app.post('/login', async (req, res) => {
    const { name, id, email, action } = req.body;

    let exists = await channelSchema.findOne({ twitch_user_id: id });

    if (exists) {
      res.status(200).json({
        message: 'User already exists',
        exists: true,
      });
      return false;
    } else {
      if (action === 'login') {
        let newChannel = new channelSchema({
          name,
          email,
          type: 'twitch',
          premium: false,
          premium_until: null,
          actived: false,
          twitch_user_id: id,
        });

        await newChannel.save();

        res.status(200).json({
          message: 'User created',
          saved: true,
        });
      } else {
        res.status(200).json({
          message: 'User not found',
          exists: false,
        });
      }
    }

  });

  //? DASHBOARD ROUTES ?//

  app.get('/dashboard', async (req, res) => {
    res.status(200).sendFile(`${htmlPath}dashboard.html`);
  });

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
        res.status(200).json({ message: 'Joined channel' });
      } else if (action === 'leave') {
        CLIENT.disconnectChannel(exists.name);
        exists.actived = false;
        await exists.save();
        res.status(200).json({ message: 'Left channel' });
      } else {
        res.status(400).json({ message: 'Action not found' });
      }
      await STREAMERS.updateStreamers();
    } else {
      res.status(400).json({ message: 'User not found' });
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

  //? Server ?//
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = {
  init
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