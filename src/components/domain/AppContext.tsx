import {
  createContext,
  useContext,
} from 'react';

import {
  Subdomain,
  Address,
  Folder,
  Convo,
  Mail,
  Domain,
} from '@prisma/client';

import { State } from '@/lib/utils';
import BundledEditor from '../BundledEditor';

export type StoredAs<CurrentScope, NextScopeName, Trusted = false> = NextScopeName extends string
  ? Trusted extends true
    ? CurrentScope & Record<NextScopeName, string[]>
    : CurrentScope
      | CurrentScope & Record<NextScopeName, null>
      | CurrentScope & Record<NextScopeName, string[]>
  : never;

interface AppContextValue {
  domain: StoredAs<Domain, 'subdomains', true>;
  subdomains: State<Record<string, StoredAs<Subdomain, 'addresses', true>>>;
  addresses: State<Record<string, StoredAs<Address, 'folders', true>>>;
  folders: State<Record<string, StoredAs<Folder, 'mails'>>>;
  convos: State<Record<string, StoredAs<Convo, 'mails'>>>;
  mails: State<Record<string, Mail>>;
  selectedFolder: State<[string, string, string] | null>;
  selectedMail: State<string | null>;
  currentFirstPane: State<number>;
  viewedAddress: State<[string, string] | null>;
  toggledSubdomains: State<Set<string>>;
  requestedSubdomain: State<string | null>;
  composing: State<string | boolean>;
  activeContextMenuState: State<State<[number, number] | null> | null>;
  BundledEditor: typeof BundledEditor | (() => null);
}

export const AppContext = createContext<AppContextValue>(undefined as unknown as AppContextValue);

export function useAppContext() {
  return useContext(AppContext);
}
