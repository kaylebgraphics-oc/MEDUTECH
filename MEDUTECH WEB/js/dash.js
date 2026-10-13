(()=>{const $=s=>document.querySelector(s),L=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'),
U=L('mt-session',{}),tips=['Drink a glass of water as soon as you wake up.','A 20-minute walk most days protects your heart.','Sleep and wake at the same time each day.','Wash your hands before eating and after the toilet.','Sleep under a treated net to prevent malaria.','Add one vegetable to every meal today.','Get your blood pressure checked at least once a year.'];
function draw(){const h=new Date().getHours(),today=new Date().toISOString().slice(0,10);
$('#gr').textContent=t(h<12?'d_am':h<17?'d_pm':'d_ev')+',';$('#dn').textContent=(U.guest?'':(U.name||'').split(' ')[0]);
const a=L('mt-apts',[]).filter(x=>x.date>=today).sort((x,y)=>(x.date+x.time).localeCompare(y.date+y.time))[0];
$('#na').innerHTML=a?`<p class="big">${esc(a.type)}</p><p class="hint">${new Date(a.date+'T12:00').toDateString()} at ${esc(a.time)}${a.place?', '+esc(a.place):''}</p><a class="btn ghost" href="schedule.html" data-t="n_sch"></a>`:`<div class="emp"><img src="assets/art/calendar.svg" alt=""><p data-t="d_none"></p></div><a class="btn" href="schedule.html" data-t="d_book"></a>`;
const H=L('mt-hab2',{}),sm=H.sum||{},dk=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'),yd=new Date();yd.setDate(yd.getDate()-1);
const p=sm.date===dk(new Date())?sm.pct:0,sk=sm.date===dk(new Date())||sm.date===dk(yd)?(sm.streak||0):0;
$('#pr').style.strokeDashoffset=314-314*p/100;$('#pc').innerHTML=p+'%';$('#sm').textContent=sk?sk+(sk===1?' day':' days')+' in a row':'Start a streak today';
const ls=L('mt-lastsym',null);$('#ls').innerHTML=ls&&ls.symptoms?`<p class="big">${esc((ls.top&&ls.top[0])||'Symptom check')}</p><p class="hint">${esc(ls.symptoms.slice(0,4).join(', '))}${ls.symptoms.length>4?' and more':''}<br>${new Date(ls.date+'T12:00').toDateString()}${ls.urgent?' · warning signs were flagged':''}</p><a class="btn ghost" href="symptoms.html">Check again</a>`:`<p class="hint">You have not checked any symptoms yet.</p><a class="btn" href="symptoms.html">Check symptoms</a>`;
$('#tp').textContent=tips[Math.floor(Date.now()/864e5)%tips.length];applyLang()}
draw();document.addEventListener('langchange',draw)})();
