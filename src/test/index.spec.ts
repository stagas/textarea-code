import { TextAreaCodeElement } from '../'

// jsdom doesn't have ResizeObserver, so we polyfill it
import ResizeObserverPolyfill from 'resize-observer-polyfill'
window.ResizeObserver = ResizeObserverPolyfill

describe('TextAreaCodeElement', () => {
  it('registers', () => {
    customElements.define('textarea-code', TextAreaCodeElement, { extends: 'textarea' })
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

    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', ctrlKey: true, shiftKey: true }))
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', ctrlKey: true, shiftKey: true }))
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageUp', ctrlKey: true, shiftKey: true }))
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', ctrlKey: true, shiftKey: true }))

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

    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    textarea.value = '{'
    textarea.setSelectionRange(1, 1)
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(textarea.value).toEqual('{\n  ')
  })

  it('accepts changes in attributes', () => {
    const textarea = document.createElement('textarea', { is: 'textarea-code' }) as TextAreaCodeElement

    textarea.setAttribute('tabsize', '3')
    expect(textarea.buffer.options.tabSize).toEqual(3)
    textarea.setAttribute('tabsize', '')
    expect(textarea.buffer.options.tabSize).toEqual(2)

    textarea.setAttribute('tabstyle', '')
    expect(textarea.buffer.options.tabStyle).toEqual('spaces')
    textarea.setAttribute('tabstyle', 'spaces')
    expect(textarea.buffer.options.tabStyle).toEqual('spaces')
    textarea.setAttribute('tabstyle', 'tabs')
    expect(textarea.buffer.options.tabStyle).toEqual('tabs')
    textarea.setAttribute('tabstyle', 'other')
    expect(textarea.buffer.options.tabStyle).toEqual('spaces')

    textarea.setAttribute('comments', ';; (; ;)')
    expect(textarea.buffer.options.comments).toEqual([';;', '(;', ';)'])
    textarea.setAttribute('comments', '')
    expect(textarea.buffer.options.comments).toEqual(['//', '/*', '*/'])
  })

  if (!window.navigator.userAgent.includes('jsdom'))
    it('adjusts pageSize on resize', async () => {
      const textarea = document.createElement('textarea', { is: 'textarea-code' }) as TextAreaCodeElement
      document.body.appendChild(textarea)
      textarea.style.lineHeight = '16px'
      textarea.style.height = '250px'
      textarea.style.width = '100px'
      expect(textarea.offsetHeight).toEqual(250)
      // textarea.dispatchEvent(new Event('resize'))
      await new Promise<void>(resolve => setTimeout(resolve, 10))
      expect(textarea.pageSize).toEqual(14)
    })
})
