import React from 'react';
import { Container } from './Layout';

import styles from '@/styles/Skeleton.module.css';

export function Rainbow({ repulse, ...props }) {
  return <Container customClasses={[repulse && styles.repulse, styles.rainbow]} {...props} />;
}
