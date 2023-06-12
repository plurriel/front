import React, { useEffect, useRef, useState } from 'react';
import * as DOMPurify from 'dompurify';
import cuid2 from '@paralleldrive/cuid2';
import { createPortal } from 'react-dom';

import { ClickableContainer, Container, Stack } from '../Layout';
import { Person } from '../PersonCard';
import { ChevronDown } from '../icons/ChevronDown';
import { Reply } from '../icons/Reply';
import { Send } from '../icons/Send';
import { useAppContext } from './AppContext';

import { emailAddrUtils } from '@/lib/utils';

import pageStyles from '@/styles/domain.module.css';
import styles from '@/styles/domain/MailRow.module.css';
import { Back } from '../icons/Back';
import { IconButton } from '../IconButton';
import { Options } from '../icons/Options';
import { Editor, ToolBar } from '../Editor';

export function MailRow({ ...props }) {
  const {
    selectedConvo: [selectedConvo],
    selectedAddress: [selectedAddress],
    addresses: [addresses],
    mails: [, setMails],
    convos: [convos, setConvos],
    currentFirstPane: [, setCurrentFirstPane],
  } = useAppContext();

  const convo = convos[selectedConvo];

  useEffect(() => {
    (async () => {
      if (convo && !convo.mails) {
        const mailsInConvo = await fetch(`/api/convos/${selectedConvo}/mails`)
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

  const address = addresses[selectedAddress[1]];

  return (
    <Stack surface col {...props}>
      <Stack col surface pad="0" br="1em 1em 0.5em 0.5em" gap="0">
        <Stack related uncollapsable pad>
          <IconButton
            onFire={() => {
              setCurrentFirstPane(1);
            }}
            customClasses={[pageStyles.second_pane_back]}
            icon={Back}
          />
          <Container oneline fill>{[JSON.parse(convo.interlocutors), address.name].join(', ')}</Container>
          <IconButton icon={Options} />
        </Stack>
        <Stack pad col>
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

// function ActionRow({ ...props }) {
//   return (
//     <Stack related {...props} uncollapsable>
//       <Container pad>
//         <Forward block />
//       </Container>
//       <Container fill />
//       <Container pad>
//         <Archive block />
//       </Container>
//       <Container pad>
//         <MoveTo block />
//       </Container>
//       <Container pad>
//         <Schedule block />
//       </Container>
//       <Container pad>
//         <MarkUnread block />
//       </Container>
//       <Container pad>
//         <Delete block />
//       </Container>
//       <Container pad>
//         <ReportSpam block />
//       </Container>
//     </Stack>
//   );
// }

function MailContents({ mailId }) {
  const idRef = useRef(cuid2.createId());

  const {
    mails: [mails],
  } = useAppContext();

  const mail = mails[mailId];

  const [frameHeight, setFrameHeight] = useState(100);

  window.addEventListener('message', (event) => {
    if (event.source.parent === window && event.data.type === 'resize' && event.data.id === idRef.current) {
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
            <Person name={JSON.parse(mail.to).map(emailAddrUtils.extractDisplayName)} />
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
const sendHeight=()=>parent.postMessage({type:'resize',value:resizeEl.offsetHeight,id:"${idRef.current}"},"*");
sendHeight()
new ResizeObserver(()=>sendHeight()).observe(resizeEl)
document.querySelectorAll('a').forEach(a=>a.target="_blank");
</script>`}
        sandbox="allow-scripts allow-popups"
        className={styles.message_content}
      />
    </Stack>
  );
}

function ReplyBar({ ...props }) {
  const [replyInputPosition, setReplyInputPosition] = useState(false);
  const replyInput = useRef();

  // const [showReplyBarTools, setShowReplyBarTools] = useState(false);

  useEffect(() => {
    if (replyInput.current) {
      let rect = replyInput.current.getBoundingClientRect();
      setReplyInputPosition([rect.top, rect.left]);

      const obs = new MutationObserver(() => {
        console.log('aaaaa');
        rect = replyInput.current.getBoundingClientRect();
        setReplyInputPosition([rect.top, rect.left]);
      });
      obs.observe(replyInput.current, { attributes: true, childList: true, subtree: true });
    }
  }, [replyInput]);

  // if (showReplyBarTools) requestAnimationFrame(() => replyInput.current?.focus());

  return (
    <Stack related {...props} uncollapsable>
      <Stack surface>
        <Reply block />
        <ChevronDown block />
      </Stack>
      <Stack fill>
        <Editor>
          {
            createPortal(
              (
                <Container
                  surface
                  style={{
                    bottom: `calc(100vh - ${replyInputPosition[0]}px + 0.5em)`,
                    left: replyInputPosition[1],
                    // display: showReplyBarTools ? 'block' : 'none',
                  }}
                  pad="0.5em"
                >
                  <ToolBar />
                </Container>
              ),
              document.getElementById(pageStyles.reply_bar_tools),
            )
          }
          <Container surface pad={0} w>
            <Container
              pad
              customClasses={[styles.replyinput]}
              ref={replyInput}
              contentEditable
              // onFocus={() => setShowReplyBarTools(true)}
              // onBlur={() => setShowReplyBarTools(false)}
            />
          </Container>
        </Editor>
      </Stack>
      <ClickableContainer pad surface>
        <Send />
      </ClickableContainer>
    </Stack>
  );
}
