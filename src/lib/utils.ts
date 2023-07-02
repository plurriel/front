import { Dispatch, SetStateAction } from 'react';

export const emailAddrUtils = {
  extractDisplayName(v: string) {
    // I <3 regex
    return (
      v.match(/^(([^ <]+ )*[^ <]+) ?<[^>]+>$/)
      || v.match(/^<([^>]+)>$/)
      || [null, v])[1];
  },
  extractAddress(v: string) {
    const matchEmailAnyhow = /^([A-z0-9!#$%&'*+\-/=?^_`{|}~.]+\.)*[A-z0-9!#$%&'*+\-/=?^_`{|}~.]+@([A-z0-9-.]+\.)+[A-z0-9-.]+$|(?<=<)([A-z0-9!#$%&'*+\-/=?^_`{|}~.]+\.)*[A-z0-9!#$%&'*+\-/=?^_`{|}~.]+@([A-z0-9-.]+\.)+[A-z0-9-.]+(?=>)/g;
    const matchResults = v.match(matchEmailAnyhow);
    if (!matchResults) throw new Error();
    return matchResults[0];
  },
};

export function crackOpen(param: string | string[]): string {
  if (Array.isArray(param)) return param[0];
  return param;
}

interface Folder {
  name: string;
  type: 'Inbox' | 'Sent' | 'Drafts' | 'Deleted' | 'Spam' | 'Other';
}

export const getFolderName = (folder: Folder) => (folder.type !== 'Other' ? folder.type : folder.name);

type StateSetter<T> = Dispatch<SetStateAction<T>>;
export type State<T> = [T, StateSetter<T>];
