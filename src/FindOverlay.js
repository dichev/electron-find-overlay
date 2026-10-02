import { WebContentsView } from 'electron'
import { EventEmitter } from 'node:events'
import path from 'node:path'

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
      webPreferences: { preload: path.join(import.meta.dirname, 'preload.cjs') } // sandboxed and isolated by default
    })
    this.view.setBackgroundColor('#00000000') // transparent; the bar draws its own rounded box
    this.view.setVisible(false)
    win.contentView.addChildView(this.view)

    const contents = this.view.webContents
    contents.on('will-navigate', e => e.preventDefault())
    contents.setWindowOpenHandler(() => ({ action: 'deny' }))
    if (css) contents.on('dom-ready', () => contents.insertCSS(css))
    contents.loadFile(path.join(import.meta.dirname, 'renderer/find.html'))

    contents.ipc.on('find-overlay:find', (_e, text, options) => this.target.findInPage(text, options))
    contents.ipc.on('find-overlay:stop', () => this.stop())
    contents.ipc.on('find-overlay:hide', () => this.hide())

    this.target.on('found-in-page', (_e, result) => contents.send('find-overlay:result', result))
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
    const contents = this.view.webContents
    const reopened = !this.visible
    this.win.contentView.addChildView(this.view) // re-adding raises it above views added since
    this.layout()
    this.#visible = true
    this.view.setVisible(true)
    contents.focus()
    const notify = () => contents.send('find-overlay:show', reopened)
    contents.isLoading() ? contents.once('did-finish-load', notify) : notify()
    if (reopened) this.emit('show')
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
