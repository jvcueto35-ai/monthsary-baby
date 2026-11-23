
class Sky{
  constructor(cols,rows,density=.012,bigs=5,shoot=[2,4.5]){
    const r=Math.random,pick=a=>a[Math.floor(r()*a.length)];
    this.cols=cols;this.rows=rows;this.shoot=shoot;
    const sc=[WHITE,WHITE,WHITE,'#ffb3cf',GOLD,MUTED];
    this.stars=Array.from({length:Math.floor(cols*rows*density)},()=>[Math.floor(r()*cols),Math.floor(r()*rows),r()*6.3,.6+r()*2.2,pick(sc)]);
    this.bigs=Array.from({length:bigs},()=>[4+Math.floor(r()*Math.max(1,cols-8)),2+Math.floor(r()*Math.max(1,rows-4)),r()*6.3,.35+r()*.45,pick([WHITE,GOLD,'#ffb3cf'])]);
    this.shot=null;this.next=1.2;this.petals=[];this.last=0;
  }
  update(t,spawn){
    const dt=Math.min(.2,Math.max(0,t-this.last));this.last=t;const r=Math.random;
    if(!this.shot){if(t>=this.next&&this.shoot)this.shot=[r()*this.cols*.55,r()*this.rows*.3]}
    else{this.shot[0]+=48*dt;this.shot[1]+=15*dt;
      if(this.shot[0]>this.cols+12||this.shot[1]>this.rows){this.shot=null;this.next=t+(this.shoot?this.shoot[0]+r()*(this.shoot[1]-this.shoot[0]):0)}}
    if(spawn&&spawn.length&&this.petals.length<MAX_PETALS&&r()<PETAL_RATE*dt){
      const [px,py]=spawn[Math.floor(r()*spawn.length)];
      this.petals.push([px,py,2.5+r()*2.5,r()*6.3,['#ffb3cf','#ffffff','#ff8fb1','#ffd0e0','#ff5fa2'][Math.floor(r()*5)]]);
    }
    for(const p of this.petals){p[1]+=p[2]*dt;p[0]+=Math.sin(t*1.6+p[3])*3*dt}
    this.petals=this.petals.filter(p=>p[1]<this.rows);
  }
  draw(g,t,mask){
    for(const [x,y,ph,sp,k] of this.stars){
      if(mask&&mask(x,y))continue;const b=(Math.sin(t*sp+ph)+1)/2;if(b<.3)continue;
      g.put(x,y,b<.55?'.':b<.8?'+':b<.95?'*':'✦',k)}
    for(const [x,y,ph,sp,k] of this.bigs){
      if(mask&&mask(x,y))continue;const s=Math.sin(t*sp+ph);if(s<.15)continue;
      g.put(x,y,s<.6?'+':'*',k,true);
      for(const [dx,dy,ch] of[[0,-1,'|'],[0,1,'|'],[-2,0,'-'],[2,0,'-']])g.put(x+dx,y+dy,ch,k);
      if(s>.5)for(const [dx,dy,ch] of[[-2,-1,'\\'],[2,-1,'/'],[-2,1,'/'],[2,1,'\\']])g.put(x+dx,y+dy,ch,k);
      if(s>.8)for(const [dx,dy,ch] of[[0,-2,'|'],[0,2,'|'],[-4,0,'-'],[4,0,'-']])g.put(x+dx,y+dy,ch,k);
    }
    if(this.shot)[...'*+=--..'].forEach((ch,i)=>g.put(this.shot[0]-i*2.2,this.shot[1]-i*.7,ch,i<3?WHITE:MUTED));
  }
  drawPetals(g,t){const sh=['`',',',"'",'~','o','°'];for(const [x,y,,ph,k] of this.petals)g.put(x,y,sh[Math.floor(t*3+ph*2)%sh.length],k)}
}
