// Passage data and selection, shared by the browser and the Node server.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.VTPassage = factory();
})(this, function () {
"use strict";
const BOOKS=["Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"];
const SECTIONS=[["Law",0,4],["History",5,16],["Poetry & Wisdom",17,21],["Major Prophets",22,26],["Minor Prophets",27,38],["Gospels",39,42],["Acts",43,43],["Pauline Epistles",44,56],["General Epistles",57,64],["Revelation",65,65]];
const LENS={short:[20,45],medium:[50,100],long:[110,200]};
const ALIAS={ps:"Psalms",psa:"Psalms",psalm:"Psalms",pss:"Psalms",songofsongs:"Song of Solomon",song:"Song of Solomon",canticles:"Song of Solomon",jn:"John",jhn:"John",mk:"Mark",mrk:"Mark",mt:"Matthew",mat:"Matthew",lk:"Luke",luk:"Luke",jas:"James",jm:"James",phil:"Philippians",php:"Philippians",phm:"Philemon",philem:"Philemon",jud:"Judges",jdg:"Judges",rev:"Revelation",revelations:"Revelation",ecc:"Ecclesiastes",qoh:"Ecclesiastes",ezk:"Ezekiel",eze:"Ezekiel",sos:"Song of Solomon",judg:"Judges"};
const range=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
const wc=s=>s?s.split(" ").length:0;

function findBook(q){
  const n=q.toLowerCase().replace(/[^a-z0-9]/g,"");if(!n)return -1;
  const norm=BOOKS.map(b=>b.toLowerCase().replace(/[^a-z0-9]/g,""));
  if(ALIAS[n])return BOOKS.indexOf(ALIAS[n]);
  let i=norm.indexOf(n);if(i>=0)return i;
  const m=n.match(/^([123])(.*)$/);
  if(m&&ALIAS[m[2]]){i=norm.indexOf(m[1]+ALIAS[m[2]].toLowerCase());if(i>=0)return i}
  return norm.findIndex(b=>b.startsWith(n));
}

// Applies the punctuation/capitals settings to a passage's text.
function shape(t,o){
  if(!o.punct)t=t.replace(/-/g," ").replace(/[^A-Za-z0-9' ]/g,"").replace(/(^|\s)'+|'+(?=\s|$)/g,"$1");
  if(!o.caps)t=t.toLowerCase();
  return t.replace(/\s+/g," ").trim();
}

// rows: [[book, chapter, [verses...]], ...] as stored in kjv.js etc.
function fromRows(rows){
  const bible=BOOKS.map(()=>[]);for(const [b,c,vs] of rows)bible[b][c-1]=vs;
  let n=0;bible.forEach(b=>b.forEach(c=>n+=c.length));
  const vb=new Uint8Array(n),vc=new Uint16Array(n),vv=new Uint16Array(n),chStart=bible.map(()=>[]);
  let i=0;bible.forEach((b,bi)=>b.forEach((c,ci)=>{chStart[bi][ci]=i;c.forEach((_,k)=>{vb[i]=bi;vc[i]=ci;vv[i]=k;i++})}));

  const verse=i=>bible[vb[i]][vc[i]][vv[i]];
  const sameCh=(i,j)=>vb[i]===vb[j]&&vc[i]===vc[j];
  const ends=i=>/[.?!][)']?$/.test(verse(i));
  const bname=(b,single)=>single&&b===18?"Psalm":BOOKS[b];
  function label(a,b){
    const B=vb[a],C=vc[a]+1,V=vv[a]+1,last=bible[vb[b]][vc[b]].length;
    if(sameCh(a,b)&&vv[a]===0&&vv[b]===last-1)return bname(B,1)+" "+C;
    if(sameCh(a,b))return bname(B,1)+" "+C+":"+V+(a===b?"":"–"+(vv[b]+1));
    if(vb[a]===vb[b])return BOOKS[B]+" "+C+":"+V+"–"+(vc[b]+1)+":"+(vv[b]+1);
    return BOOKS[B]+" "+C+":"+V+" – "+BOOKS[vb[b]]+" "+(vc[b]+1)+":"+(vv[b]+1);
  }
  const mk=p=>(p.label=label(p.a,p.b),p);
  function candidates(books){const s=new Set(books),out=[];for(let i=0;i<vb.length;i++)if(s.has(vb[i])&&verse(i))out.push(i);return out}
  function randomPassage(cand,len){
    const [mn,mx]=LENS[len];let a=cand[0];
    for(let t=0;t<40;t++){a=cand[Math.floor(Math.random()*cand.length)];if(vv[a]===0||ends(a-1))break}
    let b=a,w=wc(verse(a));
    while((w<mn||(!ends(b)&&w<mx))&&b+1<vb.length&&sameCh(b+1,a)){if(w>=mn&&w+wc(verse(b+1))>mx*1.4)break;b++;w+=wc(verse(b))}
    while(w<mn&&a>0&&sameCh(a-1,b)){a--;w+=wc(verse(a))}
    return{a,b,mode:"random",label:label(a,b)};
  }
  function parseRef(str){
    const s=str.trim().replace(/[–—]/g,"-");
    const m=s.match(/^(.+?)\s*(\d+)?(?:\s*:\s*(\d+)(?:\s*-\s*(?:(\d+)\s*:\s*)?(\d+))?)?$/);
    if(!m)return"Try something like “John 3:16-21” or “Psalm 23”.";
    let name=m[1],ch=m[2];
    if(!ch&&/\d$/.test(name)){const k=name.match(/^(.*\D)(\d+)$/);if(k){name=k[1];ch=k[2]}}
    const b=findBook(name);if(b<0)return"I couldn’t find a book called “"+name.trim()+"”.";
    const c=(+ch||1)-1;if(!bible[b][c])return BOOKS[b]+" has "+bible[b].length+" chapter"+(bible[b].length>1?"s":"")+".";
    if(!m[3]){const a=chStart[b][c];return{a,b:a+bible[b][c].length-1,mode:"ref",kind:"chapter"}}
    const v1=+m[3]-1;if(!bible[b][c][v1])return BOOKS[b]+" "+(c+1)+" has "+bible[b][c].length+" verses.";
    const c2=m[4]?+m[4]-1:c,v2=m[5]?+m[5]-1:v1;
    if(!bible[b][c2]||!bible[b][c2][v2])return"That range runs past the end of the chapter.";
    const a=chStart[b][c]+v1,e=chStart[b][c2]+v2;if(e<a)return"The range ends before it starts.";
    return{a,b:e,mode:"ref",kind:"verses"};
  }
  function nextRef(p){
    const N=vb.length;
    if(p.kind==="chapter"){const a=(p.b+1)%N;return mk({a,b:a+bible[vb[a]][vc[a]].length-1,mode:"ref",kind:"chapter"})}
    const span=p.b-p.a,a=(p.b+1)%N;let b=a;while(b-a<span&&b+1<N&&vb[b+1]===vb[a])b++;
    return mk({a,b,mode:"ref",kind:"verses"});
  }
  function text(a,b){let t="";for(let i=a;i<=b;i++)if(verse(i))t+=(t?" ":"")+verse(i);return t}

  return {bible,vb,vc,vv,chStart,verse,label,mk,candidates,randomPassage,parseRef,nextRef,text};
}

return {BOOKS,SECTIONS,LENS,range,findBook,shape,fromRows};
});
