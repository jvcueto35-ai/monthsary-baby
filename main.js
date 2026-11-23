/* Canvas, scenes (intro -> yes/no -> bouquet) and the animation loop */
const cv=document.getElementById('c'),ctx=cv.getContext('2d'),ui_=document.getElementById('ui');
const msg=document.getElementById('msg'),txt=document.getElementById('txt'),hint=document.getElementById('hint');
const $=id=>document.getElementById(id);
let cw,chh,cols,rows,skies={},sky,scene='intro',sceneT0=0,done=false,lastF=0;

function resize(){
  const dpr=window.devicePixelRatio||1,W=innerWidth,H=innerHeight;
  cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
  cw=Math.max(5,Math.min(W/(BW+6),H/2/(BH+7)));chh=cw*2;
  cols=Math.floor(W/cw);rows=Math.floor(H/chh);
  skies={intro:new Sky(cols,rows,.012,3,null),yes:new Sky(cols,rows,.025,10,[.4,1]),main:new Sky(cols,rows)};
  sky=skies[scene==='yes'?'yes':scene==='intro'?'intro':'main'];
}
function present(g){
  ctx.fillStyle='#05030a';ctx.fillRect(0,0,innerWidth,innerHeight);
  const fn=`${Math.round(cw/.6)}px "Cascadia Mono",Consolas,Menlo,"DejaVu Sans Mono",monospace`;
  ctx.textAlign='center';ctx.textBaseline='middle';
  let lastK=null,lastB=-1;
  for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){
    const i=y*g.w+x,ch=g.c[i];if(ch===' ')continue;
    if(g.b[i]!==lastB){lastB=g.b[i];ctx.font=(lastB?'bold ':'')+fn}
    if(g.k[i]!==lastK){lastK=g.k[i];ctx.fillStyle=lastK||'#fff'}
    ctx.fillText(ch,x*cw+cw/2,y*chh+chh/2);
  }
}

/* ---- scenes ---- */
function ui(html){if(html==null){ui_.hidden=true;ui_.innerHTML='';return}ui_.hidden=false;ui_.innerHTML=html}
function go(s){scene=s;sceneT0=performance.now();done=false;msg.hidden=true;txt.textContent='';hint.style.opacity=0;
  sky=skies[s==='intro'?'intro':s==='yes'?'yes':'main']}
function intro(){
  go('intro');
  ui(`<div class="hearts">♡ ✿ ♡ ✿ ♡ ✿ ♡</div><p class="q">${QUESTION}</p>
      <div class="row"><button id="yes">Yes</button><button id="no">No</button></div>
      <div class="hearts">♡ ✿ ♡ ✿ ♡ ✿ ♡</div><div class="small">Click Yes to continue</div>`);
  $('yes').onclick=()=>{ui();go('yes')};
  $('no').onclick=noGame;
  $('yes').focus();
}
function ask(q,next){
  ui(`<p class="q">${q}</p><input id="ans" autocomplete="off" placeholder="type here, then press Enter">`);
  const a=$('ans');a.focus();a.onkeydown=e=>{if(e.key==='Enter'&&a.value.trim())next()};
}
function noGame(){
  ask('Why did you say no?',()=>ask('Do you even love me?',()=>{
    ui(`<p class="q">Just look at it!</p><button id="cont">Continue</button><div class="small">(or press Enter)</div>`);
    $('cont').focus();$('cont').onclick=()=>{ui();go('bear')};
  }));
}
const TEDDY=String.raw`    .--.       .--.
   /    \_____/    \
   \   .-'   '-.   /
    '-/  o   o  \-'
      |    ,-.    |
      \   '---'   /
     .-'-._____.-'-.
    /  /|   <3   |\  \
   (  ( |         | )  )
    \__\|_________|/__/
         /  |  \
        (__/ \__)`.split('\n');

/* ---- two sparkling strands that spiral around the bouquet (front half / back half) ---- */
function helix(st,ox,oy,t,tb,front){
  if(tb<REVEAL_SECONDS)return;
  const fade=clamp((tb-REVEAL_SECONDS)/2.2);
  for(const dir of[1,-1])for(let k=0;k<90;k++){
    const u=k/90;if(u>fade)continue;
    const ang=dir*t*1.2+u*6*Math.PI+(dir<0?Math.PI:0),s=Math.sin(ang);
    if((s>0)!==front)continue;
    const rad=11+25*Math.sin(Math.PI*(.12+.76*u));
    st.put(ox+KX+Math.cos(ang)*rad,oy+2+u*30+s*3,k%9===0?'✦':k%3===0?'*':'.',[GOLD,WHITE,'#ffb3cf',RIBBON][(k+(dir>0?0:2))%4],k%9===0);
  }
}

/* ---- main loop ---- */
function frame(now){
  requestAnimationFrame(frame);
  if(now-lastF<30)return;lastF=now;
  const t=now/1000,tb=(now-sceneT0)/1000,st=new Grid(cols,rows);
  const ox=Math.floor((cols-BW)/2),oy=Math.max(1,Math.floor((rows-BH-5)/2));

  if(scene==='intro'){sky.update(t);sky.draw(st,t)}
  else if(scene==='yes'){
    const line="I knew you'd say yes! ♡",mid=Math.floor(rows/2);
    sky.update(t);sky.draw(st,tb*1.6+t,(x,y)=>Math.abs(y-mid)<=1&&Math.abs(x-cols/2)<=line.length/2+4);
    const n=Math.min(line.length,Math.floor(tb/.06)),x0=Math.floor((cols-line.length)/2);
    [...line.slice(0,n)].forEach((ch,i)=>st.put(x0+i,mid,ch,MSG_COLORS[((i-Math.floor(tb*8))%6+6)%6],true));
    if(tb>3.6)go('bouquet');
  }
  else if(scene==='bear'){
    const w=Math.max(...TEDDY.map(l=>l.length)),x0=Math.floor((cols-w)/2),y0=Math.floor((rows-TEDDY.length)/2);
    const wipe=Math.max(0,Math.floor((tb-2.2)/.05));
    sky.update(t);sky.draw(st,t);
    TEDDY.forEach((l,i)=>{if(i>=wipe)st.text(x0,y0+i,l,'#d39a6a',true)});
    if(tb>2.2+TEDDY.length*.05+.2)go('bouquet');
  }
  else if(scene==='bouquet'){
    const hidden=Math.max(0,Math.ceil(BH*(1-tb/REVEAL_SECONDS)));
    const ramp=clamp((tb-REVEAL_SECONDS)/1.5);
    const sway=(Math.sin(2*Math.PI*tb/SWAY_PERIOD)+.35*Math.sin(2*Math.PI*tb/2.3))*ramp;   // two waves = livelier
    const b=bouquet(sway,t,tb);
    const mask=(x,y)=>{const by=y-oy;if(by<hidden)return false;const bx=x-ox;
      return(((bx-BW/2)/39)**2+((by-9)/14)**2<=1)||(bx>=24&&bx<=50&&by>=12&&by<=BH)};
    sky.update(t,hidden===0?b.heads.map(([x,y])=>[ox+x,oy+y]):null);
    sky.draw(st,t,mask);
    helix(st,ox,oy,t,tb,false);                                        // back half of the spirals
    for(let y=hidden;y<BH;y++)for(let x=0;x<BW;x++){const i=y*BW+x;if(b.c[i]!==' ')st.put(ox+x,oy+y,b.c[i],b.k[i],b.b[i])}
    helix(st,ox,oy,t,tb,true);                                         // front half
    if(hidden>0){const r=Math.random;for(let i=0;i<10;i++)st.put(ox+Math.floor(r()*BW),oy+hidden-1,'*+✦'[Math.floor(r()*3)],[WHITE,GOLD,RIBBON][Math.floor(r()*3)],true)}
    else{const pool=b.pool,r=makeRng(Math.floor(t*5));for(let i=0;i<GLINTS&&pool.length;i++){const [x,y]=pool[Math.floor(r()*pool.length)];st.put(ox+x,oy+y,'*+✦'[Math.floor(r()*3)],WHITE,true)}}
    sky.drawPetals(st,t);
    st.text(2,rows-1,` ${b.opened}/${N_ROSES}    ${sky.petals.length}`,MUTED);
    if(tb>TYPE_START){
      msg.hidden=false;
      const n=Math.min(FINAL_MESSAGE.length,Math.floor((tb-TYPE_START)/TYPE_SPEED));
      const s=FINAL_MESSAGE.slice(0,n);if(txt.textContent!==s)txt.textContent=s;
      if(n>=FINAL_MESSAGE.length&&!done){done=true;hint.style.opacity=.7}
    }
  }
  if(scene!=='bouquet')sky.drawPetals(st,t);
  present(st);
}

addEventListener('resize',resize);
addEventListener('keydown',e=>{
  if(scene==='bouquet'&&done)intro();
  else if(e.key==='Enter'&&$('cont'))$('cont').click();
});
addEventListener('pointerdown',()=>{if(scene==='bouquet'&&done)intro()});
resize();intro();requestAnimationFrame(frame);
