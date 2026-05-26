# QuickDef — Instant Code Definitions for GitHub & GitLab

<div align="center">

![QuickDef Banner](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-blue?style=for-the-badge)
![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Status: Active](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)

**Never break focus while reading code again.**

Hover over any code token on GitHub  and get instant definitions, examples, and documentation links—without leaving the page.

[Features](#-features) • [Installation](#-installation) • [Setup](#-setup) • [How It Works](#-how-it-works) • [Configuration](#-configuration-options) • [FAQ](#-faq)

</div>

---

## 🎯 The Problem

You're reading code on GitHub → encounter an unfamiliar decorator, annotation, or package name → lose context → switch tabs to Google/documentation → come back lost.

**QuickDef eliminates that friction.**

---

## ✨ Features

### 🚀 **Instant Definitions**
- Hover over any code token and get instant explanations
- **Zero context switching** — results appear in a tooltip
- Works on **GitHub & GitLab**

### 📚 **400+ Curated Definitions**
- Spring Framework & Spring Boot annotations
- Python decorators & standard library
- React & Vue hooks
- Angular directives
- Go & Rust keywords
- SQL queries & functions
- JavaScript/TypeScript built-ins
- Docker, Kubernetes, Terraform
- ...and counting!

### ⚡ **Smart 3-Tier Lookup**
1. **Static Dictionary** (~0ms) — 400+ curated definitions
2. **Public APIs** (npm, PyPI, DevDocs) — real-time package lookups
3. **AI Fallback** (Groq LLM) — explain anything else (optional)

### 🔒 **Privacy First**
- Code never leaves your browser
- No tracking or telemetry
- Results cached locally
- All processing happens client-side

### ⚙️ **Smart Token Detection**
- Automatically detects what you're hovering over
- Handles syntax-highlighted tokens
- Merges annotation prefixes (`@`, `#`)
- Language detection from file extensions
- GitHub-specific DOM navigation

### 💾 **Instant Settings**
- Enable/disable without page reload
- Live configuration sync
- Optional Groq API key for AI lookups
- LRU cache for performance (max 300 entries)

### 🎨 **Beautiful Tooltips**
- Color-coded source badges (static/npm/PyPI/DevDocs/LLM)
- Multiple info sections (WHAT, PURPOSE, EXAMPLE, NOTE)
- Pinnable tooltips (Ctrl+Hover to lock)
- Dark mode support
- Auto-hide on scroll or mouseout

---

## 🚀 Installation

### Option 1: Load from Source (Recommended for Development)

```bash
# 1. Clone the repository
git clone https://github.com/[your-username]/QuickDef-Hover-Definitions.git
cd QuickDef-Hover-Definitions

# 2. Open Chrome's extension page
# In your browser, go to: chrome://extensions/

# 3. Enable Developer Mode
# Toggle the switch in the top-right corner

# 4. Load the extension
# Click "Load unpacked" and select the cloned folder

# 5. Done! The extension is now installed
```

### Verify Installation

After installation, you should see:
- ✅ QuickDef appears in your Chrome toolbar
- ✅ QuickDef listed on `chrome://extensions/` with status "enabled"
- ✅ Extension loads without errors

---

## ⚙️ Setup

### Basic Setup (No API, Static Definitions Only)

After installation, the extension works immediately with 400+ static definitions. No configuration needed!

Just navigate to GitHub or GitLab and hover over code.

### Enhanced Setup (With Groq AI Fallback)

To enable AI-powered lookups for terms not in the static dictionary:

#### Step 1: Get a Groq API Key
1. Visit [console.groq.com](https://console.groq.com)
2. Sign up (free tier available)
3. Create an API key
4. Copy your API key

#### Step 2: Add Key to QuickDef
1. Click the **QuickDef** icon in your Chrome toolbar
2. Click **Options** (gear icon) or right-click "Options"
3. Paste your Groq API key in the text field
4. Click **Save**
5. (Optional) Choose a different LLM model from dropdown

#### Step 3: Start Hovering
- Hovering over a known token → instant static definition
- Hovering over an unknown token + Groq key set → AI explanation
- No Groq key → helpful prompt to add one

---

## 📖 How It Works

### Data Flow

```
User hovers over code token
    ↓
content.js detects token + language
    ↓
lookup.js initiates 3-tier search
    ↓
Tier 1: Check DEFINITIONS (static dict)
    ├─ HIT → return immediately (~0ms)
    └─ MISS → continue
    ↓
Tier 2: Check public APIs (parallel)
    ├─ npm registry (JS/TS packages)
    ├─ PyPI (Python packages)
    └─ DevDocs (Web APIs, language builtins)
    ├─ HIT → return result
    └─ MISS → continue
    ↓
Tier 3: Query Groq LLM (if key configured)
    ├─ HIT → parse + return
    └─ MISS → show "Not found"
    ↓
Display tooltip
    ↓
Cache result (LRU, max 300 entries)
```

### File Structure

```
QuickDef-Hover-Definitions/
├── manifest.json              # Extension config
├── background.js              # Service worker
├── popup.html / popup.js       # Toolbar popup UI
├── popup.css                   # Popup styling
├── options.html / options.js   # Settings page
├── content.js                  # DOM interaction + tooltip UI
├── lookup.js                   # Tiered lookup engine + cache
├── definitions.js              # 400+ static definitions
├── tooltip.css                 # Tooltip styling
└── icons/                      # Extension icons
```

### Token Resolution

The extension uses multiple strategies to detect what you're hovering:

1. **Syntax-highlighted span** — Finds the smallest `<span>` from `elementsFromPoint()`
2. **Caret word detection** — Falls back to word boundaries in text nodes
3. **Annotation merging** — Prepends `@` if hovering annotation patterns
4. **Language detection** — Reads from file extension or GitHub's language pill

---

## 🔧 Configuration Options

All settings are stored in `chrome.storage.local` and sync instantly (popup only).

| Setting | Default | Effect |
|---------|---------|--------|
| `groqKey` | (empty) | Groq API key for Tier 3 LLM fallback |
| `groqModel` | `Llama 3.1-8b-instant` | Which Groq model to use |
| `clEnabled` | `true` | Enable/disable the extension |

---

## 🔒 Security & Privacy

### Data Handling
- **Local caching:** Results stored in LRU cache (local to your browser, cleared on extension disable)
- **No cloud sync:** Settings stored in `chrome.storage.local` only
- **No tracking:** Zero analytics, no beacons, no telemetry
- **Code safety:** Your code never sent to any service (only token name + language + context line to APIs/LLM)

### API Requests
- **npm / PyPI / DevDocs:** Standard HTTP requests to public registries
- **Groq LLM:** Direct HTTPS POST from content script (if key provided)
- **Authorization:** Bearer token (your API key) included only if configured

### XSS Protection
- All tooltip results HTML-escaped via `esc()` function
- No unsanitized HTML injection
- Safe DOM manipulation

---

## 📊 Supported Languages

QuickDef automatically detects language from file extension:

- **JavaScript / TypeScript** (.js, .ts, .jsx, .tsx)
- **Python** (.py)
- **Java** (.java)
- **Go** (.go)
- **Rust** (.rs)
- **C# / .NET** (.cs)
- **Kotlin** (.kt)
- **Ruby** (.rb)
- **PHP** (.php)
- **SQL** (.sql)
- **YAML** (.yaml, .yml)
- **JSON** (.json)
- **Markdown** (.md)
- **Shell / Bash** (.sh, .bash)
- **And more...**

---

## 🐛 Known Limitations

- **Embedded code blocks** — Works best on actual code files; embedded code in markdown may have reduced accuracy
- **Minified code** — Token detection works but lookups may return generic results
- **Single-letter variables** — Filtered out as non-identifiers (intentional)
- **Performance on large files** — mousemove throttled to 50ms; may feel slight lag on very large files
- **GitLab partial support** — Works but DOM selectors may differ slightly from GitHub

---

## ❓ FAQ

**Q: Does QuickDef slow down my GitHub browsing?**  
A: No. The extension uses 50ms throttle on mousemove and 200ms debounce before tooltip shows. Zero noticeable performance impact.

**Q: What if a term isn't in the dictionary?**  
A: If you have a Groq key configured, it asks the LLM. Without it, you get a friendly prompt to add one.

**Q: Is my code safe?**  
A: Yes. We only send token names + language + surrounding line context to APIs/LLMs. Never full code. All caching happens locally in your browser.

**Q: Can I use this on private repositories?**  
A: Yes! The extension works on any GitHub or GitLab page you can access. No special permissions needed beyond viewing the code.

**Q: Will this work on GitHub Enterprise / self-hosted GitLab?**  
A: Currently configured for github.com and gitlab.com. To enable for other hosts, edit `manifest.json` and add your domain to the `host_permissions`.

**Q: How often are definitions updated?**  
A: The static dictionary is updated with each extension version. Public API data (npm, PyPI, DevDocs) is fetched real-time. LLM responses are generated on-the-fly.

**Q: Can I disable it on certain sites?**  
A: Yes! Use the popup toggle to enable/disable QuickDef. It won't run on disabled sites.

---

## 📞 Support

**Have questions?**
- 🐛 [GitHub Issues](https://github.com/P-Maheswari/QuickDef-Hover-Definitions/issues)
- 📧 Email: [mahi3109@gmail.com]

**Like QuickDef?**
- ⭐ Star this repo!
- 📢 Share it with your team

---

## 📜 License

MIT License — See [LICENSE](LICENSE) file for details.

Free to use, modify, and distribute. No strings attached.

---

## 🙏 Acknowledgments

- **Groq API** — For powerful open-source LLM inference
- **DevDocs** — For comprehensive documentation APIs
- **npm & PyPI** — Public registries we tap into
- **GitHub & GitLab** — For being awesome platforms

---

<div align="center">

**Made with ❤️ by P Maheswari**

[GitHub](https://github.com/P-Maheswari) • [LinkedIn](https://www.linkedin.com/in/pitta-maheswari-60b52019b/)

</div>
