import cuid2 from '@paralleldrive/cuid2';
import nodemailer from 'nodemailer';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import dnsPromises from 'dns/promises';
import dns from 'dns';
import { parseDomain, ParseResultType } from 'parse-domain';
import { createPrivateKey } from 'crypto';
// eslint-disable-next-line import/no-extraneous-dependencies
import { MxAnswer, MxData } from '@leichtgewicht/dns-packet';
import { Domain, Folder, Mail } from '@prisma/client';
import { prisma } from './prisma';
import { emailAddrUtils } from './utils';

const nhm = new NodeHtmlMarkdown();

interface Args {
  from: {
    name: string;
    sentFolder: Folder;
    domain: Domain;
  };
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  contents: string;
  inReplyTo?: Mail;
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
  const messageId = `<${mailId}@${from.name.split('@')[1]}>`;
  const mappedToDomain: Record<string, Record<'to' | 'cc' | 'bcc', string[]>> = {};
  const domainsSet: Set<string> = new Set();
  const iterate = (type: 'to' | 'cc' | 'bcc') => (addr: string) => {
    const domain = emailAddrUtils.extractAddress(addr).split('@')[1];
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
  const domainssMxesRankedByPriority: [string, MxData[]][] = [];
  await Promise.all(domains.map(async (domain) => {
    let allMxes;
    try {
      const parseResult = parseDomain(domain);
      console.log(parseResult);
      if (parseResult.type !== ParseResultType.Listed) return false;
      const answers = await dnsPromises.resolveMx(domain);
      console.log(answers);
      if (answers && answers.length) {
        allMxes = answers;
      } else if (parseResult.subDomains.length) {
        console.log(domain.replace(/^[^.]+(?=\.)/g, '*'));
        const answersWildcard = await dnsPromises.resolveMx(domain.replace(/^[^.]+(?=\.)/g, '*'));
        if (answersWildcard && answersWildcard.length) {
          console.log(answersWildcard);
          allMxes = answersWildcard;
        } else return false;
      } else return false;
    } catch (err) {
      console.error('mx fetch unsuccessful', err, domain);
      return false;
    }
    const mxesRankedByPriority = allMxes.sort((a, b) => a.priority - b.priority);
    console.log(allMxes, mxesRankedByPriority);
    domainssMxesRankedByPriority.push([domain, mxesRankedByPriority]);
    return true;
  }));

  console.log(mappedToDomain, domainssMxesRankedByPriority);

  let convoId;
  if (inReplyTo) {
    convoId = inReplyTo.convoId;
    await prisma.convo.update({
      where: {
        id: convoId,
      },
      data: {
        latest: now,
      },
    });
  } else {
    const interlocutors = new Set(
      [...to, ...cc, ...bcc]
        .filter((addressDest) => emailAddrUtils.extractAddress(addressDest) !== from.name),
    );
    convoId = (await prisma.convo.create({
      data: {
        subject,
        interlocutors: [...interlocutors],
        folderId: from.sentFolder.id,
        latest: now,
      },
    })).id;
  }

  const mailInDb = await prisma.mail.create({
    data: {
      inbound: false,
      id: mailId,
      from: from.name,
      to,
      cc,
      bcc,
      at: now,
      recvDelay: 0,
      subject,
      messageId,
      html: contents,
      inReplyTo: inReplyTo?.id,
      unsuccessful: [...to, ...cc, ...bcc],
      convoId,
    },
  });

  const privateKey = createPrivateKey({
    key: from.domain.privDkim,
    format: 'der',
    type: 'pkcs8',
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
          inReplyTo: inReplyTo?.messageId ?? undefined,
          html: contents,
          envelope: {
            from: from.name,
            ...mappedToDomain[domain],
          },
          dkim: {
            domainName: from.domain.name,
            keySelector: 'plurriel',
            privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }) as string,
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
