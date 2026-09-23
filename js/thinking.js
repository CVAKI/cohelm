// ============================================
// Co-Helm — Thinking State
// Builds and animates the "live navigation log"
// shown while waiting for the real AI response.
// ============================================

const CoHelmThinking = (() => {
  const LOG_POOL = [
    "> Establishing uplink to Co-Helm core...",
    "> Parsing query intent...",
    "> Cross-referencing knowledge base...",
    "> Drafting response...",
    "> Verifying output coherence...",
    "> Finalizing transmission...",
  ];

  function timestamp() {
    const now = new Date();
    return `${String(now.getUTCHours()).padStart(2, "0")}:${String(
      now.getUTCMinutes()
    ).padStart(2, "0")}:${String(now.getUTCSeconds()).padStart(2, "0")}.${Math.floor(
      now.getMilliseconds() / 100
    )}`;
  }

  function buildAvatar() {
    const el = document.createElement("div");
    el.className = "avatar ai think-avatar";
    el.innerHTML = `
      <div class="sweep animate-radar-sweep">
        <div class="sweep-fill"></div>
      </div>
      <div class="reticle"></div>
    `;
    return el;
  }

  function buildBlock() {
    const row = document.createElement("div");
    row.className = "msg-row bubble-in";
    row.id = "aiThinkingBlock";

    const avatar = buildAvatar();

    const body = document.createElement("div");
    body.style.flex = "1";
    body.style.minWidth = "0";
    body.innerHTML = `
      <div class="msg-meta">
        <span class="name">CO-HELM</span>
        <span class="tag" style="color: var(--brass-gold); background: rgba(201,161,90,0.1); border-color: rgba(201,161,90,0.3);">
          CHARTING RESPONSE...
        </span>
      </div>
      <div class="log-box">
        <div class="log-header">
          <span><span style="color: var(--cyan-glow); font-weight: 600;">&gt; LIVE FEED</span> // REASONING PIPELINE</span>
          <span style="color: var(--brass-gold); opacity: 0.9;">STREAM ACTIVE</span>
        </div>
        <div class="log-stream" id="logStreamContainer"></div>
      </div>
    `;

    row.appendChild(avatar);
    row.appendChild(body);
    return row;
  }

  function start(container) {
    const block = buildBlock();
    container.appendChild(block);
    container.scrollTop = container.scrollHeight;

    const logStream = block.querySelector("#logStreamContainer");
    let poolIndex = 0;
    let lineCount = 0;

    function addLine() {
      // demote the previous "current" line
      const prevCurrent = logStream.querySelector(".log-line.current");
      if (prevCurrent) {
        prevCurrent.classList.remove("current");
        const cursor = prevCurrent.querySelector(".log-cursor");
        if (cursor) cursor.remove();
      }

      const line = document.createElement("div");
      line.className = "log-line current feed-line-enter";
      line.innerHTML = `<span class="ts">${timestamp()}</span><span>${
        LOG_POOL[poolIndex % LOG_POOL.length]
      }</span><span class="log-cursor"></span>`;
      logStream.appendChild(line);
      poolIndex++;
      lineCount++;

      // keep at most 4 visible lines
      while (logStream.children.length > 4) {
        logStream.removeChild(logStream.firstElementChild);
      }
    }

    addLine();
    const interval = setInterval(addLine, 1400);

    return {
      element: block,
      stop() {
        clearInterval(interval);
      },
    };
  }

  return { start };
})();
