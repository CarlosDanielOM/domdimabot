const bodyParser = require('body-parser');
const express = require('express');
const socketio = require('socket.io');
const http = require('http');

//const server = http.createServer(app);
//const io = new socketio.Server(server);

//* Routes *//


const clipRoute = require('./routes/clip.route');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/clips', clipRoute);
//app.use(express.json());

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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});