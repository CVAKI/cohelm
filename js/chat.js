// ============================================
// Co-Helm — Chat
// Renders messages and talks to the Cloudflare
// Worker proxy defined in config.js
// ============================================

const CoHelmChat = (() => {
  const AI_ICON = `
    <svg class="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width:100%;height:100%;">
      <circle cx="12" cy="12" r="7" stroke-width="1.75"/>
      <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
      <path stroke-width="1.75" stroke-linecap="round" d="M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2.2 2.2 M16.8 16.8L19 19 M5 19l2.2-2.2 M16.8 7.2L19 5"/>
    </svg>`;

  const USER_ICON = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width:1.25rem;height:1.25rem;">
      <circle cx="12" cy="5" r="2.5" stroke-width="1.75"/>
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 7.5V20m0 0a8 8 0 01-8-8m8 8a8 8 0 008-8M9 11h6"/>
    </svg>`;

  let history = []; // [[userText, botText], ...]
  let container = null;
  let inputEl = null;
  let sendBtn = null;
  let statusEl = null;

  function timeNow() {
    const now = new Date();
    return `${String(now.getUTCHours()).padStart(2, "0")}:${String(
        now.getUTCMinutes()
    ).padStart(2, "0")} UTC`;
  }

  function renderUserMessage(text) {
    const row = document.createElement("div");
    row.className = "msg-row user bubble-in";
    row.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:flex-end;">
        <div class="msg-meta">
          <span>${timeNow()}</span>
          <span class="name">CAPTAIN</span>
        </div>
        <div class="bubble user"></div>
      </div>
      <div class="avatar user">${USER_ICON}</div>
    `;
    row.querySelector(".bubble").textContent = text;
    container.appendChild(row);
    container.scrollTop = container.scrollHeight;
  }

  function renderAIMessage(text) {
    const row = document.createElement("div");
    row.className = "msg-row bubble-in";
    row.innerHTML = `
      <div class="avatar ai">${AI_ICON}</div>
      <div style="flex:1;min-width:0;">
        <div class="msg-meta">
          <span class="name">CO-HELM</span>
          <span class="tag">NAV-AI</span>
          <span>${timeNow()}</span>
        </div>
        <div class="bubble ai"></div>
      </div>
    `;
    row.querySelector(".bubble").textContent = text;
    container.appendChild(row);
    container.scrollTop = container.scrollHeight;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
  }

  function renderSearchMessage(data) {
    const { searchType, query, reply, results = [] } = data;

    const row = document.createElement("div");
    row.className = "msg-row bubble-in";

    let resultsHtml = "";

    if (!results.length) {
      resultsHtml = `<div class="search-empty">No results surfaced for "${escapeHtml(query)}".</div>`;
    } else if (searchType === "image") {
      resultsHtml = `<div class="search-grid search-grid-image">${results
          .map(
              (r) => `
        <a class="search-image-card" href="${escapeHtml(r.sourceUrl)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(r.title)}">
          <img src="${escapeHtml(r.thumbnail)}" alt="${escapeHtml(r.title)}" loading="lazy">
        </a>`
          )
          .join("")}</div>`;
    } else if (searchType === "video") {
      resultsHtml = `<div class="search-grid search-grid-video">${results
          .map(
              (r) => `
        <a class="search-video-card" href="${escapeHtml(r.sourceUrl)}" target="_blank" rel="noopener noreferrer">
          <div class="search-video-thumb">
            <img src="${escapeHtml(r.thumbnail)}" alt="${escapeHtml(r.title)}" loading="lazy">
            ${r.duration ? `<span class="search-video-duration">${escapeHtml(r.duration)}</span>` : ""}
          </div>
          <div class="search-video-meta">
            <p class="search-video-title">${escapeHtml(r.title)}</p>
            <p class="search-video-publisher">${escapeHtml(r.publisher)}</p>
          </div>
        </a>`
          )
          .join("")}</div>`;
    } else {
      // web + file both render as link cards
      resultsHtml = `<div class="search-link-list">${results
          .map(
              (r) => `
        <a class="search-link-card" href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer">
          <p class="search-link-title">${escapeHtml(r.title)}</p>
          <p class="search-link-url">${escapeHtml(r.url)}</p>
          ${r.snippet ? `<p class="search-link-snippet">${escapeHtml(r.snippet)}</p>` : ""}
        </a>`
          )
          .join("")}</div>`;
    }

    row.innerHTML = `
      <div class="avatar ai">${AI_ICON}</div>
      <div style="flex:1;min-width:0;">
        <div class="msg-meta">
          <span class="name">CO-HELM</span>
          <span class="tag">${escapeHtml((searchType || "web").toUpperCase())} SCAN</span>
          <span>${timeNow()}</span>
        </div>
        <div class="bubble ai">${escapeHtml(reply)}</div>
        ${resultsHtml}
      </div>
    `;
    container.appendChild(row);
    container.scrollTop = container.scrollHeight;
  }

  function renderErrorMessage(text) {
    const row = document.createElement("div");
    row.className = "msg-row bubble-in";
    row.innerHTML = `
      <div class="avatar ai" style="border-color: rgba(248,113,113,0.5); color:#f87171;">${AI_ICON}</div>
      <div style="flex:1;min-width:0;">
        <div class="msg-meta">
          <span class="name">CO-HELM</span>
          <span class="tag" style="color:#f87171;background:rgba(248,113,113,0.1);border-color:rgba(248,113,113,0.3);">ERROR</span>
        </div>
        <div class="bubble ai" style="border-color: rgba(248,113,113,0.4);"></div>
      </div>
    `;
    row.querySelector(".bubble").textContent = text;
    container.appendChild(row);
    container.scrollTop = container.scrollHeight;
  }

  function setStatus(text, colorClass) {
    if (!statusEl) return;
    const label = statusEl.querySelector("span:last-child");
    if (label) label.textContent = text;
  }

  async function send(message) {
    if (!message.trim()) return;

    renderUserMessage(message);
    inputEl.value = "";
    sendBtn.disabled = true;
    setStatus("SYNCING...");

    const thinking = CoHelmThinking.start(container);

    try {
      const res = await fetch(CO_HELM_CONFIG.WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      thinking.stop();
      thinking.element.classList.add("think-block-out");
      setTimeout(() => thinking.element.remove(), 260);

      if (data.kind === "search") {
        renderSearchMessage(data);
        // Keep the model's context lightweight: store the commentary, not the raw result payload.
        history.push([message, data.reply]);
      } else {
        renderAIMessage(data.reply);
        history.push([message, data.reply]);
      }
      setStatus("ONLINE // SYNCED");
    } catch (err) {
      console.error(err);
      thinking.stop();
      thinking.element.remove();
      renderErrorMessage("Transmission failed: " + err.message);
      setStatus("LINK ERROR");
    } finally {
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  function reset() {
    history = [];
    container.innerHTML = "";
    renderAIMessage(
        "Greetings, Captain. All bridge systems are synchronized and standing by. Where shall we set our heading today?"
    );
  }

  function init() {
    container = document.getElementById("messagesContainer");
    inputEl = document.getElementById("commandInput");
    sendBtn = document.getElementById("sendBtn");
    statusEl = document.getElementById("connectionStatus");

    reset();

    sendBtn.addEventListener("click", () => send(inputEl.value));

    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendBtn.classList.add("pressed");
        setTimeout(() => sendBtn.classList.remove("pressed"), 150);
        send(inputEl.value);
      }
    });
  }

  return { init, reset, send };
})();