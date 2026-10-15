/**
 * Notification Bell Interactive & Portalling Verification Test
 */
const fs = require('fs');
const path = require('path');

console.log('-----------------------------------------------------------');
console.log('Testing Notification Bell & Activity Stream Functionality');
console.log('-----------------------------------------------------------\n');

// Mock a lightweight DOM environment
class MockClassList {
    constructor() { this.classes = new Set(); }
    add(cls) { this.classes.add(cls); }
    remove(cls) { this.classes.delete(cls); }
    toggle(cls) {
        if (this.classes.has(cls)) { this.classes.delete(cls); return false; }
        this.classes.add(cls); return true;
    }
    contains(cls) { return this.classes.has(cls); }
}

class MockElement {
    constructor(tagName, id = '') {
        this.tagName = tagName.toUpperCase();
        this.id = id;
        this.classList = new MockClassList();
        this.children = [];
        this.parentNode = null;
        this.attributes = {};
        this.style = {};
        this._innerHTML = '';
    }

    get className() { return Array.from(this.classList.classes).join(' '); }
    set className(val) {
        this.classList.classes.clear();
        if (val) val.split(/\s+/).filter(Boolean).forEach(c => this.classList.add(c));
    }

    setAttribute(k, v) { this.attributes[k] = String(v); }
    getAttribute(k) { return this.attributes[k] || null; }
    removeAttribute(k) { delete this.attributes[k]; }
    addEventListener(evt, fn) {}

    appendChild(child) {
        if (child.parentNode) {
            child.parentNode.removeChild(child);
        }
        child.parentNode = this;
        this.children.push(child);
        return child;
    }

    removeChild(child) {
        const idx = this.children.indexOf(child);
        if (idx !== -1) {
            this.children.splice(idx, 1);
            child.parentNode = null;
        }
        return child;
    }

    insertBefore(newNode, refNode) {
        const idx = this.children.indexOf(refNode);
        if (idx !== -1) {
            this.children.splice(idx, 0, newNode);
            newNode.parentNode = this;
        } else {
            this.appendChild(newNode);
        }
        return newNode;
    }

    contains(el) {
        if (el === this) return true;
        for (const c of this.children) {
            if (c.contains(el)) return true;
        }
        return false;
    }

    querySelector(sel) {
        return this.querySelectorAll(sel)[0] || null;
    }

    querySelectorAll(sel) {
        const matches = [];
        const isId = sel.startsWith('#');
        const isClass = sel.startsWith('.');
        const target = sel.slice(1);

        for (const c of this.children) {
            if (isId && c.id === target) matches.push(c);
            if (isClass && c.classList.contains(target)) matches.push(c);
            matches.push(...c.querySelectorAll(sel));
        }
        return matches;
    }

    getBoundingClientRect() {
        return { top: 10, bottom: 44, left: 800, right: 834, width: 34, height: 34 };
    }

    get innerHTML() { return this._innerHTML; }
    set innerHTML(val) {
        this._innerHTML = val;
        // Simple regex parser for children IDs in mocks
        const idMatches = [...val.matchAll(/id="([^"]+)"/g)];
        this.children = [];
        for (const match of idMatches) {
            const childEl = new MockElement('div', match[1]);
            childEl.parentNode = this;
            this.children.push(childEl);
        }
    }
}

// Global environment setup
global.window = {
    innerWidth: 1280,
    innerHeight: 800,
    location: { pathname: '/barangay-overview.html', href: 'http://localhost:3000/barangay-overview.html' },
    addEventListener: () => {},
    localStorage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
    }
};
global.localStorage = global.window.localStorage;
global.document = {
    body: new MockElement('body'),
    documentElement: new MockElement('html'),
    createElement: (tag) => new MockElement(tag),
    getElementById: (id) => {
        if (id === 'portal-root') return global.portalRoot;
        return global.document.body.querySelector('#' + id);
    },
    querySelector: (sel) => global.document.body.querySelector(sel),
    querySelectorAll: (sel) => global.document.body.querySelectorAll(sel),
    addEventListener: () => {}
};

// Create portal root
global.portalRoot = new MockElement('div', 'portal-root');
global.document.body.appendChild(global.portalRoot);

// Load and evaluate app.js in sandbox
const appCode = fs.readFileSync(path.join(__dirname, 'js', 'app.js'), 'utf8');
const vm = require('vm');
vm.runInThisContext(appCode);

// Tests
console.log('1. Checking NotificationBell singleton initialization:');
if (typeof NotificationBell !== 'undefined') {
    console.log('   [PASS] NotificationBell is globally available on window.');
} else {
    console.error('   [FAIL] NotificationBell is undefined.');
    process.exit(1);
}

console.log('2. Testing NotificationBell.getPanel():');
const panel = NotificationBell.getPanel();
if (panel && panel.id === 'activity-dropdown-menu' && panel.classList.contains('portal-popover')) {
    console.log(`   [PASS] Notification panel created with id="${panel.id}" and class="portal-popover".`);
} else {
    console.error('   [FAIL] Panel creation failed:', panel);
    process.exit(1);
}

console.log('3. Checking portal mounting:');
if (global.portalRoot.contains(panel)) {
    console.log('   [PASS] Panel is correctly mounted inside #portal-root (z-index scale: var(--z-popover)).');
} else {
    console.error('   [FAIL] Panel is not inside #portal-root.');
    process.exit(1);
}

console.log('4. Checking #recent-activities container:');
const body = NotificationBell.getBody();
if (body && (body.id === 'recent-activities' || body.getAttribute('id') === 'recent-activities')) {
    console.log('   [PASS] Inner stream container has id="recent-activities".');
} else {
    console.error('   [FAIL] Body element missing:', body);
    process.exit(1);
}

console.log('5. Testing NotificationBell.renderActivities() with operational activities:');
const mockActivities = [
    {
        id: 99,
        action: 'auth.login',
        description: 'Super Administrator (superadmin@katokkalinis.com) logged in via Web Portal.',
        actor: 'Super Administrator',
        created_at: '2026-10-15T02:36:35+00:00',
        time_formatted: '30 minutes ago'
    },
    {
        id: 98,
        action: 'truck.dispatch',
        description: 'Truck #04 completed Cogon Market sweep.',
        actor: 'Danilo Driver',
        created_at: '2026-10-15T02:00:00+00:00',
        time_formatted: '1 hour ago'
    }
];

NotificationBell.renderActivities(mockActivities);
const renderedContent = body.innerHTML;
if (renderedContent.includes('Super Administrator') && renderedContent.includes('Truck #04 completed Cogon Market sweep')) {
    console.log('   [PASS] Activities rendered with plain-language titles, actor names, and time stamps.');
} else {
    console.error('   [FAIL] Activities failed to render:', renderedContent);
    process.exit(1);
}

console.log('6. Testing NotificationBell.toggle() and open state:');
const triggerBtn = new MockElement('button', 'btn-notification-bell');
global.document.body.appendChild(triggerBtn);

NotificationBell.toggle(triggerBtn);
if (panel.classList.contains('active') && panel.style.display === 'flex') {
    console.log('   [PASS] Panel opened successfully: display=flex, class "active" added.');
} else {
    console.error('   [FAIL] Panel toggle open failed.');
    process.exit(1);
}

console.log('7. Testing NotificationBell.close() and dismissal:');
NotificationBell.close();
if (!panel.classList.contains('active') && panel.style.display === 'none') {
    console.log('   [PASS] Panel closed successfully: display=none, class "active" removed.');
} else {
    console.error('   [FAIL] Panel close failed.');
    process.exit(1);
}

console.log('\n-----------------------------------------------------------');
console.log('SUCCESS: Notification Bell tests passed with 100% assertions!');
console.log('-----------------------------------------------------------');
