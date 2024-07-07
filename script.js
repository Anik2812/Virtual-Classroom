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
async function init() {
    const courses = await fetchCourses();
    const assignments = await fetchAssignments();
    
    populateCourseList(courses);
    populateCourseGrid(courses);
    populateAssignments(assignments);
    populateUpcomingClasses();
    populateAnnouncements();
    populateTodoList();
    populateQuickStats();
    populateMessages();
    setupEventListeners();
    loadProfile();
}
async function fetchCourses() {
    try {
        const response = await fetch('/api/courses');
        return await response.json();
    } catch (error) {
        console.error('Error fetching courses:', error);
        return [];
    }
}

async function fetchAssignments() {
    try {
        const response = await fetch('/api/assignments');
        return await response.json();
    } catch (error) {
        console.error('Error fetching assignments:', error);
        return [];
    }
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

    document.getElementById('profile-form').addEventListener('submit', updateProfile);
    document.getElementById('add-course-form').addEventListener('submit', addCourse);
    document.getElementById('add-assignment-form').addEventListener('submit', addAssignment);

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

function loadProfile() {
    // Fetch profile data from the server
    fetch('/api/profile')
        .then(response => response.json())
        .then(data => {
            document.getElementById('profile-name').value = data.name;
            document.getElementById('profile-email').value = data.email;
            document.getElementById('profile-role').value = data.role;
        })
        .catch(error => console.error('Error:', error));
}

function updateProfile(event) {
    event.preventDefault();
    const profileData = {
        name: document.getElementById('profile-name').value,
        email: document.getElementById('profile-email').value,
        role: document.getElementById('profile-role').value
    };

    fetch('/api/profile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
    })
    .then(response => response.json())
    .then(data => {
        showNotification('Profile updated successfully!');
    })
    .catch((error) => {
        console.error('Error:', error);
        showNotification('Failed to update profile.');
    });
}

function addCourse(event) {
    event.preventDefault();
    const courseData = {
        name: document.getElementById('course-name').value,
        description: document.getElementById('course-description').value
    };

    fetch('/api/courses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
    })
    .then(response => response.json())
    .then(data => {
        showNotification('Course added successfully!');
        populateCourseList(); // Refresh the course list
    })
    .catch((error) => {
        console.error('Error:', error);
        showNotification('Failed to add course.');
    });
}

function addAssignment(event) {
    event.preventDefault();
    const assignmentData = {
        title: document.getElementById('assignment-title').value,
        course: document.getElementById('assignment-course').value,
        dueDate: document.getElementById('assignment-due-date').value
    };

    fetch('/api/assignments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentData),
    })
    .then(response => response.json())
    .then(data => {
        showNotification('Assignment added successfully!');
        populateAssignments(); // Refresh the assignment list
    })
    .catch((error) => {
        console.error('Error:', error);
        showNotification('Failed to add assignment.');
    });
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