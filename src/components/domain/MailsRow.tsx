import React, { useEffect, useState } from 'react';
import { Convo, Folder } from '@prisma/client';
import Image from 'next/image';
import pageStyles from '@/styles/domain.module.css';
import { emailAddrUtils, getFolderName } from '@/lib/utils';

import { StoredAs, useAppContext } from './AppContext';
import { ClickableContainer, Container, Stack } from '../Layout';
import { Edit } from '../icons/Edit';
import { Settings } from '../icons/Settings';

import styles from '../../styles/domain/MailsRow.module.css';
import { Back } from '../icons/Back';
import { IconButton } from '../IconButton';

export function MailsRow({ ...props }) {
  const {
    addresses: [addresses],
    folders: [folders],
    selectedFolder: [selectedFolder, setSelectedFolder],
    viewedAddress: [, setViewedAddress],
    currentFirstPane: [, setCurrentFirstPane],
    selectedConvo: [, setSelectedConvo],
    composing: [composing, setComposing],
  } = useAppContext();

  if (!selectedFolder) {
    return (
      <Stack col surface center {...props}>
        <b>No Selected Address</b>
        <p>Please select an address using the leftmost panel</p>
      </Stack>
    );
  }

  const currentAddress = addresses[selectedFolder[1]];
  const currentFolder = folders[selectedFolder[2]];

  return (
    <Stack col surface {...props}>
      <Stack center surface>
        <IconButton
          onFire={() => {
            setCurrentFirstPane((currentFirstPane) => {
              if (currentFirstPane === 2) {
                setSelectedConvo(null);
                setComposing(false);
                return 1;
              }
              setViewedAddress(selectedFolder.slice(0, 2) as [string, string]);
              setSelectedFolder(null);
              return 0;
            });
          }}
          customClasses={[pageStyles.second_pane_back]}
          icon={Back}
        />
        <Stack flexGrow col gap="0" customClasses={[styles.folder_name]}>
          <small>{currentAddress.name}</small>
          {getFolderName(currentFolder)}
        </Stack>
        <ClickableContainer
          customClasses={['skip_to']}
          tabIndex={0}
          onFire={() => (document.querySelector('#composebtn') as HTMLDivElement).focus()}
        >
          <small>Skip to compose</small>
        </ClickableContainer>
        <IconButton icon={Settings} />
      </Stack>
      <Container scroll flexGrow>
        <MailsList />
      </Container>
      <Stack jc="flex-end">
        <ClickableContainer
          surface
          center
          w="fit-content"
          cta
          onFire={() => {
            setComposing(true);
            setCurrentFirstPane(2);
          }}
          highlight={composing}
          id="composebtn"
        >
          <Edit />
          Compose
        </ClickableContainer>
      </Stack>
    </Stack>
  );
}

function MailsList() {
  const {
    folders: [folders, setFolders],
    convos: [convos, setConvos],
    selectedFolder: [selectedFolder],
  } = useAppContext();

  if (!selectedFolder) throw new Error();

  const currentFolder = folders[selectedFolder[2]];

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      if (!('convos' in currentFolder)) {
        const convosInFolder = await fetch(`/api/folders/${currentFolder.id}/convos`, { signal: controller.signal })
          .then((res) => res.json());
        if (!convosInFolder) throw new Error('Access is missing');
        setConvos((convos_) => {
          const newConvos = { ...convos_ };
          setFolders((folders_) => {
            const newFolders = { ...folders_ };
            (newFolders[selectedFolder[2]] as StoredAs<Folder, 'convos', true>).convos = convosInFolder.map((convo: Convo) => {
              newConvos[convo.id] = convo;
              return convo.id;
            });
            return newFolders;
          });
          return newConvos;
        });
      }
    })();
  }, [currentFolder, setConvos, setFolders, selectedFolder]);

  if (!('convos' in currentFolder)) return <Stack col h center>Loading...</Stack>;
  if (!currentFolder.convos.length) {
    return (
      <Stack col h center>
        <Image width="96" height="144" src="/no_mails.svg" alt="Empty address" />
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
          interlocutors={convos[convoId].interlocutors}
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
}: {
  interlocutors: string[],
  subject: string | null,
  sendDate: Date,
  mailIdx: string,
}) {
  const {
    selectedConvo: [selectedConvo, setSelectedConvo],
    selectedFolder: [selectedFolder],
    addresses: [addresses],
    folders: [folders],
    currentFirstPane: [, setCurrentFirstPane],
  } = useAppContext();

  if (!selectedFolder) throw new Error();

  const isSelected = selectedConvo === mailIdx;

  const [dateSent, setDateSent] = useState<null | Date>(null);
  const [isSameDate, setIsSameDate] = useState(false);

  useEffect(() => {
    setDateSent(new Date(sendDate));
    setIsSameDate(new Date().toLocaleDateString() === new Date(sendDate).toLocaleDateString());
  }, [sendDate]);

  const dateFormat: Intl.DateTimeFormatOptions = {
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
        window.history.pushState({}, '', `/${addresses[selectedFolder[1]].name}/${getFolderName(folders[selectedFolder[2]])}/${mailIdx}`);
        setCurrentFirstPane(2);
      }}
      gap="0"
      {...props}
    >
      <Stack center>
        <Stack flexGrow>
          <small>
            <Container oneline summarize>
              {[...interlocutors, addresses[selectedFolder[1]].name].map(emailAddrUtils.extractDisplayName).join(', ')}
            </Container>
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
        oneline={!isSelected}
        customClasses={[!isSelected && styles.preview_subject, !subject && styles.subjectless]}
      >
        {subject || '<No Subject>'}
      </Container>
    </ClickableContainer>
  );
}
