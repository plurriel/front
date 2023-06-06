import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAppContext } from './AppContext';
import { ClickableContainer, Container, Stack } from '../Layout';
import { Edit } from '../icons/Edit';
import { Settings } from '../icons/Settings';

import styles from '../../styles/domain/MailsRow.module.css';
import pageStyles from '@/styles/domain.module.css';
import { Back } from '../icons/Back';
import { IconButton } from '../IconButton';
import { emailAddrUtils } from '@/lib/utils';

export function MailsRow({ ...props }) {
  const {
    addresses: [addresses],
    folders: [folders],
    selectedAddress: [selectedAddress],
    currentFirstPane: [, setCurrentFirstPane],
  } = useAppContext();

  if (!selectedAddress) {
    return (
      <Stack col surface center {...props}>
        <b>No Selected Address</b>
        <p>Please select an address using the leftmost panel</p>
      </Stack>
    );
  }

  const currentAddress = addresses[selectedAddress[1]];
  const currentFolder = folders[selectedAddress[2]];

  return (
    <Stack col surface {...props}>
      <Stack center surface>
        <IconButton
          onFire={() => {
            setCurrentFirstPane(0);
          }}
          customClasses={[pageStyles.second_pane_back]}
          icon={Back}
        />
        <Stack fill col gap={0}>
          <small>
            {currentAddress.name}
            &apos;s
          </small>
          {currentFolder.type !== 'Other' ? currentFolder.type : currentFolder.name}
        </Stack>
        <IconButton icon={Settings} />
      </Stack>
      <Container scroll fill>
        <MailsList />
      </Container>
      <Stack jc="flex-end">
        <Stack surface center w="fit-content" cta>
          <Edit />
          {' '}
          Compose
        </Stack>
      </Stack>
    </Stack>
  );
}

function MailsList() {
  const {
    folders: [folders, setFolders],
    convos: [convos, setConvos],
    selectedAddress: [selectedAddress],
  } = useAppContext();

  const currentFolder = folders[selectedAddress[2]];

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      if (!currentFolder.convos) {
        const convosInFolder = await fetch(`/api/folders/${currentFolder.id}/convos`, { signal: controller.signal })
          .then((res) => res.json());
        setConvos((convos_) => {
          const newConvos = { ...convos_ };
          setFolders((folders_) => {
            const newFolders = { ...folders_ };
            newFolders[selectedAddress[2]].convos = convosInFolder.map((convo) => {
              newConvos[convo.id] = convo;
              return convo.id;
            });
            return newFolders;
          });
          return newConvos;
        });
      }
    })();
  }, [currentFolder, setConvos, setFolders, selectedAddress]);

  if (!currentFolder.convos) return <Stack col h center>Loading...</Stack>;
  if (!currentFolder.convos.length) {
    return (
      <Stack col h center>
        <Image width="96" height="144" src="./no_mails.svg" alt="Empty address" />
        <br />
        No E-Mails yet
      </Stack>
    );
  }

  return (
    <Stack col>
      {
        currentFolder.convos.map((convoId) => convos[convoId] && (
        <ConvoPreview
          interlocutors={JSON.parse(convos[convoId].interlocutors)}
          subject={convos[convoId].subject}
          sendDate={convos[convoId].latest}
          mailIdx={convoId}
          key={convoId}
        />
        ))
      }
    </Stack>
  );
}

function ConvoPreview({
  interlocutors,
  subject,
  sendDate,
  mailIdx,
  ...props
}) {
  const {
    selectedConvo: [selectedConvo, setSelectedConvo],
    currentFirstPane: [, setCurrentFirstPane],
  } = useAppContext();
  const isSelected = selectedConvo === mailIdx;

  const [dateSent, setDateSent] = useState(null);
  const [isSameDate, setIsSameDate] = useState(false);

  useEffect(() => {
    setDateSent(new Date(sendDate));
    setIsSameDate(new Date().toLocaleDateString() === new Date(sendDate).toLocaleDateString());
  }, [sendDate]);

  const dateFormat = {
    timeStyle: 'short',
  };
  if (!isSameDate) dateFormat.dateStyle = 'short';

  return (
    <ClickableContainer
      col
      surface
      highlight={isSelected}
      onFire={() => {
        setSelectedConvo(mailIdx);
        setCurrentFirstPane(2);
      }}
      gap="0"
      {...props}
    >
      <Stack center>
        <Stack fill>
          <small>
            {interlocutors.map(emailAddrUtils.extractDisplayName).join(', ')}
          </small>

        </Stack>
        <small>
          {dateSent
            ? new Intl.DateTimeFormat(
              'en-GB',
              dateFormat,
            ).format(dateSent)
            : ''}

        </small>
      </Stack>
      <Container
        oneline
        customClasses={[!isSelected && styles.preview_subject]}
      >
        {subject}
      </Container>
    </ClickableContainer>
  );
}
