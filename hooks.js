const { useState } = require('react');
const { url, onChange } = require('.');

exports.useUrl = () => {
  const [, update] = useState();
  onChange(() => update());
  return url;
};
