/**
 * lookup.js — Three-tier lookup engine
 *
 * Tier 1 – Bundled definitions.js       (0 ms,  ~400 curated entries)
 * Tier 2 – DevDocs / npm / PyPI APIs    (100–400 ms, zero maintenance)
 * Tier 3 – Groq LLM fallback            (600–1500 ms, requires API key)
 *
 * All results normalised to: { lang, what, purpose, example, note, docs, source }
 */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const NPM_URL = "https://registry.npmjs.org";
const PYPI_URL = "https://pypi.org/pypi";
const DEVDOCS_BASE = "https://devdocs.io/docs";

// ── LRU cache ─────────────────────────────────────────────────────────────────
const CACHE_MAX = 300;
const resultCache = new Map();

function cacheGet(key) {
  if (!resultCache.has(key)) return null;
  const v = resultCache.get(key);
  resultCache.delete(key); resultCache.set(key, v);
  return v;
}
function cacheSet(key, val) {
  if (resultCache.size >= CACHE_MAX) resultCache.delete(resultCache.keys().next().value);
  resultCache.set(key, val);
}

// ── Main entry point ──────────────────────────────────────────────────────────
async function lookup(token, lang, context, groqKey, groqModel, signal) {
  const cacheKey = `v5::${lang}::${token}`;
  const cached = cacheGet(cacheKey);
  if (cached) return { ...cached, fromCache: true };

  // Tier 1 — bundled definitions.js (exact + @-annotation aliases)
  const defs = globalThis.DEFINITIONS || {};
  const cleanToken = token.replace(/[(),;{}]/g, "").trim();

  const tier1Keys = [
    cleanToken,
    cleanToken.startsWith("@") ? cleanToken : `@${cleanToken}`,
    cleanToken.replace(/^@+/, ""),
  ];
  let def = null;
  for (const key of tier1Keys) {
    if (key && defs[key]) { def = defs[key]; break; }
  }

  if (def) {
    const result = { ...def, source: "static" };
    cacheSet(cacheKey, result);
    return result;
  }

  // Tier 2 — public APIs (no key, ~100-400 ms)
  const t2 = await tier2Lookup(token, lang, signal);
  if (t2) { cacheSet(cacheKey, t2); return t2; }

  // Tier 3 — Groq LLM fallback
  if (!groqKey) return null;
  const t3 = await groqLookup(token, lang, context, groqKey, groqModel, signal);
  if (t3) { cacheSet(cacheKey, t3); return t3; }

  return null;
}

// ── Tier 2 — DevDocs / npm / PyPI ────────────────────────────────────────────
async function tier2Lookup(token, lang, signal) {
  const ll = (lang || "").toLowerCase();

  try {
    // 1. Web APIs first — they overlap with lowercase identifiers ("fetch", "URL")
    if (isWebAPILike(token)) {
      return await devdocsLookup("dom", token, signal);
    }

    // 2. npm packages (JS/TS contexts, kebab-case/scoped names)
    if (isNpmContext(ll) && isNpmPackage(token)) {
      return await npmLookup(token, signal);
    }

    // 3. PyPI packages
    if (isPyContext(ll) && isPyPackage(token)) {
      return await pypiLookup(token, signal);
    }

    // 4. JS/TS built-ins (PascalCase / known globals)
    if (isJSContext(ll) && isBuiltinLike(token)) {
      return await devdocsLookup("javascript", token, signal);
    }

    // 5. Python built-ins
    if (isPyContext(ll) && isBuiltinLike(token)) {
      return await devdocsLookup("python~3.12", token, signal);
    }

  } catch (e) {
    if (e?.name === "AbortError") throw e;
    // All other tier-2 errors are silent — fall through to LLM
  }

  return null;
}

// ── npm ───────────────────────────────────────────────────────────────────────
async function npmLookup(pkg, signal) {
  const res = await fetch(`${NPM_URL}/${encodeURIComponent(pkg)}/latest`, {
    signal, headers: { Accept: "application/json" }
  });
  if (!res.ok) return null;
  const d = await res.json();
  if (!d?.description) return null;
  return {
    lang: "npm package",
    what: `${d.name}@${d.version} — ${d.description}`,
    purpose: d.homepage ? `Homepage: ${d.homepage}` : (d.repository?.url || ""),
    example: `import '${d.name}'`,
    note: d.deprecated ? `⚠ Deprecated: ${d.deprecated}` : null,
    docs: `https://www.npmjs.com/package/${d.name}`,
    source: "npm"
  };
}

// ── PyPI ──────────────────────────────────────────────────────────────────────
async function pypiLookup(pkg, signal) {
  const res = await fetch(`${PYPI_URL}/${encodeURIComponent(pkg)}/json`, {
    signal, headers: { Accept: "application/json" }
  });
  if (!res.ok) return null;
  const info = (await res.json())?.info;
  if (!info?.summary) return null;
  return {
    lang: "PyPI package",
    what: `${info.name} ${info.version} — ${info.summary}`,
    purpose: info.home_page || "",
    example: `pip install ${info.name}`,
    note: null,
    docs: `https://pypi.org/project/${info.name}/`,
    source: "pypi"
  };
}

// ── DevDocs ───────────────────────────────────────────────────────────────────
const devdocsIndex = {};

async function devdocsLookup(docset, token, signal) {
  if (!devdocsIndex[docset]) {
    const res = await fetch(`${DEVDOCS_BASE}/${docset}/index.json`, {
      signal, headers: { Accept: "application/json" }
    });
    if (!res.ok) return null;
    const data = await res.json();
    const map = {};
    for (const e of (data.entries || [])) map[e.name.toLowerCase()] = e;
    devdocsIndex[docset] = map;
  }

  const idx = devdocsIndex[docset];
  const match = idx[token.toLowerCase()] || idx[token.toLowerCase() + "()"];
  if (!match) return null;

  const langLabel = docset.startsWith("python") ? "Python built-in"
    : docset === "dom" ? "Web API"
      : "JavaScript built-in";
  return {
    lang: langLabel,
    what: `${match.name} — ${match.type || "built-in"}`,
    purpose: `Part of the ${docset.replace(/~.*/, "")} standard library.`,
    example: match.name,
    note: null,
    docs: `https://devdocs.io/${docset}/${match.path}`,
    source: "devdocs"
  };
}

// ── Tier 3 — Groq LLM ────────────────────────────────────────────────────────
async function groqLookup(token, lang, context, groqKey, groqModel, signal) {
  const prompt =
    `You are a developer assistant in a GitHub/GitLab code viewer.
The developer hovered on this EXACT token: "${token}"
You MUST explain "${token}" only — not other words from the line.
Language/Framework: ${lang || "unknown"}
Full line of code: ${context || "(unavailable)"}

Reply in this EXACT plain-text format — no markdown, no fences:

LANG: Specific language or framework (e.g. "Java · Spring", "Python · pytest")
WHAT: One sentence — what is "${token}"?
PURPOSE: One sentence — what does it do or why is it used?
EXAMPLE: One short inline usage example (≤1 line of code).
NOTE: One tip or gotcha (≤15 words). Write NONE if nothing important.
DOCS: Official documentation URL. Write NONE if unknown.

Under 100 words total. Be concrete and language-specific.`;

  const res = await fetch(GROQ_URL, {
    method: "POST", signal,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${groqKey}`
    },
    body: JSON.stringify({
      model: groqModel || "llama-3.1-8b-instant",
      max_tokens: 200,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Groq ${res.status}: ${err?.error?.message || res.statusText}`);
  }

  const raw = (await res.json()).choices?.[0]?.message?.content?.trim() || "";
  return parseGroqResponse(raw);
}

function parseGroqResponse(raw) {
  const get = (prefix) => {
    const line = raw.split("\n").map(l => l.trim()).find(l => l.startsWith(prefix + ":"));
    return line ? line.slice(prefix.length + 1).trim() : null;
  };
  const what = get("WHAT");
  if (!what) return null;
  const note = get("NOTE"), docs = get("DOCS");
  return {
    lang: get("LANG") || "Code",
    what,
    purpose: get("PURPOSE") || "",
    example: get("EXAMPLE") || null,
    note: (note && note !== "NONE") ? note : null,
    docs: (docs && docs !== "NONE") ? docs : null,
    source: "llm"
  };
}

// ── Predicates ────────────────────────────────────────────────────────────────
function isNpmContext(ll) {
  return /javascript|typescript|react|node|next|vue|svelte|angular|nestjs/.test(ll);
}
function isPyContext(ll) {
  return /python|django|flask|fastapi/.test(ll);
}
function isJSContext(ll) {
  return /javascript|typescript|react|node/.test(ll);
}
// npm/pip names: strictly lowercase + hyphens, no camelCase
function isNpmPackage(t) {
  return /^@?[a-z][a-z0-9-]*(\/[a-z0-9-]+)?$/.test(t) && t.length > 2 && t.length < 60;
}
function isPyPackage(t) {
  return /^[a-z][a-z0-9_-]*$/.test(t) && t.length > 2 && t.length < 60;
}
// Built-ins are PascalCase or camelCase, no @
function isBuiltinLike(t) {
  return /^[A-Za-z][a-zA-Z0-9]+$/.test(t) && t.length > 2;
}
const WEB_APIS = new Set([
  "fetch", "Request", "Response", "Headers", "AbortController", "AbortSignal",
  "FormData", "URLSearchParams", "URL", "Blob", "File", "FileReader",
  "IntersectionObserver", "MutationObserver", "ResizeObserver",
  "WebSocket", "EventSource", "BroadcastChannel", "Worker", "SharedWorker",
  "localStorage", "sessionStorage", "document", "window", "navigator", "location",
  "requestAnimationFrame", "requestIdleCallback", "queueMicrotask",
  "structuredClone", "crypto", "Notification", "Geolocation", "history"
]);
function isWebAPILike(t) { return WEB_APIS.has(t); }
