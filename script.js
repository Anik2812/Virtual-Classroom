const courseList = document.getElementById('course-list');
const upcomingList = document.getElementById('upcoming-list');
const announcementsList = document.getElementById('announcements-list');
const todoList = document.getElementById('todo-list');
const quickStats = document.getElementById('quick-stats');
const courseGrid = document.getElementById('course-grid');
const assignmentList = document.getElementById('assignment-list');
const messageList = document.getElementById('message-list');
const messageInput = document.getElementById('message-input');
const sendMessageBtn = document.getElementById('send-message');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const closeModal = document.getElementsByClassName('close')[0];
const notification = document.getElementById('notification');

const API_URL = 'http://localhost:3000/api';
const socket = io('http://localhost:3000');

async function fetchData(endpoint) {
  const response = await fetch(`${API_URL}/${endpoint}`);
  return response.json();
}

async function init() {
  await Promise.all([
    populateCourseList(),
    populateAssignments(),
    populateMessages()
  ]);
  setupEventListeners();
}

async function populateCourseList() {
  const courses = await fetchData('courses');
  courses.forEach(course => {
    const li = document.createElement('li');
    li.textContent = course.name;
    li.onclick = () => showCourseDetails(course);
    courseList.appendChild(li);
  });
}

async function populateAssignments() {
  const assignments = await fetchData('assignments');
  assignments.forEach(assignment => {
    const li = document.createElement('li');
    li.innerHTML = `
      <h4>${assignment.title}</h4>
      <p>Course: ${assignment.course}</p>
      <p>Due: ${new Date(assignment.dueDate).toLocaleDateString()}</p>
      <button class="btn" onclick="showAssignmentDetails(${JSON.stringify(assignment)})">View Details</button>
    `;
    assignmentList.appendChild(li);
  });
}

async function populateMessages() {
  const messages = await fetchData('messages');
  messages.forEach(addMessageToList);
}

function addMessageToList(message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message';
  messageDiv.innerHTML = `
    <p><strong>${message.sender}</strong>: ${message.content}</p>
    <small>${new Date(message.timestamp).toLocaleString()}</small>
  `;
  messageList.appendChild(messageDiv);
}

function setupEventListeners() {
  sendMessageBtn.addEventListener('click', sendMessage);
  closeModal.addEventListener('click', hideModal);
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      hideModal();
    }
  });

  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = link.getAttribute('data-section');
      showSection(sectionId);
    });
  });

  socket.on('new_message', addMessageToList);
}

function showCourseDetails(course) {
  modalTitle.textContent = course.name;
  modalBody.innerHTML = `
    <p>${course.description}</p>
    <p>Instructor: ${course.instructor}</p>
    <p>Progress: ${course.progress}%</p>
    <progress value="${course.progress}" max="100"></progress>
  `;
  showModal();
}

function showAssignmentDetails(assignment) {
  modalTitle.textContent = assignment.title;
  modalBody.innerHTML = `
    <p>Course: ${assignment.course}</p>
    <p>Due Date: ${new Date(assignment.dueDate).toLocaleDateString()}</p>
    <button class="btn">Submit Assignment</button>
  `;
  showModal();
}

async function sendMessage() {
  const content = messageInput.value.trim();
  if (content) {
    const newMessage = {
      sender: 'Anik', // Replace with actual user name
      content: content,
      timestamp: new Date()
    };
    const response = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newMessage),
    });
    if (response.ok) {
      messageInput.value = '';
      showNotification('Message sent successfully!');
    } else {
      showNotification('Failed to send message. Please try again.');
    }
  }
}

function showModal() {
  modal.style.display = 'block';
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
}

function hideModal() {
  modal.classList.remove('show');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 300);
}

function showSection(sectionId) {
  document.querySelectorAll('main section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(sectionId).classList.add('active');

  document.querySelectorAll('nav a').forEach(link => {
    link.classList.remove('active');
  });
  document.querySelector(`nav a[data-section="${sectionId}"]`).classList.add('active');
}

function showNotification(message) {
  notification.textContent = message;
  notification.classList.add('show');
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

init();