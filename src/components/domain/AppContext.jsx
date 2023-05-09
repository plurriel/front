import { createContext, useContext } from "react";

export const AppContext = createContext({
  subdomains: [],
  addresses: [],
  folders: [],
  mails: null,
  // Array of { name, imgSrc, addresses, id }
  // addresses: array of { name, imgSrc, folders, id } or null
  // folders: array of { name, mails } or null
  // mails: array of { interlocutor, subject, sendDate, contents, id } or null
  // contents: { content, attachments, followUps }
  toggledSubdomains: [],
  toggledSubdomains: null,
  selectedAddress: [],
  selectedMail: null,
});

export function useAppContext() {
  return useContext(AppContext);
}


