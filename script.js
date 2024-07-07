// Mock data (replace with actual API calls in a real application)
const mockData = {
    courses: [
        { id: 1, name: "Mathematics", description: "Advanced calculus and algebra", progress: 60 },
        { id: 2, name: "Physics", description: "Classical mechanics and thermodynamics", progress: 40 },
        { id: 3, name: "Computer Science", description: "Data structures and algorithms", progress: 75 },
    ],
    upcomingClasses: [
        { course: "Mathematics", date: "2024-07-10", time: "10:00 AM" },
        { course: "Physics", date: "2024-07-11", time: "2:00 PM" },
        { course: "Computer Science", date: "2024-07-12", time: "11:00 AM" },
    ],
    announcements: [
        { title: "New course material available", date: "2024-07-08" },
        { title: "Upcoming exam schedule", date: "2024-07-09" },
    ],
    todoItems: [
        { task: "Complete Math assignment", dueDate: "2024-07-15" },
        { task: "Read Chapter 5 of Physics textbook", dueDate: "2024-07-14" },
    ],
    assignments: [
        { id: 1, course: "Mathematics", title: "Problem Set 3", dueDate: "2024-07-20" },
        { id: 2, course: "Physics", title: "Lab Report 2", dueDate: "2024-07-22" },
        { id: 3, course: "Computer Science", title: "Programming Project 1", dueDate: "2024-07-25" },
    ],
    messages: [
        { sender: "Prof. Smith", content: "Don't forget about the upcoming quiz!", timestamp: "2024-07-08 09:30 AM" },
        { sender: "John Doe", content: "Can we discuss the latest assignment?", timestamp: "2024-07-08 02:15 PM" },
    ],
};

// DOM elements
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

// Initialize the application
function init() {
    populateCourseList();
    populateUpcomingClasses();
    populateAnnouncements();
    populateTodoList();
    populateQuickStats();
    populateCourseGrid();
    populateAssignments();
    populateMessages();
    setupEventListeners();
}

// Populate course list in sidebar
function populateCourseList() {
    mockData.courses.forEach(course => {
        const li = document.createElement('li');
        li.textContent = course.name;
        li.onclick = () => showCourseDetails(course);
        courseList.appendChild(li);
    });
}

// Populate upcoming classes
function populateUpcomingClasses() {
    mockData.upcomingClasses.forEach(cls => {
        const li = document.createElement('li');
        li.textContent = `${cls.course}: ${cls.date} at ${cls.time}`;
        upcomingList.appendChild(li);
    });
}

// Populate announcements
function populateAnnouncements() {
    mockData.announcements.forEach(announcement => {
        const li = document.createElement('li');
        li.textContent = `${announcement.title} - ${announcement.date}`;
        announcementsList.appendChild(li);
    });
}

// Populate todo list
function populateTodoList() {
    mockData.todoItems.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.task} - Due: ${item.dueDate}`;
        todoList.appendChild(li);
    });
}

// Populate quick stats
function populateQuickStats() {
    const totalCourses = mockData.courses.length;
    const averageProgress = mockData.courses.reduce((sum, course) => sum + course.progress, 0) / totalCourses;
    
    quickStats.innerHTML = `
        <p>Total Courses: ${totalCourses}</p>
        <p>Average Progress: ${averageProgress.toFixed(2)}%</p>
    `;
}

// Populate course grid
function populateCourseGrid() {
    mockData.courses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        courseCard.innerHTML = `
            <h3>${course.name}</h3>
            <p>${course.description}</p>
            <progress value="${course.progress}" max="100"></progress>
            <p>${course.progress}% Complete</p>
            <button class="btn" onclick="showCourseDetails(${JSON.stringify(course)})">View Details</button>
        `;
        courseGrid.appendChild(courseCard);
    });
}

// Populate assignments
function populateAssignments() {
    mockData.assignments.forEach(assignment => {
        const li = document.createElement('li');
        li.innerHTML = `
            <h4>${assignment.title}</h4>
            <p>Course: ${assignment.course}</p>
            <p>Due: ${assignment.dueDate}</p>
            <button class="btn" onclick="showAssignmentDetails(${JSON.stringify(assignment)})">View Details</button>
        `;
        assignmentList.appendChild(li);
    });
}

// Populate messages
function populateMessages() {
    mockData.messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.innerHTML = `
            <p><strong>${message.sender}</strong>: ${message.content}</p>
            <small>${message.timestamp}</small>
        `;
        messageList.appendChild(messageDiv);
    });
}

// Setup event listeners
function setupEventListeners() {
    sendMessageBtn.addEventListener('click', sendMessage);
    closeModal.addEventListener('click', hideModal);
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            hideModal();
        }
    });

    // Navigation
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            showSection(sectionId);
        });
    });
}

// Show course details in modal
function showCourseDetails(course) {
    modalTitle.textContent = course.name;
    modalBody.innerHTML = `
        <p>${course.description}</p>
        <p>Progress: ${course.progress}%</p>
        <progress value="${course.progress}" max="100"></progress>
    `;
    showModal();
}

// Show assignment details in modal
function showAssignmentDetails(assignment) {
    modalTitle.textContent = assignment.title;
    modalBody.innerHTML = `
        <p>Course: ${assignment.course}</p>
        <p>Due Date: ${assignment.dueDate}</p>
        <button class="btn">Submit Assignment</button>
    `;
    showModal();
}

// Send a new message
function sendMessage() {
    const content = messageInput.value.trim();
    if (content) {
        const newMessage = {
            sender: 'You',
            content: content,
            timestamp: new Date().toLocaleString()
        };
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.innerHTML = `
            <p><strong>${newMessage.sender}</strong>: ${newMessage.content}</p>
            <small>${newMessage.timestamp}</small>
        `;
        messageList.appendChild(messageDiv);
        messageInput.value = '';
        messageList.scrollTop = messageList.scrollHeight;
    }
}

// Show modal
function showModal() {
    modal.style.display = 'block';
}

// Hide modal
function hideModal() {
    modal.style.display = 'none';
}

// Show section
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

// Show notification
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// Initialize the application
init();