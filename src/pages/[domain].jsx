import { Add } from "@/components/icons/Add";
import { ArrowForward } from "@/components/icons/ArrowForward";
import { ChevronDown } from "@/components/icons/ChevronDown";
import { Edit } from "@/components/icons/Edit";
import { Settings } from "@/components/icons/Settings";
import { Stack, RelatedStack, Container } from "@/components/Layout";

import styles from "./domain.module.css";
import { Person } from "@/components/PersonCard";
import { Forward } from "@/components/icons/Forward";
import { Archive } from "@/components/icons/Archive";
import { MoveTo } from "@/components/icons/MoveTo";
import { Schedule } from "@/components/icons/Schedule";
import { MarkUnread } from "@/components/icons/MarkUnread";
import { Delete } from "@/components/icons/Delete";
import { ReportSpam } from "@/components/icons/ReportSpam";
import { Reply } from "@/components/icons/Reply";
import { Send } from "@/components/icons/Send";
import { createContext, useContext, useState } from "react";
import { DomainRow } from "@/components/domain/DomainRow";
import { MailsRow } from "@/components/domain/MailsRow";

const AppContext = createContext({
  subdomains: [],
  // Array of { name, imgSrc, addresses, id }
  // addresses: array of { name, imgSrc, folders, id } or null
  // folders: array of { name, mailsMeta } or null
  // mailsMeta: array of { sender, subject, sendDate, contents, id } or null
  // contents: { content, attachments, followUps }
  toggledSubdomains: [],
  toggledSubdomains: null,
  selectedAddress: [],
  selectedMail: null,
});

export function useAppContext() {
  return useContext(AppContext);
}

export default function Home(props) {
  const [subdomains, setSubdomains] = useState(props.subdomains);
  const [toggledSubdomains, setToggledSubdomains] = useState(new Set(props.lastToggledSubdomains));
  const [selectedAddress, setSelectedAddress] = useState(props.lastSelectedAddress);
  const [viewedAddress, setViewedAddress] = useState(selectedAddress);
  const [selectedMail, setSelectedMail] = useState(selectedAddress);

  return (
    <AppContext.Provider value={{
      domain: props.domain,
      subdomains: [subdomains, setSubdomains],
      toggledSubdomains: [toggledSubdomains, setToggledSubdomains],
      viewedAddress: [viewedAddress, setViewedAddress],
      selectedAddress: [selectedAddress, setSelectedAddress],
      selectedMail: [selectedMail, setSelectedMail],
    }}>
      <main className={styles.main}>
        <DomainRow customClasses={[styles.address]} subdomains={subdomains} />
        <MailsRow customClasses={[styles.mails]} />
        <Stack col surface fill customClasses={[styles.mail]}>
          <Container scroll>
            <RelatedStack col>
              <RelatedStack surface uncollapsable>
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
              </RelatedStack>
              <Container surface>
                Licence of your code and works and DMCA enquiry
              </Container>
              <Stack surface uncollapsable pad="0">
                <Stack center pad w="256px">
                  <small>From:</small>
                  <Person name="John Doe" />
                </Stack>
                <Stack center pad w="256px">
                  <small>At:</small>
                  <Container summarize oneline>02:02 29/04/2023</Container>
                </Stack>
                <Stack center pad w="256px">
                  <small>To:</small>
                  <Person name="Me" />
                </Stack>
                <Container fill />
                <Container pad>
                  <ChevronDown block />
                </Container>
              </Stack>
              <Container surface>
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
            </RelatedStack>
          </Container>
          <RelatedStack uncollapsable>
            <Stack surface>
              <Reply block />
              <ChevronDown block />
            </Stack>
            <Container surface fill>Reply...</Container>
            <Container surface>
              <Send block />
            </Container>
          </RelatedStack>
        </Stack>
      </main>
    </AppContext.Provider>
  );
}

export function getServerSideProps() {
  return {
    props: {
      domain: {
        name: `immjs.dev`,
        imgSrc: `https://picsum.photos/200/200?r=${Math.random()}`,
      },
      subdomains: [
        {
          id: 0xfe364d53deef63,
          name: 'immjs.dev',
          imgSrc: `https://picsum.photos/200/200?r=${Math.random()}`,
          addresses: [
            {
              id: 0xfef45efdc0284d03e,
              name: 'immjs',
              imgSrc: `https://picsum.photos/200/200?r=${Math.random()}`,
              folders: [
                {
                  name: 'Inbox',
                  mailsMeta: [
                    {
                      sender: 'Jonathan Joe',
                      subject: 'DMCA or stuff',
                      sendDate: Date.now(),
                    },
                    {
                      sender: 'Dad',
                      subject: 'Disappointment...',
                      sendDate: Date.now(),
                    },
                    {
                      sender: 'Mom',
                      subject: 'Failure!',
                      sendDate: Date.now(),
                    },
                  ],
                },
                {
                  name: 'Sent',
                  mailsMeta: [],
                },
                {
                  name: 'Spam',
                  mailsMeta: [],
                },
                {
                  name: 'Deleted',
                  mailsMeta: [],
                },
              ],
            },
            {
              id: 0xfef45efdc0284d03e,
              name: 'personal',
              imgSrc: `https://picsum.photos/200/200?r=${Math.random()}`,
              folders: [
                {
                  name: 'Inbox',
                  mailsMeta: [],
                },
                {
                  name: 'Sent',
                  mailsMeta: [],
                },
                {
                  name: 'Spam',
                  mailsMeta: [],
                },
                {
                  name: 'Deleted',
                  mailsMeta: [],
                },
              ],
            },
            {
              id: 0xfef45efdc0284d03e,
              name: 'work',
              imgSrc: `https://picsum.photos/200/200?r=${Math.random()}`,
              folders: [
                {
                  name: 'Inbox',
                  mailsMeta: [],
                },
                {
                  name: 'Sent',
                  mailsMeta: [],
                },
                {
                  name: 'Spam',
                  mailsMeta: [],
                },
                {
                  name: 'Deleted',
                  mailsMeta: [],
                },
              ],
            },
          ],
        },
        {
          id: 0xfe364d53deef63,
          name: 'social.immjs.dev',
          imgSrc: `https://picsum.photos/200/200?r=${Math.random()}`,
          addresses: [
            {
              id: 0xfef45efdc0284d03e,
              name: 'twitter',
              imgSrc: `https://picsum.photos/200/200?r=${Math.random()}`,
              folders: [
                {
                  name: 'Inbox',
                  mailsMeta: [
                    {
                      sender: 'Twitter',
                      subject: 'Some subject',
                      sendDate: Date.now(),
                    },
                    {
                      sender: 'Twitter',
                      subject: 'Some subject',
                      sendDate: Date.now(),
                    },
                    {
                      sender: 'Twitter',
                      subject: 'Some subject',
                      sendDate: Date.now(),
                    },
                  ],
                },
                {
                  name: 'Sent',
                  mailsMeta: [],
                },
                {
                  name: 'Spam',
                  mailsMeta: [],
                },
                {
                  name: 'Deleted',
                  mailsMeta: [],
                },
              ],
            },
            {
              id: 0xfef45efdc0284d03e,
              name: 'slack',
              imgSrc: `https://picsum.photos/200/200?r=${Math.random()}`,
              folders: [
                {
                  name: 'Inbox',
                  mailsMeta: [],
                },
                {
                  name: 'Sent',
                  mailsMeta: [],
                },
                {
                  name: 'Spam',
                  mailsMeta: [],
                },
                {
                  name: 'Deleted',
                  mailsMeta: [],
                },
              ],
            },
            {
              id: 0xfef45efdc0284d03e,
              name: 'discord',
              imgSrc: `https://picsum.photos/200/200?r=${Math.random()}`,
              folders: [
                {
                  name: 'Inbox',
                  mailsMeta: [],
                },
                {
                  name: 'Sent',
                  mailsMeta: [],
                },
                {
                  name: 'Spam',
                  mailsMeta: [],
                },
                {
                  name: 'Deleted',
                  mailsMeta: [],
                },
              ],
            },
          ],
        },
      ],
      lastToggledSubdomains: [0],
      lastSelectedAddress: [0, 0, 0],
    }
  };
}
