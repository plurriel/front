import React, { useState } from 'react';
import * as ecies from 'ecies-25519';
import { utf8ToArray } from 'enc-utils';
import { ClickableContainer, Container, Stack } from '@/components/Layout';
import { TextInput } from '@/components/Input';

import styles from '@/styles/betatest.module.css';

function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export default function BetaTest({ pubkey }) {
  const [password, setPassword] = useState('');
  const [passwordHash, setPasswordHash] = useState(false);

  return (
    <Stack center customClasses={[styles.page]}>
      <Stack surface col customClasses={[styles.prompt]}>
        <span>Password</span>
        <Container br>
          <TextInput
            minwidth={8}
            maxwidth={24}
            w
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
          />
        </Container>
        <small>
          (We trust that you, as a beta-tester, have a sufficiently strong password,
          also I am too lazy to implement password requirements right now)
        </small>
        <Stack jc="flex-end">
          <ClickableContainer
            cta
            surface
            onFire={async () => {
              const publicKey = base64ToArrayBuffer(pubkey);

              const encryptedPassword = await ecies.encrypt(
                utf8ToArray(JSON.stringify({ password, time: Date.now() })),
                publicKey,
              );

              const passwordHashRes = await fetch('/api/betatest/hash', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  password: btoa(String.fromCharCode(...encryptedPassword)),
                }),
              }).then((res) => res.json());

              setPasswordHash(passwordHashRes.hash);
            }}
          >
            Generate hash
          </ClickableContainer>
        </Stack>
        {
          passwordHash
          && (
            <>
              <b>This is your password hash. Do not communicate it to anyone except immjs.</b>
              <code className={styles.hash}>{passwordHash}</code>
            </>
          )
        }
      </Stack>
    </Stack>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      pubkey: process.env.NEXT_PUBLIC_USERS_TO_US_PUBLIC,
    },
  };
}
