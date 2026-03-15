# TABWISE — Investor & Demo Write-Up

## 1) Problem
Modern knowledge workers run their day inside browser tabs. Context switching, duplicate tabs, and stale pages create cognitive drag and reduce performance.

**Pain points:**
- Too many open tabs to navigate efficiently
- Duplicates waste attention and memory
- Users don’t know what to close vs keep
- Browser sessions are hard to recover intentionally

## 2) Solution
TABWISE is a Chrome extension that turns tab chaos into an actionable control panel.

It provides:
- Real-time tab visibility
- Smart grouping and duplicate controls
- Memory-aware suspension workflows
- Focus tools and read-later queueing
- Local weekly behavior analytics

## 3) Product Experience
TABWISE uses a single 360px popup with five views:
1. **Tabs** — Domain groups, duplicate counts, jump, suspend/restore
2. **Clusters** — Intent-based grouping with close/save actions
3. **Focus** — Tab budget controls and stale-tab recommendations (Pro)
4. **Queue** — Read Later workflow with reopen/remove actions
5. **Report** — Weekly usage and behavior summary (Pro)

## 4) Core Technology
- **Platform:** Chrome Extension, Manifest V3
- **Frontend:** React + Vite + CRXJS
- **Background orchestration:** service worker with event-driven tab registry
- **Storage:** `chrome.storage.local` (local-first)
- **Monetization readiness:** paywall architecture + upgrade trigger messaging

### Runtime model
- Popup reads state from hooks and local storage
- Background worker captures tab lifecycle events
- Registry tracks metadata (createdAt, visited, cluster, suspended state, estimated RAM)
- Alarm job generates weekly report snapshots

## 5) Feature Highlights
### Tab Intelligence
- Domain-level grouping
- Duplicate identification and cleanup
- Fast tab activation from popup

### Memory Management
- One-click suspend and restore
- Estimated RAM per tab and aggregate usage
- Visual RAM pressure bar in header

### Focus & Workflow
- Tab budget slider (focus limit)
- Dustiest-tab suggestions for cleanup
- Read Later queue with soft-close behavior

### Analytics
- Weekly report with:
  - Tabs opened
  - Revisit rate
  - Suspended count
  - Average tab age
  - Top domains
  - Summary insight string

## 6) Monetization Strategy
**Freemium model:**
- Free: core tab control and visibility
- Pro: Focus Mode + Weekly Report + premium workflows

**Pricing hooks in UI:**
- Monthly: $3.99/mo
- Yearly: $29.99/yr (best value)

The paywall gate is integrated at the feature-view level, enabling controlled expansion of premium capabilities.

## 7) Competitive Positioning
TABWISE sits between:
- basic tab managers (too shallow), and
- heavy productivity suites (too complex).

It aims for a fast, visual, low-friction control center for high-tab users.

## 8) Product Principles
- **Local-first:** private by default
- **Fast interaction:** one-click actions, compact UI
- **Actionable insight:** guidance, not just data
- **Progressive monetization:** valuable free core, compelling Pro upgrades

## 9) Current State
- Working extension build with core flow complete
- Live tab data hooked into UI
- Local storage and background registry active
- Pro gate architecture in place
- Weekly report generation active via alarms

## 10) Roadmap Opportunities
- Session restore library and named workspace bundles
- Smarter duplicate heuristics (semantic tab similarity)
- Better RAM model calibration with device heuristics
- Team/shared profile modes for power users
- Funnel instrumentation for conversion optimization

## 11) Demo Script (3–5 min)
1. Open popup → show tab, RAM, dust, duplicate overview
2. Jump to tab from list and expand duplicate group
3. Suspend a stale tab and show immediate feedback
4. Switch to clusters → close or save a cluster
5. Show Focus Mode gate and upgrade flow prompt
6. Show Read Later soft-close and reopen flow
7. End on Weekly Report view and local-first message

## 12) Why TABWISE Can Win
TABWISE addresses a daily, high-frequency pain point with low adoption friction (browser extension), clear visible value in seconds, and a monetizable progression path for heavy users.
