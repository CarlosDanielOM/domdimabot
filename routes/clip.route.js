const express = require('express');
const app = express();
const socketio = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const io = socketio(server);
const router = express.Router();

app.get('/:channel', (req, res) => {
    const channel = req.params.channel;
    res.status(200).sendFile(`${__dirname}/routes/public/clip.html`);
  })
  
  app.post('/:channel', (req, res) => {
    const streamer = req.params.channel;
    const channel = req.body.channel;
    const clip = req.body.clip_url;
    const duration = req.body.duration;
  
    io.of(`/clip/${streamer}`).emit('play-clip', {clip, channel, duration});
  
    
    res.status(200).json({ message: `Playing clip on ${streamer} channel` });
    
  });
  
  io.of(`/clip/cdom201`).on('connection', (socket) => {
    console.log('A user connected to /clip/:channel route');
  
    socket.on('disconnect', () => {
      console.log('A user disconnected from /clip/:channel route');
    });
  });

module.exports = router;