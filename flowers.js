
function rose(g,cx,cy,s,pal,spin){
  const p=PAL[pal],rx=Math.ceil(s*2)+1,ry=Math.ceil(s)+1;
  for(let y=Math.floor(cy)-ry;y<=cy+ry;y++)for(let x=Math.floor(cx)-rx;x<=cx+rx;x++){
    const u=(x-cx)/2,v=y-cy,r=Math.hypot(u,v);if(r>s)continue;
    const rn=r/s,th=Math.atan2(v,u);
    if(rn>0.93+0.06*Math.cos(5*th+rn*3+spin*6.283))continue;          
    if(rn>0.82){g.put(x,y,radialCh(th+Math.PI/2+spin),p[3]);continue}  
    if(rn<0.16){g.put(x,y,'@',p[0],true);continue}                     
    const ph=((rn*2.6-th/(2*Math.PI)+spin)%1+1)%1;
    const wave=0.5+0.5*Math.sin(ph*2*Math.PI);
    const lit=clamp(0.5-(u+v)/(s*2.6));                               
    const shade=clamp(0.5*wave+0.35*lit+0.25*rn);
    const d=clamp(0.95-shade*0.7+(1-rn)*0.2);
    g.put(x,y,RAMP[Math.min(9,Math.floor(d*9.99))],p[Math.min(4,Math.floor(shade*5))],d>0.8);
    if(s>2)g.pool.push([x,y]);
  }
}
function leaf(g,b,t,c,w){
  const n=Math.ceil(Math.max(Math.abs(t[0]-b[0]),Math.abs(t[1]-b[1]))*3)+1;
  for(let i=0;i<=n;i++){const u=i/n,[x,y]=bez(b,t,c,u),h=Math.round(w*Math.sin(Math.PI*u)**.8);
    for(let k=-h;k<=h;k++){const edge=h>0&&Math.abs(k)===h;g.put(x,y+k,edge?(k<0?"'":','):'~',edge?LEAFHI:LEAF)}}
}
function sprig(g,cx,cy,rnd){
  for(const [dx,dy,ch] of [[0,0,'*'],[-1,1,'.'],[1,1,'o'],[0,-1,'.'],[2,0,'.'],[-2,0,'*'],[1,-1,'o']])
    if(rnd()<.9)g.put(cx+dx,cy+dy,ch,WHITE);
}
const BOW=[
"  .--~~--.     .--~~--.  ",
"  /  .--.  \\   /  .--.  \\  ",
" (  (    )  (O)  (    )  ) ",
"  \\  '--'  /   \\  '--'  /  ",
"  '--~~--'     '--~~--'  "];
function ribbon(g,kx,ky){
  for(let x=kx-5;x<=kx+5;x++)g.put(x,ky+3,'=',RIBBON);
  for(let x=kx-4;x<=kx+4;x++)g.put(x,ky+4,'~',RIBBON);
  BOW.forEach((row,r)=>[...row].forEach((ch,i)=>{if(ch!==' ')g.put(kx-13+i,ky-2+r,ch,RIBBON)}));
  for(const [a,b] of [[-1,-8],[-2,-9],[1,8],[2,9]])curve(g,[kx+a,ky+5],[kx+b,ky+9],[kx+a,ky+8],RIBBON);
  g.put(kx-10,ky+9,'~',RIBBON);g.put(kx+10,ky+9,'~',RIBBON);
}


function bouquet(sway,t,tb){
  const g=new Grid(BW,BH),rnd=makeRng(11);
  const mv=(x,y,st=1)=>{
    const hh=clamp((KY-y)/KY),ph=t*1.35-y*.12+(x-KX)*.03;
    return[x+sway*SWAY_AMP*st*hh**1.2+Math.sin(ph)*FLUTTER*st*hh,y+Math.sin(ph*.7)*.25*hh]};
  const rot=Math.max(0,tb-.6)*SPIN_SPEED;


  for(const side of[-1,1])for(const [ex,ey] of [[3,22],[2,15],[6,7],[15,1]]){
    const tip=mv(KX+side*(KX-ex),ey+Math.sin(t*1.6+ex)*.8,.6),base=[KX+side*1.5,KY-1];
    leaf(g,base,tip,[tip[0]+(base[0]-tip[0])*.15,(base[1]+tip[1])/2+3],1);
  }
 
  for(let i=0;i<12;i++){
    const a=i/12*6.283+rot*.6,[x,y]=mv(KX+Math.cos(a)*(DOME_X+5),clamp(12+Math.sin(a)*12,1.5,21),.5);
    sprig(g,x,y,rnd);
  }
  
  const items=[];
  for(let i=0;i<N_ROSES;i++){
    const rho=Math.sqrt((i+.5)/N_ROSES),th=i*2.39996+rot,h=Math.sqrt(1-rho*rho);
    const x3=Math.cos(th)*rho,z3=Math.sin(th)*rho;
    const [sx,sy]=mv(KX+x3*DOME_X+Math.cos(t*1.3+i*1.7)*.8,15-h*DOME_Y*.9+z3*3.2+Math.sin(t*1.7+i*2.3)*.6);
    const p=clamp((tb-1.3-i*.18)/1.8),e=1-(1-p)**3;
    const s=(3.5-.9*rho+.4*z3)*(.25+.75*e)*(1+.05*Math.sin(t*2+i));
    items.push({sx,sy,z:z3,s,pal:ROSE_ORDER[i%ROSE_ORDER.length],spin:t*.28+i*.37,open:p>=1});
  }
  items.sort((a,b)=>a.z-b.z);                                          
  for(const f of items){                                              
    const end=[KX+(f.sx-KX)*.05,KY];
    curve(g,[f.sx,f.sy+f.s*.8],end,[end[0],f.sy+(KY-f.sy)*.55],STEM);
  }
  for(const f of items){rose(g,f.sx,f.sy,f.s,f.pal,f.spin);g.heads.push([f.sx,f.sy])}
  g.opened=items.filter(f=>f.open).length;

  for(const e of[-3,-1,1,3])curve(g,[KX+e*.3,KY+3],[KX+e,KY+6],[KX+e*.3,KY+4.5],STEM);
  ribbon(g,KX,KY);
  return g;
}
