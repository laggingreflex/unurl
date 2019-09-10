const { Component, createElement: h, useState } = require('react');
const { url, onChange } = require('.')

exports.useUrl = () => {
  const [, update] = useState();
  onChange(() => update(url.href));
  return url;
};

exports.connect = component => class extends Component {
  render() {
    const children = Array.isArray(this.children) ? this.children : typeof this.children === 'undefined' ? [] : [this.children];
    return h(component, this.props, ...children);
  }
  componentDidMount() {
    this.removeOnChange = onChange((url) => this.setState(url));
  }
  componentWillUnmount() {
    this.removeOnChange();
  }
};
