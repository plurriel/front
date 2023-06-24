import React from 'react';
import styles from '@/styles/IconButton.module.css';
import { CCOptions, ClickableContainer } from './Layout';
import { IconProps } from './icons/Icon';

export interface IconButtonProps extends CCOptions {
  children?: React.ReactNode;
  icon: React.FC<IconProps>;
  customClasses?: string[];
  revpad?: string;
}

export function IconButton({
  children,
  icon,
  customClasses,
  revpad,
  style,
  ...props
}: IconButtonProps) {
  const Icon = icon;
  return (
    <ClickableContainer
      {...props}
      customClasses={[styles.iconbtn, ...(customClasses || [])]}
      style={{
        '--revpad': revpad || '1em',
        ...style,
      } as React.CSSProperties}
    >
      <Icon block />
    </ClickableContainer>
  );
}
