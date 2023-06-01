export const emailAddrUtils = {
  extractDisplayName(v) {
    return (
      v.match(/^([^ <]+ )*[^ <]+(?= ?<[^>]+>$)/g)
      || v.match(/(?<=^<)[^>]+(?=>$)/g)
      || [v])[0];
  },
};
