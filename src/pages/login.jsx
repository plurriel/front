import { TextInput } from "@/components/Input";
import { ClickableContainer, Container, Stack } from "@/components/Layout";
import { Logo } from "@/components/Logo";
import { ArrowForward } from "@/components/icons/ArrowForward";

import styles from "@/styles/login.module.css";
import Link from "next/link";
import { useState } from "react";
import nacl from "tweetnacl";
import * as ecies from "ecies-25519";
console.log(ecies)

import { hexToArray, arrayToHex, utf8ToArray } from 'enc-utils';

function base64ToArrayBuffer(base64) {
  var binaryString = atob(base64);
  var bytes = new Uint8Array(binaryString.length);
  for (var i = 0; i < binaryString.length; i++) {
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

const convertToHexa = (str = '') =>{
  const res = [];
  const { length: len } = str;
  for (let n = 0, l = len; n < l; n ++) {
     const hex = Number(str.charCodeAt(n)).toString(16);
     res.push(hex);
  };
  return res.join('');
}

function next() {
  return location.replace(new URLSearchParams(location.search).get('then') || '/');
}

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState(null);

  async function upload() {
    setErrorMessage(null);
    const publicKey = hexToArray(process.env.NEXT_PUBLIC_USERS_TO_US_PUBLIC);

    const encryptedPassword = await ecies.encrypt(utf8ToArray(JSON.stringify({ password, time: Date.now() })), publicKey);
    console.log(encryptedPassword, publicKey);

    const login = await fetch(`/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username,
        password: arrayToHex(encryptedPassword),
      }),
    });
    if (login.status === 200) return next();
  }

  return (
    <Stack center customClasses={[styles.page]}>
      <Stack surface col customClasses={[styles.prompt]}>
        <Stack ai="center"><h1>Login to</h1><Logo/></Stack>
        <b>Username</b>
        <Container br>
          <TextInput w placeholder="johndoe" onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9\-_]/g, ''))} value={username}></TextInput>
        </Container>
        <b>Password</b>
        <Container br>
          <TextInput w type="password" placeholder="••••••••••" onChange={(e) => setPassword(e.target.value)} value={password}></TextInput>
        </Container>
        <Stack col ai="flex-end">
          <ClickableContainer surface cta disabled={!username || !password} onFire={upload}>
            <Stack>
              Login <ArrowForward />
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
