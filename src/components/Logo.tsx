/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import styles from '@/styles/Logo.module.css';

export function Logo() {
  return (
    <h1 className={styles.logo}>
      <span className={styles.highlight}>P</span>lurriel
    </h1>
  );
}
