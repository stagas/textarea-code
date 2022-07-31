import escapeRegExp from '@stdlib/utils-escape-regexp-string'
import { Point, SelectionDirection } from './types'
import { leftmost, startOfLine } from './util'

// TODO: ctrl + delete|backspace should delete whitespace first,
//   if there any before the text.
//   e.g:
//     (ctrl+del) |   foo -> |foo
//     (ctrl+bks) foo   | ->  foo|

export interface Options {
  tabStyle: 'spaces' | 'tabs'
  tabSize: number
  comments: [string, string, string]
}

const defaults: Options = { tabStyle: 'spaces', tabSize: 2, comments: ['//', '/*', '*/'] }

export class Buffer {
  #text: HTMLTextAreaElement
  insert: (text: string) => void
  options: Options

  constructor(
    textarea: HTMLTextAreaElement,
    insert: (text: string) => void,
    options: Partial<Options> = {},
  ) {
    this.#text = textarea
    this.insert = insert
    this.options = Object.assign({}, defaults, options)
  }

  get value() {
    return this.#text.value
  }

  get tab() {
    return this.options.tabStyle === 'tabs' ? '\t' : ' '.repeat(this.options.tabSize)
  }

  get numberOfLines() {
    return (~this.value.indexOf('\n') && this.value.split('\n').length) || 1
  }

  static lineAt(value: string, line: number) {
    return value.split(/\n/).at(line)!
  }

  lineAt(line: number) {
    return Buffer.lineAt(this.value, line)
  }

  scrollIntoView(pos?: number) {
    // to force a scroll into view we have to remove selection,
    // move to the head of that selection, refocus and then
    // reapply the selection
    const { selectionStart, selectionEnd, selectionDirection } = this.#text
    if (pos == null) pos = selectionDirection === 'forward' ? selectionEnd : selectionStart
    this.#text.setSelectionRange(pos, pos)
    this.#text.blur()
    this.#text.focus()
    this.#text.setSelectionRange(selectionStart, selectionEnd, selectionDirection)
  }

  getRange() {
    const { selectionStart, selectionEnd, selectionDirection } = this.#text
    const [start, end] = [selectionStart, selectionEnd].map(this.getLineCol)
    const [head, tail] = selectionDirection === 'forward' ? [end, start] : [start, end]
    return {
      start,
      end,
      head,
      tail,
      caretIndex: selectionDirection === 'forward' ? selectionEnd : selectionStart,
      hasSelection: selectionStart !== selectionEnd,
      selectionStart,
      selectionEnd,
      selectionDirection,
    }
  }

  getLineCol = (n: number) => Buffer.getLineCol(this.value, n)

  static getLineCol(value: string, n: number): Point {
    let line = 1
    let col = 1
    for (let i = 0; i < n; i++) {
      if (value.charAt(i) === '\n') {
        line++
        col = 0
      }
      col++
    }
    return { line, col }
  }

  getPositionFromLineCol(pos: Point) {
    return Buffer.getPositionFromLineCol(this.value, pos)
  }

  static getPositionFromLineCol(value: string, point: Point) {
    const { line, col } = point
    const lines = value.split('\n')
    if (line > lines.length) return value.length
    if (line < 1) return 0
    const chunk = lines.slice(0, line)
    chunk[chunk.length - 1] = chunk.at(-1)!.slice(0, Math.max(1, col) - 1)
    return chunk.join('\n').length
  }

  getArea({ start, end }: { start: Point; end: Point }): [number, number] {
    const startPos = this.getPositionFromLineCol(start)
    const endPos = this.getPositionFromLineCol(end)
    return [startPos, endPos]
  }

  setSelectionRange(start: number, end: number, direction?: SelectionDirection): void {
    start = Math.max(0, start)
    end = Math.min(this.value.length, end)
    this.#text.setSelectionRange(start, end, direction)
  }

  moveCaretTo(
    { line, col }: Point,
    selection?: Point | null,
    direction = this.#text.selectionDirection,
  ) {
    const headPos = this.getPositionFromLineCol({ line, col })
    const tailPos = selection ? this.getPositionFromLineCol(selection) : headPos
    if (selection) {
      const pos = Math[direction === 'backward' ? 'min' : 'max'](headPos, tailPos)
      this.setSelectionRange(pos, pos)
      this.scrollIntoView()
    }
    this.setSelectionRange(
      Math.min(headPos, tailPos),
      Math.max(headPos, tailPos),
      headPos < tailPos ? 'backward' : 'forward'
    )
    this.scrollIntoView()
  }

  replaceBlock(
    replacer: (text: string, startLine: number) => { diff: number; text: string; left: Point },
  ) {
    const { start, end, hasSelection, selectionDirection } = this.getRange()
    const first = this.lineAt(start.line - 1)
    const last = this.lineAt(end.line - 1)

    const notch = end.col > 1 || !hasSelection ? 1 : 0

    const sliceStart = this.getPositionFromLineCol({ line: start.line, col: 1 })
    const sliceEnd = this.getPositionFromLineCol({ line: end.line + notch, col: 1 })

    const slice = this.value.slice(sliceStart, sliceEnd)
    const { diff, text, left } = replacer(slice, start.line)

    if (text.length === sliceEnd - sliceStart) return

    this.setSelectionRange(sliceStart, sliceEnd)
    this.insert(text)
    this.scrollIntoView(
      this.getPositionFromLineCol({ line: end.line - +!notch, col: left.col + diff })
    )

    const stillCaret = !hasSelection
      && start.col <= left.col + diff
      && end.col <= left.col + diff
      && first.length !== 0
    const startCol = this.lineAt(start.line - 1) === first ? start.col : stillCaret ? start.col : start.col + diff
    const endCol = stillCaret
      ? end.col
      : this.lineAt(end.line - 1) === last
      ? end.col
      : slice.length === 0
      ? end.col + diff
      : Math.max(1 + (start.line !== end.line ? notch : 0), end.col + notch * diff)
    this.setSelectionRange(
      this.getPositionFromLineCol({ line: start.line, col: startCol }),
      this.getPositionFromLineCol({ line: end.line, col: endCol }),
      selectionDirection
    )
  }

  toggleSingleComment() {
    const comment = this.options.comments[0]
    this.replaceBlock((text, startLine) => {
      const left = leftmost(
        text.split('\n').filter(x => x.length),
        startLine
      )
      let diff: number
      if (text.trimStart().slice(0, comment.length) === comment) {
        diff = -3
        text = text.replace(new RegExp(`^([^${escapeRegExp(comment[0])}]*)${escapeRegExp(comment)} ?`, 'gm'), '$1')
      } else {
        diff = +3
        text = text.length === 0
          ? comment + ' '
          : text.replace(
            new RegExp(`^(?!$)([^${escapeRegExp(comment[0])}]{0,${left.col - 1}})`, 'gm'),
            `$1${comment} `
          )
      }
      return { diff, text, left }
    })
  }

  toggleDoubleComment() {
    // eslint-disable-next-line prefer-const
    let { selectionStart, selectionEnd, selectionDirection } = this.getRange()
    let slice = this.value.slice(selectionStart, selectionEnd)
    const c = this.options.comments
    const expanded = this.value.slice(selectionStart - c[1].length, selectionEnd + c[2].length)
    if (
      expanded.indexOf(c[1]) === 0
      && expanded.lastIndexOf(c[2]) === expanded.length - c[2].length
    ) {
      slice = expanded
      selectionStart -= c[1].length
      selectionEnd += c[2].length
      this.setSelectionRange(selectionStart, selectionEnd, selectionDirection)
    }
    if (slice.indexOf(c[1]) === 0 && slice.lastIndexOf(c[2]) === slice.length - c[2].length) {
      const ins = slice.slice(c[1].length, -c[2].length)
      this.insert(ins)
      this.setSelectionRange(
        selectionStart,
        selectionEnd - c[1].length - c[2].length,
        selectionDirection
      )
    } else {
      this.insert(c[1] + slice + c[2])
      const length = c[1].length
      this.setSelectionRange(selectionStart + length, selectionEnd + length, selectionDirection)
    }
    this.scrollIntoView()
  }

  indent(unindent?: boolean) {
    this.replaceBlock((text, startLine) => {
      const left = leftmost(text.split('\n'), startLine, 2)
      const tabSize = this.options.tabStyle === 'tabs' ? 1 : this.options.tabSize
      let diff: number
      if (unindent) {
        diff = -tabSize
        text = text.replace(new RegExp(`^(\t| {1,${tabSize}})`, 'gm'), '')
      } else {
        diff = +tabSize
        text = text.length === 0 ? this.tab : text.replace(/^[^\n]/gm, `${this.tab}$&`)
      }
      return { diff, text, left }
    })
  }

  moveCaretHome(withSelection: boolean) {
    const { head, tail } = this.getRange()
    let begin = startOfLine(this.lineAt(head.line - 1))
    if (head.col === begin) begin = 1
    this.moveCaretTo({ line: head.line, col: begin }, withSelection ? tail : null)
  }

  moveCaretEnd(withSelection: boolean) {
    const { head, tail } = this.getRange()
    this.moveCaretTo(
      { line: head.line, col: this.lineAt(head.line - 1).length + 1 },
      withSelection ? tail : null
    )
  }

  moveCaretLines(lines: number, withSelection: boolean) {
    const { head, tail } = this.getRange()
    const { numberOfLines } = this
    let target = head.line + lines
    if (target < 1 && head.line > 1) target = 1
    else if (target > numberOfLines && head.line < numberOfLines) target = numberOfLines
    this.moveCaretTo({ line: target, col: head.col }, withSelection ? tail : null)
  }

  moveLines(diff: number) {
    const { start, end, hasSelection, selectionStart, selectionEnd, selectionDirection } = this.getRange()

    const lines = this.value.split('\n')
    const notch = end.col === 1 && hasSelection ? 1 : 0
    const down = diff > 0

    let startLine = start.line + (!down ? diff : 0)
    let endLine = end.line + (down ? diff : 0) - notch

    // adjust exceeding diffs
    if (down) {
      const adj = endLine - lines.length
      if (adj > 0) {
        endLine -= adj
        diff -= adj
      }
    } else {
      const adj = 1 - startLine
      if (adj > 0) {
        startLine += adj
        diff += adj
      }
    }

    // reached top or bottom, nothing to do
    if (!diff) return

    const area = {
      start: { line: startLine, col: 1 },
      end: { line: endLine, col: this.lineAt(endLine - 1).length + 1 },
    }

    // move lines
    const [sliceStart, sliceEnd] = this.getArea(area)
    const slice = this.value.slice(sliceStart, sliceEnd)
    const part = slice.split('\n')
    const cut = down ? end.line - notch - start.line + 1 : -diff
    const top = part.slice(0, cut)
    const bottom = part.slice(cut)

    // apply changes
    this.setSelectionRange(sliceStart, sliceEnd, selectionDirection)
    this.insert(bottom.concat(top).join('\n'))

    // move selection
    const diffPos = down ? bottom.join('\n').length + 1 : -(top.join('\n').length + 1)
    const selStart = selectionStart + diffPos
    const selEnd = selectionEnd + diffPos
    this.setSelectionRange(selStart, selEnd, selectionDirection)
    this.scrollIntoView(down ? selEnd : selStart)
  }

  duplicate() {
    const { start, end, hasSelection, selectionStart, selectionEnd, selectionDirection } = this.getRange()
    const { numberOfLines } = this

    if (!hasSelection) {
      start.col = 1
      end.col = 1
      end.line++
    }

    const [sliceStart, sliceEnd] = this.getArea({ start, end })
    let slice = this.value.slice(sliceStart, sliceEnd)
    if (!hasSelection && slice.at(-1) !== '\n') {
      if (numberOfLines > 1)
        slice = this.value.slice(sliceStart - 1, sliceEnd)
      else
        slice = '\n' + slice
    }
    this.setSelectionRange(sliceEnd, sliceEnd)
    this.insert(slice)
    const length = slice.length
    if (!hasSelection)
      this.setSelectionRange(selectionStart + length, selectionEnd + length)
    else
      this.setSelectionRange(sliceEnd, sliceEnd + length, selectionDirection)
    this.scrollIntoView()
  }

  deleteLine() {
    const { start, end, hasSelection } = this.getRange()
    const { numberOfLines } = this
    const before = { line: start.line, col: start.col }
    if (!hasSelection) {
      if (end.line < numberOfLines) {
        start.col = 1
        end.col = 1
        end.line++
      } else if (numberOfLines === 1) {
        start.col = 1
        end.col = this.value.length + 1
      } else {
        before.line--
        start.line--
        start.col = this.lineAt(end.line - 2).length + 1
        end.col = this.lineAt(end.line - 1).length + 1
      }
    }

    const [sliceStart, sliceEnd] = this.getArea({ start, end })
    this.setSelectionRange(sliceStart, sliceEnd)
    this.insert('')
    const pos = this.getPositionFromLineCol(before)
    this.setSelectionRange(pos, pos)
    this.scrollIntoView()
  }
}
