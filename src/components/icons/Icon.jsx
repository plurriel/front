import cls from 'clsx';
import styles from "./Icon.module.css";

export function Icon({
  block,
  customClasses,
  size,
  pathdef,
  ...props
}) {
  return (
    <svg
      className={cls([block && styles.block, ...(customClasses || [])])}
      width={size || '1em'}
      height={size || '1em'}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={pathdef}/>
    </svg>
  );
}
