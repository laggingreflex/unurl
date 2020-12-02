const patchedURLSearchParamsMethods = ['append', 'delete', 'set'];
const registeredCallbacks = new Set;
const symbol = { proxied: Symbol('proxied') };
const { urlBase, proxy: url } = createUrl();
const searchParams = createSearchParams();

module.exports = { url, searchParams, onChange: register, listen, set: setLocation };

function register(callback) {
  registeredCallbacks.add(callback);
  return () => registeredCallbacks.delete(callback);
}

function onChange(url) {
  history.pushState(history.state, '', url.href)
  for (const callback of registeredCallbacks) {
    callback(url);
  }
}

function createUrl(href = location.href) {
  const urlBase = new URL(href);
  const proxy = new Proxy(urlBase, { get, set });
  return { urlBase, proxy };

  function get(target, key) {
    const value = Reflect.get(target, key);
    if (key === 'searchParams') {
      const searchParams = value;
      for (const methodName of patchedURLSearchParamsMethods) {
        const method = searchParams[methodName];
        if (!method[symbol.proxied]) {
          searchParams[methodName] = function() {
            try {
              return Reflect.apply(method, this, arguments);
            } finally {
              onChange(proxy);
            }
          }
        }
        searchParams[methodName][symbol.proxied] = true;
      }
      return searchParams;
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

function createSearchParams() {
  const proxy = new Proxy({}, { get, set, deleteProperty });
  return proxy;

  function get(target, key) {
    return searchParamsToObject()[key];
  }

  function set(target, key, value) {
    url.searchParams.set(key, stringify(value));
    return true;
  }

  function deleteProperty(target, key) {
    url.searchParams.delete(key);
    return true;
  }
}

function searchParamsToObject(searchParams = url.searchParams || new URLSearchParams(location.search)) {
  const object = {};
  for (let [key, value] of searchParams.entries()) {
    value = parse(value);
    if (object[key]) {
      object[key] = [...arrify(object[key]), ...arrify(value)];
    } else {
      object[key] = value;
    }
  }
  return object;
}

function parse(value) {
  try {
    value = JSON.parse(value);
  } catch (error) {}
  if (value === '') value = true;
  if (typeof value === 'string' && value.includes(',')) try {
    value = value.split(',').map(parse);
  } catch (error) {}
  return value;
}

function stringify(value) {
  if (typeof value === 'boolean' && value) {
    value = '';
  }
  if (Array.isArray(value)) {
    return value.map(stringify).join(',');
  }
  if (value === null || undefined === value) {
    value = false;
  }
  // if (typeof value !== 'string') {
  //   value = JSON.stringify(value);
  // }
  return value;
}

function resetObject(oldObject, newObject) {
  for (const key in oldObject) {
    delete oldObject[key];
  }
  Object.assign(oldObject, newObject);
}

function listen({ click: onClickOpts = {} } = {}) {
  if (onClickOpts) {
    window.addEventListener('click', onClick, onClickOpts);
  }
  window.addEventListener('hashchange', onHashChange);
  window.addEventListener('popstate', onPopState);
  return () => {
    if (onClickOpts) {
      window.removeEventListener('click', onClick);
    }
    window.removeEventListener('hashchange', onHashChange);
    window.removeEventListener('popstate', onPopState);
  }
}

function setLocation(location) {
  if (location.startsWith('/')) location = document.location.origin + location;
  url.href = location;
}

function onClick(e) {
  let { target } = e;
  if (target.tagName === 'A' || (target = target.closest('a'))) {
    const href = target.href;
    if (href.startsWith(document.location.origin)) {
      e.preventDefault();
      url.href = href;
    }
  }
}

function onHashChange() {
  url.href = window.location.href;
}

function onPopState() {
  urlBase.href = window.location.href;
  for (const callback of registeredCallbacks) {
    callback(url);
  }
}

function arrify(array) {
  return Array.isArray(array) ? array
    : array === undefined ? []
    : [array];
}
