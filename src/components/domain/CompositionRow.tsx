import React, { useRef, useState } from 'react';
import { Editor } from 'tinymce';
import { InferType } from 'yup';
import { mailReqSchema } from '@/pages/api/addresses/[id]/mail';
import styles from '@/styles/domain/CompositionRow.module.css';
import { ClickableContainer, Container, Stack } from '../Layout';
import { useAppContext } from './AppContext';

import editorStyles from '../content_style';
import { TextInput } from '../Input';
import { Send } from '../icons/Send';
// import { ChevronDown } from '../icons/ChevronDown';

export function CompositionRow({
  ...props
}) {
  const {
    subdomains: [subdomains],
    addresses: [addresses],
    selectedFolder: [selectedFolder],
    composing: [, setComposing],
    BundledEditor,
  } = useAppContext();

  const editorRef = useRef<Editor>();

  const [subject, setSubject] = useState('');
  const [recipients, setRecipients] = useState('');
  // const [doExpand, setDoExpand] = useState(false);

  if (!selectedFolder) throw new Error();

  const [local, subdomain] = addresses[selectedFolder[1]].name.split('@');

  const [isSending, setIsSending] = useState<boolean>(false);
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
    await fetch(`/api/addresses/${selectedFolder?.[1]}/mail`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(reqBody),
    });
  }

  return (
    <Stack surface col {...props}>
      <Stack related disabled={isSending}>
        <Stack surface>
          <small>Subject:</small>
        </Stack>
        <Container flexGrow>
          <TextInput
            w
            onChange={({ target }) => setSubject((target as HTMLInputElement).value)}
            value={subject}
            placeholder="No Subject"
          />
        </Container>
      </Stack>
      <Stack col gap="0" disabled={isSending}>
        <Stack related>
          <Stack surface>
            <small>From:</small>
          </Stack>
          <Container
            flexGrow
            surface
            customClasses={[styles.hide_until_hover]}
            tabIndex={0}
          >
            {local}
            <span>
              +
              <input />
            </span>
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
        {/* <Stack jc pad="0.5em 0 0 0">
          <ClickableContainer pad="0.25em" br="0.25em" toggleState={setDoExpand}>
            <small>More</small>
            <ChevronDown block />
          </ClickableContainer>
        </Stack>
        <Container expandable expanded={doExpand}>
          <Stack col pad="0.5em 0 0 0">
            <Stack related>
              <Stack surface>
                <small>Carbon Copy:</small>
              </Stack>
              <Container flexGrow>
                <TextInput
                  w
                  onChange={({ target }) => {
                    let newValue = target.value
                      .toLowerCase();
                    if (newValue.includes('@')) {
                      newValue = newValue.replace(/@+(?=@)/g, '');
                      newValue = newValue
                        .replace(/[^A-z0-9!#$%&'*+\-/=?^_`{|}~.@](?=.+@)|\.+(?=\..+@)/g, '');
                      newValue = newValue.replace(/[^A-z0-9-.@](?!=.+@)|\.(?=\.(?!=.+@))/g, '');
                    } else {
                      newValue = newValue.replace(/[^A-z0-9!#$%&'*+\-/=?^_`{|}~@.]|\.(?=\.)/g, '');
                    }
                    setRecipient(newValue);
                  }}
                  value={recipient}
                />
              </Container>
            </Stack>
            <Stack related>
              <Stack surface>
                <small>Blind Carbon Copy:</small>
              </Stack>
              <Container flexGrow>
                <TextInput
                  w
                  onChange={({ target }) => {
                    let newValue = target.value
                      .toLowerCase();
                    if (newValue.includes('@')) {
                      newValue = newValue.replace(/@+(?=@)/g, '');
                      newValue = newValue
                        .replace(/[^A-z0-9!#$%&'*+\-/=?^_`{|}~.@](?=.+@)|\.+(?=\..+@)/g, '');
                      newValue = newValue.replace(/[^A-z0-9-.@](?!=.+@)|\.(?=\.(?!=.+@))/g, '');
                    } else {
                      newValue = newValue.replace(/[^A-z0-9!#$%&'*+\-/=?^_`{|}~@.]|\.(?=\.)/g, '');
                    }
                    setRecipient(newValue);
                  }}
                  value={recipient}
                />
              </Container>
            </Stack>
          </Stack>
        </Container> */}
      </Stack>
      <Container flexGrow scroll disabled={isSending}>
        <Container br>
          {BundledEditor && (
          <BundledEditor
            // onInit={(evt, editor) => { editorRef.current = editor; }}
            initialValue={`<p></p><p>Sent from <a href="https://plurriel.email">Plurriel</a> over <a href="${subdomains[selectedFolder[0]].name}">${subdomains[selectedFolder[0]].name}</a></p>`}
            onInit={(evt: any, editor: Editor) => {
              editorRef.current = editor;
            }}
            init={{
              menubar: false,
              plugins: [
                'anchor', 'autolink', 'image', 'link', 'lists',
                'searchreplace', 'table', 'wordcount', 'autoresize',
              ],
              // eslint-disable-next-line quotes
              toolbar: `undo redo | blocks | \
  bold italic forecolor | alignleft aligncenter \
  alignright alignjustify | bullist numlist outdent indent | \
  removeformat`,
              toolbar_mode: 'scrolling',
              statusbar: false,
              icons: 'adaptive_default',
              content_style: editorStyles,
              autoresize_bottom_margin: 0,
            }}
          />
          )}
        </Container>
      </Container>
      <Stack jc="flex-end">
        {isSending && (
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
        <ClickableContainer
          cta
          surface
          disabled={isSending}
          onFire={() => {
            setIsSending(true);
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
          <Send />
          Send
        </ClickableContainer>
      </Stack>
    </Stack>
  );
}
