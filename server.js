require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const moongoose = require('mongoose');

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

app.get('/clip/:channel', (req, res) => {
  const channel = req.params.channel;
  res.status(200).sendFile(`${__dirname}/public/clip.html`);
})

app.post('/clip/:channel', (req, res) => {
  const streamer = req.params.channel;
  const channel = req.body.channel;
  const clip = req.body.clip_url;
  const duration = req.body.duration;

  io.of(`/clip/${streamer}`).emit('play-clip', {clip, channel, duration});

  res.status(200).json({ message: `Playing clip on ${streamer} channel` });
  
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
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});