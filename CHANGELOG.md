# Changelog

All notable changes to the Obsidian Contractions Timer plugin and PWA web app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

Plugin versions use [Semantic Versioning](https://semver.org/). PWA web app changes are tracked by design round.

## [Unreleased]

## [Web R12] - 2026-02-13

### Added
- **P2P live sharing**: Real-time collaboration via WebRTC with Y.js CRDT conflict resolution
  - **Quick Connect**: One-tap room codes (`blue-tiger-42`) with automatic signaling via HTTP relay (ntfy.sh or Cloudflare Worker)
  - **Private Connect**: Zero-server mode with manual SDP exchange (QR codes or copy-paste)
  - **End-to-end encryption**: AES-256-GCM with PBKDF2 key derivation (100k iterations). Signaling relays only see encrypted blobs and routing hashes.
  - **Optional password**: Adds extra encryption layer on top of room code. Dice button auto-generates memorable passphrases (`calm-ember-frost-42`).
  - **QR code sharing**: Generate and scan QR codes for room URLs, invite codes, and response codes. Password baked into URL hash fragment.
  - **Auto-generated display names**: Pre-filled with friendly names (e.g., "Amber", "Breeze") — editable
  - **Connection progress indicators**: Phase-by-phase status ("Creating secure room...", "Waiting for partner...", "Completing handshake...")
  - **Wrong password detection**: Distinguishes "room not found" from "wrong password" errors
  - **Configurable servers**: STUN (Google, Cloudflare, custom), TURN (Open Relay, custom), signaling backend (ntfy.sh, CF Worker, custom)
  - **Tabbed UI**: Quick Connect vs Private Connect tabs with distinct visual sections
- **Hamburger menu**: Slide-out drawer for settings, themes, session management, sharing, export, and about
- **Header bar**: Fixed top bar with branding and hamburger toggle
- **Session archiving**: Archive current session and start fresh, restore or delete previous sessions
- **Storage warning**: Notification when localStorage quota is approaching limits
- **Sidebar navigation** (desktop): Persistent side nav for wider screens
- **Seed data**: Demo data generator for development and testing

### Fixed
- **Pause + delete stuck state**: Deleting the last contraction while paused no longer leaves the pause overlay stuck with no way to dismiss. Pause state now resets when contractions array becomes empty.

## [Web R11] - 2026-02-12

### Fixed
- **Settings deep-navigation**: Cog buttons and settings links now open the hamburger menu directly to the settings tab and scroll to the correct section (was opening to main menu tab)
- **Select dropdown white-on-white**: Native `<option>` elements now use theme colors via `:global()` CSS escape

### Added
- **Water break undo label**: Undo button shows visible "Undo" text next to the icon
- **Stat chance text**: Water break percentages show "chance" suffix for clarity (e.g., "8-15% chance")
- **Inline provider phone entry**: Enter provider phone number directly on the hospital page (expandable tel input) instead of navigating to settings
- **5-1-1 rule toggle**: New setting to hide threshold rule progress for users who don't use the 5-1-1 rule
- **Sky palette**: Colored-background theme — soft blue (light) / deep navy (dark)
- **Blush palette**: Colored-background theme — soft pink (light) / deep plum (dark)
- Total theme count: 20 (10 palettes x 2 modes)

## [Web R10] - 2026-02-12

### Added
- **Undo confirmation**: Water break removal requires two-tap confirm (prevents accidental undo)
- **Provider phone button**: Tappable button to navigate to settings for phone entry
- **Water break stats redesign**: Progress bars with bold percentages and descriptive labels
- **BH vs Real Labor comparison**: Row-based layout with icons (Clock, Activity, Footprints, MapPinned, TrendingUp)
- **Warning signs icons**: Per-item icons on warning signs card (Droplets, Baby, AlertTriangle, etc.)
- **Cervix dilation rings**: SVG ring visuals showing dilation progress in labor stage reference

## [Web R9] - 2026-02-11

### Added
- **Hospital advisor page**: Full 4-section layout — Departure Advice, 5-1-1 Rule Progress, Water Break Info, Clinical Reference
- **Collapsible sections**: Reorderable with up/down arrows + settings cog buttons
- **Hospital advisor algorithm**: 4-tier departure advice (stay home, prepare, call provider, go now)
- **Water break quick action**: Record with time picker (just now, ~5 min ago, etc.) + custom stepper
- **Clinical reference**: Labor stages table, warning signs, BH comparison chart

## [Web R8] - 2026-02-11

### Added
- **Design token system**: CSS custom properties for spacing (`--space-1` to `--space-8`), border radii, typography scale
- Migrated all components from hardcoded values to design tokens
- Consistent spacing and sizing across all 4 pages

## [Web R7] - 2026-02-11

### Added
- Theme picker polish with palette swatches and light/dark toggle
- Hamburger menu refinement (tabs: menu, settings)
- Settings reorganization into logical sections

## [Web R6] - 2026-02-11

### Added
- **Onboarding flow**: 3-step welcome walkthrough for first-time users
- **Contextual tips**: Educational tips that change based on labor stage
- **Empty states**: Dashboard and History pages show helpful messages when no data
- **Session controls**: Improved pause/resume/clear UI

## [Web R5] - 2026-02-11

### Added
- Empty states for Dashboard and History pages
- Dashboard polish and history timeline improvements

## [Web R4] - 2026-02-11

### Added
- **Theme expansion**: 8 palettes (Clinical, Soft, Warm, Ocean, Forest, Sunset, Lavender, Midnight)
- Contrast fixes for dark themes
- Wave chart refinement

## [Web R3] - 2026-02-11

### Added
- Dark theme contrast audit and fixes
- Typography scale refinement
- Bottom nav redesign

## [Web R2] - 2026-02-11

### Added
- Timer page layout improvements
- Big button sizing refinement
- Post-rating flow polish

## [Web R1] - 2026-02-11

### Added
- Initial visual polish pass
- Spacing and color consistency improvements

## [Web R0] - 2026-02-11

### Added
- Storage hardening (localStorage safety, quota warnings)
- Accessibility improvements
- Event types (water break tracking)
- Session management
- Advanced settings (BH thresholds, stage boundaries)

## [0.1.17] - 2026-02-09

### Added
- **Water break full UI reactivity**: Tapping "Water broke" now updates all components — hero shows urgent blue messaging ("Water broke — call your provider"), Braxton Hicks assessment gains a 7th "Water broke" criterion (weight 40, pushes score toward real labor), wave chart draws a blue dashed marker at the event time, and timeline table shows an interleaved event row with water drop icon.
- **Undo reversal**: Undoing a water break cleanly reverts all of the above — hero text, BH score, chart marker, and timeline row all disappear.

## [0.1.16] - 2026-02-09

### Added
- **Water break time editing**: After recording a water break, an "Edit time" button now appears alongside "Undo water broke". Tapping it opens the same time-ago picker (Just now, ~5 min, ~15 min, ~30 min, Earlier...) to adjust when the water actually broke.

## [0.1.15] - 2026-02-09

### Added
- **Save/Cancel on rating pickers**: Selecting an intensity or location no longer saves immediately. Instead, "Skip" transforms into green "Save" and red "Cancel" buttons. Save writes the selection; Cancel reverts it. Prevents accidental mis-ratings.

## [0.1.14] - 2026-02-09

### Fixed
- Intensity buttons (5-level scale) now wrap to two rows on mobile instead of cramming all five on one line with truncated text.

## [0.1.13] - 2026-02-09

### Added
- **"Show post-contraction rating" setting**: Master toggle (on by default) to disable intensity/location pickers entirely after stopping a contraction.
- Rating pickers now appear for untimed ("Had one") contractions too, not just timed ones.
- **Skip persists**: Clicking "Skip" on the rating card now marks that contraction as dismissed so pickers don't reappear on re-render. Previously, pickers would pop back up on every re-render until both intensity and location were set.

### Fixed
- Partial ratings (setting only intensity or only location) no longer cause pickers to nag forever. User can set one, click Skip, and move on. Analytics already handle partial data gracefully (need 3+ rated to compute trends).

## [0.1.12] - 2026-02-09

### Fixed
- Intensity/location pickers now appear after stopping a contraction. Bug: `stopContraction()` cleared the local pause flag but not the persisted `data.paused`, so on re-render the widget re-entered paused state and dismissed the pickers before the user could interact with them. Same fix applied to `startContraction()`.

## [0.1.11] - 2026-02-09

### Fixed
- Pause overlay fully opaque on all themes/platforms (removed all semi-transparent rgba fallbacks and backdrop-filter that failed on mobile WebView).

## [0.1.10] - 2026-02-09

### Fixed
- "Had one" button constrained to max-width so Start button isn't crammed on mobile.
- "Log missed" subtitle hidden on narrow screens (<360px) for a more compact layout.
- Dark mode pause overlay now fully opaque (was 30% transparent, timer text bled through).

## [0.1.9] - 2026-02-09

### Fixed
- Mobile layout: compact "Had one" button, shorter Start button text ("Start #N") on narrow screens.
- Pause overlay now fully opaque so timer text doesn't bleed through on mobile.
- Section headers no longer truncate on narrow screens (smaller badge, tighter layout).
- Very narrow screens (<280px) stack button row vertically.

## [0.1.8] - 2026-02-09

### Added
- **"Show seconds on rest timer" setting**: Optional toggle to display seconds in the rest timer when over 1 hour (off by default).

### Fixed
- Cancel X button in time-ago picker now always red (forced over Obsidian defaults).
- "Had one" button height now matches the Start button.

## [0.1.7] - 2026-02-09

### Added
- **"Earlier..." custom time stepper**: "Had one" picker now includes an "Earlier..." option that opens an hour/minute stepper (up to 48h ago) for contractions missed long ago.
- **Skip button on rating pickers**: Post-contraction intensity/location pickers now have a "Skip" button and are visually grouped in a bordered card, making it clear they're optional and dismissible.

### Fixed
- Untimed contractions no longer trigger the regular intensity/location pickers (the untimed confirmation has its own inline intensity picker).

## [0.1.6] - 2026-02-09

### Added
- **"Had one" untimed picker**: Redesigned missed-contraction logging with a compact "Had one" button next to Start. Tap it to choose how long ago (Just now, ~5 min, ~15 min, ~30 min), then rate intensity. Replaces the old full-width untimed button.
- **Smart rest timer**: Rest display now switches from `M:SS` to `Xh Ym` after 1 hour and `Xd Yh` after 24 hours, so long gaps between contractions are readable at a glance.
- **Always-visible sections**: Pattern Assessment, Trend Analysis, and Hospital Advisor sections now always appear with a placeholder message when there isn't enough data, so you can see and reorder all sections from the start.
- **Untimed contractions in charts**: Wave chart shows untimed contractions as dashed markers with diamond tips instead of bell curves. History table shows "Untimed" in the duration column.
- Untimed contractions are excluded from duration-based stats (average duration, 5-1-1 duration check, stage estimation) but included in interval and count calculations.

### Fixed
- Location picker disappearing when intensity was set before location (both pickers now stay visible until both are rated).

## [0.1.5] - 2026-02-09

### Fixed
- Post-contraction picker bug: setting intensity before location caused location picker to vanish on re-render. Condition now checks both fields.

## [0.1.4] - 2026-02-09

### Added
- Untimed contraction logging (initial version, later redesigned in 0.1.6).
- Smart rest timer formatting.
- Always-visible sections with placeholders.
- Untimed filtering in duration stats and Braxton Hicks assessment.

## [0.1.3] - 2026-02-08

### Fixed
- Mobile styling refinements for event buttons and pickers.

## [0.1.2] - 2026-02-08

### Added
- Configurable Braxton Hicks assessment thresholds.
- Duration editing in history timeline.
- Trend analysis clarity improvements.
- Wave chart threshold overlay.

## [0.1.1] - 2026-02-07

### Fixed
- Mobile layout and touch target sizing.
- Button spacing on narrow screens.

## [0.1.0] - 2026-02-07

### Added
- Initial release with full contraction timer widget.
- Big start/stop button with live timer display.
- Intensity (1-5) and location (front/back/wrapping) rating.
- Wave chart (TOCO-style) visualization.
- Summary cards (count, avg duration, avg interval).
- Timeline history table with inline editing.
- Hospital advisor with 5-1-1 rule tracking.
- Braxton Hicks pattern assessment (6 criteria).
- Trend analysis with session-filtered intervals.
- Water break event tracking.
- Contextual tips and clinical reference guide.
- Collapsible, reorderable sections.
- Stage duration bar and labor stage estimation.
- Haptic feedback support for mobile.
- Pause/resume functionality.
- Data stored as JSON in markdown code blocks.
