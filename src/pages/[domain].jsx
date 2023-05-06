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
import { MailRow } from "@/components/domain/MailRow";

const AppContext = createContext({
  subdomains: [],
  addresses: [],
  folders: [],
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
  const [addresses, setAddresses] = useState(props.addresses);
  const [folders, setFolders] = useState(props.folders);
  const [mailsMeta, setMailsMeta] = useState(props.mailsMeta);
  const [toggledSubdomains, setToggledSubdomains] = useState(new Set(props.lastToggledSubdomains));
  const [selectedAddress, setSelectedAddress] = useState(props.lastSelectedAddress);
  const [viewedAddress, setViewedAddress] = useState(selectedAddress);
  const [selectedMail, setSelectedMail] = useState(null);

  return (
    <AppContext.Provider value={{
      domain: props.domain,
      subdomains: [subdomains, setSubdomains],
      addresses: [addresses, setAddresses],
      folders: [folders, setFolders],
      mailsMeta: [mailsMeta, setMailsMeta],
      toggledSubdomains: [toggledSubdomains, setToggledSubdomains],
      viewedAddress: [viewedAddress, setViewedAddress],
      selectedAddress: [selectedAddress, setSelectedAddress],
      selectedMail: [selectedMail, setSelectedMail],
    }}>
      <main className={styles.main}>
        <DomainRow customClasses={[styles.address]} subdomains={subdomains} />
        <MailsRow customClasses={[styles.mails]} />
        <MailRow customClasses={[styles.mail]} />
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
        subdomains: [
          'kw49xov8icsjcvhy25ofhoqx',
          'xi00cx7rphrr4mkybgo4vu12'
        ],
      },
      subdomains: {
        'kw49xov8icsjcvhy25ofhoqx': {
          name: 'immjs.dev',
          imgSrc: `https://picsum.photos/200/200?r=${Math.random()}`,
          addresses: [
            'w1npqwtqnxdvxev31p20z3in',
            'oplvkbji7w7nu3fl8rw8zh5w',
            'tj8ia4w74lpr0h27256hzglw',
          ],
        },
        'xi00cx7rphrr4mkybgo4vu12': {
          name: 'social.immjs.dev',
          imgSrc: `https://picsum.photos/200/200?r=${Math.random()}`,
          addresses: [
            'ipuoo4fr2y0a6l5ofbw6vwe8',
            'p9wug7y0uqschxcdkaes0gpf',
            'bfa0wouqehrjdxb43a5tik2u',
          ],
        },
      },
      addresses: {
        'w1npqwtqnxdvxev31p20z3in': {
          name: 'immjs',
          imgSrc: `https://picsum.photos/200/200?r=${Math.random()}`,
          folders: [
            'g2k9m1iu5imi1d2b9ax0xtyx',
            'zkbl4x0ci61iw9nh4qko5bmf',
            'kiwvee43k90locbqxvetut6e',
            'i9gvgl62gej58m1vbw5rn7ij',
          ],
        },
        'oplvkbji7w7nu3fl8rw8zh5w': {
          name: 'personal',
          imgSrc: `https://picsum.photos/200/200?r=${Math.random()}`,
          folders: [
            'qq0akp6kgl2wk7vwd3dzur58',
            'yt50k8m5zklqron714zdj4in',
            'wor6tdx85nshnbk8a2kevedd',
            'i5d0jpbdw1vye4l5cl9jmjj7',
          ],
        },
        'tj8ia4w74lpr0h27256hzglw': {
          name: 'work',
          imgSrc: `https://picsum.photos/200/200?r=${Math.random()}`,
          folders: [
            'bgrs3h6twkm9kjqhx0eov94h',
            'sqhew32mrlkh7maaqnd8th3m',
            'nmrn3ojqj4suo3nnyrg97rx4',
            'okvu5xc7veli50s5rwsgavm4',
          ],
        },
        'ipuoo4fr2y0a6l5ofbw6vwe8': {
          name: 'twitter',
          imgSrc: `https://picsum.photos/200/200?r=${Math.random()}`,
          folders: [
            'qs2aiv5dbg5x47or1vn3w81k',
            'd6b26bwgr2ksmc38ss9wl4ia',
            'r0ia3qwkcs75a7fvlu02nubr',
            'o8u8yxkgzx4drt1hk60umzv8',
          ],
        },
        'p9wug7y0uqschxcdkaes0gpf': {
          name: 'slack',
          imgSrc: `https://picsum.photos/200/200?r=${Math.random()}`,
          folders: [
            'rj1g3rpv1gypleoai9y5sje6',
            'a76h18djiilikv7l5vqk4q1o',
            'sy8cal9v0mgxqw3x9sa6y7vx',
            'pz7frksimnahilotg09mkh18',
          ],
        },
        'bfa0wouqehrjdxb43a5tik2u': {
          name: 'discord',
          imgSrc: `https://picsum.photos/200/200?r=${Math.random()}`,
          folders: [
            'grpfqeofax87488aohwquy1c',
            'kbgr6sktktebwxnzeqtpcio3',
            'ckrj3jhnhxlkv695njubbnci',
            'vd16uqkayuyml53ekrtjjype',
          ],
        },
      },
      folders: {
        'g2k9m1iu5imi1d2b9ax0xtyx': {
          name: 'Inbox',
          mailsMeta: [
            'ycn6i3u84uq86yhghygf9749',
            'bob8zsej74zyvhogg7x9upwj',
            'bpzwiuc0lhcni0k1bku7nfi5',
          ],
        },
        'zkbl4x0ci61iw9nh4qko5bmf': {
          name: 'Sent',
          mailsMeta: [],
        },
        'kiwvee43k90locbqxvetut6e': {
          name: 'Spam',
          mailsMeta: [],
        },
        'i9gvgl62gej58m1vbw5rn7ij': {
          name: 'Deleted',
          mailsMeta: [],
        },
        'qq0akp6kgl2wk7vwd3dzur58': {
          name: 'Inbox',
          mailsMeta: [],
        },
        'yt50k8m5zklqron714zdj4in': {
          name: 'Sent',
          mailsMeta: [],
        },
        'wor6tdx85nshnbk8a2kevedd': {
          name: 'Spam',
          mailsMeta: [],
        },
        'i5d0jpbdw1vye4l5cl9jmjj7': {
          name: 'Deleted',
          mailsMeta: [],
        },
        'bgrs3h6twkm9kjqhx0eov94h': {
          name: 'Inbox',
          mailsMeta: null,
        },
        'sqhew32mrlkh7maaqnd8th3m': {
          name: 'Sent',
          mailsMeta: [],
        },
        'nmrn3ojqj4suo3nnyrg97rx4': {
          name: 'Spam',
          mailsMeta: [],
        },
        'okvu5xc7veli50s5rwsgavm4': {
          name: 'Deleted',
          mailsMeta: [],
        },
        'qs2aiv5dbg5x47or1vn3w81k': {
          name: 'Inbox',
          mailsMeta: [
            'llhpljzx5qugr96roa6d038u',
            'fvkbzs3429hii02iu2xpm33c',
            'ih5vzpt13v20nv7gxydm1qlo',
          ],
        },
        'd6b26bwgr2ksmc38ss9wl4ia': {
          name: 'Sent',
          mailsMeta: [],
        },
        'r0ia3qwkcs75a7fvlu02nubr': {
          name: 'Spam',
          mailsMeta: [],
        },
        'o8u8yxkgzx4drt1hk60umzv8': {
          name: 'Deleted',
          mailsMeta: [],
        },
        'rj1g3rpv1gypleoai9y5sje6': {
          name: 'Inbox',
          mailsMeta: [],
        },
        'a76h18djiilikv7l5vqk4q1o': {
          name: 'Sent',
          mailsMeta: [],
        },
        'sy8cal9v0mgxqw3x9sa6y7vx': {
          name: 'Spam',
          mailsMeta: [],
        },
        'pz7frksimnahilotg09mkh18': {
          name: 'Deleted',
          mailsMeta: [],
        },
        'grpfqeofax87488aohwquy1c': {
          name: 'Inbox',
          mailsMeta: [],
        },
        'kbgr6sktktebwxnzeqtpcio3': {
          name: 'Sent',
          mailsMeta: [],
        },
        'ckrj3jhnhxlkv695njubbnci': {
          name: 'Spam',
          mailsMeta: [],
        },
        'vd16uqkayuyml53ekrtjjype': {
          name: 'Deleted',
          mailsMeta: [],
        },
      },
      mailsMeta: {
        'ycn6i3u84uq86yhghygf9749': {
          sender: 'Jonathan Joe',
          subject: 'DMCA or stuff',
          sendDate: Date.now(),
        },
        'bob8zsej74zyvhogg7x9upwj': {
          sender: 'Dad',
          subject: 'Disappointment...',
          sendDate: Date.now(),
        },
        'bpzwiuc0lhcni0k1bku7nfi5': {
          sender: 'Mom',
          subject: 'Failure!',
          sendDate: Date.now(),
        },
        'llhpljzx5qugr96roa6d038u': {
          sender: 'Twitter',
          subject: 'Some subject',
          sendDate: Date.now(),
        },
        'fvkbzs3429hii02iu2xpm33c': {
          sender: 'Twitter',
          subject: 'Some subject',
          sendDate: Date.now(),
        },
        'ih5vzpt13v20nv7gxydm1qlo': {
          sender: 'Twitter',
          subject: 'Some subject',
          sendDate: Date.now(),
        },
      },
      lastToggledSubdomains: ['kw49xov8icsjcvhy25ofhoqx'],
      lastSelectedAddress: ['kw49xov8icsjcvhy25ofhoqx', 'w1npqwtqnxdvxev31p20z3in', 'g2k9m1iu5imi1d2b9ax0xtyx'],
    }
  };
}
