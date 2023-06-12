export class SomeTrueTree {
  constructor(label, value = false, children = {}) {
    this.label = label;
    this.hidden___value = value;
    this.children = children;
  }

  get value() {
    if (this.hidden___value) return true;
    // eslint-disable-next-line no-restricted-syntax
    for (const child of this.children) {
      if (child.value) return true;
    }
    return false;
  }

  set value(val) {
    this.hidden___value = val;
  }

  set(key, val) {
    this.children[key] = val;
    return val;
  }

  get(key) {
    return this.children[key];
  }

  toJSON() {
    return JSON.stringify({
      value: this.value,
      innerValue: this.hidden___value,
      children: this.children,
    });
  }
}
