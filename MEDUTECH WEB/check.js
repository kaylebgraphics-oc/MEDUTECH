// Run:  node check.js   -> tests whether this computer can reach the AI services
const https=require('https'),dns=require('dns');
const T=[['Google Gemini API','generativelanguage.googleapis.com'],['Google (general)','www.google.com'],['OpenAI API','api.openai.com'],['Anthropic API','api.anthropic.com']];
const fs=require('fs'),path=require('path');const need=['index.html','home.html','login.html','dashboard.html','symptoms.html','care.html','schedule.html','tests.html','priorities.html','chat.html','features.html','server.js','css/base.css','css/hub.css','css/features.css','css/intro.css','css/login.css','css/loader.css','css/tokens.css','js/shell.js','js/i18n.js','js/prefs.js','js/hub.js','js/auth.js','js/intro.js','js/dash.js','js/features.js','js/loader.js','assets/art/hero.svg','assets/art/calendar.svg','assets/favicon.png'];
const miss=need.filter(f=>!fs.existsSync(path.join(__dirname,f)));console.log(miss.length?'MISSING FILES (copy them from the zip): '+miss.join(', '):'All website files are present.');
try{const i=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');if(!i.includes('js/i18n.js')||!i.includes('class="cnt"'))console.log('WARNING: index.html is an OLD version. Replace it with the one from the latest zip.')}catch(e){}
console.log('');
(async()=>{console.log('Node',process.version,'| proxy:',process.env.HTTPS_PROXY||process.env.https_proxy||'none','\n');
for(const[n,h]of T){await new Promise(r=>{const t=Date.now();dns.lookup(h,{family:4},(e,ip)=>{if(e){console.log(n.padEnd(20),'DNS FAILED  ('+e.code+')');return r()}
 const q=https.request({host:h,path:'/',method:'GET',family:4,timeout:15000},res=>{console.log(n.padEnd(20),'REACHABLE   ('+res.statusCode+', '+(Date.now()-t)+' ms)');res.resume();r()});
 q.on('timeout',()=>q.destroy(Object.assign(new Error('t'),{code:'TIMEOUT'})));q.on('error',x=>{console.log(n.padEnd(20),'BLOCKED      ('+(x.code||x.message)+')');r()});q.end()})})}
console.log('\nGemini REACHABLE -> the problem is your key or model (see the server message).\nGemini BLOCKED but another one REACHABLE -> set AI_PROVIDER to that one in .env.\nAll BLOCKED -> try a phone hotspot or VPN, change DNS to 8.8.8.8, or turn off antivirus/firewall web shield.')})();
