/* MEDUTECH loader controller */
(() => {
  'use strict';

  /* ── settings you can change ───────────────────────── */
  const CONFIG = {
    minTime: 2900,          // shortest time the loader stays (ms), so the full animation plays
    maxTime: 5000,          // never keep visitors waiting longer than this (ms)
    nextPage: '',           // e.g. 'home.html' to open another page when done; '' = reveal this page
    oncePerSession: false   // true = show the loader only on the first visit of a browser session
  };
  /* ──────────────────────────────────────────────────── */

  const root   = document.documentElement;
  const body   = document.body;
  const splash = document.getElementById('splash');
  const bar    = splash.querySelector('.bar i');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const minTime = reduce ? 1200 : CONFIG.minTime;
  const EXIT_MS = 1150;     // curtain lift + buffer

  root.classList.add('js-ready');
  if (!(window.CSS && CSS.registerProperty)) root.classList.add('no-props');

  let runId = 0, timers = [];
  const wait = ms => new Promise(r => timers.push(setTimeout(r, ms)));

  const pageLoaded = () => document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise(r => addEventListener('load', r, { once: true }));
  const fontsReady = () => (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  const imagesReady = () => Promise.all([...splash.querySelectorAll('img')].map(img =>
    img.decode ? Promise.race([img.decode().catch(() => {}), new Promise(r => setTimeout(r, 2000))]) : Promise.resolve()));

  function skip() {
    splash.classList.add('is-gone');
    root.classList.remove('is-loading');
    body.classList.add('is-ready');
    if (CONFIG.nextPage) { location.href = CONFIG.nextPage; return; }
    dispatchEvent(new Event('medutech:ready'));
  }

  async function play() {
    const id = ++runId;
    timers.forEach(clearTimeout); timers = [];

    body.classList.remove('is-ready');
    splash.classList.remove('play', 'is-leaving', 'is-gone');
    root.classList.add('is-loading');
    bar.style.setProperty('--p', 0);

    await imagesReady();                      // never start with half-loaded artwork
    if (id !== runId) return;
    void splash.offsetWidth;                  // restart the animation from frame one
    splash.classList.add('play');

    const t0 = performance.now();
    let ready = false;
    Promise.race([Promise.all([pageLoaded(), fontsReady()]), new Promise(r => setTimeout(r, 3500))]).then(() => { ready = true; });

    await new Promise(resolve => {
      const tick = now => {
        if (id !== runId) return resolve();
        const el = now - t0;
        const eased = 1 - Math.pow(1 - Math.min(el / minTime, 1), 2.2);
        const done = (ready && el >= minTime) || el >= CONFIG.maxTime;
        bar.style.setProperty('--p', done ? 1 : Math.min(eased, .9));
        if (done) return resolve();
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    if (id !== runId) return;

    await wait(300);                          // let the bar visibly reach the end
    if (id !== runId) return;
    splash.classList.add('is-leaving');
    body.classList.add('is-ready');
    await wait(EXIT_MS);
    if (id !== runId) return;

    if (CONFIG.nextPage) { location.href = CONFIG.nextPage; return; }
    splash.classList.add('is-gone');
    root.classList.remove('is-loading');
    dispatchEvent(new Event('medutech:ready'));
    try { sessionStorage.setItem('medutech-seen', '1'); } catch (e) {}
  }

  let seen = false;
  try { seen = CONFIG.oncePerSession && sessionStorage.getItem('medutech-seen') === '1'; } catch (e) {}

  const start = () => { try { seen ? skip() : play().catch(skip); } catch (e) { skip(); } };
  if (document.visibilityState === 'visible') start();
  else document.addEventListener('visibilitychange', function once() {
    if (document.visibilityState === 'visible') { document.removeEventListener('visibilitychange', once); start(); }
  });

  window.MeduTechLoader = { replay: play };
  const replay = document.getElementById('replay');
  if (replay) replay.addEventListener('click', play);
})();
