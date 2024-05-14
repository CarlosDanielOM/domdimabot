const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');

const STREAMERS = require('../../class/streamers')

const triggerSchema = require('../../schemas/trigger')
const triggerFileSchema = require('../../schemas/triggerfile')

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

    if(!fs.existsSync(`${__dirname}/public/uploads/triggers/${streamer.name}`)) {
        fs.mkdirSync(`${__dirname}/public/uploads/triggers/${streamer.name}`);
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, `${__dirname}/public/uploads/triggers/${streamer.name}`);
        },
        filename: (req, file, cb) => {
            cb(null, `${req.body.triggerName}.${file.mimetype.split('/')[1]}`);
        }
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

        let maxFileSize = 0;

        if(streamer.premium_plus) {
            maxFileSize = 20857600;
        } else if(streamer.premium) {
            maxFileSize = 10428800;
        } else {
            maxFileSize = 5000000;
        }

        if(req.file.size > maxFileSize) {
            fs.unlinkSync(`${__dirname}/public/uploads/triggers/${streamer.name}/${req.body.triggerName}.${req.file.mimetype.split('/')[1]}`);
            return res.status(400).json({ error: true, message: 'File size too large' });
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

router.post('/:channelID', (req, res) => {});

router.patch('/:channelID/:triggerID', (req, res) => {});

router.delete('/:channelID/:triggerID', (req, res) => {});

router.get('/files/:channelID', (req, res) => {});

router.delete('/files/:channelID/:fileID', (req, res) => {});

module.exports = router;