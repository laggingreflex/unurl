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

[URL]: https://developer.mozilla.org/en-US/docs/Web/API/URL
[Proxy]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Proxy
[proxy-support]: http://caniuse.com/proxy
