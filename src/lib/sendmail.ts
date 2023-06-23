import cuid2 from '@paralleldrive/cuid2';
import dnsPromises from 'dns/promises';
import dns from 'dns';
import nodemailer from 'nodemailer';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import { prisma } from './prisma';

const nhm = new NodeHtmlMarkdown();

interface Args {
  from: {
    name: string;
    sentFolder: {
      id: string;
    };
    domain: {
      name: string;
      privDkim: string;
    };
  };
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  contents: string;
  inReplyTo: {
    id: string;
    messageId: string;
  };
}

/* eslint-disable no-restricted-syntax */
export async function sendMail({
  from,
  to,
  cc,
  bcc,
  subject,
  contents,
  inReplyTo,
}: Args) {
  const now = new Date();
  const mailId = `c${cuid2.createId()}`;
  const messageId = `<${mailId}@${from.name}>`;
  const mappedToDomain: Record<string, Record<'to' | 'cc' | 'bcc', string[]>> = {};
  const domainsSet: Set<string> = new Set();
  const iterate = (type: 'to' | 'cc' | 'bcc') => (addr: string) => {
    const domain = addr.split('@')[1];
    mappedToDomain[domain] ??= {
      to: [],
      cc: [],
      bcc: [],
    };
    mappedToDomain[domain][type].push(addr);
    domainsSet.add(domain);
  };
  to.forEach(iterate('to'));
  cc.forEach(iterate('cc'));
  bcc.forEach(iterate('bcc'));
  const domains = [...domainsSet];
  const domainssMxesRankedByPriority: [string, dns.MxRecord[]][] = [];
  await Promise.all(domains.map(async (domain) => {
    let allMxes;
    try {
      allMxes = await dnsPromises.resolveMx(domain);
    } catch (err) {
      return false;
    }
    const mxesRankedByPriority = allMxes.sort((a, b) => a.priority - b.priority);
    domainssMxesRankedByPriority.push([domain, mxesRankedByPriority]);
    return true;
  }));

  let convo;
  if (inReplyTo) {
    convo = inReplyTo;
    await prisma.convo.update({
      where: {
        id: convo.id,
      },
      data: {
        latest: now,
      },
    });
  } else {
    convo = await prisma.convo.create({
      data: {
        subject,
        interlocutors: JSON.stringify([from.name, to, cc, bcc]),
        folderId: from.sentFolder.id,
        latest: now,
      },
    });
  }

  const mailInDb = await prisma.mail.create({
    data: {
      inbound: false,
      id: mailId,
      from: from.name,
      to,
      at: now,
      recvDelay: 0,
      subject,
      messageId,
      html: contents,
      inReplyTo: inReplyTo?.id,
      convoId: convo.id,
    },
  });
  const successes = await Promise.all(domainssMxesRankedByPriority.map(async ([domain, mxes]) => {
    for (const mx of mxes) {
      try {
        const transporter = nodemailer.createTransport({
          host: mx.exchange,
          port: 25,
        });

        // eslint-disable-next-line no-await-in-loop
        await transporter.sendMail({
          messageId,
          from: from.name,
          to: to.join(','),
          cc: cc.join(','),
          subject,
          text: nhm.translate(contents),
          inReplyTo: inReplyTo.messageId,
          html: contents,
          envelope: {
            from: from.name,
            ...mappedToDomain[domain],
          },
          dkim: {
            domainName: from.domain.name,
            keySelector: 'plurriel',
            privateKey: from.domain.privDkim,
          },
        });
        return [[domain, mxes], true, mx];
      } catch (err) {
        console.error(err);
      }
    }
    return [[domain, mxes], false, null];
  }));
  return { mailInDb, successes };
}
