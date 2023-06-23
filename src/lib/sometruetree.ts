export class SomeTrueTree<T> {
  label: T;

  hidden___value: boolean | undefined;

  children: Record<string, SomeTrueTree<T>>;

  constructor(
    label: T,
    value: boolean = false,
    children: Record<string, SomeTrueTree<T>> = {},
  ) {
    this.label = label;
    this.hidden___value = value;
    this.children = children;
  }

  get value() {
    if (this.hidden___value === true) return true;
    // eslint-disable-next-line no-restricted-syntax
    for (const child of Object.values(this.children)) {
      if (child.value) return true;
    }
    return false;
  }

  set value(val) {
    this.hidden___value = val;
  }

  set(key: string, val: SomeTrueTree<T>) {
    this.children[key] = val;
    return val;
  }

  get(key: string) {
    return this.children[key];
  }

  toJSON() {
    return {
      value: this.value,
      innerValue: this.hidden___value,
      children: this.children,
    };
  }
}
