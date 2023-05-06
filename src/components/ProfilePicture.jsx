import styles from "../styles/ProfilePicture.module.css";

export function ProfilePicture(props) {
  return <img className={styles.pfp} src={props.src} />
  // return <div><div className={styles.pfp}></div></div>
}
