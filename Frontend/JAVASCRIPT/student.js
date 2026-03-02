// Student Profile JavaScript
const API_BASE = "http://localhost:5000/api";
const token = localStorage.getItem("jwt");

// redirect if not logged in
if (!token) {
    window.location.href = "index.html";
}

// live data containers
let currentStudent = null;
let myUploads = [];
let availableNotes = [];

// ==========================
// 🚀 DOM READY
// ==========================
document.addEventListener('DOMContentLoaded', function () {
    // Check authentication first
    if (!token) {
        window.location.href = "index.html";
        return;
    }

    // LOAD REAL BACKEND DATA
    loadStudentFromBackend();
    loadUploadsFromBackend();
    loadAvailableNotesFromBackend();

    // File upload handling
    const fileUploadInput = document.getElementById('fileUpload');
    if (fileUploadInput) {
        fileUploadInput.addEventListener('change', handleFileSelect);
    }

    // Drag and drop for file upload
    const fileUploadArea = document.getElementById('fileUploadArea');
    if (fileUploadArea) {
        fileUploadArea.addEventListener('dragover', handleDragOver);
        fileUploadArea.addEventListener('drop', handleFileDrop);
    }

    // Form submissions
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(event) {
            event.preventDefault();
            uploadNotes(event);
        });
    }

    const updateProfileForm = document.getElementById('updateProfileForm');
    if (updateProfileForm) {
        updateProfileForm.addEventListener('submit', function(event) {
            event.preventDefault();
            updateProfile(event);
        });
    }

    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(event) {
            event.preventDefault();
            changePassword(event);
        });
    }

    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', function(event) {
            event.preventDefault();
            updateProfileViaModal(event);
        });
    }

    // Password strength checker
    const signupPassword = document.getElementById('signup-password');
    if (signupPassword) {
        signupPassword.addEventListener('input', checkPasswordStrength);
    }

    // Profile picture upload
    const newProfilePic = document.getElementById('newProfilePic');
    if (newProfilePic) {
        newProfilePic.addEventListener('change', handleProfilePictureChange);
    }
});

// ==========================
// 👤 FETCH STUDENT PROFILE (BACKEND)
// ==========================
async function loadStudentFromBackend() {
    try {
        const res = await fetch(`${API_BASE}/student/profile`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (res.status === 401) {
            // Token expired or invalid
            localStorage.removeItem("jwt");
            showNotification("Session expired — please login again", "error");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000);
            return;
        }

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        currentStudent = await res.json();

        // fill all existing UI places
        initializeStudentProfileFromBackend();

    } catch (err) {
        console.error("Error loading student profile:", err);
        showNotification("Failed to load profile. Please try again.", "error");
    }
}

// map backend student object → your UI
function initializeStudentProfileFromBackend() {
    if (!currentStudent) return;

    // Update header
    const studentNameElement = document.getElementById('studentName');
    const studentCourseElement = document.getElementById('studentCourse');
    const profilePicElement = document.getElementById('profilePic');
    
    if (studentNameElement) studentNameElement.textContent = currentStudent.name || "Student";
    if (studentCourseElement) studentCourseElement.textContent = currentStudent.course || "N/A";
    if (profilePicElement) profilePicElement.src = currentStudent.profilePic || "https://via.placeholder.com/150";

    // Update profile section
    const displayNameElement = document.getElementById('displayName');
    const displayEmailElement = document.getElementById('displayEmail');
    const displayCourseElement = document.getElementById('displayCourse');
    const studentIdElement = document.getElementById('studentId');
    const contactNumberElement = document.getElementById('contactNumber');
    const joinDateElement = document.getElementById('joinDate');
    const totalUploadsElement = document.getElementById('totalUploads');
    const approvedNotesElement = document.getElementById('approvedNotes');

    if (displayNameElement) displayNameElement.textContent = currentStudent.name || "Student";
    if (displayEmailElement) displayEmailElement.textContent = currentStudent.email || "N/A";
    if (displayCourseElement) {
        displayCourseElement.textContent = `${currentStudent.course || "N/A"} - ${currentStudent.year || "N/A"}`;
    }
    if (studentIdElement) studentIdElement.textContent = currentStudent.studentId || currentStudent._id || "N/A";
    if (contactNumberElement) contactNumberElement.textContent = currentStudent.contact || "N/A";
    if (joinDateElement) {
        joinDateElement.textContent = currentStudent.createdAt ? 
            new Date(currentStudent.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }) : "N/A";
    }
    if (totalUploadsElement) totalUploadsElement.textContent = currentStudent.totalUploads || 0;
    if (approvedNotesElement) approvedNotesElement.textContent = currentStudent.approvedNotes || 0;

    // Update stats
    const totalUploadsStatElement = document.getElementById('totalUploadsStat');
    const pendingStatElement = document.getElementById('pendingStat');
    const approvedStatElement = document.getElementById('approvedStat');
    const rejectedStatElement = document.getElementById('rejectedStat');

    if (totalUploadsStatElement) totalUploadsStatElement.textContent = currentStudent.totalUploads || 0;
    if (pendingStatElement) pendingStatElement.textContent = currentStudent.pendingNotes || 0;
    if (approvedStatElement) approvedStatElement.textContent = currentStudent.approvedNotes || 0;
    if (rejectedStatElement) rejectedStatElement.textContent = currentStudent.rejectedNotes || 0;

    // Update progress bar
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.progress-container span');
    if (progressBar && progressText) {
        const total = currentStudent.totalUploads || 0;
        const approved = currentStudent.approvedNotes || 0;
        const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
        progressBar.style.width = `${approvalRate}%`;
        progressText.textContent = `${approvalRate}% Approval Rate`;
    }

    // Fill edit form if exists
    const editNameInput = document.getElementById('editName');
    const editContactInput = document.getElementById('editContact');
    if (editNameInput && currentStudent.name) editNameInput.value = currentStudent.name;
    if (editContactInput && currentStudent.contact) editContactInput.value = currentStudent.contact;
}

// ==========================
// 📥 LOAD MY UPLOADS (BACKEND)
// ==========================
async function loadUploadsFromBackend(filter = "all") {
    try {
        const res = await fetch(`${API_BASE}/student/uploads`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        myUploads = await res.json();
        loadMyUploads(filter); // Call the UI rendering function

    } catch (err) {
        console.error("Error loading uploads:", err);
        myUploads = [];
        loadMyUploads("all");
        showNotification("Failed to load uploads", "error");
    }
}

// UI function to display uploads
function loadMyUploads(filter = 'all') {
    const container = document.getElementById('uploadsContainer');
    if (!container) return;

    let filteredUploads = myUploads;
    
    if (filter !== 'all') {
        filteredUploads = myUploads.filter(upload => upload.status === filter);
    }
    
    if (filteredUploads.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-upload fa-3x"></i>
                <h3>No uploads found</h3>
                <p>${filter === 'all' ? 'You haven\'t uploaded any notes yet.' : `No ${filter} uploads found.`}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredUploads.map(upload => `
        <div class="upload-item">
            <div class="upload-icon">
                <i class="fas fa-${getFileIcon(upload.type || upload.fileType)}"></i>
            </div>
            <div class="upload-details">
                <h4>${upload.title}</h4>
                <div class="upload-meta">
                    <span><i class="fas fa-book"></i> ${upload.subject || 'N/A'}</span>
                    <span><i class="fas fa-file"></i> ${(upload.type || upload.fileType || 'N/A').toUpperCase()}</span>
                    <span><i class="fas fa-calendar"></i> ${new Date(upload.uploadedDate || upload.createdAt).toLocaleDateString()}</span>
                    <span><i class="fas fa-weight-hanging"></i> ${upload.fileSize || 'N/A'}</span>
                </div>
                <div class="upload-tags">
                    ${(upload.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
            <div class="upload-status">
                ${getStatusBadge(upload.status)}
            </div>
        </div>
    `).join('');
}

function filterUploads() {
    const filter = document.getElementById('uploadFilter')?.value || 'all';
    loadMyUploads(filter);
}

function getFileIcon(fileType) {
    if (!fileType) return 'file';
    
    const typeMap = {
        'pdf': 'file-pdf',
        'image': 'file-image',
        'jpg': 'file-image',
        'jpeg': 'file-image',
        'png': 'file-image',
        'ppt': 'file-powerpoint',
        'pptx': 'file-powerpoint',
        'doc': 'file-word',
        'docx': 'file-word',
        'video': 'file-video',
        'mp4': 'file-video'
    };
    
    const ext = fileType.toLowerCase().split('/').pop();
    return typeMap[ext] || 'file';
}

function getStatusBadge(status) {
    const badges = {
        'pending': '<span class="badge badge-pending">Pending</span>',
        'approved': '<span class="badge badge-success">Approved</span>',
        'rejected': '<span class="badge badge-rejected">Rejected</span>'
    };
    return badges[status] || '<span class="badge">Unknown</span>';
}

// ==========================
// 🌍 LOAD PUBLIC NOTES
// ==========================
async function loadAvailableNotesFromBackend() {
    try {
        const res = await fetch(`${API_BASE}/notes/all`);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        availableNotes = Array.isArray(data) ? data : [];
        loadAvailableNotes();

    } catch (err) {
        console.error("Error loading available notes:", err);
        availableNotes = [];
        loadAvailableNotes();
        showNotification("Failed to load notes", "error");
    }
}

function loadAvailableNotes(searchTerm = '', courseFilter = '', typeFilter = '') {
    const container = document.getElementById('notesContainer');
    if (!container) return;

    let filteredNotes = availableNotes;
    
    if (searchTerm) {
        filteredNotes = filteredNotes.filter(note =>
            note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (note.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }
    
    if (courseFilter) {
        filteredNotes = filteredNotes.filter(note => note.course === courseFilter);
    }
    
    if (typeFilter) {
        filteredNotes = filteredNotes.filter(note => note.type === typeFilter);
    }
    
    if (filteredNotes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search fa-3x"></i>
                <h3>No notes found</h3>
                <p>${searchTerm || courseFilter || typeFilter ? 'Try adjusting your search or filters' : 'No notes available yet'}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredNotes.map(note => `
        <div class="note-card">
            <div class="note-header">
                <div>
                    <h4>${note.title || 'Untitled'}</h4>
                    <p class="note-category">${note.subject || 'N/A'} • ${note.course || 'General'}</p>
                </div>
                <div class="note-icon">
                    <i class="fas fa-${getFileIcon(note.type)}"></i>
                </div>
            </div>
            <div class="note-body">
                <p class="note-description">${note.description || 'No description available.'}</p>
                <div class="note-tags">
                    ${(note.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="note-footer">
                    <div class="author-info">
                        <img src="${note.authorProfilePic || 'https://via.placeholder.com/30'}" alt="Author" class="author-pic">
                        <span>${note.authorName || note.uploadedBy || 'Unknown'}</span>
                    </div>
                    <div class="note-actions">
                        <button onclick="downloadNote('${note._id || note.id}')" title="Download">
                            <i class="fas fa-download"></i>
                        </button>
                        <button onclick="viewNote('${note._id || note.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function searchNotes() {
    const searchTerm = document.getElementById('searchNotes')?.value || '';
    loadAvailableNotes(searchTerm);
}

function filterByCourse() {
    const courseFilter = document.getElementById('courseFilter')?.value || '';
    loadAvailableNotes('', courseFilter);
}

function filterByType() {
    const typeFilter = document.getElementById('typeFilter')?.value || '';
    loadAvailableNotes('', '', typeFilter);
}

async function downloadNote(noteId) {
    try {
        showNotification('Preparing download...', 'warning');
        
        const res = await fetch(`${API_BASE}/notes/download/${noteId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) {
            throw new Error('Download failed');
        }
        
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `note_${noteId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showNotification('Download started!', 'success');
        
    } catch (err) {
        console.error("Download error:", err);
        showNotification('Download failed', 'error');
    }
}

function viewNote(noteId) {
    showNotification('Opening note details...', 'info');
    // TODO: Implement note detail view
    // window.open(`${API_BASE}/notes/view/${noteId}`, '_blank');
}

// ==========================
// 📤 UPLOAD NOTES TO BACKEND
// ==========================
async function uploadNotes(event) {
    event.preventDefault();

    const file = document.getElementById("fileUpload").files[0];
    if (!file) {
        showNotification("Please select a file", "error");
        return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showNotification("File size should be less than 10MB", "error");
        return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.ms-powerpoint', 
                         'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                         'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                         'video/mp4'];
    if (!allowedTypes.includes(file.type)) {
        showNotification("File type not supported. Please upload PDF, Image, PPT, DOC, or MP4 files.", "error");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", document.getElementById("noteTitle").value);
    formData.append("subject", document.getElementById("noteSubject").value);
    formData.append("description", document.getElementById("noteDescription").value);
    formData.append("type", document.getElementById("noteType").value);
    formData.append("category", document.getElementById("noteCategory").value);
    
    const tags = document.getElementById("tags").value;
    if (tags) {
        formData.append("tags", tags);
    }

    showNotification("Uploading... Please wait.", "warning");

    try {
        const res = await fetch(`${API_BASE}/student/upload`, {
            method: "POST",
            headers: { 
                'Authorization': `Bearer ${token}`
                // Note: Don't set Content-Type for FormData, browser sets it automatically
            },
            body: formData
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Upload failed');
        }

        const data = await res.json();

        showNotification("Uploaded successfully — waiting for admin approval", "success");

        // Refresh data
        loadUploadsFromBackend();
        loadStudentFromBackend();
        loadAvailableNotesFromBackend();

        clearForm();
        showSection('my-uploads');

    } catch (err) {
        console.error("Upload error:", err);
        showNotification(err.message || "Upload failed. Please try again.", "error");
    }
}

function clearForm() {
    const form = document.getElementById('uploadForm');
    if (form) form.reset();
    
    const fileInfo = document.getElementById('fileInfo');
    if (fileInfo) {
        fileInfo.style.display = 'none';
        fileInfo.innerHTML = '';
    }
}

// ==========================
// 📁 FILE HANDLING FUNCTIONS
// ==========================
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        displayFileInfo(file);
    }
}

function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    const fileUploadArea = document.getElementById('fileUploadArea');
    if (fileUploadArea) {
        fileUploadArea.style.borderColor = '#ff6f00';
        fileUploadArea.style.background = 'rgba(255, 111, 0, 0.05)';
    }
}

function handleFileDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer.files[0];
    if (file) {
        document.getElementById('fileUpload').files = event.dataTransfer.files;
        displayFileInfo(file);
    }
    
    const fileUploadArea = document.getElementById('fileUploadArea');
    if (fileUploadArea) {
        fileUploadArea.style.borderColor = '#e0e0e0';
        fileUploadArea.style.background = 'transparent';
    }
}

function displayFileInfo(file) {
    const fileInfo = document.getElementById('fileInfo');
    if (!fileInfo) return;

    const fileSize = (file.size / (1024 * 1024)).toFixed(2);
    
    fileInfo.innerHTML = `
        <div>
            <strong>Selected File:</strong> ${file.name}<br>
            <strong>Size:</strong> ${fileSize} MB<br>
            <strong>Type:</strong> ${file.type || file.name.split('.').pop().toUpperCase()}
        </div>
    `;
    fileInfo.style.display = 'block';
}

// ==========================
// 👤 PROFILE MANAGEMENT
// ==========================
async function updateProfile(event) {
    event.preventDefault();
    
    const name = document.getElementById('updateName')?.value;
    const contact = document.getElementById('updateContact')?.value;
    
    if (!name) {
        showNotification("Name is required", "error");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/student/profile`, {
            method: "PUT",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, contact })
        });

        if (!res.ok) {
            throw new Error('Update failed');
        }

        const data = await res.json();
        currentStudent = data.user;
        
        // Update UI
        initializeStudentProfileFromBackend();
        showNotification("Profile updated successfully!", "success");

    } catch (err) {
        console.error("Update error:", err);
        showNotification("Failed to update profile", "error");
    }
}

async function updateProfileViaModal(event) {
    event.preventDefault();
    
    const name = document.getElementById('editName')?.value;
    const contact = document.getElementById('editContact')?.value;
    
    if (!name) {
        showNotification("Name is required", "error");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/student/profile`, {
            method: "PUT",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, contact })
        });

        if (!res.ok) {
            throw new Error('Update failed');
        }

        const data = await res.json();
        currentStudent = data.user;
        
        // Update UI
        initializeStudentProfileFromBackend();
        closeModal('editProfileModal');
        showNotification("Profile updated successfully!", "success");

    } catch (err) {
        console.error("Update error:", err);
        showNotification("Failed to update profile", "error");
    }
}

async function changePassword(event) {
    event.preventDefault();
    
    const currentPass = document.getElementById('currentPassword')?.value;
    const newPass = document.getElementById('newPassword')?.value;
    const confirmPass = document.getElementById('confirmPassword')?.value;
    
    if (!currentPass || !newPass || !confirmPass) {
        showNotification("Please fill all password fields", "error");
        return;
    }
    
    if (newPass !== confirmPass) {
        showNotification("New passwords do not match", "error");
        return;
    }
    
    if (newPass.length < 6) {
        showNotification("Password must be at least 6 characters long", "error");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/student/change-password`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass })
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Password change failed');
        }

        document.getElementById('changePasswordForm').reset();
        showNotification("Password changed successfully!", "success");

    } catch (err) {
        console.error("Password change error:", err);
        showNotification(err.message || "Failed to change password", "error");
    }
}

function handleProfilePictureChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        showNotification('File size should be less than 5MB', 'error');
        return;
    }
    
    if (!file.type.startsWith('image/')) {
        showNotification('Please select an image file', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = document.getElementById('currentProfilePic');
        if (img) img.src = e.target.result;
        
        if (currentStudent) {
            currentStudent.profilePic = e.target.result;
        }
        
        const profilePic = document.getElementById('profilePic');
        if (profilePic) profilePic.src = e.target.result;
        
        showNotification('Profile picture updated successfully!', 'success');
        
        // You might want to upload the picture to backend here
        // uploadProfilePicture(file);
    };
    reader.readAsDataURL(file);
}

async function uploadProfilePicture(file) {
    const formData = new FormData();
    formData.append("profilePic", file);

    try {
        const res = await fetch(`${API_BASE}/student/profile-picture`, {
            method: "POST",
            headers: { 
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!res.ok) {
            throw new Error('Profile picture upload failed');
        }

        const data = await res.json();
        showNotification('Profile picture saved to server!', 'success');

    } catch (err) {
        console.error("Profile picture upload error:", err);
        showNotification("Failed to save profile picture to server", "error");
    }
}

// ==========================
// 📊 UPDATE STATS
// ==========================
function updateStats() {
    if (!myUploads.length) return;
    
    const pending = myUploads.filter(u => u.status === 'pending').length;
    const approved = myUploads.filter(u => u.status === 'approved').length;
    const rejected = myUploads.filter(u => u.status === 'rejected').length;
    const total = myUploads.length;
    
    // Update UI elements
    const totalUploadsStatElement = document.getElementById('totalUploadsStat');
    const pendingStatElement = document.getElementById('pendingStat');
    const approvedStatElement = document.getElementById('approvedStat');
    const rejectedStatElement = document.getElementById('rejectedStat');
    
    if (totalUploadsStatElement) totalUploadsStatElement.textContent = total;
    if (pendingStatElement) pendingStatElement.textContent = pending;
    if (approvedStatElement) approvedStatElement.textContent = approved;
    if (rejectedStatElement) rejectedStatElement.textContent = rejected;
    
    // Update progress bar
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.progress-container span');
    if (progressBar && progressText) {
        const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
        progressBar.style.width = `${approvalRate}%`;
        progressText.textContent = `${approvalRate}% Approval Rate`;
    }
}

// ==========================
// 🔧 UTILITY FUNCTIONS
// ==========================
// Show/Hide Sections
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) targetSection.classList.add('active');
    
    // Add active class to clicked nav item
    const navItem = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (navItem) navItem.classList.add('active');
    
    // Scroll to top of section
    if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Edit Profile Modal
function editProfile() {
    openModal('editProfileModal');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'flex';
}

// Notifications
function showNotification(message, type = 'info') {
    const notificationArea = document.getElementById('notificationArea');
    if (!notificationArea) return;

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    notificationArea.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }
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

// Password Strength Checker
function checkPasswordStrength() {
    const password = this.value;
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    
    if (!strengthBar || !strengthText) return;

    let strength = 0;
    
    // Check criteria
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    // Update UI
    const width = strength * 25;
    strengthBar.style.width = width + '%';
    
    const colors = ['#ff4444', '#ff8800', '#ffcc00', '#99ff00', '#33cc33'];
    const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    
    strengthBar.style.background = colors[strength] || colors[0];
    strengthText.textContent = texts[strength] || 'Very Weak';
    strengthText.style.color = colors[strength] || colors[0];
}

// ==========================
// 🔐 LOGOUT
// ==========================
function logout() {
    showNotification('Logging out...', 'warning');
    
    // Clear local storage
    localStorage.removeItem("jwt");
    sessionStorage.clear();
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Add CSS for notification animation if not exists
if (!document.querySelector('#notificationStyle')) {
    const style = document.createElement('style');
    style.id = 'notificationStyle';
    style.textContent = `
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}