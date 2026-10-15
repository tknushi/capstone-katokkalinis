/**
 * Katok Kalinis - Reusable UI Components for Analytics & Dashboards
 * Provides reusable presentation components with built-in loading, empty, and error states.
 */

window.KatokUI = (function() {
    'use strict';

    // ── Skeleton Generators ──────────────────────────────────────────────
    const Skeleton = {
        statCard(id = '') {
            return `
                <div class="stat-card-upgraded skeleton-card" ${id ? `id="${id}"` : ''}>
                    <div class="skeleton" style="width: 40px; height: 40px; border-radius: 10px; margin-bottom: 12px;"></div>
                    <div class="skeleton skeleton-title" style="width: 55%; height: 16px; margin-bottom: 8px;"></div>
                    <div class="skeleton skeleton-number" style="width: 40%; height: 32px; margin-bottom: 12px;"></div>
                    <div class="skeleton skeleton-text" style="width: 75%; height: 12px;"></div>
                </div>
            `;
        },
        kpiCard(id = '') {
            return `
                <div class="kpi-card-upgraded skeleton-card" ${id ? `id="${id}"` : ''}>
                    <div class="skeleton skeleton-title" style="width: 60%; height: 14px; margin-bottom: 10px;"></div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="skeleton skeleton-number" style="width: 45%; height: 28px;"></div>
                        <div class="skeleton" style="width: 50px; height: 50px; border-radius: 50%;"></div>
                    </div>
                    <div class="skeleton skeleton-text" style="width: 80%; height: 12px; margin-top: 10px;"></div>
                </div>
            `;
        },
        chartBlock(height = 240) {
            return `
                <div class="skeleton" style="width: 100%; height: ${height}px; border-radius: 8px;"></div>
            `;
        },
        heatmapTiles(count = 12) {
            return Array.from({ length: count }).map(() => `
                <div class="skeleton" style="height: 84px; border-radius: 10px;"></div>
            `).join('');
        }
    };

    // ── Reusable StatCard Component ──────────────────────────────────────
    function StatCard({ title, val, meta, trend, trendClass = 'stat-trend-good', link = '#', sparkline = null, icon = '' }) {
        let sparklineSvg = '';
        if (sparkline && sparkline.length >= 2) {
            const width = 72;
            const height = 22;
            const min = Math.min(...sparkline);
            const max = Math.max(...sparkline);
            const range = max - min || 1;
            const coords = sparkline.map((p, i) => {
                const x = (i / (sparkline.length - 1)) * (width - 4) + 2;
                const y = height - 4 - ((p - min) / range) * (height - 8);
                return `${x.toFixed(1)},${y.toFixed(1)}`;
            });
            const color = trendClass.includes('bad') ? '#ef4444' : '#16a34a';
            sparklineSvg = `
                <svg class="stat-sparkline-svg" viewBox="0 0 ${width} ${height}" aria-hidden="true">
                    <polyline fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${coords.join(' ')}" />
                </svg>
            `;
        }

        return `
            <a href="${link}" class="stat-card-upgraded fade-in" title="View details on ${escapeHtml(title)}" aria-label="${escapeHtml(title)}: ${val}">
                <div class="stat-card-top">
                    <div class="stat-icon-wrap" aria-hidden="true">${icon}</div>
                    <span class="stat-trend-badge ${trendClass}">${trend}</span>
                </div>
                <div>
                    <h3 class="stat-card-title">${escapeHtml(title)}</h3>
                    <div class="stat-card-val">${val}</div>
                </div>
                <div class="stat-card-bottom">
                    <span class="stat-card-meta">${escapeHtml(meta)}</span>
                    ${sparklineSvg}
                </div>
            </a>
        `;
    }

    // ── Reusable KpiCard Component ───────────────────────────────────────
    function KpiCard({ label, val, sub, ringPercent, ringColor = '#16a34a', type = '', link = '#', trendText = '' }) {
        const size = 52;
        const radius = 21;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (ringPercent / 100) * circumference;

        return `
            <a href="${link}" class="kpi-card-upgraded ${type} fade-in" title="View ${escapeHtml(label)} details" aria-label="${escapeHtml(label)}: ${val}">
                <div class="kpi-header">
                    <span class="kpi-label">${escapeHtml(label)}</span>
                    ${trendText ? `<span class="stat-trend-badge stat-trend-good">${escapeHtml(trendText)}</span>` : ''}
                </div>
                <div class="kpi-body">
                    <div>
                        <div class="kpi-val">${val}</div>
                        <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">${escapeHtml(sub)}</div>
                    </div>
                    <div class="kpi-ring-wrap" style="width:${size}px; height:${size}px;" aria-hidden="true">
                        <svg class="kpi-ring-svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                            <circle class="kpi-ring-bg" cx="${size/2}" cy="${size/2}" r="${radius}" stroke-width="4.5" fill="none" />
                            <circle class="kpi-ring-fg" cx="${size/2}" cy="${size/2}" r="${radius}" stroke-width="4.5" fill="none" stroke="${ringColor}" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" />
                        </svg>
                        <div class="kpi-ring-text">${Math.round(ringPercent)}%</div>
                    </div>
                </div>
                <div class="kpi-footer">
                    <span>Performance Target</span>
                    <span class="kpi-view-arrow">View &rarr;</span>
                </div>
            </a>
        `;
    }

    // ── Empty & Error State Blocks ───────────────────────────────────────
    function EmptyState({ title = 'No data recorded yet', message = 'There are no active records in this category.', iconSvg = null }) {
        return `
            <div class="state-box fade-in" role="status">
                <div class="state-icon" aria-hidden="true">
                    ${iconSvg || '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'}
                </div>
                <h4>${escapeHtml(title)}</h4>
                <p>${escapeHtml(message)}</p>
            </div>
        `;
    }

    function ErrorState({ title = 'Failed to load data', message = 'A network or server error occurred.', onRetryFn = 'refreshAllAnalytics()' }) {
        return `
            <div class="state-box state-box-error fade-in" role="alert">
                <div class="state-icon state-error-icon" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                </div>
                <h4>${escapeHtml(title)}</h4>
                <p>${escapeHtml(message)}</p>
                <button type="button" class="retry-btn" onclick="${onRetryFn}">Try again</button>
            </div>
        `;
    }

    return {
        Skeleton,
        StatCard,
        KpiCard,
        EmptyState,
        ErrorState
    };
})();
