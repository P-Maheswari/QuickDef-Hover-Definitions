/**
 * content.js — CodeLens v2.3 (restored hover + larger tooltip)
 *
 *  - Robust caret resolution (text nodes, textarea, element containers)
 *  - GitHub React overlay + textarea fallback
 *  - isInCodeArea() unifies code-view detection; broader GitHub selectors
 *  - Reliable tooltip dismiss via elementFromPoint (not :hover)
 *  - Keywords no longer blocked by isTrivial noise filter
 */

const HOVER_DELAY = 200;
const TOOLTIP_ID  = "codelens-tooltip";
const TOOLTIP_LABEL = "QuickDef";
const WALK_DEPTH  = 12;
const MIN_LEN     = 2;

let tooltip      = null;
let hoverTimer   = null;
let currentToken = null;
let enabled      = true;
let groqKey      = "";
let groqModel    = "llama-3.1-8b-instant";
let abortCtrl    = null;
let mouseX = 0, mouseY = 0;
let scrollTimer  = null;
let lastUrl      = location.href;
let clDebug      = false;
let moveTimer    = null;
let hideTimer    = null;
let lookupGen    = 0;

// ─── Init ──────────────────────────────────────────────────────────────────────
(async () => {
  const data = await chrome.storage.local.get(["groqKey", "groqModel", "clEnabled", "clDebug"]);
  groqKey   = data.groqKey   || "";
  groqModel = data.groqModel || "llama-3.1-8b-instant";
  enabled   = data.clEnabled !== false;
  clDebug   = data.clDebug === true || location.search.includes("codelens_debug");
  chrome.runtime.onMessage.addListener(onMessage);
  boot();
})();

function boot() {
  const run = () => {
    if (!document.getElementById(TOOLTIP_ID)) {
      createTooltip();
      attachListeners();
      observeNavigation();
    }
    dbg("boot", {
      enabled,
      url: location.pathname,
      onCodePage: isOnCodePage(),
      tooltip: !!document.getElementById(TOOLTIP_ID),
    });
  };
  if (document.body) run();
  else document.addEventListener("DOMContentLoaded", run, { once: true });
}

function dbg(...args) {
  if (!clDebug) return;
  console.log("[CodeLens]", ...args);
}

function prepareTooltipHitTest() {
  if (tooltip && !tooltip.classList.contains("cl-visible") && !tooltip.classList.contains("cl-pinned")) {
    tooltip.style.pointerEvents = "none";
  }
}

function pierceShadow(el, x, y) {
  let node = el;
  while (node?.shadowRoot) {
    const inner = node.shadowRoot.elementFromPoint(x, y);
    if (!inner || inner === node) break;
    node = inner;
  }
  return node;
}

/** Full hit-test stack (top → bottom). */
function stackUnderMouse(x, y) {
  prepareTooltipHitTest();
  return document.elementsFromPoint(x, y).filter(el =>
    el?.nodeType === Node.ELEMENT_NODE &&
    el.id !== TOOLTIP_ID &&
    !tooltip?.contains(el)
  );
}

/** Prefer syntax overlay spans; skip GitHub's hidden full-file textarea. */
function codeElementUnderMouse(x, y) {
  prepareTooltipHitTest();
  const stack = document.elementsFromPoint(x, y);
  const skipTa = isGithubBlobPage();

  for (const raw of stack) {
    if (!raw || raw.id === TOOLTIP_ID || tooltip?.contains(raw)) continue;
    const tag = (raw.tagName || "").toLowerCase();
    if (skipTa && tag === "textarea") continue;

    const el = pierceShadow(raw, x, y);
    if (tag === "span") return el;
    if (el.closest?.("span, [class*='react-file-line'], .blob-code, [class*='pl-']")) return el;
    if (isInCodeArea(el)) return el;
  }

  const fallback = pierceShadow(document.elementFromPoint(x, y), x, y);
  if (skipTa && (fallback?.tagName || "").toLowerCase() === "textarea") return null;
  return fallback;
}

function elementUnderMouse(x, y) {
  return codeElementUnderMouse(x, y) || pierceShadow(document.elementFromPoint(x, y), x, y);
}

function hasSyntaxSpanAtPoint(x, y) {
  return stackUnderMouse(x, y).some(el => {
    if ((el.tagName || "").toLowerCase() !== "span") return false;
    return isInCodeArea(el) || !!el.closest?.("[class*='react-file-line'], .blob-code, [class*='pl-']");
  });
}

function findSyntaxOverlayRoot() {
  return document.querySelector([
    "[class*='codeBlobInner']", "[class*='codeBlobWrapper']",
    "[class*='codeBlob']", "[class*='blobContent']",
    "[data-testid='CodeViewer']", "[class*='HighlightModule']",
  ].join(","));
}

function onMessage(msg) {
  if (msg.type !== "CL_SETTINGS_UPDATED") return;
  groqKey   = msg.groqKey   !== undefined ? msg.groqKey   : groqKey;
  groqModel = msg.groqModel !== undefined ? msg.groqModel : groqModel;
  enabled   = msg.enabled   !== undefined ? msg.enabled   : enabled;
  if (!enabled) hideTooltip(true);
}

function observeNavigation() {
  const onNav = () => {
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    hideTooltip(true);
    if (!document.getElementById(TOOLTIP_ID)) boot();
  };
  ["turbo:load", "turbo:render", "soft-nav:end", "pjax:end"].forEach(e =>
    document.addEventListener(e, onNav)
  );
  window.addEventListener("popstate", onNav);
}

// ─── Guard: only activate on actual file/blob pages ───────────────────────────
function isOnCodePage() {
  const path = location.pathname;
  return (
    // GitHub file view
    /\/blob\//.test(path) ||
    // GitHub PR diff
    /\/pull\/\d+\/files/.test(path) ||
    // GitLab file view
    /\/-\/blob\//.test(path) ||
    // GitLab MR diff
    /\/merge_requests\/\d+\/diffs/.test(path)
  );
}
// ─── Tooltip DOM ───────────────────────────────────────────────────────────────
function createTooltip() {
  tooltip = document.createElement("div");
  tooltip.id = TOOLTIP_ID;
  tooltip.setAttribute("role", "tooltip");
  tooltip.innerHTML = `
    <div class="cl-header">
      <span class="cl-badge" id="cl-badge">${TOOLTIP_LABEL}</span>
      <span class="cl-token" id="cl-token"></span>
      <button class="cl-close" id="cl-close" title="Close">✕</button>
    </div>
    <div class="cl-lang" id="cl-lang"></div>
    <div class="cl-body">
      <div class="cl-loading" id="cl-loading">
        <div class="cl-spinner"></div><span id="cl-loading-text">Looking up…</span>
      </div>
      <div class="cl-content" id="cl-content" style="display:none"></div>
    </div>
    <div class="cl-footer" id="cl-footer" style="display:none">
      <div class="cl-footer-left">
        <button class="cl-pin" id="cl-pin">📌 Pin</button>
        <span class="cl-src" id="cl-src"></span>
      </div>
      <a class="cl-docs" id="cl-docs" target="_blank" rel="noopener">Docs ↗</a>
    </div>`;
  document.body.appendChild(tooltip);
  tooltip.style.pointerEvents = "none";

  document.getElementById("cl-close").addEventListener("click", e => {
    e.stopPropagation(); hideTooltip(true);
  });
  document.getElementById("cl-pin").addEventListener("click", e => {
    e.stopPropagation();
    tooltip.classList.toggle("cl-pinned");
    document.getElementById("cl-pin").textContent =
      tooltip.classList.contains("cl-pinned") ? "📌 Pinned" : "📌 Pin";
  });
}

// ─── Listeners ─────────────────────────────────────────────────────────────────
function attachListeners() {
  document.addEventListener("mousemove", onMouseMove, true);
  document.addEventListener("mouseover", onMouseOver, true);
  document.addEventListener("mouseout",  onMouseOut,  true);
  document.addEventListener("keydown",   e => { if (e.key === "Escape") hideTooltip(true); });
  document.addEventListener("scroll", () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      if (!tooltip?.classList.contains("cl-pinned")) hideTooltip();
    }, 150);
  }, true);
}

function getEventTarget(e) {
  const path = e.composedPath?.();
  if (path?.length) {
    for (const n of path) {
      if (n?.nodeType === Node.ELEMENT_NODE && n.id !== TOOLTIP_ID && !tooltip?.contains(n)) {
        return n;
      }
    }
  }
  return elementUnderMouse(e.clientX, e.clientY) || e.target;
}

function scheduleHover(token) {
  clearTimeout(hoverTimer);
  clearTimeout(hideTimer);

  if (!token) {
    hideTimer = setTimeout(() => {
      if (!tooltip?.classList.contains("cl-pinned")) hideTooltip();
    }, 150);
    return;
  }

  if (token.text === currentToken && tooltip?.classList.contains("cl-visible")) return;

  hoverTimer = setTimeout(() => {
    dbg("trigger", token.text, "lang", token.lang);
    triggerTooltip(token);
  }, HOVER_DELAY);
}

function onMouseMove(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (!enabled || !isOnCodePage()) {
    scheduleHover(null);
    return;
  }

  clearTimeout(moveTimer);
  moveTimer = setTimeout(() => {
    const el = getEventTarget(e);
    const token = resolveToken(el);
    if (!token) dbg("no token");
    scheduleHover(token);
  }, 50);
}

function onMouseOver(e) {
  if (!enabled || !isOnCodePage()) return;
  mouseX = e.clientX;
  mouseY = e.clientY;
  scheduleHover(resolveToken(getEventTarget(e)));
}

function onMouseOut(e) {
  clearTimeout(hoverTimer);
  const rel = e.relatedTarget;
  if (tooltip && (tooltip === rel || tooltip.contains(rel))) return;
  if (!tooltip?.classList.contains("cl-pinned")) {
    hideTimer = setTimeout(() => {
      const el = codeElementUnderMouse(mouseX, mouseY);
      if (el && isInCodeArea(el) && resolveToken(el)) return;
      hideTooltip();
    }, 150);
  }
}

// ─── Token Resolution ──────────────────────────────────────────────────────────
function getText(node) {
  const dct = node.getAttribute ? node.getAttribute("data-code-text") : null;
  if (dct !== null && dct.trim()) return dct.trim();
  return (node.textContent || "").trim();
}

// Token text: visible span content only (never data-code-text — often whole line/file)
function getSpanTokenRaw(node) {
  return (node?.textContent || "").trim();
}

function githubHasSyntaxOverlay() {
  return !!document.querySelector(
    "[class*='react-file-line'] span, [class*='react-code-line'] span, .blob-code span, span[class*='pl-']"
  );
}

function getCodeLineAtMouse() {
  for (const el of stackUnderMouse(mouseX, mouseY)) {
    const line = el.closest?.([
      "[class*='react-file-line']", "[class*='react-code-line']",
      "tr", ".blob-code", ".line_content",
    ].join(","));
    if (line) return line;
  }
  const el = codeElementUnderMouse(mouseX, mouseY);
  return el?.closest?.([
    "[class*='react-file-line']", "[class*='react-code-line']",
    "tr", ".blob-code", ".line_content",
  ].join(",")) || null;
}

function withAnnotationPrefix(span, word) {
  if (!word || word.startsWith("@")) return word;
  let prev = span?.previousElementSibling;
  for (let i = 0; i < 3 && prev; i++) {
    const t = getSpanTokenRaw(prev);
    if (t === "@") return "@" + word;
    if (t && t !== "@") break;
    prev = prev.previousElementSibling;
  }
  const parent = span?.parentElement;
  if (parent) {
    const kids = [...parent.children];
    const idx = kids.indexOf(span);
    if (idx > 0) {
      const t = getSpanTokenRaw(kids[idx - 1]);
      if (t === "@") return "@" + word;
    }
  }
  return word;
}

function pointInRect(x, y, r) {
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

function getSpanAtPoint(x, y) {
  let best = null;
  let bestArea = Infinity;

  for (const el of stackUnderMouse(x, y)) {
    if ((el.tagName || "").toLowerCase() !== "span") continue;
    if (!normalizeTokenText(getSpanTokenRaw(el), el)) continue;
    const r = el.getBoundingClientRect();
    const area = r.width * r.height;
    if (area > 0 && area < bestArea) { best = el; bestArea = area; }
  }
  if (best) return best;

  const roots = [getCodeLineAtMouse(), findSyntaxOverlayRoot()].filter(Boolean);
  for (const root of roots) {
    for (const s of root.querySelectorAll?.("span") || []) {
      const r = s.getBoundingClientRect();
      if (!pointInRect(x, y, r)) continue;
      if (!normalizeTokenText(getSpanTokenRaw(s), s)) continue;
      const area = r.width * r.height;
      if (area > 0 && area < bestArea) { best = s; bestArea = area; }
    }
  }
  return best;
}

// Stable code block selectors — NOT hashed CSS module class names
function isInCodeBlock(node) {
  try {
    return !!node.closest([
      // GitHub old view
      ".blob-code", ".blob-code-inner",
      // GitHub PR diff
      ".blob-code-addition", ".blob-code-deletion",
      // GitLab
      ".line_content", ".code.highlight", ".blob-viewer pre",
      // Generic
      "pre code", ".highlight pre"
    ].join(","));
  } catch { return false; }
}

function isGithubHost() {
  return /github\.com$/i.test(location.hostname);
}

function isGithubBlobPage() {
  return isGithubHost() && /\/blob\//.test(location.pathname);
}

const CODE_AREA_SEL = [
  "[class*='codeBlobInner']", "[class*='codeBlobWrapper']", "[class*='codeBlob']",
  "[class*='blobContent']", "[class*='react-file-line']", "[class*='react-code-line']",
  "[data-testid='CodeViewer']", "table.highlight",
  ".blob-code", ".blob-code-inner", ".line_content", "pre code",
].join(",");

const CODE_AREA_REJECT = [
  "[class*='StickyHeader']", "[class*='file-header']", "[class*='OverviewHeader']",
  "[class*='SymbolNav']", "[class*='Symbol']", "[class*='symbols']",
  "[class*='TreeView']", "[class*='CodeNav']", "[class*='BreadcrumbsPath']",
  "[data-testid='repos-file-tree']", ".react-blob-view-header", ".file-navigation",
  "[role='tablist']", "nav", "aside", "header",
].join(",");

function isInCodeArea(node) {
  if (!node || tooltip?.contains(node)) return false;
  const cls = typeof node.className === "string" ? node.className : "";
  if (/line-number|blob-num|react-line-number|diff-line-num|LineNumber/i.test(cls)) {
    return false;
  }
  if (node.closest?.(CODE_AREA_REJECT)) return false;
  if (isInCodeView(node) || isInCodeBlock(node)) return true;
  if (isGithubBlobPage()) return !!node.closest?.(CODE_AREA_SEL);
  return false;
}

// Stable GitHub new React view selectors (partial class names, not hashed modules)
function isInCodeView(node) {
  try {
    const codeArea = node.closest([
      // GitHub React file / blob view
      "[class*='react-file-line']",
      "[class*='react-code-line']",
      "[class*='react-code-text']",
      "[class*='codeBlobInner']",
      "[class*='codeBlobWrapper']",
      "[class*='codeBlob']",
      "[class*='blobContentSection']",
      "[class*='BlobContent']",
      "[class*='blobViewer']",
      "[class*='file-view-code']",
      "[class*='HighlightModule']",
      "[class*='react-code-full']",
      "textarea[class*='react-blob']",
      "textarea[data-editor-input]",
      "[data-code-marker]",
      // GitHub PR diff (React)
      "[class*='diff-line']",
      "[class*='DiffLine']",
      // Old GitHub + GitLab
      ".blob-code", ".blob-code-inner",
      ".line_content", ".code.highlight pre",
      ".cm-content", ".CodeMirror-code",
    ].join(","));

    if (!codeArea) return false;

    // Reject chrome around the editor (not bare nav/header — too broad on GitHub)
    const reject = node.closest([
      "[class*='StickyHeader']",
      "[class*='CodeViewHeader']",
      "[class*='TreeView']",
      "[class*='SymbolNav']",
      "[class*='CodeNav']",
      "[class*='BreadcrumbsPath']",
      "[class*='breadcrumb']",
      ".file-navigation",
      ".repository-content > nav",
    ].join(","));

    return !reject;
  } catch { return false; }
}

function isSingleTokenText(raw) {
  const t = (raw || "").trim();
  if (!t || /\s/.test(t)) return false;
  const clean = t.replace(/[(),;{}[\]]/g, "").trim();
  return clean.length >= MIN_LEN && isIdentifier(clean) && !isTrivial(clean);
}

function normalizeTokenText(raw, spanForAt) {
  const trimmed = (raw || "").trim();
  if (!trimmed || /\s/.test(trimmed)) return null;

  if (trimmed === "@" && spanForAt) {
    const next = spanForAt.nextElementSibling;
    const nxt = getSpanTokenRaw(next);
    if (nxt && /^[a-zA-Z_][\w$]*/.test(nxt)) {
      const merged = ("@" + nxt).replace(/[(),;{}[\]]/g, "").trim();
      if (merged.length >= MIN_LEN && !isTrivial(merged)) return merged;
    }
    return null;
  }

  let t = trimmed.replace(/[(),;{}[\]]/g, "").trim();
  if (spanForAt) t = withAnnotationPrefix(spanForAt, t);
  if (t.length < MIN_LEN || isTrivial(t) || /^[0-9]+$/.test(t)) return null;
  if (!/^[@$#]?[a-zA-Z_][\w$.-]*$/.test(t)) return null;
  return t;
}

/** True when the cursor is directly on a word/token (not whitespace/gutters). */
function wordUnderCursor() {
  const span = getSpanAtPoint(mouseX, mouseY);
  if (span) {
    const w = normalizeTokenText(getSpanTokenRaw(span), span);
    if (w) return w;
  }
  const caret = resolveCaretAtPoint(mouseX, mouseY);
  if (caret?.node) {
    const tag = (caret.anchor?.tagName || "").toLowerCase();
    if (tag !== "textarea") {
      const w = validateWord(expandWord(caret.node.textContent || "", caret.offset));
      if (w) return w;
    }
  }
  return null;
}

function getSpanTokenAtMouse() {
  const span = getSpanAtPoint(mouseX, mouseY);
  if (span) {
    const raw = getSpanTokenRaw(span);
    const word = normalizeTokenText(raw, span);
    if (word) return makeToken(span, word);
  }

  let node = codeElementUnderMouse(mouseX, mouseY);
  if (!node || !isInCodeArea(node)) return null;
  let best = null;
  for (let i = 0; i < 12; i++) {
    if (!node || node === document.body) break;
    if ((node.tagName || "").toLowerCase() === "span") {
      const r = node.getBoundingClientRect();
      if (!pointInRect(mouseX, mouseY, r)) { node = node.parentElement; continue; }
      const raw = getSpanTokenRaw(node);
      const word = normalizeTokenText(raw, node);
      if (word && (!best || raw.length <= best.rawLen)) {
        best = { node, word, rawLen: raw.length };
      }
    }
    node = node.parentElement;
  }
  return best ? makeToken(best.node, best.word) : null;
}

function getWordFromCodeLine() {
  const line = getCodeLineAtMouse();
  if (!line) return null;
  const caret = resolveCaretAtPoint(mouseX, mouseY);
  if (!caret?.node || !line.contains(caret.anchor)) return null;
  const text = caret.node.textContent || "";
  let word = validateWord(expandWord(text, caret.offset));
  if (!word) return null;
  const anchor = caret.anchor;
  if (anchor?.tagName === "SPAN") word = withAnnotationPrefix(anchor, word);
  return makeToken(anchor, word);
}

function resolveToken(el) {
  if (!el || el === document.body || tooltip?.contains(el)) return null;

  const hit = codeElementUnderMouse(mouseX, mouseY);
  if (!hit || !isInCodeArea(hit)) return null;

  // Inside the file but on whitespace / margins — no popup
  if (!wordUnderCursor()) return null;

  const spanToken = getSpanTokenAtMouse();
  if (spanToken) { dbg("token:span", spanToken.text); return spanToken; }

  const lineToken = getWordFromCodeLine();
  if (lineToken) { dbg("token:line", lineToken.text); return lineToken; }

  const hoverToken = getWordFromHoverElement(codeElementUnderMouse(mouseX, mouseY) || el);
  if (hoverToken) { dbg("token:hover", hoverToken.text); return hoverToken; }

  const wordToken = getWordAtMouse();
  if (wordToken) { dbg("token:caret", wordToken.text); return wordToken; }

  // GitHub React: span/caret paths only (parent-walk causes false tokens on empty lines)
  if (isGithubBlobPage()) return null;

  // Strategy B: syntax span walk (GitLab, GitHub old view)
  let node = el;
  for (let i = 0; i < WALK_DEPTH; i++) {
    if (!node || node === document.body) break;
    if (node.id === TOOLTIP_ID) return null;

    const cls   = typeof node.className === "string" ? node.className : "";
    const tag   = (node.tagName || "").toLowerCase();
    const style = node.getAttribute ? (node.getAttribute("style") || "") : "";
    const text  = getText(node);
    const cleanText = text.replace(/\s+/g, "").replace(/[(),;{}[\]]/g, "").trim();

    if (/blob-num|line-number|LineNumber|ln-num|diff-line-num/.test(cls)) {
      node = node.parentElement; continue;
    }
    if (!cleanText || cleanText.length < MIN_LEN || isTrivial(cleanText)) {
      node = node.parentElement; continue;
    }

    // GitHub blob: single-token span only (avoid whole-line parent text)
    if (isGithubBlobPage() && tag === "span" && isInCodeArea(node)) {
      const word = normalizeTokenText(getSpanTokenRaw(node), node);
      if (word) return makeToken(node, word);
    }

    // GitHub PrettyLights — span + single visible token only
    if (tag === "span" && /\bpl-/.test(cls)) {
      const word = normalizeTokenText(getSpanTokenRaw(node), node);
      if (word) return makeToken(node, word);
    }

    // GitHub React inline-styled spans
    if (tag === "span" && (style.includes("color:") || style.includes("--color:"))) {
      const word = normalizeTokenText(getSpanTokenRaw(node), node);
      if (word && isInCodeArea(node)) return makeToken(node, word);
    }

    // GitLab Rouge
    if (/\b(nc|nd|nf|nb|nv|na|no|ni|nt|nn|kd|kn|kp|kr|kt|kc|ow)\b/.test(cls)) return makeToken(node, cleanText);
    if (/\bk\b/.test(cls) && isMeaningfulKeyword(cleanText)) return makeToken(node, cleanText);

    // highlight.js
    if (/\bhljs-(title|built_in|type|attr|name|selector-tag|decorator|meta|class)\b/.test(cls)) return makeToken(node, cleanText);
    if (/\bhljs-keyword\b/.test(cls) && isMeaningfulKeyword(cleanText)) return makeToken(node, cleanText);

    // Prism.js
    if (/\btoken\b/.test(cls)) {
      if (/\b(function|class-name|decorator|annotation|builtin|namespace|property|tag|attr-name|entity)\b/.test(cls)) return makeToken(node, cleanText);
      if (/\bkeyword\b/.test(cls) && isMeaningfulKeyword(cleanText)) return makeToken(node, cleanText);
    }

    // CodeMirror
    if (/\bcm-(def|variable-2|variable|property|qualifier|tag|builtin|atom)\b/.test(cls)) return makeToken(node, cleanText);

    node = node.parentElement;
  }
  return null;
}

function resolveCaretAtPoint(x, y) {
  let range;
  try { range = document.caretRangeFromPoint(x, y); }
  catch { return null; }
  if (!range) return null;

  let node = range.startContainer;
  let offset = range.startOffset;

  if (node?.nodeType === Node.TEXT_NODE) {
    return { node, offset, anchor: node.parentElement };
  }

  if (node?.nodeType === Node.ELEMENT_NODE) {
    const tag = (node.tagName || "").toLowerCase();
    if (tag === "textarea") {
      const text = node.value || "";
      const off = Math.min(Math.max(0, offset), text.length);
      return { textarea: node, text, offset: off, anchor: node };
    }
    const found = findTextNodeNear(node, offset);
    if (found) return { node: found.node, offset: found.offset, anchor: node };
  }

  return null;
}

function findTextNodeNear(el, offset) {
  const child = el.childNodes[offset] || el.childNodes[offset - 1];
  if (child?.nodeType === Node.TEXT_NODE) {
    return { node: child, offset: Math.min(offset, child.length) };
  }
  if (child) {
    const walker = document.createTreeWalker(child, NodeFilter.SHOW_TEXT);
    const n = walker.nextNode();
    if (n) return { node: n, offset: 0 };
  }
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const n = walker.nextNode();
  if (n) return { node: n, offset: 0 };
  return null;
}

function expandWord(text, offset) {
  const isWordChar = (ch) => ch && /[a-zA-Z0-9_$]/.test(ch);
  let start = offset;
  let end = offset;
  while (start > 0 && isWordChar(text[start - 1])) start--;
  while (end < text.length && isWordChar(text[end])) end++;
  if (end <= start) return null;
  let word = text.slice(start, end);
  if (start > 0 && text[start - 1] === "@") word = "@" + word;
  return word.trim();
}

function validateWord(word) {
  if (!word || word.length < MIN_LEN) return null;
  if (isTrivial(word)) return null;
  if (/^[0-9]+$/.test(word)) return null;
  return word;
}

function getWordFromTextarea(ta, x, y) {
  if (!ta) return null;
  if (!isGithubBlobPage() && !isInCodeArea(ta)) return null;
  const caret = resolveCaretAtPoint(x, y);
  if (caret?.textarea === ta) {
    const word = validateWord(expandWord(caret.text, caret.offset));
    if (word) return makeToken(ta, word);
  }
  return null;
}

function getWordFromHoverElement(el) {
  if (!el || !isInCodeArea(el)) return null;
  let node = el;
  let best = null;
  for (let i = 0; i < 10; i++) {
    if (!node || node === document.body) break;
    if ((node.tagName || "").toLowerCase() === "span") {
      const r = node.getBoundingClientRect();
      if (!pointInRect(mouseX, mouseY, r)) { node = node.parentElement; continue; }
      const raw = getSpanTokenRaw(node);
      const word = normalizeTokenText(raw, node);
      if (word && (!best || raw.length < best.rawLen)) {
        best = { node, word, rawLen: raw.length };
      }
    }
    node = node.parentElement;
  }
  return best ? makeToken(best.node, best.word) : null;
}

function getWordAtMouse() {
  const el = codeElementUnderMouse(mouseX, mouseY);
  if (!el || tooltip?.contains(el)) return null;

  // GitHub: syntax overlay spans — never use hidden textarea (wrong offset → always "package")
  if (isGithubBlobPage() && hasSyntaxSpanAtPoint(mouseX, mouseY)) {
    const span = getSpanAtPoint(mouseX, mouseY);
    if (span) {
      const word = normalizeTokenText(getSpanTokenRaw(span), span);
      if (word) return makeToken(span, word);
    }
    const caret = resolveCaretAtPoint(mouseX, mouseY);
    if (caret?.node && caret.anchor) {
      const anchorTag = (caret.anchor.tagName || "").toLowerCase();
      if (anchorTag !== "textarea" && isInCodeArea(caret.anchor)) {
        const text = caret.node.textContent || "";
        let word = validateWord(expandWord(text, caret.offset));
        if (word) {
          if (caret.anchor.tagName === "SPAN") word = withAnnotationPrefix(caret.anchor, word);
          return makeToken(caret.anchor, word);
        }
      }
    }
    return null;
  }

  const caret = resolveCaretAtPoint(mouseX, mouseY);
  if (caret?.node && caret.anchor) {
    const anchorTag = (caret.anchor.tagName || "").toLowerCase();
    if (anchorTag !== "textarea" && isInCodeArea(caret.anchor)) {
      const text = caret.node.textContent || "";
      let word = validateWord(expandWord(text, caret.offset));
      if (word) {
        if (caret.anchor.tagName === "SPAN") word = withAnnotationPrefix(caret.anchor, word);
        return makeToken(caret.anchor, word);
      }
    }
  }

  const tag = (el.tagName || "").toLowerCase();
  if (tag === "textarea") return getWordFromTextarea(el, mouseX, mouseY);
  if (caret?.textarea) return getWordFromTextarea(caret.textarea, mouseX, mouseY);
  return null;
}

function makeToken(node, text) {
  return { text, lang: detectLang(), context: getLineContext(node) };
}

function isTrivial(text) {
  // Operators / punctuation only — language keywords are allowed
  const NOISE = new Set([
    "=","=>","->","{","}","(",")","[","]",";",",",":",".",
    "+","-","*","/","%","!","&","|","^","~","?"
  ]);
  if (NOISE.has(text)) return true;
  if (/^[0-9]+(\.[0-9]+)?$/.test(text)) return true;
  return false;
}

function isMeaningfulKeyword(text) {
  return new Set([
    "async","await","yield","defer","abstract","override","final","sealed",
    "virtual","typeof","instanceof","is","as","in","of","interface","enum",
    "struct","union","type","typedef","class","extends","implements","trait",
    "pub","private","protected","internal","static","const","let","var","val",
    "def","fn","func","new","throw","throws","raise","with","where","when",
    "match","case","switch","import","export","from","use","using","suspend",
    "inline","reified","companion","data","object","goroutine",
  ]).has(text);
}

function isIdentifier(text) {
  return /^[@$#]?[a-zA-Z_][\w$.-]*$/.test(text);
}

// ─── Context & Language ────────────────────────────────────────────────────────
function getLineContext(el) {
  try {
    const tr = el.closest("tr");
    if (tr) {
      const cell = tr.querySelector(".blob-code-inner,.blob-code,.react-file-line,[data-code-marker]");
      return ((cell || tr).textContent || "").replace(/\s+/g, " ").trim().slice(0, 400);
    }
    const line = el.closest("[class*='react-file-line'],[class*='react-code-line'],.line,.line_content,.diff-td");
    if (line) return (line.textContent || "").replace(/\s+/g, " ").trim().slice(0, 400);
    const pre = el.closest("pre,code");
    if (pre) {
      const tok = el.textContent || "";
      const match = (pre.textContent || "").split("\n").find(l => l.includes(tok));
      return (match || "").trim().slice(0, 400);
    }
  } catch {}
  return "";
}

function detectLang() {
  const path = location.pathname;
  const ext  = (path.match(/\.([a-zA-Z0-9]+)(?:[?#]|$)/) || [])[1];
  if (ext) {
    const MAP = {
      js:"javascript", mjs:"javascript", cjs:"javascript", jsx:"react",
      ts:"typescript", tsx:"typescript",
      py:"python", java:"java", kt:"kotlin", go:"go", rs:"rust",
      rb:"ruby", php:"php", cs:"csharp", cpp:"cpp", c:"c",
      swift:"swift", scala:"scala", ex:"elixir", exs:"elixir",
      dart:"dart", r:"r", lua:"lua", tf:"terraform", sol:"solidity",
      vue:"vue", svelte:"svelte", sh:"shell", yaml:"yaml", yml:"yaml",
      json:"json", xml:"xml", html:"html", css:"css", scss:"scss",
      sql:"sql", graphql:"graphql", proto:"protobuf",
    };
    return MAP[ext.toLowerCase()] || ext.toLowerCase();
  }
  const pill = document.querySelector("[data-language],.react-language-name,.language-label");
  if (pill) return (pill.textContent || pill.getAttribute("data-language") || "").trim().toLowerCase();
  return "code";
}

// ─── Trigger ───────────────────────────────────────────────────────────────────
async function triggerTooltip(token) {
  if (!tooltip) return;
  const gen = ++lookupGen;
  currentToken = token.text;
  showLoading(token);
  positionTooltip();

  if (abortCtrl) abortCtrl.abort();
  abortCtrl = new AbortController();

  try {
    const result = await lookup(
      token.text, token.lang, token.context,
      groqKey, groqModel, abortCtrl.signal
    );

    if (gen !== lookupGen) return;
    if (currentToken !== token.text) return;

    dbg("lookup", token.text, result?.source || "none");
    if (result) showResult(result, token);
    else showNotFound(token);

  } catch (err) {
    if (err?.name === "AbortError") return;
    if (gen !== lookupGen) return;
    showError(err.message || "Lookup failed.");
  }
}

function positionTooltip() {
  if (!tooltip) return;
  tooltip.classList.add("cl-visible");
  tooltip.style.pointerEvents = "none";
  document.getElementById("cl-pin").textContent = "📌 Pin";

  const GAP = 16, TW = 520, TH = 420;
  let left = mouseX + GAP, top = mouseY + GAP;
  if (left + TW > window.innerWidth  - 8) left = mouseX - TW - GAP;
  if (top  + TH > window.innerHeight - 8) top  = mouseY - TH - GAP;
  tooltip.style.left = Math.max(4, left + window.scrollX) + "px";
  tooltip.style.top  = Math.max(4, top  + window.scrollY) + "px";
}

// ─── UI States ─────────────────────────────────────────────────────────────────
function showLoading(token) {
  document.getElementById("cl-token").textContent = token.text;
  document.getElementById("cl-lang").textContent  = token.lang;
  document.getElementById("cl-badge").textContent = TOOLTIP_LABEL;
  document.getElementById("cl-badge").className   = "cl-badge";
  document.getElementById("cl-loading-text").textContent = "Looking up…";
  document.getElementById("cl-loading").style.display = "flex";
  document.getElementById("cl-content").style.display = "none";
  document.getElementById("cl-footer").style.display  = "none";
  tooltip.classList.remove("cl-error", "cl-not-found");
}

const SOURCE_LABELS = {
  static:  { label: "Built-in",  cls: "src-static"  },
  npm:     { label: "npm",       cls: "src-npm"      },
  pypi:    { label: "PyPI",      cls: "src-pypi"     },
  devdocs: { label: "DevDocs",   cls: "src-devdocs"  },
  llm:     { label: "AI",        cls: "src-llm"      },
};

function showResult(result, token) {
  const src   = SOURCE_LABELS[result.source] || { label: result.source, cls: "" };
  const badge = document.getElementById("cl-badge");
  badge.textContent = src.label;
  badge.className   = `cl-badge ${src.cls}`;

  document.getElementById("cl-lang").textContent = result.lang || token.lang;

  let html = "";
  if (result.what)    html += `<div class="cl-row"><span class="cl-lbl">WHAT</span><span class="cl-val">${esc(result.what)}</span></div>`;
  if (result.purpose) html += `<div class="cl-row"><span class="cl-lbl">PURPOSE</span><span class="cl-val">${esc(result.purpose)}</span></div>`;
  if (result.example) html += `<div class="cl-row"><span class="cl-lbl">EXAMPLE</span><pre class="cl-example">${esc(result.example)}</pre></div>`;
  if (result.note)    html += `<div class="cl-row cl-note"><span class="cl-lbl">NOTE</span><span class="cl-val">${esc(result.note)}</span></div>`;

  document.getElementById("cl-content").innerHTML = html;
  document.getElementById("cl-loading").style.display = "none";
  document.getElementById("cl-content").style.display = "block";
  document.getElementById("cl-footer").style.display  = "flex";

  const docsEl = document.getElementById("cl-docs");
  if (result.docs) { docsEl.href = result.docs; docsEl.style.display = "inline"; }
  else docsEl.style.display = "none";

  document.getElementById("cl-src").textContent =
    result.fromCache ? "cached" : `via ${src.label.toLowerCase()}`;
}

function showNotFound(token) {
  document.getElementById("cl-badge").textContent = "—";
  document.getElementById("cl-content").innerHTML =
    `<div class="cl-no-result">No definition found for <code>${esc(token.text)}</code>` +
    (groqKey ? "" : `<br><small>Add a Groq API key in settings for AI fallback.</small>`) +
    `</div>`;
  document.getElementById("cl-loading").style.display = "none";
  document.getElementById("cl-content").style.display = "block";
  document.getElementById("cl-footer").style.display  = "none";
  tooltip.classList.add("cl-not-found");
}

function showError(msg) {
  document.getElementById("cl-content").innerHTML = `<div class="cl-err-msg">⚠ ${esc(msg)}</div>`;
  document.getElementById("cl-loading").style.display = "none";
  document.getElementById("cl-content").style.display = "block";
  tooltip.classList.add("cl-error");
}

function hideTooltip(force = false) {
  if (!tooltip) return;
  if (!force && tooltip.classList.contains("cl-pinned")) return;
  lookupGen++;
  clearTimeout(hoverTimer);
  clearTimeout(hideTimer);
  tooltip.classList.remove("cl-visible", "cl-pinned", "cl-error", "cl-not-found");
  tooltip.style.pointerEvents = "none";
  currentToken = null;
  if (abortCtrl) { abortCtrl.abort(); abortCtrl = null; }
}

function esc(s) {
  return String(s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
