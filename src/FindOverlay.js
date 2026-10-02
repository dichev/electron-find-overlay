import { WebContentsView } from 'electron'
import { EventEmitter } from 'node:events'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// A find bar drawn as an overlay view (own web contents) on top of the window's page.
// Keeping its input out of the searched page means findInPage never matches the box itself
// and the box's focus never disturbs the search anchor.
export class FindOverlay extends EventEmitter {
  #visible = false

  constructor(win, { webContents = win.webContents, css, width = 320, height = 56, margin = 6 } = {}) {
    super()
    this.win = win
    this.target = webContents
    this.size = { width, height, margin }
    this.view = new WebContentsView({
      webPreferences: {
        preload: path.join(__dirname, 'preload.cjs'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true
      }
    })
    this.view.setBackgroundColor('#00000000') // transparent; the bar draws its own rounded box
    this.view.setVisible(false)
    win.contentView.addChildView(this.view)

    const contents = this.view.webContents
    contents.on('will-navigate', e => e.preventDefault())
    contents.setWindowOpenHandler(() => ({ action: 'deny' }))
    if (css) contents.on('dom-ready', () => contents.insertCSS(css))
    contents.loadFile(path.join(__dirname, 'renderer/find.html'))

    contents.ipc.on('find-overlay:query', (_e, text, options) => this.target.findInPage(text, options))
    contents.ipc.on('find-overlay:stop', () => this.stop())
    contents.ipc.on('find-overlay:close', () => this.hide())

    // results come from the searched page's find — forward them to the overlay
    this.target.on('found-in-page', (_e, r) => {
      contents.send('find-overlay:result', { active: r.activeMatchOrdinal, total: r.matches, id: r.requestId })
    })
    win.on('resize', () => { if (this.visible) this.layout() })
    win.once('closed', () => contents.close()) // a view's web contents outlive its window unless closed
  }

  get visible() { return this.#visible }

  layout() {
    const { width, height, margin } = this.size
    const [w] = this.win.getContentSize()
    this.view.setBounds({ x: Math.max(0, w - width - margin), y: margin, width, height })
  }

  stop() { this.target.stopFindInPage('clearSelection') }

  show() {
    this.layout()
    this.#visible = true
    this.view.setVisible(true)
    this.view.webContents.focus()
    this.view.webContents.send('find-overlay:open')
    this.emit('show')
  }

  hide() {
    if (!this.visible) return
    this.#visible = false
    this.view.setVisible(false)
    this.stop()
    this.target.focus()
    this.emit('hide')
  }
}
