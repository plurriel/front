export const emailAddrUtils = {
  extractDisplayName(v) {
    return (
      v.match(/^(([^ <]+ )*[^ <]+) ?<[^>]+>$/)
      || v.match(/^<([^>]+)>$/)
      || [null, v])[1];
  },
};
