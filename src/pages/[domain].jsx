"use client"; // PLEASE FIX SOON!!

import styles from "@/styles/domain.module.css";
import { useState } from "react";
import { DomainRow } from "@/components/domain/DomainRow";
import { MailsRow } from "@/components/domain/MailsRow";
import { MailRow } from "@/components/domain/MailRow";
import { AppContext } from "@/components/domain/AppContext";
import cls from "clsx";
import { Stack } from "@/components/Layout";
import { TopBar } from "@/components/domain/TopBar";

export default function Home(props) {
  const [subdomains, setSubdomains] = useState(props.subdomains);
  const [addresses, setAddresses] = useState(props.addresses);
  const [folders, setFolders] = useState(props.folders);
  const [mails, setMails] = useState(props.mails);
  const [toggledSubdomains, setToggledSubdomains] = useState(new Set(props.lastToggledSubdomains));
  const [selectedAddress, setSelectedAddress] = useState(props.lastSelectedAddress);
  const [viewedAddress, setViewedAddress] = useState(selectedAddress);
  const [selectedMail, setSelectedMail] = useState(null);
  const [contents, setContents] = useState(props.contents);
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
      contents: [contents, setContents],
      currentFirstPane: [currentFirstPane, setCurrentFirstPane],
    }}>
      <Stack col customClasses={[styles.page]}>
        <TopBar customClasses={[styles.topbar]} />
        <Stack
          customClasses={[
            [styles.require_first, styles.require_second, styles.require_third][currentFirstPane],
            styles.main
          ]}
          fill
        >
          <DomainRow customClasses={[styles.address]} subdomains={subdomains} />
          <MailsRow customClasses={[styles.mails]} />
          <MailRow customClasses={[styles.mail]} />
        </Stack>
      </Stack>
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
          interlocutor: 'Jonathan Joe',
          subject: 'DMCA or stuff',
          sendDate: Date.now(),
          contents: [
            'npe13b2ggujxhubpfqaoww41',
            'ypkxsrgro6il3jm4xxzw4w52',
          ],
        },
        'bob8zsej74zyvhogg7x9upwj': {
          interlocutor: 'Dad',
          subject: 'Disappointment...',
          sendDate: Date.now(),
          contents: [
            'kwhi87wxxboh734gtpoln0zg'
          ],
        },
        'bpzwiuc0lhcni0k1bku7nfi5': {
          interlocutor: 'Mom',
          subject: 'Failure!',
          sendDate: Date.now(),
          contents: [
            'jogt4r8tp2rbi8ppzj4ly3ft'
          ],
        },
        'llhpljzx5qugr96roa6d038u': {
          interlocutor: 'Twitter',
          subject: 'Some subject',
          sendDate: Date.now(),
          contents: [
            'jfpstmw66mpuegueinwcla3k'
          ],
        },
        'fvkbzs3429hii02iu2xpm33c': {
          interlocutor: 'Twitter',
          subject: 'Some subject',
          sendDate: Date.now(),
          contents: [
            'bmlcnss53sgxnk6ioy0w83ou'
          ],
        },
        'ih5vzpt13v20nv7gxydm1qlo': {
          interlocutor: 'Twitter',
          subject: 'Some subject',
          sendDate: Date.now(),
          contents: [
            'lifgptlld8z8f9qj2bwdwpad'
          ],
        },
      },
      contents: {
        'npe13b2ggujxhubpfqaoww41': {
          sender: 'Jonathan Joe',
          senderEmail: 'jojo@gmail.com',
          receiver: 'Me',
          receiverEmail: 'immjs@immjs.dev',
          sendDate: Date.now() - 1000 * 60 * 60 * 24,
          content: `Hello immjs,<br/>
          <br/>
I am reaching out to you with regards to the license of your code and works, and to make an enquiry under the Digital Millennium Copyright Act (DMCA).<br/>
We have reason to believe that your code and works may be infringing upon the intellectual property rights of our client. Specifically, we have found that your code bears a striking resemblance to certain proprietary code that our client owns.<br/>
<br/>
We are therefore requesting that you provide us with information regarding the license under which you are using and distributing your code and works. We also ask that you provide us with any and all documentation related to the creation, distribution, and use of your code and works.<br/>
<br/>
Furthermore, we are submitting this email as an official DMCA enquiry under the Digital Millennium Copyright Act, which allows us to request that your website or other online platform take down any infringing content.<br/>
<br/>
We strongly advise that you take this matter seriously and respond promptly with the requested information. Failure to do so may result in legal action being taken against you.<br/>
<br/>
Thank you for your attention to this matter.<br/>
Sincerely,<br/>
Jonathan Joe`,
        },
        'ypkxsrgro6il3jm4xxzw4w52': {
          sender: 'gb7lxmvtt4dvs5vok321dp7w',
          senderEmail: 'gb7lxmvtt4dvs5vok321dp7w',
          receiver: 'uoiiuf7int3af7bxat24trux',
          sendDate: Date.now() - 1000 * 60 * 60,
          content: `Hello Jonathan Joe,<br/>
<br/>
If you have any concerns, please talk to my lawyer over at lawyer@immjs,dev<br/>
<br/>
Thank you for your understanding,<br/>
Jerome Wang`,
        },
        'kwhi87wxxboh734gtpoln0zg': {
          sender: 'Dad',
          senderEmail: 'dad@gmail.com',
        }
      },
      people: {
        '': {
          
        },
      },
      lastToggledSubdomains: ['kw49xov8icsjcvhy25ofhoqx'],
      lastSelectedAddress: ['kw49xov8icsjcvhy25ofhoqx', 'w1npqwtqnxdvxev31p20z3in', 'g2k9m1iu5imi1d2b9ax0xtyx'],
    }
  };
}
