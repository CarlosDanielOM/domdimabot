require('dotenv').config();
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const express = require('express');
const socketio = require('socket.io');
const fs = require('fs');
const https = require('https');
const http = require('http');
const axios = require('axios');

const streamerNames = require('../util/streamerNames.js');
const CLIENT = require('../util/client.js');

const { encrypt, decrypt } = require('../util/crypto');

const channelSchema = require('../schemas/channel.schema');

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

    //* Routes *//
    const clipRoute = require('./routes/clip.route.js');

    let soSent = [];
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static('public'));

    app.get('/clip/:channel', (req, res) => {
      const channel = req.params.channel;
      res.status(200).sendFile(`${htmlPath}clip.html`);
    })

    app.post('/clip/:channel', async (req, res) => {
      const streamer = req.params.channel;
      const channel = req.body.channel;
      //const clip = req.body.clip_url;
      const thumbnail = req.body.thumbnail;
      const duration = req.body.duration;
      const clipNumber = Math.floor(Math.random() * 100);

      if(soSent.includes(streamer)) {
        res.status(400).json({ message: `Clip already playing on ${streamer} channel` });
        return false;
      }

      let clip = getVideoURL(thumbnail);

      let fileName = `${streamer}-clip.mp4`;

      let path = `${downloadPath}${fileName}`;

      if(!fs.existsSync(downloadPath)){
        fs.mkdirSync(downloadPath, {recursive: true})
      }

      const response = await fetch(clip);
      if(!response.ok){
        const err = new Error(`Error bla bla bla`)
        throw err
      }
      const file = fs.createWriteStream(path);
      const stream = response.body.pipe(file);
      await new Promise((resolve, reject) => {
        stream.on('finish', () => {
          io.of(`/clip/${streamer}`).emit('play-clip', {channel, duration});
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

      res.status(200).json({ message: `Playing clip on ${streamer} channel` });
      
    });

    app.get('/video/:channel', (req, res) => {
      const {channel} = req.params;
      res.status(200).sendFile(`${__dirname}/routes/public/downloads/${channel}-clip.mp4`);
    });

    //? Just so I can show saved clips
    app.get('/video/:channel/:clip', (req, res) => {
      const {channel, clip} = req.params;
      res.status(200).sendFile(`${__dirname}/routes/public/downloads/${channel}-clip-${clip}.mp4`);
    });

    app.get('/speach/:channel', (req, res) => {
      const channel = req.params.channel;
      res.status(200).sendFile(`${__dirname}/routes/public/speach.html`);
    });

    app.post('/speach/:channel', (req, res) => {
    const channel = req.params.channel;
    const speach = req.body.speach;

    io.of(`/speach/${channel}`).emit('speach', {message: speach});

    res.status(200).json({ message: `Playing speach on ${channel} channel` });
    });

app.use('/clips', clipRoute);

    function getVideoURL(thumbnailUrl) {
      let firstPart = `${thumbnailUrl.split('tv/')[0]}tv/`;

      let clipPart = thumbnailUrl.split('tv/')[1];

      let clipId = clipPart.split('-preview')[0];
      let extension = clipPart.split('.')[1]

      if(extension === 'jpg' || extension === 'png' || extension === 'jpeg') {
          extension = 'mp4';
      }

      let finalUrl = `${firstPart}${clipId}.${extension}`;

      return finalUrl;
    }

    //? AUTH ROUTES
    app.get('/auth', async (req, res) => {
      let token = req.query.code;
      let username = req.query.state;

      let updatedChannel;
      
      if(!token) {
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
          redirect_uri: 'https://domdimabot.com/auth'
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

        updatedChannel = await channelSchema.findOneAndUpdate({name: username}, {twitch_user_token: token, twitch_user_refresh_token: refreshToken, twitch_user_token_id: tokenID, actived: true});

        if(!updatedChannel) {
          res.status(400).send('There was an error updating your channel');
          return false;
        }

        await CLIENT.connectChannel(username);
        await streamerNames.updateNames();
        res.status(200).send('Your channel was updated successfully');

      })
      .catch((err) => {
        console.log(err);
      });
      
    });

    app.get('/login', (req, res) => {
      res.status(200).sendFile(`${htmlPath}login.html`);
    });
    

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
}

module.exports = {
  init
}