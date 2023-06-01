import { createPortal } from 'react-dom';
import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Stack } from './Layout';

import styles from '@/styles/Modal.module.css';
import { IconButton } from './IconButton';
import { Close } from '@/components/icons/Close.jsx';

export function Modal({
  children,
  shown,
  setShown,
  hideClose,
  ...props
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    return () => setMounted(false);
  }, []);

  return mounted
    ? createPortal(
      (
        <div className={clsx(styles.fullscreen, !shown && styles.hidden)}>
          <Stack col customClasses={[styles.modal]} {...props}>
            {children}
            {!hideClose && <CloseModal toggleState={() => setShown((shown_) => !shown_)} />}
          </Stack>
        </div>
      ),
      document.getElementById('modal_portal'),
    )
    : null;
}

export function CloseModal({ customClasses, ...props }) {
  return (
    <IconButton
      icon={Close}
      customClasses={[styles.close_modal, ...(customClasses || [])]}
      {...props}
    />
  );
}
