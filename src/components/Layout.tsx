/* eslint-disable react/function-component-definition */
/* eslint-disable react/require-default-props */
import React, { useMemo } from 'react';
import cls, { ClassValue } from 'clsx';
import styles from '@/styles/Layout.module.css';

export interface ContainerOptions<T = typeof DivTag> {
  w?: string | boolean;
  h?: string | boolean;
  pad?: string | boolean;
  br?: string | boolean;
  gap?: string | boolean;
  flexGrow?: boolean;
  summarize?: boolean;
  customClasses?: ClassValue[];
  surface?: boolean;
  highlight?: boolean;
  cta?: boolean;
  scroll?: boolean;
  center?: boolean;
  uncollapsable?: boolean;
  expandable?: boolean;
  expanded?: boolean;
  oneline?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  unwrap?: boolean;
  related?: boolean;
  customTag?: React.ComponentType | string;
  children?: React.ReactNode;
}

const DivTag = (a: React.HTMLProps<HTMLDivElement>) => <div {...a} />;

export function Container<CustomTagT = typeof DivTag>({
  w,
  h,
  pad,
  br,
  gap,
  flexGrow,
  summarize,
  customClasses,
  surface,
  highlight,
  cta,
  scroll,
  center,
  uncollapsable,
  expandable,
  expanded,
  oneline,
  disabled,
  style,
  unwrap,
  related,
  customTag: CustomTag,
  children,
  ...props
}: ContainerOptions<CustomTagT>
  & React.HTMLProps<CustomTagT>) {
  const Tag = useMemo(() => (CustomTag || DivTag), [CustomTag]);
  return (
    <Tag
      {...(props as any)}
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
        flexGrow && styles.fill,
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

export interface StackOptions<T = typeof DivTag> extends ContainerOptions<T> {
  center?: boolean;
  col?: boolean;
  jc?: string | boolean;
  ai?: string | boolean;
}

export function Stack<CustomTag = typeof DivTag>({
  center,
  col,
  customClasses,
  children,
  jc,
  ai,
  style,
  ...props
}: StackOptions<CustomTag>
  & React.HTMLProps<CustomTag>) {
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

export interface CCOptions<T = typeof DivTag> extends StackOptions<T> {
  toggleState?: React.Dispatch<React.SetStateAction<boolean>>;
  onFire?: Function;
  unclickable?: boolean;
  selectable?: boolean;
}

export function ClickableContainer<CustomTag = typeof DivTag>({
  toggleState,
  onFire,
  unclickable,
  children,
  selectable,
  customClasses,
  disabled,
  customTag,
  ...props
}: CCOptions<CustomTag>
& React.HTMLProps<CustomTag>) {
  const fire = () => {
    if (disabled) return true;
    if (toggleState) toggleState((previous) => !previous);
    return (onFire || (() => {}))();
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
