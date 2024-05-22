const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');

const STREAMERS = require('../../class/streamers')

const triggerSchema = require('../../schemas/trigger')
const triggerFileSchema = require('../../schemas/triggerfile');

const {getTwitchHelixURL} = require('../../util/links')
const {getUrl} = require('../../util/dev');

const acceptableMimeTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/flv', 'video/wmv', 'video/webm', 'video/mkv', 'image/gif', 'image/jpg', 'image/jpeg', 'image/png', 'image/bmp', 'image/tiff', 'image/svg', 'image/webp', 'audio/mp3', 'audio/flac', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/wma', 'audio/m4a'];

router.get('/:channelID', async (req, res) => {
    const { channelID } = req.params;

    let triggers = await triggerSchema.find({ channelID: channelID }, '_id name file type mediaType date cost cooldown volume');

    if (!triggers) return res.status(404).json({ error: true, message: 'Trigger not found' });

    res.status(200).json({ error: false, triggers });
});

router.get('/single/:triggerID', async (req, res) => {
    const { triggerID } = req.params;

    let trigger = await triggerSchema.findOne({ _id: triggerID }, '_id name file type mediaType date cost cooldown volume');

    if (!trigger) return res.status(404).json({ error: true, message: 'Trigger not found' });

    res.status(200).json({ error: false, trigger });
});

router.post('/upload/:channelID', async (req, res) => {
    const { channelID } = req.params;
    const streamer = await STREAMERS.getStreamerById(channelID);

    if(!streamer) return res.status(404).json({ error: true, message: 'Streamer not found' });

    let MB = 5;
    if(streamer.premium_plus) MB = 20;
    if(streamer.premium) MB = 10;
    
    const MAX_FILE_SIZE = MB * 1024 * 1024;

    if(!fs.existsSync(`${__dirname}/public/uploads/triggers/${streamer.name}`)) {
        fs.mkdirSync(`${__dirname}/public/uploads/triggers/${streamer.name}`);
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, `${__dirname}/public/uploads/triggers/${streamer.name}`);
        },
        filename: (req, file, cb) => {
            cb(null, `${req.body.triggerName}.${file.mimetype.split('/')[1]}`);
        },
        limits: { fileSize: MAX_FILE_SIZE }
    });

    multer({
        storage: storage,
        fileFilter: async (req, file, cb) => {
            if(acceptableMimeTypes.includes(file.mimetype)) {
                if(await triggerFileSchema.exists({
                    name: req.body.triggerName,
                    fileType: file.mimetype
                })) {
                    cb(null, false);
                } else {
                    cb(null, true);
                }
            } else {
                cb(null, false);
            }
        }
    }).single('trigger')(req, res, async (err) => {
        if(err) {
            console.log({ error: true, message: 'Error uploading file', err: err });
            res.status(500).json({ error: true, message: 'Error uploading file' });
            return false;
        }

        if(!req.file) {
            return res.status(400).json({ error: true, message: 'Invalid file type or file with same name already exists' });
        }

        let exists = await triggerFileSchema.exists({
            name: req.body.triggerName,
            fileType: req.file.mimetype
        });

        if(exists) {
            return res.status(400).json({ error: true, message: 'File with same name already exists' });
        }

        let fileNameUrlEncoded = encodeURIComponent(req.file.filename);
        let fileData = {
            name: req.body.triggerName,
            fileName: req.file.filename,
            fileSize: req.file.size,
            fileType: req.file.mimetype,
            fileUrl: `https://api.domdimabot.com/media/${streamer.name}/${fileNameUrlEncoded}`,
            channel: streamer.name,
            channelID: channelID
        }

        let newFile = await new triggerFileSchema(fileData).save();

        return res.status(200).json({ error: false, message: 'File uploaded successfully', file: newFile });
        
    });
    
});

router.post('/:channelID', async (req, res) => {
    const { channelID } = req.params;
    const { name, file, type, mediaType, cost, prompt, fileID, cooldown, volume } = req.body;
    let body = req.body;

    let streamer = await STREAMERS.getStreamerById(channelID);
    if(!streamer) return res.status(404).json({ error: true, message: 'Streamer not found' });

    let exists = triggerFileSchema.exists({name: file, fileType: mediaType, channelID: channelID});
    if(!exists) return res.status(404).json({ error: true, message: 'File not found' });

    body.title = name;
    delete body.name;
    if(!body.rewardType) body.rewardType = 'trigger';

    let response = await fetch(`${getUrl()}/rewards/${channelID}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    response = await response.json();

    if(response.error) {
        console.log({error: true, message: 'Error creating reward', response: response, channelID});
        return res.status(500).json({error: true, message: response.message});
    }

    let rewardData = response.rewardData;

    let newTrigger = new triggerSchema({
        name: name,
        channel: streamer.name,
        channelID: channelID,
        rewardID: rewardData.rewardID,
        file,
        fileID,
        type,
        mediaType,
        cost,
        cooldown,
        volume,
    });

    await newTrigger.save();

    res.status(200).json({ error: false, message: 'Trigger created successfully', trigger: newTrigger });
    
});

router.patch('/:channelID/:triggerID', async (req, res) => {
    const { channelID, triggerID } = req.params;
    const { name, cost, prompt, cooldown, volume } = req.body;
    let body = req.body;

    let trigger = await triggerSchema.findOne({ _id: triggerID, channelID: channelID });
    if(!trigger) return res.status(404).json({ error: true, message: 'Trigger not found' });

    body.title = name;
    delete body.name;
    body.prompt = prompt ? prompt : '';

    let response = await fetch(`${getUrl()}/rewards/${channelID}/${trigger.rewardID}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    response = await response.json();

    if(response.error) {
        console.log({error: true, message: 'Error updating reward', response: response, channelID});
        return res.status(response.status).json({error: true, message: response.message});
    }

    response = response.reward;

    let updatedResult = await triggerSchema.findByIdAndUpdate(triggerID, {name, cost, prompt, cooldown, volume}, {new: true});
    if(!updatedResult) return res.status(500).json({ error: true, message: 'Error updating trigger' });

    res.status(200).json({ error: false, message: 'Trigger updated successfully', trigger: updatedResult });
    
});

router.delete('/:channelID/:triggerID', async (req, res) => {
    const { channelID, triggerID } = req.params;

    let trigger = await triggerSchema.findOne({ _id: triggerID, channelID: channelID });
    if(!trigger) return res.status(404).json({ error: true, message: 'Trigger not found' });

    let response = await fetch(`${getUrl()}/rewards/${channelID}/${trigger.rewardID}`, {
        method: 'DELETE'
    });

    response = await response.json();

    if(response.error) {
        console.log({error: true, message: 'Error deleting reward', response: response, channelID});
        return res.status(response.status).json({error: true, message: response.message});
    }

    await trigger.deleteOne();

    res.status(200).json({ error: false, message: 'Trigger deleted successfully' });
    
});

router.get('/files/:channelID', async (req, res) => {
    const { channelID } = req.params;

    let files = await triggerFileSchema.find({ channelID: channelID }, '_id name fileName fileType fileSize fileUrl');

    if (!files) return res.status(404).json({ error: true, message: 'Files not found' });

    res.status(200).json({ error: false, files });
});

router.delete('/files/:channelID/:fileID', async (req, res) => {
    const { channelID, fileID } = req.params;

    let exists = await triggerSchema.exists({ fileID: fileID });

    if(exists) return res.status(400).json({ error: true, message: 'File is in use' });

    let file = await triggerFileSchema.findOne({ _id: fileID, channelID: channelID });
    if(!file) return res.status(404).json({ error: true, message: 'File not found' });

    fs.unlinkSync(`${__dirname}/public/uploads/triggers/${file.channel}/${file.fileName}`, { recursive: false, force: true, maxRetries: 5});

    await file.deleteOne();

    res.status(200).json({ error: false, message: 'File deleted successfully' });
    
});

module.exports = router;