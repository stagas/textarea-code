/** @jsxImportSource sigl */
import $ from 'sigl'

import { Buffer } from './buffer'
import { insert, startOfLine } from './util'

export interface TextAreaCodeElement extends $.Element<TextAreaCodeElement> {}

@$.element({ extends: 'textarea' })
export class TextAreaCodeElement extends $(HTMLTextAreaElement) {
  @$.attr() tabSize = 2
  @$.attr() tabStyle: 'spaces' | 'tabs' = 'spaces'
  @$.attr() comments = '// /* */'

  buffer?: Buffer
  pageSize?: number
  viewHeight?: number
  lineHeight = 16
  onKeyDown?: $.EventHandler<TextAreaCodeElement, KeyboardEvent>

  mounted($: this['$']) {
    $.effect(({ host }) => {
      host.style.whiteSpace = 'pre'
      host.setAttribute('wrap', 'off')
      host.setAttribute('spellcheck', 'false')
      host.setAttribute('autocorrect', 'off')
      host.setAttribute('autocomplete', 'off')
    })

    $.buffer = $.reduce(({ host }) => new Buffer(host, insert))

    $.effect(({ buffer, comments, tabSize, tabStyle }) => {
      Object.assign(buffer.options, {
        tabSize,
        tabStyle,
        comments: comments.split(' ') as [string, string, string],
      })
    })

    $.pageSize = $.reduce(({ viewHeight, lineHeight }) => Math.floor(viewHeight / lineHeight) - 1)

    $.effect(({ host, lineHeight }) => {
      const observer = new ResizeObserver(entries => {
        $.viewHeight = entries[0].contentBoxSize[0].blockSize
        $.lineHeight = parseFloat(window.getComputedStyle(host).getPropertyValue('line-height')) || lineHeight
      })
      observer.observe(host)
      return () => observer.disconnect()
    })

    $.onKeyDown = $.reduce(({ host, buffer, lineHeight, pageSize }) => (e => {
      const b = buffer
      const cmdKey = e.ctrlKey || e.metaKey
      const { altKey, shiftKey, key } = e

      if (cmdKey) {
        if ('/' === key) {
          e.preventDefault()
          b.toggleSingleComment()
          return
        }
        if ('?' === key) {
          e.preventDefault()
          b.toggleDoubleComment()
          return
        }
        if ('D' === key) {
          e.preventDefault()
          b.duplicate()
          return
        }
      }
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown'].includes(key)) {
        if (altKey || (cmdKey && shiftKey)) {
          e.preventDefault()
          b.moveLines(
            {
              ArrowUp: -1,
              ArrowDown: 1,
              PageUp: -pageSize,
              PageDown: +pageSize,
            }[key as 'ArrowUp']
          )
          return
        } else {
          const { selectionStart, selectionEnd } = host
          const hasSelection = selectionStart !== selectionEnd
          if (!hasSelection) {
            const isEnd = selectionStart === buffer.value.length
            if (key === 'ArrowDown' && (isEnd || cmdKey)) host.scrollTop += lineHeight
            if (key === 'ArrowUp' && e.ctrlKey) host.scrollTop -= lineHeight

            // unfortunately the pageup/down + ctrl are reserved for tab switching in chrome
            // but lets keep the declarations here for other environments some change in the future
            if (key === 'PageDown' && (isEnd || cmdKey)) host.scrollTop += pageSize * lineHeight
            if (key === 'PageUp' && cmdKey) host.scrollTop -= pageSize * lineHeight

            if (cmdKey) e.preventDefault()
          }
        }
      }
      if (shiftKey && key === 'Delete') {
        e.preventDefault()
        b.deleteLine()
        return
      }
      if (!cmdKey && !altKey) {
        if ('Tab' === key) {
          e.preventDefault()
          const { selectionStart, selectionEnd } = host
          const hasSelection = selectionStart !== selectionEnd
          if (hasSelection || shiftKey) b.indent(shiftKey)
          else {
            b.insert(b.tab)
            b.scrollIntoView()
          }
          return
        }

        if ('Home' === key) {
          e.preventDefault()
          b.moveCaretHome(shiftKey)
          return
        }

        if ('End' === key) {
          e.preventDefault()
          b.moveCaretEnd(shiftKey)
          return
        }

        if (['PageUp', 'PageDown'].includes(key)) {
          e.preventDefault()
          b.moveCaretLines(key === 'PageUp' ? -pageSize : +pageSize, shiftKey)
          return
        }
      }
      if (!cmdKey && !altKey && !shiftKey) {
        if ('Enter' === key) {
          const { start, selectionStart } = b.getRange()
          const line = b.lineAt(start.line - 1)
          const indent = startOfLine(line)
          if (indent > 0) {
            e.preventDefault()
            let ins = '\n' + line.slice(0, indent - 1)
            const open = '{[('
            const match = open.indexOf(line.at(-1)!)
            if (~match && start.col === line.length + 1) ins += b.tab
            const pos = selectionStart + ins.length
            b.insert(ins)
            b.setSelectionRange(pos, pos)
            b.scrollIntoView()
            return
          }
        }
      }
    }))

    $.effect(({ host, onKeyDown }) => $.on(host).keydown(onKeyDown))
  }
}
