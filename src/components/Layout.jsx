import React, { useMemo } from 'react';
import cls from 'clsx';
import styles from '@/styles/Layout.module.css';

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
  cta,
  scroll,
  center,
  children,
  uncollapsable,
  expandable,
  expanded,
  oneline,
  disabled,
  style,
  unwrap,
  related,
  customTag,
  ...props
}) {
  const Tag = useMemo(() => customTag || ((a) => <div {...a} />), [customTag]);
  return (
    <Tag
      {...props}
      style={
        Object.fromEntries(
          Object.entries({
            width: w === true ? '100%' : w,
            height: h === true ? '100%' : h,
            padding: pad === true ? '1em' : pad,
            borderRadius: br === true ? '1em' : br,
            gap: gap === true ? '1em' : gap,
            ...style,
          }).filter(([, v]) => v != null),
        )
      }
      className={cls(
        styles.container,
        highlight && styles.highlight,
        cta && styles.cta,
        fill && styles.fill,
        summarize && styles.summarize,
        scroll && styles.scroll,
        oneline && styles.oneline,
        surface && styles.surface,
        expandable && styles.expandable,
        expanded && styles.expanded,
        uncollapsable && styles.uncollapsable,
        center && styles.center,
        unwrap && styles.unwrap,
        related && styles.related,
        disabled && styles.disabled,
        ...(customClasses || []),
      )}
    >
      {children}
    </Tag>
  );
}

export function Stack({
  center,
  col,
  customClasses,
  children,
  jc,
  ai,
  style,
  ...props
}) {
  return (
    <Container
      {...props}
      style={
        Object.fromEntries(
          Object.entries({
            justifyContent: jc === true ? 'center' : jc,
            alignItems: ai === true ? 'center' : ai,
            ...style,
          }).filter(([, v]) => v != null),
        )
      }
      customClasses={[
        styles.stack,
        center && styles.center,
        col && styles.v,
        ...(customClasses || []),
      ]}
    >
      {children}

    </Container>
  );
}

export function ClickableContainer({
  toggleState,
  onFire,
  unclickable,
  children,
  selectable,
  customClasses,
  disabled,
  ...props
}) {
  onFire = onFire || (() => {});
  toggleState = toggleState || (() => {});
  const fire = () => {
    if (disabled) return true;
    toggleState((previous) => !previous);
    return onFire();
  };
  return (
    <Stack
      {...props}
      onClick={fire}
      onKeyDown={(e) => {
        if (e.code === 'Enter') {
          e.preventDefault();
          fire();
        }
      }}
      tabIndex={!unclickable ? 0 : -1}
      customClasses={[
        styles.cc,
        !unclickable && styles.clickable,
        !selectable && styles.unselectable,
        ...(customClasses || []),
      ]}
      disabled={disabled}
      // customTag={(a=><button {...a}/>)}
    >
      {children}
    </Stack>
  );
}
