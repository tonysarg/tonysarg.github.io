export const parseSets = (s?:string) => {
  const m = String(s||"").match(/(\d+)/); return m?parseInt(m[1],10):0;
};
export const setCountFromString = (s?:string) => parseSets(s);
export const setStringWithCount = (s:string|undefined, n:number) => {
  if (!s) return `${n}×8–12`;
  return String(s).replace(/^\s*\d+/, String(n));
};
