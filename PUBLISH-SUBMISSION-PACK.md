# TABWISE Publish + Payment Submission Pack

## 1) Current Status
- Build: passing
- Packaging: ready (`tabwise-v1.0.0.zip`)
- Payments: wired in code (ExtensionPay + Stripe flow)
- Final account-specific step: set your real ExtensionPay ID + plan nicknames in local env

## 2) Local Payment Config (copy/paste)
Create `.env.local` in project root with:

```env
VITE_EXTENSIONPAY_ID=YOUR_REAL_EXTENSIONPAY_EXTENSION_ID
VITE_EXTENSIONPAY_PLAN_MONTHLY=monthly
VITE_EXTENSIONPAY_PLAN_YEARLY=yearly
```

If your ExtensionPay plan nicknames are different, replace `monthly` and `yearly` with the exact nicknames from ExtensionPay.

## 3) What Is Already Wired
- Upgrade opens ExtensionPay checkout
- Restore access opens ExtensionPay login page
- Manage billing opens ExtensionPay management page
- Refresh status re-checks paid/free entitlement
- Pro gates unlock from real payment status
- If payments are not configured, UI shows clear state

## 4) Build + Zip Commands (copy/paste)
```bash
npm run build
rm -f tabwise-v1.0.0.zip && (cd dist && zip -r ../tabwise-v1.0.0.zip .)
```

## 5) Chrome Web Store Submission Fields (copy/paste)

### Product Name
```text
TABWISE — Smart Tab Optimizer
```

### Short Description
```text
Take control of tab chaos with smart grouping, RAM-saving suspension, and focus-first tab management.
```

### Category
```text
Productivity
```

### Single Purpose Description
```text
TABWISE helps users organize, suspend, restore, and reduce clutter across open browser tabs.
```

### Permissions Justification
```text
tabs: Used to read, group, suspend, restore, activate, create, and close browser tabs.

storage: Used to save local settings, tab registry data, reading queue items, recently closed sleeping tabs, and weekly report data on-device.

alarms: Used to generate the local weekly report on a schedule.
```

### Privacy / Data Disclosure Summary
```text
TABWISE stores data locally in the browser using chrome.storage.local. It does not require an external server for core tab management. The extension does not sell user data and does not use data for advertising.
```

## 6) Reviewer Notes (copy/paste)
```text
How to test core features:
1. Open several tabs across different sites.
2. Open TABWISE from the toolbar popup.
3. Verify tabs are grouped and duplicate domains are visible.
4. Suspend a tab from the Tabs view.
5. Confirm it appears in Sleeping and can be restored.
6. Save a tab to Reading Queue and reopen it.
7. Open Clusters view to verify grouping by intent.

How to test paid access:
1. Open Settings in the popup.
2. In TABWISE Pro Billing, click UPGRADE.
3. Complete checkout using Stripe test card flow configured in ExtensionPay.
4. Return to extension and click REFRESH if needed.
5. Already-paid testers can use RESTORE to reactivate access.

Notes:
- Core functionality runs locally.
- Weekly report is local via chrome.alarms.
- Billing, restore purchase, and entitlement refresh are available in-app.
```

## 7) Stripe/ExtensionPay Setup Checklist
1. In ExtensionPay, open your TABWISE extension config.
2. Confirm Stripe is connected in test mode (or live mode when ready).
3. Confirm plan nicknames match env values.
4. Add your real ExtensionPay ID to `.env.local`.
5. Rebuild and re-zip.
6. Upload `tabwise-v1.0.0.zip` to Chrome Web Store dashboard.

## 8) Suggested Screenshot Captions
```text
1. Tabs dashboard with active stats and sleeping tabs
2. One-click restore from the suspended tab page
3. Smart cluster grouping across work and research tabs
4. Reading Queue for reopening tabs later
5. Settings with billing and accessibility controls
```

## 9) Optional “What’s New in v1.0.0” (copy/paste)
```text
TABWISE 1.0.0 launches with a complete tab-management workflow for heavy browser users.

- Smart tab grouping by domain
- Duplicate tab detection and cleanup
- One-click tab suspension and restore
- Dedicated sleeping tabs section for fast recovery
- Read Later queue for soft-closing tabs
- Weekly local activity report
- Budget controls for tab discipline
- High-contrast readability option
- Recovery for sleeping tabs accidentally closed
```
