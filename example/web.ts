import { TextAreaCodeElement } from '../src'

customElements.define('textarea-code', TextAreaCodeElement, { extends: 'textarea' })

document.body.innerHTML = /*html*/ `
<style>
  html,
  body {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
  }

  body,
  textarea {
    background: #292827;
    color: #fff;
    caret-color: #fff;
  }

  textarea {
    font-family: monospace;
    font-size: 10pt;
    line-height: 16px;
    padding: 0;
    margin: 0;
  }
</style>
<textarea id="output" is="textarea-code" rows="15" cols="60" tab-size="2" tab-style="spaces"></textarea>
`

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
