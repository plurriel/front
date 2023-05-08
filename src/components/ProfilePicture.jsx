import Image from "next/image";
import styles from "../styles/ProfilePicture.module.css";

export function ProfilePicture({ src }) {
  return <Image className={styles.pfp} src={src} alt="" width="64" height="64" />
  // return <div><div className={styles.pfp}></div></div>
}
