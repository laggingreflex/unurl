const patchedURLSearchParamsMethods = ['append', 'delete', 'set'];
const registeredCallbacks = new Set;
const url = createUrl();
let searchParamsBase;
const searchParams = createSearchParams();

module.exports = { url, searchParams, onChange: register, listen };

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

function createUrl(href = location.href) {
  const urlBase = new URL(href);
  const proxy = new Proxy(urlBase, { get, set });
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
      return searchParams;
    } else {
      return value
    }
  }

  function set(target, key, value) {
    try {
      return Reflect.set(target, key, value);
    } finally {
      resetObject(searchParamsBase, searchParamsToObject());
      onChange(proxy);
    }
  }
}

function createSearchParams(from = (url.searchParams || new URLSearchParams(location.search))) {
  searchParamsBase = searchParamsToObject(from);
  const proxy = new Proxy(searchParamsBase, { set });
  return proxy;

  function set(target, key, value) {
    value = stringify(value);
    if (value === false || 'false' === value) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
    resetObject(searchParamsBase, searchParamsToObject());
    onChange(url);
    return true;
  }
}

function searchParamsToObject(searchParams = url.searchParams || new URLSearchParams(location.search)) {
  const object = {};
  for (let [key, value] of searchParams.entries()) {
    value = parse(value);
    if (object[key]) {
      const arrify = array => Array.isArray(array) ? array : array === undefined ? [] : [array];
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
  if (value === '') return true;
  if (typeof value === 'string' && value.includes(',')) try {
    return value.split(',').map(parse);
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
  window.addEventListener('hashchange', onBrowserChange);
  window.addEventListener('popstate', onBrowserChange);
  return () => {
    if (onClickOpts) {
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
