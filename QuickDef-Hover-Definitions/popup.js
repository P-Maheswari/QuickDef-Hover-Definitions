const $ = id => document.getElementById(id);

(async () => {
  const data = await chrome.storage.local.get(["groqKey", "groqModel", "clEnabled"]);
  const key     = data.groqKey  || "";
  const enabled = data.clEnabled !== false;

  $("groqKey").value        = key;
  $("enableToggle").checked = enabled;
  updateStatus(key, enabled);

  $("eyeBtn").addEventListener("click", () => {
    const inp = $("groqKey");
    inp.type = inp.type === "password" ? "text" : "password";
  });

  $("saveBtn").addEventListener("click", async () => {
    const newKey     = $("groqKey").value.trim();
    const newEnabled = $("enableToggle").checked;
    const model      = data.groqModel || "llama-3.1-8b-instant";

    await chrome.storage.local.set({ groqKey: newKey, clEnabled: newEnabled, groqModel: model });
    updateStatus(newKey, newEnabled);

    // Notify active tab's content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: "CL_SETTINGS_UPDATED",
        groqKey: newKey, groqModel: model, enabled: newEnabled
      }).catch(() => {});
    }

    $("saveBtn").textContent = "✓ Saved";
    setTimeout(() => { $("saveBtn").textContent = "Save"; }, 1800);
  });

  $("enableToggle").addEventListener("change", () => {
    $("toggleSub").textContent = $("enableToggle").checked ? "Active" : "Disabled";
  });

  $("optionsBtn").addEventListener("click",  () => chrome.runtime.openOptionsPage());
  $("optionsLink").addEventListener("click", e => { e.preventDefault(); chrome.runtime.openOptionsPage(); });
})();

function updateStatus(key, enabled) {
  const dot  = $("statusDot");
  const text = $("statusText");
  const t3   = $("tier3Badge");

  if (!enabled) {
    dot.className = "status-dot";
    text.textContent = "Extension disabled";
    t3.textContent = "Off"; t3.className = "tier-badge inactive";
    return;
  }

  if (key && key.length > 10) {
    dot.className = "status-dot ok";
    text.textContent = "All 3 tiers active";
    t3.textContent = "Active"; t3.className = "tier-badge active";
  } else {
    dot.className = "status-dot warn";
    text.textContent = "Tiers 1 & 2 active · No AI fallback";
    t3.textContent = "No key"; t3.className = "tier-badge inactive";
  }
}
