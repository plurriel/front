import React, { useState } from 'react';
import TwinBcrypt from 'twin-bcrypt';
import { ClickableContainer, Container, Stack } from '@/components/Layout';
import { TextInput } from '@/components/Input';

import styles from '@/styles/betatest.module.css';

export default function BetaTest() {
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
            onFire={() => {
              TwinBcrypt.hash(password, (hash) => setPasswordHash(hash));
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
