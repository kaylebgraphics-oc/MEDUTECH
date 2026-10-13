/* MEDUTECH habits: plans, streaks, weekly view, symptom link, AI tip, breathing, mood, medicine reminders. */
(() => {
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const rd = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
  const wr = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const dk = d => { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const back = n => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
  const name = ((rd('mt-session', {}).name) || '').split(' ')[0].replace(/^Guest$/, '');

  /* ---------- habits and plans ---------- */
  const H = {
    water:   ['Drink 8 glasses of water', 'Helps with headaches, tiredness and the heat. Have a glass with each meal and between meals.'],
    walk:    ['Walk for 20 minutes', 'A brisk walk most days protects your heart and lifts your mood.'],
    sleep:   ['Sleep 7 to 8 hours', 'Go to bed and wake up at about the same time each day.'],
    produce: ['Eat vegetables or fruit with a meal', 'Fill half your plate with vegetables or fruit when you can.'],
    breathe: ['Take 5 minutes to breathe', 'Use the guided session below. It calms the body and the mind.'],
    hands:   ['Wash hands before eating and after the toilet', 'The simplest way to avoid stomach infections.'],
    salt:    ['Go easy on salt and seasoning cubes', 'Less salt helps keep blood pressure down.'],
    meds:    ['Take prescribed medicines on time', 'Use the medicine list below to set a reminder.'],
    sugar:   ['Swap one sugary drink for water', 'Soft drinks and sweetened juice raise blood sugar quickly.'],
    grain:   ['Choose beans or whole grains for one meal', 'Beans, brown rice or whole grain keep you full and steady your blood sugar.'],
    net:     ['Sleep under a treated mosquito net', 'Prevents malaria, which is still a leading cause of illness in Nigeria.'],
    stag:    ['Clear standing water around your home', 'Mosquitoes breed in buckets, tyres and blocked drains.'],
    screen:  ['Put screens away 30 minutes before bed', 'It helps you fall asleep faster.'],
    talk:    ['Talk to someone you trust', 'Sharing a worry, even briefly, makes it lighter.'],
    antenatal: ['Take antenatal supplements as advised', 'Folic acid and iron protect you and your baby. Keep your clinic visits.']
  };
  const PLANS = {
    general:  { n: 'General wellness', h: ['water', 'walk', 'sleep', 'produce', 'breathe', 'hands'], note: 'A balanced mix of simple daily habits for staying well.' },
    bp:       { n: 'Blood pressure', h: ['salt', 'walk', 'produce', 'water', 'meds', 'breathe'], note: 'Less salt, regular movement and taking medicine as prescribed. Have your blood pressure checked at least once a year.' },
    diabetes: { n: 'Diabetes prevention', h: ['sugar', 'grain', 'walk', 'produce', 'water', 'sleep'], note: 'Cutting sugary drinks and moving daily lowers your risk. A fasting sugar test can tell you where you stand.' },
    stress:   { n: 'Stress and sleep', h: ['breathe', 'sleep', 'screen', 'walk', 'talk', 'water'], note: 'Small calming routines, done daily, add up. If low mood lasts over 2 weeks, speak to a professional.' },
    preg:     { n: 'Pregnancy', h: ['antenatal', 'water', 'produce', 'sleep', 'net', 'walk'], note: 'Gentle daily care. Keep your antenatal visits and sleep under a treated net.' },
    malaria:  { n: 'Malaria prevention', h: ['net', 'stag', 'water', 'hands', 'produce', 'sleep'], note: 'Nets, clean surroundings and safe water cut the risk for the whole household.' }
  };
  const LOCAL = ['In hot weather, drink water before you feel thirsty, especially if you work outdoors.', 'Treated mosquito nets only work when they are used every night, including in the dry season.', 'Wash vegetables with clean water and keep drinking water covered.', 'Oral rehydration solution is the safest first step for diarrhoea, for children and adults.', 'Check your vaccination card. Yellow fever, measles and tetanus protection should be up to date.'];

  /* ---------- state ---------- */
  const S = Object.assign({ goal: 'general', log: {}, mood: {}, meds: [], medlog: {}, best: 0, cele: {} }, rd('mt-hab2', {}));
  const save = () => wr('mt-hab2', S);
  const plan = () => PLANS[S.goal] || PLANS.general;
  const need = () => Math.ceil(plan().h.length / 2);
  const done = k => (S.log[k] || []).filter(x => plan().h.includes(x)).length;
  const ok = k => done(k) >= need();
  const pct = k => Math.round(done(k) / plan().h.length * 100);

  function streak() {
    let n = 0, i = ok(dk()) ? 0 : 1;
    for (; i < 400; i++) { if (ok(dk(back(i)))) n++; else break; }
    return n;
  }

  /* ---------- symptom link ---------- */
  function symLinks() {
    const L = rd('mt-lastsym', null);
    if (!L || !L.symptoms) return {};
    if ((new Date(dk()) - new Date(L.date)) / 864e5 > 7) return {};
    const map = [
      [/tired|fatigue|weak|sleep|dizz|faint|restless|early waking/i, ['sleep', 'water', 'breathe']],
      [/head|fever|dehydr|thirst|diarr|vomit|sweat|heat|cramp|dark urine|dry mouth/i, ['water']],
      [/anx|panic|mood|worry|stress|irritab|hopeless|nightmare/i, ['breathe', 'sleep', 'talk']],
      [/palpit|heartbeat|chest tight|blood pressure/i, ['breathe', 'salt']],
      [/chills|fever|malaria/i, ['net']],
      [/bloat|gas|heartburn|abdominal|stomach|nausea/i, ['produce', 'hands']],
      [/thirst|frequent urination|hunger/i, ['sugar', 'grain']]
    ];
    const out = {};
    L.symptoms.forEach(sy => map.forEach(([re, ids]) => { if (re.test(sy)) ids.forEach(id => { if (plan().h.includes(id)) (out[id] = out[id] || new Set()).add(sy); }); }));
    return out;
  }

  /* ---------- toast and confetti ---------- */
  let tt;
  function toast(m) { const t = $('#ts'); t.textContent = m; t.hidden = false; clearTimeout(tt); tt = setTimeout(() => t.hidden = true, 3800); }
  function confetti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cols = ['#17503d', '#2f9e6b', '#bfe3cf', '#d9b44a', '#f6f4ee'];
    for (let i = 0; i < 40; i++) {
      const e = document.createElement('i'); e.className = 'cf';
      e.style.left = Math.random() * 100 + 'vw'; e.style.background = cols[i % cols.length];
      e.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px'); e.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      e.style.animationDelay = Math.random() * .4 + 's'; document.body.append(e); setTimeout(() => e.remove(), 2600);
    }
  }

  /* ---------- drawing ---------- */
  function message(p) {
    const n = name ? ', ' + name : '', t = dk();
    const yMissed = !ok(dk(back(1))) && Object.keys(S.log).length > 0;
    if (p === 100) return 'All done for today' + n + '. Rest well.';
    if (p >= 50) return 'More than halfway' + n + '. Steady work like this adds up.';
    if (p > 0) return 'Good start' + n + '. One more and you are on your way.';
    return yMissed ? 'Missed yesterday? That is fine. Today is a fresh start' + n + '.' : 'Pick one small thing to begin' + n + '.';
  }
  const DAY = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  function draw() {
    const t = dk(), p = pct(t), sk = streak();
    $('#pr').style.strokeDashoffset = 314 - 314 * p / 100;
    $('#pc').innerHTML = p + '%<small>done</small>';
    $('#sk').textContent = sk; $('#pm').textContent = message(p);
    $('#wk').innerHTML = [6, 5, 4, 3, 2, 1, 0].map(i => { const d = back(i), k = dk(d); return `<div class="wd${i === 0 ? ' today' : ''}"><div class="cell" title="${pct(k)}% done"><i style="height:${pct(k)}%"></i></div>${DAY[d.getDay()]}</div>`; }).join('');
    if (sk > S.best) S.best = sk;
    $('#bd').innerHTML = [3, 7, 30].map(m => `<span class="bdg${S.best >= m ? ' got' : ''}">${m}-day streak</span>`).join('');
    [3, 7, 30].forEach(m => { if (sk >= m && !S.cele[m]) { S.cele[m] = 1; save(); confetti(); toast(m + ' days in a row. Well done' + (name ? ', ' + name : '') + '.'); } });

    const links = symLinks(), L = rd('mt-lastsym', null);
    $('#hb').innerHTML = plan().h.map(id => {
      const on = (S.log[t] || []).includes(id), lk = links[id];
      return `<button class="hab${on ? ' on' : ''}${lk ? ' pick' : ''}" data-id="${id}"><i>${on ? '<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5l3 3 6-7"/></svg>' : ''}</i><span>${esc(H[id][0])}<small>${esc(H[id][1])}${lk ? ' Marked for you because you checked: ' + esc([...lk].slice(0, 2).join(', ')) + '.' : ''}</small></span></button>`;
    }).join('');
    $('#gn').textContent = plan().note;
    $('#sl').textContent = L && Object.keys(links).length ? 'Habits marked with a green edge relate to your last symptom check.' : '';
    S.sum = { date: t, pct: p, streak: sk }; save();
    drawMood(); drawMeds(); drawChart();
  }

  /* ---------- mood and chart ---------- */
  const MO = ['Low', 'Down', 'Okay', 'Good', 'Great'], EN = ['Low', 'Medium', 'High'];
  function drawMood() {
    const m = S.mood[dk()] || {};
    $('#md').innerHTML = MO.map((x, i) => `<button type="button" data-m="${i + 1}" class="${m.m === i + 1 ? 'on' : ''}">${x}</button>`).join('');
    $('#en').innerHTML = EN.map((x, i) => `<button type="button" data-e="${i + 1}" class="${m.e === i + 1 ? 'on' : ''}">${x}</button>`).join('');
  }
  function drawChart() {
    const days = [6, 5, 4, 3, 2, 1, 0].map(i => back(i)), W = 300, Hh = 110, bw = 24, gap = (W - 7 * bw) / 8;
    let bars = '', pts = [], lab = '';
    days.forEach((d, i) => {
      const k = dk(d), x = gap + i * (bw + gap), h = pct(k) / 100 * Hh;
      bars += `<rect x="${x}" y="${Hh - h}" width="${bw}" height="${Math.max(h, 1)}" rx="3" fill="var(--green)" opacity=".55"/>`;
      lab += `<text x="${x + bw / 2}" y="125" text-anchor="middle" font-size="9" fill="var(--soft)">${DAY[d.getDay()]}</text>`;
      const m = (S.mood[k] || {}).m; if (m) pts.push([x + bw / 2, Hh - (m - 1) / 4 * (Hh - 10) - 5]);
    });
    const line = pts.length > 1 ? `<polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="var(--ink)" stroke-width="1.6"/>` : '';
    $('#ch').innerHTML = `<line x1="0" y1="${Hh}" x2="${W}" y2="${Hh}" stroke="var(--line)"/>${bars}${line}${pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="3.2" fill="var(--ink)"/>`).join('')}${lab}`;
  }

  /* ---------- medicines ---------- */
  function drawMeds() {
    const t = dk(), tk = S.medlog[t] || [];
    $('#ml').innerHTML = S.meds.length ? S.meds.map((m, i) => `<div class="med${tk.includes(i) ? ' on' : ''}"><div class="sp"><b>${esc(m.n)}</b><small>Daily at ${esc(m.t)}</small></div><button data-take="${i}">${tk.includes(i) ? 'Taken' : 'Mark taken'}</button><button class="x" data-del="${i}" aria-label="Remove ${esc(m.n)}">Remove</button></div>`).join('') : '<p class="hint">No medicines added yet.</p>';
  }
  function record() {
    if (!S.meds.length) return 'No medicines recorded.';
    let out = 'MEDUTECH medicine record (last 7 days)\n' + 'Medicines: ' + S.meds.map(m => m.n + ' at ' + m.t).join(', ') + '\n';
    let taken = 0, total = 0;
    [6, 5, 4, 3, 2, 1, 0].forEach(i => { const k = dk(back(i)), tk = (S.medlog[k] || []).filter(x => x < S.meds.length).length; taken += tk; total += S.meds.length; out += k + ': ' + tk + ' of ' + S.meds.length + ' taken\n'; });
    return out + 'Overall: ' + Math.round(taken / total * 100) + '% taken';
  }
  function remind() {
    const now = new Date(), hm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'), t = dk();
    S.meds.forEach((m, i) => {
      const key = 'mt-rem-' + t + '-' + i + '-' + m.t;
      if (m.t === hm && !sessionStorage.getItem(key) && !(S.medlog[t] || []).includes(i)) {
        sessionStorage.setItem(key, 1);
        toast('Time for your ' + m.n);
        try { if ('Notification' in window && Notification.permission === 'granted') new Notification('MEDUTECH', { body: 'Time for your ' + m.n, icon: 'assets/favicon.png' }); } catch (e) {}
      }
    });
  }
  setInterval(remind, 20000);

  /* ---------- AI tip ---------- */
  function localTip() {
    const t = dk(), left = plan().h.filter(id => !(S.log[t] || []).includes(id));
    if (!left.length) return 'You finished everything today. Drink some water and rest well.';
    return 'Try this next: ' + H[left[0]][0].toLowerCase() + '. ' + H[left[0]][1];
  }
  async function coach() {
    const t = dk(), el = $('#ct'), btn = $('#cb'), L = rd('mt-lastsym', null);
    btn.disabled = true; el.textContent = 'Thinking about your day...';
    const dn = plan().h.filter(id => (S.log[t] || []).includes(id)).map(id => H[id][0]), left = plan().h.filter(id => !(S.log[t] || []).includes(id)).map(id => H[id][0]);
    const q = 'I use a daily habit tracker. My plan: ' + plan().n + '. Done today: ' + (dn.join('; ') || 'nothing yet') + '. Still to do: ' + (left.join('; ') || 'nothing') + '. Current streak: ' + streak() + ' days. ' +
      (!ok(dk(back(1))) ? 'I missed most habits yesterday. ' : '') + (L && Object.keys(symLinks()).length ? 'My last symptom check included: ' + L.symptoms.slice(0, 4).join(', ') + '. ' : '') +
      'Give me ONE short, warm suggestion for today in under 40 words. Plain text only, no lists, no emojis, no guilt, no diagnosis.';
    let r = null;
    try {
      const x = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'fetch' }, body: JSON.stringify({ lang: localStorage.getItem('mt-lang') || 'en', messages: [{ role: 'user', content: q }] }) });
      if (x.status === 401) { location.href = 'login.html'; return; }
      if (x.ok) r = (await x.json()).reply;
    } catch (e) {}
    el.textContent = (r || localTip()).replace(/[*#]/g, '').trim();
    btn.disabled = false;
  }

  /* ---------- breathing ---------- */
  let bt = null, left = 0;
  function bstop(fin) {
    clearInterval(bt); bt = null; const c = $('#bc'); c.className = 'bcircle'; $('#bt').textContent = fin ? 'Done' : 'Ready'; $('#bs').textContent = 'Start'; if (!fin) { left = 0; $('#bm').textContent = '5:00'; }
  }
  function bstart() {
    if (bt) { bstop(false); return; }
    left = 300; let ph = 0; $('#bs').textContent = 'Stop';
    const tick = () => {
      const c = $('#bc'), cyc = (300 - left) % 10;
      if (cyc === 0) { c.className = 'bcircle in'; $('#bt').textContent = 'Breathe in'; }
      if (cyc === 4) { c.className = 'bcircle out'; $('#bt').textContent = 'Breathe out'; }
      $('#bm').textContent = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
      if (left-- <= 0) { bstop(true); $('#bm').textContent = '0:00'; const t = dk(), a = S.log[t] || []; if (plan().h.includes('breathe') && !a.includes('breathe')) { S.log[t] = [...a, 'breathe']; save(); draw(); } toast('Session complete. Well done' + (name ? ', ' + name : '') + '.'); }
    };
    tick(); bt = setInterval(tick, 1000);
  }

  /* ---------- events ---------- */
  $('#goal').innerHTML = Object.entries(PLANS).map(([k, v]) => `<option value="${k}">${v.n}</option>`).join('');
  $('#goal').value = S.goal;
  $('#goal').onchange = e => { S.goal = e.target.value; save(); draw(); };
  $('#hb').onclick = e => {
    const b = e.target.closest('.hab'); if (!b) return; const t = dk(), id = b.dataset.id, a = S.log[t] || [];
    S.log[t] = a.includes(id) ? a.filter(x => x !== id) : [...a, id]; save(); draw();
    if (pct(t) === 100 && !a.includes(id)) { confetti(); }
  };
  $('#md').onclick = e => { const b = e.target.closest('[data-m]'); if (!b) return; const t = dk(); S.mood[t] = Object.assign(S.mood[t] || {}, { m: +b.dataset.m }); save(); draw(); };
  $('#en').onclick = e => { const b = e.target.closest('[data-e]'); if (!b) return; const t = dk(); S.mood[t] = Object.assign(S.mood[t] || {}, { e: +b.dataset.e }); save(); draw(); };
  $('#mf').onsubmit = e => { e.preventDefault(); S.meds.push({ n: $('#mn').value.trim(), t: $('#mt').value }); $('#mn').value = ''; save(); draw(); };
  $('#ml').onclick = e => {
    const tk = e.target.closest('[data-take]'), dl = e.target.closest('[data-del]'), t = dk();
    if (tk) { const i = +tk.dataset.take, a = S.medlog[t] || []; S.medlog[t] = a.includes(i) ? a.filter(x => x !== i) : [...a, i]; }
    if (dl) { const i = +dl.dataset.del; S.meds.splice(i, 1); S.medlog = {}; }
    save(); draw();
  };
  $('#mp').onclick = () => { if (!('Notification' in window)) { toast('This browser does not support notifications.'); return; } Notification.requestPermission().then(p => toast(p === 'granted' ? 'Reminders are on while this page is open.' : 'Notifications are blocked. You will still see reminders on this page.')); };
  $('#mc').onclick = () => { const r = record(); (navigator.clipboard ? navigator.clipboard.writeText(r) : Promise.reject()).then(() => toast('Record copied.'), () => toast('Could not copy. Select the text manually.')); };
  $('#cb').onclick = coach; $('#bs').onclick = bstart;
  $('#ln').textContent = LOCAL[Math.floor(Date.now() / 864e5) % LOCAL.length];
  draw(); document.addEventListener('langchange', draw);
})();
