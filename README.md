<h1 align="center">textarea-code</h1>

<p align="center">
adds code editor behavior to a <textarea>
</p>

<p align="center">
   <a href="#install">        🔧 <strong>Install</strong></a>
 · <a href="#example">        🧩 <strong>Example</strong></a>
 · <a href="#api">            📜 <strong>API docs</strong></a>
 · <a href="https://github.com/stagas/textarea-code/releases"> 🔥 <strong>Releases</strong></a>
 · <a href="#contribute">     💪🏼 <strong>Contribute</strong></a>
 · <a href="https://github.com/stagas/textarea-code/issues">   🖐️ <strong>Help</strong></a>
</p>

***

## Install

```sh
$ npm i textarea-code
```

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

*   [TextAreaCodeElement](#textareacodeelement)

### TextAreaCodeElement

[src/index.ts:16-143](https://github.com/stagas/textarea-code/blob/87bb3ce54a05a3c62d57b786fc970f7035eaadcd/src/index.ts#L16-L143 "Source code on GitHub")

**Extends HTMLTextAreaElement**

Adds code editor behavior to a `<textarea>`.

```ts
import { TextAreaCodeElement } from 'textarea-code'
customElements.define('textarea-code', TextAreaCodeElement, { extends: 'textarea' })
```

```html
<textarea is="textarea-code"></textarea>
```

## Contribute

[Fork](https://github.com/stagas/textarea-code/fork) or
[edit](https://github.dev/stagas/textarea-code) and submit a PR.

All contributions are welcome!

## License

MIT © 2021
[stagas](https://github.com/stagas)
