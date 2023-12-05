const express = require('express');
const app = express();
const socketio = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const io = socketio(server);
const router = express.Router();

router.get('/speach/:channel', (req, res) => {
    const channel = req.params.channel;
    res.status(200).sendFile(`${__dirname}/routes/public/speach.html`);
});
  
router.post('/speach/:channel', (req, res) => {
const channel = req.params.channel;
const speach = req.body.speach;

io.of(`/speach/${channel}`).emit('speach', {message: speach});

res.status(200).json({ message: `Playing speach on ${channel} channel` });
});

module.exports = router;