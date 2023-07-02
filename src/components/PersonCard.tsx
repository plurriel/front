import React from 'react';
import { Container } from './Layout';
import { ProfilePicture } from './ProfilePicture';
import styles from '../styles/PersonCard.module.css';

interface Props {
  name: string;
  img?: string;
  brand?: boolean;
  reversed?: boolean;
  subtext?: string;
}

export function Person({
  name,
  img,
  reversed,
  subtext,
  brand,
}: Props) {
  if (reversed) {
    return (
      <>
        <Container
          summarize
          oneline
          customClasses={[styles.reversedtext]}
        >
          {name}
        </Container>
        {img && <ProfilePicture src={img} brand={brand} />}
      </>
    );
  }
  return (
    <>
      {img && <ProfilePicture src={img} brand={brand} />}
      <Container summarize oneline>
        {name}
        {subtext && (
          <small>{subtext}</small>
        )}
      </Container>
    </>
  );
}
