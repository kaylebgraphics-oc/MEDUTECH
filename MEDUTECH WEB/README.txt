MEDUTECH - setup
================
1. Install Node.js 18 or newer (nodejs.org).
2. In this folder, copy ".env.example" to a new file named ".env" and fill it in (see below).
3. Run:  node server.js        then open  http://localhost:3000
   The site must be opened through the server. Double-clicking the .html files will not log in.

WHERE THE API KEY GOES
Only in the ".env" file, never in any .html or .js file. Example for Gemini:
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_key_here
- Gemini (free tier): aistudio.google.com/app/apikey -> Create API key. Default model: gemini-2.5-flash.
  Note: on the free tier Google may use prompts to improve its products. Use the paid tier for real patient questions.
- OpenAI / ChatGPT API: platform.openai.com/api-keys (billing needed; a ChatGPT subscription is separate). Set AI_PROVIDER=openai and OPENAI_API_KEY. Default model: gpt-4o-mini (set MODEL=... if you want another).
- Anthropic: console.anthropic.com. Set AI_PROVIDER=anthropic and ANTHROPIC_API_KEY.

SIGN IN WITH GOOGLE
1. console.cloud.google.com -> create/select a project -> APIs & Services -> OAuth consent screen (External) -> fill the basics.
2. Credentials -> Create credentials -> OAuth client ID -> Web application.
3. Authorised JavaScript origins: add http://localhost:3000 (and your real https domain when you go live).
4. Copy the Client ID into .env as GOOGLE_CLIENT_ID=...  and restart the server.

SECURITY NOTES
- Passwords are hashed with scrypt; login uses signed HttpOnly cookies; login attempts are rate limited; the AI endpoint needs a logged-in user.
- Accounts are saved in data/users.json. For many users, move to a real database. Do not upload the data folder or .env anywhere public.
- Before going live: use https, set COOKIE_SECURE=1 and a long SESSION_SECRET, and add email verification and password reset.
- Appointments and habits are still saved per device in the browser.

PHOTOS (put in assets/photos/)
hero.jpg (home page), login.jpg (login side panel), intro-1.jpg, intro-2.jpg, intro-3.jpg (intro slides).
They appear automatically, with the same soft green treatment, and if a file is missing the illustration or plain design is used instead. Use sharp, landscape photos at least 1200px wide for hero and intro, and a portrait or square photo at least 1000px for login. Avoid watermarked stock previews.

LANGUAGES: translations are in js/i18n.js. Have native speakers review the Pidgin, Yoruba, Hausa and Igbo text.

TROUBLESHOOTING THE AI
- "AI test FAILED -> NETWORK ..." means this computer cannot reach the AI company's server (not a key problem).
  Run:  node check.js   to see which services are reachable. Then: use a phone hotspot or VPN, set DNS to 8.8.8.8, turn off antivirus web shield / firewall for Node, or switch AI_PROVIDER to one that is reachable.
- "KEY ..." means the key is wrong. "QUOTA ..." means the free limit was reached. Open http://localhost:3000/api/status to see the last error.
- Once the site is hosted online (Render, Railway, a VPS), the server's own internet is normally fine even if your home network blocks the AI.
