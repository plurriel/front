import React from 'react';
import {
  Html,
  Head,
  Main,
  NextScript,
} from 'next/document';
import { ContextMenuContextProvider, ContextMenuRoot } from '@/components/ContextMenu';

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <div id="modal_portal" />
        <ContextMenuRoot />
        <NextScript />
      </body>
    </Html>
  );
}
