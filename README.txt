versetype: scripture typing practice (self-hosted copy)
=========================================================

This folder is a complete copy of versetype that can use your own
API keys, so you can type the NIV, NLT, ESV and other copyrighted
translations.

QUICK START
1. Unzip this folder anywhere on your computer.
2. Double-click index.html. It opens in your web browser.
3. Open the translation menu (top left) and choose
   "+ add translations with an API key…".
4. Paste your API.Bible key (and your ESV API key, if you have one),
   then click "save and check keys".
5. Tick the translations you want in the menu, click "done", and pick
   one from the menu.

The KJV, BSB, WEB and ASV are built in and work without any key,
even offline.

IF THE KEY CHECK SAYS IT "COULDN'T REACH" API.BIBLE OR THE ESV API
Some APIs refuse requests from a file opened directly from your
computer. If that happens, put the folder on a free static web host
and open it from there:
  - GitHub Pages: create a repository, upload every file in this
    folder, then turn on Pages in the repository's settings.
  - Netlify: create a free site and drag this folder onto its
    deploy page.
The site doesn't contain your key. Each visitor enters their own key,
and it stays in their browser.

WHERE TO GET KEYS
  - API.Bible (NIV, NLT, NKJV, CSB, NASB and more): https://api.bible
    The free Starter plan is for non-commercial use, and you choose up
    to three copyrighted translations for your key.
  - ESV (not on API.Bible): https://api.esv.org
    Free for non-commercial use.

TERMS THIS COPY FOLLOWS
  - It shows each translation's copyright notice next to the text, and
    the "Scripture via API.Bible" link that API.Bible's Starter plan
    requires.
  - It loads API.Bible's Fair Use (FUMS) script and reports each
    passage it displays, as API.Bible requires for websites.
  - Scripture fetched with your keys is kept in memory only while the
    page is open and is never saved, so it stays well within the
    publishers' caching limits.
  - Keep the site non-commercial (no ads, fees or paid upgrades).
    That is a condition of both free keys.

FILES
  index.html   the app
  kjv.js       King James Version (public domain)
  bsb.js       Berean Standard Bible (public domain)
  web.js       World English Bible (public domain)
  asv.js       American Standard Version (public domain)
