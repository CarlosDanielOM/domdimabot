require('dotenv').config();
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const express = require('express');
const socketio = require('socket.io');
const fs = require('fs');
const https = require('https');
const http = require('http');
const axios = require('axios');
const multer = require('multer');
const cors = require('cors');

const STREAMERS = require('../class/streamers.js');
const CLIENT = require('../util/client.js');

const { encrypt, decrypt } = require('../util/crypto');

const channelSchema = require('../schemas/channel.schema');
const commandSchema = require('../schemas/command');
const redemptionRewardSchema = require('../schemas/redemptionreward');
const triggerSchema = require('../schemas/trigger');
const triggerFileSchema = require('../schemas/triggerfile');
const appConfigSchema = require('../schemas/app_config');
const eventsubSchema = require('../schemas/eventsub');
const { getTwitchHelixURL } = require('../util/links.js');
const { getUrl } = require('../util/dev.js');
const { getNewAppToken, getAppToken } = require('../util/token.js');
const { getStreamerHeader } = require('../util/headers.js');

const CHANNEL = require('../functions/channel');

const eventsubHandler = require('../handlers/eventsub.js');
const { subscribeTwitchEventFollow, getEventsubs, SubscritpionsData, unsubscribeTwitchEvent, subscribeTwitchEvent } = require('../util/eventsub.js');

const downloadPath = `${__dirname}/routes/public/downloads/`;
const triggerUploadErrorPath = `${__dirname}/routes/public/uploads/triggers/error/`;
const htmlPath = `${__dirname}/routes/public/`;

const aceptableFileExtensions = ['mp4', 'mov', 'avi', 'flv', 'wmv', 'webm', 'mkv', 'gif', 'jpg', 'jpeg', 'png', 'bmp', 'tiff', 'svg', 'webp', 'mp3', 'flac', 'wav', 'ogg', 'aac', 'wma', 'm4a'];
const acceptableMimeTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/flv', 'video/wmv', 'video/webm', 'video/mkv', 'image/gif', 'image/jpg', 'image/jpeg', 'image/png', 'image/bmp', 'image/tiff', 'image/svg', 'image/webp', 'audio/mp3', 'audio/flac', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/wma', 'audio/m4a'];

const COMMANDSJSON = require('../config/reservedcommands.json');
const eventsub = require('../schemas/eventsub');

const COOLDOWN = require('../class/cooldown.js');
const cooldown = new COOLDOWN();

let io;

async function init() {
  const PORT = process.env.PORT || 3000;

  const app = express();
  const server = http.createServer(app);
  io = await socketio(server);

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

  io.of(/^\/overlays\/triggers\/\w+$/).on('connection', (socket) => {
    const channel = socket.nsp.name.split('/')[3];
    io.of(`/overlay/triggers/${channel}`).emit('prepareTriggers');
  });

  io.of(/^\/overlays\/ariascarletvt\/furry/).on('connection', (socket) => {
    const channel = socket.nsp.name.split('/')[3];
    io.of(`/overlays/${channel}/furry`).emit('active');
  });

  //* Routes *//
  const clipRoute = require('./routes/clip.route.js');

  let soSent = [];

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static(__dirname + "/routes/public"));
  app.use(cors());

  //? DEV ROUTES ?//

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

          await CHANNEL.init(username);
          let addedMod = await CHANNEL.setModerator(username);

          if (addedMod.error) {
            console.log({ error: addedMod.reason, where: 'auth.js', for: username });
            if (addedMod.reason == 'user is already a mod') { }
            else {
              return res.status(400).json({ error: true, message: `There was an error setting up your account and the bot in your channel` });
            }
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

          let commandsJSON = COMMANDSJSON.commands;

          for (let command in commandsJSON) {
            let commandExists = await commandSchema.exists({ name: commandsJSON[command].name, channel: updatedChannel.name, channelID: updatedChannel.twitch_user_id });

            if (commandExists) {
              console.log(`Command ${commandsJSON[command].name} already exists for ${updatedChannel.name}`)
              continue;
            };

            let newCommand = new commandSchema({
              name: commandsJSON[command].name,
              cmd: commandsJSON[command].cmd,
              func: commandsJSON[command].func,
              type: commandsJSON[command].type,
              channel: updatedChannel.name,
              channelID: updatedChannel.twitch_user_id,
              cooldown: commandsJSON[command].cooldown,
              enabled: commandsJSON[command].enabled,
              userLevel: commandsJSON[command].userLevel,
              userLevelName: commandsJSON[command].userLevelName,
              reserved: commandsJSON[command].reserved,
            });

            await newCommand.save();
          }

          CLIENT.connectChannel(username);

          res.status(200).sendFile(`${htmlPath}login.html`);

        }
      })
      .catch((err) => {
        console.log(err);
      });

  });

  app.post('/premium', async (req, res) => {
    let { channel, channelID } = req.body;

    let exists = await channelSchema.find({ name: channel, twitch_user_id: channelID }, 'premium premium_plus');

    if (!exists) {
      res.status(400).json({ error: true, reason: 'Channel not found' });
      return false;
    }

    console.log({ exists })

    if (exists.premium) {
      return res.status(200).json({ error: false, message: 'Channel is premium', premium: 'premium' });
    } else if (exists.premium_plus) {
      return res.status(200).json({ error: false, message: 'Channel is premium plus', premium: 'premium_plus' });
    } else {
      return res.status(200).json({ error: false, message: 'Channel is not premium', premium: 'none' });
    }
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

  //? Trigger ROUTES ?//

  app.get('/overlays/triggers/:channel', async (req, res) => {
    res.sendFile(`${htmlPath}trigger.html`);
  });

  app.get('/trigger/manage/:channel', async (req, res) => {
    let channel = req.params.channel;
    res.sendFile(`${htmlPath}managetriggers.html`);
  });

  app.post('/trigger/upload/:channel', async (req, res) => {
    try {
      const { channel } = req.params;
      if (!fs.existsSync(`${__dirname}/routes/public/uploads/triggers/${channel}`)) {
        fs.mkdirSync(`${__dirname}/routes/public/uploads/triggers/${channel}`, { recursive: true });
      }
      const storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, `${__dirname}/routes/public/uploads/triggers/${channel}`)
        },
        filename: function (req, file, cb) {
          cb(null, `${req.body.triggerName}.${file.mimetype.split('/')[1]}`);
        }
      });
      multer({
        storage: storage, fileFilter: async (req, file, cb) => {
          if (acceptableMimeTypes.includes(file.mimetype)) {
            if (await triggerFileSchema.exists({ name: req.body.triggerName, fileType: file.mimetype })) {
              cb(null, false);
            } else {
              cb(null, true);
            }
          } else {
            cb(null, false);
          }
        }
      }).single('trigger')(req, res, async (err) => {
        if (err) {
          console.log(err);
          res.status(400).json({ message: 'Error uploading file', error: true });
          return false;
        }

        if (!req.file) return res.status(400).json({ message: 'File type not supported or file with same name already exists', error: true });

        if (req.file.size > 5000000) {
          fs.rm(`${__dirname}/routes/public/uploads/triggers/${channel}/${req.file.filename}`, { recursive: false, force: true, maxRetries: 5 }, (err) => {
            if (err) console.log({ err, where: 'server.js', for: 'trigger upload' });
            return res.status(400).json({ message: 'File size should not exceed 5MB', error: true });
          });
        }

        let exists = await triggerFileSchema.exists({ name: req.body.triggerName, fileType: req.file.mimetype });

        if (exists) return res.status(400).json({ message: 'File with that name already exists', error: true });

        const streamer = await STREAMERS.getStreamer(channel);

        let fileNameUrlEncoded = encodeURIComponent(req.file.filename);
        let fileData = {
          name: req.body.triggerName,
          fileName: req.file.filename,
          fileSize: req.file.size,
          fileType: req.file.mimetype,
          fileUrl: `https://domdimabot.com/media/${channel}/${fileNameUrlEncoded}`,
          channel: channel,
          channelID: streamer.user_id,
        }

        let newFile = await new triggerFileSchema(fileData).save();

        return res.status(200).json({ message: 'File uploaded', file: newFile, error: false });
      });
    } catch (error) {
      console.log({ error, where: 'server.js', for: 'trigger upload' });
    }
  });

  app.get('/media/:channel/:trigger', async (req, res) => {
    const { channel, trigger } = req.params;
    if (!fs.existsSync(`${__dirname}/routes/public/uploads/triggers/${channel}/${trigger}`)) return res.status(404).json({ message: 'File not found', error: true });
    res.sendFile(`${__dirname}/routes/public/uploads/triggers/${channel}/${trigger}`);
  });

  app.post('/trigger/create/:channel', async (req, res) => {
    const { channel } = req.params;
    const { name, file, type, mediaType, cost, prompt, fileID, cooldown, volume } = req.body;

    const streamer = await STREAMERS.getStreamer(channel);

    let exists = await triggerFileSchema.exists({ name: file, fileType: mediaType });

    if (!exists) return res.status(400).json({ message: 'File not found', error: true });

    let requestBody = {
      title: name,
      cost,
      skipQueue: true,
      prompt
    }

    if (cooldown > 0) {
      requestBody.is_global_cooldown_enabled = true;
      requestBody.global_cooldown_seconds = cooldown;
    }

    if (prompt == null) delete requestBody.prompt;


    let rewardResponse = await fetch(`${getUrl()}/${channel}/create/reward`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    let rewardData = await rewardResponse.json();

    if (rewardData.error) return res.status(rewardData.status).json(rewardData);

    rewardData = rewardData.rewardData;

    let newTrigger = new triggerSchema({
      name: name,
      channel: channel,
      channelID: streamer.user_id,
      rewardID: rewardData.rewardID,
      file,
      fileID,
      type,
      mediaType,
      cost,
      cooldown,
      volume
    });

    await newTrigger.save();

    res.status(200).json({ message: 'Trigger created', error: false, trigger: newTrigger });
  });

  app.patch('/trigger/:channel/:id', async (req, res) => {
    const { channel, id } = req.params;
    const { name, cost, prompt, cooldown, volume } = req.body;

    let trigger = await triggerSchema.findOne({ channel, _id: id });

    if (!trigger) return res.status(404).json({ message: 'Trigger not found', error: true });

    let requestBody = {
      title: name,
      cost,
      prompt
    }

    if (cooldown > 0) {
      requestBody.is_global_cooldown_enabled = true;
      requestBody.global_cooldown_seconds = cooldown;
    } else {
      requestBody.is_global_cooldown_enabled = false;
      requestBody.global_cooldown_seconds = 0;
    }

    if (prompt == null) delete requestBody.prompt;

    let rewardResponse = await fetch(`${getUrl()}/rewards/${channel}/${trigger.rewardID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    let rewardData = await rewardResponse.json();

    if (rewardData.error) return res.status(rewardData.status).json(rewardData);

    rewardData = rewardData.rewardData;

    let updateResult = await triggerSchema.findByIdAndUpdate(id, { name, cost, prompt, cooldown, volume });
    if (!updateResult) return res.status(400).json({ message: 'Error updating trigger', error: true });

    res.status(200).json({ message: 'Trigger updated', error: false, trigger });
  });

  app.delete('/trigger/delete/:channel/:id', async (req, res) => {
    const { channel, id } = req.params;

    let trigger = await triggerSchema.findOne({ channel, _id: id });

    if (!trigger) return res.status(404).json({ message: 'Trigger not found', error: true });

    let response = await fetch(`${getUrl()}/${channel}/delete/reward/${trigger.rewardID}`, {
      method: 'DELETE'
    });

    if (response.status !== 200) return res.status(response.status).json({ message: 'Error deleting reward', error: true });

    await trigger.deleteOne({ id: trigger.id });

    res.status(200).json({ message: 'Trigger deleted', error: false });
  });

  app.get('/points/:channel', async (req, res) => {
    let ch = req.params.channel;
    let streamer = await STREAMERS.getStreamer(ch);
    let response = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${streamer.user_id}`, {
      method: 'GET',
      headers: {
        'Client-ID': process.env.CLIENT_ID,
        'Authorization': `Bearer ${decrypt(streamer.token)}`
      }
    })

    let data = await response.json();

    res.status(200).json(data);

  });

  app.get('/triggers/:channel', async (req, res) => {
    const { channel } = req.params;

    let triggers = await triggerSchema.find({ channel: channel }, '_id name file type mediaType date cost cooldown volume');

    res.status(200).json({ triggers });

  });

  app.get('/trigger/files/:channel', async (req, res) => {
    const { channel } = req.params;

    let files = await triggerFileSchema.find({ channel: channel }, '_id name fileName fileType fileSize fileUrl');

    res.status(200).json({ files });

  });

  app.delete('/trigger/files/:channel/:id', async (req, res) => {
    const { channel, id } = req.params;

    let exists = await triggerSchema.exists({ fileID: id });

    if (exists) return res.status(400).json({ message: 'File is being used in a trigger', error: true });

    let file = await triggerFileSchema.findOne({ channel, _id: id });

    if (!file) return res.status(404).json({ message: 'File not found', error: true });

    fs.rm(`${__dirname}/routes/public/uploads/triggers/${channel}/${file.fileName}`, { recursive: false, force: true, maxRetries: 5 }, async (err) => {
      if (err) {
        console.log(err);
        return res.status(400).json({ message: 'Error deleting file', error: true });
      }

      await triggerFileSchema.deleteOne({ _id: id });

      return res.status(200).json({ message: 'File deleted', error: false });
    });

  });

  //? REDEMPTION ROUTES ?//
  app.post('/:channel/create/reward', async (req, res) => {
    const { channel } = req.params;
    const { title, cost, skipQueue } = req.body;

    const prompt = req.body.prompt || '';
    const priceIncrease = req.body.priceIncrease || 0;
    const rewardMessage = req.body.rewardMessage || '';
    const returnToOriginalCost = req.body.returnToOriginalCost || false;

    if (title.length > 45) return res.status(400).json({ message: 'Title too long', error: true });

    let streamer = await STREAMERS.getStreamer(channel);

    let body = req.body;
    body.prompt = prompt;

    let response = await fetch(`${getTwitchHelixURL()}/channel_points/custom_rewards?broadcaster_id=${streamer.user_id}`, {
      method: 'POST',
      headers: {
        'Client-ID': process.env.CLIENT_ID,
        'Authorization': `Bearer ${decrypt(streamer.token)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    let data = await response.json();

    if (data.error) return res.status(data.status).json(data);

    let newReward = data.data[0];

    const eventData = await subscribeTwitchEvent(channel, 'channel.channel_points_custom_reward_redemption.add', '1', { broadcaster_user_id: streamer.user_id, reward_id: newReward.id });

    let rewardData = {
      eventsubID: eventData.id,
      channelID: streamer.user_id,
      channel: channel,
      rewardID: newReward.id,
      rewardTitle: newReward.title,
      rewardPrompt: newReward.prompt,
      rewardOriginalCost: newReward.cost,
      rewardCost: newReward.cost,
      rewardIsEnabled: newReward.is_enabled,
      rewardCostChange: priceIncrease,
      rewardMessage,
      returnToOriginalCost: returnToOriginalCost
    }

    await new redemptionRewardSchema(rewardData).save();

    res.status(200).json({ data, rewardData, error: false });
  });

  app.delete('/:channel/delete/reward/:id', async (req, res) => {
    const { channel, id } = req.params;

    let reward = await redemptionRewardSchema.findOne({ channel: channel, rewardID: id });

    if (!reward) return res.status(404).json({ message: 'Reward not found', error: true });

    let streamer = await STREAMERS.getStreamer(channel);

    let response = await fetch(`${getTwitchHelixURL()}/channel_points/custom_rewards?broadcaster_id=${streamer.user_id}&id=${id}`, {
      method: 'DELETE',
      headers: {
        'Client-ID': process.env.CLIENT_ID,
        'Authorization': `Bearer ${decrypt(streamer.token)}`,
      }
    });

    if (response.error) return res.status(response.status).json(response);

    if (response.status !== 204) return res.status(response.status).json({ message: 'Error deleting reward', error: true });

    await unsubscribeTwitchEvent(reward.eventsubID);

    await reward.deleteOne({ id: reward.id });

    res.status(200).json({ message: 'Reward deleted', error: false });
  });

  app.patch('/rewards/:channel/:id', async (req, res) => {
    const { channel, id } = req.params;
    const body = req.body;

    if (body.title.length > 45) return res.status(400).json({ message: 'Title too long', error: true });

    if (!body.prompt) {
      body.prompt = '';
    }

    let reward = await redemptionRewardSchema.findOne({ channel: channel, rewardID: id });

    if (!reward) return res.status(404).json({ message: 'Reward not found', error: true });

    const streamer = await STREAMERS.getStreamer(channel);

    let updateResponse = await fetch(`${getTwitchHelixURL()}/channel_points/custom_rewards?broadcaster_id=${streamer.user_id}&id=${id}`, {
      method: 'PATCH',
      headers: {
        'Client-ID': process.env.CLIENT_ID,
        'Authorization': `Bearer ${decrypt(streamer.token)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    let data = await updateResponse.json();

    if (data.error) return res.status(data.status).json(data);

    let updateResult = await redemptionRewardSchema.findByIdAndUpdate(reward._id, { rewardTitle: body.title, rewardPrompt: body.prompt, rewardCost: body.cost });

    if (!updateResult) return res.status(400).json({ message: 'Error updating reward', error: true });

    res.status(200).json({ data, error: false });

  });

  app.get('/logout', async (req, res) => {
    res.status(200).sendFile(`${htmlPath}logout.html`);
  });

  //? OVERLAY ROUTES ?//

  app.get('/overlays/:channel/furry', async (req, res) => {
    res.sendFile(`${htmlPath}furry.html`);
  });

  app.post('/overlays/:channel/furry', async (req, res) => {
    const { channel } = req.params;
    const { username, value } = req.body;

    io.of(`/overlays/${channel}/furry`).emit('furry', { username, value });
    res.status(204).send();
  });

  //? Server ?//
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

function sendTrigger(channel, triggerData) {
  io.of(`/overlays/triggers/${channel}`).emit('trigger', triggerData);
}

module.exports = {
  init,
  sendTrigger
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