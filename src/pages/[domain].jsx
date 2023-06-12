'use client';

// PLEASE FIX SOON!!

import React, { useEffect, useMemo, useState } from 'react';
import { getCookie, setCookie } from 'cookies-next';
import styles from '@/styles/domain.module.css';
import { DomainRow } from '@/components/domain/DomainRow';
import { MailsRow } from '@/components/domain/MailsRow';
import { MailRow } from '@/components/domain/MailRow';
import { AppContext } from '@/components/domain/AppContext';
import { Container, Stack } from '@/components/Layout';
import { TopBar } from '@/components/domain/TopBar';
import { prisma } from '@/lib/prisma';
import { getLogin } from '@/lib/login_not_edge';
import { hasPermissionsWithin } from '@/lib/authorization';

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      await window.Notification.requestPermission();
      await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      return true;
    } catch (error) {
      return false;
    }
  } else {
    return false;
  }
}

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
  useEffect(() => {
    registerServiceWorker();
  }, []);
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

  useEffect(() => {
    setCookie('selected', selectedAddressState[0]?.join(','), { path: `/${domain.name}` });
  }, [domain, selectedAddressState]);

  useEffect(() => {
    setCookie('last_toggled', [...toggledSubdomainsState[0]]?.join(','), { path: `/${domain.name}` });
  }, [domain, toggledSubdomainsState]);

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
      <Container id={styles.reply_bar_tools} surface />
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
  const user = await getLogin({ req, res });
  if (user instanceof Error) {
    console.log(user);
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
      },
    },
  });

  if (!domain) return { notFound: true };

  const permissionsWithinTree = await hasPermissionsWithin(['domain', domain.id], ['view'], user.id);
  if (!permissionsWithinTree.value) {
    return { notFound: true };
  }

  console.log(JSON.stringify(permissionsWithinTree, null, '\t'));

  domain.subdomains = domain.subdomains
    .filter((subdomain) => permissionsWithinTree.get(subdomain.id).value)
    .map((subdomain) => {
      const permissionSubdomainTree = permissionsWithinTree.get(subdomain.id);
      subdomain.addresses = subdomain.addresses
        .filter((address) => permissionSubdomainTree.get(address.id).value)
        .map((address) => {
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

  result.lastToggled = getCookie('last_toggled', { req, res })?.split(',').filter((v) => domain.subdomains.includes(v)) || domain.subdomains;
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
        convos: {
          orderBy: {
            latest: 'desc',
          },
        },
      },
    });
    if (folderContents) {
      result.folders[selFolder].convos = folderContents.convos.map((convo) => {
        // Dirty hack....
        result.convos[convo.id] = {
          ...convo,
          latest: convo.latest.getTime(),
        };
        return convo.id;
      });
    } else {
      setCookie('selected', '', { req, res, path: `/${params.domain}` });
      result.selectedAddress = null;
    }
  }
  return { props: result };
}
