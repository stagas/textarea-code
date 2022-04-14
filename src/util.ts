import { Point } from './types'

export const startOfLine = (line: string) => line.match(/[^\s]|$/m)!.index! + 1

export const leftmost = (lines: string[], startLine: number, minLeft = 1): Point => {
  let left: Point = lines.reduce(
    (p, n, i) => {
      const left = startOfLine(n)
      return left >= minLeft && left < p.col
        ? { line: i + startLine, col: left }
        : left === p.col
        ? { line: i + startLine, col: p.col }
        : p
    },
    { line: Infinity, col: Infinity }
  )
  if (!isFinite(left.line) || !isFinite(left.col)) left = { line: startLine + lines.length + 1, col: 1 }
  return left
}

export const insert = typeof document === 'undefined' || typeof document.execCommand === 'undefined'
  ? (
    text: string,
    t: HTMLTextAreaElement | null = document.activeElement as HTMLTextAreaElement,
  ) => (t!.value = t!.value.slice(0, t!.selectionStart) + text + t!.value.slice(t!.selectionEnd))
  : (text: string) => document.execCommand('insertText', false, text)
