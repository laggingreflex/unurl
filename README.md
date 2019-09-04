# unurl

Simple [undb]-based reactive URL-like object

## Install

```sh
npm i unurl
```

## Usage

```js
const { url, onChange } = require('unurl')

url.pathname = '/new-path'

onChange(() => {
  // Fires when url changes
})
```
```js
const { url } = require('unurl')
const connect = require('unurl/connect')

const ReactComponent = () => {
  // re-renders when url changes
}

export default connect(ReactComponent)
```
```jsx
const { useUrl } = require('unurl/hooks')

const ReactComponent = () => {
  const url = useUrl()
  // re-renders when url changes
}
```


[undb]: https://github.com/laggingreflex/undb
