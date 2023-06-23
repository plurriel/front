import React from 'react';
import styles from '@/styles/Skeleton.module.css';
import { Container, ContainerOptions } from './Layout';

export function Rainbow({ repulse, ...props }: { repulse?: boolean } & ContainerOptions) {
  return <Container customClasses={[repulse && styles.repulse, styles.rainbow]} {...props} />;
}
