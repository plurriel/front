import React, { useEffect, useState } from 'react';
import { Convo, Folder, Mail } from '@prisma/client';
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
    subdomains: [subdomains],
    folders: [folders],
    selectedFolder: [selectedFolder, setSelectedFolder],
    viewedAddress: [, setViewedAddress],
    currentFirstPane: [, setCurrentFirstPane],
    selectedMail: [selectedMail, setSelectedMail],
    composing: [composing, setComposing],
  } = useAppContext();

  // useEffect(() => {
  //   if (composing) setSelectedMail(null);
  // }, [composing, setSelectedMail]);
  useEffect(() => {
    if (selectedMail) setComposing(false);
  }, [selectedMail, setComposing]);

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
      <Stack center surface br="0 0 0.5em 0.5em" margin="-1em -1em 0 -1em">
        <IconButton
          onFire={() => {
            setCurrentFirstPane((currentFirstPane) => {
              if (currentFirstPane === 2) {
                setSelectedMail(null);
                setComposing(false);
                window.history.pushState(
                  {},
                  '',
                  `/${currentAddress.name}/${getFolderName(folders[selectedFolder[2]])}`,
                );
                return 1;
              }
              setViewedAddress(selectedFolder.slice(0, 2) as [string, string]);
              setSelectedFolder(null);
              window.history.pushState(
                {},
                '',
                `/${subdomains[currentAddress.subdomainId].name}/`,
              );
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
          onFire={async () => {
            setCurrentFirstPane(2);
            setComposing(true);
            setSelectedMail(null);
          }}
          highlight={Boolean(composing && !selectedMail)}
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
    mails: [mails, setMails],
    selectedFolder: [selectedFolder],
  } = useAppContext();

  if (!selectedFolder) throw new Error();

  const currentFolder = folders[selectedFolder[2]];

  const [_, setHadConvos] = useState(new Set<string>());

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      if (!('mails' in currentFolder)) {
        const mailsInFolder: Mail[] = await fetch(`/api/folders/${currentFolder.id}/mails`, {
          signal: controller.signal,
        })
          .then((res) => res.json());
        if (!mailsInFolder) throw new Error('Access is missing');
        setMails((mails_) => {
          const newMails = { ...mails_ };
          setFolders((folders_) => {
            const newFolders = { ...folders_ };
            (newFolders[selectedFolder[2]] as StoredAs<Folder, 'mails', true>)
              .mails = mailsInFolder.map((mail: Mail) => {
                newMails[mail.id] = mail;
                return mail.id;
              });
            return newFolders;
          });
          return newMails;
        });
      }
    })();
  }, [currentFolder, setMails, setFolders, selectedFolder]);

  if (!('mails' in currentFolder) || !currentFolder.mails) return <Stack col h center>Loading...</Stack>;
  if (!currentFolder.mails.length) {
    return (
      <Stack col h center>
        <Image width="96" height="144" src="/no_mails.svg" alt="Empty address" />
        <br />
        No E-Mails yet
      </Stack>
    );
  }

  const latest: Record<string, string> = {};
  currentFolder.mails.forEach((mailId) => {
    const mail = mails[mailId];
    if (!mail) return;
    if (!latest[mail.convoId]) latest[mail.convoId] = mailId;
    else if (new Date(mails[latest[mail.convoId]].at).getTime() < new Date(mail.at).getTime()) latest[mail.convoId] = mailId;
  });

  return (
    <Stack col>
      {
        currentFolder.mails.map((mailId) => mails[mailId]
          && latest[mails[mailId].convoId] === mailId
          && (
            <ConvoPreview
              interlocutors={mails[mailId].type === 'Inbound' ? [mails[mailId].from] : mails[mailId].to}
              subject={mails[mailId].subject}
              sendDate={mails[mailId].at}
              mailId={mailId}
              key={mailId}
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
  mailId,
  ...props
}: {
  interlocutors: string[],
  subject: string | null,
  sendDate: Date,
  mailId: string,
}) {
  const {
    selectedMail: [selectedMail, setSelectedMail],
    selectedFolder: [selectedFolder],
    addresses: [addresses],
    folders: [folders],
    currentFirstPane: [, setCurrentFirstPane],
  } = useAppContext();

  if (!selectedFolder) throw new Error();

  const isSelected = selectedMail === mailId;

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
        setSelectedMail(mailId);
        window.history.pushState(
          {},
          '',
          `/${addresses[selectedFolder[1]].name}/${getFolderName(folders[selectedFolder[2]])}/${mailId}`,
        );
        setCurrentFirstPane(2);
      }}
      // gap="0"
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
