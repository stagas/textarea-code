import { Buffer } from '../src/buffer'
import { SelectionDirection } from '../src/types'
import { insert } from '../src/util'

const createTextArea = () => {
  const textarea = document.createElement('textarea')
  document.body.appendChild(textarea)
  textarea.focus()
  return textarea
}

let t: HTMLTextAreaElement
let b: Buffer

const select = (sub: string, dir: SelectionDirection = 'forward') => {
  const index = t.value.indexOf(sub)
  t.setSelectionRange(index, index + sub.length, dir)
}

const get = () => t.value.substring(t.selectionStart, t.selectionEnd)

describe('Buffer', () => {
  it('gets defaults', () => {
    t = createTextArea()
    b = new Buffer(t, insert)
    expect(b.options.tabSize).toEqual(2)
    expect(b.options.tabStyle).toEqual('spaces')
    expect(b.options.comments).toEqual(['//', '/*', '*/'])
  })
})

describe('indent', () => {
  describe('empty', () => {
    beforeEach(() => {
      t = createTextArea()
      t.textContent = ''
      b = new Buffer(t, insert, { tabSize: 2, tabStyle: 'spaces', comments: ['//', '/*', '*/'] })
    })

    it('nothing - we insert tab because same line/no selection', () => {
      t.setSelectionRange(0, 0)
      b.indent()
      expect(t.value).toEqual('  ')
      expect(get()).toEqual('')

      b.indent()
      expect(t.value).toEqual('    ')
      expect(get()).toEqual('')

      b.indent(true)
      expect(t.value).toEqual('  ')
      expect(get()).toEqual('')

      b.indent(true)
      expect(t.value).toEqual('')
      expect(get()).toEqual('')
    })
  })

  describe('various settings', () => {
    it('tab size 4', () => {
      t = createTextArea()
      t.textContent = 'a\nb'
      b = new Buffer(t, insert, { tabSize: 4, tabStyle: 'spaces', comments: ['//', '/*', '*/'] })
      b.indent()
      expect(t.value).toEqual('    a\nb')
      b.indent(true)
      expect(t.value).toEqual('a\nb')
    })

    it('tab style=tabs', () => {
      t = createTextArea()
      t.textContent = 'a\nb'
      b = new Buffer(t, insert, { tabSize: 4, tabStyle: 'tabs', comments: ['//', '/*', '*/'] })
      b.indent()
      expect(t.value).toEqual('\ta\nb')
      b.indent(true)
      expect(t.value).toEqual('a\nb')
    })
  })

  describe('a', () => {
    beforeEach(() => {
      t = createTextArea()
      t.textContent = 'a'
      b = new Buffer(t, insert, { tabSize: 2, tabStyle: 'spaces', comments: ['//', '/*', '*/'] })
    })

    it('single line', () => {
      t.setSelectionRange(0, 0)
      b.indent()
      expect(t.value).toEqual('  a')
      expect(get()).toEqual('')

      b.indent()
      expect(t.value).toEqual('    a')
      expect(get()).toEqual('')

      b.indent(true)
      expect(t.value).toEqual('  a')
      expect(get()).toEqual('')

      b.indent(true)
      expect(t.value).toEqual('a')
      expect(get()).toEqual('')

      b.indent(true)
      expect(t.value).toEqual('a')
      expect(get()).toEqual('')
    })
  })

  describe('a.b.c.d.e', () => {
    beforeEach(() => {
      t = createTextArea()
      t.textContent = 'abcde'.split('').join('\n')
      b = new Buffer(t, insert, { tabSize: 2, tabStyle: 'spaces', comments: ['//', '/*', '*/'] })
    })

    it('single line forward', () => {
      t.setSelectionRange(0, 0)
      b.indent()
      expect(t.value).toEqual('  a\nb\nc\nd\ne')

      t.setSelectionRange(4, 4)
      b.indent()
      expect(t.value).toEqual('  a\n  b\nc\nd\ne')

      t.setSelectionRange(8, 8)
      b.indent()
      expect(t.value).toEqual('  a\n  b\n  c\nd\ne')

      t.setSelectionRange(12, 12)
      b.indent()
      expect(t.value).toEqual('  a\n  b\n  c\n  d\ne')

      t.setSelectionRange(16, 16)
      b.indent()
      expect(t.value).toEqual('  a\n  b\n  c\n  d\n  e')
    })

    it('single line forward in reverse', () => {
      t.setSelectionRange(8, 8)
      b.indent()
      expect(t.value).toEqual('a\nb\nc\nd\n  e')

      t.setSelectionRange(6, 6)
      b.indent()
      expect(t.value).toEqual('a\nb\nc\n  d\n  e')

      t.setSelectionRange(4, 4)
      b.indent()
      expect(t.value).toEqual('a\nb\n  c\n  d\n  e')

      t.setSelectionRange(2, 2)
      b.indent()
      expect(t.value).toEqual('a\n  b\n  c\n  d\n  e')

      t.setSelectionRange(0, 0)
      b.indent()
      expect(t.value).toEqual('  a\n  b\n  c\n  d\n  e')
    })

    it('selection first line, caret below', () => {
      select('a\n')
      b.indent()
      expect(t.value).toEqual('  a\nb\nc\nd\ne')
      expect(get()).toEqual('a\n')
    })

    it('selection first line only end of line, caret below', () => {
      select('\n')
      b.indent()
      expect(t.value).toEqual('  a\nb\nc\nd\ne')
      expect(get()).toEqual('\n')
    })

    it('selection first and second line at edge', () => {
      select('\nb')
      b.indent()
      expect(t.value).toEqual('  a\n  b\nc\nd\ne')
      expect(get()).toEqual('\n  b')
    })

    it('selection first and second line full, no b edge', () => {
      select('a\nb')
      b.indent()
      expect(t.value).toEqual('  a\n  b\nc\nd\ne')
      expect(get()).toEqual('a\n  b')
    })

    it('selection first and second line full, incl b edge, caret below', () => {
      select('a\nb\n')
      b.indent()
      expect(t.value).toEqual('  a\n  b\nc\nd\ne')
      expect(get()).toEqual('a\n  b\n')
    })

    it('last', () => {
      select('e')
      b.indent()
      expect(t.value).toEqual('a\nb\nc\nd\n  e')
      expect(get()).toEqual('e')
    })

    it('last incl new line above', () => {
      select('\ne')
      b.indent()
      expect(t.value).toEqual('a\nb\nc\n  d\n  e')
      expect(get()).toEqual('\n  e')
    })

    it('all', () => {
      select('a\nb\nc\nd\ne')
      b.indent()
      expect(t.value).toEqual('  a\n  b\n  c\n  d\n  e')
      expect(get()).toEqual('a\n  b\n  c\n  d\n  e')
    })

    it('all except last, caret below', () => {
      select('a\nb\nc\nd\n')
      b.indent()
      expect(t.value).toEqual('  a\n  b\n  c\n  d\ne')
      expect(get()).toEqual('a\n  b\n  c\n  d\n')
    })

    it('all except first, caret above', () => {
      select('\nb\nc\nd\ne')
      b.indent()
      expect(t.value).toEqual('  a\n  b\n  c\n  d\n  e')
      expect(get()).toEqual('\n  b\n  c\n  d\n  e')
    })

    it('all except first, caret below', () => {
      select('b\nc\nd\ne')
      b.indent()
      expect(t.value).toEqual('a\n  b\n  c\n  d\n  e')
      expect(get()).toEqual('b\n  c\n  d\n  e')
    })

    it('all middle', () => {
      select('b\nc\nd\n')
      b.indent()
      expect(t.value).toEqual('a\n  b\n  c\n  d\ne')
      expect(get()).toEqual('b\n  c\n  d\n')
    })
  })

  describe('a.b.c.d.', () => {
    beforeEach(() => {
      t = createTextArea()
      t.textContent = 'abcd'.split('').join('\n') + '\n'
      b = new Buffer(t, insert, { tabSize: 2, tabStyle: 'spaces', comments: ['//', '/*', '*/'] })
    })

    it('all', () => {
      select('a\nb\nc\nd\n')
      b.indent()
      expect(t.value).toEqual('  a\n  b\n  c\n  d\n')
      expect(get()).toEqual('a\n  b\n  c\n  d\n')
    })

    it('all, hanging first', () => {
      select('\nb\nc\nd\n')
      b.indent()
      expect(t.value).toEqual('  a\n  b\n  c\n  d\n')
      expect(get()).toEqual('\n  b\n  c\n  d\n')
    })

    it('all except last', () => {
      select('a\nb\nc\nd')
      b.indent()
      expect(t.value).toEqual('  a\n  b\n  c\n  d\n')
      expect(get()).toEqual('a\n  b\n  c\n  d')
    })

    it('all, hanging first except last', () => {
      select('\nb\nc\nd')
      b.indent()
      expect(t.value).toEqual('  a\n  b\n  c\n  d\n')
      expect(get()).toEqual('\n  b\n  c\n  d')
    })
  })

  describe('.b.c.d.e', () => {
    beforeEach(() => {
      t = createTextArea()
      t.textContent = '\n' + 'bcde'.split('').join('\n')
      b = new Buffer(t, insert, { tabSize: 2, tabStyle: 'spaces', comments: ['//', '/*', '*/'] })
    })

    it('all', () => {
      select('\nb\nc\nd\ne')
      b.indent()
      expect(t.value).toEqual('\n  b\n  c\n  d\n  e')
      expect(get()).toEqual('\n  b\n  c\n  d\n  e')
    })

    it('all except last', () => {
      select('\nb\nc\nd\n')
      b.indent()
      expect(t.value).toEqual('\n  b\n  c\n  d\ne')
      expect(get()).toEqual('\n  b\n  c\n  d\n')
    })
  })

  describe('adjust caret', () => {
    beforeEach(() => {
      t = createTextArea()
      t.textContent = '    abcd\nefgh'
      b = new Buffer(t, insert, { tabSize: 2, tabStyle: 'spaces', comments: ['//', '/*', '*/'] })
    })

    it('at the start', () => {
      t.setSelectionRange(4, 4)

      b.indent(true)
      expect(t.value).toEqual('  abcd\nefgh')
      expect(t.selectionStart).toEqual(2)
      expect(t.selectionEnd).toEqual(2)

      b.indent(true)
      expect(t.value).toEqual('abcd\nefgh')
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(0)
    })

    it('in between', () => {
      t.setSelectionRange(1, 1)

      b.indent(true)
      expect(t.value).toEqual('  abcd\nefgh')
      expect(t.selectionStart).toEqual(1)
      expect(t.selectionEnd).toEqual(1)

      b.indent(true)
      expect(t.value).toEqual('abcd\nefgh')
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(0)
    })
  })
})

describe('unindent', () => {
  describe('a.  b.    c.  d.e', () => {
    beforeEach(() => {
      t = createTextArea()
      t.textContent = ['a', '  b', '    c', '  d', 'e'].join('\n')
      b = new Buffer(t, insert, { tabSize: 2, tabStyle: 'spaces', comments: ['//', '/*', '*/'] })
    })

    it('all', () => {
      select('a\n  b\n    c\n  d\ne')
      b.indent(true)
      expect(t.value).toEqual('a\nb\n  c\nd\ne')
      expect(get()).toEqual('a\nb\n  c\nd\ne')

      b.indent(true)
      expect(t.value).toEqual('a\nb\nc\nd\ne')
      expect(get()).toEqual('a\nb\nc\nd\ne')

      b.indent(true)
      expect(t.value).toEqual('a\nb\nc\nd\ne')
      expect(get()).toEqual('a\nb\nc\nd\ne')
    })

    it('all, hanging first', () => {
      select('\n  b\n    c\n  d\ne')
      b.indent(true)
      expect(t.value).toEqual('a\nb\n  c\nd\ne')
      expect(get()).toEqual('\nb\n  c\nd\ne')

      b.indent(true)
      expect(t.value).toEqual('a\nb\nc\nd\ne')
      expect(get()).toEqual('\nb\nc\nd\ne')

      b.indent(true)
      expect(t.value).toEqual('a\nb\nc\nd\ne')
      expect(get()).toEqual('\nb\nc\nd\ne')
    })

    it('all except last, hanging before', () => {
      select('a\n  b\n    c\n  d\n')
      b.indent(true)
      expect(t.value).toEqual('a\nb\n  c\nd\ne')
      expect(get()).toEqual('a\nb\n  c\nd\n')

      b.indent(true)
      expect(t.value).toEqual('a\nb\nc\nd\ne')
      expect(get()).toEqual('a\nb\nc\nd\n')

      b.indent(true)
      expect(t.value).toEqual('a\nb\nc\nd\ne')
      expect(get()).toEqual('a\nb\nc\nd\n')
    })

    it('single line no effect', () => {
      select('a')

      b.indent(true)
      expect(t.value).toEqual('a\n  b\n    c\n  d\ne')
      expect(get()).toEqual('a')

      b.indent(true)
      expect(t.value).toEqual('a\n  b\n    c\n  d\ne')
      expect(get()).toEqual('a')
    })

    it('single line one except newline', () => {
      select('  b')

      b.indent(true)
      expect(t.value).toEqual('a\nb\n    c\n  d\ne')
      expect(get()).toEqual('b')

      b.indent(true)
      expect(t.value).toEqual('a\nb\n    c\n  d\ne')
      expect(get()).toEqual('b')
    })

    it('single line one with newline', () => {
      select('  b\n')

      b.indent(true)
      expect(t.value).toEqual('a\nb\n    c\n  d\ne')
      expect(get()).toEqual('b\n')

      b.indent(true)
      expect(t.value).toEqual('a\nb\n    c\n  d\ne')
      expect(get()).toEqual('b\n')
    })

    it('single line partial select', () => {
      select(' b\n')

      b.indent(true)
      expect(t.value).toEqual('a\nb\n    c\n  d\ne')
      expect(get()).toEqual('b\n')

      b.indent(true)
      expect(t.value).toEqual('a\nb\n    c\n  d\ne')
      expect(get()).toEqual('b\n')
    })

    it('two lines partial select', () => {
      select('b\n ')

      b.indent(true)
      expect(t.value).toEqual('a\nb\n  c\n  d\ne')
      expect(get()).toEqual('b\n ')

      b.indent(true)
      expect(t.value).toEqual('a\nb\nc\n  d\ne')
      expect(get()).toEqual('b\nc') // TODO: selection is modified here, is this correct?

      b.indent(true)
      expect(t.value).toEqual('a\nb\nc\n  d\ne')
      expect(get()).toEqual('b\nc') // TODO: selection is modified here, is this correct?
    })

    it('two lines partial, first hanging', () => {
      select('\n   ') // b c

      b.indent(true)
      expect(t.value).toEqual('a\nb\n  c\n  d\ne')
      expect(get()).toEqual('\n ')

      b.indent(true)
      expect(t.value).toEqual('a\nb\nc\n  d\ne')
      expect(get()).toEqual('\nc') // TODO: selection is modified here, is this correct?

      b.indent(true)
      expect(t.value).toEqual('a\nb\nc\n  d\ne')
      expect(get()).toEqual('\nc') // TODO: selection is modified here, is this correct?
    })

    it('two lines hanging, first partial', () => {
      select(' b\n    c\n')

      b.indent(true)
      expect(t.value).toEqual('a\nb\n  c\n  d\ne')
      expect(get()).toEqual('b\n  c\n')

      b.indent(true)
      expect(t.value).toEqual('a\nb\nc\n  d\ne')
      expect(get()).toEqual('b\nc\n')

      b.indent(true)
      expect(t.value).toEqual('a\nb\nc\n  d\ne')
      expect(get()).toEqual('b\nc\n')
    })

    it('three lines hanging, first hanging', () => {
      select('\n  b\n    c\n')

      b.indent(true)
      expect(t.value).toEqual('a\nb\n  c\n  d\ne')
      expect(get()).toEqual('\nb\n  c\n')

      b.indent(true)
      expect(t.value).toEqual('a\nb\nc\n  d\ne')
      expect(get()).toEqual('\nb\nc\n')

      b.indent(true)
      expect(t.value).toEqual('a\nb\nc\n  d\ne')
      expect(get()).toEqual('\nb\nc\n')
    })
  })
})

describe('comment', () => {
  describe('empty', () => {
    beforeEach(() => {
      t = createTextArea()
      t.textContent = ''
      b = new Buffer(t, insert, { tabSize: 2, tabStyle: 'spaces', comments: ['//', '/*', '*/'] })
    })

    it('toggle', () => {
      t.setSelectionRange(0, 0)

      b.toggleSingleComment()
      expect(t.value).toEqual('// ')
      expect(t.selectionStart).toEqual(3)
      expect(t.selectionEnd).toEqual(3)

      b.toggleSingleComment()
      expect(t.value).toEqual('')
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(0)
    })
  })

  describe('various settings', () => {
    it('different comment string', () => {
      t = createTextArea()
      t.textContent = 'hello'
      b = new Buffer(t, insert, { tabSize: 2, tabStyle: 'spaces', comments: [';;', '/*', '*/'] })
      t.setSelectionRange(0, 0)

      b.toggleSingleComment()
      expect(t.value).toEqual(';; hello')

      b.toggleSingleComment()
      expect(t.value).toEqual('hello')
    })
  })

  describe('two lines', () => {
    beforeEach(() => {
      t = createTextArea()
      t.textContent = 'a\nb'
      b = new Buffer(t, insert, { tabSize: 2, tabStyle: 'spaces', comments: ['//', '/*', '*/'] })
    })

    it('toggle', () => {
      select('a\nb')

      b.toggleSingleComment()
      expect(t.value).toEqual('// a\n// b')
      expect(get()).toEqual('a\n// b')

      b.toggleSingleComment()
      expect(t.value).toEqual('a\nb')
      expect(get()).toEqual('a\nb')
    })

    it('first line hanging', () => {
      select('\nb')

      b.toggleSingleComment()
      expect(t.value).toEqual('// a\n// b')
      expect(get()).toEqual('\n// b')

      b.toggleSingleComment()
      expect(t.value).toEqual('a\nb')
      expect(get()).toEqual('\nb')
    })

    it('only first line', () => {
      select('\n')

      b.toggleSingleComment()
      expect(t.value).toEqual('// a\nb')
      expect(get()).toEqual('\n')

      b.toggleSingleComment()
      expect(t.value).toEqual('a\nb')
      expect(get()).toEqual('\n')
    })

    it('only second line', () => {
      select('b')

      b.toggleSingleComment()
      expect(t.value).toEqual('a\n// b')
      expect(get()).toEqual('b')

      b.toggleSingleComment()
      expect(t.value).toEqual('a\nb')
      expect(get()).toEqual('b')
    })
  })

  describe('single line', () => {
    beforeEach(() => {
      t = createTextArea()
      t.textContent = 'a'
      b = new Buffer(t, insert, { tabSize: 2, tabStyle: 'spaces', comments: ['//', '/*', '*/'] })
    })

    it('toggle', () => {
      select('a')

      b.toggleSingleComment()
      expect(t.value).toEqual('// a')
      expect(get()).toEqual('a')

      b.toggleSingleComment()
      expect(t.value).toEqual('a')
      expect(get()).toEqual('a')
    })

    it('no select', () => {
      b.toggleSingleComment()
      expect(t.value).toEqual('// a')
      expect(get()).toEqual('')
      expect(t.selectionStart).toEqual(0)

      b.toggleSingleComment()
      expect(t.value).toEqual('a')
      expect(get()).toEqual('')
      expect(t.selectionStart).toEqual(0)
    })
  })

  describe('single line with previous indent', () => {
    beforeEach(() => {
      t = createTextArea()
      t.textContent = '  a'
      b = new Buffer(t, insert, { tabSize: 2, tabStyle: 'spaces', comments: ['//', '/*', '*/'] })
    })

    it('toggle', () => {
      select('a')

      b.toggleSingleComment()
      expect(t.value).toEqual('  // a')
      expect(get()).toEqual('a')

      b.toggleSingleComment()
      expect(t.value).toEqual('  a')
      expect(get()).toEqual('a')
    })

    it('toggle no select', () => {
      b.toggleSingleComment()
      expect(t.value).toEqual('  // a')
      expect(get()).toEqual('')

      b.toggleSingleComment()
      expect(t.value).toEqual('  a')
      expect(get()).toEqual('')
    })
  })

  describe('finds leftmost indent', () => {
    beforeEach(() => {
      t = createTextArea()
      t.textContent = '  a\n    b\n      c'
      b = new Buffer(t, insert, { tabSize: 2, tabStyle: 'spaces', comments: ['//', '/*', '*/'] })
    })

    it('toggle', () => {
      select('a\n    b\n ')

      b.toggleSingleComment()
      expect(t.value).toEqual('  // a\n  //   b\n  //     c')
      expect(get()).toEqual('a\n  //   b\n  //')

      b.toggleSingleComment()
      expect(t.value).toEqual('  a\n    b\n      c')
      expect(get()).toEqual('a\n    b\n ')
    })

    it('hanging', () => {
      select('a\n    b\n')

      b.toggleSingleComment()
      expect(t.value).toEqual('  // a\n  //   b\n      c')
      expect(get()).toEqual('a\n  //   b\n')

      b.toggleSingleComment()
      expect(t.value).toEqual('  a\n    b\n      c')
      expect(get()).toEqual('a\n    b\n')
    })
  })

  describe('finds leftmost indent with empty line', () => {
    beforeEach(() => {
      t = createTextArea()
      t.textContent = '  a\n    b\n\n      c'
      b = new Buffer(t, insert, { tabSize: 2, tabStyle: 'spaces', comments: ['//', '/*', '*/'] })
    })

    it('toggle', () => {
      select('a\n    b\n\n ')

      b.toggleSingleComment()
      expect(t.value).toEqual('  // a\n  //   b\n\n  //     c')
      expect(get()).toEqual('a\n  //   b\n\n  //')

      b.toggleSingleComment()
      expect(t.value).toEqual('  a\n    b\n\n      c')
      expect(get()).toEqual('a\n    b\n\n ')
    })

    it('hanging', () => {
      select('a\n    b\n\n')

      b.toggleSingleComment()
      expect(t.value).toEqual('  // a\n  //   b\n\n      c')
      expect(get()).toEqual('a\n  //   b\n\n')

      b.toggleSingleComment()
      expect(t.value).toEqual('  a\n    b\n\n      c')
      expect(get()).toEqual('a\n    b\n\n')
    })
  })

  describe('finds leftmost indent, last leftmost', () => {
    beforeEach(() => {
      t = createTextArea()
      t.textContent = '      a\n    b\n  c'
      b = new Buffer(t, insert, { tabSize: 2, tabStyle: 'spaces', comments: ['//', '/*', '*/'] })
    })

    it('toggle', () => {
      select('a\n    b\n ')

      b.toggleSingleComment()
      expect(t.value).toEqual('  //     a\n  //   b\n  // c')
      expect(get()).toEqual('a\n  //   b\n  //')

      b.toggleSingleComment()
      expect(t.value).toEqual('      a\n    b\n  c')
      expect(get()).toEqual('a\n    b\n ')
    })
  })
})

describe('move caret home', () => {
  describe('empty', () => {
    beforeEach(() => {
      t = createTextArea()
      t.textContent = ''
      b = new Buffer(t, insert, { tabSize: 2, tabStyle: 'spaces', comments: ['//', '/*', '*/'] })
    })

    it('begin', () => {
      t.setSelectionRange(0, 0)

      b.moveCaretHome(false)
      expect(get()).toEqual('')
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(0)

      b.moveCaretHome(false)
      expect(get()).toEqual('')
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(0)
    })
  })

  describe('full line', () => {
    beforeEach(() => {
      t = createTextArea()
      t.textContent = 'hello world'
      b = new Buffer(t, insert, { tabSize: 2, tabStyle: 'spaces', comments: ['//', '/*', '*/'] })
    })

    it('begin', () => {
      t.setSelectionRange(0, 0)

      b.moveCaretHome(false)
      expect(get()).toEqual('')
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(0)

      b.moveCaretHome(false)
      expect(get()).toEqual('')
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(0)
    })

    it('middle', () => {
      t.setSelectionRange(5, 5)

      b.moveCaretHome(false)
      expect(get()).toEqual('')
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(0)

      b.moveCaretHome(false)
      expect(get()).toEqual('')
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(0)
    })
  })

  describe('indented line', () => {
    beforeEach(() => {
      t = createTextArea()
      t.textContent = '  hello world'
      b = new Buffer(t, insert, { tabSize: 2, tabStyle: 'spaces', comments: ['//', '/*', '*/'] })
    })

    it('begin', () => {
      t.setSelectionRange(0, 0)

      b.moveCaretHome(false)
      expect(get()).toEqual('')
      expect(t.selectionStart).toEqual(2)
      expect(t.selectionEnd).toEqual(2)

      b.moveCaretHome(false)
      expect(get()).toEqual('')
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(0)

      b.moveCaretHome(false)
      expect(get()).toEqual('')
      expect(t.selectionStart).toEqual(2)
      expect(t.selectionEnd).toEqual(2)
    })

    it('begin with selection', () => {
      t.setSelectionRange(0, 0)

      b.moveCaretHome(true)
      expect(get()).toEqual('  ')
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(2)
      expect(t.selectionDirection).toEqual('forward')

      b.moveCaretHome(true)
      expect(get()).toEqual('')
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(0)

      b.moveCaretHome(true)
      expect(get()).toEqual('  ')
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(2)
      expect(t.selectionDirection).toEqual('forward')
    })

    it('middle', () => {
      t.setSelectionRange(5, 5)

      b.moveCaretHome(false)
      expect(get()).toEqual('')
      expect(t.selectionStart).toEqual(2)
      expect(t.selectionEnd).toEqual(2)

      b.moveCaretHome(false)
      expect(get()).toEqual('')
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(0)

      b.moveCaretHome(false)
      expect(get()).toEqual('')
      expect(t.selectionStart).toEqual(2)
      expect(t.selectionEnd).toEqual(2)
    })

    it('middle with selection', () => {
      t.setSelectionRange(5, 5)

      b.moveCaretHome(true)
      expect(get()).toEqual('hel')
      expect(t.selectionStart).toEqual(2)
      expect(t.selectionEnd).toEqual(5)
      expect(t.selectionDirection).toEqual('backward')

      b.moveCaretHome(true)
      expect(get()).toEqual('  hel')
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(5)
      expect(t.selectionDirection).toEqual('backward')

      b.moveCaretHome(true)
      expect(get()).toEqual('hel')
      expect(t.selectionStart).toEqual(2)
      expect(t.selectionEnd).toEqual(5)
      expect(t.selectionDirection).toEqual('backward')
    })

    it('at indentation level', () => {
      t.setSelectionRange(2, 2)

      b.moveCaretHome(false)
      expect(get()).toEqual('')
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(0)

      b.moveCaretHome(false)
      expect(get()).toEqual('')
      expect(t.selectionStart).toEqual(2)
      expect(t.selectionEnd).toEqual(2)

      b.moveCaretHome(false)
      expect(get()).toEqual('')
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(0)
    })

    it('at indentation level with selection', () => {
      t.setSelectionRange(2, 2)

      b.moveCaretHome(true)
      expect(get()).toEqual('  ')
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(2)
      expect(t.selectionDirection).toEqual('backward')

      b.moveCaretHome(true)
      expect(get()).toEqual('')
      expect(t.selectionStart).toEqual(2)
      expect(t.selectionEnd).toEqual(2)

      b.moveCaretHome(true)
      expect(get()).toEqual('  ')
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(2)
      expect(t.selectionDirection).toEqual('backward')
    })

    it('in space', () => {
      t.setSelectionRange(1, 1)

      b.moveCaretHome(false)
      expect(get()).toEqual('')
      expect(t.selectionStart).toEqual(2)
      expect(t.selectionEnd).toEqual(2)

      b.moveCaretHome(false)
      expect(get()).toEqual('')
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(0)

      b.moveCaretHome(false)
      expect(get()).toEqual('')
      expect(t.selectionStart).toEqual(2)
      expect(t.selectionEnd).toEqual(2)
    })

    it('in space with selection', () => {
      t.setSelectionRange(1, 1)

      b.moveCaretHome(true)
      expect(get()).toEqual(' ')
      expect(t.selectionStart).toEqual(1)
      expect(t.selectionEnd).toEqual(2)
      expect(t.selectionDirection).toEqual('forward')

      b.moveCaretHome(true)
      expect(get()).toEqual(' ')
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(1)
      expect(t.selectionDirection).toEqual('backward')

      b.moveCaretHome(true)
      expect(get()).toEqual(' ')
      expect(t.selectionStart).toEqual(1)
      expect(t.selectionEnd).toEqual(2)
      expect(t.selectionDirection).toEqual('forward')
    })
  })

  describe('multiple lines selection', () => {
    beforeEach(() => {
      t = createTextArea()
      t.textContent = '  hello\n  world'
      b = new Buffer(t, insert, { tabSize: 2, tabStyle: 'spaces', comments: ['//', '/*', '*/'] })
    })

    it('begin backward', () => {
      select('  hello\n  world')
      t.selectionDirection = 'backward'

      b.moveCaretHome(true)
      expect(get()).toEqual('hello\n  world')
      expect(t.selectionStart).toEqual(2)
      expect(t.selectionEnd).toEqual(15)
      expect(t.selectionDirection).toEqual('backward')

      b.moveCaretHome(true)
      expect(get()).toEqual('  hello\n  world')
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(15)
      expect(t.selectionDirection).toEqual('backward')

      b.moveCaretHome(true)
      expect(get()).toEqual('hello\n  world')
      expect(t.selectionStart).toEqual(2)
      expect(t.selectionEnd).toEqual(15)
      expect(t.selectionDirection).toEqual('backward')
    })

    it('begin forward', () => {
      select('  hello\n  world')
      t.selectionDirection = 'forward'

      b.moveCaretHome(true)
      expect(get()).toEqual('  hello\n  ')
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(10)
      expect(t.selectionDirection).toEqual('forward')

      b.moveCaretHome(true)
      expect(get()).toEqual('  hello\n')
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(8)
      expect(t.selectionDirection).toEqual('forward')

      b.moveCaretHome(true)
      expect(get()).toEqual('  hello\n  ')
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(10)
      expect(t.selectionDirection).toEqual('forward')
    })
  })
})

describe('move caret end', () => {
  describe('empty', () => {
    beforeEach(() => {
      t = createTextArea()
      t.textContent = ''
      b = new Buffer(t, insert, { tabSize: 2, tabStyle: 'spaces', comments: ['//', '/*', '*/'] })
    })

    it('begin', () => {
      t.setSelectionRange(0, 0)

      b.moveCaretEnd(false)
      expect(get()).toEqual('')
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(0)

      b.moveCaretEnd(false)
      expect(get()).toEqual('')
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(0)
    })
  })

  describe('full line', () => {
    beforeEach(() => {
      t = createTextArea()
      t.textContent = 'hello world'
      b = new Buffer(t, insert, { tabSize: 2, tabStyle: 'spaces', comments: ['//', '/*', '*/'] })
    })

    it('begin', () => {
      t.setSelectionRange(0, 0)

      b.moveCaretEnd(false)
      expect(get()).toEqual('')
      expect(t.selectionStart).toEqual(11)
      expect(t.selectionEnd).toEqual(11)

      b.moveCaretEnd(false)
      expect(get()).toEqual('')
      expect(t.selectionStart).toEqual(11)
      expect(t.selectionEnd).toEqual(11)
    })

    it('begin with selection', () => {
      t.setSelectionRange(0, 0)

      b.moveCaretEnd(true)
      expect(get()).toEqual('hello world')
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(11)
      expect(t.selectionDirection).toEqual('forward')

      b.moveCaretEnd(true)
      expect(get()).toEqual('hello world')
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(11)
      expect(t.selectionDirection).toEqual('forward')
    })

    it('middle', () => {
      t.setSelectionRange(5, 5)

      b.moveCaretEnd(false)
      expect(get()).toEqual('')
      expect(t.selectionStart).toEqual(11)
      expect(t.selectionEnd).toEqual(11)

      b.moveCaretEnd(false)
      expect(get()).toEqual('')
      expect(t.selectionStart).toEqual(11)
      expect(t.selectionEnd).toEqual(11)
    })

    it('middle with selection', () => {
      t.setSelectionRange(5, 5)

      b.moveCaretEnd(true)
      expect(get()).toEqual(' world')
      expect(t.selectionStart).toEqual(5)
      expect(t.selectionEnd).toEqual(11)

      b.moveCaretEnd(true)
      expect(get()).toEqual(' world')
      expect(t.selectionStart).toEqual(5)
      expect(t.selectionEnd).toEqual(11)
    })
  })

  describe('multiple lines selection', () => {
    beforeEach(() => {
      t = createTextArea()
      t.textContent = '  hello\n  world'
      b = new Buffer(t, insert, { tabSize: 2, tabStyle: 'spaces', comments: ['//', '/*', '*/'] })
    })

    it('begin backward', () => {
      select('llo\n  wor')
      t.selectionDirection = 'backward'

      b.moveCaretEnd(true)
      expect(get()).toEqual('\n  wor')
      expect(t.selectionStart).toEqual(7)
      expect(t.selectionEnd).toEqual(13)
      expect(t.selectionDirection).toEqual('backward')

      b.moveCaretEnd(true)
      expect(get()).toEqual('\n  wor')
      expect(t.selectionStart).toEqual(7)
      expect(t.selectionEnd).toEqual(13)
      expect(t.selectionDirection).toEqual('backward')
    })

    it('begin forward', () => {
      select('llo\n  wor')
      t.selectionDirection = 'forward'

      b.moveCaretEnd(true)
      expect(get()).toEqual('llo\n  world')
      expect(t.selectionStart).toEqual(4)
      expect(t.selectionEnd).toEqual(15)
      expect(t.selectionDirection).toEqual('forward')

      b.moveCaretEnd(true)
      expect(get()).toEqual('llo\n  world')
      expect(t.selectionStart).toEqual(4)
      expect(t.selectionEnd).toEqual(15)
      expect(t.selectionDirection).toEqual('forward')
    })
  })
})

describe('move caret lines', () => {
  describe('empty', () => {
    beforeEach(() => {
      t = createTextArea()
      t.textContent = ''
      b = new Buffer(t, insert, { tabSize: 2, tabStyle: 'spaces', comments: ['//', '/*', '*/'] })
    })

    it('down - nothing', () => {
      t.setSelectionRange(0, 0)
      b.moveCaretLines(2, false)
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(0)
    })

    it('up - nothing', () => {
      t.setSelectionRange(0, 0)
      b.moveCaretLines(-2, false)
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(0)
    })
  })

  describe('single line', () => {
    beforeEach(() => {
      t = createTextArea()
      t.textContent = 'abcde'
      b = new Buffer(t, insert, { tabSize: 2, tabStyle: 'spaces', comments: ['//', '/*', '*/'] })
    })

    it('start of line - down', () => {
      t.setSelectionRange(0, 0)

      b.moveCaretLines(2, false)
      expect(t.selectionStart).toEqual(5)
      expect(t.selectionEnd).toEqual(5)

      b.moveCaretLines(2, false)
      expect(t.selectionStart).toEqual(5)
      expect(t.selectionEnd).toEqual(5)
    })

    it('start of line - down with selection', () => {
      t.setSelectionRange(0, 0)

      b.moveCaretLines(2, true)
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(5)
      expect(t.selectionDirection).toEqual('forward')

      b.moveCaretLines(2, true)
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(5)
      expect(t.selectionDirection).toEqual('forward')
    })

    it('middle of line - down', () => {
      t.setSelectionRange(2, 2)

      b.moveCaretLines(2, false)
      expect(t.selectionStart).toEqual(5)
      expect(t.selectionEnd).toEqual(5)

      b.moveCaretLines(2, false)
      expect(t.selectionStart).toEqual(5)
      expect(t.selectionEnd).toEqual(5)
    })

    it('middle of line - down with selection', () => {
      t.setSelectionRange(2, 2)

      b.moveCaretLines(2, true)
      expect(t.selectionStart).toEqual(2)
      expect(t.selectionEnd).toEqual(5)
      expect(t.selectionDirection).toEqual('forward')

      b.moveCaretLines(2, true)
      expect(t.selectionStart).toEqual(2)
      expect(t.selectionEnd).toEqual(5)
      expect(t.selectionDirection).toEqual('forward')
    })

    it('end of line - up', () => {
      t.setSelectionRange(5, 5)

      b.moveCaretLines(-2, false)
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(0)

      b.moveCaretLines(-2, false)
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(0)
    })

    it('end of line - up with selection', () => {
      t.setSelectionRange(5, 5)

      b.moveCaretLines(-2, true)
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(5)
      expect(t.selectionDirection).toEqual('backward')

      b.moveCaretLines(-2, true)
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(5)
      expect(t.selectionDirection).toEqual('backward')
    })

    it('middle of line - up', () => {
      t.setSelectionRange(2, 2)

      b.moveCaretLines(-2, false)
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(0)

      b.moveCaretLines(-2, false)
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(0)
    })

    it('middle of line - up with selection', () => {
      t.setSelectionRange(2, 2)

      b.moveCaretLines(-2, true)
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(2)
      expect(t.selectionDirection).toEqual('backward')

      b.moveCaretLines(-2, true)
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(2)
      expect(t.selectionDirection).toEqual('backward')
    })
  })

  describe('many lines', () => {
    beforeEach(() => {
      t = createTextArea()
      t.textContent = 'a\nb\nc\nd\ne'
      b = new Buffer(t, insert, { tabSize: 2, tabStyle: 'spaces', comments: ['//', '/*', '*/'] })
    })

    it('start - down', () => {
      t.setSelectionRange(0, 0)

      b.moveCaretLines(2, false)
      expect(t.selectionStart).toEqual(4)
      expect(t.selectionEnd).toEqual(4)

      b.moveCaretLines(2, false)
      expect(t.selectionStart).toEqual(8)
      expect(t.selectionEnd).toEqual(8)

      b.moveCaretLines(2, false)
      expect(t.selectionStart).toEqual(9)
      expect(t.selectionEnd).toEqual(9)

      b.moveCaretLines(2, false)
      expect(t.selectionStart).toEqual(9)
      expect(t.selectionEnd).toEqual(9)
    })

    it('start - down not exact', () => {
      t.setSelectionRange(0, 0)

      b.moveCaretLines(3, false)
      expect(t.selectionStart).toEqual(6)
      expect(t.selectionEnd).toEqual(6)

      b.moveCaretLines(3, false)
      expect(t.selectionStart).toEqual(8)
      expect(t.selectionEnd).toEqual(8)

      b.moveCaretLines(3, false)
      expect(t.selectionStart).toEqual(9)
      expect(t.selectionEnd).toEqual(9)

      b.moveCaretLines(3, false)
      expect(t.selectionStart).toEqual(9)
      expect(t.selectionEnd).toEqual(9)
    })

    it('start + end of line - down', () => {
      t.setSelectionRange(1, 1)

      b.moveCaretLines(2, false)
      expect(t.selectionStart).toEqual(5)
      expect(t.selectionEnd).toEqual(5)

      b.moveCaretLines(2, false)
      expect(t.selectionStart).toEqual(9)
      expect(t.selectionEnd).toEqual(9)

      b.moveCaretLines(2, false)
      expect(t.selectionStart).toEqual(9)
      expect(t.selectionEnd).toEqual(9)
    })

    it('end + end of line - up', () => {
      t.setSelectionRange(9, 9)

      b.moveCaretLines(-2, false)
      expect(t.selectionStart).toEqual(5)
      expect(t.selectionEnd).toEqual(5)

      b.moveCaretLines(-2, false)
      expect(t.selectionStart).toEqual(1)
      expect(t.selectionEnd).toEqual(1)

      b.moveCaretLines(-2, false)
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(0)

      b.moveCaretLines(-2, false)
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(0)
    })

    it('end end of line up not exact', () => {
      t.setSelectionRange(9, 9)

      b.moveCaretLines(-3, false)
      expect(t.selectionStart).toEqual(3)
      expect(t.selectionEnd).toEqual(3)

      b.moveCaretLines(-3, false)
      expect(t.selectionStart).toEqual(1)
      expect(t.selectionEnd).toEqual(1)

      b.moveCaretLines(-3, false)
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(0)

      b.moveCaretLines(-3, false)
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(0)
    })

    it('end + start of line - up', () => {
      t.setSelectionRange(8, 8)

      b.moveCaretLines(-2, false)
      expect(t.selectionStart).toEqual(4)
      expect(t.selectionEnd).toEqual(4)

      b.moveCaretLines(-2, false)
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(0)

      b.moveCaretLines(-2, false)
      expect(t.selectionStart).toEqual(0)
      expect(t.selectionEnd).toEqual(0)
    })

    it('start + start of line - down with selection', () => {
      t.setSelectionRange(0, 0)

      b.moveCaretLines(2, true)
      expect(get()).toEqual('a\nb\n')
      expect(t.selectionDirection).toEqual('forward')

      b.moveCaretLines(2, true)
      expect(get()).toEqual('a\nb\nc\nd\n')
      expect(t.selectionDirection).toEqual('forward')

      b.moveCaretLines(2, true)
      expect(get()).toEqual('a\nb\nc\nd\ne')
      expect(t.selectionDirection).toEqual('forward')

      b.moveCaretLines(2, true)
      expect(get()).toEqual('a\nb\nc\nd\ne')
      expect(t.selectionDirection).toEqual('forward')
    })

    it('start + end of line - down with selection', () => {
      t.setSelectionRange(1, 1)

      b.moveCaretLines(2, true)
      expect(get()).toEqual('\nb\nc')
      expect(t.selectionDirection).toEqual('forward')

      b.moveCaretLines(2, true)
      expect(get()).toEqual('\nb\nc\nd\ne')
      expect(t.selectionDirection).toEqual('forward')

      b.moveCaretLines(2, true)
      expect(get()).toEqual('\nb\nc\nd\ne')
      expect(t.selectionDirection).toEqual('forward')
    })

    it('end + end of line - up with selection', () => {
      t.setSelectionRange(9, 9)

      b.moveCaretLines(-2, true)
      expect(get()).toEqual('\nd\ne')
      expect(t.selectionDirection).toEqual('backward')

      b.moveCaretLines(-2, true)
      expect(get()).toEqual('\nb\nc\nd\ne')
      expect(t.selectionDirection).toEqual('backward')

      b.moveCaretLines(-2, true)
      expect(get()).toEqual('a\nb\nc\nd\ne')
      expect(t.selectionDirection).toEqual('backward')

      b.moveCaretLines(-2, true)
      expect(get()).toEqual('a\nb\nc\nd\ne')
      expect(t.selectionDirection).toEqual('backward')
    })

    it('end + start of line - up with selection', () => {
      t.setSelectionRange(8, 8)

      b.moveCaretLines(-2, true)
      expect(get()).toEqual('c\nd\n')
      expect(t.selectionDirection).toEqual('backward')

      b.moveCaretLines(-2, true)
      expect(get()).toEqual('a\nb\nc\nd\n')
      expect(t.selectionDirection).toEqual('backward')

      b.moveCaretLines(-2, true)
      expect(get()).toEqual('a\nb\nc\nd\n')
      expect(t.selectionDirection).toEqual('backward')
    })

    it('down with existing selection forward', () => {
      select('b\nc')
      t.selectionDirection = 'forward'

      b.moveCaretLines(2, true)
      expect(get()).toEqual('b\nc\nd\ne')
      expect(t.selectionDirection).toEqual('forward')

      b.moveCaretLines(2, true)
      expect(get()).toEqual('b\nc\nd\ne')
      expect(t.selectionDirection).toEqual('forward')
    })

    it('down with existing selection backward', () => {
      select('b\nc')
      t.selectionDirection = 'backward'

      b.moveCaretLines(2, true)
      expect(get()).toEqual('\n')
      expect(t.selectionDirection).toEqual('forward')

      b.moveCaretLines(2, true)
      expect(get()).toEqual('\nd\n')
      expect(t.selectionDirection).toEqual('forward')

      b.moveCaretLines(2, true)
      expect(get()).toEqual('\nd\ne')
      expect(t.selectionDirection).toEqual('forward')
    })

    it('down with existing selection backward exact', () => {
      select('\nb\nc')
      t.selectionDirection = 'backward'

      b.moveCaretLines(2, true)
      expect(get()).toEqual('')
      expect(t.selectionStart).toEqual(5)
      expect(t.selectionEnd).toEqual(5)
      expect(t.selectionDirection).toEqual('forward')

      b.moveCaretLines(2, true)
      expect(get()).toEqual('\nd\ne')
      expect(t.selectionDirection).toEqual('forward')
    })

    it('up with existing selection backward', () => {
      select('\nd\ne')
      t.selectionDirection = 'backward'

      b.moveCaretLines(-2, true)
      expect(get()).toEqual('\nb\nc\nd\ne')
      expect(t.selectionDirection).toEqual('backward')

      b.moveCaretLines(-2, true)
      expect(get()).toEqual('a\nb\nc\nd\ne')
      expect(t.selectionDirection).toEqual('backward')
    })

    it('up with existing selection forward exact', () => {
      select('\nd\ne')
      t.selectionDirection = 'forward'

      b.moveCaretLines(-2, true)
      expect(get()).toEqual('')
      expect(t.selectionStart).toEqual(5)
      expect(t.selectionEnd).toEqual(5)

      b.moveCaretLines(-2, true)
      expect(get()).toEqual('\nb\nc')
      expect(t.selectionDirection).toEqual('backward')

      b.moveCaretLines(-2, true)
      expect(get()).toEqual('a\nb\nc')
      expect(t.selectionDirection).toEqual('backward')
    })

    it('up with existing selection forward', () => {
      select('c\nd\ne')
      t.selectionDirection = 'forward'

      b.moveCaretLines(-2, true)
      expect(get()).toEqual('c')
      expect(t.selectionDirection).toEqual('forward')

      b.moveCaretLines(-2, true)
      expect(get()).toEqual('\nb\n')
      expect(t.selectionDirection).toEqual('backward')

      b.moveCaretLines(-2, true)
      expect(get()).toEqual('a\nb\n')
      expect(t.selectionDirection).toEqual('backward')
    })
  })
})

describe('move lines', () => {
  beforeEach(() => {
    t = createTextArea()
    t.textContent = 'a\nb\nc\nd\ne'
    b = new Buffer(t, insert, { tabSize: 2, tabStyle: 'spaces', comments: ['//', '/*', '*/'] })
  })

  it('single line down', () => {
    t.setSelectionRange(0, 0)

    b.moveLines(1)
    expect(t.value).toEqual('b\na\nc\nd\ne')

    b.moveLines(1)
    expect(t.value).toEqual('b\nc\na\nd\ne')

    b.moveLines(1)
    expect(t.value).toEqual('b\nc\nd\na\ne')

    b.moveLines(1)
    expect(t.value).toEqual('b\nc\nd\ne\na')

    b.moveLines(1)
    expect(t.value).toEqual('b\nc\nd\ne\na')
  })

  it('single line up', () => {
    t.setSelectionRange(9, 9)

    b.moveLines(-1)
    expect(t.value).toEqual('a\nb\nc\ne\nd')

    b.moveLines(-1)
    expect(t.value).toEqual('a\nb\ne\nc\nd')

    b.moveLines(-1)
    expect(t.value).toEqual('a\ne\nb\nc\nd')

    b.moveLines(-1)
    expect(t.value).toEqual('e\na\nb\nc\nd')

    b.moveLines(-1)
    expect(t.value).toEqual('e\na\nb\nc\nd')
  })

  it('single line down hanging selection', () => {
    select('a\n')

    b.moveLines(1)
    expect(t.value).toEqual('b\na\nc\nd\ne')
    expect(get()).toEqual('a\n')

    b.moveLines(1)
    expect(t.value).toEqual('b\nc\na\nd\ne')
    expect(get()).toEqual('a\n')

    b.moveLines(1)
    expect(t.value).toEqual('b\nc\nd\na\ne')
    expect(get()).toEqual('a\n')

    b.moveLines(1)
    expect(t.value).toEqual('b\nc\nd\ne\na')
    expect(get()).toEqual('a')

    b.moveLines(1)
    expect(t.value).toEqual('b\nc\nd\ne\na')
    expect(get()).toEqual('a')
  })

  it('single line up hanging selection', () => {
    select('d\n')

    b.moveLines(-1)
    expect(t.value).toEqual('a\nb\nd\nc\ne')
    expect(get()).toEqual('d\n')

    b.moveLines(-1)
    expect(t.value).toEqual('a\nd\nb\nc\ne')
    expect(get()).toEqual('d\n')

    b.moveLines(-1)
    expect(t.value).toEqual('d\na\nb\nc\ne')
    expect(get()).toEqual('d\n')

    b.moveLines(-1)
    expect(t.value).toEqual('d\na\nb\nc\ne')
    expect(get()).toEqual('d\n')
  })

  it('two lines down', () => {
    select('a\nb')

    b.moveLines(1)
    expect(t.value).toEqual('c\na\nb\nd\ne')
    expect(get()).toEqual('a\nb')

    b.moveLines(1)
    expect(t.value).toEqual('c\nd\na\nb\ne')
    expect(get()).toEqual('a\nb')

    b.moveLines(1)
    expect(t.value).toEqual('c\nd\ne\na\nb')
    expect(get()).toEqual('a\nb')

    b.moveLines(1)
    expect(t.value).toEqual('c\nd\ne\na\nb')
    expect(get()).toEqual('a\nb')
  })

  it('two lines up', () => {
    select('d\ne')

    b.moveLines(-1)
    expect(t.value).toEqual('a\nb\nd\ne\nc')
    expect(get()).toEqual('d\ne')

    b.moveLines(-1)
    expect(t.value).toEqual('a\nd\ne\nb\nc')
    expect(get()).toEqual('d\ne')

    b.moveLines(-1)
    expect(t.value).toEqual('d\ne\na\nb\nc')
    expect(get()).toEqual('d\ne')

    b.moveLines(-1)
    expect(t.value).toEqual('d\ne\na\nb\nc')
    expect(get()).toEqual('d\ne')
  })
})

describe('duplicate', () => {
  beforeEach(() => {
    t = createTextArea()
    t.textContent = 'a\nb\nc\nd\ne'
    b = new Buffer(t, insert, { tabSize: 2, tabStyle: 'spaces', comments: ['//', '/*', '*/'] })
  })

  it('empty', () => {
    t.textContent = ''
    t.setSelectionRange(0, 0)
    expect(t.value).toEqual('')
    b.duplicate()
    expect(t.value).toEqual('\n')
  })

  it('lines = 1', () => {
    t.textContent = 'hello world'
    t.setSelectionRange(0, 0)
    expect(t.value).toEqual('hello world')
    b.duplicate()
    expect(t.value).toEqual('hello world\nhello world')
  })

  it('single line', () => {
    t.setSelectionRange(0, 0)

    b.duplicate()
    expect(t.value).toEqual('a\na\nb\nc\nd\ne')
    expect(get()).toEqual('')
    expect(t.selectionStart).toEqual(2)
    expect(t.selectionEnd).toEqual(2)

    b.duplicate()
    expect(t.value).toEqual('a\na\na\nb\nc\nd\ne')
    expect(get()).toEqual('')
    expect(t.selectionStart).toEqual(4)
    expect(t.selectionEnd).toEqual(4)

    t.setSelectionRange(t.value.length, t.value.length)
    b.duplicate()
    expect(t.value).toEqual('a\na\na\nb\nc\nd\ne\ne')
    expect(get()).toEqual('')
    expect(t.selectionStart).toEqual(15)
    expect(t.selectionEnd).toEqual(15)
  })

  it('selection', () => {
    select('b\nc')

    b.duplicate()
    expect(t.value).toEqual('a\nb\ncb\nc\nd\ne')
    expect(get()).toEqual('b\nc')
    expect(t.selectionStart).toEqual(5)
    expect(t.selectionEnd).toEqual(8)
    expect(t.selectionDirection).toEqual('forward')

    b.duplicate()
    expect(t.value).toEqual('a\nb\ncb\ncb\nc\nd\ne')
    expect(get()).toEqual('b\nc')
    expect(t.selectionStart).toEqual(8)
    expect(t.selectionEnd).toEqual(11)
    expect(t.selectionDirection).toEqual('forward')
  })
})

describe('delete line', () => {
  beforeEach(() => {
    t = createTextArea()
    t.textContent = 'a\nb\nc\nd\ne'
    b = new Buffer(t, insert, { tabSize: 2, tabStyle: 'spaces', comments: ['//', '/*', '*/'] })
  })

  it('single line', () => {
    t.setSelectionRange(0, 0)

    b.deleteLine()
    expect(t.value).toEqual('b\nc\nd\ne')
    expect(get()).toEqual('')
    expect(t.selectionStart).toEqual(0)
    expect(t.selectionEnd).toEqual(0)

    b.deleteLine()
    expect(t.value).toEqual('c\nd\ne')
    expect(get()).toEqual('')
    expect(t.selectionStart).toEqual(0)
    expect(t.selectionEnd).toEqual(0)
  })

  it('single line from middle', () => {
    t.setSelectionRange(3, 3)

    b.deleteLine()
    expect(t.value).toEqual('a\nc\nd\ne')
    expect(get()).toEqual('')
    expect(t.selectionStart).toEqual(3)
    expect(t.selectionEnd).toEqual(3)

    b.deleteLine()
    expect(t.value).toEqual('a\nd\ne')
    expect(get()).toEqual('')
    expect(t.selectionStart).toEqual(3)
    expect(t.selectionEnd).toEqual(3)

    b.deleteLine()
    expect(t.value).toEqual('a\ne')
    expect(get()).toEqual('')
    expect(t.selectionStart).toEqual(3)
    expect(t.selectionEnd).toEqual(3)

    b.deleteLine()
    expect(t.value).toEqual('a')
    expect(get()).toEqual('')
    expect(t.selectionStart).toEqual(1)
    expect(t.selectionEnd).toEqual(1)

    b.deleteLine()
    expect(t.value).toEqual('')
    expect(get()).toEqual('')
    expect(t.selectionStart).toEqual(0)
    expect(t.selectionEnd).toEqual(0)

    b.deleteLine()
    expect(t.value).toEqual('')
    expect(get()).toEqual('')
    expect(t.selectionStart).toEqual(0)
    expect(t.selectionEnd).toEqual(0)
  })
})

describe('double comment', () => {
  beforeEach(() => {
    t = createTextArea()
    t.textContent = 'a\nb\nc\nd\ne'
    b = new Buffer(t, insert, { tabSize: 2, tabStyle: 'spaces', comments: ['//', '/*', '*/'] })
  })

  it('empty', () => {
    t.setSelectionRange(0, 0)
    b.toggleDoubleComment()
    expect(t.value).toEqual('/**/a\nb\nc\nd\ne')
    expect(t.selectionStart).toEqual(2)
    expect(t.selectionEnd).toEqual(2)
    b.toggleDoubleComment()
    expect(t.value).toEqual('a\nb\nc\nd\ne')
    expect(t.selectionStart).toEqual(0)
    expect(t.selectionEnd).toEqual(0)
  })

  describe('various settings', () => {
    it('different double comment string', () => {
      t = createTextArea()
      t.textContent = 'hello'
      b = new Buffer(t, insert, { tabSize: 2, tabStyle: 'spaces', comments: [';;', '(;', ';)'] })
      t.setSelectionRange(0, 5)

      b.toggleDoubleComment()
      expect(t.value).toEqual('(;hello;)')

      b.toggleDoubleComment()
      expect(t.value).toEqual('hello')
    })
  })

  it('with selection', () => {
    t.setSelectionRange(0, 1)
    b.toggleDoubleComment()
    expect(t.value).toEqual('/*a*/\nb\nc\nd\ne')
    expect(t.selectionStart).toEqual(2)
    expect(t.selectionEnd).toEqual(3)
    b.toggleDoubleComment()
    expect(t.value).toEqual('a\nb\nc\nd\ne')
    expect(t.selectionStart).toEqual(0)
    expect(t.selectionEnd).toEqual(1)
  })
})
