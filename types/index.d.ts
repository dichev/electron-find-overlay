import type { BaseWindow, BrowserWindow, WebContents } from 'electron'
import { EventEmitter } from 'node:events'

export interface FindOverlayOptions {
  /** Page to search. Default: `win.webContents`, required for a `BaseWindow`. */
  webContents?: WebContents
  /** Extra CSS for the bar. The built-in styles sit in a cascade layer, so these rules win. */
  css?: string
  /** Overlay width in px, with room for the shadow. Default: 320. */
  width?: number
  /** Overlay height in px, with room for the shadow. Default: 60. */
  height?: number
  /** Distance from the window's top-right corner in px. Default: 5. */
  offset?: number
}

export class FindOverlay extends EventEmitter<{ show: []; hide: [] }> {
  constructor(win: BrowserWindow, options?: FindOverlayOptions)
  constructor(win: BaseWindow, options: FindOverlayOptions & { webContents: WebContents })
  /** True while the bar is open. */
  readonly visible: boolean
  /** Open the bar and focus the input. */
  show(): void
  /** Close the bar and clear the highlights. */
  hide(): void
}
