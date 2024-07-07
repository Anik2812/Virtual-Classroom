const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(express.json());

// Connect to MongoDB (replace with your actual connection string)
mongoose.connect('mongodb://localhost/virtual-classroom', { useNewUrlParser: true, useUnifiedTopology: true });

// Define schemas
const courseSchema = new mongoose.Schema({
  name: String,
  description: String,
  progress: Number,
  instructor: String
});

const assignmentSchema = new mongoose.Schema({
  course: String,
  title: String,
  dueDate: Date
});

const messageSchema = new mongoose.Schema({
  sender: String,
  content: String,
  timestamp: Date
});

// Create models
const Course = mongoose.model('Course', courseSchema);
const Assignment = mongoose.model('Assignment', assignmentSchema);
const Message = mongoose.model('Message', messageSchema);

// Routes
app.get('/api/courses', async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
});

app.get('/api/assignments', async (req, res) => {
  const assignments = await Assignment.find();
  res.json(assignments);
});

app.get('/api/messages', async (req, res) => {
  const messages = await Message.find().sort('-timestamp').limit(50);
  res.json(messages);
});

app.post('/api/messages', async (req, res) => {
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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));