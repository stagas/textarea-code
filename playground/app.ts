import { TextAreaCodeElement } from '../src'

customElements.define('textarea-code', TextAreaCodeElement, { extends: 'textarea' })

const output = document.getElementById('output') as TextAreaCodeElement

output.textContent = `\
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
`
