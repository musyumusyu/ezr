// index.html などを書き換えたら VERSION の数字を上げる(古いキャッシュが捨てられて更新される)
const VERSION='v14';
const CACHE='chart-editor-'+VERSION;
const FILES=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('chart-editor-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
// ネットにつながっているときは、いつも最新を取りに行く(更新がすぐ反映される)。つながらないときだけ、保存してある版で開く。
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith((async()=>{
    const c=await caches.open(CACHE);
    try{const res=await fetch(r.mode==='navigate'?r.url:r,{cache:'no-cache'});if(res&&res.ok)c.put(r,res.clone());return res}
    catch(err){return (await c.match(r,{ignoreSearch:true}))||(r.mode==='navigate'?await c.match('./index.html'):Response.error())}
  })());
});
