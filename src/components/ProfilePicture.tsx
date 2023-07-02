import React from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import styles from '../styles/ProfilePicture.module.css';

export function ProfilePicture({ src, brand }: { src: string, brand?: boolean }) {
  return <Image className={clsx([styles.pfp, brand && styles.brand])} src={src} alt="" width="64" height="64" />;
  // return <div><div className={styles.pfp}></div></div>
}
