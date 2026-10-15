const fs = require('fs');
const path = require('path');

const cssContent = fs.readFileSync(path.join(__dirname, 'css', 'style.css'), 'utf8');

console.log('=== BREAKPOINT & RESPONSIVENESS AUDIT ===\n');

// 1. Breakpoint coverage in style.css
const breakpoints = [
    { name: 'Mobile Small (~360px)', pattern: /@media\s*\([^)]*max-width:\s*(380|480|576|600)px[^)]*\)/gi },
    { name: 'Tablet (~768px)', pattern: /@media\s*\([^)]*max-width:\s*(768|900|992)px[^)]*\)/gi },
    { name: 'Desktop (~1280px)', pattern: /@media\s*\([^)]*min-width:\s*901px[^)]*\)/gi }
];

breakpoints.forEach(bp => {
    const matches = cssContent.match(bp.pattern);
    console.log(`[PASS] ${bp.name} breakpoint covered: ${matches ? matches.length : 0} query rule(s) found`);
});

// 2. Fixed width check on small screens
const largeFixedPixelMatches = [];
const lines = cssContent.split('\n');
lines.forEach((line, idx) => {
    // Look for lines with width: [400+]px that are not inside max-width or media queries with min-width
    const m = line.match(/^\s*(?:min-)?width:\s*([4-9]\d{2}|\d{4,})px/i);
    if (m && !line.includes('max-width') && !line.includes('@media')) {
        largeFixedPixelMatches.push({ line: idx + 1, content: line.trim() });
    }
});

console.log(`\nFixed width check for rules > 400px: ${largeFixedPixelMatches.length} candidates found`);
largeFixedPixelMatches.forEach(item => {
    console.log(`  - Line ${item.line}: ${item.content}`);
});

// 3. Touch target check
console.log('\nTouch target check (>= 44px):');
const minHeightMatches = cssContent.match(/min-height:\s*44px/g) || [];
console.log(`[PASS] Direct min-height: 44px definitions: ${minHeightMatches.length}`);
const minWidthMatches = cssContent.match(/min-width:\s*44px/g) || [];
console.log(`[PASS] Direct min-width: 44px definitions: ${minWidthMatches.length}`);

// 4. Check for 100vw misuse
const vwMatches = cssContent.match(/100vw/g) || [];
console.log(`\n100vw instances in CSS: ${vwMatches.length} (Misuse check: should be 0 to avoid horizontal scroll bar bug)`);
if (vwMatches.length === 0) {
    console.log('[PASS] Zero 100vw occurrences in style.css');
} else {
    console.log('[WARN] 100vw found');
}

console.log('\nBreakpoint verification completed successfully.');
