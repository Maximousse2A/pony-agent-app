import './style.css';
import {shell} from './pages.js';
import {missionSheet,receipt,demoPanel,filterPanel} from './sheets.js';
import {initialState,advance,findMission,scenarios,review} from './domain.js';

const root=document.querySelector('#app'),sheet=document.querySelector('#sheet'),announcement=document.querySelector('#announcement');
const key='ponyops.angers.field.1';
const ui={type:'all',sort:'distance',status:'all',period:'day'};
let screen=null,trigger=null,view={zoom:1,x:0,y:0},drag=null;
function read(){
 try{
  const s=JSON.parse(localStorage.getItem(key));
  if(s?.version===1 && Array.isArray(s.history) && Number.isFinite(s.now) && scenarios[s.scenario] && (!s.active||findMission(s.active.id)))return s;
 }catch{}
 return initialState();
}
let state=read();
function say(message){announcement.textContent=message;}
function save(next){
 try{localStorage.setItem(key,JSON.stringify(next));state=next;return true;}
 catch{say('Enregistrement local impossible. Libérez de l’espace ou autorisez le stockage pour poursuivre.');return false;}
}
function page(){return ['historique','revenus'].includes(location.hash.slice(1))?location.hash.slice(1):'missions';}
function draw(){root.innerHTML=shell(page(),state,ui);syncMap();document.title=({missions:'Missions terrain',historique:'Historique',revenus:'Mes revenus'})[page()]+' · PonyOps';}
function sheetContent(){
 if(!screen)return '';
 if(screen.kind==='demo')return demoPanel(state,false);
 if(screen.kind==='reset')return demoPanel(state,true);
 if(screen.kind==='filter')return filterPanel(ui);
 if(screen.kind==='receipt'){const h=state.history.find(x=>x.id===screen.id);return h?receipt(h):'';}
 const m=findMission(screen.id);return m?missionSheet(m,state):'';
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
window.addEventListener('storage',e=>{if(e.key!==key)return;state=read();draw();if(screen){if(screen.kind==='mission'&&state.history.some(h=>h.id===screen.id))display('receipt',screen.id);else display(screen.kind,screen.id);}});
function apply(event,payload,stay=false){
 const current=read(),id=current.active?.id;
 if(event!=='take' && (!id||screen?.id!==id))return;
 if(!advance(current,event,payload)||!save(current))return;
 const pos=sheet.scrollTop;
 draw();
 if(event==='deposit')display('receipt',id);
 else display('mission',state.active.id,!stay);
 if(stay)sheet.scrollTop=pos;
}
function syncMap(){
 const plane=document.querySelector('#mapPlane');if(!plane)return;
 const w=plane.clientWidth,h=plane.clientHeight;
 const limitX=(view.zoom-1)*w/2,limitY=(view.zoom-1)*h/2;
 view.x=Math.max(-limitX,Math.min(limitX,view.x));view.y=Math.max(-limitY,Math.min(limitY,view.y));
 plane.style.transform=`translate(${view.x}px,${view.y}px) scale(${view.zoom})`;plane.style.setProperty('--inverse',1/view.zoom);
 document.querySelector('[data-act="zoom-out"]').disabled=view.zoom<=1;
 document.querySelector('[data-act="zoom-in"]').disabled=view.zoom>=2;
}
window.addEventListener('resize',syncMap);
root.addEventListener('pointerdown',e=>{const box=e.target.closest('#mapWindow');if(!box||e.target.closest('button')||view.zoom<=1)return;drag={x:e.clientX,y:e.clientY,dx:view.x,dy:view.y};box.setPointerCapture(e.pointerId);});
root.addEventListener('pointermove',e=>{if(!drag)return;view.x=drag.dx+e.clientX-drag.x;view.y=drag.dy+e.clientY-drag.y;syncMap()});
for(const name of ['pointerup','pointercancel','lostpointercapture'])root.addEventListener(name,()=>{drag=null});
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-act]');if(!b || b.disabled)return;
 const {act,id}=b.dataset;
 switch(act){
  case 'zoom-in':case 'zoom-out':view.zoom=Math.max(1,Math.min(2,view.zoom+(act==='zoom-in'?.25:-.25)));syncMap();break;
  case 'recenter':view={zoom:1,x:0,y:0};syncMap();break;
  case 'mission':case 'receipt':case 'demo':case 'filter':display(act,id);break;
  case 'confirm-reset':display('reset');break;
  case 'reset':if(save(initialState())){Object.assign(ui,{type:'all',sort:'distance',status:'all',period:'day'});view={zoom:1,x:0,y:0};go('missions');say('Démo réinitialisée.');}break;
  case 'close':close();break;
  case 'to-history':ui.status='all';go('historique');break;
  case 'status':ui.status=id;draw();break;
  case 'period':ui.period=id;draw();break;
  case 'review-ok':case 'review-no':{
   const current=read();
   if(review(current,id,act==='review-ok'?'approved':'rejected')&&save(current)){draw();display('receipt',id);}
   break;
  }
  case 'take':apply('take',id);break;
  case 'scan':case 'unlock':case 'work':case 'deposit':apply(act);break;
  case 'retry':case 'retake':apply(act,null,true);break;
  case 'sample':apply('photo','sample',true);break;
 }
});
document.addEventListener('change',async e=>{
 const el=e.target;
 if(el.name==='scenario'&&scenarios[el.value]){const current=read();current.scenario=el.value;if(save(current))say('Scénario enregistré.');return;}
 if(['type','sort'].includes(el.name)){ui[el.name]=el.value;draw();return;}
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

