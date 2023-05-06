import cls from "clsx";
import styles from "@/styles/Layout.module.css";

export function Container({
  w,
  h,
  pad,
  br,
  gap,
  fill,
  summarize,
  customClasses,
  surface,
  highlight,
  scroll,
  center,
  children,
  uncollapsable,
  expandable,
  expanded,
  oneline,
  style,
  ...props
}) {
  return <div {...props} style={Object.fromEntries(Object.entries({
    width: w === true ? '100%' : w,
    height: h === true ? '100%' : h,
    padding: pad === true ? '1em' : pad,
    borderRadius: br,
    gap: gap,
    ...style,
  }).filter(([k, v]) => v != null))} className={cls(
    styles.container,
    highlight && styles.highlight,
    fill && styles.fill,
    summarize && styles.summarize,
    scroll && styles.scroll,
    oneline && styles.oneline,
    surface && styles.surface,
    expandable && styles.expandable,
    expanded && styles.expanded,
    uncollapsable && styles.uncollapsable,
    center && styles.center,
    ...(customClasses || [])
  )}>{children}</div>
}

export function Stack({
  center,
  col,
  customClasses,
  children,
  ...props
}) {
  return (
    <Container {...props} customClasses={[
      styles.stack,
      center && styles.center,
      col && styles.v,
      ...(customClasses || [])
    ]}>{children}</Container>
  );
}

export function RelatedStack({ customClasses, children, ...props }) {
  return (
    <Stack {...props} customClasses={[styles.related, ...(customClasses || [])]}>{children}</Stack>
  );
}

export function ClickableContainer({
  toggleState,
  onFire,
  unclickable,
  children,
  ...props
}) {
  onFire = onFire || (() => {});
  toggleState = toggleState || (() => {});
  const fire = () => {
    toggleState((previous) => !previous);
    return onFire();
  };
  return (
    <Stack
      onClick={fire}
      onKeyDown={(e) => {
        e.preventDefault()
        if (e.keyCode === 13) fire();
      }}
      tabIndex={!unclickable && 0}
    {...props}>
      {children}
    </Stack>
  );
}
