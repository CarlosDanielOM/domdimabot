require('dotenv').config();
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const express = require('express');
const socketio = require('socket.io');
const fs = require('fs');
const https = require('https');
const http = require('http');
const axios = require('axios');

const STREAMERS = require('../class/streamers.js');
const CLIENT = require('../util/client.js');

const { encrypt, decrypt } = require('../util/crypto');

const channelSchema = require('../schemas/channel.schema');
const commandSchema = require('../schemas/command')
const appConfigSchema = require('../schemas/app_config');
const eventsubSchema = require('../schemas/eventsub');
const { getTwitchHelixURL } = require('../util/links.js');
const { getNewAppToken, getAppToken } = require('../util/token.js');
const { getStreamerHeader } = require('../util/headers.js');

const CHANNEL = require('../functions/channel');

const eventsubHandler = require('../handlers/eventsub.js');
const { subscribeTwitchEventFollow, getEventsubs, SubscritpionsData, unsubscribeTwitchEvent, subscribeTwitchEvent } = require('../util/eventsub.js');

const downloadPath = `${__dirname}/routes/public/downloads/`;
const htmlPath = `${__dirname}/routes/public/`;

let reservedCommands = [
  {
    name: 'ruletarusa',
    cmd: 'ruletarusa',
    func: 'ruletarusa',
    type: 'reserved',
    description: 'Tiraras del gatillo y si tenia bala te mueres',
    cooldown: 10,
    canTimeout: false,
    canTimeoutMods: false,
    canGiveMod: false,
  },
  {
    name: 'annoucement',
    cmd: 'anuncio',
    func: 'anuncio',
    type: 'reserved',
    cooldown: 10,
    userLevelName: 'mod',
    userLevel: 6,
    description: 'Anuncia algo en el canal',
  },
  {
    name: 'promo',
    cmd: 'promo',
    func: 'promo',
    type: 'reserved',
    cooldown: 10,
    userLevelName: 'mod',
    userLevel: 6,
    description: 'Es otra forma de lanzar un shoutout pero sin activar el shoutout y la respuesta es por texto en vez de por anuncio para que los que esten en movil puedan ver el mensaje',
    showClip: true
  },
  {
    name: 'shoutout',
    cmd: 'so',
    func: 'shoutout',
    type: 'reserved',
    cooldown: 10,
    userLevelName: 'mod',
    userLevel: 6,
    description: 'Menciona a un usuario y si tienes activado lo de los clips mandara un clip al canal',
    showClip: true
  },
  {
    name: 'Create Prediction',
    cmd: 'predi',
    func: 'predi',
    type: 'reserved',
    cooldown: 10,
    userLevelName: 'mod',
    userLevel: 6,
    description: 'Crea una prediccion con la siguiente sintaxis: !predi <titulo>;<opcion1>/<opcion2>;<tiempo en segundos> | Ejemplo: !predi ¿Ganara el streamer?;Si/No;60 | El tiempo maximo es de 5 minutos y minimo de 30 segundos | El titulo no puede ser mayor a 100 caracteres | Las opciones no pueden ser mayor a 100 caracteres | Minimo 2 opciones y maximo 10 opciones y deben ser separadas por /',
  },
  {
    name: 'End Prediction',
    cmd: 'endpredi',
    func: 'endpredi',
    type: 'reserved',
    cooldown: 10,
    userLevelName: 'mod',
    userLevel: 6,
    description: 'Termina la prediccion actual y da el resultado ganador | Ejemplo: !endpredi <numero de opcion> | Ejemplo: !endpredi 1 | El numero de opcion debe ser el numero de la opcion ganadora',
  },
  {
    name: 'Cancel Prediction',
    cmd: 'cancelpredi',
    func: 'cancelpredi',
    type: 'reserved',
    cooldown: 10,
    userLevelName: 'mod',
    userLevel: 6,
    description: 'Cancela la prediccion actual | Ejemplo: !cancelpredi | No necesita argumentos | Solo funciona si la prediccion esta activa o si esta bloqueada',
  },
  {
    name: 'Lock Prediction',
    cmd: 'lockpredi',
    func: 'lockpredi',
    type: 'reserved',
    cooldown: 10,
    userLevelName: 'mod',
    userLevel: 6,
    description: 'Bloquea la prediccion actual lo cual inhabilita que los usuarios puedan votar | Ejemplo: !lockpredi | No necesita argumentos | Solo funciona si la prediccion esta activa',
  },
  {
    name: 'Create Poll',
    cmd: 'poll',
    func: 'poll',
    type: 'reserved',
    cooldown: 10,
    userLevelName: 'mod',
    userLevel: 6,
    description: 'Crea una encuesta con la siguiente sintaxis: !poll <titulo>;<opcion1>/<opcion2>;<tiempo en segundos> | Ejemplo: !poll ¿Ganara el streamer?;Si/No;60 | El tiempo maximo es de 5 minutos y minimo de 30 segundos | El titulo no puede ser mayor a 100 caracteres | Las opciones no pueden ser mayor a 100 caracteres | Minimo 2 opciones y maximo 5 opciones y deben ser separadas por /',
  },
  {
    name: 'End Poll',
    cmd: 'endpoll',
    func: 'endpoll',
    type: 'reserved',
    cooldown: 10,
    userLevelName: 'mod',
    userLevel: 6,
    description: 'Termina la encuesta actual | Ejemplo: !endpoll | No necesita argumentos | Solo funciona si la encuesta esta activa',
  },
  {
    name: 'Cancel Poll',
    cmd: 'cancelpoll',
    func: 'cancelpoll',
    type: 'reserved',
    cooldown: 10,
    userLevelName: 'mod',
    userLevel: 6,
    description: 'Cancela la encuesta actual | Ejemplo: !cancelpoll | No necesita argumentos | Solo funciona si la encuesta esta activa',
  },
  {
    name: 'Change Game',
    cmd: 'game',
    func: 'game',
    type: 'reserved',
    cooldown: 10,
    userLevelName: 'mod',
    userLevel: 6,
    description: `Cambia el juego actual | Ejemplo: !game <nombre del juego> | Ejemplo: !game Fortnite`,
  },
  {
    name: 'Change Title',
    cmd: 'title',
    func: 'title',
    type: 'reserved',
    cooldown: 10,
    userLevelName: 'mod',
    userLevel: 6,
    description: `Cambia el titulo actual | Ejemplo: !title <titulo> | Ejemplo: !title Hola como estas`,
  },
  {
    name: 'Speach Chat',
    cmd: 's',
    func: 'speach',
    type: 'reserved',
    cooldown: 0,
    enabled: false,
    description: `Habla en el chat | Ejemplo: !s <mensaje> | Ejemplo: !s Hola como estas`,
  },
  {
    name: 'Sumimetro',
    cmd: 'sumimetro',
    func: 'sumimetro',
    type: 'reserved',
    cooldown: 10,
    description: `Te da tu lectura de sumimetro que va desde 0% hasta 100% en cuanto a dominante o sumiso | Ejemplo: !sumimetro | Ejemplo de respuesta: (user) ha salido 65% sumiso y 35% dominante | Si se pasa un nombre de usuario como argumento te da la lectura de sumimetro de ese usuario | Ejemplo: !sumimetro (user) | Ejemplo de respuesta: (user) ha salido 65% sumiso y 35% dominante`,
  },
  {
    name: 'Memide',
    cmd: 'memide',
    func: 'memide',
    type: 'reserved',
    cooldown: 10,
    description: `Te da tu supuesta medida de tu imaginario miembro viril | Ejemplo: !memide | Ejemplo de respuesta: (user) le mide 15cm | No necesita argumentos`
  },
  {
    name: 'amor',
    cmd: 'amor',
    func: 'amor',
    type: 'reserved',
    cooldown: 10,
    description: `Te dice cuanto amor hay entre dos usuarios | Ejemplo: !amor (touser) | Ejemplo: !amor <nombre de usuario> | Ejemplo de respuesta: (user) y (touser) tienen 100% de amor | Si se pasan dos nombres de usuario como argumentos te dice cuanto amor hay entre esos dos usuarios | Ejemplo: !amor (user) (touser) | Ejemplo de respuesta: (user) y (touser) tienen 100% de amor | Si se pasa el mismo nombre de usuario que utilizo el comando como argumento le dira una frase negativa | Ejemplo: !amor (user) | Ejemplo de respuesta: (user) no se puede amar a si mismo | Si no se pasa ningun argumento se le dara un recordatorio de como se usa el comando y le dira algo negativo | Ejemplo: !amor | Ejemplo de respuesta: (user) debes pasar un nombre de usuario como argumento, por eso te quedaras solo`
  },
  {
    name: 'ponerla',
    cmd: 'ponerla',
    func: 'ponerla',
    type: 'reserved',
    cooldown: 10,
    description: `Te dice el porcentaje de posibilidades de que pongas la | Ejemplo: !ponerla | Ejemplo de respuesta: (user) tiene 100% de posibilidades de ponerla | No necesita argumentos`
  },
  {
    name: 'Me cabe',
    cmd: 'mecabe',
    func: 'mecabe',
    type: 'reserved',
    cooldown: 10,
    description: `Te dice que tan grande de un miembro viril te cabe mas un texto extra | Ejemplo: !mecabe | Ejemplo de respuesta: (user) te cabe 15cm | No necesita argumentos`
  },
  {
    name: 'Only Emotes',
    cmd: 'onlyemotes',
    func: 'onlyemotes',
    type: 'reserved',
    cooldown: 10,
    userLevelName: 'mod',
    userLevel: 6,
    description: `Activa o desactiva el modo solo emotes | Ejemplo: !onlyemotes | Ejemplo de respuesta: El modo solo emotes esta activado | No necesita argumentos`
  },
  {
    name: 'Create Custom Command',
    cmd: 'cc',
    func: 'createCommand',
    type: 'reserved',
    cooldown: 10,
    userLevelName: 'mod',
    userLevel: 6,
    description: `Crea un comando personalizado con la siguiente sintaxis: !cc <nombre del comando> <funcion del comando> | Ejemplo: !cc <nombre del comando> <respuesta que dara el comando> | Ejemplo: !cc discord Sigueme en mi discord: discord.cdom201.com | Ejemplo de uso: !discord | Ejemplo de respuesta: Sigueme en mi discord: discord.cdom201.com | El nombre del comando no puede tener espacios ni contener caracteres especiales y no puede ser mayor a 20 caracteres | La funcion del comando no puede ser mayor a 300 caracteres | se le puede pasar opciones de configuracion antes del nombre del comando | Ejemplo: !cc -cd=10 -ul=mod <nombre del comando> <funcion del comando> | Ejemplo: !cc -cd=10 -ul=mod discord Sigueme en mi discord: discord.cdom201.com | Las opciones de configuracion son: -cd=cooldown, -ul=userlevel, -enabled=enabled, -desc=description | Las opciones de configuracion son opcionales | Si no se pasa ninguna opcion de configuracion se usaran las opciones por defecto | Si se pasa una opcion de configuracion se usara esa opcion de configuracion | Si se pasan varias opciones de configuracion se usaran todas las opciones de configuracion que se pasaron`,
  },
  {
    name: 'Delete Custom Command',
    cmd: 'dc',
    func: 'deleteCommand',
    type: 'reserved',
    cooldown: 10,
    userLevelName: 'mod',
    userLevel: 6,
    description: `Elimina un comando personalizado | Ejemplo: !dc <nombre del comando> | Ejemplo: !dc discord | Ejemplo de respuesta: El comando !discord ha sido eliminado`,
  },
  {
    name: 'Edit Custom Command',
    cmd: 'ec',
    func: 'editCommand',
    type: 'reserved',
    cooldown: 10,
    userLevelName: 'mod',
    userLevel: 6,
    description: `Edita un comando personalizado con la siguiente sintaxis: !ec <nombre del comando> <funcion del comando> | Ejemplo: !ec <nombre del comando> <respuesta que dara el comando> | Ejemplo: !ec discord Sigueme en mi discord: discord.cdom201.com | Ejemplo de uso: !discord | Ejemplo de respuesta: Sigueme en mi discord: discord.cdom201.com | El nombre del comando no puede tener espacios ni contener caracteres especiales y no puede ser mayor a 20 caracteres | La funcion del comando no puede ser mayor a 300 caracteres | se le puede pasar opciones de configuracion antes del nombre del comando | Ejemplo: !ec -cd=10 -ul=mod <nombre del comando> <funcion del comando> | Ejemplo: !ec -cd=10 -ul=mod discord Sigueme en mi discord: discord.cdom201.com | Las opciones de configuracion son: -cd=cooldown, -ul=userlevel, -enabled=enabled, -desc=description | Las opciones de configuracion son opcionales | Si no se pasa ninguna opcion de configuracion se usaran las opciones por defecto | Si se pasa una opcion de configuracion se usara esa opcion de configuracion | Si se pasan varias opciones de configuracion se usaran todas las opciones de configuracion que se pasaron`,
  },
  {
    name: 'Follow Age',
    cmd: 'followage',
    func: 'followAge',
    type: 'reserved',
    cooldown: 10,
    description: `Te dice cuanto tiempo llevas siguiendo al canal | Ejemplo: !followage | Ejemplo de respuesta: (user) lleva siguiendo al canal 1 año, 2 meses y 3 dias | Si se pasa un nombre de usuario como argumento te dice cuanto tiempo lleva siguiendo al canal ese usuario | Ejemplo: !followage (user) | Ejemplo de respuesta: (user) lleva siguiendo al canal 1 año, 2 meses y 3 dias`
  },
  {
    name: 'Create clip',
    cmd: 'clip',
    func: 'createClip',
    type: 'reserved',
    cooldown: 10,
    enabled: false,
    description: `Crea un clip del streamer con una duracion de 30 segundos despues de usar el comando | Ejemplo: !clip | Ejemplo de respuesta: Guardando clip... | Si la funcion es exitosa la respuesta dira Clip guardado con exito | No necesita argumentos`
  }
]

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

  io.of(/^\/sumimetro\/\w+\/\w+$/).on('connection', (socket) => {
    const type = socket.nsp.name.split('/')[2];
    const channel = socket.nsp.name.split('/')[3];
    io.of(`/sumimetro/${type}/${channel}`).emit('active');
  });

  //* Routes *//
  const clipRoute = require('./routes/clip.route.js');

  let soSent = [];

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static(__dirname + "/routes/public"));
  // app.use("/", express.static(__dirname + "/routes/public"));
  // app.use(express.static('routes/public/assets'));

  //? DEV ROUTES ?//
  app.get('/dev/save/commands/:channel', async (req, res) => {
    let channel = req.params.channel;
    
  });

  //! Routes !//
  app.get('/eventsubs', async (req, res) => {
    let data = await getEventsubs();
    res.status(200).json(data);
  });

  //? CLIP ROUTES ?//

  app.get('/clip/:channel', (req, res) => {
    const channel = req.params.channel;
    res.status(200).sendFile(`${htmlPath}clip.html`);
  })

  app.post('/clip/:channel', async (req, res) => {
    const channel = req.params.channel;
    const { duration, thumbnail, title, game, streamer, profileImg, streamerColor, description } = req.body;
    const body = req.body;

    if (soSent.includes(channel)) {
      res.status(400).json({ message: `Clip already playing on ${channel} channel` });
      return false;
    }

    let clip = getVideoURL(thumbnail);

    let fileName = `${channel}-clip.mp4`;

    let path = `${downloadPath}${fileName}`;

    if (!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath, { recursive: true })
    }

    const response = await fetch(clip);
    if (!response.ok) {
      const err = new Error(`Error bla bla bla`)
      throw err
    }
    const file = fs.createWriteStream(path);
    const stream = response.body.pipe(file);

    await new Promise((resolve, reject) => {
      stream.on('finish', () => {
        io.of(`/clip/${channel}`).emit('play-clip', body);
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

    res.status(200).json({ message: `Playing clip on ${channel} channel`, status: 'success' });

  });

  //? VIDEO ROUTES ?//

  app.get('/video/:channel', (req, res) => {
    const { channel } = req.params;
    res.status(200).sendFile(`${__dirname}/routes/public/downloads/${channel}-clip.mp4`);
  });

  //? Just so I can show saved clips
  app.get('/video/:channel/:clip', (req, res) => {
    const { channel, clip } = req.params;
    res.status(200).sendFile(`${__dirname}/routes/public/downloads/${channel}-clip-${clip}.mp4`);
  });

  //? SPEACH ROUTES ?//

  app.get('/speach/:channel', (req, res) => {
    const channel = req.params.channel;
    res.status(200).sendFile(`${__dirname}/routes/public/speach.html`);
  });

  app.post('/speach/:channel', (req, res) => {
    const channel = req.params.channel;
    const speach = req.body.speach;
    const msgID = req.body.msgID;

    io.of(`/speach/${channel}`).emit('speach', { message: speach, id: msgID });

    res.status(200).json({ message: `Playing speach on ${channel} channel` });
  });


  //? AUTH ROUTES

  app.get('/auth', async (req, res) => {
    let token = req.query.code;
    let username = req.query.state;

    let updatedChannel;

    if (!token) {
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
        redirect_uri: 'https://domdimabot.com/login'
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

        updatedChannel = await channelSchema.findOneAndUpdate({ name: username }, { twitch_user_token: token, twitch_user_refresh_token: refreshToken, twitch_user_token_id: tokenID, actived: true });

        if (!updatedChannel) {
          res.status(400).send('There was an error updating your channel');
          return false;
        } else {
          await STREAMERS.updateStreamers();
          CLIENT.connectChannel(username);

          await CHANNEL.init(username);
          let addedMod = await CHANNEL.setModerator(username);

          if (addedMod.error) {
            console.log({ error: addedMod.reason, where: 'auth.js', line: 204 });
            return res.status(400).json({ error: true, message: `There was an error setting up your account and the bot in your channel` });
          }

          let eventData = SubscritpionsData;

          for (let event of eventData) {
            if (event.type === 'channel.raid') {
              event.condition.to_broadcaster_user_id = updatedChannel.twitch_user_id;
            } else {
              event.condition.broadcaster_user_id = updatedChannel.twitch_user_id;
            }
            let response = await subscribeTwitchEvent(username, event.type, event.version, event.condition);
          }

          res.status(200).sendFile(`${htmlPath}login.html`);

        }
      })
      .catch((err) => {
        console.log(err);
      });

  });

  //? LOGIN ROUTES ?//
  app.get('/login', (req, res) => {
    res.status(200).sendFile(`${htmlPath}login.html`);
  });

  app.post('/login', async (req, res) => {
    const { name, id, email, action } = req.body;

    let exists = await channelSchema.findOne({ twitch_user_id: id });

    if (exists) {
      res.status(200).json({
        message: 'User already exists',
        exists: true,
      });
      return false;
    } else {
      if (action === 'login') {
        let newChannel = new channelSchema({
          name,
          email,
          twitch_user_id: id,
        });

        await newChannel.save();

        res.status(200).json({
          message: 'User created',
          saved: true,
        });
      } else {
        res.status(200).json({
          message: 'User not found',
          exists: false,
        });
      }
    }

  });

  //? DASHBOARD ROUTES ?//

  app.get('/dashboard', async (req, res) => {
    res.status(200).sendFile(`${htmlPath}dashboard.html`);
  });

  //? BOT ROUTES ?//

  app.post('/bot/:action', async (req, res) => {
    const action = req.params.action;
    const { id } = req.body;

    let exists = await channelSchema.findOne({ twitch_user_id: id });

    if (exists) {
      if (action === 'join') {
        CLIENT.connectChannel(exists.name);
        exists.actived = true;
        await exists.save();
        res.status(200).json({ message: 'Joined channel' });
      } else if (action === 'leave') {
        CLIENT.disconnectChannel(exists.name);
        exists.actived = false;
        await exists.save();
        res.status(200).json({ message: 'Left channel' });
      } else {
        res.status(400).json({ message: 'Action not found' });
      }
      await STREAMERS.updateStreamers();
    } else {
      res.status(400).json({ message: 'User not found' });
      return false;
    }


  })

  //? SUMIMETRO ROUTES ?//
  app.get('/sumimetro/:type/:channel', async (req, res) => {
    res.sendFile(`${htmlPath}sumimetro.html`);
  });

  app.post('/sumimetro/:type/:channel', async (req, res) => {
    const { type, channel } = req.params;
    const { username, value } = req.body;

    io.of(`/sumimetro/${type}/${channel}`).emit('sumimetro', { username, value });
    res.status(204).send();
  });

  //? Server ?//
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = {
  init
}

function getVideoURL(thumbnailUrl) {
  let firstPart = `${thumbnailUrl.split('tv/')[0]}tv/`;

  let clipPart = thumbnailUrl.split('tv/')[1];

  let clipId = clipPart.split('-preview')[0];
  let extension = clipPart.split('.')[1]

  if (extension === 'jpg' || extension === 'png' || extension === 'jpeg') {
    extension = 'mp4';
  }

  let finalUrl = `${firstPart}${clipId}.${extension}`;

  return finalUrl;
}