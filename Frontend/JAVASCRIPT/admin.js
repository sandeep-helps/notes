// Admin Panel JavaScript

// Admin Data
let adminData = {
    pendingCount: 24,
    totalNotes: 156,
    totalUsers: 89,
    totalDownloads: 2456
};

let pendingItems = [
    {
        id: 1,
        title: 'Data Structures Algorithms',
        course: 'CSE',
        uploadedBy: 'John Doe',
        uploadDate: '2024-01-15',
        fileType: 'pdf',
        fileSize: '2.4 MB',
        description: 'Complete DSA notes covering all important topics...',
        tags: ['algorithms', 'sorting', 'searching']
    },
    {
        id: 2,
        title: 'Database Management Systems',
        course: 'CSE',
        uploadedBy: 'Jane Smith',
        uploadDate: '2024-01-14',
        fileType: 'pdf',
        fileSize: '1.8 MB',
        description: 'DBMS lecture notes with ER diagrams and SQL queries...',
        tags: ['sql', 'normalization', 'erd']
    },
    // Add more pending items...
];

let allNotes = [
    {
        id: 1,
        title: 'Complete OS Notes',
        course: 'CSE',
        uploadedBy: 'Jane Smith',
        uploadDate: '2024-01-10',
        status: 'approved',
        downloads: 245
    },
    {
        id: 2,
        title: 'Computer Networks PPT',
        course: 'CSE',
        uploadedBy: 'Mike Johnson',
        uploadDate: '2024-01-12',
        status: 'approved',
        downloads: 189
    },
    // Add more notes...
];

let allUsers = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john@college.edu',
        course: 'CSE',
        joinDate: '2023-08-15',
        status: 'active',
        uploads: 24
    },
    {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@college.edu',
        course: 'CSE',
        joinDate: '2023-09-10',
        status: 'active',
        uploads: 18
    },
    // Add more users...
];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminDashboard();
    loadPendingItems();
    loadAllNotes();
    loadAllUsers();
    initializeCharts();
});

// Initialize Dashboard
function initializeAdminDashboard() {
    document.getElementById('pendingCount').textContent = adminData.pendingCount;
    document.getElementById('totalNotes').textContent = adminData.totalNotes;
    document.getElementById('totalUsers').textContent = adminData.totalUsers;
    document.getElementById('totalDownloads').textContent = adminData.totalDownloads.toLocaleString();
}

// Tab Management
function showTab(tabId) {
    // Hide all tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabId}-tab`).classList.add('active');
    
    // Add active class to clicked tab button
    event.target.classList.add('active');
    
    // Refresh data if needed
    switch(tabId) {
        case 'pending':
            loadPendingItems();
            break;
        case 'notes':
            loadAllNotes();
            break;
        case 'users':
            loadAllUsers();
            break;
        case 'reports':
            updateCharts();
            loadTopContributors();
            break;
    }
}

// Load Pending Items
function loadPendingItems(filter = 'all') {
    const container = document.getElementById('pendingContainer');
    let filteredItems = pendingItems;
    
    if (filter !== 'all') {
        filteredItems = pendingItems.filter(item => item.course === filter);
    }
    
    if (filteredItems.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle fa-3x"></i>
                <h3>No pending approvals</h3>
                <p>All notes have been reviewed!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredItems.map(item => `
        <div class="pending-item">
            <div class="pending-header">
                <div class="pending-title">${item.title}</div>
                <span class="pending-course">${item.course}</span>
            </div>
            
            <div class="pending-details">
                <div class="pending-detail">
                    <span class="detail-label">Uploaded By</span>
                    <span class="detail-value">${item.uploadedBy}</span>
                </div>
                <div class="pending-detail">
                    <span class="detail-label">Upload Date</span>
                    <span class="detail-value">${item.uploadDate}</span>
                </div>
                <div class="pending-detail">
                    <span class="detail-label">File Type</span>
                    <span class="detail-value">${item.fileType.toUpperCase()}</span>
                </div>
                <div class="pending-detail">
                    <span class="detail-label">File Size</span>
                    <span class="detail-value">${item.fileSize}</span>
                </div>
            </div>
            
            <div class="pending-tags">
                ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            
            <div class="pending-actions">
                <button class="preview-btn" onclick="previewNote(${item.id})">
                    <i class="fas fa-eye"></i> Preview & Review
                </button>
                <button class="btn btn-success" onclick="approveNote(${item.id})">
                    <i class="fas fa-check"></i> Approve
                </button>
                <button class="btn btn-danger" onclick="rejectNote(${item.id})">
                    <i class="fas fa-times"></i> Reject
                </button>
            </div>
        </div>
    `).join('');
}

function filterPending() {
    const filter = document.getElementById('pendingFilter').value;
    loadPendingItems(filter);
}

// Load All Notes
function loadAllNotes(searchTerm = '') {
    const tbody = document.getElementById('notesTableBody');
    let filteredNotes = allNotes;
    
    if (searchTerm) {
        filteredNotes = allNotes.filter(note =>
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    if (filteredNotes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div class="empty-state">
                        <i class="fas fa-search fa-3x"></i>
                        <h3>No notes found</h3>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredNotes.map(note => `
        <tr>
            <td>#${note.id}</td>
            <td>${note.title}</td>
            <td><span class="badge badge-success">${note.course}</span></td>
            <td>${note.uploadedBy}</td>
            <td>${note.uploadDate}</td>
            <td>${getStatusBadge(note.status)}</td>
            <td>${note.downloads}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewNote(${note.id})" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="editNote(${note.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteNote(${note.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function searchNotesAdmin() {
    const searchTerm = document.getElementById('searchNotesAdmin').value;
    loadAllNotes(searchTerm);
}

// Load All Users
function loadAllUsers() {
    const tbody = document.getElementById('usersTableBody');
    
    tbody.innerHTML = allUsers.map(user => `
        <tr>
            <td>#${user.id}</td>
            <td>
                <div class="user-info-cell">
                    <img src="https://via.placeholder.com/40" class="user-avatar" alt="${user.name}">
                    <div>
                        <div>${user.name}</div>
                        <small>${user.email}</small>
                    </div>
                </div>
            </td>
            <td><span class="badge badge-success">${user.course}</span></td>
            <td>${user.joinDate}</td>
            <td><span class="badge badge-success">${user.status}</span></td>
            <td>${user.uploads}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewUser(${user.id})" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="editUser(${user.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteUser(${user.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Note Management
let currentNoteId = null;

function previewNote(noteId) {
    currentNoteId = noteId;
    const note = pendingItems.find(item => item.id === noteId);
    
    if (note) {
        const previewContent = document.getElementById('previewContent');
        previewContent.innerHTML = `
            <h3>${note.title}</h3>
            <div class="preview-meta">
                <p><strong>Course:</strong> ${note.course}</p>
                <p><strong>Uploaded By:</strong> ${note.uploadedBy}</p>
                <p><strong>Upload Date:</strong> ${note.uploadDate}</p>
                <p><strong>File Type:</strong> ${note.fileType}</p>
                <p><strong>File Size:</strong> ${note.fileSize}</p>
            </div>
            <div class="preview-description">
                <h4>Description:</h4>
                <p>${note.description}</p>
            </div>
            <div class="preview-tags">
                <h4>Tags:</h4>
                <div>${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
            </div>
            <div class="preview-file">
                <h4>File Preview:</h4>
                <div class="file-preview">
                    <i class="fas fa-file-pdf fa-5x"></i>
                    <p>Preview of uploaded file would appear here</p>
                </div>
            </div>
        `;
        
        openModal('previewModal');
    }
}

function approveNote(noteId = null) {
    const id = noteId || currentNoteId;
    if (id) {
        // Remove from pending
        pendingItems = pendingItems.filter(item => item.id !== id);
        
        // Add to approved notes
        const note = pendingItems.find(item => item.id === id);
        if (note) {
            allNotes.push({
                id: allNotes.length + 1,
                title: note.title,
                course: note.course,
                uploadedBy: note.uploadedBy,
                uploadDate: new Date().toISOString().split('T')[0],
                status: 'approved',
                downloads: 0
            });
        }
        
        // Update counts
        adminData.pendingCount--;
        adminData.totalNotes++;
        
        showNotification('Note approved successfully!', 'success');
        closeModal('previewModal');
        initializeAdminDashboard();
        loadPendingItems();
        loadAllNotes();
    }
}

function rejectNote(noteId = null) {
    const id = noteId || currentNoteId;
    if (id) {
        pendingItems = pendingItems.filter(item => item.id !== id);
        adminData.pendingCount--;
        
        showNotification('Note rejected and removed from pending.', 'warning');
        closeModal('previewModal');
        initializeAdminDashboard();
        loadPendingItems();
    }
}

function editNote(noteId) {
    const note = allNotes.find(n => n.id === noteId);
    if (note) {
        document.getElementById('editTitle').value = note.title;
        document.getElementById('editCourse').value = note.course;
        document.getElementById('editStatus').value = note.status;
        currentNoteId = noteId;
        openModal('editNoteModal');
    }
}

function deleteNote(noteId) {
    if (confirm('Are you sure you want to delete this note?')) {
        allNotes = allNotes.filter(note => note.id !== noteId);
        adminData.totalNotes--;
        
        showNotification('Note deleted successfully!', 'success');
        initializeAdminDashboard();
        loadAllNotes();
    }
}

// User Management
function addNewUser() {
    openModal('addUserModal');
}

function viewUser(userId) {
    showNotification(`Viewing user ${userId}`, 'info');
}

function editUser(userId) {
    showNotification(`Editing user ${userId}`, 'warning');
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        allUsers = allUsers.filter(user => user.id !== userId);
        adminData.totalUsers--;
        
        showNotification('User deleted successfully!', 'success');
        initializeAdminDashboard();
        loadAllUsers();
    }
}

// Course Management
function addNewCourse() {
    showNotification('Add new course functionality', 'info');
}

function editCourse(courseId) {
    showNotification(`Editing course ${courseId}`, 'warning');
}

function deleteCourse(courseId) {
    if (confirm(`Are you sure you want to delete ${courseId} course?`)) {
        showNotification(`Course ${courseId} deleted`, 'success');
    }
}

// Charts and Reports
let courseChart, growthChart;

function initializeCharts() {
    // Course Chart
    const courseCtx = document.getElementById('courseChart').getContext('2d');
    courseChart = new Chart(courseCtx, {
        type: 'doughnut',
        data: {
            labels: ['CSE', 'ECE', 'ME', 'CE', 'EE'],
            datasets: [{
                data: [45, 25, 15, 10, 5],
                backgroundColor: [
                    '#FF6F00',
                    '#2196F3',
                    '#4CAF50',
                    '#9C27B0',
                    '#FF9800'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Growth Chart
    const growthCtx = document.getElementById('growthChart').getContext('2d');
    growthChart = new Chart(growthCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'New Notes',
                data: [12, 19, 15, 25, 22, 30],
                borderColor: '#FF6F00',
                backgroundColor: 'rgba(255, 111, 0, 0.1)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateCharts() {
    // Update chart data here if needed
    courseChart.update();
    growthChart.update();
}

function loadTopContributors() {
    const container = document.getElementById('contributorsList');
    
    const topContributors = allUsers
        .sort((a, b) => b.uploads - a.uploads)
        .slice(0, 5);
    
    container.innerHTML = topContributors.map(user => `
        <div class="contributor-item">
            <img src="https://via.placeholder.com/50" alt="${user.name}" class="contributor-avatar">
            <div class="contributor-info">
                <div class="contributor-name">${user.name}</div>
                <div class="contributor-course">${user.course}</div>
            </div>
            <div class="contributor-stats">
                <div class="upload-count">${user.uploads}</div>
                <div class="upload-label">Uploads</div>
            </div>
        </div>
    `).join('');
}

function generateReport() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        showNotification('Please select both start and end dates', 'error');
        return;
    }
    
    showNotification(`Generating report from ${startDate} to ${endDate}...`, 'warning');
    // Generate report logic here
}

// Utility Functions
function getStatusBadge(status) {
    const badges = {
        'approved': '<span class="badge badge-success">Approved</span>',
        'pending': '<span class="badge badge-pending">Pending</span>',
        'rejected': '<span class="badge badge-rejected">Rejected</span>'
    };
    return badges[status] || '';
}

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    currentNoteId = null;
}

function showNotification(message, type = 'info') {
    const notificationArea = document.getElementById('notificationArea');
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    notificationArea.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function logout() {
    showNotification('Logging out...', 'warning');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Form Submissions
document.getElementById('editNoteForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    if (currentNoteId) {
        const note = allNotes.find(n => n.id === currentNoteId);
        if (note) {
            note.title = document.getElementById('editTitle').value;
            note.course = document.getElementById('editCourse').value;
            note.status = document.getElementById('editStatus').value;
            
            showNotification('Note updated successfully!', 'success');
            closeModal('editNoteModal');
            loadAllNotes();
        }
    }
});

document.getElementById('addUserForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const newUser = {
        id: allUsers.length + 1,
        name: this.querySelector('input[type="text"]').value,
        email: this.querySelector('input[type="email"]').value,
        course: this.querySelector('select').value,
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active',
        uploads: 0
    };
    
    allUsers.push(newUser);
    adminData.totalUsers++;
    
    showNotification('User added successfully!', 'success');
    closeModal('addUserModal');
    initializeAdminDashboard();
    loadAllUsers();
    this.reset();
});