

A powerful, privacy-friendly Chrome extension that helps you analyze and clean up your **Following** list on X (formerly Twitter).

Extracts all accounts you follow, detects mutual followers ("Follows you"), and provides a clean dashboard to manage them — all data stored **locally** in your browser.

![Dashboard Preview](screenshot-dashboard.png) <!-- Add screenshots later -->

## ✨ Features

- **Full Following Extraction** — Scrolls and processes your Following list one by one
- **Mutual Detection** — Automatically identifies who follows you back
- **Beautiful Dashboard** — Modern dark UI with search, filters (All / Mutuals / Non-mutuals)
- **Clickable Profiles** — Direct links to every user's X profile
- **Easy Cleanup** — Remove individual users or **bulk remove all non-mutuals** with one click
- **Export Data** — Download your list as CSV
- **Local Only** — No backend, no accounts, no data leaves your browser (`chrome.storage.local`)
- **Smart Rescanning** — Skips already saved users on future runs

## ⚠️ Important Warning

**This extension scrapes X.com**, which violates Twitter/X's Terms of Service.

- Your account may get **rate-limited** or **suspended** if used excessively.
- Use responsibly and at your own risk.
- Recommended: Run it slowly and not too frequently.

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (top right)
4. Click **"Load unpacked"** and select the extension folder
5. Pin the extension for easy access

## How to Use

1. Go to your Following page:  
   `https://x.com/YOUR_USERNAME/following`
2. Click the extension icon → **Start Extraction**
3. Wait while it scrolls and processes (you'll see blue highlights on new users)
4. Open the popup anytime to view, search, filter, and manage your list

**Pro tip:** After manually unfollowing people, use **"Remove All Non-Mutuals"** to clean up the list.


## Contributing

Feel free to open issues or pull requests!  

## License

MIT License — feel free to use, modify, and distribute.

