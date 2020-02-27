# unurl

Simple reactive [URL] object

<sup>Note: uses [Proxy], check [browser support][proxy-support] before using.</sup>

## Install

```sh
npm i unurl
```

## Usage

```js
const { url, onChange } = require('unurl')

onChange(() => {
  // Fires when url changes
})

function changeURL() {
  url.pathname = '/new-path'
  url.searchParams.append('foo', 'bar')
}
```
```js
const { url } = require('unurl')
const { connect } = require('unurl/react')

const ReactComponentConnectStyle = connect(() => {
  // re-renders when url changes
})
```
```jsx
const { useUrl } = require('unurl/react')

const ReactComponentEffectStyle = () => {
  const url = useUrl()
  // re-renders when url changes
}
```

## API

```
const { url, searchParams, onChange, listen } = require('unurl')
```

### **`url`**

A [Proxy] of [new URL][URL] that fires [onChange] whenever a property is changed.

* **`@property {string} hostname`**  A String containing the domain of the URL.
* **`@property {string} pathname`**      A String containing an initial '/' followed by the path of the URL.
* ...[URL#Properties]

### **`searchParams`**

[searchParams] but in an object-form with values parsed for easier consumption.

Querystring  | Object            | Remark
-------------|-------------------|----------------
`?a`         | `{ a: true }`     | Boolean converted
`?a=b`       | `{ a: 'b' }`      |
`?a=1`       | `{ a: 1 }`        | JSON parsed
`?a=b,1`     | `{ a: ['b', 1] }` | Comma-separated parsed as array



### **`onChange`**

A function to register a callback that's fired whenever [url] is changed, or when [listening][listen] to browser events.

* **`@param {function} callback`** Callback to fire when [url] changes
* **`@returns {function} unRegister`** Frees the `callback` from firing anymore

### **`listen`**

Listen to browser events: [click] (on an [\<a>] element), [popstate], and [hashchange] to fire [onChange].

* **`@param {object} [opts]`**
* **`@param {Boolean|Object} [opts.click={}]`** Listen to [click] events on all [\<a>] elements. Will [prevent][preventDefault] if `href` is from the same (current) hostname. Options will be passed to [addEventListener].
* **`@returns {function} removeListener`** Removes and frees the attached event listeners

## React API

[React]-specific helper functions.

```
const { connect, useUrl } = require('unurl/react')
```

### **`connect`**

Converts a [React] [Component] into one that re-renders whenever [url] changes.

* **`@param {ReactComponent|Function} component`** React Component or a function to wrap
* **`@returns {ReactComponent} component`** Wrapper Component that renders the above `component`

### **`useUrl`**

A React [Hook] that updates whenever [url] changes.


[url]: #url
[onChange]: #onChange
[listen]: #listen

[URL]: https://developer.mozilla.org/en-US/docs/Web/API/URL
[URL#Properties]: https://developer.mozilla.org/en-US/docs/Web/API/URL#Properties
[searchParams]: https://developer.mozilla.org/en-US/docs/Web/API/URL/searchParams
[Proxy]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Proxy
[proxy-support]: http://caniuse.com/proxy
[searchParams]: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams

[click]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/click
[\<a>]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a
[preventDefault]: https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
[addEventListener]: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
[popstate]: https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event
[hashchange]: https://developer.mozilla.org/en-US/docs/Web/API/Window/hashchange_event

[React]: https://reactjs.org
[Component]: https://reactjs.org/docs/react-component.html
[Hook]: https://reactjs.org/docs/hooks-intro.html
