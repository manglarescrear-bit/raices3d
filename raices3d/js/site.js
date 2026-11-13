/* Raíces 3D · comportamiento del sitio */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const WA="573016939278";
function fbUpdate(){const n=$("fb_nom").value.trim(),t=$("fb_txt").value.trim();
  $("fb_send").href="https://wa.me/"+WA+"?text="+encodeURIComponent("Hola, probé Raíces 3D, el generador de llaveros y topes de Manglares Creativos."+(n?"\nSoy "+n+".":"")+(t?"\n\n"+t:""))}
["fb_nom","fb_txt"].forEach(id=>$(id).addEventListener("input",fbUpdate));
document.querySelectorAll(".chips button").forEach(b=>b.onclick=()=>{const t=$("fb_txt");t.value+=(t.value&&!t.value.endsWith("\n")?"\n":"")+b.dataset.t+" ";t.focus();fbUpdate()});
const goFb=$("goFb");if(goFb)goFb.onclick=()=>$("opinion").scrollIntoView({behavior:"smooth"});
$("cp").onclick=async()=>{
  try{await navigator.clipboard.writeText("3016939278");$("cp").textContent="Copiado"}
  catch(e){const r=document.createRange();r.selectNodeContents($("ph"));const g=getSelection();g.removeAllRanges();g.addRange(r);$("cp").textContent="Selecciona y copia"}
  setTimeout(()=>{$("cp").textContent="Copiar número"},2000)};

/* Carga diferida del taller: three.js, fuentes de impresión y generador */
const FONT_URL="https://fonts.googleapis.com/css2?family=Fredoka:wght@600&family=Bangers&family=Lobster&family=Pacifico&family=Permanent+Marker&family=Bungee&family=Press+Start+2P&family=Roboto+Slab:wght@800&display=swap";
function loadScript(src){return new Promise((ok,no)=>{const s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=no;document.body.appendChild(s)})}
function loadCss(href){return new Promise(ok=>{const l=document.createElement("link");l.rel="stylesheet";l.href=href;l.onload=ok;l.onerror=ok;document.head.appendChild(l);setTimeout(ok,4000)})}
let started=false;
async function bootTaller(){
  if(started)return;started=true;
  const info=$("info");
  try{
    await Promise.all([loadCss(FONT_URL),loadScript("js/vendor/three.min.js")]);
    await loadScript("js/generador.js");
  }catch(e){info.textContent="No se pudo cargar el taller. Revisa tu conexión y recarga la página."}
}
const taller=$("taller");
if(taller){
  if("IntersectionObserver" in window){
    const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){io.disconnect();bootTaller()}},{rootMargin:"600px 0px"});
    io.observe(taller);
  }else bootTaller();
  ["pointerdown","keydown","touchstart"].forEach(ev=>window.addEventListener(ev,bootTaller,{once:true,passive:true}));
}
})();
