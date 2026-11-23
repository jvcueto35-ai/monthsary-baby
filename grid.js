/* A 2-D grid of (character, colour, bold) + small drawing helpers */
class Grid{
  constructor(w,h){this.w=w;this.h=h;this.c=new Array(w*h).fill(' ');this.k=new Array(w*h).fill(null);this.b=new Uint8Array(w*h);this.heads=[];this.pool=[];this.opened=0}
  put(x,y,ch,k,b){x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=this.w||y>=this.h)return;const i=y*this.w+x;this.c[i]=ch;this.k[i]=k;this.b[i]=b?1:0}
  text(x,y,s,k,b){for(let i=0;i<s.length;i++)if(s[i]!==' ')this.put(x+i,y,s[i],k,b)}
}
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const bez=(p0,p2,c,t)=>[(1-t)**2*p0[0]+2*(1-t)*t*c[0]+t*t*p2[0],(1-t)**2*p0[1]+2*(1-t)*t*c[1]+t*t*p2[1]];
const dirCh=(dx,dy)=>{if(Math.abs(dy)<1e-9)return'_';const s=dx/dy;if(Math.abs(s)<.7)return'|';if(Math.abs(s)>3)return'_';return s>0?'\\':'/'};
const radialCh=th=>{const dx=2*Math.cos(th),dy=Math.sin(th);if(Math.abs(dy)<1e-9||Math.abs(dx/dy)>2.6)return'-';if(Math.abs(dx/dy)<.8)return'|';return dx*dy>0?'\\':'/'};
function curve(g,p0,p2,c,k,ch){
  const n=Math.max(Math.abs(p2[0]-p0[0]),Math.abs(p2[1]-p0[1]),1)*4;
  for(let i=0;i<=n;i++){const t=i/n,[x,y]=bez(p0,p2,c,t);
    const dx=2*(1-t)*(c[0]-p0[0])+2*t*(p2[0]-c[0]),dy=2*(1-t)*(c[1]-p0[1])+2*t*(p2[1]-c[1]);
    g.put(x,y,ch||dirCh(dx,dy),k)}
}
function makeRng(seed){let a=seed;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
