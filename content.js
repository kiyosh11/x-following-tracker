let isExtracting = false;
let shouldStop = false;
let seen = new Set();

function createFloatingPanel() {
  if (document.getElementById('x-extract-panel')) return;

  const panel = document.createElement('div');
  panel.id = 'x-extract-panel';
  panel.style.cssText = `
    position:fixed; bottom:30px; right:30px; background:#0f0f0f; border:2px solid #1d9bf0;
    border-radius:20px; padding:18px; width:320px; color:white; font-family:system-ui;
    box-shadow:0 10px 30px rgba(29,155,240,0.3); z-index:99999;
  `;

  panel.innerHTML = `
    <div style="font-weight:bold; text-align:center; color:#1d9bf0; margin-bottom:12px;">X Following Extractor</div>
    <div style="text-align:center; margin:15px 0;">
      <div id="progress-circle" style="width:92px;height:92px;border-radius:50%;margin:auto;background:conic-gradient(#1d9bf0 0deg,#1d9bf0 0deg,#222 0deg);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:bold;">
        <span id="count">0</span>
      </div>
    </div>
    <div id="status" style="text-align:center;font-size:13px;color:#aaa;">Ready</div>
    <button id="start-btn" style="width:100%;padding:12px;background:#1d9bf0;color:white;border:none;border-radius:9999px;font-weight:bold;cursor:pointer;">Start Extraction</button>
    <button id="stop-btn" style="display:none;width:100%;padding:12px;background:#ff4444;color:white;border:none;border-radius:9999px;font-weight:bold;cursor:pointer;margin-top:8px;">Stop</button>
  `;

  document.body.appendChild(panel);

  document.getElementById('start-btn').onclick = startExtraction;
  document.getElementById('stop-btn').onclick = () => shouldStop = true;
}

async function highlightUser(cell) {
  cell.style.cssText += `border:4px solid #1d9bf0 !important; border-radius:16px !important; box-shadow:0 0 35px #1d9bf0 !important;`;
  const circle = document.createElement('div');
  circle.style.cssText = `position:absolute;top:-10px;right:-10px;width:44px;height:44px;background:#1d9bf0;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:24px;box-shadow:0 0 30px #1d9bf0;`;
  circle.textContent = '●';
  cell.appendChild(circle);
  cell.scrollIntoView({behavior:"smooth", block:"center"});
  await new Promise(r => setTimeout(r, 900));
  cell.style.border = '';
  cell.style.boxShadow = '';
  if (circle.parentNode) circle.parentNode.removeChild(circle);
}

async function saveToStorage(newUsers) {
  const result = await chrome.storage.local.get('following');
  let allUsers = result.following || [];

  const map = new Map(allUsers.map(u => [u.username, u]));

  for (const user of newUsers) {
    map.set(user.username, user);
  }

  allUsers = Array.from(map.values());
  await chrome.storage.local.set({ following: allUsers });
}

async function startExtraction() {
  if (isExtracting) return;
  isExtracting = true;
  shouldStop = false;
  seen.clear();

  const statusEl = document.getElementById('status');
  const countEl = document.getElementById('count');
  const startBtn = document.getElementById('start-btn');
  const stopBtn = document.getElementById('stop-btn');

  startBtn.style.display = 'none';
  stopBtn.style.display = 'block';
  statusEl.textContent = 'Loading existing data...';

  const result = await chrome.storage.local.get('following');
  const existing = new Set((result.following || []).map(u => u.username));

  const batch = [];
  const BATCH_SIZE = 300;

  window.scrollTo(0, 800);
  await new Promise(r => setTimeout(r, 1500));

  let lastCount = 0;
  let stuck = 0;

  while (!shouldStop) {
    const cells = document.querySelectorAll('[data-testid="UserCell"]');

    for (const cell of cells) {
      if (shouldStop) break;
      try {
        const username = cell.querySelector('a[href^="/"][role="link"]')?.getAttribute('href')?.slice(1).split('?')[0];
        if (!username || seen.has(username)) continue;
        seen.add(username);

        countEl.textContent = seen.size;

        const isNew = !existing.has(username);
        if (isNew) await highlightUser(cell);

        const display_name = cell.querySelector('div[dir="auto"] > span')?.textContent.trim() || '';
        const avatar = cell.querySelector('img[src*="profile_images"]')?.src || '';
        const followsMe = [...cell.querySelectorAll('*')].some(el => el.textContent?.includes('Follows you'));

        batch.push({ username, display_name, follows_me: followsMe, avatar_url: avatar });

        if (batch.length >= BATCH_SIZE) {
          await saveToStorage(batch);
          batch.length = 0;
          statusEl.textContent = `Saved ${seen.size} users so far...`;
        }
      } catch(e) {}
    }

    if (shouldStop) break;

    window.scrollBy(0, 1350 + Math.random() * 400);
    await new Promise(r => setTimeout(r, 1350 + Math.random() * 700));

    const current = document.querySelectorAll('[data-testid="UserCell"]').length;
    if (current === lastCount) {
      stuck++;
      if (stuck > 12) break;
    } else stuck = 0;
    lastCount = current;
  }

  if (batch.length > 0) await saveToStorage(batch);

  alert(`✅ Extraction finished!\nTotal users saved: ${seen.size}`);

  isExtracting = false;
  startBtn.style.display = 'block';
  stopBtn.style.display = 'none';
  statusEl.textContent = 'Finished';
}

if (window.location.pathname.includes('/following')) {
  setTimeout(createFloatingPanel, 2000);
}