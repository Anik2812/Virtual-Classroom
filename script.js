// Mock data (replace with actual API calls in a real application)
const mockData = {
    courses: [
        { id: 1, name: "Advanced Mathematics", description: "Complex calculus and linear algebra", progress: 60, instructor: "Dr. Harsh Patel" },
        { id: 2, name: "Quantum Physics", description: "Principles of quantum mechanics", progress: 40, instructor: "Prof. Jaimin Shah" },
        { id: 3, name: "Data Structures", description: "Advanced algorithms and data structures", progress: 75, instructor: "Dr. Swayam Desai" },
    ],
    upcomingClasses: [
        { course: "Advanced Mathematics", date: "2024-07-10", time: "10:00 AM" },
        { course: "Quantum Physics", date: "2024-07-11", time: "2:00 PM" },
        { course: "Data Structures", date: "2024-07-12", time: "11:00 AM" },
    ],
    announcements: [
        { title: "New course material available for Advanced Mathematics", date: "2024-07-08" },
        { title: "Quantum Physics exam rescheduled", date: "2024-07-09" },
    ],
    todoItems: [
        { task: "Complete Math assignment on Complex Integration", dueDate: "2024-07-15" },
        { task: "Prepare presentation for Quantum Entanglement", dueDate: "2024-07-14" },
    ],
    assignments: [
        { id: 1, course: "Advanced Mathematics", title: "Complex Integration Problems", dueDate: "2024-07-20" },
        { id: 2, course: "Quantum Physics", title: "Quantum Entanglement Essay", dueDate: "2024-07-22" },
        { id: 3, course: "Data Structures", title: "Implement Red-Black Tree", dueDate: "2024-07-25" },
    ],
    messages: [
        { sender: "Dr. Harsh Patel", content: "Don't forget about the upcoming calculus quiz!", timestamp: "2024-07-08 09:30 AM" },
        { sender: "Jaimin", content: "Can we discuss the quantum mechanics project?", timestamp: "2024-07-08 02:15 PM" },
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
const notification = document.getElementById('notification');

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
            <p>Instructor: ${course.instructor}</p>
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
        <p>Instructor: ${course.instructor}</p>
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
            sender: 'Anik',
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
        showNotification('Message sent successfully!');
    }
}

// Show modal
function showModal() {
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// Hide modal
function hideModal() {
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
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

    // Animate new section
    gsap.from(`#${sectionId} > *`, {
        duration: 0.5,
        opacity: 0,
        y: 20,
        stagger: 0.1
    });
}

// Show notification
function showNotification(message) {
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Initialize the application
init();

// Add some GSAP animations
gsap.from(".dashboard-card", {
    duration: 0.5,
    opacity: 0,
    y: 50,
    stagger: 0.1,
    ease: "power2.out"
});

gsap.from(".course-card", {
    duration: 0.5,
    opacity: 0,
    scale: 0.9,
    stagger: 0.1,
    ease: "back.out(1.7)"
});