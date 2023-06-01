import { createContext, useContext } from 'react';

export const AppContext = createContext({
  subdomains: [],
  addresses: [],
  folders: [],
  mails: [],
  convos: [],
  toggledSubdomains: [],
  selectedAddress: [],
  selectedConvo: null,
});

export function useAppContext() {
  return useContext(AppContext);
}
