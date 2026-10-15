# Katok Kalinis UI Layering & Overlay Architecture

This document serves as the **single source of truth** for all visual stacking, z-index hierarchy, layout conventions, and overlay behaviors across all admin-side pages for both **Super Admin** and **Barangay Admin** roles in Katok Kalinis.

---

## 1. Global Z-Index Scale (Strict Hierarchy)

Raw numbers for `z-index` (e.g. `z-index: 9999`, `z-index: 1000`) are **strictly prohibited** in component CSS and inline HTML styles. All styling must use the standardized CSS design tokens defined in `:root` of `css/style.css`:

| Token | Numeric Value | Usage & Scope |
| :--- | :---: | :--- |
| `--z-content` | `0` | Standard page content, normal cards, table rows, badges, charts, canvas |
| `--z-sticky` | `20` | Sticky filter bars (`.sticky-filter-bar`), sticky table headers (`thead th`), sticky pagination (`.pagination-container`), sticky drawer headers |
| `--z-header` | `30` | Main topbar header (`.topbar`) |
| `--z-sidebar` | `30` | Main navigation sidebar (`.sidebar` on desktop) |
| `--z-floating` | `40` | Floating action elements: FAB (`.fab-container`), Floating Help (`.help-floating-btn`), Back to Top (`.back-to-top-btn`) |
| `--z-backdrop` | `50` | Modal/Drawer backdrops (`.modal`, `.drawer-backdrop`, `.image-lightbox-modal`, `.export-modal-backdrop`), mobile sidebar backdrop (`.sidebar-backdrop`) |
| `--z-popover` / `--z-dropdown` | `55` | Notification bell panel (`#portal-notification-panel`), profile dropdown (`#profile-dropdown-menu`), action menus, combobox menus, help panels |
| `--z-drawer` / `--z-modal` | `60` | Modals (`.modal-content`, `.lightbox-dialog`), Side Drawers (`.brgy-side-drawer`), mobile off-canvas drawer (`.sidebar.mobile-open`) |
| `--z-toast` | `70` | Toast notifications container (`#toast-container`), SPA loading progress bar (`#spa-progress-bar`) |
| `--z-tooltip` | `80` | Floating portal tooltips (`#portal-tooltip`, `.portal-tooltip`) |

---

## 2. Core Architectural Rules

### Rule 1: Always Use Shared Portal-Based Overlays
Dropdowns, notification panels, modals, drawers, and tooltips must render through `#portal-root` directly on `document.body`.
- **Why**: When overlays are placed inside page components (like `.topbar`, `.filter-bar`, or `.card`), any parent with `overflow: hidden`, `position: relative`, `transform`, `filter`, or `backdrop-filter` creates a new stacking context and clips or hides the overlay behind sticky elements.
- **Implementation**: Use `KatokPortal.openPopover(trigger, element, options)` or `NotificationBell.toggle(trigger)`. Modals and drawers with `.active` are automatically teleported to `#portal-root` by the global layout observer.

### Rule 2: Sticky Elements Never Cover Overlays
- All sticky filter bars and table headers must use `z-index: var(--z-sticky);` (`20`).
- Because portal popovers (`55`) and the topbar header (`30`) are higher than `20`, sticky filters will slide smoothly under the topbar and will **never** obscure or slice through open notification or dropdown panels.

### Rule 3: Single Active Popover Policy
- Only **one** dropdown or popover can be active at a time.
- Opening the notification bell automatically closes the profile menu or any open action dropdown, and vice versa.
- A transparent click-catcher (`.portal-click-catcher`) rendered at `calc(var(--z-popover) - 1)` catches outside clicks cleanly, dismissing the active popover without triggering underlying links, buttons, or filters.

### Rule 4: Floating Action Stacking & Safe Offsets
- Bottom-right floating elements are grouped in `#floating-actions-container` stacked with a consistent **12px vertical gap** (from bottom: FAB, Help, Back to Top).
- `.main-content` enforces `padding-bottom: 84px !important;` so floating buttons never cover the last table rows or pagination controls.
- Toasts are anchored at top-right **offset below the header** (`top: calc(var(--topbar-height) + 16px)`) so they never block the topbar header, notification bell, or sticky filter bars.
- In print stylesheets (`@media print`), all floating buttons, tooltips, backdrops, and sidebars are automatically hidden (`display: none !important;`).

### Rule 5: Zero Horizontal Page Scroll
- `html, body` and `.main-content` enforce `overflow-x: hidden;` and `max-width: 100%;`.
- Flex containers enforce `min-width: 0;` on flex children to prevent table blowouts.
- All wide data tables are wrapped in `.table-responsive` with internal `overflow-x: auto;`.

---

## 3. Automated Verification & Regression Prevention

Run the automated UI layering check before committing changes:
```bash
node verify-ui-layering.js
```
The check verifies:
1. Zero hardcoded numeric `z-index: <number>` across all CSS, HTML, and JS files.
2. All CSS `z-index` declarations use `var(--z-...)`.
3. Presence of shared layout & portal definitions.
