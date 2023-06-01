import React from 'react';
import {
  Html,
  Head,
  Main,
  NextScript,
} from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main className="next_main" />
        <div id="modal_portal" />
        <NextScript />
      </body>
    </Html>
  );
}
