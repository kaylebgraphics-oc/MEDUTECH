(()=>{const S=[...document.querySelectorAll('.slide')],D=document.querySelector('.dots'),bk=document.getElementById('bk'),nx=document.getElementById('nx');let i=0,lv=0;
S.forEach((_,k)=>{const b=document.createElement('button');b.setAttribute('aria-label','Slide '+(k+1));b.onclick=()=>go(k);D.append(b)});
function go(n){i=Math.max(0,Math.min(n,S.length-1));S.forEach((s,k)=>s.classList.toggle('on',k===i));[...D.children].forEach((b,k)=>b.classList.toggle('on',k===i));bk.disabled=!i;const c=document.getElementById('cnt');if(c)c.textContent='0'+(i+1)+' / 0'+S.length;nx.textContent=t(i===S.length-1?'i_go':'i_next')}
function end(){if(lv)return;lv=1;document.body.classList.add('page-leaving');setTimeout(()=>location.assign(localStorage.getItem('mt-session')?'home.html':'login.html'),matchMedia('(prefers-reduced-motion:reduce)').matches?0:350)}
bk.onclick=()=>go(i-1);nx.onclick=()=>i===S.length-1?end():go(i+1);document.getElementById('sk').onclick=e=>{e.preventDefault();end()};
addEventListener('keydown',e=>{if(e.key==='ArrowRight')i<S.length-1&&go(i+1);if(e.key==='ArrowLeft')go(i-1)});document.addEventListener('langchange',()=>go(i));go(0)})();
