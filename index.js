const patchedURLSearchParamsMethods = ['append', 'delete', 'set'];
const registeredCallbacks = new Set;
const url = create();

module.exports = { url, onChange: register };

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
