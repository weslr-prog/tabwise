# TABWISE — Chrome Extension Setup Complete

Your project is now scaffolded as **Vite + React + CRXJS** with full structure matching your build guide.

## Project Structure

```
TabWise/
├── src/
│   ├── background.js                   ← Service worker (tab registry, suspension, alarms)
│   └── popup/
│       ├── main.jsx                    ← React entry point
│       ├── App.jsx                     ← Full approved UI (Section 01 of guide)
│       ├── hooks/
│       │   ├── useTabs.js              ← Live tab data with registry
│       │   ├── useStorage.js           ← Persistent storage wrapper
│       │   └── usePaywall.js           ← Tier checking for Pro features
│       └── components/
│           └── PaywallGate.jsx         ← Pro feature gating
├── icons/                              ← Placeholder folder for icon files
├── manifest.json                       ← MV3 manifest (ExtensionPay connected)
├── vite.config.js                      ← Vite config with CRXJS plugin
├── index.html                          ← Popup entry point
├── suspended.html                      ← Suspended tab placeholder
├── package.json                        ← Node dependencies
└── TABWISE-Build-Guide.md              ← Your original build specifications
```

## Next Steps

### 1. **Install Dependencies**
```bash
cd /Users/wesleyrufus/Desktop/TabWise
npm install
```

### 2. **Run Dev Server**
```bash
npm run dev
```
Vite will watch files and rebuild on changes.

### 3. **Load in Chrome**
- Open `chrome://extensions`
- Enable **Developer mode** (top right)
- Click **Load unpacked**
- Select the `dist/` folder (generated after first build)

### 4. **Wire ExtensionPay** (if using payments)
- Get your ExtensionPay ID from [extensionpay.com](https://extensionpay.com)
- Add to `src/background.js`:
  ```js
  import { extpay } from 'extensionpay'
  const extPay = extpay('YOUR_EXTENSION_ID')
  extPay.startBackground()
  ```

### 5. **Production Build**
```bash
npm run build
cd dist && zip -r ../tabwise-v1.0.zip . && cd ..
```

## Key Implementation Details

- **UI**: Full React component from your guide, wired to live Chrome APIs
- **Tabs Hook** (`useTabs`): Fetches all tabs with enriched metadata (age, cluster, RAM, visited status)
- **Storage Hook** (`useStorage`): 2-way sync with `chrome.storage.local`
- **Service Worker**: Manages tab registry, suspension, weekly reports, and alarms
- **Paywall Gate**: Wraps Focus Mode and Weekly Report views (Pro-only)
- **Monetization**: Ready for ExtensionPay + Stripe integration

## Test Checklist

- [ ] Dev server runs: `npm run dev`
- [ ] Can load unpacked extension from `dist/`
- [ ] Popup opens (360px wide, dark theme)
- [ ] Tab list displays with domain grouping
- [ ] Duplicate detection works
- [ ] Suspend/restore buttons send messages to service worker
- [ ] Click-to-jump to tab works with `chrome.tabs.update()`
- [ ] Read Later queue saves to `chrome.storage.local`
- [ ] Focus Mode slider persists value across reloads
- [ ] Weekly Report shows if mock data exists in storage

## Icon Files

Add these to `icons/` folder:
- `icon16.png` (16×16)
- `icon48.png` (48×48)
- `icon128.png` (128×128)

For now, the manifest will still reference them but you can use placeholder images.

## Troubleshooting

**"Cannot find module" errors?**
- Run `npm install` first
- Ensure Node.js 16+ is installed

**Popup doesn't load?**
- Check browser console for errors
- Verify `dist/` folder exists after build
- Try reloading the extension after changes

**Chrome APIs not working?**
- Confirm extension is loaded (should show in `chrome://extensions`)
- Check that you're calling APIs correctly (await for async, use `chrome` global)

---

**Next: Install npm packages, run `npm run dev`, then load the unpacked extension from the `dist/` folder.**
