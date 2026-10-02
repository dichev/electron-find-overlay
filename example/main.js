import { app, BrowserWindow, Menu } from 'electron'
import { FindOverlay } from '../src/FindOverlay.js'

app.whenReady().then(() => {
  const win = new BrowserWindow()
  win.loadFile('index.html')

  const find = new FindOverlay(win)

  // The bar registers no shortcuts. A menu accelerator works whether the page or the bar has focus
  Menu.setApplicationMenu(Menu.buildFromTemplate([{
    label: 'Edit',
    submenu: [{ label: 'Find…', accelerator: 'CmdOrCtrl+F', click: () => find.show() }],
  }]))
})
