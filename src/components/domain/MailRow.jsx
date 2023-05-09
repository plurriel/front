import { Container, RelatedStack, Stack } from "../Layout";
import { Person } from "../PersonCard";
import { Archive } from "../icons/Archive";
import { ChevronDown } from "../icons/ChevronDown";
import { Delete } from "../icons/Delete";
import { Forward } from "../icons/Forward";
import { MarkUnread } from "../icons/MarkUnread";
import { MoveTo } from "../icons/MoveTo";
import { Reply } from "../icons/Reply";
import { ReportSpam } from "../icons/ReportSpam";
import { Schedule } from "../icons/Schedule";
import { Send } from "../icons/Send";
import { useAppContext } from "./AppContext";

import * as DOMPurify from 'dompurify';

export function MailRow({ ...props }) {
  const {
    selectedMail: [selectedMail],
    mails: [mails],
  } = useAppContext();

  if (!selectedMail) return (
    <Stack surface center {...props}>
      No selected mail
    </Stack>
  )

  return (
    <Stack surface col {...props}>
      <Stack col surface pad="0" br="1em 1em 0.5em 0.5em">
        <ActionRow />
        <Stack pad>
          <Container fill>
            <b>{mails[selectedMail].subject}</b>
          </Container>
        </Stack>
      </Stack>
      <Container scroll fill >
        <Stack col gap>
          {
            mails[selectedMail].contents.map((contentId) => <MailContents contentId={contentId} key={contentId}/>)
          }
        </Stack>
      </Container>
      <ReplyBar br="0.5em 0.5em 1em 1em" />
    </Stack>
  );
}

function ActionRow ({ ...props }) {
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

function MailContents({ contentId }) {
  const {
    contents: [contents],
  } = useAppContext();

  return (
    <Stack related col br="0.5em">
      <MetaRow />
      <Container surface pad dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(contents[contentId].content) }} />
    </Stack>
  );
}

function MetaRow({ ...props }) {
  return (
    <Stack {...props} col pad="0" surface>
      <Stack uncollapsable>
        <Stack pad w="256px">
          <small>From:</small>
          <Person name="John Doe" img="https://picsum.photos/200/200/?r=2342342423523" />
        </Stack>
        <Stack pad w="256px">
          <small>At:</small>
          <Container summarize oneline>02:02 29/04/2023</Container>
        </Stack>
        <Stack pad w="256px">
          <small>To:</small>
          <Person name="Me" img="https://picsum.photos/200/200/?r=686994858" />
        </Stack>
        <Container fill />
        <Container pad>
          <ChevronDown block />
        </Container>
      </Stack>
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
