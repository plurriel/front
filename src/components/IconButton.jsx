import React from 'react';
import { ClickableContainer } from './Layout';
import styles from '@/styles/IconButton.module.css';

export function IconButton({
  children,
  icon,
  customClasses,
  revpad,
  ...props
}) {
  const Icon = icon;
  return (
    <ClickableContainer
      {...props}
      customClasses={[styles.iconbtn, customClasses]}
      style={{
        '--revpad': revpad || '1em',
      }}
    >
      <Icon block />
    </ClickableContainer>
  );
}
