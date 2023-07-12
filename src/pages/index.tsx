import React from 'react';
import { ClickableContainer, Container, Stack } from '@/components/Layout';
import { getLogin } from '@/lib/login';
import { prisma } from '@/lib/prisma';
import { Domain, Subdomain } from '@prisma/client';
import { GetServerSideProps, NextApiRequest } from 'next';
import Link from 'next/link';
import { Person } from '@/components/PersonCard';

interface BaseLandingProps {
  loggedIn: string | false;
}
interface LoggedInLandingProps extends BaseLandingProps {
  loggedIn: string;
  allAccessibleDomains: Record<string, string>;
}
interface DefaultLandingProps extends BaseLandingProps {
  loggedIn: false;
  allAccessibleDomains: {};
}
type LandingProps = LoggedInLandingProps | DefaultLandingProps;

export default function Landing({
  loggedIn,
  allAccessibleDomains,
}: LoggedInLandingProps | DefaultLandingProps) {
  return (
    <>
      {
        loggedIn && (
          <Stack center h="75%">
            <AllDomainsView domains={allAccessibleDomains} name={loggedIn} />
          </Stack>
        )
      }
      <Stack>
        <h1>Welcome user!</h1>
      </Stack>
    </>
  );
}

function AllDomainsView({ domains, name }: { domains: Record<string, string>, name: string }) {
  console.log(domains);
  return (
    <Stack related col w="256px">
      <Container surface>
        Logged in as
        {' '}
        <b>{name}</b>
      </Container>
      <Stack surface col>
        <Stack col related>
          {Object.entries(domains)
            .map(([k, v]) => (
              <a key={k} href={`/${v}`}>
                <ClickableContainer surface>
                  <Person name={k} />
                </ClickableContainer>
              </a>
            ))}
        </Stack>
      </Stack>
    </Stack>
  );
}

function makeObject<T, U extends string>(arr: U[], producerFn: (v?: any) => T): Record<U, T> {
  return Object.fromEntries(arr.map((v) => [v, producerFn(v)])) as Record<U, T>;
}

async function getAllAuthData(userId: string, requestedPerms: string[]) {
  const requestedPermsObject = makeObject(requestedPerms, () => true);
  const includeRequestedPerms = makeObject(requestedPerms, () => true);
  const usersLinkQuery = { some: { ...requestedPermsObject, userId } };
  console.log(usersLinkQuery);
  const domains = await prisma.domain.findMany({
    where: {
      usersLink: usersLinkQuery,
    },
    include: { usersLink: { select: includeRequestedPerms } },
  });
  const subdomains = await prisma.subdomain.findMany({
    where: {
      usersLink: usersLinkQuery,
    },
    include: {
      usersLink: { select: includeRequestedPerms },
      domain: true,
    },
  });
  const addresses = await prisma.address.findMany({
    where: {
      usersLink: usersLinkQuery,
    },
    include: {
      usersLink: { select: includeRequestedPerms },
      subdomain: {
        include: { domain: true },
      },
    },
  });
  return { domains, subdomains, addresses };
}

export const getServerSideProps: GetServerSideProps = async function getServerSideProps({ req, res }) {
  const user = await getLogin(req as NextApiRequest);
  if (user instanceof Error) {
    return {
      props: {
        loggedIn: false,
      },
    };
  }
  const userScopes = await getAllAuthData(user.id, ['view']);
  // const domainAccessor = (v: Domain) => v;
  // const subdomainAccessor = (v: { domain: Domain }) => v.domain;
  // const addressAccessor = (v: { subdomain: { domain: Domain } }) => v.subdomain.domain;
  // // type ListPlusAccessor = [T extends any ? infer T : never, (k: T) => Domain];
  // type ListPlusAccessor =
  // const listsPlusAccessors = [
  //   [userScopes.domains, domainAccessor],
  //   [userScopes.subdomains, subdomainAccessor],
  //   [userScopes.addresses, addressAccessor],
  // ] as ListPlusAccessor[];
  // const allAccessibleDomains = {};
  // listsPlusAccessors.forEach(([targets, accessor]) => {
  //   targets.forEach((target) => {
  //     const domain = accessor(target);
  //   });
  // });
  // Stupid TypeScript T - T

  const allAccessibleDomains: Record<string, string> = {};

  userScopes.domains.forEach((domain) => {
    allAccessibleDomains[domain.name] ??= domain.name;
  });
  let singleDomains: Record<string, boolean> = {};
  userScopes.subdomains.forEach((subdomain) => {
    singleDomains[subdomain.domain.id] = singleDomains[subdomain.domain.id] == null;
  });
  userScopes.subdomains.forEach((subdomain) => {
    if (!singleDomains[subdomain.domain.id]) {
      allAccessibleDomains[subdomain.domain.name] ??= subdomain.name;
    } else {
      allAccessibleDomains[subdomain.domain.name] ??= subdomain.domain.name;
    }
  });
  singleDomains = {};
  const singleSubdomains: Record<string, boolean> = {};
  userScopes.addresses.forEach((address) => {
    singleDomains[address.subdomain.domain.id] = singleDomains[address.subdomain.domain.id] == null;
    singleSubdomains[address.subdomain.id] = singleSubdomains[address.subdomain.id] == null;
  });
  userScopes.addresses.forEach((address) => {
    if (!singleDomains[address.subdomain.domain.id]) {
      allAccessibleDomains[address.subdomain.domain.name] ??= address.subdomain.domain.name;
    } else if (!singleSubdomains[address.subdomain.id]) {
      allAccessibleDomains[address.subdomain.domain.name] ??= address.subdomain.name;
    } else {
      allAccessibleDomains[address.subdomain.domain.name] ??= address.name;
    }
  });

  return {
    props: {
      loggedIn: user.username,
      allAccessibleDomains,
    },
  };
};
