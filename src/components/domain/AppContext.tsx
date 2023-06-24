import {
  createContext,
  useContext,
  Dispatch,
  SetStateAction,
} from 'react';

import {
  Subdomain,
  Address,
  Folder,
  Convo,
  Mail,
  Domain,
} from '@prisma/client';

import BundledEditor from '../BundledEditor';

type StateSetter<T> = Dispatch<SetStateAction<T>>;
type State<T> = [T, StateSetter<T>];

export type StoredAs<CurrentScope, NextScopeName, Trusted = false> = NextScopeName extends string
  ? Trusted extends true
    ? CurrentScope & Record<NextScopeName, string[]>
    : CurrentScope | CurrentScope & Record<NextScopeName, string[]>
  : never;

interface AppContextValue {
  domain: StoredAs<Domain, 'subdomains', true>;
  subdomains: State<Record<string, StoredAs<Subdomain, 'addresses', true>>>;
  addresses: State<Record<string, StoredAs<Address, 'folders', true>>>;
  folders: State<Record<string, StoredAs<Folder, 'convos'>>>;
  convos: State<Record<string, StoredAs<Convo, 'mails'>>>;
  mails: State<Record<string, Mail>>;
  selectedFolder: State<[string, string, string] | null>;
  selectedConvo: State<string | null>;
  currentFirstPane: State<number>;
  viewedAddress: State<[string, string] | null>;
  toggledSubdomains: State<Set<string>>;
  requestedSubdomain: State<string | null>;
  requestedMail: State<string | null>;
  composing: State<boolean>;
  BundledEditor: typeof BundledEditor | (() => null);
}

export const AppContext = createContext<AppContextValue>(undefined as unknown as AppContextValue);

export function useAppContext() {
  return useContext(AppContext);
}
