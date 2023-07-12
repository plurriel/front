/* eslint-disable camelcase */
import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Mail, Convo } from '@prisma/client';
import { sanitize } from 'isomorphic-dompurify';
import { Editor } from 'tinymce';
import { InferType } from 'yup';
import { draftReqSchema } from '@/pages/api/addresses/[id]/draft';
import { mailPatchSchema } from '@/pages/api/mails/[id]';

import { emailAddrUtils, getFolderName, State } from '@/lib/utils';

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
    folders: [folders],
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
      <Stack surface margin="-1em -1em 0 -1em" br="0 0 0.5em 0.5em" oneline id={styles.domain}>
        <IconButton
          onFire={() => {
            setCurrentFirstPane(1);
            setComposing(false);
            setSelectedMail(null);
            window.history.pushState(
              {},
              '',
              `/${address.name}/${getFolderName(folders[selectedFolder[2]])}`,
            );
          }}
          customClasses={[pageStyles.third_pane_back]}
          icon={Back}
        />
        <Stack flexGrow col gap="0" margin="-0.5em 0">
          <Container oneline flexGrow>
            <small>{[...convo.interlocutors, address.name].join(', ')}</small>
          </Container>
          {convo.subject || '<No Subject>'}
        </Stack>
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
      // console.log(mailId, selectedMail);
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
    convos: [convos, setConvos],
    addresses: [addresses],
    selectedFolder: [selectedFolder],
    BundledEditor,
  } = useAppContext();

  if (!selectedFolder) throw new Error();

  const [subject, setSubject] = useState(mail.subject || '');
  const [recipients, setRecipients] = useState(mail.to.join(', '));

  const [local, subdomain] = addresses[selectedFolder[1]].name.split('@');

  const [sendAsLabel, setSendAsLabel] = useState('');

  const [isSending, setIsSending] = useState<string | false>(false);
  const [abortSending, setAbortSending] = useState<AbortController | null>();
  const [isSendingTime, setIsSendingTime] = useState<number | null>(null);

  async function saveDraft() {
    const latestDraftVersion = mails[composing as string];

    const sendToBack: InferType<typeof mailPatchSchema> = {};
    const eqSet = (xs: Set<any>, ys: Set<any>) => xs.size === ys.size
    && [...xs].every((x) => ys.has(x));

    // console.log(recipients, sendToBack, latestDraftVersion);
    if (latestDraftVersion.subject !== subject) {
      sendToBack.subject = subject;
    }

    const newSetOfRecipients = new Set(recipients.split(/, ?/g));
    newSetOfRecipients.delete('');
    if (!eqSet(newSetOfRecipients, new Set(latestDraftVersion.to))) {
      sendToBack.to = [...newSetOfRecipients];
    }
    const contents = editorRef.current?.getContent();
    if ((latestDraftVersion.html || '') !== contents) sendToBack.html = contents;
    setIsSending('draft');
    const patchData: { convo: Convo } & Mail = await fetch(`/api/mails/${composing}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(sendToBack),
    }).then((v) => v.json());
    const {
      convo: patchedConvo,
      ...patchedMail
    } = patchData;
    setIsSending(false);
    setMails((oldMails: typeof mails) => {
      const newMails = { ...oldMails };
      newMails[patchedMail.id] = patchedMail;
      return newMails;
    });
    setConvos((oldConvos: typeof convos) => {
      const newConvos = { ...oldConvos };
      newConvos[patchedConvo.id] = {
        ...newConvos[patchedConvo.id],
        ...patchedConvo,
      };
      return newConvos;
    });
    setComposing(false);
  }

  async function send() {
    await saveDraft();
    return fetch(`/api/mails/${composing}/send`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
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
    // console.log('aaasdasdsa');
    const frameWindow: Window | null = (iframeElm as HTMLIFrameElement).contentWindow;
    if (!frameWindow) return;
    const frameDocument: Document | undefined = frameWindow.document;
    // console.log('aaasdasdsa');

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
          <Stack surface pad="0.5em">
            <small>Subject:</small>
          </Stack>
          <Container flexGrow>
            <TextInput
              w
              h="2em"
              pad="0.5em"
              onChange={({ target }) => setSubject((target as HTMLInputElement).value)}
              value={subject}
              placeholder="<No Subject>"
            />
          </Container>
        </Stack>
        <Stack col gap="0" disabled={Boolean(isSending)}>
          <Stack related>
            <Stack surface pad="0.5em">
              <small>From:</small>
            </Stack>
            <Container
              flexGrow
              pad="0.5em"
              surface
              customClasses={[styles.send_as_label, !sendAsLabel && styles.hide_until_hover]}
              tabIndex={0}
            >
              {local}
              <TextInput
                h="1em"
                pad="1"
                onChange={({ target }) => setSendAsLabel((target as HTMLInputElement).value)}
                value={sendAsLabel}
              />
              @
              {subdomain}
            </Container>
          </Stack>
          <Container pad="0.5em 0 0 0">
            <Stack related>
              <Stack surface pad="0.5em">
                <small>To:</small>
              </Stack>
              <Container flexGrow>
                <TextInput
                  w
                  h="2em"
                  pad="0.5em"
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
        <Container style={{ '--tmcepad': '0.5em' } as CSSProperties}>
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
                  tooltip: 'Reply mode',
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
                await saveDraft();
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
        <Stack surface oneline pad="0.5em">
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
        <Stack surface oneline pad="0.5em">
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
              pad="0.5em"
              customClasses={[styles.draft_indicator, mail.id === composing && styles.invert]}
              onFire={() => {
                if (composing !== mail.id) setComposing(mail.id);
                else {
                  setComposing(false);
                }
              }}
              oneline
            >
              <b>
                Edit Draft
              </b>
            </ClickableContainer>
          )
        }
      </Stack>
      <Stack surface pad="0.5em">
        <IconButton icon={ChevronDown} revpad="0.5em" />
      </Stack>
    </Stack>
  );
}

type ReplyType = 'reply' | 'replyall';

function ReplyBar({ ...props }) {
  const {
    selectedMail: [selectedMail],
    convos: [convos],
    mails: [mails],
    addresses: [addresses],
    selectedFolder: [selectedFolder],
    BundledEditor,
  } = useAppContext();

  if (!selectedMail) throw new Error();

  const editorRef = useRef<Editor>();

  const [showDefaultStyles, setShowDefaultStyles] = useState(false);

  const [currentReply, setCurrentReply] = useState<'reply' | 'replyall'>('reply');
  const [isSending, setIsSending] = useState(false);

  const [createdAs__hidden, setCreatedAs] = useState<string | boolean>(false);

  const [lastTimeout__hidden, setLastTimeout] = useState<number>(Date.now() - 1000);
  const [lastContent__hidden, setLastContent] = useState('');

  const [resolveQueue__hidden, setResolveQueue] = useState<(() => void)[]>([]);

  // Will reassign due to dependency within a function that will not be changed
  let lastTimeout = lastTimeout__hidden;
  let lastContent = lastContent__hidden;
  let createdAs = createdAs__hidden;
  let resolveQueue = resolveQueue__hidden;

  const createDraft = async () => {
    if (!editorRef.current) return;
    if (typeof createdAs === 'string') return;
    if (createdAs === true) {
      // ESLint dumb as fuck
      // eslint-disable-next-line consistent-return
      return new Promise<void>((r) => {
        resolveQueue.push(r);
        resolveQueue = [...resolveQueue];
        setResolveQueue(resolveQueue);
      });
    }
    const currentContent = editorRef.current.getContent();
    createdAs = true;
    setCreatedAs(true);
    const latestMail = mails[
      (convos[mails[selectedMail].convoId] as StoredAs<Convo, 'mails', true>).mails.at(-1) as string
    ];
    await fetch(`/api/addresses/${addresses[(selectedFolder as [string, string, string])[1]].id}/draft`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        to: [latestMail.from, ...(({ reply: [], replyall: latestMail.to } as const)[currentReply])],
        cc: ({ reply: [], replyall: latestMail.cc } as const)[currentReply],
        bcc: [],
        subject: latestMail.inReplyTo
          && latestMail.subject
          && latestMail.subject.startsWith('Re')
          ? latestMail.subject
          : `Re: ${latestMail.subject || '<No Subject>'}`,
        contents: currentContent,
        inReplyTo: latestMail.id,
      } as InferType<typeof draftReqSchema>),
    })
      .then(async (response) => {
        const responseData = await response.json() as Mail;

        setCreatedAs(responseData.id);

        lastContent = currentContent;
        setLastContent(lastContent);

        lastTimeout = Date.now();
        setLastTimeout(lastTimeout);

        resolveQueue.forEach((f) => f());
        resolveQueue = [];
        setResolveQueue(resolveQueue);
      });
  };

  const saveDraft = async () => {
    if (!editorRef.current) return;
    if (typeof createdAs !== 'string') return;
    const currentContent = editorRef.current.getContent();

    if (currentContent !== lastContent) {
      await fetch(`/api/mails/${createdAs}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          html: currentContent,
        } as InferType<typeof mailPatchSchema>),
      })
        .then(() => {
          lastContent = currentContent;
          setLastContent(lastContent);
        });
    }
  };

  useEffect(() => {
    const interval = setInterval(saveDraft, 5_000);
    return () => {
      clearInterval(interval);
      // console.log('useEffect dismount triggered!');
      saveDraft();
    };
  });

  return (
    <Stack related {...props} uncollapsable>
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
          onEditorChange={async (evt: any, editor: Editor) => {
            const currentContent = editor.getContent();
            if (!createdAs) {
              createDraft();
            }
            // Currently creating....
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
              let currentValue: ReplyType = 'reply';
              editor.ui.registry.addSplitButton('myButton', {
                icon: 'reply',
                tooltip: 'This is an example split-button',
                onAction: (api) => {
                  currentValue = ({ replyall: 'reply', reply: 'replyall' })[currentValue] as ReplyType;
                  setCurrentReply(currentValue);
                  api.setIcon(currentValue);
                },
                onItemAction: (api, value) => {
                  currentValue = value as ReplyType;
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
            placeholder: 'Reply...',
          }}
        />
      </Stack>
      <Stack ai="flex-end">
        <ClickableContainer
          surface
          disabled={!editorRef.current || isSending}
          onFire={async () => {
            setIsSending(true);
            const currentContent = editorRef.current?.getContent() || '';
            if (!createdAs) {
              await createDraft();
            } else if (currentContent !== lastContent) {
              await saveDraft();
            }
            await fetch(`/api/mails/${createdAs}/send`, {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
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
