import React, { useEffect, useRef, useState } from 'react';
import { Mail, Convo } from '@prisma/client';
import { sanitize } from 'isomorphic-dompurify';
import { Editor } from 'tinymce';

import { emailAddrUtils } from '@/lib/utils';

import pageStyles from '@/styles/domain.module.css';
import styles from '@/styles/domain/MailRow.module.css';

import { ClickableContainer, Container, Stack } from '../Layout';
import { Person } from '../PersonCard';
import { ChevronDown } from '../icons/ChevronDown';
import { StoredAs, useAppContext } from './AppContext';

import { Back } from '../icons/Back';
import { IconButton } from '../IconButton';
import { Options } from '../icons/Options';
import { Send } from '../icons/Send';
import { CompositionRow } from './CompositionRow';

export function MailRow({ ...props }) {
  const {
    selectedConvo: [selectedConvo, setSelectedConvo],
    selectedFolder: [selectedFolder],
    addresses: [addresses],
    mails: [, setMails],
    convos: [convos, setConvos],
    currentFirstPane: [, setCurrentFirstPane],
    composing: [composing, setComposing],
  } = useAppContext();

  const convo = convos[selectedConvo];

  useEffect(() => {
    (async () => {
      if (convo && !('mails' in convo)) {
        const mailsInConvo = await fetch(`/api/convos/${selectedConvo}/mails`)
          .then((res) => res.json());
        setMails((mails) => {
          const newMails = { ...mails };
          setConvos((convos_) => {
            const newConvos = { ...convos_ };
            (newConvos[selectedConvo] as StoredAs<Convo, 'mails', true>).mails = mailsInConvo
              .map((mail: Mail) => {
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

  useEffect(() => {
    if (composing) setSelectedConvo(null);
  }, [composing, setSelectedConvo]);
  useEffect(() => {
    if (selectedConvo) setComposing(null);
  }, [selectedConvo, setComposing]);

  // const editorRef = useRef(null);

  if (composing) return <CompositionRow {...props} />;

  if (!convo) {
    return (
      <Stack surface col center {...props}>
        <b>No selected mails</b>
        <span>Please select a pane using the pane on the left</span>
      </Stack>
    );
  }

  const address = addresses[selectedFolder[1]];

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
          <Container oneline flexGrow>{[convo.interlocutors, address.name].join(', ')}</Container>
          <IconButton icon={Options} />
        </Stack>
        <Stack pad col>
          <Container flexGrow>
            <b>{convo.subject}</b>
          </Container>
        </Stack>
      </Stack>
      {
          'mails' in convo
            ? (
              <Container scroll flexGrow>
                <Stack col gap>
                  {
                    convo.mails.map((mailId) => <MailContents mailId={mailId} key={mailId} />)
                  }
                </Stack>
              </Container>
            )
            : <Stack flexGrow center><b>Loading...</b></Stack>
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
//       <Container flexGrow />
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

function MailContents({ mailId }: { mailId: string }) {
  const {
    mails: [mails],
    requestedMail: [requestedMail],
  } = useAppContext();

  const mail = mails[mailId];

  const [frameHeight, setFrameHeight] = useState(100);
  const iframeEl = useRef();

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if ((event.source as Window).parent === window && event.data.id === mailId) {
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

  const dateFormat: Intl.DateTimeFormatOptions = {
    timeStyle: 'short',
  };
  if (!isSameDate) dateFormat.dateStyle = 'short';

  return (
    <div ref={mailEl}>
      <Stack
        related
        col
        br="0.5em"
        onLoad={({ target }) => {
          if (requestedMail === mailId) (target as HTMLDivElement).scrollIntoView({ behavior: 'smooth' });
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
              <Person name={mail.to.map(emailAddrUtils.extractDisplayName).join(', ')} />
            </Stack>
            <Container flexGrow />
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

  const [, setCurrentReply] = useState('reply');

  return (
    <Stack related {...props} uncollapsable>
      <Stack col>
        <Stack surface>
          <small>Reply:</small>
        </Stack>
      </Stack>
      <Stack
        flexGrow
        surface
        pad="0"
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
              'anchor', 'autolink', 'image', 'link', 'lists',
              'searchreplace', 'table', 'wordcount', 'autoresize',
            ],
            // eslint-disable-next-line quotes
            toolbar: `mybutton | undo redo | blocks | \
bold italic forecolor | alignleft aligncenter \
alignright alignjustify | bullist numlist outdent indent | \
removeformat`,
            setup: (editor: Editor) => {
              let currentValue = 'reply';
              editor.ui.registry.addSplitButton('myButton', {
                icon: 'reply',
                tooltip: 'This is an example split-button',
                onAction: (api) => {
                  currentValue = { replyall: 'reply', reply: 'replyall' }[currentValue];
                  setCurrentReply(currentValue);
                  api.setIcon(currentValue);
                },
                onItemAction: (api, value) => {
                  api.setIcon(currentValue);
                  currentValue = value;
                  setCurrentReply(currentValue);
                },
                fetch: (callback) => {
                  callback([
                    {
                      type: 'choiceitem',
                      icon: 'reply',
                      text: 'Reply',
                      value: 'reply',
                    },
                    {
                      type: 'choiceitem',
                      icon: 'replyall',
                      text: 'Reply to all',
                      value: 'replyall',
                    },
                  ]);
                },
              });
            },
            toolbar_mode: 'scrolling',
            statusbar: false,
            autoresize_bottom_margin: 0,
            autoresize: true,
            icons: 'adaptive_default',
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
