// The <find-bar> element; searches run in the main process through the preload's window.findOverlay.
class FindBar extends HTMLElement {
  lastId = 0   // requestId is monotonic; drop stale results from superseded keystrokes

  connectedCallback() {
    this.dom = {
      input: this.querySelector('#q'),
      count: this.querySelector('#count'),
      prev:  this.querySelector('#prev'),
      next:  this.querySelector('#next'),
      close: this.querySelector('#close'),
    }

    window.findOverlay.onResult(r => this.onResult(r))
    window.findOverlay.onOpen(() => this.onOpen())

    this.dom.input.addEventListener('input', () => this.onInput())
    this.dom.input.addEventListener('keydown', e => this.onKeydown(e))
    this.dom.prev.addEventListener('click', () => this.find(false))
    this.dom.next.addEventListener('click', () => this.find(true))
    this.dom.close.addEventListener('click', () => window.findOverlay.close())
  }

  render(active, total) {
    this.dom.count.textContent = this.dom.input.value ? `${active} / ${total}` : ''
    this.dom.prev.disabled = this.dom.next.disabled = !total
  }

  onResult(r) {
    if (r.requestId < this.lastId) return
    this.lastId = r.requestId
    this.render(r.activeMatchOrdinal, r.matches)
  }

  onOpen() {
    this.dom.input.focus()
    this.dom.input.select()
  }

  // Debounced so fast typing fires one search.
  onInput() {
    clearTimeout(this.timer)
    if (!this.dom.input.value) { window.findOverlay.stop(); this.render(0, 0); return }
    this.timer = setTimeout(() => this.find(true), 150)
  }

  onKeydown(e) {
    if (e.key === 'Enter') { e.preventDefault(); this.find(!e.shiftKey) }
    else if (e.key === 'Escape') { e.preventDefault(); window.findOverlay.close() }
  }

  // findNext:true reports the first match of a new query (findNext:false searches silently) and
  // continues the session on repeats — so it serves both the initial search and next/prev nav.
  find(forward) {
    if (this.dom.input.value) window.findOverlay.query(this.dom.input.value, { forward, findNext: true })
  }
}

customElements.define('find-bar', FindBar)
