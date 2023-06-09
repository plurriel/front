import React, { HTMLProps } from 'react';
import cls from 'clsx';
import styles from '@/styles/Icon.module.css';

export interface IconProps extends Omit<HTMLProps<SVGElement>, 'ref'> {
  block?: boolean;
  customClasses?: string[];
  dimensions?: string | number;
}

export function Icon({
  block,
  customClasses,
  size,
  pathdef,
  ...props
}: IconProps & { pathdef: string }) {
  return (
    <svg
      className={cls([block && styles.block, ...(customClasses || [])])}
      width={size || '1em'}
      height={size || '1em'}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d={pathdef} />
    </svg>
  );
}
