/* eslint-disable react/jsx-no-bind */
import Link from 'next/link';
import React, { useState } from 'react';
import * as ecies from 'ecies-25519';
import { utf8ToArray } from 'enc-utils';
import { TextInput } from '@/components/Input';
import { ClickableContainer, Container, Stack } from '@/components/Layout';
import { Logo } from '@/components/Logo';
import { ArrowForward } from '@/components/icons/ArrowForward';

import styles from '@/styles/login.module.css';

function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
// function str2ab(str) {
//   var buf = new ArrayBuffer(str.length);
//   var bufView = new Uint8Array(buf);
//   for (var i=0, strLen=str.length; i<strLen; i++) {
//     bufView[i] = str.charCodeAt(i);
//   }
//   return bufView;
// }

// const convertToHexa = (str = '') => {
//   const res = [];
//   const { length: len } = str;
//   for (let n = 0, l = len; n < l; n++) {
//     const hex = Number(str.charCodeAt(n)).toString(16);
//     res.push(hex);
//   }
//   return res.join('');
// };

function next() {
  return window.location.replace(new URLSearchParams(window.location.search).get('then') || '/');
}

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState(null);

  async function upload() {
    setErrorMessage(null);
    const publicKey = base64ToArrayBuffer(process.env.NEXT_PUBLIC_USERS_TO_US_PUBLIC);

    const encryptedPassword = await ecies.encrypt(
      utf8ToArray(JSON.stringify({ password, time: Date.now() })),
      publicKey,
    );

    const login = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password: btoa(String.fromCharCode(...encryptedPassword)),
      }),
    });
    if (login.status === 200) return next();
    return setErrorMessage(await login.text());
  }

  return (
    <Stack center customClasses={[styles.page]}>
      <Stack surface col customClasses={[styles.prompt]}>
        <Stack ai="center">
          <h1>Login to</h1>
          <Logo />
        </Stack>
        { errorMessage !== '' && <b>{errorMessage}</b> }
        <b>Username</b>
        <Container br>
          <TextInput w placeholder="johndoe" onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9\-_]/g, ''))} value={username} />
        </Container>
        <b>Password</b>
        <Container br>
          <TextInput w type="password" placeholder="••••••••••" onChange={(e) => setPassword(e.target.value)} value={password} />
        </Container>
        <Stack col ai="flex-end">
          <ClickableContainer surface cta disabled={!username || !password} onFire={upload}>
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

// export async function getServerSideProps({ req, res }) {
//   if (!(await getLogin(req, res))) return {
//     red
//   }
// }
