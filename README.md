# TABWISE

Chrome extension for tab organization, duplicate detection, and tab suspension.

## Features

- View and manage open tabs in a React popup UI
- Detect duplicate tabs
- Suspend inactive tabs and restore when needed
- Read-later style queue using `chrome.storage.local`
- Pro/paywall-ready structure with ExtensionPay hooks

## Tech Stack

- React 18 + Vite
- CRXJS (`@crxjs/vite-plugin`) for Chrome extension builds
- Manifest V3

## Project Structure

```text
src/
	background.js
	suspended.js
	payment/config.js
	popup/
		App.jsx
		main.jsx
		components/PaywallGate.jsx
		hooks/usePaywall.js
		hooks/useStorage.js
		hooks/useTabs.js
```

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Then load the extension in Chrome:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the built extension output folder (`dist/`)

## Important Files

- `manifest.json` — extension manifest
- `privacy-policy.html` — privacy policy page
- `PUBLISH-SUBMISSION-PACK.md` — submission and publishing notes
- `publish-to-github.sh` — publish helper script

## Notes

- Repository: `https://github.com/weslr-prog/tabwise.git`
- Main branch: `main`
