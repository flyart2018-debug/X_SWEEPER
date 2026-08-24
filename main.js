const A="./assets/";
const chars={
 REN:{id:"REN",name:"レン・クロス",type:"バランス型",weapon:"ブレード",accent:"#287dff",desc:"攻撃・防御・移動を平均的に扱えるオールラウンダー。",quote:"守るために、強くなる。それだけだ。",frames:{idle:"ren-idle.png",move:"ren-move.png",attack:"ren-attack.png",dash:"ren-dash.png",overdrive:"ren-overdrive.png"},count:{idle:4,move:5,attack:5,dash:4,overdrive:9}},
 KAI:{id:"KAI",name:"カイ・ヴェルド",type:"スピード型",weapon:"ナイフ",accent:"#74ff45",desc:"高い機動力で攻撃と離脱を繰り返す高速型。",quote:"俺は止まらない。一歩先、そこにだけ勝ちがある。",frames:{idle:"kai-idle.png",move:"kai-move.png",attack:"kai-attack.png",dash:"kai-dash.png",step:"kai-step.png"},count:{idle:6,move:4,attack:10,dash:5,step:6}}
};
const chips=[
 {id:"unique",name:"オーバーブレード",key:"O",c:"#00cfff",art:"⚔",desc:"次の攻撃を+50。",state:"overdrive",only:"REN"},
 {id:"sword",name:"ソード",key:"S",c:"#ff9b2f",art:"◒",desc:"前後左右3マス以内に40ダメージ。",state:"attack"},
 {id:"shot",name:"ショット",key:"S",c:"#2497ff",art:"➤",desc:"前後左右3マス以内に20ダメージ。",state:"attack"},
 {id:"shield",name:"シールド",key:"G",c:"#73ff58",art:"⬡",desc:"次のダメージを50%軽減。",state:"idle"},
 {id:"dash",name:"ダッシュ",key:"D",c:"#ff9b2f",art:"➜",desc:"前方に2マス移動。",state:"dash"},
 {id:"recover",name:"リカバー",key:"R",c:"#45ff87",art:"＋",desc:"HPを30回復。",state:"idle"},
];
let current=chars.REN, selected=null, frame=0, timer=null, turn=1, hp=100, ehp=100, playerPos={r:4,c:2}, enemyPos={r:0,c:2};

const $=id=>document.getElementById(id);
function spriteEl(ch,state="idle",big=false){
 const el=document.createElement("div"); el.className="sprite"; el.dataset.count=ch.count[state]||4;
 el.style.backgroundImage=`url("${A+(ch.frames[state]||ch.frames.idle)}")`;
 el.style.backgroundSize=`${el.dataset.count*100}% 100%`;
 el.style.width=big?"180px":"120px"; el.style.height=big?"120px":"90px";
 el.dataset.frame="0"; return el;
}
function animate(el,ch,state){
 clearInterval(timer); if(!el)return;
 const count=ch.count[state]||4; let f=0;
 const tick=()=>{el.style.backgroundPosition=`${count===1?0:(f*100/(count-1))}% 50%`;f=(f+1)%count};
 tick(); timer=setInterval(tick,110);
}
function renderSelect(){
 const list=$("character-list"); list.innerHTML="";
 Object.values(chars).forEach(ch=>{
  const card=document.createElement("article");card.className="char-card";card.style.setProperty("--accent",ch.accent);
  const visual=document.createElement("div");visual.className="card-sprite";const sp=spriteEl(ch,"idle");visual.append(sp);
  const info=document.createElement("div");info.innerHTML=`<div class="type">${ch.type}</div><h2>${ch.name}</h2><p>${ch.desc}</p><div class="weapon">WEAPON：${ch.weapon}</div>`;
  const btn=document.createElement("button");btn.className="select";btn.textContent="SELECT";btn.onclick=()=>startBattle(ch.id);
  card.append(visual,info,btn);list.append(card);animate(sp,ch,"idle");
 });
}
function startBattle(id){current=chars[id];selected=null;turn=1;hp=100;ehp=100;playerPos={r:4,c:2};enemyPos={r:0,c:2};$("select").classList.remove("active");$("battle").classList.add("active");renderBattle();setMotion("idle","IDLE");}
function renderBattle(){
 $("pName").textContent=current.name.replace("・"," ");
 $("pHp").textContent=`${hp} / 100`; $("eHp").textContent=`${ehp} / 100`;
 $("pBar").style.width=hp+"%";$("eBar").style.width=ehp+"%";$("turn").textContent=String(turn).padStart(2,"0");
 renderField();renderChips();
}
function renderField(){
 const f=$("field");f.innerHTML="";
 for(let r=0;r<5;r++)for(let c=0;c<5;c++){
  const cell=document.createElement("div");cell.className="cell";
  if(r===enemyPos.r&&c===enemyPos.c){cell.classList.add("cpu");const m=document.createElement("div");m.className="cpu-mark";m.textContent="CPU";cell.append(m)}
  if(r===playerPos.r&&c===playerPos.c){cell.classList.add("player");const sp=spriteEl(current,"idle");sp.style.width="80px";sp.style.height="65px";cell.append(sp);animate(sp,current,"idle")}
  if(Math.abs(r-playerPos.r)+Math.abs(c-playerPos.c)===1)cell.classList.add("move");
  const b=document.createElement("button");b.onclick=()=>moveTo(r,c);cell.append(b);f.append(cell);
 }
 $("distance").textContent=Math.abs(enemyPos.r-playerPos.r)+Math.abs(enemyPos.c-playerPos.c);
}
function moveTo(r,c){
 const d=Math.abs(r-playerPos.r)+Math.abs(c-playerPos.c); if(d!==1)return;
 playerPos={r,c};turn++;$("next").textContent="ATTACK";$("log").textContent=`PLAYER MOVED → ${r+1}-${c+1}`;renderBattle();setMotion("move","MOVE");
 if(Math.abs(r-enemyPos.r)+Math.abs(c-enemyPos.c)<=3){setTimeout(()=>cpuAttack(),350)}
}
function cpuAttack(){ehp=Math.max(0,ehp-0);hp=Math.max(0,hp-15);$("log").textContent="CPU ATTACK → 15 DAMAGE";turn++;renderBattle();}
function renderChips(){
 const grid=$("chipsGrid");grid.innerHTML="";
 chips.filter(x=>!x.only||x.only===current.id).forEach(ch=>{
  const el=document.createElement("button");el.className="chip"+(selected===ch.id?" selected":"");el.style.setProperty("--c",ch.c);
  el.innerHTML=`<div class="chip-art">${ch.art}</div><strong><b>${ch.key}</b> ${ch.name}</strong><small>${ch.desc}</small>`;
  el.onclick=()=>{selected=selected===ch.id?null:ch.id;renderChips(); if(selected){const x=chips.find(v=>v.id===selected);setMotion(x.state,x.state==="overdrive"?"OVER BLADE":x.state==="dash"?"DASH":"ATTACK");$("log").textContent=`SELECTED → ${x.name}`;}};grid.append(el);
 });
}
function setMotion(state,label){
 const stage=$("motionSprite");stage.innerHTML="";const sp=spriteEl(current,state,true);stage.append(sp);$("motionName").textContent=`${current.name.split("・")[0].toUpperCase()} / ${label}`;animate(sp,current,state);
}
$("clearBtn").onclick=()=>{selected=null;renderChips();setMotion("idle","IDLE");$("log").textContent="CHIP SELECTION CLEARED"};
$("backBtn").onclick=()=>{$("battle").classList.remove("active");$("select").classList.add("active");renderSelect()};
renderSelect();
