// Typing engine, shared by the solo page and multiplayer races.
(function(root){
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const range=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
const fmtT=t=>Math.floor(t/60)+":"+String(Math.floor(t%60)).padStart(2,"0");

// el: {box, words, caret, input, live, prog, wpm, time}; on: {word(wi, total), finish(result)}
function create(el,on={}){
  const box=el.box,wordsEl=el.words,caret=el.caret,hid=el.input;
  let words=[],wEls=[],wi=0,typed="",wErr=[],keys=[],t0=0,running=false,finished=false,lineStep=0,liveTimer=0,lastKey=0;
  let C={ok:0,bad:0,extra:0};

  function stop(){clearInterval(liveTimer);el.live.classList.remove("show");finished=false;running=false}
  function showMsg(m){words=[];wEls=[];wordsEl.innerHTML='<div class="msgline"></div>';wordsEl.firstChild.textContent=m;wordsEl.appendChild(caret);caret.style.visibility="hidden";wordsEl.style.transform="";box.style.height=""}
  // The box must be visible when this is called so line heights can be measured.
  function begin(text,hide){
    caret.style.visibility="";
    words=text.split(" ").filter(Boolean);
    if(!words.length)return false;
    box.classList.remove("started");box.classList.toggle("hide",!!hide);wi=0;typed="";wErr=words.map(()=>false);keys=[];t0=0;running=false;finished=false;C={ok:0,bad:0,extra:0};
    clearInterval(liveTimer);el.live.classList.remove("show");
    wordsEl.innerHTML=words.map(w=>'<div class="word">'+[...w].map(ch=>"<span>"+esc(ch)+"</span>").join("")+"</div>").join("");
    wordsEl.appendChild(caret);caret.className="idle";
    wEls=[...wordsEl.querySelectorAll(".word")];
    hid.value="";layout();updLive();
    return true;
  }
  function layout(){
    if(!wEls.length)return;
    const t0p=wEls[0].offsetTop;const nxt=wEls.find(e=>e.offsetTop>t0p+2);
    lineStep=nxt?nxt.offsetTop-t0p:wEls[0].offsetHeight*1.13;
    box.style.height=Math.round(lineStep*3)+"px";
    scrollLine();placeCaret();
  }
  function scrollLine(){
    const e=wEls[wi];if(!e)return;
    const line=Math.round((e.offsetTop-wEls[0].offsetTop)/lineStep);
    wordsEl.style.transform="translateY("+(-Math.max(0,line-1)*lineStep)+"px)";
  }
  function placeCaret(){
    const e=wEls[wi];if(!e)return;const sp=e.children,wr=e.getBoundingClientRect();let r,x;
    if(typed.length<sp.length){r=sp[typed.length].getBoundingClientRect();x=r.left}
    else{r=sp[sp.length-1].getBoundingClientRect();x=r.right}
    x=e.offsetLeft+x-wr.left;const y=e.offsetTop+r.top-wr.top;
    caret.style.transform="translate("+x+"px,"+y+"px)";
  }
  function renderWord(){
    const w=words[wi],e=wEls[wi];let h="";
    for(let k=0;k<Math.max(w.length,typed.length);k++){
      if(k>=w.length)h+='<span class="x">'+esc(typed[k])+"</span>";
      else h+="<span"+(k<typed.length?(typed[k]===w[k]?' class="ok"':' class="bad"'):"")+">"+esc(w[k])+"</span>";
    }
    e.innerHTML=h;placeCaret();
  }
  function start(){box.classList.add("started");t0=performance.now();running=true;el.live.classList.add("show");liveTimer=setInterval(updLive,250)}
  function now(){return(performance.now()-t0)/1000}
  function updLive(){
    el.prog.textContent=wi+"/"+words.length;
    if(!running){el.wpm.textContent="";el.time.textContent="";return}
    const t=now();el.time.textContent=fmtT(t);
    el.wpm.textContent=t>1?Math.round(C.ok/5/(t/60))+" wpm":"";
    caret.classList.toggle("idle",performance.now()-lastKey>600);
  }
  function key(ch){
    const w=words[wi];
    if(ch===" "){
      if(!typed)return;
      if(!running)start();
      if(typed===w){keys.push([now(),1]);C.ok++;advance()}
      else{keys.push([now(),0]);C.bad++;wErr[wi]=true;const e=wEls[wi];e.classList.remove("shake");void e.offsetWidth;e.classList.add("shake")}
      return;
    }
    if(!running)start();
    const pos=typed.length,good=typed===w.slice(0,pos)&&w[pos]===ch;
    keys.push([now(),good?1:0]);
    if(good)C.ok++;else{wErr[wi]=true;pos>=w.length?C.extra++:C.bad++}
    if(typed.length<w.length+12)typed+=ch;
    if(wi===words.length-1&&typed===w){renderWord();finish();return}
  }
  function advance(){
    const e=wEls[wi];e.innerHTML=[...words[wi]].map(c=>"<span>"+esc(c)+"</span>").join("");
    e.classList.add("done");if(wErr[wi])e.classList.add("err");
    wi++;typed="";scrollLine();placeCaret();updLive();
    if(on.word)on.word(wi,words.length);
  }
  function finish(){
    finished=true;running=false;clearInterval(liveTimer);
    const T=Math.max(now(),.1),chars=words.join(" ").length,ks=keys.length,good=keys.filter(k=>k[1]).length;
    const n=Math.floor(T)>=1&&T-Math.floor(T)<.5?Math.floor(T):Math.ceil(T);
    const edges=range(0,n).map(i=>Math.min(i,T));edges[n]=T;
    const series=[];
    for(let s=1;s<=n;s++){
      const lo=edges[s-1],hi=edges[s],dur=Math.max(hi-lo,.2);
      const inB=keys.filter(k=>(s===1?k[0]>=0:k[0]>lo)&&k[0]<=hi);
      const cum=keys.filter(k=>k[0]<=hi&&k[1]).length;
      series.push({t:hi,wpm:cum/5/(Math.max(hi,.5)/60),raw:inB.length/5/(dur/60),err:inB.filter(k=>!k[1]).length});
    }
    const raws=series.map(s=>s.raw),mean=raws.reduce((a,b)=>a+b,0)/raws.length,sd=Math.sqrt(raws.reduce((a,b)=>a+(b-mean)**2,0)/raws.length);
    const clean=wErr.filter(e=>!e).length;
    if(on.finish)on.finish({T,wpm:chars/5/(T/60),raw:ks/5/(T/60),acc:ks?good/ks*100:100,wacc:clean/words.length*100,clean,series,cons:mean?Math.max(0,100*(1-sd/mean)):0,words,wErr,C});
  }

  hid.addEventListener("input",()=>{
    if(finished||!words.length){hid.value="";return}const v=hid.value;lastKey=performance.now();caret.classList.remove("idle");
    let common=0;while(common<v.length&&common<typed.length&&v[common]===typed[common])common++;
    if(common<typed.length)typed=typed.slice(0,common);
    for(const ch of v.slice(common)){key(ch);if(finished)return}
    hid.value=typed;renderWord();
  });
  hid.addEventListener("paste",e=>e.preventDefault());
  wordsEl.addEventListener("animationend",placeCaret);
  new ResizeObserver(()=>layout()).observe(box);

  return {begin,showMsg,stop,layout};
}

root.VTEngine={create,fmtT};
})(this);
