const express = require('express');
const Assignment = require('../models/Assignment');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
    try {
        const assignment = new Assignment(req.body);
        await assignment.save();
        res.status(201).send(assignment);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get('/', auth, async (req, res) => {
    try {
        const assignments = await Assignment.find();
        res.send(assignments);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;