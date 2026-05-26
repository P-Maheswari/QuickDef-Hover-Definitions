const $ = id => document.getElementById(id);

const KEYS = [
  "groqKey","groqModel","hoverDelay","cacheEnabled",
  "showLang","llmFallback","siteGithub","siteGitlab","clEnabled"
];

const DEFAULTS = {
  groqModel: "llama-3.1-8b-instant", hoverDelay: 600,
  cacheEnabled: true, showLang: true, llmFallback: true,
  siteGithub: true, siteGitlab: true, clEnabled: true
};

async function load() {
  const data = await chrome.storage.local.get(KEYS);
  if (data.groqKey)    $("groqKey").value    = data.groqKey;
  if (data.groqModel)  $("groqModel").value  = data.groqModel;
  if (data.hoverDelay) $("hoverDelay").value = data.hoverDelay;
  for (const k of ["cacheEnabled","showLang","llmFallback","siteGithub","siteGitlab"]) {
    $(k).checked = data[k] !== undefined ? data[k] : DEFAULTS[k];
  }
}

async function save() {
  const payload = {
    groqKey:      $("groqKey").value.trim(),
    groqModel:    $("groqModel").value,
    hoverDelay:   parseInt($("hoverDelay").value) || 600,
    cacheEnabled: $("cacheEnabled").checked,
    showLang:     $("showLang").checked,
    llmFallback:  $("llmFallback").checked,
    siteGithub:   $("siteGithub").checked,
    siteGitlab:   $("siteGitlab").checked,
  };
  await chrome.storage.local.set(payload);
  const msg = $("savedMsg");
  msg.textContent = "✓ Saved!";
  msg.classList.add("show");
  setTimeout(() => msg.classList.remove("show"), 2000);
}

async function clearAll() {
  if (!confirm("Clear all CodeLens settings?")) return;
  await chrome.storage.local.clear();
  $("groqKey").value = "";
  $("groqModel").value = DEFAULTS.groqModel;
  $("hoverDelay").value = DEFAULTS.hoverDelay;
  for (const k of ["cacheEnabled","showLang","llmFallback","siteGithub","siteGitlab"]) {
    $(k).checked = DEFAULTS[k];
  }
  const msg = $("savedMsg");
  msg.textContent = "Cleared.";
  msg.classList.add("show");
  setTimeout(() => msg.classList.remove("show"), 1800);
}

document.addEventListener("DOMContentLoaded", () => {
  load();
  $("saveBtn").addEventListener("click", save);
  $("clearBtn").addEventListener("click", clearAll);
});
