require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const {getSpotifyURL} = require('../util/links')

const db = require('./db');

const STREAMERS = require('../class/streamers');
const accountSchema = require('../schemas/accounts');

const authRoutes = require('./routes/spotify/auth.routes')
const songRoutes = require('./routes/spotify/song.routes')
const userRoutes = require('./routes/spotify/user.routes')

async function init() {
    await db.init();
    await STREAMERS.init();
    const app = express();

    app.use(bodyParser.json());

    app.get('/login', (req, res) => {
        const scopes = 'user-read-email user-read-playback-state user-modify-playback-state user-read-currently-playing';
        let state = req.query.user_id;
        let redirect_uri = 'https://spotify.domdimabot.com/auth';
        let clientID = process.env.SPOTIFY_CLIENT_ID;

        res.redirect(`https://accounts.spotify.com/authorize?response_type=code&client_id=${clientID}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state}`)
    })

    //? AUTH ROUTES
    app.use('/auth', authRoutes);

    //? SONG ROUTES
    app.use('/song', songRoutes);
    
    //? USER ROUTES
    app.use('/user', userRoutes)
    
    app.listen(3434, _ => {
        console.log('Server running on port 3434');
    })
    setInterval(async () => {
        let accounts = await accountSchema.find({user_type: 'spotify'});
        accounts.forEach(async account => {
            let userID = account.user_id;

            let response = await fetch('https://spotify.domdimabot.com/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({user_id: userID})
            });
            
            let data = await response.json();

            if(data.error) {
                console.log(data.message);
                return;
            }
        });
    }, 3000);
}


init();