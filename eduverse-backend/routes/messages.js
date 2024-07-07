const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
    try {
        const message = new Message({
            ...req.body,
            sender: req.user._id
        });
        await message.save();
        res.status(201).send(message);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get('/', auth, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [{ sender: req.user._id }, { receiver: req.user._id }]
        }).populate('sender', 'name').populate('receiver', 'name');
        res.send(messages);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;