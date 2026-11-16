
const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const path=require('node:path');
async function run(){
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const evidence=[];
 const target=process.env.PONY_QA_URL||'https://maximousse2a.github.io/pony-agent-app/terrain/';
 async function device(width,height,scenario,expected,opts={}){
  const ctx=await browser.newContext({viewport:{width,height},isMobile:width<=700,hasTouch:width<=700});
  try{
   const p=await ctx.newPage();p.setDefaultTimeout(8000);
   const errors=[];p.on('pageerror',e=>errors.push(e.message));
   const result=await p.goto(target,{waitUntil:'networkidle'});
   assert.equal(result.status(),200);
   await p.getByRole('heading',{name:'Missions terrain'}).waitFor();
   const btn=(name)=>p.getByRole('button',{name,exact:true});
   const tap=(act)=>p.locator('[data-act="'+act+'"]:visible').click();
   const reset=async()=>{await tap('demo');await tap('confirm-reset');await tap('reset');};
   const fit=async()=>{assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),'Horizontal overflow');};
   await fit();
   assert.equal(await p.locator('.pin').count(),8);
   await tap('zoom-in');await tap('recenter');
   await tap('filter');await p.getByLabel('Changement de batterie',{exact:true}).check();
   await p.getByLabel('Échéance la plus proche',{exact:true}).check();
   await btn('Afficher les missions').click();assert.equal(await p.locator('.pin').count(),2);
   await reset();await tap('demo');await p.getByLabel(scenario,{exact:true}).check();await btn('Revenir à la tournée').click();
   const row=opts.charge?'AG-2061':opts.battery?'AG-2059':opts.shop?'AG-2032':'AG-2048';
   const selectVia=opts.map?'.pin':'.mission-row';
   await p.locator(selectVia+'[data-id="'+row+'"]').click();
   await p.getByRole('heading',{name:'Motif de création'}).waitFor();
   await btn('Prendre cette mission').click();await btn('Simuler le scan').click();
   await btn('Simuler le déverrouillage').click();await tap('work');
   assert.equal(await p.locator('[data-act="deposit"]').isDisabled(),true);await fit();
   if(opts.file){await p.locator('#photoInput').setInputFiles(path.join(__dirname,'../src/assets/bike.jpg'));await p.getByText('Photo ajoutée sur cet appareil',{exact:true}).waitFor();}
   else await tap('sample');
   if(opts.resume){await p.reload();await p.locator('.in-progress').click();assert.equal(await p.locator('.proof-image img').count(),1);}
   if(opts.retry)await tap('retry');
   if(opts.retake){await tap('retake');assert.equal(await p.locator('[data-act="deposit"]').isDisabled(),true);await tap('sample');}
   await tap('deposit');await p.getByRole('heading',{name:'Résultat du dépôt'}).waitFor();
   assert.equal(await p.locator('.receipt-result .status').innerText(),expected);
   await fit();await p.getByText('Afficher la photo du dépôt',{exact:true}).click();
   assert.ok(await p.locator('.receipt-photo').evaluate(i=>i.complete&&i.naturalWidth>0));
   if(opts.review){await p.getByText('Simuler la décision de supervision',{exact:true}).click();await tap('review-ok');assert.equal(await p.locator('.receipt-result .status').innerText(),'Approuvée');}
   await tap('to-history');assert.equal(await p.locator('.history-row').count(),7);
   if(expected==='Rejetée'){await btn('Rejetées').click();assert.equal(await p.locator('.history-row').count(),2);}
   await p.getByRole('link',{name:'Revenus',exact:true}).click();
   const amount=await p.locator('.earn-hero strong').innerText();
   const expectedAmount=expected==='Rejetée'?9.50:opts.review||expected==='Approuvée'?9.50+(opts.battery?2.5:opts.shop?6:opts.charge?7:4):9.50;
   assert.equal(Number(amount.replace(/[^0-9,]/g,'').replace(',','.')),expectedAmount);
   await reset();assert.equal(await p.locator('.pin').count(),8);await fit();
   assert.deepEqual(errors,[]);
   evidence.push({viewport:[width,height],scenario,expected,approvedRevenue:amount,options:opts,http:result.status(),pageErrors:errors.length});
   console.log('PASS',width,height,scenario,expected,amount);
  }finally{await ctx.close();}
 }
 try{
  await device(390,844,'GPS en bord de zone','En attente',{resume:true,review:true,map:true});
  await device(320,640,'Position hors zone','Rejetée',{charge:true});
  await device(1440,900,'Photo inexploitable','Rejetée',{shop:true});
  await device(390,844,'Dépôt conforme','Approuvée',{file:true,battery:true});
  await device(390,844,'GPS en bord de zone','Approuvée',{retry:true});
  await device(390,844,'Photo inexploitable','Approuvée',{retake:true});
  console.log('PONYOPS_BROWSER_VERIFIED',JSON.stringify({target,browser:browser.version(),evidence}));
 }finally{await browser.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1});
