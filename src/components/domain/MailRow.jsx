import React, { useEffect, useRef, useState } from 'react';
import { sanitize } from 'isomorphic-dompurify';

import { ClickableContainer, Container, Stack } from '../Layout';
import { Person } from '../PersonCard';
import { ChevronDown } from '../icons/ChevronDown';
import { Reply } from '../icons/Reply';
import { useAppContext } from './AppContext';

import { emailAddrUtils } from '@/lib/utils';

import pageStyles from '@/styles/domain.module.css';
import styles from '@/styles/domain/MailRow.module.css';
import { Back } from '../icons/Back';
import { IconButton } from '../IconButton';
import { Options } from '../icons/Options';
import { Send } from '../icons/Send';

import editorStyles from '../content_style';

export function MailRow({ ...props }) {
  const {
    selectedConvo: [selectedConvo],
    selectedAddress: [selectedAddress],
    addresses: [addresses],
    mails: [, setMails],
    convos: [convos, setConvos],
    currentFirstPane: [, setCurrentFirstPane],
    subdomains: [subdomains],
    composing: [composing],
    BundledEditor,
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

  // const editorRef = useRef(null);

  if (composing) {
    return BundledEditor && (
      <Stack surface {...props}>
        <BundledEditor
          // onInit={(evt, editor) => { editorRef.current = editor; }}
          initialValue={`<p></p><p>Sent from <a href="https://plurriel.email">Plurriel</a> over <a href="${subdomains[selectedAddress[0]].name}">${subdomains[selectedAddress[0]].name}</a></p>`}
          init={{
            height: 500,
            menubar: false,
            plugins: [
              'advlist', 'anchor', 'autolink', 'image', 'link', 'lists',
              'searchreplace', 'table', 'wordcount', 'autoresize',
            ],
            // eslint-disable-next-line quotes
            toolbar: `undo redo | blocks | \
bold italic forecolor | alignleft aligncenter \
alignright alignjustify | bullist numlist outdent indent | \
removeformat`,
            statusbar: false,
            setup: (editor) => {
              editor.ui.registry.addButton('myCustomToolbarButton', {
                text: 'My Custom Button',
                onAction: () => alert('Button clicked!'),
              });
            },
            content_style: editorStyles,
            autoresize_bottom_margin: 0,
          }}
        />
      </Stack>
    );
  }

  if (!convo) {
    return (
      <Stack surface col center {...props}>
        <b>No selected mails</b>
        <span>Please select a pane using the pane on the left</span>
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
  const {
    mails: [mails],
    requestedMail: [requestedMail],
  } = useAppContext();

  const mail = mails[mailId];

  const [frameHeight, setFrameHeight] = useState(100);
  const iframeEl = useRef();

  useEffect(() => {
    const listener = (event) => {
      if (event.source.parent === window && event.data.id === mailId) {
        switch (event.data.type) {
          case 'resize':
            setFrameHeight(event.data.value);
            break;
          case 'loaded':
            // if (requestedMail === mailId) {
            //   console.log(mailId, requestedMail);
            //   iframeEl.current?.scrollIntoView({ behavior: 'smooth' });
            //   setRequestedMail(null);
            // }
            break;
          default:
            console.error(`Unrecognised event type "${event.data.type}"`, event);
        }
      }
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [setFrameHeight]);

  const mailEl = useRef();

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
    <div ref={mailEl}>
      <Stack
        related
        col
        br="0.5em"
        onLoad={(event) => {
          if (requestedMail === mailId) event.target.scrollIntoView({ behavior: 'smooth' });
        }}
      >
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
          srcDoc={`<script>
// window.addEventListener('load', ()=>parent.postMessage({type:'loaded',id:"${mailId}"},"*"));
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
<body>${sanitize(mail.html)}</body>
<style>body{background-color:white;font-family:'DM Sans',sans-serif;padding:1em;margin:0;overflow-y:hidden;}</style>
<script>
const resizeEl=document.querySelector('body')
const sendHeight=()=>parent.postMessage({type:'resize',value:resizeEl.offsetHeight,id:"${mailId}"},"*");
sendHeight();
new ResizeObserver(()=>sendHeight()).observe(resizeEl);
document.querySelectorAll('a').forEach(a=>a.target="_blank");
document.querySelectorAll('form').forEach(a=>a.target="_blank");
</script>`}
          sandbox="allow-scripts allow-popups"
          className={styles.message_content}
          ref={iframeEl}
        />
      </Stack>
    </div>
  );
}

function ReplyBar({ ...props }) {
  const {
    BundledEditor,
  } = useAppContext();

  const [showDefaultStyles, setShowDefaultStyles] = useState(false);

  return (
    <Stack related {...props} uncollapsable>
      <Stack col>
        <Stack surface>
          <Reply block />
          <ChevronDown block />
        </Stack>
      </Stack>
      <Stack
        fill
        surface
        pad={0}
        customClasses={[styles.inline_editor, showDefaultStyles && styles.inline_editor_focused]}
      >
        <BundledEditor
          // onInit={(evt, editor) => {
          //   editor.addEventListener('focus', () => {})
          // }}
          onFocus={() => setShowDefaultStyles(true)}
          onBlur={() => setShowDefaultStyles(false)}
          initialValue="<p></p>"
          init={{
            menubar: false,
            plugins: [
              'advlist', 'anchor', 'autolink', 'image', 'link', 'lists',
              'searchreplace', 'table', 'wordcount', 'autoresize',
            ],
            // eslint-disable-next-line quotes
            toolbar: `undo redo | blocks | \
bold italic forecolor | alignleft aligncenter \
alignright alignjustify | bullist numlist outdent indent | \
removeformat`,
            statusbar: false,
            autoresize_bottom_margin: 0,
            autoresize: true,
            inline: true,
          }}
        />
      </Stack>
      <Stack jc="flex-end" col>
        <ClickableContainer surface>
          <Send />
        </ClickableContainer>
      </Stack>
    </Stack>
  );
}
