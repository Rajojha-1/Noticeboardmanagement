// API Base URL
const API_URL = 'http://localhost:8081/notices';

// State
let editingId = null;
let allNotices = []; // Store all notices for filtering

// DOM Elements
const noticeForm = document.getElementById('noticeForm');
const noticeTitleInput = document.getElementById('noticeTitle');
const noticeDescriptionInput = document.getElementById('noticeDescription');
const noticesGrid = document.getElementById('noticesGrid');
const emptyState = document.getElementById('emptyState');
const totalNoticesEl = document.getElementById('totalNotices');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const refreshBtn = document.getElementById('refreshBtn');
const toast = document.getElementById('toast');
const toastIcon = document.getElementById('toastIcon');
const toastMessage = document.getElementById('toastMessage');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadNotices();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    noticeForm.addEventListener('submit', handleSubmit);
    cancelBtn.addEventListener('click', resetForm);
    refreshBtn.addEventListener('click', () => {
        refreshBtn.classList.add('loading');
        loadNotices();
    });

    // Search functionality
    searchInput.addEventListener('input', handleSearch);
    clearSearchBtn.addEventListener('click', clearSearch);
}

// Load all notices
async function loadNotices() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch notices');

        const notices = await response.json();
        allNotices = notices; // Store for filtering
        displayNotices(notices);
        updateStats(notices.length);
        refreshBtn.classList.remove('loading');
    } catch (error) {
        console.error('Error loading notices:', error);
        showToast('Failed to load notices', 'error');
        refreshBtn.classList.remove('loading');
    }
}

// Display notices in grid
function displayNotices(notices) {
    if (notices.length === 0) {
        noticesGrid.style.display = 'none';
        emptyState.classList.add('show');
        return;
    }

    noticesGrid.style.display = 'grid';
    emptyState.classList.remove('show');

    noticesGrid.innerHTML = notices.map(notice => `
        <div class="notice-card">
            <div class="notice-header">
                <div class="notice-id">ID: ${notice.id}</div>
            </div>
            <h3 class="notice-title">${escapeHtml(notice.title)}</h3>
            <div class="notice-description">${escapeHtml(notice.description)}</div>
            <div class="notice-actions">
                <button class="btn-icon btn-edit" onclick="editNotice(${notice.id})">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M11.333 2.00004C11.5081 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.4187 1.44775 12.6663 1.44775C12.914 1.44775 13.1592 1.49653 13.3879 1.59129C13.6167 1.68605 13.8246 1.82494 13.9997 2.00004C14.1748 2.17513 14.3137 2.383 14.4084 2.61178C14.5032 2.84055 14.552 3.08575 14.552 3.33337C14.552 3.58099 14.5032 3.82619 14.4084 4.05497C14.3137 4.28374 14.1748 4.49161 13.9997 4.66671L5.33301 13.3334L1.33301 14.6667L2.66634 10.6667L11.333 2.00004Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Edit
                </button>
                <button class="btn-icon btn-delete" onclick="deleteNotice(${notice.id})">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 4H3.33333H14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M5.33301 4.00004V2.66671C5.33301 2.31309 5.47348 1.97395 5.72353 1.7239C5.97358 1.47385 6.31272 1.33337 6.66634 1.33337H9.33301C9.68663 1.33337 10.0258 1.47385 10.2758 1.7239C10.5259 1.97395 10.6663 2.31309 10.6663 2.66671V4.00004M12.6663 4.00004V13.3334C12.6663 13.687 12.5259 14.0261 12.2758 14.2762C12.0258 14.5262 11.6866 14.6667 11.333 14.6667H4.66634C4.31272 14.6667 3.97358 14.5262 3.72353 14.2762C3.47348 14.0261 3.33301 13.687 3.33301 13.3334V4.00004H12.6663Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();

    const noticeData = {
        title: noticeTitleInput.value.trim(),
        description: noticeDescriptionInput.value.trim()
    };

    try {
        if (editingId) {
            // Update existing notice
            const response = await fetch(`${API_URL}/${editingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(noticeData)
            });

            if (!response.ok) throw new Error('Failed to update notice');
            showToast('Notice updated successfully!', 'success');
        } else {
            // Create new notice
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(noticeData)
            });

            if (!response.ok) throw new Error('Failed to create notice');
            showToast('Notice added successfully!', 'success');
        }

        resetForm();
        loadNotices();
    } catch (error) {
        console.error('Error saving notice:', error);
        showToast('Failed to save notice', 'error');
    }
}

// Edit notice
async function editNotice(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch notice');

        const notice = await response.json();

        editingId = id;
        noticeTitleInput.value = notice.title;
        noticeDescriptionInput.value = notice.description;
        formTitle.textContent = 'Edit Notice';
        submitBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M14.166 2.5C14.3849 2.28113 14.6447 2.10752 14.9307 1.98906C15.2167 1.87061 15.5232 1.80969 15.8327 1.80969C16.1422 1.80969 16.4487 1.87061 16.7347 1.98906C17.0206 2.10752 17.2805 2.28113 17.4993 2.5C17.7182 2.71887 17.8918 2.97871 18.0103 3.26468C18.1287 3.55064 18.1897 3.85714 18.1897 4.16667C18.1897 4.47619 18.1287 4.78269 18.0103 5.06866C17.8918 5.35462 17.7182 5.61446 17.4993 5.83333L6.24935 17.0833L1.66602 18.3333L2.91602 13.75L14.166 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Update Notice
        `;
        cancelBtn.style.display = 'block';

        // Scroll to form
        document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error loading notice:', error);
        showToast('Failed to load notice', 'error');
    }
}

// Delete notice
async function deleteNotice(id) {
    if (!confirm('Are you sure you want to delete this notice?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete notice');

        showToast('Notice deleted successfully!', 'success');
        loadNotices();
    } catch (error) {
        console.error('Error deleting notice:', error);
        showToast('Failed to delete notice', 'error');
    }
}

// Reset form
function resetForm() {
    editingId = null;
    noticeForm.reset();
    formTitle.textContent = 'Add New Notice';
    submitBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 5V15M5 10H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Add Notice
    `;
    cancelBtn.style.display = 'none';
}

// Update statistics
function updateStats(count) {
    totalNoticesEl.textContent = count;
}

// Show toast notification
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toastIcon.textContent = type === 'success' ? '✓' : '✕';
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Search functionality
function handleSearch(e) {
    const searchTerm = e.target.value.trim().toLowerCase();

    if (searchTerm === '') {
        clearSearchBtn.style.display = 'none';
        displayNotices(allNotices);
        updateStats(allNotices.length);
        return;
    }

    clearSearchBtn.style.display = 'block';

    // Filter notices by ID or title
    const filtered = allNotices.filter(notice => {
        const idMatch = notice.id.toString().includes(searchTerm);
        const titleMatch = notice.title.toLowerCase().includes(searchTerm);
        return idMatch || titleMatch;
    });

    displayNotices(filtered);
    updateStats(filtered.length);

    if (filtered.length === 0) {
        showEmptySearchState();
    }
}

// Clear search
function clearSearch() {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    displayNotices(allNotices);
    updateStats(allNotices.length);
}

// Show empty search state
function showEmptySearchState() {
    noticesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style="margin: 0 auto 1rem;">
                <circle cx="40" cy="40" r="30" fill="#f3f4f6"/>
                <path d="M30 40L50 40M40 30L40 50" stroke="#9ca3af" stroke-width="3" stroke-linecap="round"/>
            </svg>
            <h3 style="color: var(--dark); margin-bottom: 0.5rem;">No notices found</h3>
            <p style="color: var(--gray);">Try a different search term</p>
        </div>
    `;
}
