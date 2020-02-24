const patchedURLSearchParamsMethods = ['append', 'delete', 'set'];
const registeredCallbacks = new Set;
const url = create();

module.exports = { url, onChange: register, listen };

function register(callback) {
  registeredCallbacks.add(callback);
  return () => registeredCallbacks.delete(callback);
}

function onChange(url) {
  history.replaceState(history.state, '', url.href)
  for (const callback of registeredCallbacks) {
    callback(url);
  }
}

function create(href = location.href) {
  const proxy = new Proxy(new URL(href), { get, set });
  return proxy;

  function get(target, key) {
    const value = Reflect.get(target, key);
    if (key === 'searchParams') {
      const searchParams = value;
      for (const methodName of patchedURLSearchParamsMethods) {
        const method = searchParams[methodName];
        searchParams[methodName] = function() {
          try {
            return Reflect.apply(method, this, arguments);
          } finally {
            onChange(proxy);
          }
        }
      }
    } else {
      return value
    }
  }

  function set(target, key, value) {
    try {
      return Reflect.set(target, key, value);
    } finally {
      onChange(proxy);
    }
  }
}

function listen({ click = true } = {}) {
  if (click) {
    window.addEventListener('click', onClick);
  }
  window.addEventListener('hashchange', onBrowserChange);
  window.addEventListener('popstate', onBrowserChange);
  return () => {
    if (click) {
      window.removeEventListener('click', onClick);
    }
    window.removeEventListener('hashchange', onBrowserChange);
    window.removeEventListener('popstate', onBrowserChange);
  }
}

function onClick(e) {
  if (e.target.tagName === 'A') {
    const href = e.target.href;
    if (href.startsWith(document.location.origin)) {
      e.preventDefault();
      history.pushState({}, '', href);
      url.href = href;
    }
  }
}

function onBrowserChange() {
  url.href = window.location.href;
}
