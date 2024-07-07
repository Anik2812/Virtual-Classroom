const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:8000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: 'http://localhost:8000',
  credentials: true
}));

app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; style-src 'self' https://cdnjs.cloudflare.com; img-src 'self' data:; connect-src 'self' http://localhost:5000;"); 
    res.setHeader('Content-Type', 'application/json');
    next();
});

app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://myAtlasDBUser:coc28125@cluster0.p4mtziw.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true });

// Define schemas
const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: String,
    name: String,
    email: String
});

const CourseSchema = new mongoose.Schema({
    name: String,
    description: String,
    instructor: String,
    progress: Number
});

const AssignmentSchema = new mongoose.Schema({
    title: String,
    course: String,
    dueDate: Date
});

const MessageSchema = new mongoose.Schema({
    sender: String,
    content: String,
    timestamp: Date
});

// Define models
const User = mongoose.model('User', UserSchema);
const Course = mongoose.model('Course', CourseSchema);
const Assignment = mongoose.model('Assignment', AssignmentSchema);
const Message = mongoose.model('Message', MessageSchema);

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Routes
app.get('/', (req, res) => {
    res.send('EduVerse API is running');
  });

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ username: user.username, role: user.role }, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
        res.json({ token, role: user.role });
    } else {
        res.status(400).send('Invalid credentials');
    }
});

app.post('/api/register', async (req, res) => {
    const { username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role });
    await user.save();
    res.status(201).send('User registered');
});

app.get('/api/profile', (req, res) => {
    // Example response with JSON content
    res.json({
        username: 'Anik28',
        name: 'Anik',
        role: 'student'
    });
});

app.get('/api/courses', authenticateToken, async (req, res) => {
    const courses = await Course.find();
    res.json(courses);
});

app.post('/api/courses', authenticateToken, async (req, res) => {
    if (req.user.role !== 'teacher') return res.sendStatus(403);
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
});

app.get('/api/assignments', authenticateToken, async (req, res) => {
    const assignments = await Assignment.find();
    res.json(assignments);
});

app.post('/api/assignments', authenticateToken, async (req, res) => {
    if (req.user.role !== 'teacher') return res.sendStatus(403);
    const assignment = new Assignment(req.body);
    await assignment.save();
    res.status(201).json(assignment);
});

app.get('/api/messages', authenticateToken, async (req, res) => {
    const messages = await Message.find().sort({ timestamp: -1 }).limit(50);
    res.json(messages);
});

app.post('/api/messages', authenticateToken, async (req, res) => {
    const message = new Message(req.body);
    await message.save();
    io.emit('new_message', message);
    res.status(201).json(message);
});

// Socket.io
io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));