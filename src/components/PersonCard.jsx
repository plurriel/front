import React from 'react';
import { Container } from './Layout.jsx';
import { ProfilePicture } from './ProfilePicture.jsx';
import styles from '../styles/PersonCard.module.css';

export function Person({
  name,
  img,
  reversed,
}) {
  if (reversed) {
    return (
      <>
        <Container summarize fill oneline customClasses={[styles.reversedtext]}>{name}</Container>
        {img && <ProfilePicture src={img} />}
      </>
    );
  }
  return (
    <>
      {img && <ProfilePicture src={img} />}
      <Container summarize fill oneline>{name}</Container>
    </>
  );
}
