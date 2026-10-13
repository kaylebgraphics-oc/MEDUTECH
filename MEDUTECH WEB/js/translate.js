/* MEDUTECH universal translator: translates every visible text on any page via the server AI, caches results on the device. */
(()=>{if(location.protocol==='file:')return;const L=()=>localStorage.getItem('mt-lang')||'en',SK=/^(SCRIPT|STYLE|TEXTAREA|CODE|NOSCRIPT)$/,EX='[data-t],[data-notr],.msgs,.aout,#lgslot,#lg,#lg0,.brand,.splash';
let orig=new WeakMap(),outs=new Set(),undo=[],cache={},lang='en',busy=0,tm,pill;
const ld=()=>{try{cache=JSON.parse(localStorage.getItem('mt-tr-'+lang))||{}}catch(e){cache={}}},sv=()=>{try{localStorage.setItem('mt-tr-'+lang,JSON.stringify(cache))}catch(e){}};
function show(on){if(!pill){pill=document.createElement('div');pill.className='trpill';pill.innerHTML='<i></i>Translating…';document.body.append(pill)}pill.classList.toggle('on',on)}
function collect(root){const tk=[],w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
while(n=w.nextNode()){const p=n.parentElement;if(!p||SK.test(p.tagName)||p.closest(EX))continue;let o=orig.get(n);if(!o){const t=n.nodeValue.trim();if(t.length<2||!/[A-Za-z]{2}/.test(t)||outs.has(t))continue;o=n.nodeValue;orig.set(n,o);undo.push(()=>{if(n.nodeValue!==o)n.nodeValue=o})}
 const s=o.trim(),nn=n;tk.push({s,ap:t=>{const v=o.replace(s,t);if(nn.nodeValue!==v)nn.nodeValue=v}})}
root.querySelectorAll('[placeholder],[title]').forEach(el=>{if(el.closest(EX))return;['placeholder','title'].forEach(a=>{const k='o'+a;if(!el.hasAttribute(a)&&!el.dataset[k])return;if(!el.dataset[k]){if(outs.has(el.getAttribute(a)))return;el.dataset[k]=el.getAttribute(a);undo.push(()=>el.setAttribute(a,el.dataset[k]))}const s=el.dataset[k];if(s.length>1)tk.push({s,ap:t=>{if(el.getAttribute(a)!==t)el.setAttribute(a,t)}})})});return tk}
const put=(tk)=>tk.forEach(x=>{const t=cache[x.s];if(t){outs.add(t);x.ap(t)}});
async function run(){const l=L();if(l!==lang){undo.forEach(f=>f());undo=[];orig=new WeakMap();outs=new Set()}lang=l;if(l==='en'){undo.forEach(f=>f());undo=[];orig=new WeakMap();outs=new Set();document.documentElement.classList.remove('tr-on');return}
ld();document.documentElement.classList.add('tr-on');const tk=collect(document.body);put(tk);const need=[...new Set(tk.filter(x=>!cache[x.s]).map(x=>x.s))];if(!need.length)return;busy++;show(1);
for(let i=0;i<need.length;i+=30){const part=need.slice(i,i+30);try{const r=await fetch('/api/translate',{method:'POST',headers:{'Content-Type':'application/json','X-Requested-With':'fetch'},body:JSON.stringify({lang,items:part})});if(!r.ok)throw 0;const d=await r.json();part.forEach((s,k)=>{if(d.items[k])cache[s]=d.items[k]});sv();if(lang!==L())break;put(tk)}catch(e){break}}
if(!--busy)show(0)}
const sched=()=>{clearTimeout(tm);tm=setTimeout(run,300)};
document.addEventListener('langchange',()=>{lang='';sched()});addEventListener('load',sched);document.addEventListener('DOMContentLoaded',sched);
new MutationObserver(m=>{if(L()!=='en'&&m.some(x=>!(x.target.closest&&x.target.closest('.trpill'))))sched()}).observe(document.documentElement,{childList:true,subtree:true,characterData:true});})();
