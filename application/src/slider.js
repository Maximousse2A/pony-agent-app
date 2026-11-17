
function bindSlider(root,complete){
 let drag=null;
 function progress(track,value){
  track.style.setProperty('--slide',value);
  const thumb=track.querySelector('.slide-thumb');
  const travel=track.clientWidth-thumb.offsetWidth-8;
  thumb.style.transform=`translateX(${Math.max(0,travel)*value}px)`;
  thumb.setAttribute('aria-valuenow',Math.round(value*100));
  track.classList.toggle('ready',value===1);
 }
 function end(commit){
  if(!drag)return;
  const {track,ratio}=drag;drag=null;
  progress(track,0);
  if(commit&&ratio===1&&track.isConnected)complete(track.dataset.mission,track.dataset.resume==='true');
 }
 root.addEventListener('pointerdown',e=>{
  const thumb=e.target.closest('.slide-thumb');
  if(!thumb||!e.isPrimary||e.button!==0||drag)return;
  const track=thumb.parentElement;
  progress(track,0);e.preventDefault();
  drag={track,id:e.pointerId,start:e.clientX,ratio:0,travel:Math.max(1,track.clientWidth-thumb.offsetWidth-8)};
  thumb.setPointerCapture(e.pointerId);
 });
 function move(e){
  if(!drag||drag.id!==e.pointerId)return;
  drag.ratio=Math.max(0,Math.min(1,(e.clientX-drag.start)/drag.travel));
  progress(drag.track,drag.ratio);
 }
 root.addEventListener('pointermove',move);
 root.addEventListener('pointerup',e=>{if(drag?.id===e.pointerId){move(e);end(true);}});
 for(const name of ['pointercancel','lostpointercapture'])root.addEventListener(name,e=>{if(drag?.id===e.pointerId)end(false);});
 window.addEventListener('blur',()=>end(false));
 root.addEventListener('keydown',e=>{
  const thumb=e.target.closest('.slide-thumb');if(!thumb||drag)return;
  const track=thumb.parentElement,value=Number(thumb.getAttribute('aria-valuenow'))/100;
  if(!['ArrowRight','ArrowLeft','End','Home','Enter',' ','Escape'].includes(e.key))return;
  e.preventDefault();
  if(e.key==='Enter'||e.key===' '){
   if(value===1&&!e.repeat)complete(track.dataset.mission,track.dataset.resume==='true');
  }else progress(track,e.key==='End'?1:e.key==='ArrowRight'?Math.min(1,value+.25):e.key==='ArrowLeft'?Math.max(0,value-.25):0);
 });
 root.addEventListener('focusout',e=>{if(e.target.matches('.slide-thumb')&&!drag)progress(e.target.parentElement,0);});
 return ()=>end(false);
}

export {bindSlider};
