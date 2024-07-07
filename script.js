const API_URL = 'http://localhost:5000/api';
const socket = io('http://localhost:5000');

let currentUser = null;

// DOM elements
const authModal = document.getElementById('auth-modal'); // Changed from loginModal to authModal
const loginForm = document.getElementById('auth-form'); // Changed from loginForm to auth-form
const userInfo = document.getElementById('user-info');
const userName = document.getElementById('user-name');
const userRole = document.getElementById('user-role');
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
const addCourseBtn = document.getElementById('add-course-btn');
const addAssignmentBtn = document.getElementById('add-assignment-btn');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const closeModal = document.getElementsByClassName('close')[0];
const notification = document.getElementById('notification');

// Initialize the application
async function init() {
    if (!currentUser) {
        showLoginModal();
    } else {
        hideLoginModal();
        await loadData();
        setupEventListeners();
        setupUIForRole();
    }
}

// Show login modal
function showLoginModal() {
    authModal.style.display = 'flex'; // Changed from loginModal to authModal
}

// Hide login modal
function hideLoginModal() {
    authModal.style.display = 'none'; // Changed from loginModal to authModal
}

// Load all necessary data
async function loadData() {
    await Promise.all([
        populateCourseList(),
        populateUpcomingClasses(),
        populateAnnouncements(),
        populateTodoList(),
        populateQuickStats(),
        populateCourseGrid(),
        populateAssignments(),
        populateMessages()
    ]);
}

// Setup event listeners
function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin); // Changed from loginForm to auth-form
    sendMessageBtn.addEventListener('click', sendMessage);
    closeModal.addEventListener('click', hideModal);
    addCourseBtn.addEventListener('click', showAddCourseModal);
    addAssignmentBtn.addEventListener('click', showAddAssignmentModal);

    authForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const isSignup = authTitle.textContent === 'Sign Up';
        
        if (isSignup) {
            // Handle signup
            fetch('http://localhost:5000/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification('Sign up successful!');
                    hideAuthModal();
                } else {
                    showNotification('Sign up failed.');
                }
            })
            .catch(error => {
                showNotification('An error occurred.');
                console.error('Error:', error);
            });
        } else {
            // Handle login
            fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Set the user session
                    showNotification('Login successful!');
                    hideAuthModal();
                    // Optionally redirect or update UI
                } else {
                    showNotification('Login failed.');
                }
            })
            .catch(error => {
                showNotification('An error occurred.');
                console.error('Error:', error);
            });
        }
    });
    

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

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = { username, role: data.role };
            hideLoginModal();
            await loadData();
            setupEventListeners();
            setupUIForRole();
            showNotification(`Logged in as ${username} (${data.role})`);
        } else {
            showNotification('Invalid credentials. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('An error occurred. Please try again.');
    }
}

// Setup UI based on user role
function setupUIForRole() {
    document.body.setAttribute('data-role', currentUser.role);
    userName.textContent = currentUser.username;
    userRole.textContent = currentUser.role;
    
    if (currentUser.role === 'teacher') {
        addCourseBtn.style.display = 'block';
        addAssignmentBtn.style.display = 'block';
    } else {
        addCourseBtn.style.display = 'none';
        addAssignmentBtn.style.display = 'none';
    }
}

// Fetch data from API
async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return [];
    }
}

// Populate course list
async function populateCourseList() {
    const courses = await fetchData('courses');
    courseList.innerHTML = '';
    courses.forEach(course => {
        const li = document.createElement('li');
        li.textContent = course.name;
        li.onclick = () => showCourseDetails(course);
        courseList.appendChild(li);
    });
}

// Populate upcoming classes (placeholder)
async function populateUpcomingClasses() {
    // Implement this function when backend provides upcoming classes data
}

// Populate announcements (placeholder)
async function populateAnnouncements() {
    // Implement this function when backend provides announcements data
}

// Populate todo list (placeholder)
async function populateTodoList() {
    // Implement this function when backend provides todo list data
}

// Populate quick stats (placeholder)
async function populateQuickStats() {
    // Implement this function when backend provides quick stats data
}

// Populate course grid
async function populateCourseGrid() {
    const courses = await fetchData('courses');
    courseGrid.innerHTML = '';
    courses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        courseCard.innerHTML = `
            <h3>${course.name}</h3>
            <p>${course.description}</p>
            <p>Instructor: ${course.instructor}</p>
            <progress value="${course.progress}" max="100"></progress>
            <p>${course.progress}% Complete</p>
            <button class="btn" onclick="showCourseDetails(${JSON.stringify(course)})">View Details</button>
        `;
        courseGrid.appendChild(courseCard);
    });
}

// Populate assignments
async function populateAssignments() {
    const assignments = await fetchData('assignments');
    assignmentList.innerHTML = '';
    assignments.forEach(assignment => {
        const li = document.createElement('li');
        li.className = 'assignment-item';
        li.innerHTML = `
            <h4>${assignment.title}</h4>
            <p>Course: ${assignment.course}</p>
            <p>Due: ${new Date(assignment.dueDate).toLocaleDateString()}</p>
            <button class="btn" onclick="showAssignmentDetails(${JSON.stringify(assignment)})">View Details</button>
        `;
        assignmentList.appendChild(li);
    });
}

// Populate messages
async function populateMessages() {
    const messages = await fetchData('messages');
    messageList.innerHTML = '';
    messages.forEach(addMessageToList);
}

// Add a single message to the list
function addMessageToList(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.innerHTML = `
        <p><strong>${message.sender}</strong>: ${message.content}</p>
        <small>${new Date(message.timestamp).toLocaleString()}</small>
    `;
    messageList.appendChild(messageDiv);
}

// Send a new message
async function sendMessage() {
    const content = messageInput.value.trim();
    if (content) {
        try {
            const response = await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sender: currentUser.username,
                    content: content,
                    timestamp: new Date()
                }),
            });

            if (response.ok) {
                messageInput.value = '';
                showNotification('Message sent successfully!');
            } else {
                showNotification('Failed to send message. Please try again.');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            showNotification('An error occurred. Please try again.');
        }
    }
}

// Show course details
function showCourseDetails(course) {
    modalTitle.textContent = course.name;
    modalBody.innerHTML = `
        <p>${course.description}</p>
        <p>Instructor: ${course.instructor}</p>
        <p>Progress: ${course.progress}% Complete</p>
    `;
    modal.style.display = 'flex';
}

// Show assignment details
function showAssignmentDetails(assignment) {
    modalTitle.textContent = assignment.title;
    modalBody.innerHTML = `
        <p>Course: ${assignment.course}</p>
        <p>Due: ${new Date(assignment.dueDate).toLocaleDateString()}</p>
        <p>Description: ${assignment.description}</p>
    `;
    modal.style.display = 'flex';
}

// Show a modal
function showModal(title, body) {
    modalTitle.textContent = title;
    modalBody.innerHTML = body;
    modal.style.display = 'flex';
}

// Hide the modal
function hideModal() {
    modal.style.display = 'none';
}

// Show a notification
function showNotification(message) {
    notification.textContent = message;
    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// Show the section based on ID
function showSection(id) {
    document.querySelectorAll('main section').forEach(section => {
        section.classList.toggle('active', section.id === id);
    });
}

// Initialize the application on page load
init();
