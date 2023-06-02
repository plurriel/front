'use client';

// PLEASE FIX SOON!!

import React, { useEffect, useMemo, useState } from 'react';
import { getCookie, setCookie } from 'cookies-next';
import styles from '@/styles/domain.module.css';
import { DomainRow } from '@/components/domain/DomainRow';
import { MailsRow } from '@/components/domain/MailsRow';
import { MailRow } from '@/components/domain/MailRow';
import { AppContext } from '@/components/domain/AppContext';
import { Stack } from '@/components/Layout';
import { TopBar } from '@/components/domain/TopBar';
import { prisma } from '@/lib/prisma';
import { getLogin } from './api/login';

export default function Home({
  subdomains,
  addresses,
  folders,
  mails,
  convos,
  lastToggled,
  selectedAddress,
  domain,
}) {
  const subdomainsState = useState(subdomains);
  const addressesState = useState(addresses);
  const foldersState = useState(folders);
  const mailsState = useState(mails);
  const convosState = useState(
    Object.fromEntries(
      Object.entries(convos)
        .map(([k, convo]) => [k, { ...convo, latest: new Date(convo.latest) }]),
    ),
  );
  const toggledSubdomainsState = useState(new Set(lastToggled));
  const selectedAddressState = useState(selectedAddress);
  const viewedAddressState = useState(selectedAddress);
  const selectedConvoState = useState(null);
  const currentFirstPaneState = useState(selectedAddress ? 1 : 0);

  useEffect(() => setCookie('selected', selectedAddressState[0]?.join(',')), [selectedAddressState]);

  const providerData = useMemo(() => ({
    domain,
    subdomains: subdomainsState,
    addresses: addressesState,
    folders: foldersState,
    mails: mailsState,
    convos: convosState,
    toggledSubdomains: toggledSubdomainsState,
    viewedAddress: viewedAddressState,
    selectedAddress: selectedAddressState,
    selectedConvo: selectedConvoState,
    currentFirstPane: currentFirstPaneState,
  }), [
    domain,
    subdomainsState,
    addressesState,
    foldersState,
    mailsState,
    convosState,
    toggledSubdomainsState,
    viewedAddressState,
    selectedAddressState,
    selectedConvoState,
    currentFirstPaneState,
  ]);

  return (
    <AppContext.Provider value={providerData}>
      <Stack col customClasses={[styles.page]}>
        <TopBar customClasses={[styles.topbar]} />
        <Stack
          customClasses={[
            [
              styles.require_first,
              styles.require_second,
              styles.require_third,
            ][currentFirstPaneState[0]],
            styles.main,
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

export async function getServerSideProps({ req, res, params }) {
  if (!params.domain.includes('.')) return { notFound: true };
  if (await getLogin({ req, res }) instanceof Error) {
    console.log(await getLogin({ req, res }));
    return {
      redirect: {
        permanent: false,
        destination: `/login?then=${encodeURIComponent(req.url)}`,
      },
    };
  }
  const result = {
    subdomains: {},
    addresses: {},
    folders: {},
    mails: {},
    convos: {},
  };
  const domain = await prisma.domain.findFirst({
    where: {
      name: params.domain,
    },
    include: {
      subdomains: {
        include: {
          addresses: {
            include: {
              folders: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      },
    },
  });

  if (!domain) return { notFound: true };

  domain.subdomains = domain.subdomains.map((subdomain) => {
    subdomain.addresses = subdomain.addresses.map((address) => {
      address.folders = address.folders.map((folder) => {
        result.folders[folder.id] = folder;
        return folder.id;
      });
      result.addresses[address.id] = address;
      return address.id;
    });
    result.subdomains[subdomain.id] = subdomain;
    return subdomain.id;
  });

  result.lastToggled = getCookie('last_toggled', { req, res }) || domain.subdomains;
  result.domain = domain;
  const selected = getCookie('selected', { req, res })?.split(',');
  if (selected && selected.length === 3) {
    result.selectedAddress = selected;
    const [, , selFolder] = selected;
    const folderContents = await prisma.folder.findUnique({
      where: {
        id: selFolder,
      },
      select: {
        convos: true,
      },
    });
    if (folderContents) {
      folderContents.convos.forEach((convo) => {
        // Dirty hack....
        result.convos[convo.id] = {
          ...convo,
          latest: convo.latest.getDate(),
        };
      });
    } else {
      setCookie('selected', null, { req, res });
    }
  }
  return { props: result };
}
