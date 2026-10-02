const { contextBridge, ipcRenderer } = require('electron')

// Preload for the overlay page only; sandboxed, so it stays a single CommonJS file.

const subscribe = channel => cb => {
  const listener = (_e, payload) => cb(payload)
  ipcRenderer.on(channel, listener)
  return () => { ipcRenderer.removeListener(channel, listener) }
}

contextBridge.exposeInMainWorld('findOverlay', {
  query: (text, options) => ipcRenderer.send('find-overlay:query', text, options),
  stop: () => ipcRenderer.send('find-overlay:stop'),
  close: () => ipcRenderer.send('find-overlay:close'),
  onOpen: subscribe('find-overlay:open'),
  onResult: subscribe('find-overlay:result')
})
