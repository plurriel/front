import React from 'react';
import clsx from 'clsx';
import styles from '@/styles/Input.module.css';

export function TextInput({
  w,
  h,
  pad,
  br,
  style,
  customClasses,
  ...props
}) {
  return (
    <input
      style={
        Object.fromEntries(
          Object.entries({
            width: w === true ? '100%' : w,
            height: h === true ? '100%' : h,
            padding: pad === true ? '1em' : pad,
            borderRadius: br === true ? '1em' : br,
            ...style,
          }).filter(([, v]) => v != null),
        )
      }
      className={
        clsx([
          styles.input,
          ...(customClasses || []),
        ])
      }
      type="text"
      {...props}
    />
  );
}
