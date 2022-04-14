import { attrs, mixter, on, props, state } from 'mixter'
import { Buffer } from './buffer'
import { insert, startOfLine } from './util'

export class TextAreaCodeElement extends mixter(
  HTMLTextAreaElement,
  attrs(
    class {
      tabSize = 2
      tabStyle: 'spaces' | 'tabs' = 'spaces'
      comments = '// /* */'
    }
  ),
  props(
    class {
      buffer?: Buffer
      pageSize?: number
      viewHeight?: number
      lineHeight = 16
      onKeyDown?: (e: KeyboardEvent) => void
    }
  ),
  state<TextAreaCodeElement>(({ $, effect, reduce }) => {
    effect(({ host }) => {
      host.style.whiteSpace = 'pre'
      host.setAttribute('wrap', 'off')
      host.setAttribute('spellcheck', 'false')
      host.setAttribute('autocorrect', 'off')
      host.setAttribute('autocomplete', 'off')
    })

    $.buffer = reduce(({ host }) => new Buffer(host, insert))

    effect(({ buffer, comments, tabSize, tabStyle }) => {
      Object.assign(buffer.options, {
        tabSize,
        tabStyle,
        comments: comments.split(' ') as [string, string, string],
      })
    })

    $.pageSize = reduce(({ viewHeight, lineHeight }) => Math.floor(viewHeight / lineHeight) - 1)

    effect(({ host, lineHeight }) => {
      const observer = new ResizeObserver(entries => {
        $.viewHeight = entries[0].contentBoxSize[0].blockSize
        $.lineHeight = parseFloat(window.getComputedStyle(host).getPropertyValue('line-height')) || lineHeight
      })
      observer.observe(host)
      return () => observer.disconnect()
    })

    $.onKeyDown = reduce(({ host, buffer, pageSize }) => (e => {
      const b = buffer
      const cmdKey = e.ctrlKey || e.metaKey

      if (cmdKey) {
        if ('/' === e.key) {
          e.preventDefault()
          b.toggleSingleComment()
          return
        }
        if ('?' === e.key) {
          e.preventDefault()
          b.toggleDoubleComment()
          return
        }
        if ('D' === e.key) {
          e.preventDefault()
          b.duplicate()
          return
        }
      }
      if (e.altKey || (cmdKey && e.shiftKey)) {
        if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown'].includes(e.key)) {
          e.preventDefault()
          b.moveLines(
            {
              ArrowUp: -1,
              ArrowDown: 1,
              PageUp: -pageSize,
              PageDown: +pageSize,
            }[e.key as 'ArrowUp']
          )
          return
        }
      }
      if (e.shiftKey && e.key === 'Delete') {
        e.preventDefault()
        b.deleteLine()
        return
      }
      if (!cmdKey && !e.altKey) {
        if ('Tab' === e.key) {
          e.preventDefault()
          const { selectionStart, selectionEnd } = host
          const hasSelection = selectionStart !== selectionEnd
          if (hasSelection || e.shiftKey) b.indent(e.shiftKey)
          else {
            b.insert(b.tab)
            b.scrollIntoView()
          }
          return
        }

        if ('Home' === e.key) {
          e.preventDefault()
          b.moveCaretHome(e.shiftKey)
          return
        }

        if ('End' === e.key) {
          e.preventDefault()
          b.moveCaretEnd(e.shiftKey)
          return
        }

        if (['PageUp', 'PageDown'].includes(e.key)) {
          e.preventDefault()
          b.moveCaretLines(e.key === 'PageUp' ? -pageSize : +pageSize, e.shiftKey)
          return
        }
      }
      if (!cmdKey && !e.altKey && !e.shiftKey) {
        if ('Enter' === e.key) {
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

    effect(({ host, onKeyDown }) => on()(host, 'keydown', onKeyDown))
  })
) {}
