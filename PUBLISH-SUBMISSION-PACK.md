# TABWISE — Chrome Web Store Submission Pack

> Everything below is copy-paste ready. Replace any `YOUR_GITHUB_USERNAME` placeholders once your repo is live.

---

## STATUS CHECKLIST

- [x] Build passing (`npm run build`)
- [x] `suspended.html` ships in dist
- [x] CSP-safe (no inline scripts)
- [x] Permissions trimmed to least-privilege
- [x] Payment wired (ExtensionPay + Stripe)
- [x] Privacy policy page created (`privacy-policy.html`)
- [ ] GitHub repo live (run `publish-to-github.sh` or do manual steps below)
- [ ] ExtensionPay ID set in `.env.local` + rebuilt + re-zipped

---

## STEP 1 — Local Payment Config

Create `.env.local` in the project root:

```env
VITE_EXTENSIONPAY_ID=YOUR_REAL_EXTENSIONPAY_EXTENSION_ID
VITE_EXTENSIONPAY_PLAN_MONTHLY=monthly
VITE_EXTENSIONPAY_PLAN_YEARLY=yearly
```

Replace `monthly` / `yearly` with your exact ExtensionPay plan nicknames if different.

## STEP 2 — Final Build + Zip

```bash
npm run build
rm -f tabwise-v1.0.0.zip && (cd dist && zip -r ../tabwise-v1.0.0.zip .)
```

## STEP 3 — Push to GitHub (for privacy policy URL)

Run the helper script (created automatically):

```bash
bash publish-to-github.sh
```

Or manually:

```bash
gh auth login --web
gh repo create tabwise --public --description "Smart tab optimizer Chrome extension" --source=. --remote=origin --push
# Then enable GitHub Pages on the repo: Settings > Pages > Deploy from branch > main / root
```

**Your privacy policy URL will be:**
```
https://YOUR_GITHUB_USERNAME.github.io/tabwise/privacy-policy.html
```

---

## CHROME WEB STORE -- ALL FIELDS (copy-paste ready)

---

### STORE LISTING -- Extension name (45 char max)
```
TABWISE - Smart Tab Optimizer
```

---

### STORE LISTING -- Short description (132 char max)
```
Take control of tab chaos. Smart tab grouping, RAM-saving suspension, reading queue, and weekly usage reports.
```

---

### STORE LISTING -- Detailed description (paste this exactly)
```
TABWISE is a smart tab manager built for people who live in their browser.

Whether you're a developer with 40 tabs open, a researcher jumping between sources, or someone who always means to "get back to that article" -- TABWISE gives your browser a structure.

---

WHAT TABWISE DOES

TAB GROUPING
Automatically groups your open tabs by domain and intent. See which sites are dominating your tab bar at a glance.

TAB SUSPENSION (RAM SAVING)
Suspend tabs you're not using right now. They go into a friendly "sleeping" state, freeing up RAM without losing your place. Restore them instantly with one click.

SLEEPING TAB RECOVERY
Accidentally closed a sleeping tab? TABWISE keeps a recent-closed list so you can reopen it without losing your URL.

READING QUEUE
Save tabs you want to read later without keeping them open. Your personal read-later list lives right in the extension.

CLUSTER VIEW
Tabs are clustered by intent: Work, Research, Entertainment, Shopping, and more. Understand your focus patterns at a glance.

TAB BUDGET
Set a weekly tab limit. TABWISE tracks how many tabs you're opening over time and shows your budget status.

WEEKLY REPORT
A local-only activity report shows your tab habits over the past week. Processed entirely on-device -- no data leaves your browser.

HIGH CONTRAST MODE
Accessibility-first: toggle high contrast in Settings for improved readability.

TABWISE PRO
Optional paid upgrade unlocks advanced features. Powered by ExtensionPay + Stripe. Cancel any time.

---

HOW IT WORKS

- All data is stored locally using chrome.storage.local
- No account required for core features
- No data is collected, transmitted, or sold
- Works entirely offline

---

PRIVACY

TABWISE does not collect personal information, browsing history, or any data for advertising.
Full privacy policy: https://YOUR_GITHUB_USERNAME.github.io/tabwise/privacy-policy.html
```

---

### STORE LISTING -- Category
```
Productivity
```

---

### STORE LISTING -- Language
```
English
```

---

### GRAPHICS TAB -- Screenshot sizes and captions

Required per screenshot: 1280x800 or 640x400 (PNG or JPG). At least 1, up to 5.

**Caption 1**
```
Tab dashboard -- active tabs, sleeping tabs, one-click suspend and restore
```

**Caption 2**
```
Smart cluster grouping by intent: Work, Research, Entertainment
```

**Caption 3**
```
Reading Queue -- save tabs for later without keeping them open
```

**Caption 4**
```
Settings view with TABWISE Pro billing and High Contrast toggle
```

**Caption 5**
```
The friendly sleeping tab page -- RAM saved, one click to wake
```

**Icon:** already at `icons/icon128.png` (128x128 PNG)

---

### PRIVACY PRACTICES TAB -- Privacy policy URL
```
https://YOUR_GITHUB_USERNAME.github.io/tabwise/privacy-policy.html
```
> Replace YOUR_GITHUB_USERNAME after pushing to GitHub and enabling Pages.

---

### PRIVACY PRACTICES TAB -- Single purpose description
```
TABWISE helps users organize, suspend, restore, and manage open browser tabs to reduce clutter and improve browser performance.
```

---

### PRIVACY PRACTICES TAB -- Data usage disclosures

Answer "Does not collect" for every data type:

| Data type                  | Your answer        |
|----------------------------|--------------------|
| Personal communications    | Does not collect   |
| Location                   | Does not collect   |
| Web history                | Does not collect   |
| User activity              | Does not collect   |
| Website content            | Does not collect   |
| Financial and payment info | Does not collect   |
| Authentication information | Does not collect   |
| Personal identifiable info | Does not collect   |
| Health information         | Does not collect   |

TABWISE only stores tab metadata (title, URL, favicon) locally via chrome.storage.local. Never transmitted to any server.

---

### DISTRIBUTION TAB

**Visibility**
```
Public
```

**Pricing**
```
Free (with optional in-app paid upgrade)
```

**Regions**
```
All regions (worldwide)
```

---

### PERMISSIONS JUSTIFICATION

Paste each block into the corresponding permission's justification field.

**tabs**
```
Required to read, group, suspend, restore, activate, create, and close browser tabs. Tab URLs and titles are stored locally only and are never transmitted externally.
```

**storage**
```
Required to persist settings, tab registry, reading queue items, recently closed sleeping tabs, and local weekly report data on-device via chrome.storage.local.
```

**alarms**
```
Required to trigger the local weekly tab-usage report on a scheduled basis. No network requests are made by this alarm.
```

---

### REVIEWER NOTES -- paste into "Notes to reviewer" field
```
How to test core features:
1. Load the unpacked extension from the dist/ folder after running: npm run build
2. Open 6-8 tabs across different sites (e.g., github.com, youtube.com, twitter.com).
3. Open TABWISE from the toolbar.
4. Verify the Tabs view shows grouped tabs by domain.
5. Click SUSPEND on any active tab -- it should move to the SLEEPING section.
6. Click RESTORE on a sleeping tab -- the original URL should reload.
7. Save a tab to Reading Queue from the Tabs view, then open it from the Reading tab.
8. Open the Clusters tab to see intent-based grouping.
9. Open Settings to verify the High Contrast toggle and TABWISE Pro billing card.
10. Close a sleeping tab manually -- it should appear in the CLOSED WHILE SLEEPING recovery section.

How to test paid access (optional):
1. Open Settings > TABWISE Pro Billing > click UPGRADE.
2. The ExtensionPay checkout page will open.
3. Use Stripe test card 4242 4242 4242 4242 to complete payment.
4. Click REFRESH in Settings -- tier should update to Pro.

Technical notes:
- Core functionality runs entirely locally (no servers, no remote code execution, no eval).
- Weekly report uses chrome.alarms on-device only.
- Payment entitlement verified via ExtensionPay SDK (extensionpay.com).
- No content scripts injected into pages.
```

---

### WHAT'S NEW -- v1.0.0 Release Notes
```
TABWISE 1.0.0 -- Initial Release

Take control of your browser tabs.

- Smart tab grouping by domain
- Duplicate tab detection and cleanup
- One-click tab suspension and restore
- Dedicated sleeping tabs section for fast recovery
- Reading Queue for soft-closing tabs you want to revisit
- Weekly local activity report (on-device, never transmitted)
- Tab budget controls for discipline
- Smart cluster view (Work, Research, Entertainment, Shopping)
- High-contrast accessibility option
- Recovery for sleeping tabs accidentally closed
- Optional TABWISE Pro upgrade (ExtensionPay + Stripe)
```

---

## EXTENSIONPAY + STRIPE SETUP CHECKLIST

1. Go to extensionpay.com and create or open your TABWISE extension config
2. Connect your Stripe account (use test mode first, switch to live when ready to go public)
3. Create plans with nicknames matching your .env.local values (default: monthly, yearly)
4. Copy your ExtensionPay extension ID
5. Create `.env.local` in the project root (see STEP 1 at top of this doc)
6. Run: `npm run build`
7. Run: `cd dist && zip -r ../tabwise-v1.0.0.zip . && cd ..`
8. Upload `tabwise-v1.0.0.zip` to the Chrome Web Store dashboard

---

## PAYMENT FEATURES WIRED IN CODE

| Feature            | Implementation                        |
|--------------------|---------------------------------------|
| Upgrade to Pro     | extPay.openPaymentPage(plan)          |
| Restore purchase   | extPay.openLoginPage()                |
| Manage billing     | extPay.openPaymentPage()              |
| Refresh status     | extPay.getUser()                      |
| Auto-unlock        | extPay.onPaid.addListener()           |
| Free tier gate     | Active when EXTENSIONPAY_ID not set   |
| PaywallGate UI     | Shown to non-Pro users in popup       |
---

## CHROME WEB STORE -- ALL FIELDS (copy-paste ready)

---

### STORE LISTING -- Extension name (45 char max)
```
TABWISE - Smart Tab Optimizer
```

---

### STORE LISTING -- Short description (132 char max)
```
Take control of tab chaos. Smart tab grouping, RAM-saving suspension, reading queue, and weekly usage reports.
```

---

### STORE LISTING -- Detailed description (paste this exactly)
```
TABWISE is a smart tab manager built for people who live in their browser.

Whether you're a developer with 40 tabs open, a researcher jumping between sources, or someone who always means to "get back to that article" -- TABWISE gives your browser a structure.

---

WHAT TABWISE DOES

TAB GROUPING
Automatically groups your open tabs by domain and intent. See which sites are dominating your tab bar at a glance.

TAB SUSPENSION (RAM SAVING)
Suspend tabs you're not using right now. They go into a friendly "sleeping" state, freeing up RAM without losing your place. Restore them instantly with one click.

SLEEPING TAB RECOVERY
Accidentally closed a sleeping tab? TABWISE keeps a recent-closed list so you can reopen it without losing your URL.

READING QUEUE
Save tabs you want to read later without keeping them open. Your personal read-later list lives right in the extension.

CLUSTER VIEW
Tabs are clustered by intent: Work, Research, Entertainment, Shopping, and more. Understand your focus patterns at a glance.

TAB BUDGET
Set a weekly tab limit. TABWISE tracks how many tabs you're opening over time and shows your budget status.

WEEKLY REPORT
A local-only activity report shows your tab habits over the past week. Processed entirely on-device -- no data leaves your browser.

HIGH CONTRAST MODE
Accessibility-first: toggle high contrast in Settings for improved readability.

TABWISE PRO
Optional paid upgrade unlocks advanced features. Powered by ExtensionPay + Stripe. Cancel any time.

---

HOW IT WORKS

- All data is stored locally using chrome.storage.local
- No account required for core features
- No data is collected, transmitted, or sold
- Works entirely offline

---

PRIVACY

TABWISE does not collect personal information, browsing history, or any data for advertising.
Full privacy policy: https://YOUR_GITHUB_USERNAME.github.io/tabwise/privacy-policy.html
```

---

### STORE LISTING -- Category
```
Productivity
```

---

### STORE LISTING -- Language
```
English
```

---

### GRAPHICS TAB -- Screenshot sizes and captions

Required per screenshot: 1280x800 or 640x400 (PNG or JPG). At least 1, up to 5.

**Caption 1**
```
Tab dashboard -- active tabs, sleeping tabs, one-click suspend and restore
```

**Caption 2**
```
Smart cluster grouping by intent: Work, Research, Entertainment
```

**Caption 3**
```
Reading Queue -- save tabs for later without keeping them open
```

**Caption 4**
```
Settings view with TABWISE Pro billing and High Contrast toggle
```

**Caption 5**
```
The friendly sleeping tab page -- RAM saved, one click to wake
```

**Icon:** already at `icons/icon128.png` (128x128 PNG)

---

### PRIVACY PRACTICES TAB -- Privacy policy URL
```
https://YOUR_GITHUB_USERNAME.github.io/tabwise/privacy-policy.html
```
> Replace YOUR_GITHUB_USERNAME after pushing to GitHub and enabling Pages.

---

### PRIVACY PRACTICES TAB -- Single purpose description
```
TABWISE helps users organize, suspend, restore, and manage open browser tabs to reduce clutter and improve browser performance.
```

---

### PRIVACY PRACTICES TAB -- Data usage disclosures

Answer "Does not collect" for every data type:

| Data type                  | Your answer        |
|----------------------------|--------------------|
| Personal communications    | Does not collect   |
| Location                   | Does not collect   |
| Web history                | Does not collect   |
| User activity              | Does not collect   |
| Website content            | Does not collect   |
| Financial and payment info | Does not collect   |
| Authentication information | Does not collect   |
| Personal identifiable info | Does not collect   |
| Health information         | Does not collect   |

TABWISE only stores tab metadata (title, URL, favicon) locally via chrome.storage.local. Never transmitted to any server.

---

### DISTRIBUTION TAB

**Visibility**
```
Public
```

**Pricing**
```
Free (with optional in-app paid upgrade)
```

**Regions**
```
All regions (worldwide)
```

---

### PERMISSIONS JUSTIFICATION

Paste each block into the corresponding permission's justification field.

**tabs**
```
Required to read, group, suspend, restore, activate, create, and close browser tabs. Tab URLs and titles are stored locally only and are never transmitted externally.
```

**storage**
```
Required to persist settings, tab registry, reading queue items, recently closed sleeping tabs, and local weekly report data on-device via chrome.storage.local.
```

**alarms**
```
Required to trigger the local weekly tab-usage report on a scheduled basis. No network requests are made by this alarm.
```

---

### REVIEWER NOTES -- paste into "Notes to reviewer" field
```
How to test core features:
1. Load the unpacked extension from the dist/ folder after running: npm run build
2. Open 6-8 tabs across different sites (e.g., github.com, youtube.com, twitter.com).
3. Open TABWISE from the toolbar.
4. Verify the Tabs view shows grouped tabs by domain.
5. Click SUSPEND on any active tab -- it should move to the SLEEPING section.
6. Click RESTORE on a sleeping tab -- the original URL should reload.
7. Save a tab to Reading Queue from the Tabs view, then open it from the Reading tab.
8. Open the Clusters tab to see intent-based grouping.
9. Open Settings to verify the High Contrast toggle and TABWISE Pro billing card.
10. Close a sleeping tab manually -- it should appear in the CLOSED WHILE SLEEPING recovery section.

How to test paid access (optional):
1. Open Settings > TABWISE Pro Billing > click UPGRADE.
2. The ExtensionPay checkout page will open.
3. Use Stripe test card 4242 4242 4242 4242 to complete payment.
4. Click REFRESH in Settings -- tier should update to Pro.

Technical notes:
- Core functionality runs entirely locally (no servers, no remote code execution, no eval).
- Weekly report uses chrome.alarms on-device only.
- Payment entitlement verified via ExtensionPay SDK (extensionpay.com).
- No content scripts injected into pages.
```

---

### WHAT'S NEW -- v1.0.0 Release Notes
```
TABWISE 1.0.0 -- Initial Release

Take control of your browser tabs.

- Smart tab grouping by domain
- Duplicate tab detection and cleanup
- One-click tab suspension and restore
- Dedicated sleeping tabs section for fast recovery
- Reading Queue for soft-closing tabs you want to revisit
- Weekly local activity report (on-device, never transmitted)
- Tab budget controls for discipline
- Smart cluster view (Work, Research, Entertainment, Shopping)
- High-contrast accessibility option
- Recovery for sleeping tabs accidentally closed
- Optional TABWISE Pro upgrade (ExtensionPay + Stripe)
```

---

## EXTENSIONPAY + STRIPE SETUP CHECKLIST

1. Go to extensionpay.com and create or open your TABWISE extension config
2. Connect your Stripe account (use test mode first, switch to live when ready to go public)
3. Create plans with nicknames matching your .env.local values (default: monthly, yearly)
4. Copy your ExtensionPay extension ID
5. Create `.env.local` in the project root (see STEP 1 at top of this doc)
6. Run: `npm run build`
7. Run: `cd dist && zip -r ../tabwise-v1.0.0.zip . && cd ..`
8. Upload `tabwise-v1.0.0.zip` to the Chrome Web Store dashboard

---

## PAYMENT FEATURES WIRED IN CODE

| Feature            | Implementation                        |
|--------------------|---------------------------------------|
| Upgrade to Pro     | extPay.openPaymentPage(plan)          |
| Restore purchase   | extPay.openLoginPage()                |
| Manage billing     | extPay.openPaymentPage()              |
| Refresh status     | extPay.getUser()                      |
| Auto-unlock        | extPay.onPaid.addListener()           |
| Free tier gate     | Active when EXTENSIONPAY_ID not set   |
| PaywallGate UI     | Shown to non-Pro users in popup       |
---

## CHROME WEB STORE -- ALL FIELDS (copy-paste ready)

---

### STORE LISTING -- Extension name (45 char max)
```
TABWISE - Smart Tab Optimizer
```

---

### STORE LISTING -- Short description (132 char max)
```
Take control of tab chaos. Smart tab grouping, RAM-saving suspension, reading queue, and weekly usage reports.
```

---

### STORE LISTING -- Detailed description (paste this exactly)
```
TABWISE is a smart tab manager built for people who live in their browser.

Whether you're a developer with 40 tabs open, a researcher jumping between sources, or someone who always means to "get back to that article" -- TABWISE gives your browser a structure.

---

WHAT TABWISE DOES

TAB GROUPING
Automatically groups your open tabs by domain and intent. See which sites are dominating your tab bar at a glance.

TAB SUSPENSION (RAM SAVING)
Suspend tabs you're not using right now. They go into a friendly "sleeping" state, freeing up RAM without losing your place. Restore them instantly with one click.

SLEEPING TAB RECOVERY
Accidentally closed a sleeping tab? TABWISE keeps a recent-closed list so you can reopen it without losing your URL.

READING QUEUE
Save tabs you want to read later without keeping them open. Your personal read-later list lives right in the extension.

CLUSTER VIEW
Tabs are clustered by intent: Work, Research, Entertainment, Shopping, and more. Understand your focus patterns at a glance.

TAB BUDGET
Set a weekly tab limit. TABWISE tracks how many tabs you're opening over time and shows your budget status.

WEEKLY REPORT
A local-only activity report shows your tab habits over the past week. Processed entirely on-device -- no data leaves your browser.

HIGH CONTRAST MODE
Accessibility-first: toggle high contrast in Settings for improved readability.

TABWISE PRO
Optional paid upgrade unlocks advanced features. Powered by ExtensionPay + Stripe. Cancel any time.

---

HOW IT WORKS

- All data is stored locally using chrome.storage.local
- No account required for core features
- No data is collected, transmitted, or sold
- Works entirely offline

---

PRIVACY

TABWISE does not collect personal information, browsing history, or any data for advertising.
Full privacy policy: https://YOUR_GITHUB_USERNAME.github.io/tabwise/privacy-policy.html
```

---

### STORE LISTING -- Category
```
Productivity
```

---

### STORE LISTING -- Language
```
English
```

---

### GRAPHICS TAB -- Screenshot sizes and captions

Required per screenshot: 1280x800 or 640x400 (PNG or JPG). At least 1, up to 5.

**Caption 1**
```
Tab dashboard -- active tabs, sleeping tabs, one-click suspend and restore
```

**Caption 2**
```
Smart cluster grouping by intent: Work, Research, Entertainment
```

**Caption 3**
```
Reading Queue -- save tabs for later without keeping them open
```

**Caption 4**
```
Settings view with TABWISE Pro billing and High Contrast toggle
```

**Caption 5**
```
The friendly sleeping tab page -- RAM saved, one click to wake
```

**Icon:** already at `icons/icon128.png` (128x128 PNG)

---

### PRIVACY PRACTICES TAB -- Privacy policy URL
```
https://YOUR_GITHUB_USERNAME.github.io/tabwise/privacy-policy.html
```
> Replace YOUR_GITHUB_USERNAME after pushing to GitHub and enabling Pages.

---

### PRIVACY PRACTICES TAB -- Single purpose description
```
TABWISE helps users organize, suspend, restore, and manage open browser tabs to reduce clutter and improve browser performance.
```

---

### PRIVACY PRACTICES TAB -- Data usage disclosures

Answer "Does not collect" for every data type:

| Data type                  | Your answer        |
|----------------------------|--------------------|
| Personal communications    | Does not collect   |
| Location                   | Does not collect   |
| Web history                | Does not collect   |
| User activity              | Does not collect   |
| Website content            | Does not collect   |
| Financial and payment info | Does not collect   |
| Authentication information | Does not collect   |
| Personal identifiable info | Does not collect   |
| Health information         | Does not collect   |

TABWISE only stores tab metadata (title, URL, favicon) locally via chrome.storage.local. Never transmitted to any server.

---

### DISTRIBUTION TAB

**Visibility**
```
Public
```

**Pricing**
```
Free (with optional in-app paid upgrade)
```

**Regions**
```
All regions (worldwide)
```

---

### PERMISSIONS JUSTIFICATION

Paste each block into the corresponding permission's justification field.

**tabs**
```
Required to read, group, suspend, restore, activate, create, and close browser tabs. Tab URLs and titles are stored locally only and are never transmitted externally.
```

**storage**
```
Required to persist settings, tab registry, reading queue items, recently closed sleeping tabs, and local weekly report data on-device via chrome.storage.local.
```

**alarms**
```
Required to trigger the local weekly tab-usage report on a scheduled basis. No network requests are made by this alarm.
```

---

### REVIEWER NOTES -- paste into "Notes to reviewer" field
```
How to test core features:
1. Load the unpacked extension from the dist/ folder after running: npm run build
2. Open 6-8 tabs across different sites (e.g., github.com, youtube.com, twitter.com).
3. Open TABWISE from the toolbar.
4. Verify the Tabs view shows grouped tabs by domain.
5. Click SUSPEND on any active tab -- it should move to the SLEEPING section.
6. Click RESTORE on a sleeping tab -- the original URL should reload.
7. Save a tab to Reading Queue from the Tabs view, then open it from the Reading tab.
8. Open the Clusters tab to see intent-based grouping.
9. Open Settings to verify the High Contrast toggle and TABWISE Pro billing card.
10. Close a sleeping tab manually -- it should appear in the CLOSED WHILE SLEEPING recovery section.

How to test paid access (optional):
1. Open Settings > TABWISE Pro Billing > click UPGRADE.
2. The ExtensionPay checkout page will open.
3. Use Stripe test card 4242 4242 4242 4242 to complete payment.
4. Click REFRESH in Settings -- tier should update to Pro.

Technical notes:
- Core functionality runs entirely locally (no servers, no remote code execution, no eval).
- Weekly report uses chrome.alarms on-device only.
- Payment entitlement verified via ExtensionPay SDK (extensionpay.com).
- No content scripts injected into pages.
```

---

### WHAT'S NEW -- v1.0.0 Release Notes
```
TABWISE 1.0.0 -- Initial Release

Take control of your browser tabs.

- Smart tab grouping by domain
- Duplicate tab detection and cleanup
- One-click tab suspension and restore
- Dedicated sleeping tabs section for fast recovery
- Reading Queue for soft-closing tabs you want to revisit
- Weekly local activity report (on-device, never transmitted)
- Tab budget controls for discipline
- Smart cluster view (Work, Research, Entertainment, Shopping)
- High-contrast accessibility option
- Recovery for sleeping tabs accidentally closed
- Optional TABWISE Pro upgrade (ExtensionPay + Stripe)
```

---

## EXTENSIONPAY + STRIPE SETUP CHECKLIST

1. Go to extensionpay.com and create or open your TABWISE extension config
2. Connect your Stripe account (use test mode first, switch to live when ready to go public)
3. Create plans with nicknames matching your .env.local values (default: monthly, yearly)
4. Copy your ExtensionPay extension ID
5. Create `.env.local` in the project root (see STEP 1 at top of this doc)
6. Run: `npm run build`
7. Run: `cd dist && zip -r ../tabwise-v1.0.0.zip . && cd ..`
8. Upload `tabwise-v1.0.0.zip` to the Chrome Web Store dashboard

---

## PAYMENT FEATURES WIRED IN CODE

| Feature            | Implementation                        |
|--------------------|---------------------------------------|
| Upgrade to Pro     | extPay.openPaymentPage(plan)          |
| Restore purchase   | extPay.openLoginPage()                |
| Manage billing     | extPay.openPaymentPage()              |
| Refresh status     | extPay.getUser()                      |
| Auto-unlock        | extPay.onPaid.addListener()           |
| Free tier gate     | Active when EXTENSIONPAY_ID not set   |
| PaywallGate UI     | Shown to non-Pro users in popup       |
---

## CHROME WEB STORE -- ALL FIELDS (copy-paste ready)

---

### STORE LISTING -- Extension name (45 char max)
```
TABWISE - Smart Tab Optimizer
```

---

### STORE LISTING -- Short description (132 char max)
```
Take control of tab chaos. Smart tab grouping, RAM-saving suspension, reading queue, and weekly usage reports.
```

---

### STORE LISTING -- Detailed description (paste this exactly)
```
TABWISE is a smart tab manager built for people who live in their browser.

Whether you're a developer with 40 tabs open, a researcher jumping between sources, or someone who always means to "get back to that article" -- TABWISE gives your browser a structure.

---

WHAT TABWISE DOES

TAB GROUPING
Automatically groups your open tabs by domain and intent. See which sites are dominating your tab bar at a glance.

TAB SUSPENSION (RAM SAVING)
Suspend tabs you're not using right now. They go into a friendly "sleeping" state, freeing up RAM without losing your place. Restore them instantly with one click.

SLEEPING TAB RECOVERY
Accidentally closed a sleeping tab? TABWISE keeps a recent-closed list so you can reopen it without losing your URL.

READING QUEUE
Save tabs you want to read later without keeping them open. Your personal read-later list lives right in the extension.

CLUSTER VIEW
Tabs are clustered by intent: Work, Research, Entertainment, Shopping, and more. Understand your focus patterns at a glance.

TAB BUDGET
Set a weekly tab limit. TABWISE tracks how many tabs you're opening over time and shows your budget status.

WEEKLY REPORT
A local-only activity report shows your tab habits over the past week. Processed entirely on-device -- no data leaves your browser.

HIGH CONTRAST MODE
Accessibility-first: toggle high contrast in Settings for improved readability.

TABWISE PRO
Optional paid upgrade unlocks advanced features. Powered by ExtensionPay + Stripe. Cancel any time.

---

HOW IT WORKS

- All data is stored locally using chrome.storage.local
- No account required for core features
- No data is collected, transmitted, or sold
- Works entirely offline

---

PRIVACY

TABWISE does not collect personal information, browsing history, or any data for advertising.
Full privacy policy: https://YOUR_GITHUB_USERNAME.github.io/tabwise/privacy-policy.html
```

---

### STORE LISTING -- Category
```
Productivity
```

---

### STORE LISTING -- Language
```
English
```

---

### GRAPHICS TAB -- Screenshot sizes and captions

Required per screenshot: 1280x800 or 640x400 (PNG or JPG). At least 1, up to 5.

**Caption 1**
```
Tab dashboard -- active tabs, sleeping tabs, one-click suspend and restore
```

**Caption 2**
```
Smart cluster grouping by intent: Work, Research, Entertainment
```

**Caption 3**
```
Reading Queue -- save tabs for later without keeping them open
```

**Caption 4**
```
Settings view with TABWISE Pro billing and High Contrast toggle
```

**Caption 5**
```
The friendly sleeping tab page -- RAM saved, one click to wake
```

**Icon:** already at `icons/icon128.png` (128x128 PNG)

---

### PRIVACY PRACTICES TAB -- Privacy policy URL
```
https://YOUR_GITHUB_USERNAME.github.io/tabwise/privacy-policy.html
```
> Replace YOUR_GITHUB_USERNAME after pushing to GitHub and enabling Pages.

---

### PRIVACY PRACTICES TAB -- Single purpose description
```
TABWISE helps users organize, suspend, restore, and manage open browser tabs to reduce clutter and improve browser performance.
```

---

### PRIVACY PRACTICES TAB -- Data usage disclosures

Answer "Does not collect" for every data type:

| Data type                  | Your answer        |
|----------------------------|--------------------|
| Personal communications    | Does not collect   |
| Location                   | Does not collect   |
| Web history                | Does not collect   |
| User activity              | Does not collect   |
| Website content            | Does not collect   |
| Financial and payment info | Does not collect   |
| Authentication information | Does not collect   |
| Personal identifiable info | Does not collect   |
| Health information         | Does not collect   |

TABWISE only stores tab metadata (title, URL, favicon) locally via chrome.storage.local. Never transmitted to any server.

---

### DISTRIBUTION TAB

**Visibility**
```
Public
```

**Pricing**
```
Free (with optional in-app paid upgrade)
```

**Regions**
```
All regions (worldwide)
```

---

### PERMISSIONS JUSTIFICATION

Paste each block into the corresponding permission's justification field.

**tabs**
```
Required to read, group, suspend, restore, activate, create, and close browser tabs. Tab URLs and titles are stored locally only and are never transmitted externally.
```

**storage**
```
Required to persist settings, tab registry, reading queue items, recently closed sleeping tabs, and local weekly report data on-device via chrome.storage.local.
```

**alarms**
```
Required to trigger the local weekly tab-usage report on a scheduled basis. No network requests are made by this alarm.
```

---

### REVIEWER NOTES -- paste into "Notes to reviewer" field
```
How to test core features:
1. Load the unpacked extension from the dist/ folder after running: npm run build
2. Open 6-8 tabs across different sites (e.g., github.com, youtube.com, twitter.com).
3. Open TABWISE from the toolbar.
4. Verify the Tabs view shows grouped tabs by domain.
5. Click SUSPEND on any active tab -- it should move to the SLEEPING section.
6. Click RESTORE on a sleeping tab -- the original URL should reload.
7. Save a tab to Reading Queue from the Tabs view, then open it from the Reading tab.
8. Open the Clusters tab to see intent-based grouping.
9. Open Settings to verify the High Contrast toggle and TABWISE Pro billing card.
10. Close a sleeping tab manually -- it should appear in the CLOSED WHILE SLEEPING recovery section.

How to test paid access (optional):
1. Open Settings > TABWISE Pro Billing > click UPGRADE.
2. The ExtensionPay checkout page will open.
3. Use Stripe test card 4242 4242 4242 4242 to complete payment.
4. Click REFRESH in Settings -- tier should update to Pro.

Technical notes:
- Core functionality runs entirely locally (no servers, no remote code execution, no eval).
- Weekly report uses chrome.alarms on-device only.
- Payment entitlement verified via ExtensionPay SDK (extensionpay.com).
- No content scripts injected into pages.
```

---

### WHAT'S NEW -- v1.0.0 Release Notes
```
TABWISE 1.0.0 -- Initial Release

Take control of your browser tabs.

- Smart tab grouping by domain
- Duplicate tab detection and cleanup
- One-click tab suspension and restore
- Dedicated sleeping tabs section for fast recovery
- Reading Queue for soft-closing tabs you want to revisit
- Weekly local activity report (on-device, never transmitted)
- Tab budget controls for discipline
- Smart cluster view (Work, Research, Entertainment, Shopping)
- High-contrast accessibility option
- Recovery for sleeping tabs accidentally closed
- Optional TABWISE Pro upgrade (ExtensionPay + Stripe)
```

---

## EXTENSIONPAY + STRIPE SETUP CHECKLIST

1. Go to extensionpay.com and create or open your TABWISE extension config
2. Connect your Stripe account (use test mode first, switch to live when ready to go public)
3. Create plans with nicknames matching your .env.local values (default: monthly, yearly)
4. Copy your ExtensionPay extension ID
5. Create `.env.local` in the project root (see STEP 1 at top of this doc)
6. Run: `npm run build`
7. Run: `cd dist && zip -r ../tabwise-v1.0.0.zip . && cd ..`
8. Upload `tabwise-v1.0.0.zip` to the Chrome Web Store dashboard

---

## PAYMENT FEATURES WIRED IN CODE

| Feature            | Implementation                        |
|--------------------|---------------------------------------|
| Upgrade to Pro     | extPay.openPaymentPage(plan)          |
| Restore purchase   | extPay.openLoginPage()                |
| Manage billing     | extPay.openPaymentPage()              |
| Refresh status     | extPay.getUser()                      |
| Auto-unlock        | extPay.onPaid.addListener()           |
| Free tier gate     | Active when EXTENSIONPAY_ID not set   |
| PaywallGate UI     | Shown to non-Pro users in popup       |
