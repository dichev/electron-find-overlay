# electron-find-overlay

A find-in-page bar for Electron. It's a small overlay view in the window's top-right corner, so the search box is never part of the page being searched: `findInPage` won't match your query, and typing won't reset the current match.

## Install

```sh
npm install electron-find-overlay
```

Requires Electron 30+. ESM-only (from CommonJS, use `await import()`).

## Usage

```js
import { app, BrowserWindow, Menu } from 'electron'
import { FindOverlay } from 'electron-find-overlay'

app.whenReady().then(() => {
  const win = new BrowserWindow()
  win.loadFile('index.html')

  const find = new FindOverlay(win)

  Menu.setApplicationMenu(Menu.buildFromTemplate([{
    label: 'Edit',
    submenu: [{ label: 'Find…', accelerator: 'CmdOrCtrl+F', click: () => find.show() }],
  }]))
})
```

In the bar, `Enter` / `Shift+Enter` go to the next / previous match and `Esc` closes it. The bar doesn't register any shortcuts itself, so you decide how to open it.

## API

```js
const find = new FindOverlay(win, {
  webContents,          // page to search (default: win.webContents, required for a BaseWindow)
  css,                  // extra CSS, see Styling
  width: 320,           // overlay size in px, with room for the shadow
  height: 60,
  offset: 5,            // distance from the top-right corner in px
})

find.show()             // open the bar and focus the input
find.hide()             // close the bar and clear the highlights
find.visible            // true while the bar is open
find.on('show', fn)     // the bar opened
find.on('hide', fn)     // the bar closed
```

## Styling

The bar follows `prefers-color-scheme`. Switch it with `nativeTheme`, which sets the theme for the whole app:

```js
import { nativeTheme } from 'electron'

nativeTheme.themeSource = 'dark'   // 'light', 'dark', or 'system' (default, follows the OS)
```

Pass `css` to restyle it. The built-in styles sit in a cascade layer, so your rules win without `!important`.

```js
new FindOverlay(win, {
  css: `:root {
    --find-bg: #1e1e2e;
    --find-border: #45475a;
    --find-text: #cdd6f4;
    --find-text-muted: #a6adc8;
    --find-shadow: rgba(0, 0, 0, 0.4);
  }`,
})
```

Or use a CSS file. Read it in main, since the bar is its own web contents and your page's CSS doesn't reach it:

```js
import fs from 'node:fs'

new FindOverlay(win, {
  css: fs.readFileSync(new URL('find-theme.css', import.meta.url), 'utf8'),
})
```

## License

MIT
