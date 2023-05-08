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

export function MailRow({ ...props }) {
  return (
    <Stack surface col {...props}>
      <Stack col surface pad="0" br="1em 1em 0.5em 0.5em">
        <ActionRow />
        <Stack pad>
          <Container fill>
            <b>Licence of your code and DMCA enquiry</b>
          </Container>
        </Stack>
      </Stack>
      <Container scroll fill >
        <Stack col gap>
          <MailContents />
          <MailContents />
          <MailContents />
          <MailContents />
        </Stack>
      </Container>
      <ReplyBar br="0.5em 0.5em 1em 1em" />
    </Stack>
  );
}

function MailContents() {
  return (
    <Stack related col br="0.5em">
      <MetaRow />
      <Container surface pad>
        Hello immjs,<br />
        <br />
        I am reaching out to you with regards to the license of your code and works, and to make an enquiry under the Digital Millennium Copyright Act (DMCA).<br />
        We have reason to believe that your code and works may be infringing upon the intellectual property rights of our client. Specifically, we have found that your code bears a striking resemblance to certain proprietary code that our client owns.<br />
        <br />
        We are therefore requesting that you provide us with information regarding the license under which you are using and distributing your code and works. We also ask that you provide us with any and all documentation related to the creation, distribution, and use of your code and works.<br />
        <br />
        Furthermore, we are submitting this email as an official DMCA enquiry under the Digital Millennium Copyright Act, which allows us to request that your website or other online platform take down any infringing content.<br />
        <br />
        We strongly advise that you take this matter seriously and respond promptly with the requested information. Failure to do so may result in legal action being taken against you.<br />
        <br />
        Thank you for your attention to this matter.<br />
        Sincerely,<br />
        Jonathan Doe
      </Container>
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
