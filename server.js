require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const fs = require('fs');
const https = require('https');
const moongoose = require('mongoose');

const downloadPath = `${__dirname}/routes/public/downloads/`;

let soSent = [];

//* Routes *//


const clipRoute = require('./routes/clip.route');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/clip/:channel', (req, res) => {
  const channel = req.params.channel;
  res.status(200).sendFile(`${__dirname}/routes/public/clip.html`);
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

const PORT = process.env.PORT || 3000;

moongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('Connected to MongoDB');
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch(err => console.error(err));

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

async function downloadVideo(url, fileName) {
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