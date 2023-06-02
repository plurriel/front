import React, { useEffect, useState } from 'react';
import * as DOMPurify from 'dompurify';
import { Container, Stack } from '../Layout';
import { Person } from '../PersonCard';
import { Archive } from '../icons/Archive';
import { ChevronDown } from '../icons/ChevronDown';
import { Delete } from '../icons/Delete';
import { Forward } from '../icons/Forward';
import { MarkUnread } from '../icons/MarkUnread';
import { MoveTo } from '../icons/MoveTo';
import { Reply } from '../icons/Reply';
import { ReportSpam } from '../icons/ReportSpam';
import { Schedule } from '../icons/Schedule';
import { Send } from '../icons/Send';
import { useAppContext } from './AppContext';

import { emailAddrUtils } from '@/lib/utils';

import styles from '@/styles/domain/MailRow.module.css';

export function MailRow({ ...props }) {
  const {
    selectedConvo: [selectedConvo],
    mails: [, setMails],
    convos: [convos, setConvos],
  } = useAppContext();

  const convo = convos[selectedConvo];

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      if (convo && !convo.mails) {
        const mailsInConvo = await fetch(`/api/convos/${selectedConvo}/mails`, { signal: controller.signal })
          .then((res) => res.json());
        setMails((mails) => {
          const newMails = { ...mails };
          setConvos((convos_) => {
            const newConvos = { ...convos_ };
            newConvos[selectedConvo].mails = mailsInConvo
              .map((mail) => {
                newMails[mail.id] = mail;
                return mail.id;
              });
            return newConvos;
          });
          return newMails;
        });
      }
    })();
  }, [convo, setConvos, setMails, selectedConvo]);

  if (!convo) {
    return (
      <Stack surface center {...props}>
        No selected mail
      </Stack>
    );
  }

  return (
    <Stack surface col {...props}>
      <Stack col surface pad="0" br="1em 1em 0.5em 0.5em">
        <ActionRow />
        <Stack pad>
          <Container fill>
            <b>{convo.subject}</b>
          </Container>
        </Stack>
      </Stack>
      {
          convo.mails
            ? (
              <Container scroll fill>
                <Stack col gap>
                  {
                  convo.mails.map((mailId) => <MailContents mailId={mailId} key={mailId} />)
                }
                </Stack>
              </Container>
            )
            : <Stack fill center><b>Loading...</b></Stack>
        }
      <ReplyBar br="0.5em 0.5em 1em 1em" />
    </Stack>
  );
}

function ActionRow({ ...props }) {
  return (
    <Stack related {...props} uncollapsable>
      <Container pad>
        <Forward block />
      </Container>
      <Container fill />
      <Container pad>
        <Archive block />
      </Container>
      <Container pad>
        <MoveTo block />
      </Container>
      <Container pad>
        <Schedule block />
      </Container>
      <Container pad>
        <MarkUnread block />
      </Container>
      <Container pad>
        <Delete block />
      </Container>
      <Container pad>
        <ReportSpam block />
      </Container>
    </Stack>
  );
}

function MailContents({ mailId }) {
  const {
    mails: [mails],
  } = useAppContext();

  const mail = mails[mailId];

  const [frameHeight, setFrameHeight] = useState(100);

  window.addEventListener('message', (event) => {
    if (event.source.parent === window && event.data.type === 'resize') {
      setFrameHeight(event.data.value);
    }
  });

  const [dateSent, setDateSent] = useState(null);
  const [isSameDate, setIsSameDate] = useState(false);

  useEffect(() => {
    setDateSent(new Date(mail.at));
    setIsSameDate(new Date().toLocaleDateString() === new Date(mail.at).toLocaleDateString());
  }, [mail.at]);

  const dateFormat = {
    timeStyle: 'short',
  };
  if (!isSameDate) dateFormat.dateStyle = 'short';

  return (
    <Stack related col br="0.5em">
      <Stack col pad="0" surface>
        <Stack uncollapsable>
          <Stack pad w="256px">
            <small>From:</small>
            <Person name={emailAddrUtils.extractDisplayName(mail.from)} />
          </Stack>
          <Stack pad w="256px">
            <small>At:</small>
            <Container summarize oneline>
              {
                dateSent
                  ? new Intl.DateTimeFormat(
                    'en-GB',
                    dateFormat,
                  ).format(dateSent)
                  : ''
              }
            </Container>
          </Stack>
          <Stack pad w="256px">
            <small>To:</small>
            <Person name={mail.to.map(emailAddrUtils.extractDisplayName)} />
          </Stack>
          <Container fill />
          <Container pad>
            <ChevronDown block />
          </Container>
        </Stack>
      </Stack>
      <iframe
        style={{ height: frameHeight }}
        title={mail.subject}
        srcDoc={`<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
<body>${DOMPurify.sanitize(mail.html)}</body>
<style>body{background-color:white;font-family:'DM Sans',sans-serif;padding:1em;margin:0;overflow-y:hidden;}</style>
<script>
const resizeEl=document.querySelector('body')
const sendHeight=()=>parent.postMessage({type:'resize',value:resizeEl.offsetHeight,a:console.log('HEY!!!')},"*");
sendHeight()
new ResizeObserver(()=>sendHeight()).observe(resizeEl)
</script>`}
        sandbox="allow-scripts"
        className={styles.message_content}
      />
    </Stack>
  );
}

function ReplyBar({ ...props }) {
  return (
    <Stack related {...props} uncollapsable>
      <Stack surface>
        <Reply block />
        <ChevronDown block />
      </Stack>
      <Container surface fill>Reply...</Container>
      <Container surface>
        <Send block />
      </Container>
    </Stack>
  );
}
