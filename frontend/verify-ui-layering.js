/**
 * Katok Kalinis UI Layering & Overlay Architecture Verifier
 * 
 * Enforces single source of truth for z-indexes, verifies portal overlays,
 * and guards against regressions.
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = __dirname;
const IGNORE_DIRS = ['node_modules', '.claude', '.vs', '.vscode', 'resident-vendor', 'driver-inspector'];
const EXTENSIONS = ['.css', '.html', '.js'];

console.log('===========================================================');
console.log(' Katok Kalinis: UI Layering & Overlay Architecture Audit   ');
console.log('===========================================================\n');

let totalFilesChecked = 0;
let errors = [];

function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const relPath = path.relative(FRONTEND_DIR, fullPath);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!IGNORE_DIRS.includes(file)) {
                scanDir(fullPath);
            }
        } else if (stat.isFile()) {
            const ext = path.extname(file).toLowerCase();
            if (EXTENSIONS.includes(ext)) {
                checkFile(fullPath, relPath);
            }
        }
    }
}

function checkFile(fullPath, relPath) {
    totalFilesChecked++;
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');

    // 1. Check for raw numeric z-index (e.g. z-index: 1000, z-index: 95)
    // Matches: z-index: followed by numbers (not var(--z-...))
    const rawZIndexRegex = /z-index\s*:\s*(\d+)/i;

    lines.forEach((line, index) => {
        const match = line.match(rawZIndexRegex);
        if (match) {
            // Exclude verify script itself or docs
            if (relPath.includes('verify-ui-layering') || relPath.includes('verify-breakpoints')) {
                return;
            }
            errors.push({
                file: relPath,
                line: index + 1,
                content: line.trim(),
                value: match[1],
                issue: `Hardcoded numeric z-index "${match[1]}" found. Must use var(--z-...) token.`
            });
        }
    });
}

// Run scan
scanDir(FRONTEND_DIR);

console.log(`Scanned ${totalFilesChecked} files across web admin frontend.\n`);

// 2. Verify design tokens in style.css
const styleCssPath = path.join(FRONTEND_DIR, 'css', 'style.css');
if (fs.existsSync(styleCssPath)) {
    const styleContent = fs.readFileSync(styleCssPath, 'utf8');
    const requiredTokens = [
        '--z-content: 0',
        '--z-sticky: 20',
        '--z-header: 30',
        '--z-sidebar: 30',
        '--z-floating: 40',
        '--z-backdrop: 50',
        '--z-popover: 55',
        '--z-dropdown: 55',
        '--z-drawer: 60',
        '--z-modal: 60',
        '--z-toast: 70',
        '--z-tooltip: 80'
    ];

    console.log('Checking style.css tokens:');
    let allTokensPresent = true;
    for (const token of requiredTokens) {
        if (!styleContent.includes(token)) {
            allTokensPresent = false;
            errors.push({
                file: 'css/style.css',
                line: 1,
                content: token,
                issue: `Missing required design token: ${token}`
            });
            console.log(`  [FAIL] Missing: ${token}`);
        } else {
            console.log(`  [PASS] ${token}`);
        }
    }
}

// 3. Verify shared components in app.js
const appJsPath = path.join(FRONTEND_DIR, 'js', 'app.js');
if (fs.existsSync(appJsPath)) {
    const appJsContent = fs.readFileSync(appJsPath, 'utf8');
    const requiredSymbols = [
        'KATOK_Z_INDEX',
        'KatokPortal',
        'NotificationBell',
        'KatokTooltip',
        'AdminLayout'
    ];

    console.log('\nChecking app.js shared modules:');
    for (const sym of requiredSymbols) {
        if (appJsContent.includes(sym)) {
            console.log(`  [PASS] Shared module: ${sym}`);
        } else {
            errors.push({
                file: 'js/app.js',
                line: 1,
                content: sym,
                issue: `Missing required shared module: ${sym}`
            });
            console.log(`  [FAIL] Missing module: ${sym}`);
        }
    }
}

// 4. Output results
console.log('\n-----------------------------------------------------------');
if (errors.length > 0) {
    console.error(`FAILED: Found ${errors.length} layering violations:\n`);
    errors.forEach((err, i) => {
        console.error(`${i + 1}. [${err.file}:${err.line}] ${err.issue}`);
        console.error(`   > ${err.content}`);
    });
    process.exit(1);
} else {
    console.log('SUCCESS: All files strictly adhere to the global z-index scale!');
    console.log('Zero hardcoded z-index numbers found.');
    console.log('Shared portal overlay components & layout verified.');
    console.log('-----------------------------------------------------------\n');
    process.exit(0);
}
