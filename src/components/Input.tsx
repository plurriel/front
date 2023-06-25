import React from 'react';
import clsx from 'clsx';
import styles from '@/styles/Input.module.css';
import { Container, ContainerOptions } from './Layout';

interface AllTextInputOptions extends ContainerOptions {
  customClasses?: string[];
}

export function TextInput({
  customClasses,
  ...props
}: AllTextInputOptions & React.HTMLProps<HTMLInputElement>) {
  return (
    <Container<HTMLInputElement>
      customClasses={[
        styles.input,
        ...(customClasses || []),
      ]}
      type="text"
      customTag="input"
      {...props}
    />
  );
}
