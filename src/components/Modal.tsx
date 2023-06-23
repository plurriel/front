import { createPortal } from 'react-dom';
import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import styles from '@/styles/Modal.module.css';
import { Close } from '@/components/icons/Close';

import { Stack, StackOptions } from './Layout';
import { IconButton, IconButtonProps } from './IconButton';

interface Props {
  shown?: boolean;
  setShown?: React.Dispatch<React.SetStateAction<boolean>>;
  hideClose?: boolean;
}

export function Modal({
  children,
  shown,
  setShown,
  hideClose,
  ...props
}: StackOptions & Props) {
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

export function CloseModal({ customClasses, ...props }: IconButtonProps) {
  return (
    <IconButton
      icon={Close}
      customClasses={[styles.close_modal, ...(customClasses || [])]}
      {...props}
    />
  );
}
