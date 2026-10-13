(()=>{const io=new IntersectionObserver(e=>e.forEach(x=>x.isIntersecting&&(x.target.classList.add('in'),io.unobserve(x.target))),{threshold:.15});
document.querySelectorAll('.rv').forEach(e=>io.observe(e));
const tabs=[...document.querySelectorAll('.tab')],sc=[...document.querySelectorAll('.scene')];let i=0,t;
function go(n){i=n;tabs.forEach((x,k)=>{x.classList.remove('on');void x.offsetWidth;x.classList.toggle('on',k===n)});sc.forEach((x,k)=>x.classList.toggle('on',k===n));clearTimeout(t);t=setTimeout(()=>go((i+1)%3),5000)}
tabs.forEach((x,k)=>x.onclick=()=>go(k));go(0);
document.querySelectorAll('[data-n]').forEach(el=>{const to=+el.dataset.n;new IntersectionObserver((e,o)=>{if(!e[0].isIntersecting)return;o.disconnect();let v=0;const s=setInterval(()=>{el.textContent=++v;if(v>=to)clearInterval(s)},60)}).observe(el)});})();
