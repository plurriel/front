import styles from "../styles/ProfilePicture.module.css";

export function ProfilePicture({ src }) {
  return <img className={styles.pfp} src={src} />
  // return <div><div className={styles.pfp}></div></div>
}
