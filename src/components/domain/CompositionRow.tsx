import React, { useState } from 'react';
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
    BundledEditor,
  } = useAppContext();

  const [subject, setSubject] = useState('');
  const [recipient, setRecipient] = useState('');
  // const [doExpand, setDoExpand] = useState(false);

  const [local, subdomain] = addresses[selectedFolder[1]].name.split('@');

  return (
    <Stack surface col {...props}>
      <Stack related>
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
      <Stack col gap="0">
        <Stack related>
          <Stack surface>
            <small>From:</small>
          </Stack>
          <Container flexGrow surface customClasses={[styles.hide_until_hover]} tabIndex={0}>
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
                    .toLowerCase();
                  if (newValue.includes('@')) {
                    newValue = newValue.replace(/@+(?=@)/g, '');
                    newValue = newValue.replace(/[^A-z0-9!#$%&'*+\-/=?^_`{|}~.@](?=.+@)|\.+(?=\..+@)/g, '');
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
      <Container flexGrow scroll>
        <Container br>
          {BundledEditor && (
          <BundledEditor
            // onInit={(evt, editor) => { editorRef.current = editor; }}
            initialValue={`<p></p><p>Sent from <a href="https://plurriel.email">Plurriel</a> over <a href="${subdomains[selectedFolder[0]].name}">${subdomains[selectedFolder[0]].name}</a></p>`}
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
        <ClickableContainer
          cta
          surface
          onFire={() => {

          }}
        >
          <Send />
          Send
        </ClickableContainer>
      </Stack>
    </Stack>
  );
}
