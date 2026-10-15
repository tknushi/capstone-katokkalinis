const fs = require('fs');
const path = require('path');

const frontendDir = __dirname;
const htmlFiles = fs.readdirSync(frontendDir).filter(f => f.endsWith('.html'));

console.log(`Found ${htmlFiles.length} HTML files: ${htmlFiles.join(', ')}\n`);

let passed = 0;
let warnings = 0;
let errors = 0;

function check(label, condition, detail = '') {
    if (condition) {
        console.log(`  [PASS] ${label}`);
        passed++;
    } else {
        console.log(`  [FAIL] ${label} ${detail ? '--> ' + detail : ''}`);
        errors++;
    }
}

function warn(label, detail = '') {
    console.log(`  [WARN] ${label} --> ${detail}`);
    warnings++;
}

console.log('=== 1. CHECKLIST ITEMS 16, 17, 18: HEAD METADATA (Favicons, Titles, Meta Descriptions) ===');
const titles = new Set();
htmlFiles.forEach(file => {
    const content = fs.readFileSync(path.join(frontendDir, file), 'utf8');
    
    // Title check
    const titleMatch = content.match(/<title>(.*?)<\/title>/i);
    const hasTitle = Boolean(titleMatch && titleMatch[1].trim());
    const titleText = hasTitle ? titleMatch[1].trim() : '';
    const isDescriptive = hasTitle && titleText.includes('Katok Kalinis') && titleText.length > 15;
    check(`${file}: Descriptive <title>`, isDescriptive, `Found: "${titleText}"`);
    if (hasTitle) titles.add(titleText);

    // Meta description check
    const metaDescMatch = content.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
    const hasMetaDesc = Boolean(metaDescMatch && metaDescMatch[1].trim().length > 20);
    check(`${file}: <meta name="description">`, hasMetaDesc, metaDescMatch ? metaDescMatch[1] : 'MISSING');

    // Favicon links
    const hasFavicon = content.includes('favicon.svg') || content.includes('favicon-32x32.png') || content.includes('favicon.ico');
    check(`${file}: Favicon linked`, hasFavicon, hasFavicon ? 'OK' : 'MISSING');
});

console.log(`\nUnique titles count: ${titles.size} of ${htmlFiles.length} pages`);

console.log('\n=== 2. CHECKLIST ITEMS 1, 3: RESPONSIVE TABLES & MOBILE OVERFLOW ===');
htmlFiles.forEach(file => {
    const content = fs.readFileSync(path.join(frontendDir, file), 'utf8');
    const tableMatches = content.match(/<table[\s\S]*?<\/table>/gi) || [];
    if (tableMatches.length > 0) {
        // Check if table is contained
        const hasResponsive = content.includes('table-responsive') || content.includes('overflow-x: auto');
        check(`${file}: ${tableMatches.length} table(s) wrapped in responsive container`, hasResponsive);
    }
});

console.log('\n=== 3. CHECKLIST ITEM 5: DEAD LINKS (href="#") ===');
htmlFiles.forEach(file => {
    const content = fs.readFileSync(path.join(frontendDir, file), 'utf8');
    // Look for href="#" that is not a specific hash like href="#section"
    const deadLinks = (content.match(/href=["']#["']/g) || []).length;
    check(`${file}: Zero href="#" dead links`, deadLinks === 0, `Found ${deadLinks} dead href="#" links`);
});

console.log('\n=== 4. CHECKLIST ITEMS 12, 13: RAW ALERT() REPLACEMENT ===');
htmlFiles.forEach(file => {
    const content = fs.readFileSync(path.join(frontendDir, file), 'utf8');
    // Find unhandled alert(
    const alertMatches = content.match(/alert\s*\(/g) || [];
    check(`${file}: Zero unhandled alert() calls`, alertMatches.length === 0, `Found ${alertMatches.length} raw alert() calls`);
});

console.log('\n=== 5. CHECKLIST ITEM 14: PLACEHOLDER TEXT ===');
const placeholderTerms = ['lorem ipsum', 'coming soon', 'placeholder text', 'john doe'];
htmlFiles.forEach(file => {
    const content = fs.readFileSync(path.join(frontendDir, file), 'utf8').toLowerCase();
    placeholderTerms.forEach(term => {
        const found = content.includes(term);
        if (found) {
            warn(`${file}: Contains placeholder term "${term}"`);
        }
    });
});

console.log('\n=== 6. CHECKLIST ITEM 16: FAVICON ASSETS VERIFICATION ===');
const requiredAssets = [
    'img/favicon.svg',
    'img/favicon-16x16.png',
    'img/favicon-32x32.png',
    'img/apple-touch-icon.png',
    'favicon.ico',
    'site.webmanifest',
    'img/clenro-logo.webp',
    'img/clenro-logo-optimized.png',
    '404.html'
];
requiredAssets.forEach(asset => {
    const p = path.join(frontendDir, asset);
    check(`Asset exists: ${asset}`, fs.existsSync(p));
});

console.log('\n=== 7. CHECKLIST ITEM 2, 4, 15: GLOBAL JS & CSS VERIFICATION ===');
const styleCss = fs.readFileSync(path.join(frontendDir, 'css', 'style.css'), 'utf8');
const appJs = fs.readFileSync(path.join(frontendDir, 'js', 'app.js'), 'utf8');

check('style.css: Global overflow-x: hidden', styleCss.includes('overflow-x: hidden'));
check('style.css: Mobile nav toggle styling', styleCss.includes('.mobile-nav-toggle'));
check('style.css: Sidebar off-canvas mobile layout', styleCss.includes('translateX(-100%)'));
check('style.css: Touch targets >= 44px', styleCss.includes('min-height: 44px') || styleCss.includes('44px'));
check('style.css: .table-responsive styling', styleCss.includes('.table-responsive'));

check('app.js: initMobileNav function exists', appJs.includes('initMobileNav'));
check('app.js: formatPhoneLink (tel:) helper exists', appJs.includes('formatPhoneLink') && appJs.includes('tel:'));
check('app.js: formatEmailLink (mailto:) helper exists', appJs.includes('formatEmailLink') && appJs.includes('mailto:'));
check('app.js: Dynamic copyright year (new Date().getFullYear())', appJs.includes('new Date().getFullYear()'));
check('app.js: Clickable logo brand link', appJs.includes('sidebar-brand-link'));
check('app.js: ensureResponsiveTables helper exists', appJs.includes('ensureResponsiveTables'));

console.log(`\n========================================`);
console.log(`AUDIT SUMMARY: ${passed} PASSED, ${warnings} WARNINGS, ${errors} ERRORS`);
console.log(`========================================\n`);

process.exit(errors > 0 ? 1 : 0);
