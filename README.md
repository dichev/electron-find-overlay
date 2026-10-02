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
  width: 320,           // overlay size in px
  height: 56,
  margin: 6,            // gap from the top-right corner in px
})

find.show()             // open the bar and focus the input
find.hide()             // close the bar and clear the highlights
find.visible            // true while the bar is open
find.on('show', fn)     // the bar opened
find.on('hide', fn)     // the bar closed
```

## Styling

The bar is light or dark to match `prefers-color-scheme`, which in Electron follows `nativeTheme.themeSource` (the OS by default).

Pass `css` to restyle it. The built-in styles sit in a cascade layer, so your rules win without `!important`.

```js
new FindOverlay(win, {
  css: `:root {
    --find-bg: #1e1e2e;
    --find-border: #45475a;
    --find-text: #cdd6f4;
    --find-text-dim: #a6adc8;
    --find-hover: rgba(255, 255, 255, 0.08);
    --find-shadow: rgba(0, 0, 0, 0.4);
    --find-font: system-ui, sans-serif;
  }`,
})
```

Elements: `find-bar`, `#q` (input), `#count`, `.divider`, `#prev`, `#next`, `#close`.

## License

MIT
