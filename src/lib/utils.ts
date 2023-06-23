export const emailAddrUtils = {
  extractDisplayName(v: string) {
    // I <3 regex
    return (
      v.match(/^(([^ <]+ )*[^ <]+) ?<[^>]+>$/)
      || v.match(/^<([^>]+)>$/)
      || [null, v])[1];
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
