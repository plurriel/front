export const emailAddrUtils = {
  extractDisplayName(v) {
    return (
      v.match(/^(([^ <]+ )*[^ <]+) ?<[^>]+>$/)
      || v.match(/^<([^>]+)>$/)
      || [null, v])[1];
  },
};

export const getFolderName = (folder) => (folder.type !== 'Other' ? folder.type : folder.name);
