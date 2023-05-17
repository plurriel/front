import { createPortal } from "react-dom";
import { Stack } from "./Layout";

import styles from "@/styles/Modal.module.css";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { IconButton } from "./IconButton";
import { Close } from "@/components/icons/Close.jsx"

export function Modal({
  children,
  shown,
  ...props
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    return () => setMounted(false)
  }, [])

  return mounted
    ? createPortal(
      (
        <div className={clsx(styles.fullscreen, !shown && styles.hidden)}>
          <Stack col customClasses={[styles.modal]} {...props} >
            {children}
          </Stack>
        </div>
      ),
      document.getElementById("modal_portal"))
    : null
}

export function CloseModal({ ...props }) {
  return (
    <IconButton icon={Close} customClasses={[ styles.close_modal ]} />
  );
}
