const express = require('express');
const router = express.Router();

router.get('/:channel', (req, res) => {
    const channel = req.params.channel;
    res.status(200).sendFile(`${__dirname}/public/clip.html`);
})

router.post('/:channel', (req, res) => {
    const channel = req.params.channel;
    const clip = req.body.clip_url;

    io.of(`/clip/cdom201`).emit('play_clip', { clip, channel });

    res.status(200).json({ message: `Playing clip on ${channel} channel` });

});

module.exports = router;