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
import { getLogin } from '@/lib/login_not_edge';
import { hasPermissions, hasPermissionsWithin } from '@/lib/authorization';
import { prisma } from '@/lib/prisma';
import { getFolderName } from '@/lib/utils';

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
  selectedConvo,
  requestedMail,
  requestedSubdomain,
}) {
  useEffect(() => {
    registerServiceWorker();
  }, []);
  const subdomainsState = useState(subdomains);
  const addressesState = useState(addresses);
  const foldersState = useState(folders);
  const mailsState = useState(mails);
  const composingState = useState(false);
  const convosState = useState(
    Object.fromEntries(
      Object.entries(convos)
        .map(([k, convo]) => [k, { ...convo, latest: new Date(convo.latest) }]),
    ),
  );
  const toggledSubdomainsState = useState(new Set(lastToggled));
  const selectedAddressState = useState(selectedAddress);
  const viewedAddressState = useState(selectedAddress);
  const selectedConvoState = useState(selectedConvo);
  const currentFirstPaneState = useState(!!selectedConvo + !!selectedAddress);
  const requestedMailState = useState(requestedMail);
  const requestedSubdomainState = useState(requestedSubdomain);

  useEffect(() => {
    setCookie('selected', selectedAddressState[0]?.join(','), { path: `/${domain.name}` });
  }, [domain, selectedAddressState]);

  useEffect(() => {
    setCookie('last_toggled', [...toggledSubdomainsState[0]]?.join(','), { path: `/${domain.name}` });
  }, [domain, toggledSubdomainsState]);

  const [BundledEditor, setBundledEditor] = useState(() => () => false);

  useEffect(() => {
    (async () => {
      const newValue = (await import('@/components/BundledEditor')).default;
      console.log(newValue);
      setBundledEditor(() => newValue);
    })();
  }, [setBundledEditor]);

  function scrollToAndExpandSubdomain(subdomainId) {
    requestedSubdomainState[1](subdomainId);

    currentFirstPaneState[1](0);

    const newToggledSubdomains = new Set(toggledSubdomainsState[0]);
    newToggledSubdomains.add(subdomainId);
    toggledSubdomainsState[1](newToggledSubdomains);
  }

  function scrollToAndViewMail(convoId, mailId) {
    selectedConvoState[1](convoId);
    currentFirstPaneState[1](2);

    requestedMailState[1](mailId);
  }

  useEffect(() => {
    console.log('aaa');
    const listener = async () => {
      const urlParse = window.location.pathname.match(/^\/(?:((?:[A-z!#$%&'*+\-/=?^_`{|}~]+\.)*[A-z!#$%&'*+\-/=?^_`{|}~]+)@)?((?:[A-z0-9-]+\.)+[A-z0-9-]+)(?:\/([^/]+)(?:\/(c[0-9A-z]{24}))?)?\/?$/);
      console.log(urlParse, window.location);
      if (!urlParse) return window.location.reload();
      const [, pathLocalName, pathSubdomainName, pathFolderName, pathMailId] = urlParse;
      const pathSubdomain = Object.values(subdomainsState[0])
        .find((subdomain) => subdomain.name === pathSubdomainName);

      if (!pathSubdomain) throw new Error('No such pathSubdomain');

      const pathAddressId = pathSubdomain
        .addresses
        .find((addressId) => addressesState[0][addressId].name === `${pathLocalName}@${pathSubdomainName}`);

      if (pathAddressId) {
        const pathAddress = addressesState[0][pathAddressId];
        let pathFolderId;
        if (pathFolderName) {
          pathFolderId = pathAddress.folders
            .find((folderId) => getFolderName(foldersState[0][folderId]) === pathFolderName);

          if (!pathFolderId) {
            pathFolderId = pathAddress.folders
              .find((folderId) => getFolderName(foldersState[0][folderId]).toLowerCase()
                === pathFolderName.toLowerCase());
          }
        }
        if (!pathFolderId) {
          pathFolderId = pathAddress
            .folders
            .find((folderId) => getFolderName(foldersState[0][folderId]) === 'Inbox');
        }
        selectedAddressState[1]([pathSubdomain.id, pathAddressId, pathFolderId]);

        if (pathMailId) {
          // Either convo or mail
          const pathMail = mailsState[0][pathMailId];

          if (pathMail) {
            scrollToAndViewMail(pathMail.convoId, pathMailId);
          } else {
            selectedConvoState[1](pathMailId);
          }
        }
      } else {
        if (pathLocalName) window.history.pushState({}, '', `/${pathSubdomainName}`);
        scrollToAndExpandSubdomain(pathSubdomain.id);
      }
      return true;
    };
    window.addEventListener('popstate', listener);
    return () => window.removeEventListener('popstate', listener);
  }, []);

  const providerData = useMemo(() => ({
    domain,
    subdomains: subdomainsState,
    addresses: addressesState,
    composing: composingState,
    folders: foldersState,
    mails: mailsState,
    convos: convosState,
    toggledSubdomains: toggledSubdomainsState,
    viewedAddress: viewedAddressState,
    selectedAddress: selectedAddressState,
    selectedConvo: selectedConvoState,
    currentFirstPane: currentFirstPaneState,
    requestedMail: requestedMailState,
    requestedSubdomain: requestedSubdomainState,
    BundledEditor,
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
    composingState,
    requestedMailState,
    requestedSubdomainState,
    BundledEditor,
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

export const getServerSideProps = async function getServerSideProps({
  req,
  res,
  params,
}) {
  const emailRegex = /^(?:((?:[A-z!#$%&'*+\-/=?^_`{|}~]+\.)*[A-z!#$%&'*+\-/=?^_`{|}~]+)@)?((?:[A-z0-9-]+\.)+[A-z0-9-]+)$/;
  const matchResults = params.email.match(emailRegex);

  if (!matchResults) return { notFound: true };

  const [urlSelectedAddress, urlSelectedLocal, subdomainName] = matchResults;

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
  const urlSubdomain = await prisma.subdomain.findFirst({
    where: {
      name: subdomainName,
    },
    select: {
      id: true,
      domain: {
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
      },
    },
  });

  if (!urlSubdomain) return { notFound: true };

  const { domain, id: urlSubdomainId } = urlSubdomain;

  const result = {
    subdomains: {},
    addresses: {},
    folders: {},
    mails: {},
    convos: {},
    domain,
    urlSubdomainId,
  };

  if (subdomainName !== domain.name) {
    result.requestedSubdomain = urlSubdomainId;
  }

  const permissionsWithinTree = await hasPermissionsWithin(['domain', domain.id], ['view'], user.id);
  if (!permissionsWithinTree.value) {
    return { notFound: true };
  }

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

  if (urlSelectedLocal) {
    const selectedAddress = await prisma.address.findUnique({
      where: {
        name: urlSelectedAddress,
      },
    });
    if (!selectedAddress || !(await hasPermissions(['address', selectedAddress.id], ['view'], user.id))) {
      return {
        redirect: {
          permanent: false,
          destination: `/${subdomainName}`,
        },
      };
    }

    let folderType = 'Inbox';
    let folderName = '';
    if (params.folder) {
      const isFolderType = ['Inbox', 'Sent', 'Drafts', 'Spam', 'Deleted'].includes(params.folder);
      folderType = isFolderType ? params.folder : 'Other';
      folderName = isFolderType ? '' : params.folder;
    }
    const selectedFolder = await prisma.folder.findUnique({
      where: {
        name_type_addressId: {
          name: folderName,
          type: folderType,
          addressId: selectedAddress.id,
        },
      },
      select: {
        id: true,
        convos: {
          orderBy: {
            latest: 'desc',
          },
        },
      },
    });
    if (!selectedFolder) {
      return {
        redirect: {
          permanent: false,
          destination: params.mail ? `/${urlSelectedAddress}/Inbox/${params.mail}` : `/${urlSelectedAddress}`,
        },
      };
    }

    result.selectedAddress = [urlSubdomainId, selectedAddress.id, selectedFolder.id];
    result.folders[selectedFolder.id].convos = selectedFolder.convos.map((convo) => {
      // Dirty hack....
      result.convos[convo.id] = {
        ...convo,
        latest: convo.latest.getTime(),
      };
      return convo.id;
    });

    if (params.mail) {
      if (!params.mail.match(/c[a-z0-9]{24}/g)) {
        return {
          redirect: {
            permanent: false,
            destination: `/${urlSelectedLocal}/${params.folder}`,
          },
        };
      }
      const mail = await prisma.mail.findUnique({
        where: { id: params.mail },
        select: { convo: { include: { mails: true } } },
      });
      let convo;
      if (mail) {
        result.requestedMail = params.mail;
        convo = mail.convo;
      } else {
        convo = await prisma.convo.findUnique({
          where: { id: params.mail },
          include: { mails: true },
        });
        if (!convo) {
          return {
            redirect: {
              permanent: false,
              destination: `/${urlSelectedLocal}/${params.folder}`,
            },
          };
        }
      }
      result.selectedConvo = convo.id;
      convo.mails = convo.mails.map((convoMail) => {
        convoMail.at = convoMail.at.getTime();
        result.mails[convoMail.id] = convoMail;
        return convoMail.id;
      });
      convo.latest = convo.latest.getTime();
      result.convos[convo.id] = convo;
    }
  } else {
    if (params.folder) {
      return {
        redirect: {
          permanent: false,
          destination: `/${subdomainName}`,
        },
      };
    }

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
  }
  return { props: result };
};
