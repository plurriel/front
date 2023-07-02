import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Mail, Convo } from '@prisma/client';
import { sanitize } from 'isomorphic-dompurify';
import { Editor } from 'tinymce';
import { InferType } from 'yup';
import { mailReqSchema } from '@/pages/api/addresses/[id]/mail';
import { mailPatchSchema } from '@/pages/api/mails/[id]';

import { emailAddrUtils, State } from '@/lib/utils';

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
import { editorStyles } from '../content_style';
import { TextInput } from '../Input';

export function MailRow({ ...props }) {
  const {
    selectedMail: [selectedMail, setSelectedMail],
    selectedFolder: [selectedFolder],
    addresses: [addresses],
    mails: [mails, setMails],
    convos: [convos, setConvos],
    currentFirstPane: [, setCurrentFirstPane],
    composing: [composing, setComposing],
  } = useAppContext();

  const mail = selectedMail ? mails[selectedMail] : null;

  useEffect(() => {
    (async () => {
      if (mail && !convos[mail.convoId]) {
        const convo: Convo & { mails: Mail[] } = await fetch(`/api/mails/${selectedMail}/convo/with_mails`)
          .then((res) => res.json());
        setMails((mails_) => {
          const newMails = { ...mails_ };
          setConvos((convos_) => {
            const newConvos = { ...convos_ };
            newConvos[convo.id] = {
              ...convo,
              mails: convo.mails
                .map((mail_: Mail) => {
                  newMails[mail_.id] = mail_;
                  return mail_.id;
                }),
            };
            return newConvos;
          });
          return newMails;
        });
      }
    })();
  }, [mail, setConvos, setMails, selectedMail]);

  const convo = mail && convos[mail.convoId];

  const loadedFramesState = useState<string[] | undefined>(
    (convo as StoredAs<Convo, 'mails', true> | undefined)?.mails,
  );
  // const editorRef = useRef(null);

  useEffect(() => {
    loadedFramesState[1]((convo as StoredAs<Convo, 'mails', true>)?.mails);
  }, [convo]);

  if (composing && !selectedMail) return <CompositionRow {...props} />;

  if (!selectedMail || !selectedFolder) {
    return (
      <Stack surface col center {...props}>
        <b>No selected mails</b>
        <span>Please select a pane using the pane on the left</span>
      </Stack>
    );
  }

  if (!convo) {
    return (
      <Stack surface col center {...props}>
        <b>Loading...</b>
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
              setComposing(false);
              setSelectedMail(null);
            }}
            customClasses={[pageStyles.third_pane_back]}
            icon={Back}
          />
          <Container oneline flexGrow>{[...convo.interlocutors, address.name].join(', ')}</Container>
          <IconButton icon={Options} />
        </Stack>
        <Container pad="0 1em 1em 1em">
          <b>{convo.subject || '<No Subject>'}</b>
        </Container>
      </Stack>
      {
          'mails' in convo
            ? (
              <Container scroll flexGrow>
                <Stack col gap>
                  {
                    (convo as StoredAs<Convo, 'mails', true>)
                      .mails
                      .map((mailId) => (
                        <MailContents
                          loadedFramesState={loadedFramesState as State<string[]>}
                          mailId={mailId}
                          key={mailId}
                        />
                      ))
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

// function useHookWithRefCallback(
//   setFrameHeight: React.Dispatch<React.SetStateAction<number>>,
//   setLoadedFrames: React.Dispatch<React.SetStateAction<string[]>>,
//   mailId: string,
// ) {
//   const ref = useRef<HTMLIFrameElement | null>(null);
//   const setRef = useCallback((node: HTMLIFrameElement | null) => {
//     // if (ref.current) {
//     //   // Make sure to cleanup any events/references added to the last instance
//     // }

//     // Save a reference to the node
//     ref.current = node;

//     if (node) {
//     }
//   }, []);

//   return [setRef];
// }

function MailContents({
  mailId,
  loadedFramesState,
}: {
  mailId: string,
  loadedFramesState: State<string[]>,
}) {
  const {
    mails: [mails],
    selectedMail: [selectedMail],
  } = useAppContext();

  const mail = mails[mailId];

  const [loadedFrames, setLoadedFrames] = loadedFramesState;
  const mailEl = useRef<HTMLDivElement | null>(null);
  // const cmToggledState = useState<[number, number] | null>(null);
  // const [cmToggled, setCmToggled] = cmToggledState;

  useEffect(() => {
    if (loadedFrames?.length === 0 && selectedMail === mailId) {
      console.log(mailId, selectedMail);
      mailEl.current?.scrollIntoView({ behavior: 'smooth' });
      // setSelectedMail(null);
    }
  }, [selectedMail, loadedFrames]);

  return (
    <div ref={mailEl}>
      <Stack
        related
        col
        br="0.5em"
        onLoad={({ target }) => {
          if (selectedMail === mailId) (target as HTMLDivElement).scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <MailView mail={mail} setLoadedFrames={setLoadedFrames} />
        {/* <ContextMenu
          toggledState={cmToggledState}
        >
          {mail.type === 'Draft' && (
            <ClickableContainer pad br="0.5em">Edit draft</ClickableContainer>
          )}
        </ContextMenu> */}
      </Stack>
    </div>
  );
}

function MailView({ mail, setLoadedFrames }: { mail: Mail, setLoadedFrames: State<string[]>[1] }) {
  const {
    composing: [composing, setComposing],
    mails: [mails, setMails],
    addresses: [addresses],
    selectedFolder: [selectedFolder],
    BundledEditor,
  } = useAppContext();

  const [subject, setSubject] = useState('');
  const [recipients, setRecipients] = useState('');

  if (!selectedFolder) throw new Error();

  const [local, subdomain] = addresses[selectedFolder[1]].name.split('@');

  const [sendAsLabel, setSendAsLabel] = useState('');

  const [isSending, setIsSending] = useState<string | false>(false);
  const [abortSending, setAbortSending] = useState<AbortController | null>();
  const [isSendingTime, setIsSendingTime] = useState<number | null>(null);

  async function send() {
    const reqBody: InferType<typeof mailReqSchema> = {
      inReplyTo: undefined,
      to: recipients.split(/, ?/g),
      subject,
      bcc: [],
      cc: [],
      contents: editorRef.current?.getContent() || '',
    };
    return fetch(`/api/addresses/${selectedFolder?.[1]}/mail`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(reqBody),
    }).then((res) => res.json());
  }

  const [frameHeight, setFrameHeight] = useState(100);
  const iframeEl = useRef<HTMLIFrameElement | null>(null);
  // const [iframeEl] = useHookWithRefCallback(setFrameHeight, setLoadedFrames, mailId);

  const editorRef = useRef<Editor | null>(null);

  function getAbsoluteHeight(el: HTMLBodyElement, frameWindowInner: Window) {
    const elStyles = frameWindowInner.getComputedStyle(el);
    return el.offsetHeight + parseFloat(elStyles.marginTop) + parseFloat(elStyles.marginBottom);
  }
  function sendHeight(el: HTMLBodyElement, frameWindowInner: Window) {
    setFrameHeight(getAbsoluteHeight(el, frameWindowInner));
    if (frameWindowInner.document.readyState === 'complete') {
      setLoadedFrames((lf) => lf && [...lf.filter((v) => v !== mail.id)]);
    }
  }

  function handleElLoad(iframeElm?: HTMLIFrameElement) {
    if (!iframeElm) return;
    console.log('aaasdasdsa');
    const frameWindow: Window | null = (iframeElm as HTMLIFrameElement).contentWindow;
    if (!frameWindow) return;
    const frameDocument: Document | undefined = frameWindow.document;
    console.log('aaasdasdsa');

    // frameDocument.addEventListener('contextmenu', (evt) => {
    //   evt.preventDefault();
    //   const bRect = iframeElm.getBoundingClientRect();
    //   setCmToggled([evt.clientX + bRect.left, evt.clientY + bRect.top]);
    //   console.log([evt.clientX, evt.clientY]);
    // });

    // frameDocument.addEventListener('click', (evt) => {
    //   setCmToggled(null);
    // });

    const resizeEl = frameDocument.querySelector('body') as HTMLBodyElement | undefined;
    if (!resizeEl) return;
    sendHeight(resizeEl, frameWindow);
    new ResizeObserver(() => sendHeight(resizeEl, frameWindow)).observe(resizeEl);
    frameDocument.querySelectorAll('a').forEach((a) => { a.target = '_blank'; });
    frameDocument.querySelectorAll('form').forEach((a) => { a.target = '_blank'; });
  }

  useEffect(() => {
    if (!iframeEl.current) return;
    handleElLoad(iframeEl.current);
  }, [iframeEl, setFrameHeight, setLoadedFrames]);

  if (composing === mail.id) {
    return BundledEditor && (
      <>
        <Stack related disabled={Boolean(isSending)}>
          <Stack surface>
            <small>Subject:</small>
          </Stack>
          <Container flexGrow>
            <TextInput
              w
              onChange={({ target }) => setSubject((target as HTMLInputElement).value)}
              value={subject}
              placeholder="<No Subject>"
            />
          </Container>
        </Stack>
        <Stack col gap="0" disabled={Boolean(isSending)}>
          <Stack related>
            <Stack surface>
              <small>From:</small>
            </Stack>
            <Container
              flexGrow
              surface
              customClasses={[styles.send_as_label, !sendAsLabel && styles.hide_until_hover]}
              tabIndex={0}
            >
              {local}
              <TextInput
                onChange={({ target }) => setSendAsLabel((target as HTMLInputElement).value)}
                value={sendAsLabel}
              />
              @
              {subdomain}
            </Container>
          </Stack>
          <Container pad="0.5em 0 0 0">
            <Stack related>
              <Stack surface>
                <small>To:</small>
              </Stack>
              <Container flexGrow>
                <TextInput
                  w
                  onChange={({ target }) => {
                    let newValue = (target as HTMLInputElement).value
                      .toLowerCase()
                      .split(/, ?/g);
                    newValue = newValue.map((newValueAddr, currentIdx) => {
                      if (newValueAddr.includes('@') || currentIdx !== newValue.length - 1) {
                        newValueAddr = newValueAddr.replace(/@+(?=@)/g, '');
                        newValueAddr = newValueAddr.replace(/[^A-z0-9!#$%&'*+\-/=?^_`{|}~.@](?=.+@)|\.+(?=\..+@)/g, '');
                        newValueAddr = newValueAddr.replace(/[^A-z0-9-_.@](?!=.+@)|\.(?=\.(?!=.+@))/g, '');
                      } else {
                        newValueAddr = newValueAddr.replace(/[^A-z0-9!#$%&'*+\-/=?^_`{|}~@.]|\.(?=\.)/g, '');
                      }
                      return newValueAddr;
                    });
                    setRecipients(newValue.join(', '));
                  }}
                  value={recipients}
                />
              </Container>
            </Stack>
          </Container>
        </Stack>
        <Container>
          <BundledEditor
            onInit={(evt: any, editor: Editor) => {
              editorRef.current = editor;
            }}
            initialValue={mail.html}
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
                if (!mail.inReplyTo) return;
                let currentValue = 'reply';
                editor.ui.registry.addSplitButton('myButton', {
                  icon: 'reply',
                  tooltip: 'This is an example split-button',
                  onAction: (api) => {
                    currentValue = { replyall: 'reply', reply: 'replyall' }[currentValue] as string;
                    // setCurrentReply(currentValue);
                    api.setIcon(currentValue);
                  },
                  onItemAction: (api, value) => {
                    currentValue = value;
                    api.setIcon(currentValue);
                    // setCurrentReply(currentValue);
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
              // autoresize: true,
              icons: 'adaptive_default',
              content_style: editorStyles,
              // inline: true,
            }}
          />
        </Container>
        <Stack jc="space-between">
          <Stack>
            {isSending === 'mail' && (
              <>
                <Container pad>
                  Sending in
                  {' '}
                  {isSendingTime}
                </Container>
                <Stack related>
                  <ClickableContainer
                    onFire={() => {
                      setIsSending(false);
                      (abortSending as AbortController).abort();
                      setAbortSending(null);
                    }}
                    surface
                  >
                    Cancel
                  </ClickableContainer>
                  <ClickableContainer
                    onFire={async () => {
                      setIsSending(false);
                      (abortSending as AbortController).abort();
                      setAbortSending(null);
                      await send();
                      setComposing(false);
                    }}
                    surface
                  >
                    Send now
                  </ClickableContainer>
                </Stack>
              </>
            )}
          </Stack>
          <Stack>
            <ClickableContainer
              surface
              br
              onFire={async () => {
                const latestDraftVersion = mails[composing as string];

                const sendToBack: InferType<typeof mailPatchSchema> = {};
                // const eqSet = (xs: Set<any>, ys: Set<any>) => xs.size === ys.size
                //   && [...xs].every((x) => ys.has(x));

                // TODO: Worry about saving metadata (fuck)
                const contents = editorRef.current?.getContent();
                if ((latestDraftVersion.html || '') !== contents) sendToBack.html = contents;
                setIsSending('draft');
                const patchData: Mail = await fetch(`/api/mails/${composing}`, {
                  method: 'PATCH',
                  headers: { 'content-type': 'application/json' },
                  body: JSON.stringify(sendToBack),
                }).then((v) => v.json());
                setIsSending(false);
                setMails((oldMails: typeof mails) => {
                  const newMails = { ...oldMails };
                  newMails[mail.id] = patchData;
                  return newMails;
                });
                setComposing(false);
              }}
            >
              Save Draft
            </ClickableContainer>
            <ClickableContainer
              cta
              surface
              onFire={() => {
                setIsSending('mail');
                setIsSendingTime(5);
                const abortController = new AbortController();
                setAbortSending(abortController);
                const sentDate = Date.now();
                const onUpdate = async () => {
                  if (abortController.signal.aborted) return null;
                  const currentTimeSinceSent = Date.now() - sentDate;
                  if (currentTimeSinceSent > 5_000) {
                    setIsSending(false);
                    await send();
                    setComposing(false);
                    return null;
                  }
                  setIsSendingTime(5 - Math.floor(currentTimeSinceSent / 1000));
                  setTimeout(onUpdate, 100);
                  return null;
                };
                setTimeout(onUpdate, 100);
              }}
            >
              Send
            </ClickableContainer>
          </Stack>
        </Stack>
      </>
    );
  }

  if (!mail.html) {
    return (
      <>
        <MailMetaIndication mail={mail} />
        <div
          className={styles.contentless}
          onContextMenu={(evt) => {
            evt.preventDefault();
            // setCmToggled([evt.clientX, evt.clientY]);
          }}
        >
          <small>
            This E-Mail has no content
          </small>
        </div>
      </>
    );
  }

  return (
    <>
      <MailMetaIndication mail={mail} />
      <iframe
        style={{ height: frameHeight }}
        title={mail.subject || '<No Subject>'}
        srcDoc={`<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
  <body>${mail.html
          ? sanitize(mail.html.replace(/http:\/\/((?:[-a-zA-Z0-9_]|\.(?=[^.])){1,256}\.[a-zA-Z0-9]{1,6}(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*))/g, (_, url) => `https://${url}`))
          : ''}</body>
  <style>body{background-color:white;font-family:'DM Sans',sans-serif;margin:1em;overflow-y:hidden;}</style>`}
        sandbox="allow-popups allow-same-origin"
        className={styles.message_content}
        ref={iframeEl}
        onLoad={({ target }) => {
          handleElLoad(target as HTMLIFrameElement);
        }}
      />
    </>
  );
}

function MailMetaIndication({ mail }: { mail: Mail }) {
  const {
    selectedFolder: [selectedFolder],
    addresses: [addresses],
    composing: [composing, setComposing],
  } = useAppContext();

  if (!selectedFolder?.[1]) throw new Error();

  const [dateSent, setDateSent] = useState<Date | null>(null);
  const [isSameDate, setIsSameDate] = useState(false);

  useEffect(() => {
    setDateSent(new Date(mail.at));
    setIsSameDate(new Date().toLocaleDateString() === new Date(mail.at).toLocaleDateString());
  }, [mail.at]);

  const dateFormat: Intl.DateTimeFormatOptions = {
    timeStyle: 'short',
  };
  if (!isSameDate) dateFormat.dateStyle = 'short';

  const currentAddress = addresses[selectedFolder[1]].name;

  let fromDisplayName = emailAddrUtils.extractDisplayName(mail.from);
  const fromEmailAddr = emailAddrUtils.extractAddress(mail.from);
  if (fromEmailAddr === currentAddress) {
    fromDisplayName = 'Me';
  }

  // let toDisplayName;
  // let toEmailAddr;
  // if (mail.to.some((email) => emailAddrUtils.extractAddress(email) === currentAddress)) {
  //   toDisplayName = 'Me';
  //   toEmailAddr = currentAddress;
  // } else {
  //   toDisplayName = emailAddrUtils.extractDisplayName(mail.to[0]);
  //   toEmailAddr = emailAddrUtils.extractAddress(mail.to[0]);
  // }

  return (
    <Stack>
      <Stack flexGrow reverse={mail.type !== 'Inbound'}>
        <Stack surface>
          <small>
            From:
          </small>
          <Person
            name={fromDisplayName}
            subtext={
              fromDisplayName === fromEmailAddr || fromEmailAddr === currentAddress
                ? undefined
                : `@${fromEmailAddr.split('@')[1]}`
            }
          />
        </Stack>
        <Stack surface>
          <small>
            At:
          </small>
          {dateSent
            ? new Intl.DateTimeFormat(
              'en-GB',
              dateFormat,
            ).format(dateSent)
            : ''}
        </Stack>
        {
          mail.type === 'Draft' && !composing && (
            <ClickableContainer
              surface
              customClasses={[styles.draft_indicator, mail.id === composing && styles.invert]}
              onFire={() => {
                if (composing !== mail.id) setComposing(mail.id);
                else {
                  setComposing(false);
                }
              }}
            >
              <b>
                Edit Draft
              </b>
            </ClickableContainer>
          )
        }
      </Stack>
      <Stack surface>
        <IconButton icon={ChevronDown} />
      </Stack>
    </Stack>
  );
}

function ReplyBar({ ...props }) {
  const {
    selectedMail: [selectedMail],
    convos: [convos],
    BundledEditor,
  } = useAppContext();

  if (!selectedMail) throw new Error();

  const editorRef = useRef<Editor>();

  const [showDefaultStyles, setShowDefaultStyles] = useState(false);

  const [, setCurrentReply] = useState('reply');
  const [isSending, setIsSending] = useState(false);

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
          onInit={(evt: any, editor: Editor) => {
            editorRef.current = editor;
          }}
          onFocus={() => setShowDefaultStyles(true)}
          onBlur={() => setShowDefaultStyles(false)}
          initialValue=""
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
                  currentValue = { replyall: 'reply', reply: 'replyall' }[currentValue] as string;
                  setCurrentReply(currentValue);
                  api.setIcon(currentValue);
                },
                onItemAction: (api, value) => {
                  currentValue = value;
                  api.setIcon(currentValue);
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
        <ClickableContainer
          surface
          disabled={!editorRef.current || isSending}
          onFire={async () => {
            setIsSending(true);
            await fetch(`/api/mails/${(convos[selectedMail] as StoredAs<Convo, 'mails', true>).mails.at(-1)}/reply`, {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ contents: (editorRef.current as Editor).getContent() }),
            });
            setIsSending(false);
            (editorRef.current as Editor).setContent('');
          }}
        >
          {/* I currently don't have enough of the brains to figure out how to show the Undo */}
          {/* timer so I'm not gonna implement it right now. */}
          <Send />
        </ClickableContainer>
      </Stack>
    </Stack>
  );
}
