import { useAppContext } from "./AppContext";
import { ClickableContainer, Container, Stack } from "../Layout";
import { Edit } from "../icons/Edit";
import { Settings } from "../icons/Settings";

import styles from "../../styles/domain/MailsRow.module.css";
import pageStyles from '@/styles/domain.module.css';
import { Back } from "../icons/Back";
import { IconButton } from "../IconButton";
import { useEffect, useState } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { CloseModal, Modal } from "../Modal";

export function MailsRow({ ...props }) {
  const {
    subdomains: [subdomains],
    addresses: [addresses],
    folders: [folders],
    selectedAddress: [selectedAddress],
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
    <Stack col surface {...props}>
      <Stack center surface>
        {
          currentFirstPane != 0
          && <IconButton
              onFire={() => {
                setCurrentFirstPane(0);
              }}
              customClasses={[pageStyles.hide_three_pane]}
              icon={Back}
            />
        }
        <Stack fill col gap={0}><small>{currentAddress.name}@{currentSubdomain.name}&apos;s</small>{currentFolder.name}</Stack>
        <IconButton icon={Settings} />
      </Stack>
      <Container scroll fill>
        <MailsList />
      </Container>
      <Stack jc="flex-end">
        <Stack surface center w="fit-content" cta>
          <Edit /> Compose
        </Stack>
        <Modal related pad="0">
          <Stack related>
            <Stack surface>
              <small>Subject</small>
            </Stack>
            <Stack surface fill>
              <CloseModal />
            </Stack>
          </Stack>
          <Stack related>
            <Stack surface>
              <small>From</small>
            </Stack>
            <Stack surface fill></Stack>
          </Stack>
          <Stack related>
            <Stack surface>
              <small>To</small>
            </Stack>
            <Stack surface fill></Stack>
          </Stack>
        </Modal>
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
  if (!currentFolder.mails.length) return <Stack col h center><Image width="96" height="144" src="./no_mails.svg" alt="Empty mailbox"/><br/>No E-Mails yet</Stack>

  return (
    <Stack col>
      {
        currentFolder.mails.map((mailMetaId) => <MailPreview
          interlocutor={mails[mailMetaId].interlocutor}
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
  interlocutor,
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

  const [dateSent, setDateSent] = useState(null);
  const [isSameDate, setIsSameDate] = useState(false);
  
  useEffect(() => {
    setDateSent(new Date(sendDate));
    setIsSameDate(new Date().toLocaleDateString() === new Date(sendDate).toLocaleDateString());
  }, [sendDate]);

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
          <Stack fill><small>{interlocutor}</small></Stack>
          <small>{dateSent
          ? new Intl.DateTimeFormat(
              'en-GB',
              dateFormat,
            ).format(dateSent)
          : sendDate}</small>
        </Stack>
        <Container oneline customClasses={[!isSelected && styles.preview_subject]}>{subject}</Container>
      </Stack>
    </ClickableContainer>
  );
}
