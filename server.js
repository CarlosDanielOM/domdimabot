require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const fs = require('fs');
const https = require('https');
const moongoose = require('mongoose');

const downloadPath = `${__dirname}/routes/public/downloads/`;

const SumimetroSchema = require('./schemas/sumimetro.schema');
const SupremoSchema = require('./schemas/sumimetro_supremo.schema');

//* Routes *//


const clipRoute = require('./routes/clip.route');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/sumimetro/:channel/:username', async (req, res) => {
  let { channel, username } = req.params;
  let dominant = Math.floor(Math.random() * 100) + 1;
  let submissive = 100 - dominant;


  let submissiveCheck = undefined;

  let sumisos = await SupremoSchema.find({ channel, type: 'sumiso' }, 'username timestamp').exec();

  console.table(sumisos);
  
  let sumisoSupremo = {
    user: '',
    percent: 0,
  }

  if(sumisoSupremo.percent < submissive) {
    sumisoSupremo.user = username;
    sumisoSupremo.percent = submissive;

    let sumiSupremo = new SupremoSchema({
      channel,
      username,
      type: 'sumiso',
      percent: submissive,
      timestamp: Date.now()
    });
    
    sumiSupremo.save()
    .then(sumiSupremo => {

      io.of(`/sumiso/${channel}`).emit('sumiso_supremo', { username, submissive });
      
    })
    .catch(err => {
      console.error(err);
    });
    
  }
  
  let sumimetro = new SumimetroSchema({
    channel,
    username,
    dominant,
    submissive,
    timestamp: Date.now()
  });

  sumimetro.save()
  .then(sumimetro => {
    res.status(200).send(`Los lectores del sumímetro reflejan que ${username} tiene ${submissive}% de sumiso y ${dominant}% de dominante.`)
  })
  .catch(err => {
    res.status(400).send(`Error: ${err}`);
  });
  
  });

app.get('/sumiso/:channel', (req, res) => {
  res.status(200).sendFile(`${__dirname}/routes/public/sumiso.html`);
});

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

  let clip = getVideoURL(thumbnail);

  let fileName = `${streamer}-clip.mp4`;

  let path = `${downloadPath}${fileName}`;
  let file = fs.createWriteStream(path);

  https.get(clip, (response) => {
      response.pipe(file);
  });

  file.on('finish', () => {
      file.close();
      io.of(`/clip/${streamer}`).emit('play-clip', {channel, duration});
  });

  file.on('error', (err) => {
    console.error(err);
    return false;
  });

  res.status(200).json({ message: `Playing clip on ${streamer} channel` });
  
});

app.get('/video/:channel', (req, res) => {
  const channel = req.params.channel;
  res.status(200).sendFile(`${__dirname}/routes/public/downloads/${channel}-clip.mp4`);
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
//app.use(express.json());



//* Sumimetro *//

let sumisoSupremo = []
let dominanteSupremo = []

let sumiso = {
  user: '',
  percent: 0,
  channel: '',
}
let dominante = {
  user: '',
  percent: 0,
  channel: '',
}

app.get('/sumimetro/:channel', (req, res) => {});

app.post('/sumimetro/:channel', (req, res) => {
  const channel = req.params.channel;
  const username = req.body.username;

  let dominante = Math.floor(Math.random() * 100) + 1;
  let sumiso = 100 - dominante;

  if(dominante > sumiso) {}

  res.status(200).json({ message: `Sumimetro on ${channel} channel`, dominante, sumiso, username  });
  
});







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