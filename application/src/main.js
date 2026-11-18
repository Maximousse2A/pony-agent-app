import './style.css';
import {renderFieldMap,focusLocation,zoomBy} from './field-map.jsx';
import {fieldMissions} from './navigation.js';
import './field.css';
import {bindSlider} from './slider.js';
import {appeal,resolveAI,resolveSupport} from './appeals.js';
import {itinerary,propose,windows} from './tours.js';
import {reportDate,shiftDay,validDay} from './reporting.js';
import {shell} from './pages.js';
import {missionSheet,receipt,demoPanel,filterPanel} from './sheets.js';
import {coordinates,initialState,advance,findMission,scenarios,review,available,originPoint} from './domain.js';

const root=document.querySelector('#app'),sheet=document.querySelector('#sheet'),announcement=document.querySelector('#announcement');
const key='ponyops.angers.field.1';
const defaults={priority:'all',location:null,type:'all',sort:'distance',status:'all',period:'day',reportDay:null,mode:'list',selected:null,folded:true};
const ui={...defaults};
let screen=null,trigger=null;
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
function draw(){
 clearSlide();
 const currentPage=page();
 root.classList.toggle('missions-home',currentPage==='missions');
 root.innerHTML=shell(currentPage,state,ui);
 if(currentPage==='missions'){
  const {list,position}=fieldMissions(state,ui);
  const trip=itinerary(state,ui.mode==='plan'?state.draft:state.tour);
  const visible=ui.mode==='plan'?[...available(state)]:[...list];
  if(state.active)visible.push(findMission(state.active.id));
  renderFieldMap(root.querySelector('#mapHost'),{missions:visible,position,selected:ui.selected,trip,onSelect:selectMission,real:!!ui.location});
 }else renderFieldMap(null);
 document.title=({missions:'Missions terrain',historique:'Historique',revenus:'Mes revenus'})[currentPage]+' · PonyOps';
}
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
window.addEventListener('hashchange',()=>{
 close();
 if(page()==='missions'){ui.mode='list';ui.folded=true;ui.selected=null;}
 draw();window.scrollTo(0,0);
});
window.addEventListener('storage',e=>{if(e.key!==key)return;state=read();if(ui.mode==='plan'&&!state.draft)ui.mode='list';draw();scheduleReviews();if(screen){if(screen.kind==='mission'&&state.history.some(h=>h.id===screen.id))display('receipt',screen.id);else display(screen.kind,screen.id);}});
function apply(event,payload,stay=false){
 const current=read(),id=current.active?.id;
 if(!id||screen?.id!==id)return;
 if(!advance(current,event,payload)||!save(current))return;
 const pos=sheet.scrollTop;
 if(event==='deposit'){ui.mode='list';ui.selected=null;ui.folded=true;}
 draw();
 if(event==='deposit')display('receipt',id);
 else display('mission',state.active.id,!stay);
 if(stay)sheet.scrollTop=pos;
}

function acceptMission(id,resume=false){
 const current=read();
 if(resume){
  if(current.active?.id===id){state=current;display('mission',id);}
  return;
 }
 if(!current.active&&advance(current,'take',id)&&save(current)){
  if(!ui.folded){ui.selected=id;ui.mode='detail';}
  draw();display('mission',id);
 }
}
const clearSlide=bindSlider(root,acceptMission);
let locating=false;
function locate(focus=true){
 if(locating)return;
 const fallback=()=>{
  locating=false;ui.location=null;
  if(page()!=='missions')return;
  draw();
  if(focus)focusLocation(coordinates(state.position||originPoint));
  say('Position indisponible. La position de démonstration est utilisée.',true);
 };
 if(!navigator.geolocation){fallback();return;}
 locating=true;
 navigator.geolocation.getCurrentPosition(({coords})=>{
  locating=false;ui.location=[coords.latitude,coords.longitude];
  if(page()!=='missions')return;
  draw();if(focus)focusLocation(ui.location);
 },fallback,{enableHighAccuracy:true,timeout:10000,maximumAge:30000});
}
function selectMission(id){
 const m=findMission(id);
 if(!m||(!available(state).some(it=>it.id===id)&&state.active?.id!==id))return;
 if(ui.type!=='all'&&m.type!==ui.type)ui.type='all';
 if(ui.priority!=='all'&&ui.priority!==String(m.priority))ui.priority='all';
 ui.mode='detail';ui.folded=false;ui.selected=id;
 draw();focusLocation(coordinates(m.point));
 root.querySelector('.vehicle-head h2')?.focus({preventScroll:true});
}
function fold(value=!ui.folded){
 if(value){ui.mode='list';ui.selected=null;}
 ui.folded=value;draw();
 root.querySelector('.dock-toggle')?.focus({preventScroll:true});
}
function planEdit(act,id){
 const current=read();
 let draft=current.draft;
 if(act==='plan'){
  if(!draft)draft=current.tour?structuredClone(current.tour):propose(current,60);
 }else if(act==='budget'){
  if(!windows.some(([min])=>min===Number(id)))return;
  draft=propose(current,Number(id));
 }else if(!draft)return;
 else if(act==='confirm-tour'){
  const trip=itinerary(current,draft);
  if(!trip.valid||trip.steps.length!==draft.ids.length){say('La disponibilité a changé. Ajustez la proposition.');return;}
  current.tour={budget:draft.budget,ids:[...draft.ids]};current.draft=null;
  if(save(current)){ui.mode='list';ui.selected=null;ui.type='all';ui.priority='all';ui.folded=false;draw();say('Tournée enregistrée. Les missions restent libres.',true);}
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
 const panelPos=root.querySelector('#dockContent')?.scrollTop||0;
 draft.ids=draft.ids.filter(id=>available(current).some(m=>m.id===id));
 current.draft=draft;
 if(!save(current))return;
 ui.mode='plan';ui.folded=false;ui.selected=null;
 draw();
 if(!['plan','budget'].includes(act)){
  root.querySelector('.plan-scroll').scrollTop=pos;
  root.querySelector('#dockContent').scrollTop=panelPos;
 }
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
if(!CSS.supports('height','100dvh')){
 const setHeight=()=>root.style.setProperty('--field-viewport',(window.visualViewport?.height||window.innerHeight)+'px');
 setHeight();
 window.addEventListener('resize',setHeight);
 window.visualViewport?.addEventListener('resize',setHeight);
}
let handleDrag=null,suppressClick=false;
root.addEventListener('pointerdown',e=>{
 const handle=e.target.closest('.dock-toggle');
 if(handle){handleDrag={id:e.pointerId,y:e.clientY};handle.setPointerCapture(e.pointerId);return;}
});
root.addEventListener('pointerup',e=>{
 if(handleDrag?.id===e.pointerId){
  const delta=e.clientY-handleDrag.y;handleDrag=null;
  if(Math.abs(delta)>24){suppressClick=true;fold(delta>0);setTimeout(()=>{suppressClick=false;},200);}
 }
});
for(const name of ['pointercancel','lostpointercapture'])root.addEventListener(name,()=>{handleDrag=null;});


document.addEventListener('click',e=>{
 const b=e.target.closest('[data-act]');if(!b || b.disabled)return;
 const {act,id}=b.dataset;
 switch(act){
  case 'select':selectMission(id);break;
  case 'take':case 'resume':acceptMission(id,act==='resume');break;
  case 'fold':if(!suppressClick)fold();break;
  case 'list':ui.mode='list';ui.folded=false;draw();root.querySelector('.selected-row')?.scrollIntoView({block:'nearest'});break;
  case 'leave-plan':ui.mode='list';ui.folded=false;draw();break;
  case 'plan':case 'budget':case 'confirm-tour':case 'up':case 'down':case 'remove':planEdit(act,id);break;
  case 'clear-tour':{const current=read();current.tour=null;current.draft=null;if(save(current))draw();break;}
  case 'appeal':case 'support':setCaseAction(act,id);break;
  case 'zoom-in':case 'zoom-out':zoomBy(act==='zoom-in'?1:-1);break;
  case 'recenter':locate();break;
  case 'mission':case 'receipt':case 'demo':case 'filter':display(act,id);break;
  case 'confirm-reset':display('reset');break;
  case 'reset':if(save(initialState())){clearTimeout(caseTimer);Object.assign(ui,defaults);go('missions');say('Démo réinitialisée.',true);}break;
  case 'close':close();break;
  case 'to-history':{
   const row=state.history.find(h=>h.id===screen?.id);
   if(row)ui.reportDay=reportDate(row.time);
   ui.status='all';go('historique');break;
  }
  case 'report-week':case 'report-day':{
   ui.reportDay=act==='report-day'?id:shiftDay(ui.reportDay||reportDate(state.now),Number(id));
   draw();
   root.querySelector(`[data-act="${act}"][data-id="${id}"]`)?.focus({preventScroll:true});
   break;
  }
  case 'status':ui.status=id;draw();break;
  case 'period':ui.period=id;draw();break;
  case 'review-ok':case 'review-no':{
   const current=read();
   if(review(current,id,act==='review-ok'?'approved':'rejected')&&save(current)){draw();display('receipt',id);}
   break;
  }
  case 'arrive':case 'arrive-depot':case 'scan':case 'unlock':case 'work':case 'deposit':apply(act);break;
  case 'retry':case 'retake':apply(act,null,true);break;
  case 'sample':apply('photo','sample',true);break;
 }
});
document.addEventListener('change',async e=>{
 const el=e.target;
 if(el.name==='report-date'){
  if(validDay(el.value))ui.reportDay=el.value;
  draw();root.querySelector('[name="report-date"]').focus({preventScroll:true});return;
 }
 if(el.name==='add-stop'&&el.value){planEdit('add-stop',el.value);return;}
 if(el.name==='scenario'&&scenarios[el.value]){const current=read();current.scenario=el.value;if(save(current))say('Scénario enregistré.',true);return;}
 if(['type','priority','sort'].includes(el.name)){ui[el.name]=el.value;ui.mode='list';ui.selected=null;draw();return;}
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
if(page()==='missions'&&state.active)display('mission',state.active.id);
navigator.permissions?.query({name:'geolocation'}).then(p=>{if(p.state==='granted'&&page()==='missions')locate(false);}).catch(()=>{});
scheduleReviews();
