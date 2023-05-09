import { ClickableContainer } from "./Layout";
import styles from '@/styles/IconButton.module.css';

export function IconButton({
  children,
  icon,
  ...props
}) {
  const Icon = icon;
  return (
    <ClickableContainer
      {...props}
      customClasses={[styles.iconbtn]}
    >
      <Icon block />
    </ClickableContainer>
  )
}
