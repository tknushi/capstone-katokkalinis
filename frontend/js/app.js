// Absolute URL so this works no matter how the frontend static files are
// served (double-clicked, Live Server, XAMPP, etc). Run the backend with
// `php artisan serve` (default port 8000) or update this if you use a
// different host/port.
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8000/api';

/**
 * Resolves a media / storage URL to an absolute web-accessible URL.
 * Handles Laravel /storage paths, base64 data URLs, external HTTP(S) links,
 * and handles mobile local paths gracefully.
 */
function resolveMediaUrl(path) {
    if (!path || typeof path !== 'string') return null;
    const trimmed = path.trim();
    if (!trimmed || trimmed.startsWith('file://')) return null;
    if (trimmed.startsWith('data:image') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
    }
    const host = (window.API_BASE_URL || API_BASE_URL).replace(/\/api\/?$/, '');
    return `${host}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
}
window.resolveMediaUrl = resolveMediaUrl;

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
window.escapeHtml = escapeHtml;

/*
|--------------------------------------------------------------------------
| THEME (LIGHT / DARK MODE)
|--------------------------------------------------------------------------
| Applied as early as possible (before DOMContentLoaded) to avoid a flash
| of the wrong theme. Persisted in localStorage so it sticks across pages.
*/

function applyStoredTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
}

function setTheme(theme) {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
    const current = localStorage.getItem('theme') || 'light';
    setTheme(current === 'dark' ? 'light' : 'dark');
}

applyStoredTheme();

function isAuthPage() {
    const path = (window.location.pathname || '').toLowerCase();
    return path.includes('login.html') || path.endsWith('/login') || path === '/login' || path.endsWith('index.html') || path === '/' || path === '';
}

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('auth_token');
    if (!token && !isAuthPage()) {
        if (window.location.pathname.includes('clenro-reports.html')) {
            return;
        }
        window.location.href = 'login.html';
    }
}


// Perform API request
async function apiRequest(endpoint, method = 'GET', data = null) {
    const token = localStorage.getItem('auth_token');
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers
    };

    if (data && (method !== 'GET' && method !== 'HEAD')) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        // Handle unauthorized
        if (response.status === 401 && !isAuthPage()) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
            return null;
        }


        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'API request failed');
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Logout
function logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Get the current user's role slug, e.g. "super_admin" or "admin".
function getUserRole() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    if (Array.isArray(user.roles) && user.roles.length > 0) {
        return user.roles[0].name;
    }
    return user.role || null;
}

// There are only 2 roles on the web dashboard: Super Admin and
// Admin (a.k.a. Barangay Admin — same account/role, just a friendlier label).
function getRoleDisplayName(role) {
    if (role === 'super_admin') return 'Super Admin';
    if (role === 'admin') return 'Barangay Admin';
    return role || 'User';
}

// Where each role should land after logging in / when visiting "home".
function getHomePage(role) {
    return role === 'super_admin' ? 'analytics.html' : 'barangay-overview.html';
}

function loadSidebar() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const role = getUserRole();
    const isSuperAdmin = role === 'super_admin';
    const roleLabel = getRoleDisplayName(role);

    let links = '';

    // SVG icon helper
    const icon = (path, extra = '') => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;" ${extra}>${path}</svg>`;

    if (isSuperAdmin) {
        // Super Admin module — matches Figure 3.0 Flowchart Super Admin
        links += `<a href="analytics.html" class="nav-link" id="nav-analytics">${icon('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>')}Dashboard Analytics</a>`;
        links += `<a href="trucks.html" class="nav-link" id="nav-trucks">${icon('<rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>')}Monitor Truck</a>`;
        links += `<a href="employees.html" class="nav-link" id="nav-employees">${icon('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>')}Employee</a>`;
        links += `<a href="contractors.html" class="nav-link" id="nav-contractors">${icon('<path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/>')}Contractor</a>`;
        links += `<a href="reports.html" class="nav-link" id="nav-reports">${icon('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>')}Reports</a>`;
        links += `<a href="clenro-reports.html" class="nav-link" id="nav-clenro">${icon('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>')}CLENRO Historical Data</a>`;
        links += `<a href="schedule.html" class="nav-link" id="nav-schedule">${icon('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>')}Schedule</a>`;
        links += `<a href="vendors.html" class="nav-link" id="nav-vendors">${icon('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>')}Vendor</a>`;
        links += `<a href="inspections.html" class="nav-link" id="nav-inspections">${icon('<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>')}Market Inspections</a>`;
        links += `<a href="attendance.html" class="nav-link" id="nav-attendance">${icon('<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>')}Attendance</a>`;
        links += `<a href="users.html" class="nav-link" id="nav-users">${icon('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>')}User Management</a>`;
    } else {
        // Admin / Barangay Admin module — matches Figure 3.1 Flowchart Admin
        links += `<a href="barangay-overview.html" class="nav-link" id="nav-overview">${icon('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>')}Barangay Overview</a>`;
        links += `<a href="trucks.html" class="nav-link" id="nav-trucks">${icon('<rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>')}Monitor Truck</a>`;
        links += `<a href="residents.html" class="nav-link" id="nav-residents">${icon('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>')}Resident</a>`;
        links += `<a href="schedule.html" class="nav-link" id="nav-schedule">${icon('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>')}Collection Schedule</a>`;
        links += `<a href="vendors.html" class="nav-link" id="nav-vendors">${icon('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>')}Vendor</a>`;
        links += `<a href="inspections.html" class="nav-link" id="nav-inspections">${icon('<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>')}Market Inspections</a>`;
        links += `<a href="reports.html" class="nav-link" id="nav-reports">${icon('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>')}Report &amp; Issues</a>`;
        links += `<a href="clenro-reports.html" class="nav-link" id="nav-clenro">${icon('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>')}CLENRO Historical Data</a>`;
        links += `<a href="attendance.html" class="nav-link" id="nav-attendance">${icon('<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>')}Attendance</a>`;
        links += `<a href="users.html" class="nav-link" id="nav-users">${icon('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>')}User Profiles</a>`;
        links += `<a href="archives.html" class="nav-link" id="nav-archives">${icon('<path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/>')}Records &amp; Archives</a>`;
    }

    // Settings is now housed inside the Profile at the bottom of the sidebar!

    // Append evergreen pine tree motif accent before footer
    links += `
        <div class="sidebar-tree-motif" aria-hidden="true">
            <svg viewBox="0 0 240 28" fill="currentColor" width="100%" height="24" opacity="0.35">
                <path d="M12 28L18 16H15L20 8H17L22 0L27 8H24L29 16H26L32 28H12ZM42 28L47 18H44L49 10H46L51 2L56 10H53L58 18H55L60 28H42ZM75 28L80 17H77L82 9H79L84 1L89 9H86L91 17H88L93 28H75ZM110 28L115 19H112L117 11H114L119 3L124 11H121L126 19H123L128 28H110ZM145 28L151 16H148L153 8H150L155 0L160 8H157L162 16H159L165 28H145ZM180 28L185 18H182L187 10H184L189 2L194 10H191L196 18H193L198 28H180ZM212 28L217 17H214L219 9H216L221 1L226 9H223L228 17H225L230 28H212Z"/>
            </svg>
        </div>
    `;

    const navContainer = document.getElementById('sidebar-nav');
    if (navContainer) {
        navContainer.innerHTML = links;
        
        // Highlight active link
        const pageName = window.location.pathname.split('/').pop() || 'index.html';
        const pageWithExt = pageName.endsWith('.html') ? pageName : (pageName ? `${pageName}.html` : 'index.html');
        const pageWithoutExt = pageName.replace(/\.html$/, '');
        const activeLink = document.querySelector(`.nav-link[href="${pageWithExt}"], .nav-link[href="${pageWithoutExt}"], .nav-link[href="${pageName}"]`);
        if(activeLink) activeLink.classList.add('active');
    }

    // Header branding
    const sidebarHeader = document.querySelector('.sidebar-header');
    if (sidebarHeader) {
        sidebarHeader.innerHTML = `
            <div style="display:flex;align-items:center;gap:3px;justify-content:center;">
                <span class="brand-katok">Katok</span><span class="brand-kalinisan">Kalinis</span>
            </div>
            <div class="brand-tagline">Katok. Linis. Gaan ang Buhay.</div>
        `;
    }

    // Role block at the top of the sidebar
    const roleContainer = document.getElementById('sidebar-role');
    if (roleContainer) {
        roleContainer.innerHTML = `<span>CLENRO Department</span><span class="sidebar-role-badge">${roleLabel}</span>`;
    }

    const userNameEl = document.getElementById('topbar-user');
    if (userNameEl) {
        userNameEl.textContent = `Welcome, ${user.name} (${roleLabel})`;
    }

    // Render Integrated Profile Component in Sidebar Footer
    const footerContainer = document.querySelector('.sidebar-footer');
    if (footerContainer) {
        const initials = (user.name || 'Admin')
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map(n => n[0].toUpperCase())
            .join('') || 'CL';

        footerContainer.innerHTML = `
            <div class="sidebar-profile-widget" id="sidebar-profile-widget">
                <div class="sidebar-profile-card" id="sidebar-profile-card" onclick="toggleProfileMenu(event)" title="Click to view Profile, Settings &amp; Logout">
                    <div class="profile-avatar-wrap">
                        <div class="profile-avatar">${initials}</div>
                        <span class="status-indicator-dot" title="Account Active"></span>
                    </div>
                    <div class="profile-meta">
                        <div class="profile-meta-name">${escapeHtml(user.name || 'CLENRO Officer')}</div>
                        <div class="profile-meta-role">${escapeHtml(roleLabel)}</div>
                    </div>
                    <svg class="profile-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 9l6 6 6-6"/>
                    </svg>
                </div>

                <!-- Profile Dropdown containing Settings, Dark Mode & Logout -->
                <div class="profile-dropdown-menu" id="profile-dropdown-menu">
                    <div class="dropdown-user-header">
                        <div class="dropdown-user-name">${escapeHtml(user.name || 'CLENRO Official')}</div>
                        <div class="dropdown-user-email">${escapeHtml(user.email || 'clenro@cagayandeoro.gov.ph')}</div>
                        <span class="dropdown-department-tag">CLENRO · Cagayan de Oro</span>
                    </div>
                    <a href="settings.html" class="dropdown-item" id="dropdown-settings-link">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                        Settings &amp; Preferences
                    </a>
                    <button type="button" class="dropdown-item" onclick="toggleTheme();">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                        </svg>
                        Toggle Light / Dark Mode
                    </button>
                    <div class="dropdown-divider"></div>
                    <button type="button" class="dropdown-item dropdown-logout" onclick="logout()">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Logout
                    </button>
                </div>
            </div>
        `;
    }
}

// Profile Dropdown Toggle
function toggleProfileMenu(event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById('profile-dropdown-menu');
    const card = document.getElementById('sidebar-profile-card');
    if (!menu) return;
    const isOpen = menu.classList.contains('active');
    if (isOpen) {
        closeProfileMenu();
    } else {
        menu.classList.add('active');
        if (card) card.classList.add('menu-open');
    }
}

function closeProfileMenu() {
    const menu = document.getElementById('profile-dropdown-menu');
    const card = document.getElementById('sidebar-profile-card');
    if (menu) menu.classList.remove('active');
    if (card) card.classList.remove('menu-open');
}

// Close profile dropdown when clicking outside or pressing Escape
document.addEventListener('click', (e) => {
    const widget = document.getElementById('sidebar-profile-widget');
    if (widget && !widget.contains(e.target)) {
        closeProfileMenu();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeProfileMenu();
    }
});

// Helper for escaping HTML strings
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Automatic Code Generator for Government/CLENRO entities
function generateAutoCode(prefix = 'EMP') {
    const year = new Date().getFullYear();
    const randNum = String(Math.floor(1000 + Math.random() * 9000));
    return `CLENRO-${prefix}-${year}-${randNum}`;
}

/*
|--------------------------------------------------------------------------
| TOAST NOTIFICATIONS
|--------------------------------------------------------------------------
*/
function showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;

    let iconSvg = '';
    if (type === 'success') {
        iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'error') {
        iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
    } else if (type === 'warning') {
        iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
    } else {
        iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = `
        <span class="toast-icon">${iconSvg}</span>
        <span class="toast-msg">${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(12px)';
        setTimeout(() => toast.remove(), 260);
    }, duration);
}
window.showToast = showToast;

/*
|--------------------------------------------------------------------------
| REUSABLE PAGINATION CONTROLS
|--------------------------------------------------------------------------
*/
class PaginationControls {
    constructor(options = {}) {
        this.containerId = options.containerId || 'pagination-container';
        this.currentPage = options.currentPage || 1;
        this.rowsPerPage = options.rowsPerPage || 10;
        this.rowsPerPageOptions = options.rowsPerPageOptions || [10, 20, 50, 100];
        this.totalItems = options.totalItems || 0;
        this.itemLabel = options.itemLabel || 'users';
        this.onPageChange = options.onPageChange || (() => {});
        this.onRowsPerPageChange = options.onRowsPerPageChange || (() => {});
    }

    update({ currentPage, totalItems, rowsPerPage }) {
        if (currentPage !== undefined) this.currentPage = currentPage;
        if (totalItems !== undefined) this.totalItems = totalItems;
        if (rowsPerPage !== undefined) this.rowsPerPage = rowsPerPage;
        this.render();
    }

    getTotalPages() {
        return Math.max(1, Math.ceil(this.totalItems / this.rowsPerPage));
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const totalPages = this.getTotalPages();
        if (this.currentPage > totalPages) this.currentPage = totalPages;

        const startItem = this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.rowsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.rowsPerPage, this.totalItems);

        // Build numeric page range (e.g. 1, 2, ..., 10)
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (this.currentPage > 3) pages.push('...');
            const start = Math.max(2, this.currentPage - 1);
            const end = Math.min(totalPages - 1, this.currentPage + 1);
            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }
            if (this.currentPage < totalPages - 2) pages.push('...');
            if (!pages.includes(totalPages)) pages.push(totalPages);
        }

        const optionsHtml = this.rowsPerPageOptions.map(opt =>
            `<option value="${opt}" ${opt === this.rowsPerPage ? 'selected' : ''}>${opt}</option>`
        ).join('');

        const desktopButtonsHtml = pages.map(p => {
            if (p === '...') return `<span class="page-ellipsis">&hellip;</span>`;
            return `<button type="button" class="page-btn ${p === this.currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
        }).join('');

        container.innerHTML = `
            <div class="pagination-left">
                <span class="pagination-summary">
                    ${this.totalItems > 0 ? `Showing <strong>${startItem}–${endItem}</strong> of <strong>${this.totalItems}</strong> ${this.itemLabel}` : `No ${this.itemLabel} to display`}
                </span>
                <div class="rows-per-page-wrap">
                    <label for="rows-per-page-select">Rows per page:</label>
                    <select id="rows-per-page-select" class="rows-per-page-select">
                        ${optionsHtml}
                    </select>
                </div>
            </div>
            <div class="pagination-controls">
                <button type="button" class="page-btn prev-btn" ${this.currentPage <= 1 ? 'disabled' : ''} title="Previous Page" aria-label="Previous Page">&laquo; Prev</button>
                <div class="pagination-pages-desktop">
                    ${desktopButtonsHtml}
                </div>
                <div class="pagination-pages-mobile">
                    Page ${this.currentPage} of ${totalPages}
                </div>
                <button type="button" class="page-btn next-btn" ${this.currentPage >= totalPages ? 'disabled' : ''} title="Next Page" aria-label="Next Page">Next &raquo;</button>
            </div>
        `;

        // Event listeners
        const prevBtn = container.querySelector('.prev-btn');
        if (prevBtn) {
            prevBtn.onclick = () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.onPageChange(this.currentPage);
                }
            };
        }

        const nextBtn = container.querySelector('.next-btn');
        if (nextBtn) {
            nextBtn.onclick = () => {
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.onPageChange(this.currentPage);
                }
            };
        }

        container.querySelectorAll('.pagination-pages-desktop button[data-page]').forEach(btn => {
            btn.onclick = () => {
                const targetPage = parseInt(btn.getAttribute('data-page'), 10);
                if (targetPage !== this.currentPage) {
                    this.currentPage = targetPage;
                    this.onPageChange(this.currentPage);
                }
            };
        });

        const rowsSelect = container.querySelector('#rows-per-page-select');
        if (rowsSelect) {
            rowsSelect.onchange = (e) => {
                const newRows = parseInt(e.target.value, 10);
                this.rowsPerPage = newRows;
                this.currentPage = 1;
                this.onRowsPerPageChange(newRows);
            };
        }
    }
}
window.PaginationControls = PaginationControls;

// Run auth check on load
checkAuth();

document.addEventListener('DOMContentLoaded', () => {
    if (!isAuthPage()) {
        loadSidebar();
    }
});

