import { ClickableContainer } from "./Layout";
import styles from '@/styles/IconButton.module.css';

export function IconButton({
  children,
  icon,
  customClasses,
  ...props
}) {
  const Icon = icon;
  return (
    <ClickableContainer
      {...props}
      customClasses={[styles.iconbtn, customClasses]}
    >
      <Icon block />
    </ClickableContainer>
  )
}
