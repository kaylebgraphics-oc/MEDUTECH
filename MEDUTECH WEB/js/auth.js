(()=>{const $=s=>document.querySelector(s),next=new URLSearchParams(location.search).get('next'),dest=/^[a-z]+\.html$/.test(next||'')?next:'home.html';
const api=(u,b)=>fetch(u,{method:b?'POST':'GET',credentials:'same-origin',headers:{'Content-Type':'application/json','X-Requested-With':'fetch'},body:b?JSON.stringify(b):undefined}).then(async r=>{const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Something went wrong.');return d});
const err=m=>{$('#er').textContent=m;$('#er').hidden=!m},go=u=>{localStorage.setItem('mt-session',JSON.stringify({name:u.name,email:u.email}));$('.box').style.opacity=.4;location.replace(dest)};
const offline=location.protocol==='file:';
if(offline)$('#gn').textContent='Start the MEDUTECH server and open http://localhost:3000 to log in (see README.txt).';
else api('/api/me').then(go).catch(()=>{});
let mode='in';
function set(m){mode=m;err('');document.querySelectorAll('.seg button').forEach(b=>b.classList.toggle('on',b.dataset.m===m));$('#nw').hidden=m==='in';$('#ft').dataset.t=m==='in'?'l_wi':'l_wu';$('#sb').dataset.t=m==='in'?'l_in':'l_up';$('#ap').autocomplete=m==='in'?'current-password':'new-password';$('#fs').textContent=m==='in'?'Log in to continue to your health tools.':'It takes a few seconds. No payment needed.';applyLang()}
document.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>set(b.dataset.m));
$('#sh').onclick=()=>{const p=$('#ap');p.type=p.type==='password'?'text':'password';$('#sh').textContent=p.type==='password'?'Show':'Hide'};
$('#af').onsubmit=e=>{e.preventDefault();const email=$('#ae').value.trim(),password=$('#ap').value,name=$('#an').value.trim();
if(!/^\S+@\S+\.\S+$/.test(email))return err('Enter a valid email address.');if(password.length<(mode==='up'?8:1))return err('Password must be at least 8 characters.');if(mode==='up'&&!name)return err('Please enter your name.');
$('#sb').disabled=true;api(mode==='up'?'/api/signup':'/api/login',mode==='up'?{name,email,password}:{email,password}).then(go).catch(x=>{err(offline||x instanceof TypeError?'Cannot reach the server. Start it with: node server.js':x.message);$('#sb').disabled=false})};
if(!offline)api('/api/config').then(c=>{if(!c.google){$('#gn').textContent='';return}
const hint=m=>{$('#gh').textContent=m;$('#gh').hidden=!m},s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;
s.onerror=()=>hint('Google sign-in could not load (your network may block accounts.google.com). You can still log in with your email and password.');
s.onload=()=>{try{google.accounts.id.initialize({client_id:c.google,callback:r=>api('/api/google',{credential:r.credential}).then(go).catch(x=>err(x.message))});google.accounts.id.renderButton($('#gbtn'),{theme:'outline',size:'large',width:Math.min(380,$('.box').clientWidth),text:'continue_with'});$('#gor').hidden=false;
setTimeout(()=>{if(!$('#gbtn').querySelector('iframe,[role=button]'))hint('The Google button did not appear. In Google Cloud Console, add this exact address under Authorised JavaScript origins: '+location.origin+' (add both http://localhost:3000 and http://127.0.0.1:3000), save, wait a minute, then refresh.')},3500)}catch(x){hint('Google sign-in error: '+x.message)}};
document.head.append(s)}).catch(()=>{$('#gn').textContent='Cannot reach the MEDUTECH server. Start it with: node server.js'});
document.addEventListener('langchange',()=>set(mode));})();
