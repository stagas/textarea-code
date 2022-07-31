// // jsdom doesn't have ResizeObserver, so we polyfill it
// import ResizeObserverPolyfill from 'resize-observer-polyfill'
import { TextAreaCodeElement } from '../src'

// window.ResizeObserver = ResizeObserverPolyfill

describe('TextAreaCodeElement', () => {
  beforeAll(() => {
    customElements.define('textarea-code', TextAreaCodeElement, { extends: 'textarea' })
  })

  it('registers', () => {
    expect(customElements.get('textarea-code')).toBe(TextAreaCodeElement)
  })

  it('create', () => {
    const textarea = document.createElement('textarea', { is: 'textarea-code' })
    expect(textarea).toBeInstanceOf(TextAreaCodeElement)
  })

  it('accepts all keyboard input', () => {
    const textarea = document.createElement('textarea', { is: 'textarea-code' })
    document.body.appendChild(textarea)
    textarea.focus()
    expect(document.activeElement).toBe(textarea)

    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: '/', ctrlKey: true }))
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: '?', ctrlKey: true }))
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'D', ctrlKey: true }))

    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageUp' }))
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown' }))

    textarea.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', ctrlKey: true, shiftKey: true })
    )
    textarea.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', ctrlKey: true, shiftKey: true })
    )
    textarea.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'PageUp', ctrlKey: true, shiftKey: true })
    )
    textarea.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'PageDown', ctrlKey: true, shiftKey: true })
    )

    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', shiftKey: true }))
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', shiftKey: true }))
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageUp', shiftKey: true }))
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', shiftKey: true }))

    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', altKey: true }))
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true }))
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageUp', altKey: true }))
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', altKey: true }))

    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', shiftKey: true }))

    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }))

    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }))
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', shiftKey: true }))

    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }))
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', shiftKey: true }))

    // textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    // textarea.value = '{'
    // textarea.setSelectionRange(1, 1)
    // textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    // expect(textarea.value).toEqual('{\n  ')
  })

  it('accepts changes in attributes', () => {
    const textarea = document.createElement('textarea', {
      is: 'textarea-code',
    }) as TextAreaCodeElement

    textarea.setAttribute('tabsize', '3')
    expect(textarea.tabSize).toEqual(3)
    textarea.setAttribute('tabsize', '2')
    expect(textarea.tabSize).toEqual(2)

    // textarea.setAttribute('tabstyle', 'spaces')
    // expect(textarea.tabStyle).toEqual('spaces')
    textarea.setAttribute('tabstyle', 'spaces')
    expect(textarea.tabStyle).toEqual('spaces')
    textarea.setAttribute('tabstyle', 'tabs')
    expect(textarea.tabStyle).toEqual('tabs')
    // textarea.setAttribute('tabstyle', 'other')
    // expect(textarea.tabStyle).toEqual('other')

    textarea.setAttribute('comments', ';; (; ;)')
    expect(textarea.comments).toEqual(';; (; ;)')
    // textarea.setAttribute('comments', '')
    // expect(textarea.comments).toEqual('// /* */')
  })

  it('adjusts pageSize on resize', async () => {
    const textarea = document.createElement('textarea', {
      is: 'textarea-code',
    }) as TextAreaCodeElement
    document.body.appendChild(textarea)
    textarea.style.lineHeight = '16px'
    textarea.style.height = '250px'
    textarea.style.width = '100px'
    textarea.style.padding = '0'
    textarea.style.border = 'none'
    expect(textarea.offsetHeight).toEqual(250)
    await new Promise<void>(resolve => setTimeout(resolve, 10))
    expect(textarea.pageSize).toEqual(14)
  })
})
