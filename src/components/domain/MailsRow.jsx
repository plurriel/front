import { useAppContext } from "./AppContext";
import { ClickableContainer, Container, Stack } from "../Layout";
import { Edit } from "../icons/Edit";
import { Settings } from "../icons/Settings";

import styles from "../../styles/domain/MailsRow.module.css";
import { Back } from "../icons/Back";

export function MailsRow({ ...props }) {
  const {
    subdomains: [subdomains],
    addresses: [addresses],
    folders: [folders],
    selectedAddress: [selectedAddress, setSelectedAddress],
    currentFirstPane: [currentFirstPane, setCurrentFirstPane],
  } = useAppContext();

  if (!selectedAddress) {
    return (
      <Stack col surface fill center {...props}>
        <b>No Selected Address</b>
        <p>Please select an address using the leftmost panel</p>
      </Stack>
    );
  }

  const currentSubdomain = subdomains[selectedAddress[0]];
  const currentAddress = addresses[selectedAddress[1]];
  const currentFolder = folders[selectedAddress[2]];

  return (
    <Stack col surface fill {...props}>
      <Stack surface>
        {
          currentFirstPane != 0
          && <ClickableContainer
              onFire={() => {
                setCurrentFirstPane(0);
              }}
            >
              <Back block />
            </ClickableContainer>
        }
        <Stack fill><small>{currentAddress.name}@{currentSubdomain.name}&apos;s</small> {currentFolder.name}</Stack>
        <Settings block />
      </Stack>
      <Container scroll fill>
        <MailsList />
      </Container>
      <Stack surface center w="fit-content" cta>
        <Edit /> Compose
      </Stack>
    </Stack>
  );
}

function MailsList() {
  const {
    folders: [folders],
    mails: [mails],
    selectedAddress: [selectedAddress],
  } = useAppContext();

  const currentFolder = folders[selectedAddress[2]];

  if (!currentFolder.mails) return <Stack col h center>Loading...</Stack>
  if (!currentFolder.mails.length) return <Stack col h center>No E-Mails yet</Stack>

  return (
    <Stack col>
      {
        currentFolder.mails.map((mailMetaId) => <MailPreview
          sender={mails[mailMetaId].sender}
          subject={mails[mailMetaId].subject}
          sendDate={mails[mailMetaId].sendDate}
          mailIdx={mailMetaId}
          key={mailMetaId}
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
    currentFirstPane: [currentFirstPane, setCurrentFirstPane],
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
        setSelectedMail(mailIdx);
        setCurrentFirstPane(2);
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
