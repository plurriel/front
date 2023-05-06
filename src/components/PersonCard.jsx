import { Container, Stack } from "./Layout.jsx";
import { ProfilePicture } from "./ProfilePicture.jsx";
import styles from '../styles/PersonCard.module.css';

export function Person(props) {
  const {
    name,
    subname,
    img,
    reversed,
    ...rest
  } = props;
  if (reversed) {
    return (
      <>
        <Container summarize fill oneline customClasses={[styles.reversedtext]}>{name}</Container>
        {img && <ProfilePicture src={img} />}
      </>
    )
  } else {
    return (
      <>
        {img && <ProfilePicture src={img} />}
        <Container summarize fill oneline>{name}</Container>
      </>
    )
  }
}
