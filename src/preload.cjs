const { contextBridge, ipcRenderer } = require('electron')

// Preload for the overlay page only; sandboxed, so it stays a single CommonJS file.

// braces keep ipcRenderer (returned by .on) from leaking to the page
const on = channel => cb => { ipcRenderer.on(channel, (_e, payload) => cb(payload)) }

contextBridge.exposeInMainWorld('findOverlay', {
  query: (text, options) => ipcRenderer.send('find-overlay:query', text, options),
  stop: () => ipcRenderer.send('find-overlay:stop'),
  close: () => ipcRenderer.send('find-overlay:close'),
  onOpen: on('find-overlay:open'),
  onResult: on('find-overlay:result')
})
