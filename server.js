require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const socketio = require('socket.io');
const fs = require('fs');
const https = require('https');
const http = require('http');

const downloadPath = `${__dirname}/routes/public/downloads/`;
const htmlPath = `${__dirname}/routes/public/`;

function init() {
  const PORT = process.env.PORT || 3000;
    
    const app = express();
    const server = http.createServer(app);
    const io = socketio(server);

    io.on('connection', (streamer) => {
      io.of(`/clip/${streamer}`).emit('prepare-clip');
      console.log("Etst uwdjakldwal")
    });
    
    //* Routes *//
    const clipRoute = require('./routes/clip.route');

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

      let fileName = `${streamer}-clip-${clipNumber}.mp4`;

      let path = `${downloadPath}${fileName}`;
      let file = fs.createWriteStream(path);

      https.get(clip, (response) => {
          response.pipe(file);
      });

      file.on('finish', () => {
          file.close();
          io.of(`/clip/${streamer}`).emit('play-clip', {channel, duration, clipNumber});
          soSent.push(streamer);
          setTimeout(() => { 
            soSent = soSent.filter(so => so !== streamer);
          }, 1000 * Number(duration));
      });

      file.on('error', (err) => {
        console.error(err);
        return false;
      });

      res.status(200).json({ message: `Playing clip on ${streamer} channel` });
      
    });

    app.get('/video/:channel/:clipNumber', (req, res) => {
      const {channel, clipNumber} = req.params;
      res.status(200).sendFile(`${__dirname}/routes/public/downloads/${channel}-clip-${clipNumber}.mp4`);
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

    function downloadVideo(url, fileName) {
      let path = `${downloadPath}${fileName}`;
      let file = fs.createWriteStream(path);

      https.get(url, (response) => {
          response.pipe(file);
      });

      file.on('finish', () => {
          file.close();
          return true;
      });

      file.on('error', (err) => {
        console.error(err);
        return false;
      });
    }

    server.listen(PORT, () => {
      console.log(`Server running on port http://localhost:${PORT}`);
    });
}

module.exports = {
  init
}