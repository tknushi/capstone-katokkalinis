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

function formatEmailLink(email) {
    if (!email || email === '-' || email === 'N/A' || email === 'null' || email === 'undefined') {
        return escapeHtml(email || '-');
    }
    const clean = String(email).trim();
    return `<a href="mailto:${encodeURIComponent(clean)}" class="contact-link email-link" title="Send email to ${escapeHtml(clean)}">${escapeHtml(clean)}</a>`;
}
window.formatEmailLink = formatEmailLink;

function formatPhoneLink(phone) {
    if (!phone || phone === '-' || phone === 'N/A' || phone === 'null' || phone === 'undefined') {
        return escapeHtml(phone || '-');
    }
    const clean = String(phone).trim();
    const telNum = clean.replace(/[^0-9+]/g, '');
    return `<a href="tel:${telNum}" class="contact-link phone-link" title="Call ${escapeHtml(clean)}">${escapeHtml(clean)}</a>`;
}
window.formatPhoneLink = formatPhoneLink;

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
        if ((window.location.pathname && (window.location.pathname.includes('clenro-reports.html') || window.location.pathname.includes('analytics'))) || (window.location.search && window.location.search.includes('demo=1'))) {
            return;
        }
        window.location.href = 'login.html';
    }
}


/* ==========================================================================
   KATOK SWR (STALE-WHILE-REVALIDATE) DATA CACHING & CANCELLATION ENGINE
   ========================================================================== */

const KatokSWR = {
    cache: new Map(),
    activeControllers: new Set(),
    commonData: new Map(),

    get(key, ttl = 60000) {
        const item = this.cache.get(key);
        if (!item) return null;
        const age = Date.now() - item.timestamp;
        const isFresh = age < ttl;
        return { data: item.data, isFresh, age };
    },

    set(key, data) {
        this.cache.set(key, { data, timestamp: Date.now() });
    },

    invalidate(pattern) {
        if (!pattern) {
            this.cache.clear();
            return;
        }
        for (const k of this.cache.keys()) {
            if (k.toLowerCase().includes(pattern.toLowerCase())) {
                this.cache.delete(k);
            }
        }
    },

    createController() {
        const controller = new AbortController();
        this.activeControllers.add(controller);
        return controller;
    },

    removeController(controller) {
        this.activeControllers.delete(controller);
    },

    abortPending() {
        this.activeControllers.forEach(ctrl => {
            try { ctrl.abort(); } catch (_) {}
        });
        this.activeControllers.clear();
    },

    // Shared common data across pages (e.g. barangay list 1-40, current user, notifications)
    getCommon(key) {
        return this.commonData.get(key);
    },

    setCommon(key, val) {
        this.commonData.set(key, val);
    }
};
window.KatokSWR = KatokSWR;

// Tab visibility tracking to pause background polling when hidden
window.__isTabActive = !document.hidden;
document.addEventListener('visibilitychange', () => {
    window.__isTabActive = !document.hidden;
});

// Perform API request with SWR caching, in-flight cancellation, and auto-invalidation
async function apiRequest(endpoint, method = 'GET', data = null, options = {}) {
    const isGet = (method || 'GET').toUpperCase() === 'GET';
    const cacheKey = `SWR:${endpoint}`;
    const ttl = options.ttl || 45000; // 45 seconds default TTL

    // 1. SWR Cache check for GET requests
    if (isGet && !options.skipCache) {
        const cached = KatokSWR.get(cacheKey, ttl);
        if (cached) {
            // If data is older than 15 seconds, revalidate in background silently
            if (!cached.isFresh || cached.age > 15000) {
                _fetchFromNetwork(endpoint, method, data, cacheKey, true).catch(err => {
                    if (err.name !== 'AbortError') {
                        console.debug('[KatokSWR] Background revalidation note:', err.message);
                    }
                });
            }
            return cached.data;
        }
    }

    // 2. Fresh Network Fetch
    const result = await _fetchFromNetwork(endpoint, method, data, cacheKey, isGet);

    // 3. Auto-invalidate relevant caches on mutations (POST, PUT, PATCH, DELETE)
    if (!isGet) {
        const lower = endpoint.toLowerCase();
        if (lower.includes('employee')) KatokSWR.invalidate('employee');
        if (lower.includes('truck')) KatokSWR.invalidate('truck');
        if (lower.includes('report')) KatokSWR.invalidate('report');
        if (lower.includes('attendance')) KatokSWR.invalidate('attendance');
        if (lower.includes('schedule')) KatokSWR.invalidate('schedule');
        if (lower.includes('vendor')) KatokSWR.invalidate('vendor');
        if (lower.includes('contractor')) KatokSWR.invalidate('contractor');
        if (lower.includes('inspection')) KatokSWR.invalidate('inspection');
        KatokSWR.invalidate('analytics');
        KatokSWR.invalidate('overview');
    }

    return result;
}

async function _fetchFromNetwork(endpoint, method, data, cacheKey, isGet) {
    const token = localStorage.getItem('auth_token');
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const ctrl = KatokSWR.createController();
    const fetchOptions = {
        method,
        headers,
        signal: ctrl.signal
    };

    if (data && (method !== 'GET' && method !== 'HEAD')) {
        fetchOptions.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);

        if (response.status === 401 && !isAuthPage()) {
            if (window.location.search.includes('demo=1') || window.location.pathname.includes('clenro-reports.html')) {
                return null;
            }
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
            return null;
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'API request failed');
        }

        if (isGet) {
            KatokSWR.set(cacheKey, result);
        }

        return result;
    } catch (error) {
        if (error.name === 'AbortError') {
            return null;
        }
        console.error('API Error:', error);
        throw error;
    } finally {
        KatokSWR.removeController(ctrl);
    }
}

// Logout
async function logout() {
    try {
        await apiRequest('/logout', 'POST');
    } catch (e) {
        console.warn('Backend logout warning:', e);
    }
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
        
        // Highlight active link exclusively
        const raw = (window.location.pathname || 'index.html').split('#')[0].split('?')[0];
        let pageName = raw.split('/').pop() || 'index.html';
        if (pageName === 'index.html' || pageName === '') {
            pageName = getHomePage(role);
        }
        const pageWithExt = pageName.endsWith('.html') ? pageName : `${pageName}.html`;
        const pageWithoutExt = pageName.replace(/\.html$/, '');

        document.querySelectorAll('.nav-link').forEach(link => {
            const href = (link.getAttribute('href') || '').split('?')[0].split('#')[0];
            const isMatch = href === pageWithExt || href === pageWithoutExt || href === pageName;
            link.classList.toggle('active', isMatch);
        });
    }

    // Header branding with clickable logo link and mobile close button
    const sidebarHeader = document.querySelector('.sidebar-header');
    if (sidebarHeader) {
        sidebarHeader.innerHTML = `
            <a href="${getHomePage(role)}" class="sidebar-brand-link" title="KatokKalinis Home">
                <div style="display:flex;align-items:center;gap:3px;justify-content:center;">
                    <span class="brand-katok">Katok</span><span class="brand-kalinisan">Kalinis</span>
                </div>
                <div class="brand-tagline">Katok. Linis. Gaan ang Buhay.</div>
            </a>
            <button type="button" class="sidebar-close-btn" id="sidebar-close-btn" aria-label="Close navigation menu" onclick="closeMobileSidebar()">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
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
                        <div class="dropdown-user-email">${formatEmailLink(user.email || 'clenro@cagayandeoro.gov.ph')}</div>
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

/* ==========================================================================
   GLOBAL Z-INDEX SCALE CONSTANTS (Single Source of Truth)
   ========================================================================== */
const KATOK_Z_INDEX = {
    content: 0,
    sticky: 20,
    header: 30,
    sidebar: 30,
    floating: 40,
    backdrop: 50,
    popover: 55,
    dropdown: 55,
    drawer: 60,
    modal: 60,
    toast: 70,
    tooltip: 80
};
window.KATOK_Z_INDEX = KATOK_Z_INDEX;

/* ==========================================================================
   KATOK PORTAL OVERLAY & POPUP ENGINE
   ========================================================================== */
const KatokPortal = {
    root: null,
    clickCatcher: null,
    activePopover: null, // { trigger, element, options, onClose }

    getRoot() {
        if (!this.root || !document.body.contains(this.root)) {
            let el = document.getElementById('portal-root');
            if (!el) {
                el = document.createElement('div');
                el.id = 'portal-root';
                el.className = 'portal-root';
                document.body.appendChild(el);
            }
            this.root = el;
        }
        return this.root;
    },

    getClickCatcher() {
        if (!this.clickCatcher || !document.body.contains(this.clickCatcher)) {
            let el = document.getElementById('portal-click-catcher');
            if (!el) {
                el = document.createElement('div');
                el.id = 'portal-click-catcher';
                el.className = 'portal-click-catcher';
                el.style.display = 'none';
                el.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    this.closeActivePopover();
                });
                this.getRoot().appendChild(el);
            }
            this.clickCatcher = el;
        }
        return this.clickCatcher;
    },

    openPopover(triggerEl, popoverEl, options = {}) {
        // Enforce: ONLY ONE popover or dropdown open at a time
        if (this.activePopover && this.activePopover.element !== popoverEl) {
            this.closeActivePopover();
        }

        const root = this.getRoot();
        if (popoverEl.parentNode !== root) {
            root.appendChild(popoverEl);
        }

        popoverEl.style.display = 'flex';
        popoverEl.classList.add('active');
        this.getClickCatcher().style.display = 'block';

        if (triggerEl) {
            triggerEl.setAttribute('aria-expanded', 'true');
        }

        this.activePopover = {
            trigger: triggerEl,
            element: popoverEl,
            options,
            onClose: options.onClose || null
        };

        this.positionPopover(triggerEl, popoverEl, options);

        // Hide any active tooltip for this trigger while open
        if (window.KatokTooltip) {
            window.KatokTooltip.hide();
        }
    },

    closeActivePopover() {
        if (!this.activePopover) return;
        const { trigger, element, onClose } = this.activePopover;

        element.classList.remove('active');
        element.style.display = 'none';

        if (this.clickCatcher) {
            this.clickCatcher.style.display = 'none';
        }

        if (trigger) {
            trigger.setAttribute('aria-expanded', 'false');
            try { trigger.focus(); } catch (_) {}
        }

        this.activePopover = null;
        if (typeof onClose === 'function') {
            try { onClose(); } catch (err) { console.error(err); }
        }
    },

    positionPopover(triggerEl, popoverEl, options = {}) {
        if (!triggerEl || !popoverEl) return;
        const rect = triggerEl.getBoundingClientRect();
        const popoverRect = popoverEl.getBoundingClientRect();

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const margin = 12;

        let top = 0;
        let left = 0;

        if (options.placement === 'top-start' || options.placement === 'top') {
            // Place above trigger
            top = rect.top - popoverRect.height - 8;
            if (top < margin) {
                // Flip below if not enough room above
                top = rect.bottom + 8;
            }
            left = rect.left;
        } else {
            // Default: place below trigger
            top = rect.bottom + 8;
            // Flip above if near bottom
            if (top + popoverRect.height > viewportHeight - margin && rect.top > popoverRect.height + margin) {
                top = rect.top - popoverRect.height - 8;
            }

            // Horizontal alignment
            if (options.align === 'end') {
                left = rect.right - popoverRect.width;
            } else if (options.align === 'center') {
                left = rect.left + (rect.width - popoverRect.width) / 2;
            } else {
                left = rect.left;
            }
        }

        // Clamp inside viewport
        if (left + popoverRect.width > viewportWidth - margin) {
            left = viewportWidth - popoverRect.width - margin;
        }
        if (left < margin) {
            left = margin;
        }

        popoverEl.style.position = 'fixed';
        popoverEl.style.top = `${Math.round(top)}px`;
        popoverEl.style.left = `${Math.round(left)}px`;
        popoverEl.style.maxHeight = `calc(100vh - ${Math.round(top) + margin}px)`;
    },

    repositionActive() {
        if (!this.activePopover) return;
        const { trigger, element, options } = this.activePopover;
        if (!trigger || !document.body.contains(trigger)) {
            this.closeActivePopover();
            return;
        }
        const rect = trigger.getBoundingClientRect();
        // If trigger has been scrolled off screen
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
            this.closeActivePopover();
            return;
        }
        this.positionPopover(trigger, element, options);
    },

    initEvents() {
        window.addEventListener('resize', () => this.repositionActive(), { passive: true });
        window.addEventListener('scroll', () => {
            requestAnimationFrame(() => this.repositionActive());
        }, { capture: true, passive: true });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activePopover) {
                this.closeActivePopover();
            }
        });
    }
};
window.KatokPortal = KatokPortal;
KatokPortal.initEvents();

/* ==========================================================================
   SHARED NOTIFICATION BELL COMPONENT (Portal-Rendered)
   ========================================================================== */
const NotificationBell = {
    panelEl: null,
    isLoading: false,

    init() {
        this.getPanel();
        this.loadFeed();
    },

    getPanel() {
        if (!this.panelEl || !document.body.contains(this.panelEl)) {
            let el = document.getElementById('activity-dropdown-menu') || document.getElementById('portal-notification-panel');
            if (!el) {
                el = document.createElement('div');
                el.id = 'activity-dropdown-menu';
                el.className = 'portal-popover activity-dropdown-menu';
                el.setAttribute('role', 'region');
                el.setAttribute('aria-label', 'System Activity Notifications');
                el.innerHTML = `
                    <div class="activity-dropdown-header">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--green-700);">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                            <span style="font-weight: 700; font-size: 13.5px; color: var(--text);">Recent System Activity</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span class="live-sync-badge-mini" title="Real-time operational streaming">
                                <span class="live-sync-dot"></span> Live
                            </span>
                            <button type="button" class="btn-icon-topbar" style="width: 24px; height: 24px; border-radius: 4px; border: none; background: transparent; padding: 0; color: var(--text-muted);" onclick="NotificationBell.loadFeed(true)" title="Refresh activities" aria-label="Refresh activities">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                                </svg>
                            </button>
                            <button type="button" class="btn-close-dropdown" onclick="NotificationBell.close()" aria-label="Close activity notifications">&times;</button>
                        </div>
                    </div>
                    <div class="activity-dropdown-body" id="recent-activities" data-portal-body="portal-notification-body">
                        <div class="empty-state-box" style="padding: 24px 16px; text-align: center; color: var(--text-muted); font-size: 13px;">
                            Loading live system activities...
                        </div>
                    </div>
                    <div class="activity-dropdown-footer">
                        <a href="activity-logs.html" class="activity-view-all-link">View Full System Audit Logs &rarr;</a>
                    </div>
                `;
                KatokPortal.getRoot().appendChild(el);
            }
            this.panelEl = el;
        }
        return this.panelEl;
    },

    getBody() {
        this.getPanel();
        return document.getElementById('recent-activities') || document.getElementById('portal-notification-body');
    },

    toggle(triggerEl) {
        if (!triggerEl) {
            triggerEl = document.getElementById('btn-notification-bell');
        }
        const panel = this.getPanel();
        if (KatokPortal.activePopover && KatokPortal.activePopover.element === panel) {
            this.close();
        } else {
            this.open(triggerEl);
        }
    },

    open(triggerEl) {
        if (!triggerEl) {
            triggerEl = document.getElementById('btn-notification-bell');
        }
        const panel = this.getPanel();
        KatokPortal.openPopover(triggerEl, panel, { align: 'end' });
        this.loadFeed();
    },

    close() {
        const panel = this.getPanel();
        if (KatokPortal.activePopover && KatokPortal.activePopover.element === panel) {
            KatokPortal.closeActivePopover();
        }
    },

    async loadFeed(forceRefresh = false) {
        if (this.isLoading) return;
        const bodyEl = this.getBody();
        if (!bodyEl) return;

        if (!forceRefresh) {
            // Check in-memory common cache first
            const cached = KatokSWR.get('overview_summary_all') || KatokSWR.getCommon('recent_activities');
            if (cached && cached.data && Array.isArray(cached.data.recent_activities) && cached.data.recent_activities.length > 0) {
                this.renderActivities(cached.data.recent_activities);
                return;
            }
        }

        this.isLoading = true;
        try {
            const token = localStorage.getItem('auth_token');
            const headers = { 'Accept': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            // Attempt 1: Overview Summary API
            const url = token ? `${API_BASE_URL}/overview/summary` : `${API_BASE_URL}/public/overview/summary`;
            let resp = await fetch(url, { headers });
            if (resp.ok) {
                const data = await resp.json();
                const activities = data.recent_activities || [];
                if (activities.length > 0) {
                    KatokSWR.commonData.set('recent_activities', { data: { recent_activities: activities } });
                    this.renderActivities(activities);
                    this.updateBadge(activities.length);
                    this.isLoading = false;
                    return;
                }
            }

            // Attempt 2: Direct Activity Logs API
            const logResp = await fetch(`${API_BASE_URL}/activity-logs?limit=12`, { headers });
            if (logResp.ok) {
                const logData = await logResp.json();
                const logs = logData.logs || [];
                if (logs.length > 0) {
                    const mapped = logs.map(l => ({
                        id: l.id,
                        action: l.action,
                        description: l.description,
                        actor: (l.user && l.user.name) || 'System',
                        created_at: l.created_at,
                        time_formatted: l.created_at ? this.formatRelativeTime(l.created_at) : 'Recently'
                    }));
                    KatokSWR.commonData.set('recent_activities', { data: { recent_activities: mapped } });
                    this.renderActivities(mapped);
                    this.updateBadge(mapped.length);
                    this.isLoading = false;
                    return;
                }
            }

            // If empty response
            this.renderActivities([]);
            this.updateBadge(0);
        } catch (err) {
            console.warn('[NotificationBell] Activity load notice:', err);
            // Safe fallback operational activities for reliable offline/demo presentation
            const fallbackActivities = [
                { id: 1, action: 'auth.login', description: 'Super Administrator logged in via Web Portal.', actor: 'Super Administrator', time_formatted: 'Just now' },
                { id: 2, action: 'truck.dispatch', description: 'Truck #04 completed Cogon Market sweep.', actor: 'Danilo P. Fernandez', time_formatted: '25m ago' },
                { id: 3, action: 'report.created', description: 'Garbage pile-up logged in Brgy 34 Agora Corridor.', actor: 'Maria Santos', time_formatted: '1h ago' },
                { id: 4, action: 'inspection.submitted', description: 'Sanitary inspection approved for Carmen Central Vendor Block.', actor: 'CLENRO Officer', time_formatted: '3h ago' }
            ];
            this.renderActivities(fallbackActivities);
            this.updateBadge(fallbackActivities.length);
        } finally {
            this.isLoading = false;
        }
    },

    updateBadge(count) {
        document.querySelectorAll('#bell-count-badge, .bell-count-badge').forEach(badge => {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.classList.remove('empty');
            } else {
                badge.textContent = '0';
                badge.classList.add('empty');
            }
        });
    },

    simplifySentence(a, rawDesc, actorName) {
        if (!rawDesc) return 'Operational activity recorded.';
        // Remove repetitive user emails inside parentheses for clean display
        let clean = rawDesc.replace(/\s*\([^)]+@[^)]+\)/, '').trim();
        // Remove trailing period if present
        if (clean.endsWith('.')) clean = clean.slice(0, -1);
        return clean;
    },

    renderActivities(list) {
        const bodyEl = this.getBody();
        if (!bodyEl) return;

        if (!list || list.length === 0) {
            bodyEl.innerHTML = `
                <div class="empty-state-box" style="padding: 24px 16px; text-align: center;">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); margin-bottom: 6px;">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <div style="font-weight: 600; font-size: 13.5px; margin-bottom: 2px;">No recent activity</div>
                    <div style="font-size: 12px; color: var(--text-muted);">Actions from mobile apps and web admin stream here.</div>
                </div>
            `;
            this.updateBadge(0);
            return;
        }

        this.updateBadge(list.length);

        bodyEl.innerHTML = `
            <div class="activity-items-stream" style="display: flex; flex-direction: column;">
                ${list.slice(0, 15).map(a => {
                    const iconMeta = this.getActivityIcon(a.action || a.icon || a.category || '');
                    const actorName = escapeHtml(a.actor || (a.user && a.user.name) || 'CLENRO Officer');
                    const rawDesc = a.description || a.details || a.title || 'Operational task performed';
                    const cleanSentence = escapeHtml(this.simplifySentence(a, rawDesc, actorName));
                    const timeText = escapeHtml(a.time_formatted || (a.created_at ? this.formatRelativeTime(a.created_at) : 'Recently'));
                    const actionBadge = a.action ? `<span class="action-tag-mini">${escapeHtml(a.action)}</span>` : '';

                    return `
                        <div class="activity-simple-item activity-portal-item">
                            <div class="activity-icon-wrap ${iconMeta.className}">
                                ${iconMeta.svg}
                            </div>
                            <div class="activity-content">
                                <div class="activity-item-topline">
                                    <div class="activity-simple-sentence">${cleanSentence}</div>
                                    <span class="activity-time-stamp">${timeText}</span>
                                </div>
                                <div class="activity-simple-meta">
                                    <strong class="activity-actor-tag">${actorName}</strong>
                                    <span>&bull;</span>
                                    ${actionBadge}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        if (KatokPortal && KatokPortal.activePopover && KatokPortal.activePopover.element === this.panelEl) {
            KatokPortal.repositionActive();
        }
    },

    getActivityIcon(action) {
        const act = String(action || '').toLowerCase();
        if (act.includes('collection') || act.includes('truck') || act.includes('route') || act.includes('dispatch') || act.includes('driver')) {
            return {
                className: 'activity-icon-collection',
                svg: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>'
            };
        }
        if (act.includes('inspection') || act.includes('audit') || act.includes('compliance')) {
            return {
                className: 'activity-icon-inspection',
                svg: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>'
            };
        }
        if (act.includes('report') || act.includes('issue') || act.includes('dump') || act.includes('violation')) {
            return {
                className: 'activity-icon-report',
                svg: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
            };
        }
        if (act.includes('vendor') || act.includes('stall') || act.includes('market')) {
            return {
                className: 'activity-icon-vendor',
                svg: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'
            };
        }
        if (act.includes('user') || act.includes('auth') || act.includes('login') || act.includes('logout') || act.includes('attendance') || act.includes('resident')) {
            return {
                className: 'activity-icon-user',
                svg: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
            };
        }
        return {
            className: 'activity-icon-general',
            svg: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>'
        };
    },

    formatRelativeTime(dateStr) {
        if (!dateStr) return 'Recently';
        try {
            const dt = new Date(dateStr);
            const diffSec = Math.floor((Date.now() - dt.getTime()) / 1000);
            if (diffSec < 60) return 'Just now';
            const diffMin = Math.floor(diffSec / 60);
            if (diffMin < 60) return `${diffMin}m ago`;
            const diffHr = Math.floor(diffMin / 60);
            if (diffHr < 24) return `${diffHr}h ago`;
            const diffDays = Math.floor(diffHr / 24);
            return `${diffDays}d ago`;
        } catch (_) {
            return 'Recently';
        }
    }
};
window.NotificationBell = NotificationBell;

// Global Backward Compatibility Handlers
window.toggleActivityDropdown = function(event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const btn = (event && event.currentTarget) || document.getElementById('btn-notification-bell');
    NotificationBell.toggle(btn);
};

window.closeActivityDropdown = function(event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    NotificationBell.close();
};

// Profile Dropdown Toggle via Portal
function toggleProfileMenu(event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById('profile-dropdown-menu');
    const card = document.getElementById('sidebar-profile-card');
    if (!menu || !card) return;

    if (KatokPortal.activePopover && KatokPortal.activePopover.element === menu) {
        closeProfileMenu();
    } else {
        KatokPortal.openPopover(card, menu, {
            placement: 'top-start',
            onClose: () => {
                if (card) card.classList.remove('menu-open');
            }
        });
        card.classList.add('menu-open');
    }
}
window.toggleProfileMenu = toggleProfileMenu;

function closeProfileMenu() {
    const menu = document.getElementById('profile-dropdown-menu');
    const card = document.getElementById('sidebar-profile-card');
    if (menu && KatokPortal.activePopover && KatokPortal.activePopover.element === menu) {
        KatokPortal.closeActivePopover();
    }
    if (card) card.classList.remove('menu-open');
}
window.closeProfileMenu = closeProfileMenu;

/* ==========================================================================
   PORTAL-BASED UNIVERSAL TOOLTIP ENGINE
   ========================================================================== */
const KatokTooltip = {
    tooltipEl: null,
    activeTrigger: null,

    getEl() {
        if (!this.tooltipEl || !document.body.contains(this.tooltipEl)) {
            let el = document.getElementById('portal-tooltip');
            if (!el) {
                el = document.createElement('div');
                el.id = 'portal-tooltip';
                el.className = 'portal-tooltip';
                el.setAttribute('role', 'tooltip');
                el.setAttribute('aria-hidden', 'true');
                KatokPortal.getRoot().appendChild(el);
            }
            this.tooltipEl = el;
        }
        return this.tooltipEl;
    },

    show(triggerEl) {
        if (!triggerEl) return;
        // Do not show tooltip if trigger's panel or any popover is active for this trigger
        if (KatokPortal.activePopover && KatokPortal.activePopover.trigger === triggerEl) {
            return;
        }
        // Do not show if modal is open and trigger is not inside modal
        const activeModal = document.querySelector('.modal.active, .image-lightbox-modal.active, .brgy-side-drawer.active');
        if (activeModal && !activeModal.contains(triggerEl)) {
            return;
        }

        const text = triggerEl.getAttribute('data-tooltip') || triggerEl.getAttribute('title');
        if (!text || !text.trim()) return;

        // If trigger had title, convert to data-tooltip to avoid native browser tooltip collision
        if (triggerEl.hasAttribute('title')) {
            triggerEl.setAttribute('data-tooltip', triggerEl.getAttribute('title'));
            triggerEl.removeAttribute('title');
        }

        const tooltip = this.getEl();
        tooltip.textContent = text;
        tooltip.style.display = 'block';

        this.activeTrigger = triggerEl;
        this.position(triggerEl, tooltip);
        tooltip.classList.add('visible');
    },

    position(triggerEl, tooltip) {
        const rect = triggerEl.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const pos = triggerEl.getAttribute('data-tooltip-pos') || 'top';
        const margin = 8;

        let top = 0;
        let left = 0;

        if (pos === 'bottom') {
            top = rect.bottom + margin;
            left = rect.left + (rect.width - tooltipRect.width) / 2;
        } else if (pos === 'left') {
            top = rect.top + (rect.height - tooltipRect.height) / 2;
            left = rect.left - tooltipRect.width - margin;
        } else if (pos === 'right') {
            top = rect.top + (rect.height - tooltipRect.height) / 2;
            left = rect.right + margin;
        } else {
            // Default: 'top'
            top = rect.top - tooltipRect.height - margin;
            left = rect.left + (rect.width - tooltipRect.width) / 2;
        }

        // Clamp inside screen bounds
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        if (top < 10) {
            top = rect.bottom + margin;
        }

        tooltip.style.top = `${Math.round(top)}px`;
        tooltip.style.left = `${Math.round(left)}px`;
    },

    hide() {
        if (this.tooltipEl) {
            this.tooltipEl.classList.remove('visible');
            this.tooltipEl.style.display = 'none';
        }
        this.activeTrigger = null;
    },

    initEvents() {
        document.addEventListener('mouseenter', (e) => {
            const trigger = e.target.closest('[data-tooltip], [title]');
            if (trigger) this.show(trigger);
        }, true);

        document.addEventListener('mouseleave', (e) => {
            const trigger = e.target.closest('[data-tooltip], [title]');
            if (trigger && trigger === this.activeTrigger) this.hide();
        }, true);

        document.addEventListener('focusin', (e) => {
            const trigger = e.target.closest('[data-tooltip], [title]');
            if (trigger) this.show(trigger);
        }, true);

        document.addEventListener('focusout', (e) => {
            const trigger = e.target.closest('[data-tooltip], [title]');
            if (trigger && trigger === this.activeTrigger) this.hide();
        }, true);

        document.addEventListener('click', () => this.hide(), true);
        window.addEventListener('scroll', () => this.hide(), { capture: true, passive: true });
    }
};
window.KatokTooltip = KatokTooltip;
KatokTooltip.initEvents();

/* ==========================================================================
   ADMIN LAYOUT COMPONENT (Single Shared Layout for All Admin Pages)
   ========================================================================== */
const AdminLayout = {
    init() {
        // Ensure portal root and toast container exist on all pages
        KatokPortal.getRoot();
        KatokPortal.getClickCatcher();

        // Initialize shared portal notification panel and preload feed
        NotificationBell.init();

        // Skip full admin layout on login or auth pages
        if (isAuthPage()) return;

        this.initHeader();
        this.initFloatingActions();
        this.initTableContainers();
    },

    initHeader() {
        const topbar = document.querySelector('.topbar');
        if (!topbar) return;

        // 1. Ensure Mobile Toggle Button exists on the left
        let mobileBtn = topbar.querySelector('#btn-mobile-sidebar, .mobile-toggle, .mobile-menu-btn');
        if (!mobileBtn) {
            const leftGroup = topbar.firstElementChild;
            if (leftGroup) {
                mobileBtn = document.createElement('button');
                mobileBtn.type = 'button';
                mobileBtn.className = 'btn-icon-topbar mobile-menu-btn';
                mobileBtn.id = 'btn-mobile-sidebar';
                mobileBtn.setAttribute('aria-label', 'Toggle Navigation Menu');
                mobileBtn.setAttribute('data-tooltip', 'Menu');
                mobileBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                `;
                mobileBtn.onclick = toggleMobileSidebar;
                leftGroup.insertBefore(mobileBtn, leftGroup.firstChild);
            }
        }

        // 2. Ensure Topbar Right Area with User Greeting, Notification Bell, and Refresh Button
        let rightArea = topbar.querySelector('.topbar-right-area, .analytics-topbar-actions');
        if (!rightArea) {
            rightArea = document.createElement('div');
            rightArea.className = 'topbar-right-area';
            topbar.appendChild(rightArea);
        }

        // 3. User Greeting Element (Single source of truth, never duplicate)
        let userGreeting = document.getElementById('topbar-user');
        if (userGreeting && !rightArea.contains(userGreeting)) {
            rightArea.insertBefore(userGreeting, rightArea.firstChild);
        } else if (!userGreeting) {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const role = getUserRole();
            const roleLabel = getRoleDisplayName(role);
            userGreeting = document.createElement('div');
            userGreeting.id = 'topbar-user';
            userGreeting.className = 'topbar-user-greeting';
            userGreeting.textContent = user ? `Welcome, ${user.name} (${roleLabel})` : 'Welcome, Officer';
            rightArea.insertBefore(userGreeting, rightArea.firstChild);
        }

        // 4. Notification Bell Element
        if (!rightArea.querySelector('#btn-notification-bell')) {
            const notifWrap = document.createElement('div');
            notifWrap.className = 'notification-bell-wrap';
            notifWrap.id = 'notification-bell-wrap';
            notifWrap.innerHTML = `
                <button type="button" class="btn-icon-topbar" id="btn-notification-bell" onclick="toggleActivityDropdown(event)" data-tooltip="Recent Activities &amp; Logs" data-tooltip-pos="bottom" aria-label="Notifications" aria-expanded="false">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <span class="bell-count-badge empty" id="bell-count-badge">0</span>
                </button>
            `;
            rightArea.appendChild(notifWrap);
        }

        // 5. Refresh Button Element
        if (!rightArea.querySelector('#btn-refresh, #btn-page-refresh')) {
            const refreshBtn = document.createElement('button');
            refreshBtn.type = 'button';
            refreshBtn.className = 'btn-icon-topbar';
            refreshBtn.id = 'btn-refresh';
            refreshBtn.setAttribute('data-tooltip', 'Refresh Data');
            refreshBtn.setAttribute('data-tooltip-pos', 'bottom');
            refreshBtn.setAttribute('aria-label', 'Refresh Data');
            refreshBtn.innerHTML = `
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                </svg>
            `;
            refreshBtn.onclick = () => {
                refreshBtn.classList.add('spinning');
                if (typeof window.triggerManualRefresh === 'function') {
                    window.triggerManualRefresh();
                } else if (typeof window.refreshAllAnalytics === 'function') {
                    window.refreshAllAnalytics();
                } else {
                    window.location.reload();
                }
                setTimeout(() => refreshBtn.classList.remove('spinning'), 800);
            };
            rightArea.appendChild(refreshBtn);
        }

        // 6. Help & Guidance Button Element
        if (!rightArea.querySelector('#btn-topbar-help')) {
            const helpBtn = document.createElement('button');
            helpBtn.type = 'button';
            helpBtn.className = 'btn-icon-topbar';
            helpBtn.id = 'btn-topbar-help';
            helpBtn.setAttribute('data-tooltip', 'Guidance & Keyboard Shortcuts (?)');
            helpBtn.setAttribute('data-tooltip-pos', 'bottom');
            helpBtn.setAttribute('aria-label', 'Guidance and Shortcuts');
            helpBtn.innerHTML = `
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
            `;
            helpBtn.onclick = () => {
                if (typeof window.openHelpGuidanceDrawer === 'function') {
                    window.openHelpGuidanceDrawer();
                } else if (typeof window.toggleHelpModal === 'function') {
                    window.toggleHelpModal();
                }
            };
            rightArea.appendChild(helpBtn);
        }

        // Pre-fetch activity count for bell badge
        NotificationBell.loadFeed();
    },

    initFloatingActions() {
        let container = document.getElementById('floating-actions-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'floating-actions-container';
            container.className = 'floating-actions-container';
            document.body.appendChild(container);
        }

        // Re-parent FAB container if already present
        const fab = document.getElementById('fab-container');
        if (fab && fab.parentNode !== container) {
            container.appendChild(fab);
        }

        // Re-parent Floating Help button if already present
        const helpBtn = document.getElementById('btn-floating-help');
        if (helpBtn && helpBtn.parentNode !== container) {
            container.appendChild(helpBtn);
        }

        // Ensure Back to Top button exists inside floating stack
        let btt = document.getElementById('btn-back-to-top');
        if (!btt) {
            btt = document.createElement('button');
            btt.type = 'button';
            btt.className = 'back-to-top-btn';
            btt.id = 'btn-back-to-top';
            btt.setAttribute('data-tooltip', 'Back to Top');
            btt.setAttribute('data-tooltip-pos', 'left');
            btt.setAttribute('aria-label', 'Back to Top');
            btt.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 15l-6-6-6 6"/>
                </svg>
            `;
            container.appendChild(btt);
        } else if (btt.parentNode !== container) {
            container.appendChild(btt);
        }

        btt.onclick = () => {
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.scrollTo({ top: 0, behavior: 'smooth' });
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        // Scroll listener to toggle Back to Top visibility
        const handleScroll = (scrollTop) => {
            if (scrollTop > 280) {
                btt.classList.add('visible');
            } else {
                btt.classList.remove('visible');
            }
        };

        window.addEventListener('scroll', () => handleScroll(window.scrollY), { passive: true });
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.addEventListener('scroll', () => handleScroll(mainContent.scrollTop), { passive: true });
        }
    },

    initTableContainers() {
        document.querySelectorAll('table').forEach(tbl => {
            if (!tbl.closest('.table-responsive')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'table-responsive';
                tbl.parentNode.insertBefore(wrapper, tbl);
                wrapper.appendChild(tbl);
            }
        });
    }
};
window.AdminLayout = AdminLayout;

// Global Mutation Observer to teleport active modals/drawers into #portal-root
if (typeof MutationObserver !== 'undefined') {
    const overlayObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('active') && (target.classList.contains('modal') || target.classList.contains('image-lightbox-modal') || target.classList.contains('brgy-side-drawer') || target.classList.contains('export-options-modal'))) {
                    const root = KatokPortal.getRoot();
                    if (target.parentNode !== root) {
                        root.appendChild(target);
                    }
                }
            }
        });
    });
    document.addEventListener('DOMContentLoaded', () => {
        overlayObserver.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class'] });
    });
}

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

/*
|--------------------------------------------------------------------------
| MOBILE NAVIGATION & DRAWER
|--------------------------------------------------------------------------
*/
function initMobileNav() {
    // 1. Ensure backdrop exists
    let backdrop = document.getElementById('sidebar-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'sidebar-backdrop';
        backdrop.className = 'sidebar-backdrop';
        backdrop.setAttribute('aria-hidden', 'true');
        backdrop.onclick = closeMobileSidebar;
        document.body.appendChild(backdrop);
    }

    // 2. Ensure hamburger toggle exists in topbar
    const topbar = document.querySelector('.topbar');
    if (topbar && !document.getElementById('mobile-nav-toggle')) {
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.id = 'mobile-nav-toggle';
        toggleBtn.className = 'mobile-nav-toggle';
        toggleBtn.setAttribute('aria-label', 'Open navigation menu');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.innerHTML = `
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
        `;
        toggleBtn.onclick = toggleMobileSidebar;
        topbar.insertBefore(toggleBtn, topbar.firstChild);
    }

    // 3. Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMobileSidebar();
        }
    });

    // 4. Close mobile menu when clicking nav links on mobile
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 900) {
                closeMobileSidebar();
            }
        });
    });
}
window.initMobileNav = initMobileNav;

function toggleMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const toggleBtn = document.getElementById('mobile-nav-toggle');
    if (!sidebar) return;
    const isOpen = sidebar.classList.contains('mobile-open');
    if (isOpen) {
        closeMobileSidebar();
    } else {
        sidebar.classList.add('mobile-open');
        if (backdrop) backdrop.classList.add('active');
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
    }
}
window.toggleMobileSidebar = toggleMobileSidebar;

function closeMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const toggleBtn = document.getElementById('mobile-nav-toggle');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('active');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
}
window.closeMobileSidebar = closeMobileSidebar;

/*
|--------------------------------------------------------------------------
| UNIVERSAL APPLICATION FOOTER
|--------------------------------------------------------------------------
*/
function renderAppFooter() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent || document.getElementById('app-footer')) return;

    const currentYear = new Date().getFullYear();
    const role = (typeof getUserRole === 'function' ? getUserRole() : null) || '';
    const isSuperAdmin = (role === 'super_admin');

    if (role && !document.body.classList.contains(`role-${role}`)) {
        document.body.classList.add(`role-${role}`);
    }

    const footer = document.createElement('footer');
    footer.id = 'app-footer';
    footer.className = 'app-footer';
    footer.innerHTML = `
        <div class="footer-inner">
            <div class="footer-left">
                <span class="footer-brand">
                    <img src="img/katok-logo-full.png" alt="KatokKalinis" class="footer-logo-img">
                    <span class="brand-text-lockup"><span class="brand-katok">Katok</span><span class="brand-kalinisan">Kalinis</span></span>
                </span>
                <span class="footer-sep">&middot;</span>
                <span class="footer-sub">City Local Environment and Natural Resources Office (CLENRO)</span>
            </div>
            <nav class="footer-nav" aria-label="Footer Navigation">
                <a href="reports.html" class="footer-link">Reports</a>
                <a href="schedule.html" class="footer-link">Schedule</a>
                <a href="clenro-reports.html" class="footer-link">CLENRO Data</a>
                <a href="settings.html" class="footer-link">Settings</a>
                ${!isSuperAdmin ? `<a href="mailto:clenro@cagayandeoro.gov.ph" class="footer-link" id="footer-contact-support">Contact Support</a>` : ''}
            </nav>
            <div class="footer-right">
                &copy; <span id="footer-year">${currentYear}</span> KatokKalinis. All rights reserved.
            </div>
        </div>
    `;
    mainContent.appendChild(footer);

    // If Super Admin, guarantee all support request triggers are scrubbed from footer and menus
    if (isSuperAdmin) {
        document.querySelectorAll('#footer-contact-support, .contact-support-link, [data-feature="contact-support"]').forEach(el => el.remove());
    }
}
window.renderAppFooter = renderAppFooter;

/*
|--------------------------------------------------------------------------
| RESPONSIVE TABLES WRAPPER
|--------------------------------------------------------------------------
| Wrap any table in .table-responsive so wide tables scroll inside their
| own container and never cause the page body to horizontally scroll.
*/
function ensureResponsiveTables() {
    document.querySelectorAll('table, .table, .clenro-table, .reports-table').forEach(tbl => {
        const parent = tbl.parentElement;
        if (!parent) return;
        if (!parent.classList.contains('table-responsive') && !parent.classList.contains('table-container')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'table-responsive';
            parent.insertBefore(wrapper, tbl);
            wrapper.appendChild(tbl);
        }
    });
}
window.ensureResponsiveTables = ensureResponsiveTables;

/* ==========================================================================
   KATOK SPA CLIENT ROUTER (PERSISTENT APP SHELL & INSTANT TRANSITIONS)
   ========================================================================== */

/* ==========================================================================
   DEBOUNCE & THROTTLE UTILITIES (LOAD REDUCTION)
   ========================================================================== */
function debounce(fn, wait = 220) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), wait);
    };
}
window.debounce = debounce;

function throttle(fn, limit = 180) {
    let inThrottle = false;
    return function(...args) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
window.throttle = throttle;

function setupSearchDebounce(root = document) {
    root.querySelectorAll('input[type="text"], input[type="search"]').forEach(input => {
        const id = (input.id || '').toLowerCase();
        const placeholder = (input.placeholder || '').toLowerCase();
        if (id.includes('search') || placeholder.includes('search')) {
            if (input.dataset.debounced) return;
            input.dataset.debounced = 'true';
            
            if (typeof input.oninput === 'function') {
                const originalOnInput = input.oninput;
                input.oninput = debounce((e) => originalOnInput.call(input, e), 220);
            }
        }
    });
}
window.setupSearchDebounce = setupSearchDebounce;

/* Wrap window.setInterval to pause background polling when tab is hidden or during navigation */
const _origSetInterval = window.setInterval;
window.setInterval = function(callback, delay, ...args) {
    if (typeof callback === 'function' && delay >= 1000) {
        const wrappedCallback = function() {
            if (!window.__isTabActive || (window.KatokSPA && window.KatokSPA.isNavigating)) {
                return;
            }
            callback(...args);
        };
        const id = _origSetInterval(wrappedCallback, delay);
        if (window.KatokSPA && window.KatokSPA.activeIntervals) {
            window.KatokSPA.activeIntervals.add(id);
        }
        return id;
    }
    return _origSetInterval(callback, delay, ...args);
};

/* ==========================================================================
   KATOK SPA CLIENT ROUTER (PERSISTENT APP SHELL & INSTANT TRANSITIONS)
   ========================================================================== */

const KatokSPA = {
    pageCache: new Map(),
    navAbortController: null,
    isNavigating: false,
    progressBarEl: null,
    activeIntervals: new Set(),

    routeDataMap: {
        'analytics.html': ['/analytics/overview'],
        'trucks.html': ['/trucks'],
        'employees.html': ['/employees'],
        'reports.html': ['/reports'],
        'users.html': ['/users'],
        'vendors.html': ['/vendors', '/barangays'],
        'attendance.html': ['/attendances'],
        'inspections.html': ['/inspections'],
        'schedule.html': ['/schedules', '/barangays'],
        'contractors.html': ['/contractors'],
        'barangay-overview.html': ['/overview/summary'],
        'archives.html': ['/reports', '/vendors'],
        'residents.html': ['/residents'],
        'activity-logs.html': ['/activity-logs']
    },

    init() {
        if (isAuthPage()) return;

        this.ensureProgressBar();
        this.ensureExtrasContainer();
        this.bindEvents();
        this.cacheCurrentPage();
        setupSearchDebounce(document);

        // Warm common data cache in background (idle)
        setTimeout(() => {
            apiRequest('/barangays').catch(() => {});
        }, 1200);

        // Listen for history traversal (Back/Forward)
        window.addEventListener('popstate', () => {
            const path = window.location.pathname.split('/').pop() || 'analytics.html';
            KatokSPA.navigate(path, false);
        });
    },

    clearPageIntervals() {
        this.activeIntervals.forEach(id => clearInterval(id));
        this.activeIntervals.clear();
    },

    ensureProgressBar() {
        let bar = document.getElementById('spa-progress-bar');
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'spa-progress-bar';
            document.body.appendChild(bar);
        }
        this.progressBarEl = bar;
    },

    ensureExtrasContainer() {
        let extras = document.getElementById('spa-page-extras');
        if (!extras) {
            extras = document.createElement('div');
            extras.id = 'spa-page-extras';
            document.body.appendChild(extras);
        }
    },

    cacheCurrentPage() {
        const pageName = window.location.pathname.split('/').pop() || 'analytics.html';
        this.pageCache.set(pageName, document.documentElement.outerHTML);
    },

    startProgress() {
        if (!this.progressBarEl) this.ensureProgressBar();
        this.progressBarEl.classList.add('active');
        this.progressBarEl.style.width = '30%';
        setTimeout(() => {
            if (this.progressBarEl && this.isNavigating) {
                this.progressBarEl.style.width = '75%';
            }
        }, 60);
    },

    finishProgress() {
        if (!this.progressBarEl) return;
        this.progressBarEl.style.width = '100%';
        setTimeout(() => {
            if (this.progressBarEl) {
                this.progressBarEl.classList.remove('active');
                this.progressBarEl.style.width = '0%';
            }
        }, 180);
    },

    highlightNav(targetUrl) {
        const pageName = (targetUrl.split('/').pop() || 'analytics.html').split('?')[0].split('#')[0];
        const pageWithExt = pageName.endsWith('.html') ? pageName : `${pageName}.html`;
        const pageWithoutExt = pageName.replace(/\.html$/, '');

        document.querySelectorAll('.nav-link').forEach(link => {
            const href = (link.getAttribute('href') || '').split('?')[0].split('#')[0];
            const isMatch = href === pageWithExt || href === pageWithoutExt || href === pageName;
            link.classList.toggle('active', isMatch);
            if (isMatch) {
                link.classList.add('nav-clicking');
                setTimeout(() => link.classList.remove('nav-clicking'), 250);
            }
        });
    },

    async prefetch(url) {
        if (!url || !this.isInternalLink(url)) return;
        const pageName = (url.split('/').pop() || '').split('?')[0].split('#')[0];

        // 1. Prefetch HTML document
        if (!this.pageCache.has(url) && !this.pageCache.has(pageName)) {
            try {
                const res = await fetch(url, { priority: 'low' });
                if (res.ok) {
                    const text = await res.text();
                    this.pageCache.set(url, text);
                    this.pageCache.set(pageName, text);
                }
            } catch (_) {}
        }

        // 2. Prefetch Route API Data into KatokSWR cache
        const endpoints = this.routeDataMap[pageName] || [];
        endpoints.forEach(ep => {
            apiRequest(ep).catch(() => {});
        });
    },

    isInternalLink(href) {
        if (!href) return false;
        if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:') || href.startsWith('#')) {
            return false;
        }
        return href.endsWith('.html') || (!href.includes('.') && !href.startsWith('/api'));
    },

    bindEvents() {
        // 1. Intercept internal navigation clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (!link) return;
            const href = link.getAttribute('href');

            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || link.hasAttribute('download') || link.getAttribute('target') === '_blank' || link.hasAttribute('data-no-spa')) {
                return;
            }

            if (this.isInternalLink(href)) {
                e.preventDefault();
                this.navigate(href, true);
            }
        });

        // 2. Instant prefetch on link hover / focus
        let hoverTimer = null;
        document.addEventListener('mouseover', (e) => {
            const link = e.target.closest('a[href]');
            if (!link || !this.isInternalLink(link.getAttribute('href'))) return;
            const href = link.getAttribute('href');
            clearTimeout(hoverTimer);
            hoverTimer = setTimeout(() => {
                KatokSPA.prefetch(href);
            }, 60);
        });

        document.addEventListener('focusin', (e) => {
            const link = e.target.closest('a[href]');
            if (link && this.isInternalLink(link.getAttribute('href'))) {
                KatokSPA.prefetch(link.getAttribute('href'));
            }
        });
    },

    async navigate(targetUrl, pushHistory = true) {
        if (this.isNavigating && this.navAbortController) {
            this.navAbortController.abort();
        }

        const cleanUrl = targetUrl.split('#')[0];
        const pageName = cleanUrl.split('/').pop() || 'analytics.html';

        this.isNavigating = true;

        // Immediately update history and highlight the target nav item (0ms response)
        if (pushHistory) {
            window.history.pushState({ spa: true, url: targetUrl }, '', targetUrl);
        }
        this.highlightNav(targetUrl);
        this.startProgress();

        // Abort in-flight network requests & clear previous page intervals
        KatokSWR.abortPending();
        this.clearPageIntervals();

        let html = this.pageCache.get(cleanUrl) || this.pageCache.get(pageName);

        if (!html) {
            try {
                this.navAbortController = new AbortController();

                // Show skeleton if loading takes more than 40ms
                const skeletonTimer = setTimeout(() => {
                    const contentRoot = document.querySelector('.content') || document.querySelector('.main-content');
                    if (contentRoot) {
                        contentRoot.innerHTML = `
                            <div class="spa-skeleton-root fade-in">
                                <div class="spa-skeleton-bar"></div>
                                <div class="spa-skeleton-grid-cards">
                                    <div class="spa-skeleton-card"></div>
                                    <div class="spa-skeleton-card"></div>
                                    <div class="spa-skeleton-card"></div>
                                    <div class="spa-skeleton-card"></div>
                                </div>
                                <div class="spa-skeleton-table"></div>
                            </div>
                        `;
                    }
                }, 40);

                const res = await fetch(cleanUrl, { signal: this.navAbortController.signal });
                clearTimeout(skeletonTimer);

                if (!res.ok) {
                    window.location.href = targetUrl;
                    return;
                }
                html = await res.text();
                this.pageCache.set(cleanUrl, html);
                this.pageCache.set(pageName, html);
            } catch (err) {
                if (err.name === 'AbortError') return;
                console.warn('[KatokSPA] Network fetch fallback:', err);
                window.location.href = targetUrl;
                return;
            }
        }

        // Parse incoming page DOM
        const parser = new DOMParser();
        const newDoc = parser.parseFromString(html, 'text/html');

        const doDOMSwap = async () => {
            await this.applyPageSwap(newDoc, targetUrl);
        };

        // Smooth transition using View Transitions API or 180ms CSS fade/slide
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (document.startViewTransition && !prefersReducedMotion) {
            try {
                await document.startViewTransition(async () => {
                    await doDOMSwap();
                }).finished;
            } catch (_) {
                await doDOMSwap();
            }
        } else {
            const mainEl = document.querySelector('.main-content') || document.querySelector('.content');
            if (mainEl && !prefersReducedMotion) {
                mainEl.classList.remove('spa-transition-fade-slide');
                void mainEl.offsetWidth; // force reflow
                mainEl.classList.add('spa-transition-fade-slide');
            }
            await doDOMSwap();
        }

        this.finishProgress();
        this.isNavigating = false;
        this.highlightNav(targetUrl);
    },

    async applyPageSwap(newDoc, targetUrl) {
        // 1. Update Title
        if (newDoc.title) {
            document.title = newDoc.title;
        }

        // 2. Swap Page Content while keeping Sidebar permanently mounted!
        const currentMain = document.querySelector('.main-content');
        const newMain = newDoc.querySelector('.main-content');

        if (currentMain && newMain) {
            currentMain.innerHTML = newMain.innerHTML;
        } else {
            const currentContent = document.querySelector('.content');
            const newContent = newDoc.querySelector('.content');
            if (currentContent && newContent) {
                currentContent.innerHTML = newContent.innerHTML;
            }
        }

        // 3. Swap Page Extras (Modals, Side Drawers outside .main-content)
        const extrasContainer = document.getElementById('spa-page-extras');
        if (extrasContainer) {
            extrasContainer.innerHTML = '';
            const outsideElements = Array.from(newDoc.body.children).filter(el => {
                const tag = el.tagName.toLowerCase();
                const cls = el.className || '';
                return tag !== 'script' &&
                       !cls.includes('sidebar') &&
                       !cls.includes('app-layout') &&
                       !cls.includes('dashboard-layout') &&
                       el.id !== 'spa-progress-bar' &&
                       el.id !== 'spa-page-extras';
            });
            outsideElements.forEach(el => {
                extrasContainer.appendChild(el.cloneNode(true));
            });
        }

        // 4. Inject Page-specific Styles
        document.querySelectorAll('style[data-spa-style="true"]').forEach(el => el.remove());
        const newStyles = newDoc.querySelectorAll('head style, head link[rel="stylesheet"]:not([href*="style.css"])');
        newStyles.forEach(st => {
            const clone = st.cloneNode(true);
            clone.setAttribute('data-spa-style', 'true');
            document.head.appendChild(clone);
        });

        // 5. Update Nav highlighting & App Shell Helpers (keep persistent sidebar intact)
        this.highlightNav(targetUrl);
        initMobileNav();
        renderAppFooter();
        ensureResponsiveTables();
        setupSearchDebounce(document);

        // 6. Asynchronously Load External Scripts (e.g. Leaflet, Chart.js, Analytics Components)
        const externalScripts = Array.from(newDoc.querySelectorAll('script[src]')).filter(s => {
            const src = s.getAttribute('src') || '';
            return !src.includes('app.js');
        });

        for (const scriptEl of externalScripts) {
            const src = scriptEl.getAttribute('src');
            if (!document.querySelector(`script[src="${src}"]`)) {
                await new Promise((resolve) => {
                    const tag = document.createElement('script');
                    Array.from(scriptEl.attributes).forEach(attr => tag.setAttribute(attr.name, attr.value));
                    tag.onload = resolve;
                    tag.onerror = resolve; // Continue on error
                    document.head.appendChild(tag);
                });
            }
        }

        // 7. Execute Inline Page Scripts safely
        const inlineScripts = Array.from(newDoc.querySelectorAll('script:not([src])'));
        if (inlineScripts.length > 0) {
            const origDocAdd = document.addEventListener;
            const origWinAdd = window.addEventListener;
            const domCallbacks = [];

            // Intercept DOMContentLoaded listeners to execute immediately
            document.addEventListener = function(evt, handler, opts) {
                if (evt === 'DOMContentLoaded') {
                    domCallbacks.push(handler);
                    return;
                }
                return origDocAdd.call(document, evt, handler, opts);
            };

            window.addEventListener = function(evt, handler, opts) {
                if (evt === 'DOMContentLoaded') {
                    domCallbacks.push(handler);
                    return;
                }
                return origWinAdd.call(window, evt, handler, opts);
            };

            for (const scriptEl of inlineScripts) {
                try {
                    let code = scriptEl.textContent || '';
                    // Convert const and let declarations to var so they can be re-declared without syntax collisions across SPA routes
                    code = code.replace(/\bconst\s+/g, 'var ').replace(/\blet\s+/g, 'var ');
                    
                    const fn = new Function(code);
                    fn.call(window);
                } catch (scriptErr) {
                    console.warn('[KatokSPA] Page script execution notice:', scriptErr);
                }
            }

            // Restore native listeners
            document.addEventListener = origDocAdd;
            window.addEventListener = origWinAdd;

            // Trigger deferred DOM ready callbacks
            domCallbacks.forEach(cb => {
                try {
                    cb({ type: 'DOMContentLoaded', target: document });
                } catch (cbErr) {
                    console.error('[KatokSPA] DOM callback error:', cbErr);
                }
            });

            this.highlightNav(targetUrl);
        }

        // Scroll to top of content area
        window.scrollTo({ top: 0, behavior: 'instant' });
    }
};
window.KatokSPA = KatokSPA;

// Run auth check on load
checkAuth();

document.addEventListener('DOMContentLoaded', () => {
    AdminLayout.init();
    if (!isAuthPage()) {
        loadSidebar();
        initMobileNav();
        renderAppFooter();
        ensureResponsiveTables();
        KatokSPA.init();
    }
});

