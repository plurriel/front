import cls from 'clsx';
import styles from "./Icon.module.css";

export function Icon(props) {
  return (
    <svg
      className={cls([props.block && styles.block, ...(props.customClasses || [])])}
      width={props.size || '1em'}
      height={props.size || '1em'}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={props.pathdef}/>
    </svg>
  );
}
