"use client"; // PLEASE FIX SOON!!

import styles from "@/styles/domain.module.css";
import { useState } from "react";
import { DomainRow } from "@/components/domain/DomainRow";
import { MailsRow } from "@/components/domain/MailsRow";
import { MailRow } from "@/components/domain/MailRow";
import { AppContext } from "@/components/domain/AppContext";
import cls from "clsx";

export default function Home(props) {
  const [subdomains, setSubdomains] = useState(props.subdomains);
  const [addresses, setAddresses] = useState(props.addresses);
  const [folders, setFolders] = useState(props.folders);
  const [mails, setMails] = useState(props.mails);
  const [toggledSubdomains, setToggledSubdomains] = useState(new Set(props.lastToggledSubdomains));
  const [selectedAddress, setSelectedAddress] = useState(props.lastSelectedAddress);
  const [viewedAddress, setViewedAddress] = useState(selectedAddress);
  const [selectedMail, setSelectedMail] = useState(null);
  const [currentFirstPane, setCurrentFirstPane] = useState(1);

  return (
    <AppContext.Provider value={{
      domain: props.domain,
      subdomains: [subdomains, setSubdomains],
      addresses: [addresses, setAddresses],
      folders: [folders, setFolders],
      mails: [mails, setMails],
      toggledSubdomains: [toggledSubdomains, setToggledSubdomains],
      viewedAddress: [viewedAddress, setViewedAddress],
      selectedAddress: [selectedAddress, setSelectedAddress],
      selectedMail: [selectedMail, setSelectedMail],
      currentFirstPane: [currentFirstPane, setCurrentFirstPane],
    }}>
      <main className={cls([
        [styles.first_is_first, styles.first_is_second, styles.first_is_third][currentFirstPane],
        styles.main
      ])}>
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
          mails: [
            'ycn6i3u84uq86yhghygf9749',
            'bob8zsej74zyvhogg7x9upwj',
            'bpzwiuc0lhcni0k1bku7nfi5',
          ],
        },
        'zkbl4x0ci61iw9nh4qko5bmf': {
          name: 'Sent',
          mails: [],
        },
        'kiwvee43k90locbqxvetut6e': {
          name: 'Spam',
          mails: [],
        },
        'i9gvgl62gej58m1vbw5rn7ij': {
          name: 'Deleted',
          mails: [],
        },
        'qq0akp6kgl2wk7vwd3dzur58': {
          name: 'Inbox',
          mails: [],
        },
        'yt50k8m5zklqron714zdj4in': {
          name: 'Sent',
          mails: [],
        },
        'wor6tdx85nshnbk8a2kevedd': {
          name: 'Spam',
          mails: [],
        },
        'i5d0jpbdw1vye4l5cl9jmjj7': {
          name: 'Deleted',
          mails: [],
        },
        'bgrs3h6twkm9kjqhx0eov94h': {
          name: 'Inbox',
          mails: null,
        },
        'sqhew32mrlkh7maaqnd8th3m': {
          name: 'Sent',
          mails: [],
        },
        'nmrn3ojqj4suo3nnyrg97rx4': {
          name: 'Spam',
          mails: [],
        },
        'okvu5xc7veli50s5rwsgavm4': {
          name: 'Deleted',
          mails: [],
        },
        'qs2aiv5dbg5x47or1vn3w81k': {
          name: 'Inbox',
          mails: [
            'llhpljzx5qugr96roa6d038u',
            'fvkbzs3429hii02iu2xpm33c',
            'ih5vzpt13v20nv7gxydm1qlo',
          ],
        },
        'd6b26bwgr2ksmc38ss9wl4ia': {
          name: 'Sent',
          mails: [],
        },
        'r0ia3qwkcs75a7fvlu02nubr': {
          name: 'Spam',
          mails: [],
        },
        'o8u8yxkgzx4drt1hk60umzv8': {
          name: 'Deleted',
          mails: [],
        },
        'rj1g3rpv1gypleoai9y5sje6': {
          name: 'Inbox',
          mails: [],
        },
        'a76h18djiilikv7l5vqk4q1o': {
          name: 'Sent',
          mails: [],
        },
        'sy8cal9v0mgxqw3x9sa6y7vx': {
          name: 'Spam',
          mails: [],
        },
        'pz7frksimnahilotg09mkh18': {
          name: 'Deleted',
          mails: [],
        },
        'grpfqeofax87488aohwquy1c': {
          name: 'Inbox',
          mails: [],
        },
        'kbgr6sktktebwxnzeqtpcio3': {
          name: 'Sent',
          mails: [],
        },
        'ckrj3jhnhxlkv695njubbnci': {
          name: 'Spam',
          mails: [],
        },
        'vd16uqkayuyml53ekrtjjype': {
          name: 'Deleted',
          mails: [],
        },
      },
      mails: {
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
