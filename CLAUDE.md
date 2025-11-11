# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrome extension (Manifest v3) - displays motivational quotes from top entrepreneurs (Zhang Yiming, Wang Xing, Jeff Bezos) on new tab pages. React 18 app with random background images from Lorem Picsum.

## Commands

### Build & Development
- `pnpm start` - dev server (port 3000)
- `pnpm run build` - production build to `/build`
- `pnpm test` - run tests

### Extension Testing
After build, load `/build` as unpacked extension in chrome://extensions

## Architecture

### Quote System
- Quotes stored in JSON: `src/quotes/yiming.json`, `wangxing.json`, `bezos.json`
- `src/quotes/index.js` exports `randomQuote()` - randomly selects quote+author
- Each author's quotes are plain string arrays

### Chrome Extension Structure
- `public/manifest.json` - Manifest v3, overrides new tab with `index.html`, includes `host_permissions` for picsum.photos
- `public/background.js` - Service worker, fetches random Lorem Picsum image (2560x1600) on install, converts to base64, stores in `chrome.storage.local`
- Main React app (`src/App.js`) displays time (luxon), quote (click to refresh), background image

### State Management
Single component state in `App.js`:
- `time` - current time (luxon DateTime)
- `quote` - current quote object `{text, author}`

Uses React 18 `createRoot` API (see `src/index.js`)

### Styling
Dynamic font sizing based on quote length/line count (`quoteClassName()` in App.js:20-29):
- Long quotes (500+ chars or 8+ lines) → `quote-text-xs`
- Medium (200+ chars or 4+ lines) → `quote-text-small`
- Short → default `quote-text`

## Adding New Quotes

1. Create JSON file in `src/quotes/` (string array format)
2. Import in `src/quotes/index.js`
3. Add to `quotesList` array with author name
