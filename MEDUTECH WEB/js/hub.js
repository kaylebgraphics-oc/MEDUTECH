(()=>{const $=s=>document.querySelector(s),L=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},S=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
/* Set CHAT_ENDPOINT to your server URL (POST {messages} -> {reply}) to use a real AI model. */
const CHAT_ENDPOINT='/api/chat';let fb=0,warned=0;const fmt=t=>t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/^[-*] /gm,'\u2022 ').replace(/\n/g,'<br>');
const today=new Date().toISOString().slice(0,10);
/* schedule */
if($('#sf')){
let slot='',apts=L('mt-apts',[]);const sd=$('#sd');sd.min=today;sd.value=today;
['08:00','09:30','11:00','13:00','14:30','16:00'].forEach(t=>{const b=document.createElement('button');b.type='button';b.className='slot';b.textContent=t;b.onclick=()=>{slot=t;document.querySelectorAll('.slot').forEach(x=>x.classList.toggle('on',x===b))};$('#slots').append(b)});
const ics=a=>{const d=a.date.replace(/-/g,'')+'T'+a.time.replace(':','')+'00';const u='BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:'+a.id+'@medutech\nDTSTART:'+d+'\nSUMMARY:'+a.type+'\nLOCATION:'+(a.place||'')+'\nEND:VEVENT\nEND:VCALENDAR';const l=document.createElement('a');l.href=URL.createObjectURL(new Blob([u],{type:'text/calendar'}));l.download='checkup.ics';l.click()};
function drawA(){const el=$('#al');apts.sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));el.innerHTML=apts.length?'':'<div class="emp"><img src="assets/art/calendar.svg" alt=""><p>No appointments yet.<br>Pick a date and time to book your first checkup.</p></div>';
apts.forEach(a=>{const d=document.createElement('div');d.className='apt';d.innerHTML=`<div><b>${a.type}</b><small>${new Date(a.date+'T12:00').toDateString()} at ${a.time}${a.place?' · '+a.place.replace(/</g,'&lt;'):''}</small></div><div><button data-c>Add to calendar</button><button data-x>Cancel</button></div>`;d.querySelector('[data-c]').onclick=()=>ics(a);d.querySelector('[data-x]').onclick=()=>{apts=apts.filter(x=>x.id!==a.id);S('mt-apts',apts);drawA()};el.append(d)})}
$('#sf').onsubmit=e=>{e.preventDefault();if(!slot){alert('Choose a time slot.');return}apts.push({id:Date.now(),type:$('#st').value,date:sd.value,time:slot,place:$('#sp').value.trim()});S('mt-apts',apts);drawA();$('#sp').value=''};drawA();
}
/* tests */
if($('#tg')){
const T=[['Malaria test (RDT or microscopy)','Infection','Checks for malaria parasites in a blood sample.','Tell the lab about fever, chills or recent travel. No fasting.','Anyone with fever in a malaria area.'],
['Full blood count (FBC)','Blood','Counts red cells, white cells and platelets. Helps spot anaemia and infection.','No fasting needed.','Tiredness, frequent infections, routine checkups.'],
['Fasting blood sugar','Blood','Measures glucose to screen for diabetes.','Fast 8 to 10 hours. Water is fine.','Adults with risk factors or symptoms like thirst.'],
['HbA1c','Blood','Shows your average blood sugar over about 3 months.','No fasting needed.','Diabetes screening and monitoring.'],
['Lipid profile','Heart','Measures cholesterol and triglycerides.','Fast 9 to 12 hours if your lab asks.','Adults over 20, heart risk checks.'],
['Blood pressure check','Heart','Quick check for high blood pressure.','Rest 5 minutes. Avoid caffeine before.','All adults, at least yearly.'],
['Hepatitis B screening','Infection','Detects hepatitis B infection or immunity.','No fasting needed.','Adults, pregnancy, before vaccination.'],
['HIV screening','Infection','Confidential test for HIV infection.','No fasting needed.','Anyone sexually active, pregnancy.'],
['Typhoid (Widal or culture)','Infection','Helps check for typhoid infection.','No fasting needed. Tell the lab your symptom dates.','Prolonged fever with stomach symptoms.'],
['Pap smear or HPV test','Women','Screens for cervical cell changes.','Avoid intercourse and vaginal products for 48 hours.','Women, as advised by their clinician.'],
['Urinalysis','General','Checks urine for infection, kidney and sugar clues.','Use a clean midstream sample.','Burning urination, routine checkups.'],
['Kidney function (urea, creatinine)','Blood','Shows how well your kidneys filter waste.','Usually no fasting.','High blood pressure, diabetes.']];
function drawT(){const q=$('#tq').value.toLowerCase(),c=$('#tc').value,g=$('#tg');g.innerHTML='';const r=T.filter(t=>(c==='All'||t[1]===c)&&(t[0]+t[2]).toLowerCase().includes(q));
if(!r.length)g.innerHTML='<p class="empty">No tests match. Try another word.</p>';r.forEach(t=>{const b=document.createElement('button');b.className='tc';b.innerHTML=`<b>${t[0]}</b><span>${t[2]}</span><br><i class="tag">${t[1]}</i>`;b.onclick=()=>{const d=$('#dg');d.innerHTML=`<h3>${t[0]}</h3><p>${t[2]}</p><p><b>How to prepare:</b> ${t[3]}</p><p><b>Often considered for:</b> ${t[4]}</p><p>Ask a clinician whether you need it.</p><br><button class="btn" id="bk">Book a checkup</button> <button class="btn ghost" id="cl">Close</button>`;d.showModal();$('#cl').onclick=()=>d.close();$('#bk').onclick=()=>{d.close();location.href='schedule.html'}};g.append(b)})}
$('#tq').oninput=drawT;$('#tc').onchange=drawT;drawT();
}
/* chat */
if($('#cf')){
const ms=$('#ms'),add=(t,c)=>{const d=document.createElement('div');d.className='m '+c;d.textContent=t;ms.append(d);ms.scrollTop=ms.scrollHeight;return d};
const U=/chest pain|can'?t breathe|difficulty breathing|short(ness)? of breath|unconscious|faint|severe bleeding|seizure|stroke|suicid|weak(ness)? on one side|slurred/i;
const K=[[/malaria|fever|chills|temperature/,'Fever is common and can have many causes, including malaria in Nigeria. Rest, drink fluids and get a malaria test, since it is quick and treatable. Seek care the same day if the fever is above 39°C, lasts over 2 days, or comes with confusion, a stiff neck or repeated vomiting. Children, pregnant women and older adults should be seen sooner.'],
[/headache|migraine/,'Most headaches ease with rest, water and a quiet room. Check your blood pressure if headaches are frequent. Get urgent care for a sudden severe headache, headache with fever and stiff neck, vision changes or weakness.'],
[/cough|cold|catarrh|sore throat/,'Rest, warm fluids and honey can soothe a mild cough or sore throat. See a clinician if a cough lasts over 2 weeks, brings up blood, or comes with weight loss or night sweats, as TB should be ruled out.'],
[/sugar|diabet|thirst/,'Frequent thirst, urination and tiredness can be signs of high blood sugar. A fasting blood sugar or HbA1c test can check this. See Explore tests to learn how to prepare.'],
[/pressure|hypertens|bp/,'High blood pressure often has no symptoms, so regular checks matter. Less salt, regular walking and taking prescribed medicine help. Book a blood pressure check in Schedule.'],
[/sleep|insomnia|tired|fatigue/,'Try a fixed bedtime, no screens for 30 minutes before bed, and less caffeine after noon. Ongoing tiredness can have causes like anaemia or low thyroid, so consider a full blood count.'],
[/stress|anxi|worr|sad|depress/,'I am sorry you are carrying this. Slow breathing, a short walk and talking to someone you trust can help. If low mood lasts over 2 weeks or you feel unsafe, please speak to a health professional soon.'],
[/diet|food|eat|weight|nutrition/,'Aim for half your plate as vegetables and fruit, a protein, and whole grains or beans. Limit sugary drinks and salt, and drink water through the day.'],
[/stomach|diarrh|vomit|belly|abdom/,'Drink oral rehydration solution or clean water in small sips often. Get care quickly if there is blood, severe pain, signs of dehydration, or symptoms last over 2 days, especially in children.'],
[/hello|hi\b|hey/,'Hello! I am the MEDUTECH assistant. Tell me what you are feeling or ask about tests, checkups or healthy habits.']];
const hist=[];function reply(q){if(U.test(q))return['This could be an emergency. Call 112 or go to the nearest emergency department now. Do not wait for an online answer, and do not travel alone if you feel unwell.',1];
const h=K.find(x=>x[0].test(q.toLowerCase()));return[h?h[1]:'I can only help with health questions. Try asking about symptoms like fever, headache, cough or stomach upset, or about sleep, stress, food and blood pressure.',0]}
async function ask(q){add(q,'me');hist.push({role:'user',content:q});const t=add('','ai');t.innerHTML='<span class="dots"><span></span><span></span><span></span></span>';let r,u=0;
try{if(CHAT_ENDPOINT&&!U.test(q)){const x=await fetch(CHAT_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','X-Requested-With':'fetch'},body:JSON.stringify({messages:hist,lang:localStorage.getItem('mt-lang')||'en'})});if(x.status===401){location.href='login.html';return}if(!x.ok)throw 0;r=(await x.json()).reply}}catch(e){fb=1}
await new Promise(s=>setTimeout(s,700));if(!r){[r,u]=reply(q);if(fb&&!warned&&!u){warned=1;r='The live AI is not connected right now, so this is a basic reply.\n\n'+r}}t.innerHTML=fmt(r);if(u)t.classList.add('urg');hist.push({role:'assistant',content:r});ms.scrollTop=ms.scrollHeight}
$('#cf').onsubmit=e=>{e.preventDefault();const v=$('#ci').value.trim();if(v){$('#ci').value='';ask(v)}};
add('Hello'+((JSON.parse(localStorage.getItem('mt-session')||'{}').name||'').replace(/^Guest$/,'')?' '+JSON.parse(localStorage.getItem('mt-session')).name.split(' ')[0]:'')+', I am MEDUTECH Health AI. I can help with health questions only, and I give general guidance, not diagnoses. What would you like to know?','ai');
['I have a fever','Headache for 2 days','How do I lower blood pressure?','I feel stressed','What tests should I do yearly?','Foods for a healthy heart'].forEach(q=>{const b=document.createElement('button');b.textContent=q;b.onclick=()=>ask(q);$('#cp').append(b)});const qp=new URLSearchParams(location.search).get('q');if(qp)setTimeout(()=>ask(qp),500);}
/* care */
if($('#lf')){let kind='hospitals, clinics and pharmacies';[['hospitals, clinics and pharmacies','All care'],['hospitals','Hospitals'],['clinics','Clinics'],['pharmacies','Pharmacies'],['medical laboratories','Labs']].forEach((k,i)=>{const b=document.createElement('button');b.type='button';b.className='slot'+(i?'':' on');b.textContent=k[1];b.onclick=()=>{kind=k[0];document.querySelectorAll('#kinds .slot').forEach(x=>x.classList.toggle('on',x===b))};$('#kinds').append(b)});
const go=(p,m)=>{const q=kind+' near '+p;$('#ml').href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q);$('#ls').textContent=m;const f=document.createElement('iframe');f.title='Map: '+q;f.loading='lazy';f.src='https://www.google.com/maps?q='+encodeURIComponent(q)+'&output=embed';$('#mb').classList.add('sk');f.onload=()=>$('#mb').classList.remove('sk');$('#mb').replaceChildren(f)};
$('#lf').onsubmit=e=>{e.preventDefault();const p=$('#li').value.trim();if(!p){$('#ls').textContent='Enter a town, area or postcode first.';return}go(p,'Showing '+kind+' near '+p+'. Check listing details before travelling.')};
$('#ul').onclick=()=>{if(!navigator.geolocation){$('#ls').textContent='Location is not supported. Enter a place instead.';return}$('#ls').textContent='Requesting your location…';navigator.geolocation.getCurrentPosition(p=>go(p.coords.latitude.toFixed(5)+', '+p.coords.longitude.toFixed(5),'Showing services near your current location.'),()=>{$('#ls').textContent='Location unavailable. Enter a place instead.'},{timeout:10000})}}})();
