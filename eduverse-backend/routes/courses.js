const express = require('express');
const Course = require('../models/Course');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
    try {
        const course = new Course({
            ...req.body,
            instructor: req.user._id
        });
        await course.save();
        res.status(201).send(course);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get('/', auth, async (req, res) => {
    try {
        const courses = await Course.find();
        res.send(courses);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/:id', auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('instructor', 'name');
        if (!course) {
            return res.status(404).send();
        }
        res.send(course);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;