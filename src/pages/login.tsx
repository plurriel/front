/* eslint-disable react/jsx-no-bind */
import Link from 'next/link';
import React, { useState } from 'react';
import * as ecies from 'ecies-25519';
import { utf8ToArray } from 'enc-utils';
import { GetServerSideProps, NextApiRequest } from 'next';

import { TextInput } from '@/components/Input';
import { ClickableContainer, Container, Stack } from '@/components/Layout';
import { Logo } from '@/components/Logo';
import { ArrowForward } from '@/components/icons/ArrowForward';

import styles from '@/styles/login.module.css';
import { getLogin } from '@/lib/login_not_edge';

function base64ToArrayBuffer(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function next() {
  return window.location.replace(new URLSearchParams(window.location.search).get('then') || '/');
}

export default function Login({ pubkey }: { pubkey: string }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState(null);

  const [disabled, setDisabled] = useState(false);

  async function upload() {
    setErrorMessage(null);
    const publicKey = base64ToArrayBuffer(pubkey);

    const encryptedPassword = await ecies.encrypt(
      utf8ToArray(JSON.stringify({ password, time: Date.now() })),
      publicKey,
    );

    setDisabled(true);

    const login = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password: arrayBufferToBase64(encryptedPassword),
      }),
    });
    if (login.status === 200) return next();
    setDisabled(false);
    return setErrorMessage(await login.text());
  }

  return (
    <Stack center customClasses={[styles.page]}>
      <Stack surface col customClasses={[styles.prompt]}>
        <Stack ai="center">
          <h1>Login to</h1>
          <Logo />
        </Stack>
        <b>Username</b>
        <Container br>
          <TextInput w placeholder="johndoe" onChange={({ target }) => setUsername((target as HTMLInputElement).value.toLowerCase().replace(/[^a-z0-9\-_]/g, ''))} value={username} />
        </Container>
        <b>Password</b>
        <Container br>
          <TextInput w type="password" placeholder="••••••••••" onChange={({ target }) => setPassword((target as HTMLInputElement).value)} value={password} />
        </Container>
        { errorMessage !== '' && <b className={styles.error}>{errorMessage}</b> }
        <Stack col ai="flex-end">
          <ClickableContainer
            surface
            cta
            disabled={!username || !password || disabled}
            onFire={upload}
          >
            <Stack>
              Login
              {' '}
              <ArrowForward />
            </Stack>
          </ClickableContainer>
          <Link href="signup">or sign up instead</Link>
        </Stack>
      </Stack>
    </Stack>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  if (!(await getLogin(req as NextApiRequest) instanceof Error)) {
    return {
      redirect: {
        permanent: false,
        destination: query.then || '/',
      },
      props: {},
    };
  }
  return {
    props: {
      pubkey: process.env.NEXT_PUBLIC_USERS_TO_US_PUBLIC,
    },
  };
};
