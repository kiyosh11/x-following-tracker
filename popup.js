async function loadData(filter = 'all', search = '') {
  const result = await chrome.storage.local.get('following');
  let users = result.following || [];

  if (filter === 'mutual') users = users.filter(u => u.follows_me);
  if (filter === 'non_mutual') users = users.filter(u => !u.follows_me);

  if (search) {
    const s = search.toLowerCase();
    users = users.filter(u => 
      u.username.toLowerCase().includes(s) || 
      (u.display_name || '').toLowerCase().includes(s)
    );
  }

  const tbody = document.querySelector('#table tbody');
  tbody.innerHTML = users.map(u => `
    <tr data-username="${u.username}">
      <td><a href="https://x.com/${u.username}" target="_blank">@${u.username}</a></td>
      <td>${u.display_name || '-'}</td>
      <td class="${u.follows_me ? 'mutual' : 'not'}">${u.follows_me ? 'Yes' : 'No'}</td>
      <td class="actions">
        <button class="remove-btn">Remove</button>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.onclick = async (e) => {
      const username = e.target.closest('tr').dataset.username;
      if (confirm(`Remove @${username} from the list?`)) {
        await removeUser(username);
      }
    };
  });

  document.getElementById('stats').textContent = `Total: ${users.length} users`;
}

async function removeUser(username) {
  const result = await chrome.storage.local.get('following');
  let users = result.following || [];
  users = users.filter(u => u.username !== username);
  await chrome.storage.local.set({ following: users });
  loadData(
    document.getElementById('filter').value,
    document.getElementById('search').value
  );
}

async function removeAllNonMutuals() {
  if (!confirm('This will permanently remove ALL users who do NOT follow you back.\n\nContinue?')) return;

  const result = await chrome.storage.local.get('following');
  let users = result.following || [];
  users = users.filter(u => u.follows_me === true);
  await chrome.storage.local.set({ following: users });
  loadData();
  alert('All non-mutuals have been removed.');
}

document.getElementById('refresh').onclick = () => loadData(
  document.getElementById('filter').value,
  document.getElementById('search').value
);

document.getElementById('filter').onchange = () => loadData(
  document.getElementById('filter').value,
  document.getElementById('search').value
);

document.getElementById('search').oninput = () => loadData(
  document.getElementById('filter').value,
  document.getElementById('search').value
);

document.getElementById('remove-non-mutuals').onclick = removeAllNonMutuals;

document.getElementById('export').onclick = async () => {
  const result = await chrome.storage.local.get('following');
  const users = result.following || [];
  const csv = 'username,display_name,follows_me\n' + 
    users.map(u => `"${u.username}","${u.display_name || ''}",${u.follows_me}`).join('\n');
  
  const blob = new Blob([csv], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'x-following.csv';
  a.click();
};

document.getElementById('clear').onclick = async () => {
  if (confirm('Delete ALL saved data permanently?')) {
    await chrome.storage.local.remove('following');
    loadData();
    alert('All data has been cleared.');
  }
};

loadData();