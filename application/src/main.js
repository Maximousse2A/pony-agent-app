import './style.css';
import './field.css';
import {bindSlider} from './slider.js';
import {appeal,resolveAI,resolveSupport} from './appeals.js';
import {itinerary,propose,windows} from './tours.js';
import {shell} from './pages.js';
import {missionSheet,receipt,demoPanel,filterPanel} from './sheets.js';
import {initialState,advance,findMission,scenarios,review,available,originPoint} from './domain.js';

const root=document.querySelector('#app'),sheet=document.querySelector('#sheet'),announcement=document.querySelector('#announcement');
const key='ponyops.angers.field.1';
const defaults={type:'all',sort:'distance',status:'all',period:'day',mode:'list',selected:null,folded:false};
const ui={...defaults};
let screen=null,trigger=null,view={zoom:1,x:0,y:0},drag=null;
function read(){
 try{
  const s=JSON.parse(localStorage.getItem(key));
  if(s?.version===1 && Array.isArray(s.history) && Number.isFinite(s.now) && scenarios[s.scenario] && (!s.active||findMission(s.active.id)))return s;
 }catch{}
 return initialState();
}
let state=read();
let noticeTimer;
function say(message, temporary=false){
 clearTimeout(noticeTimer);
 announcement.textContent=message;
 if(temporary)noticeTimer=setTimeout(()=>{announcement.textContent='';},3200);
}
function save(next){
 try{localStorage.setItem(key,JSON.stringify(next));state=next;return true;}
 catch{say('Enregistrement local impossible. Libérez de l’espace ou autorisez le stockage pour poursuivre.');return false;}
}
function page(){return ['historique','revenus'].includes(location.hash.slice(1))?location.hash.slice(1):'missions';}
function draw(){clearSlide();root.innerHTML=shell(page(),state,ui);syncMap();document.title=({missions:'Missions terrain',historique:'Historique',revenus:'Mes revenus'})[page()]+' · PonyOps';}
function sheetContent(){
 if(!screen)return '';
 if(screen.kind==='demo')return demoPanel(state,false);
 if(screen.kind==='reset')return demoPanel(state,true);
 if(screen.kind==='filter')return filterPanel(ui);
 if(screen.kind==='receipt'){const h=state.history.find(x=>x.id===screen.id);return h?receipt(h):'';}
 const m=findMission(screen.id);return m && m.id===state.active?.id?missionSheet(m,state):'';
}
function display(kind,id,focus=true){
 const old=screen;screen={kind,id};
 if(!sheet.open)trigger=document.activeElement?.closest('[data-act]')?.dataset;
 const html=sheetContent();
 if(!html){close();return;}
 sheet.innerHTML=html;sheet.setAttribute('aria-labelledby','sheetTitle');
 if(!sheet.open){sheet.showModal();document.body.classList.add('modal-open');}
 if(focus){sheet.scrollTop=0;sheet.querySelector('#sheetTitle').focus({preventScroll:true});}
 else if(!old)sheet.scrollTop=0;
}
function close(){if(sheet.open)sheet.close();screen=null;document.body.classList.remove('modal-open');}
sheet.addEventListener('close',()=>{
 if(sheet.open)return;
 screen=null;document.body.classList.remove('modal-open');
 if(trigger){const el=[...root.querySelectorAll('[data-act]')].find(b=>b.dataset.act===trigger.act && b.dataset.id===trigger.id);el?.focus({preventScroll:true});}trigger=null;
});
sheet.addEventListener('click',e=>{if(e.target!==sheet)return;const b=sheet.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)close()});
function go(to){close();if(page()===to)draw();else location.hash=to;}
window.addEventListener('hashchange',()=>{close();draw();window.scrollTo(0,0)});
window.addEventListener('storage',e=>{if(e.key!==key)return;state=read();if(ui.mode==='plan'&&!state.draft)ui.mode='list';draw();scheduleReviews();if(screen){if(screen.kind==='mission'&&state.history.some(h=>h.id===screen.id))display('receipt',screen.id);else display(screen.kind,screen.id);}});
function apply(event,payload,stay=false){
 const current=read(),id=current.active?.id;
 if(!id||screen?.id!==id)return;
 if(!advance(current,event,payload)||!save(current))return;
 const pos=sheet.scrollTop;
 if(event==='deposit'){ui.mode='list';ui.selected=null;}
 draw();
 if(event==='deposit')display('receipt',id);
 else display('mission',state.active.id,!stay);
 if(stay)sheet.scrollTop=pos;
}

const clearSlide=bindSlider(root,(id,resume)=>{
 const current=read();
 if(resume){
  if(current.active?.id===id){state=current;display('mission',id);}
  return;
 }
 if(!current.active&&advance(current,'take',id)&&save(current)){
  ui.selected=id;ui.mode='detail';draw();display('mission',id);
 }
});
function mapSize(){
 const box=document.querySelector('#mapWindow'),plane=document.querySelector('#mapPlane');
 if(!box||!plane)return null;
 const width=box.clientWidth,height=box.clientHeight;
 const w=Math.max(width,height*1.4),h=w/1.4;
 plane.style.width=w+'px';plane.style.height=h+'px';
 return {plane,width,height,w,h};
}
function syncMap(){
 const s=mapSize();if(!s)return;
 const {plane,width,height,w,h}=s;
 const mx=(w*view.zoom-width)/2,my=(h*view.zoom-height)/2;
 view.x=Math.max(-mx,Math.min(mx,view.x));view.y=Math.max(-my,Math.min(my,view.y));
 plane.style.transform=`translate(-50%,-50%) translate(${view.x}px,${view.y}px) scale(${view.zoom})`;
 plane.style.setProperty('--inverse',1/view.zoom);
 root.querySelector('[data-act="zoom-out"]').disabled=view.zoom<=1;
 root.querySelector('[data-act="zoom-in"]').disabled=view.zoom>=5;
}
function framePoint(p){
 const s=mapSize();if(!s)return;
 const dock=document.querySelector('#fieldDock').getBoundingClientRect();
 const mobile=window.innerWidth<=700;
 const x=mobile?s.width*.5:(dock.right+s.width)*.5;
 const y=mobile?Math.max(85,(dock.top+40)*.5):s.height*.48;
 const px=p[0]/100,py=p[1]/100;
 view.zoom=Math.min(5,Math.max(1,view.zoom,x/(px*s.w),(s.width-x)/((1-px)*s.w),y/(py*s.h),(s.height-y)/((1-py)*s.h)));
 view.x=x-s.width/2-(px-.5)*s.w*view.zoom;
 view.y=y-s.height/2-(py-.5)*s.h*view.zoom;
 syncMap();
}
function selectMission(id){
 const m=findMission(id);
 if(!m||(!available(state).some(it=>it.id===id)&&state.active?.id!==id))return;
 if(ui.type!=='all'&&m.type!==ui.type)ui.type='all';
 ui.mode='detail';ui.folded=false;ui.selected=id;view.zoom=1;
 draw();framePoint(m.point);
 root.querySelector('.vehicle-head h2')?.focus({preventScroll:true});
}
function fold(value=!ui.folded){
 ui.folded=value;draw();
 if(ui.selected&&ui.mode==='detail')framePoint(findMission(ui.selected).point);
 root.querySelector('.dock-handle')?.focus({preventScroll:true});
}
function planEdit(act,id){
 const current=read();
 let draft=current.draft;
 if(act==='plan'){
  if(!draft)draft=current.tour?structuredClone(current.tour):propose(current,60);
  view={zoom:1,x:0,y:0};
 }else if(act==='budget'){
  if(!windows.some(([min])=>min===Number(id)))return;
  draft=propose(current,Number(id));
 }else if(!draft)return;
 else if(act==='confirm-tour'){
  const trip=itinerary(current,draft);
  if(!trip.valid||trip.steps.length!==draft.ids.length){say('La disponibilité a changé. Ajustez la proposition.');return;}
  current.tour={budget:draft.budget,ids:[...draft.ids]};current.draft=null;
  if(save(current)){ui.mode='list';ui.selected=null;ui.type='all';ui.folded=false;draw();say('Tournée enregistrée. Les missions restent libres.',true);}
  return;
 }else{
  const i=draft.ids.indexOf(id);
  if(act==='add-stop'){
   if(i>=0||!available(current).some(m=>m.id===id))return;
   draft.ids.push(id);
  }else if(i<0)return;
  else if(act==='remove')draft.ids.splice(i,1);
  else{
   const dest=i+(act==='up'?-1:1);if(dest<0||dest>=draft.ids.length)return;
   [draft.ids[i],draft.ids[dest]]=[draft.ids[dest],draft.ids[i]];
  }
 }
 const pos=root.querySelector('.plan-scroll')?.scrollTop||0;
 draft.ids=draft.ids.filter(id=>available(current).some(m=>m.id===id));
 current.draft=draft;
 if(!save(current))return;
 ui.mode='plan';ui.folded=false;ui.selected=null;
 draw();
 if(!['plan','budget'].includes(act))root.querySelector('.plan-scroll').scrollTop=pos;
}
function setCaseAction(act,id){
 const current=read();
 const changed=act==='appeal'?appeal(current,id):resolveSupport(current,id);
 if(changed&&save(current)){draw();display('receipt',id);scheduleReviews();}
}
let caseTimer;
function scheduleReviews(){
 clearTimeout(caseTimer);
 const current=read(),waiting=current.history.filter(h=>h.appeal?.stage==='checking');
 if(!waiting.length)return;
 const delay=Math.max(0,Math.min(...waiting.map(h=>h.appeal.due))-Date.now());
 caseTimer=setTimeout(()=>{
  const latest=read();
  let changed=false;
  for(const h of latest.history)if(resolveAI(h))changed=true;
  if(changed){
   if(!save(latest))return;
   draw();if(screen?.kind==='receipt')display('receipt',screen.id);
  }
  scheduleReviews();
 },delay+25);
}
window.addEventListener('resize',()=>{if(ui.selected&&ui.mode==='detail')framePoint(findMission(ui.selected).point);else syncMap();});
let handleDrag=null,suppressClick=false;
root.addEventListener('pointerdown',e=>{
 const handle=e.target.closest('.dock-handle');
 if(handle){handleDrag={id:e.pointerId,y:e.clientY};handle.setPointerCapture(e.pointerId);return;}
 const box=e.target.closest('#mapWindow');if(!box||e.target.closest('button')||!e.isPrimary)return;
 drag={id:e.pointerId,x:e.clientX,y:e.clientY,dx:view.x,dy:view.y};box.setPointerCapture(e.pointerId);
});
root.addEventListener('pointermove',e=>{
 if(drag?.id!==e.pointerId)return;
 view.x=drag.dx+e.clientX-drag.x;view.y=drag.dy+e.clientY-drag.y;syncMap();
});
root.addEventListener('pointerup',e=>{
 if(handleDrag?.id===e.pointerId){
  const delta=e.clientY-handleDrag.y;handleDrag=null;
  if(Math.abs(delta)>24){suppressClick=true;fold(delta>0);setTimeout(()=>{suppressClick=false;},200);}
 }
 drag=null;
});
for(const name of ['pointercancel','lostpointercapture'])root.addEventListener(name,()=>{drag=null;handleDrag=null;});


document.addEventListener('click',e=>{
 const b=e.target.closest('[data-act]');if(!b || b.disabled)return;
 const {act,id}=b.dataset;
 switch(act){
  case 'select':selectMission(id);break;
  case 'fold':if(!suppressClick)fold();break;
  case 'list':ui.mode='list';ui.folded=false;draw();root.querySelector('.selected-row')?.scrollIntoView({block:'nearest'});break;
  case 'leave-plan':ui.mode='list';ui.folded=false;draw();break;
  case 'plan':case 'budget':case 'confirm-tour':case 'up':case 'down':case 'remove':planEdit(act,id);break;
  case 'clear-tour':{const current=read();current.tour=null;current.draft=null;if(save(current))draw();break;}
  case 'appeal':case 'support':setCaseAction(act,id);break;
  case 'zoom-in':case 'zoom-out':view.zoom=Math.max(1,Math.min(5,view.zoom+(act==='zoom-in'?.25:-.25)));syncMap();break;
  case 'recenter':view={zoom:1,x:0,y:0};framePoint(state.position||originPoint);break;
  case 'mission':case 'receipt':case 'demo':case 'filter':display(act,id);break;
  case 'confirm-reset':display('reset');break;
  case 'reset':if(save(initialState())){clearTimeout(caseTimer);Object.assign(ui,defaults);view={zoom:1,x:0,y:0};go('missions');say('Démo réinitialisée.',true);}break;
  case 'close':close();break;
  case 'to-history':ui.status='all';go('historique');break;
  case 'status':ui.status=id;draw();break;
  case 'period':ui.period=id;draw();break;
  case 'review-ok':case 'review-no':{
   const current=read();
   if(review(current,id,act==='review-ok'?'approved':'rejected')&&save(current)){draw();display('receipt',id);}
   break;
  }
  case 'scan':case 'unlock':case 'work':case 'deposit':apply(act);break;
  case 'retry':case 'retake':apply(act,null,true);break;
  case 'sample':apply('photo','sample',true);break;
 }
});
document.addEventListener('change',async e=>{
 const el=e.target;
 if(el.name==='add-stop'&&el.value){planEdit('add-stop',el.value);return;}
 if(el.name==='scenario'&&scenarios[el.value]){const current=read();current.scenario=el.value;if(save(current))say('Scénario enregistré.',true);return;}
 if(['type','sort'].includes(el.name)){ui[el.name]=el.value;ui.mode='list';ui.selected=null;draw();return;}
 if(el.id!=='photoInput'||!el.files?.[0])return;
 const missionId=state.active?.id;
 const url=URL.createObjectURL(el.files[0]);
 try{
  const img=new Image();img.src=url;await img.decode();
  const ratio=Math.min(1,800/Math.max(img.width,img.height)),canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(img.width*ratio));canvas.height=Math.max(1,Math.round(img.height*ratio));
  canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
  if(missionId===read().active?.id && screen?.id===missionId)apply('photo',canvas.toDataURL('image/jpeg',.68),true);
 }catch{say('Cette image ne peut pas être ouverte. Essayez une photo JPEG ou la photo de démo.');}
 finally{URL.revokeObjectURL(url);}
});
draw();
scheduleReviews();
