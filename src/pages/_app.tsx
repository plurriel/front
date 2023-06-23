import React from 'react';

import '@/styles/globals.css';
// eslint-disable-next-line camelcase
import { DM_Sans } from 'next/font/google';
import { AppProps } from 'next/app';

export const DMSans = DM_Sans({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>
        {`
          @font-face {
            font-family: "DM Sans";
            src: local(monospace);
          }
          :root {
            --fam: ${DMSans.style.fontFamily};
          }
          html {
            font-family: ${DMSans.style.fontFamily};
          }
        `}
      </style>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <Component {...pageProps} />
    </>
  );
}
