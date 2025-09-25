export function ytIdFromUrl(u?:string){
  if (!u) return "";
  try {
    const url = new URL(u);
    if (url.hostname.includes("youtu.be")) return url.pathname.slice(1);
    if (url.searchParams.get("v")) return url.searchParams.get("v")!;
    if (url.pathname.includes("/shorts/")) return url.pathname.split("/shorts/")[1].split("/")[0];
    if (url.pathname.includes("/embed/")) return url.pathname.split("/embed/")[1].split("/")[0];
  } catch {}
  return "";
}
export function ytEmbedUrl(u?:string){ const id = ytIdFromUrl(u); return id ? `https://www.youtube.com/embed/${id}` : ""; }
export function calistreeQueryFromName(name:string){
  let q = name.toLowerCase().replace(/db/g,"dumbbell")
    .replace(/incline|decline|close-grip|wide|neutral|overhead|flat|weighted|one-arm|one arm|band/gi,"").trim()
    .replace(/\s+/g," ");
  if (/press/.test(q) && /dumbbell/.test(q)) q = "Flat Dumbbell Press";
  if (/row/.test(q) && /dumbbell/.test(q)) q = "Dumbbell Row";
  if (/curl/.test(q) && /hammer/.test(q)) q = "Hammer Curl";
  if (/curl/.test(q) && !/hammer/.test(q)) q = "Dumbbell Curl";
  if (/fly/.test(q)) q = "Dumbbell Fly";
  q = q.replace(/\b\w/g, c=>c.toUpperCase());
  return `https://calistree.app/search?query=${encodeURIComponent(q)}`;
}
