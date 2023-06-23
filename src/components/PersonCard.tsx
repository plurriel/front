import React from 'react';
import { Container } from './Layout';
import { ProfilePicture } from './ProfilePicture';
import styles from '../styles/PersonCard.module.css';

interface Props {
  name: string;
  img?: string;
  reversed?: boolean;
}

export function Person({
  name,
  img,
  reversed,
}: Props) {
  if (reversed) {
    return (
      <>
        <Container
          summarize
          flexGrow
          oneline
          customClasses={[styles.reversedtext]}
        >
          {name}
        </Container>
        {img && <ProfilePicture src={img} />}
      </>
    );
  }
  return (
    <>
      {img && <ProfilePicture src={img} />}
      <Container summarize flexGrow oneline>{name}</Container>
    </>
  );
}
