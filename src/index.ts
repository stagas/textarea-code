import { Buffer } from './buffer'
import { insert, startOfLine } from './util'

/**
 * Adds code editor behavior to a `<textarea>`.
 *
 * ```ts
 * import { TextAreaCodeElement } from 'textarea-code'
 * customElements.define('textarea-code', TextAreaCodeElement, { extends: 'textarea' })
 * ```
 *
 * ```html
 * <textarea is="textarea-code"></textarea>
 * ```
 */
export class TextAreaCodeElement extends HTMLTextAreaElement {
  static get observedAttributes() {
    return ['tabsize', 'tabstyle', 'comments']
  }

  buffer: Buffer
  pageSize = 10

  constructor() {
    super()
    this.buffer = new Buffer(this, insert)
    this.attachEvents()
  }

  connectedCallback() {
    // disable text wrapping
    // TODO: these don't seem to work when being inside another custom element
    this.setAttribute('wrap', 'off')
    this.wrap = 'off'
    this.style.whiteSpace = 'pre'
  }

  updateSizes() {
    const lineHeight = parseFloat(window.getComputedStyle(this).getPropertyValue('line-height')) || 16
    this.pageSize = Math.floor(this.offsetHeight / lineHeight) - 1
  }

  attachEvents() {
    new ResizeObserver(() => this.updateSizes()).observe(this)

    this.addEventListener('keydown', (e: KeyboardEvent) => {
      const cmdKey = e.ctrlKey || e.metaKey

      if (cmdKey) {
        if ('/' === e.key) {
          e.preventDefault()
          this.buffer.toggleSingleComment()
          return
        }
        if ('?' === e.key) {
          e.preventDefault()
          this.buffer.toggleDoubleComment()
          return
        }
        if ('D' === e.key) {
          e.preventDefault()
          this.buffer.duplicate()
          return
        }
      }
      if (e.altKey || (cmdKey && e.shiftKey)) {
        if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown'].includes(e.key)) {
          e.preventDefault()
          this.buffer.moveLines(
            {
              ArrowUp: -1,
              ArrowDown: 1,
              PageUp: -this.pageSize,
              PageDown: this.pageSize,
            }[e.key as 'ArrowUp']
          )
          return
        }
      }
      if (e.shiftKey && e.key === 'Delete') {
        e.preventDefault()
        this.buffer.deleteLine()
        return
      }
      if (!cmdKey && !e.altKey) {
        if ('Tab' === e.key) {
          e.preventDefault()
          const { selectionStart, selectionEnd } = this
          const hasSelection = selectionStart !== selectionEnd
          if (hasSelection || e.shiftKey) this.buffer.indent(e.shiftKey)
          else {
            this.buffer.insert(this.buffer.tab)
            this.buffer.scrollIntoView()
          }
          return
        }

        if ('Home' === e.key) {
          e.preventDefault()
          this.buffer.moveCaretHome(e.shiftKey)
          return
        }

        if ('End' === e.key) {
          e.preventDefault()
          this.buffer.moveCaretEnd(e.shiftKey)
          return
        }

        if (['PageUp', 'PageDown'].includes(e.key)) {
          e.preventDefault()
          this.buffer.moveCaretLines(e.key === 'PageUp' ? -this.pageSize : +this.pageSize, e.shiftKey)
          return
        }
      }
      if (!cmdKey && !e.altKey && !e.shiftKey) {
        if ('Enter' === e.key) {
          const { start, selectionStart } = this.buffer.getRange()
          const line = this.buffer.lineAt(start.line - 1)
          const indent = startOfLine(line)
          if (indent > 0) {
            e.preventDefault()
            let ins = '\n' + line.slice(0, indent - 1)
            const open = '{[('
            const match = open.indexOf(line.at(-1)!)
            if (~match && start.col === line.length + 1) ins += this.buffer.tab
            const pos = selectionStart + ins.length
            this.buffer.insert(ins)
            this.buffer.setSelectionRange(pos, pos)
            this.buffer.scrollIntoView()
            return
          }
        }
      }
    })
  }

  attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null) {
    if (name === 'tabsize') this.buffer.options.tabSize = parseInt(newValue || '') || 2
    if (name === 'tabstyle') this.buffer.options.tabStyle = newValue === 'spaces' || newValue === 'tabs' ? newValue : 'spaces'
    if (name === 'comments') this.buffer.options.comments = (newValue || '// /* */').split(' ') as [string, string, string]
  }
}

export default TextAreaCodeElement
