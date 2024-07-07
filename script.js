// Global Variables
const API_URL = 'http://localhost:5000/api';  // Base API URL
const socket = io('http://localhost:5000');  // Initialize socket.io with the correct server URL

// DOM Elements
const authModal = document.getElementById('auth-modal');
const authTitle = document.getElementById('auth-title');
const authForm = document.getElementById('auth-form');
const authSwitch = document.getElementById('auth-switch');
const switchToSignup = document.getElementById('switch-to-signup');
const userInfo = document.getElementById('user-info');
const userName = document.getElementById('user-name');
const userRole = document.getElementById('user-role');
const addCourseBtn = document.getElementById('add-course-btn');
const addCourseForm = document.getElementById('add-course-form');
const addAssignmentForm = document.getElementById('add-assignment-form');
const messageInput = document.getElementById('message-input');
const sendMessageBtn = document.getElementById('send-message');
const courseList = document.getElementById('course-list');
const courseGrid = document.getElementById('course-grid');
const upcomingList = document.getElementById('upcoming-list');
const announcementsList = document.getElementById('announcements-list');
const todoList = document.getElementById('todo-list');
const quickStats = document.getElementById('quick-stats');
const assignmentList = document.getElementById('assignment-list');
const messageList = document.getElementById('message-list');
const profileForm = document.getElementById('profile-form');
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const profileRole = document.getElementById('profile-role');
const teacherPanel = document.getElementById('teacher-panel');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const notification = document.getElementById('notification');

// Check Authentication
async function checkAuthentication() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await fetch(`${API_URL}/profile`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            if (data.username) {
                userName.textContent = data.name || 'User';
                userRole.textContent = data.role.charAt(0).toUpperCase() + data.role.slice(1);
                userInfo.style.display = 'flex';
                if (data.role === 'teacher') {
                    addCourseBtn.style.display = 'block';
                    teacherPanel.classList.remove('hidden');
                } else {
                    addCourseBtn.style.display = 'none';
                    teacherPanel.classList.add('hidden');
                }
                loadCourses();
                loadAssignments();
                loadUpcomingClasses();
                loadAnnouncements();
                loadTodoList();
                loadQuickStats();
                loadMessages();
                loadProfile();
                setupSocketListeners();
            } else {
                throw new Error('Invalid authentication data');
            }
        } catch (error) {
            console.error('Error checking authentication:', error);
            userInfo.style.display = 'none';
            showNotification('Session expired, please login again.');
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('name');
            localStorage.removeItem('username');
        }
    } else {
        userInfo.style.display = 'none';
    }
}

// Event Listeners
window.addEventListener('load', () => {
    checkAuthentication();  // Check if user is authenticated on page load
    setupEventListeners(); // Set up event listeners for modals and forms
});



function setupEventListeners() {
    // Open Login Modal
    document.querySelectorAll('a[data-section]').forEach(link => {
        link.addEventListener('click', () => {
            if (!localStorage.getItem('token')) {
                openAuthModal();
            }
        });
    });

    // Handle Authentication Form Submit
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const action = authTitle.textContent === 'Login' ? 'login' : 'register';
        try {
            const response = await fetch(`${API_URL}/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                localStorage.setItem('name', data.name);
                localStorage.setItem('username', data.username);
                closeAuthModal();
                checkAuthentication();
            } else {
                showNotification(data.message || 'Authentication failed.');
            }
        } catch (error) {
            showNotification('An error occurred during authentication.');
        }
    });

    // Switch between Login and Signup
    switchToSignup.addEventListener('click', () => {
        authTitle.textContent = 'Sign Up';
        authSwitch.innerHTML = `Already have an account? <a href="#" id="switch-to-login">Login</a>`;
        document.getElementById('switch-to-login').addEventListener('click', () => {
            authTitle.textContent = 'Login';
            authSwitch.innerHTML = `Don't have an account? <a href="#" id="switch-to-signup">Sign up</a>`;
            document.getElementById('switch-to-signup').addEventListener('click', switchToSignup);
        });
    });

    // Close Modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeAuthModal();
            closeModal();
        });
    });

    // Send Message
    sendMessageBtn.addEventListener('click', () => {
        sendMessage();
    });

    // Profile Form Submit
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = profileName.value;
        const email = profileEmail.value;
        const role = profileRole.value;
        try {
            const response = await fetch(`${API_URL}/update-profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ name, email, role })
            });
            const data = await response.json();
            if (data.success) {
                showNotification('Profile updated successfully.');
                localStorage.setItem('role', role);
                checkAuthentication();
            } else {
                showNotification(data.message || 'Profile update failed.');
            }
        } catch (error) {
            showNotification('An error occurred while updating profile.');
        }
    });

    // Add Course Form Submit
    addCourseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('course-name').value;
        const description = document.getElementById('course-description').value;
        try {
            const response = await fetch(`${API_URL}/courses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ name, description })
            });
            const data = await response.json();
            if (data.success) {
                showNotification('Course added successfully.');
                loadCourses();
            } else {
                showNotification(data.message || 'Failed to add course.');
            }
        } catch (error) {
            showNotification('An error occurred while adding course.');
        }
    });

    // Add Assignment Form Submit
    addAssignmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('assignment-title').value;
        const course = document.getElementById('assignment-course').value;
        const dueDate = document.getElementById('assignment-due-date').value;
        try {
            const response = await fetch(`${API_URL}/assignments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ title, course, dueDate })
            });
            const data = await response.json();
            if (data.success) {
                showNotification('Assignment added successfully.');
                loadAssignments();
            } else {
                showNotification(data.message || 'Failed to add assignment.');
            }
        } catch (error) {
            showNotification('An error occurred while adding assignment.');
        }
    });

    // Logout
    document.querySelectorAll('a[href="#logout"]').forEach(link => {
        link.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('name');
            localStorage.removeItem('username');
            checkAuthentication();
        });
    });

    // Open and Close Auth Modal
    function openAuthModal() {
        authModal.style.display = 'block';
    }

    function closeAuthModal() {
        authModal.style.display = 'none';
    }

    // Open and Close General Modal
    function openModal(title, body) {
        modalTitle.textContent = title;
        modalBody.innerHTML = body;
        modal.style.display = 'block';
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    // Show Notifications
    function showNotification(message) {
        notification.textContent = message;
        notification.classList.remove('hidden');
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    }

    // Check Authentication
    async function checkAuthentication() {
        const token = localStorage.getItem('token');
        if (token) {
            const response = await fetch(`${API_URL}/profile`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.username) {
                userName.textContent = data.name || 'User';
                userRole.textContent = data.role.charAt(0).toUpperCase() + data.role.slice(1);
                userInfo.style.display = 'flex';
                if (data.role === 'teacher') {
                    addCourseBtn.style.display = 'block';
                    teacherPanel.classList.remove('hidden');
                } else {
                    addCourseBtn.style.display = 'none';
                    teacherPanel.classList.add('hidden');
                }
                loadCourses();
                loadAssignments();
                loadUpcomingClasses();
                loadAnnouncements();
                loadTodoList();
                loadQuickStats();
                loadMessages();
                loadProfile();
                setupSocketListeners();
            } else {
                userInfo.style.display = 'none';
                showNotification('Session expired, please login again.');
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                localStorage.removeItem('name');
                localStorage.removeItem('username');
            }
        } else {
            userInfo.style.display = 'none';
        }
    }

    // Load Courses
    async function loadCourses() {
        try {
            const response = await fetch(`${API_URL}/courses`);
            const data = await response.json();
            courseList.innerHTML = '';
            courseGrid.innerHTML = '';
            data.courses.forEach(course => {
                const courseItem = document.createElement('li');
                courseItem.textContent = course.name;
                courseList.appendChild(courseItem);

                const courseCard = document.createElement('div');
                courseCard.className = 'course-card';
                courseCard.innerHTML = `
                    <h3>${course.name}</h3>
                    <p>${course.description}</p>
                `;
                courseGrid.appendChild(courseCard);
            });
        } catch (error) {
            showNotification('An error occurred while loading courses.');
        }
    }

    // Load Assignments
    async function loadAssignments() {
        try {
            const response = await fetch(`${API_URL}/assignments`);
            const data = await response.json();
            assignmentList.innerHTML = '';
            data.assignments.forEach(assignment => {
                const assignmentItem = document.createElement('div');
                assignmentItem.className = 'assignment-item';
                assignmentItem.innerHTML = `
                    <h4>${assignment.title}</h4>
                    <p>Course: ${assignment.course}</p>
                    <p>Due Date: ${assignment.dueDate}</p>
                `;
                assignmentList.appendChild(assignmentItem);
            });
        } catch (error) {
            showNotification('An error occurred while loading assignments.');
        }
    }

    // Load Upcoming Classes
    async function loadUpcomingClasses() {
        try {
            const response = await fetch(`${API_URL}/upcoming-classes`);
            const data = await response.json();
            upcomingList.innerHTML = '';
            data.classes.forEach(classItem => {
                const classLi = document.createElement('li');
                classLi.textContent = `${classItem.course} - ${classItem.date}`;
                upcomingList.appendChild(classLi);
            });
        } catch (error) {
            showNotification('An error occurred while loading upcoming classes.');
        }
    }

    // Load Announcements
    async function loadAnnouncements() {
        try {
            const response = await fetch(`${API_URL}/announcements`);
            const data = await response.json();
            announcementsList.innerHTML = '';
            data.announcements.forEach(announcement => {
                const announcementLi = document.createElement('li');
                announcementLi.textContent = announcement.message;
                announcementsList.appendChild(announcementLi);
            });
        } catch (error) {
            showNotification('An error occurred while loading announcements.');
        }
    }

    // Load To-Do List
    async function loadTodoList() {
        try {
            const response = await fetch(`${API_URL}/todo-list`);
            const data = await response.json();
            todoList.innerHTML = '';
            data.tasks.forEach(task => {
                const taskLi = document.createElement('li');
                taskLi.textContent = task.title;
                todoList.appendChild(taskLi);
            });
        } catch (error) {
            showNotification('An error occurred while loading to-do list.');
        }
    }

    // Load Quick Stats
    async function loadQuickStats() {
        try {
            const response = await fetch(`${API_URL}/quick-stats`);
            const data = await response.json();
            quickStats.innerHTML = `
                <p>Total Courses: ${data.totalCourses}</p>
                <p>Total Assignments: ${data.totalAssignments}</p>
                <p>Total Students: ${data.totalStudents}</p>
            `;
        } catch (error) {
            showNotification('An error occurred while loading quick stats.');
        }
    }

    // Load Messages
    async function loadMessages() {
        try {
            const response = await fetch(`${API_URL}/messages`);
            const data = await response.json();
            messageList.innerHTML = '';
            data.messages.forEach(message => {
                const messageItem = document.createElement('div');
                messageItem.className = 'message-item';
                messageItem.textContent = message.content;
                messageList.appendChild(messageItem);
            });
        } catch (error) {
            showNotification('An error occurred while loading messages.');
        }
    }

    // Load Profile
    async function loadProfile() {
        try {
            const response = await fetch(`${API_URL}/profile`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            profileName.value = data.name || '';
            profileEmail.value = data.email || '';
            profileRole.value = data.role || 'student';
        } catch (error) {
            showNotification('An error occurred while loading profile.');
        }
    }

    // Send Message
    async function sendMessage() {
        const content = messageInput.value;
        try {
            const response = await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ content })
            });
            const data = await response.json();
            if (data.success) {
                showNotification('Message sent.');
                messageInput.value = '';
            } else {
                showNotification(data.message || 'Failed to send message.');
            }
        } catch (error) {
            showNotification('An error occurred while sending message.');
        }
    }

    // Setup Socket Listeners
    function setupSocketListeners() {
        socket.on('newMessage', (message) => {
            messageList.innerHTML += `<div class="message-item">${message.content}</div>`;
        });

        socket.on('newAssignment', (assignment) => {
            loadAssignments();
        });

        socket.on('newCourse', (course) => {
            loadCourses();
        });

        socket.on('newAnnouncement', (announcement) => {
            loadAnnouncements();
        });

        socket.on('newTodo', (todo) => {
            loadTodoList();
        });

        socket.on('newUpcomingClass', (classItem) => {
            loadUpcomingClasses();
        });
    }
}
