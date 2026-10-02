const { contextBridge, ipcRenderer } = require('electron')

// Preload for the overlay page only; sandboxed, so it stays a single CommonJS file.

// braces keep ipcRenderer (returned by .on) from leaking to the page
const on = channel => cb => { ipcRenderer.on(channel, (_e, payload) => cb(payload)) }

contextBridge.exposeInMainWorld('findOverlay', {
  find: (text, options) => ipcRenderer.send('find-overlay:find', text, options),
  stop: () => ipcRenderer.send('find-overlay:stop'),
  hide: () => ipcRenderer.send('find-overlay:hide'),
  onShow: on('find-overlay:show'),
  onResult: on('find-overlay:result')
})
