/* Raíces 3D · generador de STL (Manglares Creativos). Corre todo en el navegador. */
const FONTS=[["Fredoka",600],["Bangers",400],["Lobster",400],["Pacifico",400],["Permanent Marker",400],["Bungee",400],["Press Start 2P",400],["Roboto Slab",800]];
const $=id=>document.getElementById(id);
FONTS.forEach(f=>{const o=document.createElement("option");o.value=f[0];o.textContent=f[0];o.style.fontFamily=f[0];$("fuente").appendChild(o)});
let tipo="llavero",R=8,last=null;

// ---------- Malla a partir de alturas por celda ----------
function buildMesh(B,T,W,H){const Z=new Float32Array(W*H);return buildMesh2(B,T,Z,Z,W,H)}

// ---------- Tope de lápiz: nombre con borde y túnel horizontal ----------
function buildMesh2(B1,T1,B2,T2,W,H){
  const P=[],E=1e-6;
  const iv=(c,r)=>{if(c<0||r<0||c>=W||r>=H)return[];const i=r*W+c,o=[];if(T1[i]>B1[i]+E)o.push([B1[i],T1[i]]);if(T2[i]>B2[i]+E)o.push([B2[i],T2[i]]);return o};
  function quad(a,b,c,d,n){
    const u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],v=[c[0]-a[0],c[1]-a[1],c[2]-a[2]];
    if((u[1]*v[2]-u[2]*v[1])*n[0]+(u[2]*v[0]-u[0]*v[2])*n[1]+(u[0]*v[1]-u[1]*v[0])*n[2]<0){[b,d]=[d,b]}
    P.push(...a,...b,...c,...a,...c,...d);
  }
  const same=(i,j)=>B1[i]===B1[j]&&T1[i]===T1[j]&&B2[i]===B2[j]&&T2[i]===T2[j];
  for(let r=0;r<H;r++){
    const yb=(H-1-r)/R,yt=yb+1/R;
    for(let c=0;c<W;c++){
      const mine=iv(c,r);if(!mine.length)continue;
      const i=r*W+c,x0=c/R,x1=(c+1)/R;
      if(c>0&&c<W-1&&r>0&&r<H-1&&same(i,i-1)&&same(i,i+1)&&same(i,i-W)&&same(i,i+W))continue;
      const start=!(c>0&&same(i,i-1));let ce=c;if(start)while(ce+1<W&&same(i,i+(ce+1-c)))ce++;
      const xe=(ce+1)/R;
      const nbs=[[c-1,r],[c+1,r],[c,r-1],[c,r+1]].map(p=>iv(p[0],p[1]));
      for(const [b,t] of mine){
        // caras superior e inferior (se unen en tiras horizontales)
        if(start){quad([x0,yb,t],[xe,yb,t],[xe,yt,t],[x0,yt,t],[0,0,1]);quad([x0,yb,b],[xe,yb,b],[xe,yt,b],[x0,yt,b],[0,0,-1])}
        nbs.forEach((nl,k)=>{
          let segs=[[b,t]];
          for(const [nb,nt] of nl){const ns=[];for(const [s0,s1] of segs){const lo=Math.min(s1,nb);if(lo>s0+E)ns.push([s0,lo]);const hi=Math.max(s0,nt);if(s1>hi+E)ns.push([hi,s1])}segs=ns}
          for(const [s0,s1] of segs){
            if(k===0)quad([x0,yb,s0],[x0,yt,s0],[x0,yt,s1],[x0,yb,s1],[-1,0,0]);
            else if(k===1)quad([x1,yb,s0],[x1,yt,s0],[x1,yt,s1],[x1,yb,s1],[1,0,0]);
            else if(k===2)quad([x0,yt,s0],[x1,yt,s0],[x1,yt,s1],[x0,yt,s1],[0,1,0]);
            else quad([x0,yb,s0],[x1,yb,s0],[x1,yb,s1],[x0,yb,s1],[0,-1,0]);
          }
        });
      }
    }
  }
  return Float32Array.from(P);
}
function generateTope(o){
  const {lines,fontStr,fs,lh,tw,thh,pad,rel,holeP}=o,wall=1.3,th=Math.max(o.th,holeP+2*wall),barH=holeP+2*wall;
  const Wp=Math.ceil((tw+2*pad+2)*R),Hp=Math.ceil((Math.max(thh,barH)+2*pad+2)*R);
  const mk=()=>{const c=document.createElement("canvas");c.width=Wp;c.height=Hp;return c.getContext("2d",{willReadFrequently:true})};
  const xb=mk(),xt=mk(),n=lines.length;
  for(const x of [xb,xt]){x.fillStyle=x.strokeStyle="#000";x.font=fontStr;x.textAlign="center";x.textBaseline="middle";x.lineJoin="round"}
  xb.lineWidth=2*pad*R;
  lines.forEach((l,i)=>{const y=Hp/2-((n-1)/2-i)*lh*R;xb.strokeText(l,Wp/2,y);xb.fillText(l,Wp/2,y);xt.fillText(l,Wp/2,y)});
  xb.fillRect(Wp/2-(tw/2+pad)*R,Hp/2-barH/2*R,(tw+2*pad)*R,barH*R);
  const mask=x=>{const d=x.getImageData(0,0,Wp,Hp).data,q=new Uint8Array(Wp*Hp);for(let i=0;i<q.length;i++)q[i]=d[i*4+3]>127?1:0;return q};
  const mb=mask(xb),mt=mask(xt),N=Wp*Hp;
  const B1=new Float32Array(N),T1=new Float32Array(N),B2=new Float32Array(N),T2=new Float32Array(N),Z0=new Float32Array(N),Z1=new Float32Array(N);
  const rr=holeP/2,zc=th/2;
  for(let r=0;r<Hp;r++){const dy=(Hp/2-(r+0.5))/R;for(let c=0;c<Wp;c++){
    const i=r*Wp+c;if(!mb[i])continue;
    if(Math.abs(dy)<rr){const h=Math.sqrt(rr*rr-dy*dy);T1[i]=zc-h;B2[i]=zc+h;T2[i]=th}else T1[i]=th;
    if(mt[i]){Z0[i]=th;Z1[i]=th+rel}
  }}
  return{base:buildMesh2(B1,T1,B2,T2,Wp,Hp),text:buildMesh2(Z0,Z1,Z0,Z0,Wp,Hp),W:Wp/R,H:Hp/R,Z:th+rel};
}

// ---------- Rótulo (solo letras) e imagen ----------
function generateRotulo(o){
  const {lines,fontStr,lh,tw}=o,th=+$('th').value,Wp=Math.ceil((tw+2)*R),Hp=Math.ceil((lines.length*lh+2)*R);
  const c=document.createElement('canvas');c.width=Wp;c.height=Hp;const x=c.getContext('2d',{willReadFrequently:true});
  x.fillStyle='#000';x.font=fontStr;x.textAlign='center';x.textBaseline='middle';
  lines.forEach((l,i)=>x.fillText(l,Wp/2,Hp/2-((lines.length-1)/2-i)*lh*R));
  const d=x.getImageData(0,0,Wp,Hp).data,N=Wp*Hp,B=new Float32Array(N),T=new Float32Array(N);
  for(let i=0;i<N;i++)if(d[i*4+3]>127)T[i]=th;
  return{base:buildMesh(B,T,Wp,Hp),text:new Float32Array(0),W:Wp/R,H:Hp/R,Z:th};
}
function generateImagen(){
  const iw=+$('iw').value,ut=+$('ut').value,inv=$('inv').checked,pad=+$('pad').value,th=+$('th').value,rel=+$('rel').value;
  const w=Math.round(iw*R),h=Math.round(iw*imgEl.naturalHeight/imgEl.naturalWidth*R),holeK=+$('hk').value,ringOn=$('arg').checked,ro=holeK/2+2.2;
  const M=Math.ceil((pad+(ringOn?2*ro:0)+1)*R),Wp=w+2*M,Hp=h+2*M;
  const mk=(a,b)=>{const c=document.createElement('canvas');c.width=a;c.height=b;return c};
  const tx=mk(w,h).getContext('2d',{willReadFrequently:true});tx.drawImage(imgEl,0,0,w,h);
  const d=tx.getImageData(0,0,w,h).data,n=w*h,F=new Uint8Array(n),D=new Uint8Array(n);
  let hasA=false;for(let i=0;i<n;i++)if(d[i*4+3]<250){hasA=true;break}
  let br=0,bg=0,bb=0;[0,w-1,(h-1)*w,n-1].forEach(p=>{br+=d[p*4]/4;bg+=d[p*4+1]/4;bb+=d[p*4+2]/4});
  let minC=w,minR=h;
  for(let i=0;i<n;i++){
    const r=d[i*4],g=d[i*4+1],b=d[i*4+2],a=d[i*4+3];
    if(!(hasA?a>127:Math.hypot(r-br,g-bg,b-bb)>50))continue;
    F[i]=1;const lum=.299*r+.587*g+.114*b;D[i]=(inv?lum>ut:lum<ut)?1:0;
    const cc=i%w,rr=(i/w)|0;if(cc<minC)minC=cc;if(rr<minR)minR=rr;
  }
  const Fc=mk(Wp,Hp),fx=Fc.getContext('2d'),id=fx.createImageData(w,h);
  for(let i=0;i<n;i++)id.data[i*4+3]=F[i]?255:0;fx.putImageData(id,M,M);
  const Bc=mk(Wp,Hp),bx=Bc.getContext('2d',{willReadFrequently:true});
  bx.drawImage(Fc,0,0);
  for(let k=1;k<=3;k++)for(let a=0;a<18;a++){const g=a/18*6.2832,rd=pad*R*k/3;bx.drawImage(Fc,Math.cos(g)*rd,Math.sin(g)*rd)}
  if(ringOn&&minC<w){
    let sx=0,sy=0,cnt=0,cx,cy;const izq=$('rpos').value==='izq';
    const lim=izq?minC+Math.max(2,Math.round(w*.03)):minR+Math.max(2,Math.round(h*.03));
    for(let i=0;i<n;i++){if(!F[i])continue;const cc=i%w,rr=(i/w)|0;if(izq?cc<lim:rr<lim){sx+=cc;sy+=rr;cnt++}}
    if(cnt){
      if(izq){cx=M+minC-pad*R-ro*R+1.8*R;cy=M+sy/cnt}else{cx=M+sx/cnt;cy=M+minR-pad*R-ro*R+1.8*R}
      bx.fillStyle='#000';bx.beginPath();bx.arc(cx,cy,ro*R,0,7);bx.fill();
      bx.globalCompositeOperation='destination-out';bx.beginPath();bx.arc(cx,cy,holeK/2*R,0,7);bx.fill();
    }
  }
  const bd=bx.getImageData(0,0,Wp,Hp).data,N=Wp*Hp,B1=new Float32Array(N),T1=new Float32Array(N),B2=new Float32Array(N),T2=new Float32Array(N);
  for(let r=0;r<Hp;r++)for(let c=0;c<Wp;c++){
    const i=r*Wp+c;if(bd[i*4+3]<=127)continue;T1[i]=th;
    const rr=r-M,cc=c-M;if(rr>=0&&cc>=0&&rr<h&&cc<w&&D[rr*w+cc]){B2[i]=th;T2[i]=th+rel}
  }
  return{base:buildMesh(B1,T1,Wp,Hp),text:buildMesh(B2,T2,Wp,Hp),W:Wp/R,H:Hp/R,Z:th+rel};
}
function vol(a){let v=0;for(let i=0;i<a.length;i+=9)v+=a[i]*(a[i+4]*a[i+8]-a[i+5]*a[i+7])-a[i+1]*(a[i+3]*a[i+8]-a[i+5]*a[i+6])+a[i+2]*(a[i+3]*a[i+7]-a[i+4]*a[i+6]);return Math.abs(v/6)}

// ---------- Construcción del modelo ----------
let imgEl=null;
async function generate(){
  if(tipo==="llavero"&&imgEl)return generateImagen();
  const txt=$("texto").value.replace(/\s+$/,"")||" ",lines=txt.split("\n");
  const [fname,fw]=FONTS.find(f=>f[0]===$("fuente").value);
  try{await document.fonts.load(`${fw} 40px "${fname}"`,txt)}catch(e){}
  const fs=+$("size").value,pad=+$("pad").value,th=+$("th").value,rel=+$("rel").value,forma=$("forma").value;
  const fontStr=`${fw} ${fs*R}px "${fname}", "Arial Black", sans-serif`;
  const mc=document.createElement("canvas").getContext("2d");mc.font=fontStr;
  const tw=Math.max(...lines.map(l=>{const m=mc.measureText(l);return Math.max(m.width,m.actualBoundingBoxLeft+m.actualBoundingBoxRight)}))/R,lh=fs*1.15;
  const thh=(lines.length-1)*lh+fs*0.8;
  if(tipo==="tope")return generateTope({lines,fontStr,fs,lh,tw,thh,pad,th,rel,holeP:+$("hp").value});
  if(tipo==="rotulo")return generateRotulo({lines,fontStr,lh,tw});
  let bw=tw+2*pad,bh=thh+2*pad,yoff=0;
  const holeP=+$("hp").value,holeK=+$("hk").value,wall=2.4;
  if(forma==="ovalo"){bw*=1.4;bh*=1.4}
  if(forma==="corazon"){bw*=1.5;bh*=1.45;yoff=bh*0.05}
  let minX=-bw/2,maxX=bw/2,minY=-bh/2,maxY=bh/2,ring=null;
  if(tipo==="llavero"&&$("arg").checked){
    const ro=holeK/2+2.2,ov=1.5;
    ring=$("rpos").value==="izq"?{x:-bw/2-ro+ov,y:0,ro,ri:holeK/2}:{x:0,y:bh/2+ro-ov,ro,ri:holeK/2};
    minX=Math.min(minX,ring.x-ro);maxY=Math.max(maxY,ring.y+ro);
  }
  const m=1,Wp=Math.ceil((maxX-minX+2*m)*R),Hp=Math.ceil((maxY-minY+2*m)*R);
  const X=x=>(x-minX+m)*R,Y=y=>(maxY+m-y)*R;
  const mk=()=>{const c=document.createElement("canvas");c.width=Wp;c.height=Hp;return[c,c.getContext("2d",{willReadFrequently:true})]};
  const [cb,xb]=mk(),[ct,xt]=mk();
  // base
  xb.fillStyle="#000";xb.beginPath();
  const cx=X(0),cy=Y(0),w=bw*R,h=bh*R;
  if(forma==="rect"){const r=Math.min(4*R,w/2,h/2),x=cx-w/2,y=cy-h/2;
    xb.moveTo(x+r,y);xb.arcTo(x+w,y,x+w,y+h,r);xb.arcTo(x+w,y+h,x,y+h,r);xb.arcTo(x,y+h,x,y,r);xb.arcTo(x,y,x+w,y,r);xb.closePath()}
  else if(forma==="ovalo"){xb.ellipse(cx,cy,w/2,h/2,0,0,Math.PI*2)}
  else{for(let i=0;i<=160;i++){const t=i/160*Math.PI*2,hx=16*Math.pow(Math.sin(t),3),hy=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);
    const px=cx+hx/32*w,py=cy-(hy+2.5)/29*h;i?xb.lineTo(px,py):xb.moveTo(px,py)}xb.closePath()}
  xb.fill();
  if(ring){xb.beginPath();xb.arc(X(ring.x),Y(ring.y),ring.ro*R,0,7);xb.fill();
    xb.globalCompositeOperation="destination-out";xb.beginPath();xb.arc(X(ring.x),Y(ring.y),ring.ri*R,0,7);xb.fill()}
  // texto
  xt.fillStyle="#000";xt.font=fontStr;xt.textAlign="center";xt.textBaseline="middle";
  lines.forEach((l,i)=>xt.fillText(l,cx,Y(yoff+((lines.length-1)/2-i)*lh)));
  const mask=c=>{const d=c.getContext("2d").getImageData(0,0,Wp,Hp).data,o=new Uint8Array(Wp*Hp);for(let i=0;i<o.length;i++)o[i]=d[i*4+3]>127?1:0;return o};
  const mb=mask(cb),mt=mask(ct);
  const N=Wp*Hp,B1=new Float32Array(N),T1=new Float32Array(N),B2=new Float32Array(N),T2=new Float32Array(N);
  const top=th;
  for(let i=0;i<N;i++){
    if(!mb[i])continue;
    B1[i]=0;T1[i]=top;
    if(mt[i]){B2[i]=top;T2[i]=top+rel}
  }
  const base=buildMesh(B1,T1,Wp,Hp),text=buildMesh(B2,T2,Wp,Hp);
  return{base,text,W:Wp/R,H:Hp/R,Z:top+rel};
}

// ---------- STL / ZIP ----------
function stl(arrs){
  let n=0;arrs.forEach(a=>n+=a.length/9);
  const buf=new ArrayBuffer(84+n*50),dv=new DataView(buf);dv.setUint32(80,n,true);let o=84;
  for(const a of arrs)for(let i=0;i<a.length;i+=9){
    const u=[a[i+3]-a[i],a[i+4]-a[i+1],a[i+5]-a[i+2]],v=[a[i+6]-a[i],a[i+7]-a[i+1],a[i+8]-a[i+2]];
    let nx=u[1]*v[2]-u[2]*v[1],ny=u[2]*v[0]-u[0]*v[2],nz=u[0]*v[1]-u[1]*v[0];const l=Math.hypot(nx,ny,nz)||1;
    [nx/l,ny/l,nz/l].forEach(q=>{dv.setFloat32(o,q,true);o+=4});
    for(let k=0;k<9;k++){dv.setFloat32(o,a[i+k],true);o+=4}o+=2;
  }
  return new Uint8Array(buf);
}
const CRC=(()=>{const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
const crc32=d=>{let c=0xFFFFFFFF;for(let i=0;i<d.length;i++)c=CRC[(c^d[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0};
function zip(files){
  const enc=new TextEncoder(),parts=[],cen=[];let off=0;
  for(const f of files){
    const nm=enc.encode(f.name),crc=crc32(f.data),h=new DataView(new ArrayBuffer(30));
    h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(10,0,true);h.setUint16(12,0x21,true);
    h.setUint32(14,crc,true);h.setUint32(18,f.data.length,true);h.setUint32(22,f.data.length,true);h.setUint16(26,nm.length,true);
    parts.push(new Uint8Array(h.buffer),nm,f.data);
    const c=new DataView(new ArrayBuffer(46));
    c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(14,0x21,true);
    c.setUint32(16,crc,true);c.setUint32(20,f.data.length,true);c.setUint32(24,f.data.length,true);c.setUint16(28,nm.length,true);c.setUint32(42,off,true);
    cen.push(new Uint8Array(c.buffer),nm);off+=30+nm.length+f.data.length;
  }
  let cs=0;cen.forEach(x=>cs+=x.length);
  const e=new DataView(new ArrayBuffer(22));
  e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cs,true);e.setUint32(16,off,true);
  return new Blob([...parts,...cen,new Uint8Array(e.buffer)],{type:"application/zip"});
}
$("dl").onclick=async()=>{
  if(!last)return;
  const slug=($("texto").value.split("\n")[0]||"").normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-zA-Z0-9]+/g,"_").replace(/^_+|_+$/g,"").slice(0,20);
  const nm={llavero:"llavero",tope:"tope_lapiz",rotulo:"rotulo"}[tipo]+(slug&&!(tipo==="llavero"&&imgEl)?"_"+slug:"");
  const blob=zip(tipo==="rotulo"?[{name:nm+".stl",data:stl([last.base])}]:[{name:nm+"_base.stl",data:stl([last.base])},{name:nm+"_texto.stl",data:stl([last.text])},{name:nm+"_completo.stl",data:stl([last.base,last.text])}]);
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=nm+"_stl.zip";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);
};

// ---------- Vista 3D ----------
const cv=$("view");let rd;try{rd=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true})}catch(e){$("info").textContent="Tu navegador no pudo iniciar la vista 3D. Prueba con Chrome, Edge o Firefox actualizados.";throw e}
const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(40,1,0.1,2000);
sc.add(new THREE.HemisphereLight(0xffffff,0x666666,0.9));
const dl=new THREE.DirectionalLight(0xffffff,0.8);dl.position.set(40,80,100);sc.add(dl);
const tilt=new THREE.Group(),spin=new THREE.Group(),inner=new THREE.Group();
inner.rotation.x=-Math.PI/2;spin.add(inner);tilt.add(spin);sc.add(tilt);tilt.rotation.x=1.0;
let mB=null,mT=null,zoom=1,dim=60;
const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:0.55,metalness:0.05});
function geo(a){const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(a,3));g.computeVertexNormals();return g}
function show(r){
  [mB,mT].forEach(x=>{if(x){inner.remove(x);x.geometry.dispose();x.material.dispose()}});
  mB=new THREE.Mesh(geo(r.base),mat($("c1").value));mT=new THREE.Mesh(geo(r.text),mat($("c2").value));
  [mB,mT].forEach(x=>{x.position.set(-r.W/2,-r.H/2,-r.Z/2);inner.add(x)});
  dim=Math.max(r.W,r.H,r.Z);
}
function resize(){const w=cv.clientWidth,h=cv.clientHeight;if(cv.width!==w*devicePixelRatio){rd.setPixelRatio(devicePixelRatio);rd.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}}
(function loop(){resize();cam.position.set(0,0,dim*1.9/zoom+10);rd.render(sc,cam);requestAnimationFrame(loop)})();
let drag=null;const pts=new Map();let pd=0;
cv.addEventListener("pointerdown",e=>{cv.setPointerCapture(e.pointerId);pts.set(e.pointerId,e);drag=e});
cv.addEventListener("pointermove",e=>{
  if(!pts.has(e.pointerId))return;pts.set(e.pointerId,e);
  if(pts.size===2){const [a,b]=[...pts.values()],d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);if(pd)zoom=Math.min(4,Math.max(.4,zoom*d/pd));pd=d;return}
  spin.rotation.y+=(e.clientX-drag.clientX)*0.01;tilt.rotation.x=Math.min(1.6,Math.max(-0.2,tilt.rotation.x+(e.clientY-drag.clientY)*0.01));drag=e;
});
const up=e=>{pts.delete(e.pointerId);pd=0;drag=[...pts.values()][0]||null};
cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",up);
cv.addEventListener("wheel",e=>{e.preventDefault();zoom=Math.min(4,Math.max(.4,zoom*(e.deltaY<0?1.1:.9)))},{passive:false});

// ---------- Interfaz ----------
let timer,busy=false,again=false;
async function refresh(){
  if(busy){again=true;return}busy=true;$("info").textContent="Generando…";$("dl").disabled=true;
  try{
    last=await generate();show(last);last.cm3=(vol(last.base)+vol(last.text))/1000;cotizar();
    const tris=(last.base.length+last.text.length)/9;
    $("info").textContent=`Tamaño: ${last.W.toFixed(1)} × ${last.H.toFixed(1)} × ${last.Z.toFixed(1)} mm · ${tris.toLocaleString("es")} triángulos`;
    const big=Math.max(last.W,last.H)>250;
    if(big)$("info").textContent+=" · Ojo: pasa de 250 mm, revisa que quepa en tu cama";
    $("info").classList.toggle("warn",big);
    $("dl").disabled=false;
  }catch(e){$("info").textContent="Error al generar: "+e.message}
  busy=false;if(again){again=false;refresh()}
}
const sched=()=>{clearTimeout(timer);timer=setTimeout(refresh,250);saveS()};
["size","pad","th","rel"].forEach(id=>$(id).addEventListener("input",()=>{$("v_"+id).textContent=$(id).value;sched()}));
["texto","fuente","forma","hk","rpos","hp"].forEach(id=>$(id).addEventListener("input",sched));
["c1","c2"].forEach(id=>$(id).addEventListener("input",()=>{if(mB){mB.material.color.set($("c1").value);mT.material.color.set($("c2").value)}}));
document.querySelectorAll("#tipo button").forEach(b=>b.onclick=()=>{
  tipo=b.dataset.v;document.querySelectorAll("#tipo button").forEach(x=>x.classList.toggle("on",x===b));
  $("g_llavero").classList.toggle("hide",tipo!=="llavero");$("g_tope").classList.toggle("hide",tipo!=="tope");
  const t=tipo==="tope",ro=tipo==="rotulo";$("lbl_th").textContent=t?"Grosor de la pieza:":ro?"Altura de las letras:":"Grosor de la base:";$("g_rel").classList.toggle("hide",ro);$("g_pad").classList.toggle("hide",ro);
  $("forma").parentElement.style.visibility=(t||ro)?"hidden":"visible";$("pad").value=t?2.5:4;$("v_pad").textContent=$("pad").value;
  $("th").value=t?12:ro?2.5:3;$("v_th").textContent=$("th").value;sched();
});
$('img').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{imgEl=im;$('g_img').classList.remove('hide');sched()};im.src=fr.result};fr.readAsDataURL(f)});
$('noimg').onclick=()=>{imgEl=null;$('img').value='';$('g_img').classList.add('hide');sched()};
['iw','ut'].forEach(id=>$(id).addEventListener('input',()=>{$('v_'+id).textContent=$(id).value;sched()}));
['inv','arg'].forEach(id=>$(id).addEventListener('change',sched));
const QI=['q_kg','q_inf','q_gh','q_mh','q_fix','q_mg','q_qty'];
try{const s=JSON.parse(localStorage.getItem('cot')||'{}');QI.forEach(k=>{if(s[k]!=null)$(k).value=s[k]})}catch(e){}
const fm=n=>'$'+Math.round(n).toLocaleString('es-CO');
function cotizar(){
  try{localStorage.setItem('cot',JSON.stringify(Object.fromEntries(QI.map(k=>[k,$(k).value]))))}catch(e){}
  if(!last)return;
  const v=k=>+$(k).value||0,g=last.cm3*1.24*(0.3+0.7*v('q_inf')/100),hrs=g/Math.max(v('q_gh'),0.1)+0.1;
  const mat=g/1000*v('q_kg'),maq=hrs*v('q_mh'),fix=v('q_fix'),costo=mat+maq+fix;
  const pu=Math.ceil(costo*(1+v('q_mg')/100)/100)*100,q=Math.max(1,Math.floor(v('q_qty')));
  const hh=Math.floor(hrs),mm=Math.round((hrs-hh)*60),r=(a,b)=>`<div class="qr"><span>${a}</span><span>${b}</span></div>`;
  $('q_out').innerHTML=r('Peso aprox.',g.toFixed(1)+' g')+r('Tiempo aprox.',hh+' h '+mm+' min')+r('Material',fm(mat))+r('Máquina',fm(maq))+r('Costo fijo',fm(fix))+r('Costo total',fm(costo))+
    `<div class="qr" style="font-weight:700;font-size:18px;margin-top:6px"><span>Precio por pieza</span><span>${fm(pu)}</span></div>`+(q>1?`<div class="qr" style="font-weight:700"><span>Total × ${q}</span><span>${fm(pu*q)}</span></div>`:'');
}
QI.forEach(k=>$(k).addEventListener('input',cotizar));
const SAVE=["texto","fuente","forma","size","pad","th","rel","hk","rpos","hp","c1","c2"];
function saveS(){try{const o={tipo,arg:$("arg").checked};SAVE.forEach(k=>o[k]=$(k).value);localStorage.setItem("g3d",JSON.stringify(o))}catch(e){}}
function loadS(){try{const o=JSON.parse(localStorage.getItem("g3d")||"null");if(!o)return;
  if(o.tipo&&o.tipo!==tipo)document.querySelector('#tipo button[data-v="'+o.tipo+'"]').click();
  SAVE.forEach(k=>{if(o[k]!=null)$(k).value=o[k]});["size","pad","th","rel"].forEach(k=>$("v_"+k).textContent=$(k).value);
  if(o.arg!=null)$("arg").checked=o.arg}catch(e){}}
loadS();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(refresh);
refresh();
