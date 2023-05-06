import { useAppContext } from "@/pages/[domain]";
import { ClickableContainer, Container, Stack } from "../Layout";
import { Edit } from "../icons/Edit";
import { Settings } from "../icons/Settings";

import styles from "../../styles/domain/MailsRow.module.css";

export function MailsRow({ ...props }) {
  const {
    subdomains: [subdomains],
    selectedAddress: [selectedAddress],
  } = useAppContext();

  const currentSubdomain = subdomains[selectedAddress[0]];
  const currentAddress = currentSubdomain.addresses[selectedAddress[1]];
  const currentFolder = currentAddress.folders[selectedAddress[2]];

  return (
    <Stack col surface fill {...props}>
      <Stack surface> 
        <Stack fill><small>{currentAddress.name}@{currentSubdomain.name}</small> {currentFolder.name}</Stack>
        <Settings />
      </Stack>
      <Container scroll fill>
        <MailsList />
      </Container>
      <Stack surface center w="fit-content" br="1em">
        <Edit /> Compose E-Mail
      </Stack>
    </Stack>
  );
}

function MailsList() {
  const {
    subdomains: [subdomains],
    selectedAddress: [selectedAddress],
  } = useAppContext();

  const currentSubdomain = subdomains[selectedAddress[0]];
  const currentAddress = currentSubdomain.addresses[selectedAddress[1]];
  const currentFolder = currentAddress.folders[selectedAddress[2]];

  if (!currentFolder.mailsMeta) return <Stack col h center>Loading...</Stack>
  if (!currentFolder.mailsMeta.length) return <Stack col h center>No E-Mails yet</Stack>

  return (
    <Stack col>
      {
        currentFolder.mailsMeta.map((mailMeta, mailIdx) => <MailPreview
          sender={mailMeta.sender}
          subject={mailMeta.subject}
          sendDate={mailMeta.sendDate}
          mailIdx={mailIdx}
          key={mailIdx}
        />)
      }
    </Stack>
  );
}

function MailPreview({
  sender,
  subject,
  sendDate,
  mailIdx,
  ...props
}) {
  const {
    selectedMail: [selectedMail, setSelectedMail],
  } = useAppContext();
  const isSelected = selectedMail === mailIdx;
  

  const dateSent = new Date(sendDate);
  const isSameDate = new Date().toLocaleDateString() === dateSent.toLocaleDateString();

  let dateFormat = {
    timeStyle: 'short',
  };
  if (!isSameDate) dateFormat.dateStyle = 'short';

  return (
    <ClickableContainer
      col
      onFire={() => {
        setSelectedMail(mailIdx)
      }}
    >
      <Stack col surface highlight={isSelected} gap="0" {...props}>
        <Stack center>
          <Stack fill><small>{sender}</small></Stack>
          <small>{new Intl.DateTimeFormat(
            'en-GB',
            dateFormat,
          ).format(dateSent)}</small>
        </Stack>
        <Container oneline customClasses={[!isSelected && styles.preview_subject]}>{subject}</Container>
      </Stack>
    </ClickableContainer>
  );
}
