// ==UserScript==
// @name         Cloudflare Detector Pro
// @namespace    https://github.com/coderyjf/CloudflareDetector
// @version      1.2
// @description  Cloudflare 节点检测（IP / Colo / 状态 / 可拖拽 / 复制）
// @author       coderyjf
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      *
// @license      MIT
// @downloadURL  https://github.com/coderyjf/CloudflareDetector/releases/latest/download/cloudflare-detector.user.js
// @updateURL    https://github.com/coderyjf/CloudflareDetector/releases/latest/download/cloudflare-detector.user.js
// ==/UserScript==

(function () {
  "use strict";

  /* =========================
           ⚙️ CONFIG
  ========================= */

  const CACHE_KEY = "cf_lite_pp";
  const CACHE_TTL = 30000;

  const POS_KEY = "cf_detector_pos_v4";

  const ICON_SIZE = 52;
  const PANEL_GAP = 12;

  /* =========================
           🌍 COLO MAP
  ========================= */

  const coloMap = {
    SIN: "新加坡",
    HKG: "香港",
    TPE: "台北",
    NRT: "东京",
    HND: "东京",
    ICN: "首尔",
    BKK: "曼谷",
    KUL: "吉隆坡",
    MNL: "马尼拉",
    DEL: "新德里",
    BOM: "孟买",

    CAN: "广州",
    SZX: "深圳",
    SHA: "上海",
    BJS: "北京",
    CKG: "重庆",

    LAX: "洛杉矶",
    SFO: "旧金山",
    SEA: "西雅图",
    SJC: "圣何塞",
    ORD: "芝加哥",
    DFW: "达拉斯",
    IAD: "华盛顿",
    EWR: "纽瓦克",
    JFK: "纽约",
    MIA: "迈阿密",

    FRA: "法兰克福",
    LHR: "伦敦",
    AMS: "阿姆斯特丹",
    CDG: "巴黎",
    MAD: "马德里",
    ZRH: "苏黎世",
    MIL: "米兰",
    CPH: "哥本哈根",

    SYD: "悉尼",
    MEL: "墨尔本",
    AKL: "奥克兰",
    GRU: "圣保罗",
    JNB: "约翰内斯堡",
  };

  /* =========================
           🎨 STYLE
  ========================= */

  GM_addStyle(`
    #cfpp{
      position:fixed;
      left:18px;
      bottom:130px;

      width:${ICON_SIZE}px;
      height:${ICON_SIZE}px;

      border-radius:50%;

      background:
        linear-gradient(
          135deg,
          #ff9a3c,
          #f38020
        );

      display:flex;
      align-items:center;
      justify-content:center;

      z-index:999999;

      cursor:grab;
      user-select:none;

      box-shadow:
        0 8px 22px rgba(0,0,0,.28);

      transition:
        transform .18s ease,
        box-shadow .18s ease,
        opacity .18s ease;

      animation:cfpop .42s ease;
    }

    #cfpp:hover{
      transform:scale(1.08);

      box-shadow:
        0 14px 30px rgba(0,0,0,.32);
    }

    #cfpp.dragging{
      cursor:grabbing;
      transition:none;
    }

    #cfpp svg{
      width:22px;
      height:22px;
      fill:#fff;
      pointer-events:none;
    }

    #cfpanel{
      position:fixed;

      display:none;

      min-width:210px;
      max-width:min(340px,calc(100vw - 24px));

      padding:14px 15px;

      border-radius:16px;

      background:
        rgba(255,255,255,.82);

      backdrop-filter:blur(18px);
      -webkit-backdrop-filter:blur(18px);

      border:
        1px solid rgba(255,255,255,.45);

      box-shadow:
        0 12px 38px rgba(0,0,0,.22);

      font-size:13px;
      line-height:1.7;

      font-family:
        Inter,
        ui-monospace,
        SFMono-Regular,
        Menlo,
        Monaco,
        Consolas;

      color:#111827;

      z-index:999998;

      user-select:none;

      overflow-wrap:break-word;
      word-break:break-word;

      box-sizing:border-box;

      opacity:0;
      transform:translateY(4px) scale(.98);

      transition:
        opacity .18s ease,
        transform .18s ease;
    }

    #cfpanel.show{
      display:block;
      opacity:1;
      transform:translateY(0) scale(1);
    }

    .cf-title{
      display:flex;
      align-items:center;
      gap:7px;

      margin-bottom:10px;

      color:#f38020;

      font-weight:700;
      font-size:14px;

      white-space:nowrap;
    }

    .cf-row{
      display:flex;
      align-items:center;
      justify-content:center;
      gap:4px;

      margin:5px 0;

      flex-wrap:wrap;

      text-align:center;
    }

    .cf-ok{
      color:#18a058;
      font-weight:700;
    }

    .cf-no{
      color:#ef4444;
      font-weight:700;
    }

    .cf-warn{
      color:#f59e0b;
      font-weight:700;
    }

    .cf-ip{
      cursor:pointer;

      padding:4px 9px;

      border-radius:9px;

      background:
        rgba(0,0,0,.06);

      transition:
        background .16s ease,
        transform .16s ease;

      display:inline-block;
    }

    .cf-ip:hover{
      background:
        rgba(0,0,0,.11);

      transform:
        translateY(-1px);
    }

    .cf-copy-ok{
      color:#18a058;
      font-weight:700;
    }

    .cf-loading{
      display:inline-flex;
      align-items:center;
      gap:8px;
    }

    .cf-loading::after{
      content:"";

      width:12px;
      height:12px;

      border-radius:50%;

      border:
        2px solid rgba(243,128,32,.22);

      border-top-color:#f38020;

      animation:
        cfspin .75s linear infinite;
    }

    @keyframes cfspin{
      to{
        transform:rotate(360deg);
      }
    }

    @keyframes cfpop{
      0%{
        transform:scale(.5);
        opacity:0;
      }

      100%{
        transform:scale(1);
        opacity:1;
      }
    }
  `);

  /* =========================
            HELPERS
  ========================= */

  function el(tag) {
    return document.createElement(tag);
  }

  function cacheGet() {
    try {
      let d = sessionStorage.getItem(CACHE_KEY);

      if (!d) return null;

      d = JSON.parse(d);

      if (Date.now() - d.t > CACHE_TTL) {
        return null;
      }

      return d.v;
    } catch {
      return null;
    }
  }

  function cacheSet(v) {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        t: Date.now(),
        v,
      }),
    );
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  function fetchTrace() {
    return new Promise((resolve) => {
      GM_xmlhttpRequest({
        method: "GET",
        url: location.origin + "/cdn-cgi/trace",
        timeout: 5000,

        onload: (r) => resolve(r.responseText || ""),
        ontimeout: () => resolve(""),
        onerror: () => resolve(""),
      });
    });
  }

  /* =========================
             DETECT
  ========================= */

  async function detect() {
    const cached = cacheGet();

    if (cached) return cached;

    const data = {
      ip: "未知",
      colo: "未知",
      cf: false,
      trace: false,
    };

    try {
      const r = await fetch(location.href, {
        method: "HEAD",
        cache: "no-store",
      });

      const server = r.headers.get("server") || "";
      const cfRay = r.headers.get("cf-ray") || "";

      if (server.toLowerCase().includes("cloudflare") || cfRay) {
        data.cf = true;
      }
    } catch {}

    try {
      const text = await fetchTrace();

      if (text.includes("colo=")) {
        data.trace = true;

        const co = (text.match(/colo=([A-Z]+)/) || [])[1];

        data.colo = coloMap[co] ? `${coloMap[co]} (${co})` : co || "未知";

        const ip = (text.match(/ip=([^\n]+)/) || [])[1];

        if (ip) {
          data.ip = ip;
        }
      }
    } catch {}

    cacheSet(data);

    return data;
  }

  /* =========================
             STATUS
  ========================= */

  function getStatus(d) {
    if (!d.cf) {
      return {
        text: "无 Cloudflare",
        dot: "🔴",
        color: "cf-no",
      };
    }

    if (d.cf && d.trace) {
      return {
        text: "Cloudflare 正常",
        dot: "🟢",
        color: "cf-ok",
      };
    }

    return {
      text: "Cloudflare 已启用",
      dot: "🟡",
      color: "cf-warn",
    };
  }

  /* =========================
          PANEL POSITION
  ========================= */

  function updatePanelPosition(icon, panel) {
    requestAnimationFrame(() => {
      const iconRect = icon.getBoundingClientRect();

      const panelRect = panel.getBoundingClientRect();

      const centerX = iconRect.left + iconRect.width / 2;

      const centerY = iconRect.top + iconRect.height / 2;

      const winW = window.innerWidth;
      const winH = window.innerHeight;

      const isLeft = centerX < winW / 2;
      const isTop = centerY < winH / 2;

      let panelX;
      let panelY;

      if (isLeft) {
        panelX = iconRect.left + ICON_SIZE + PANEL_GAP;
      } else {
        panelX = iconRect.left - panelRect.width - PANEL_GAP;
      }

      if (isTop) {
        panelY = iconRect.top;
      } else {
        panelY = iconRect.top + ICON_SIZE - panelRect.height;
      }

      panelX = Math.max(8, Math.min(panelX, winW - panelRect.width - 8));

      panelY = Math.max(8, Math.min(panelY, winH - panelRect.height - 8));

      panel.style.left = panelX + "px";
      panel.style.top = panelY + "px";
      panel.style.bottom = "auto";
    });
  }

  /* =========================
             DRAG
  ========================= */

  function enableDrag(panel, icon) {
    let saved = null;

    try {
      saved = JSON.parse(localStorage.getItem(POS_KEY) || "null");
    } catch {}

    let currentX = 18;
    let currentY = window.innerHeight - 182;

    if (saved) {
      currentX = saved.x;
      currentY = saved.y;
    }

    function updateIconPosition(x, y) {
      const maxX = window.innerWidth - ICON_SIZE;

      const maxY = window.innerHeight - ICON_SIZE;

      x = Math.max(0, Math.min(x, maxX));
      y = Math.max(0, Math.min(y, maxY));

      currentX = x;
      currentY = y;

      icon.style.left = x + "px";
      icon.style.top = y + "px";
      icon.style.bottom = "auto";

      updatePanelPosition(icon, panel);

      localStorage.setItem(POS_KEY, JSON.stringify({ x, y }));
    }

    updateIconPosition(currentX, currentY);

    let dragging = false;
    let moved = false;

    let offsetX = 0;
    let offsetY = 0;

    function startDrag(e) {
      dragging = true;
      moved = false;

      icon.classList.add("dragging");

      offsetX = e.clientX - currentX;
      offsetY = e.clientY - currentY;

      e.preventDefault();
    }

    icon.addEventListener("mousedown", startDrag);

    document.addEventListener("mousemove", (e) => {
      if (!dragging) return;

      moved = true;

      updateIconPosition(e.clientX - offsetX, e.clientY - offsetY);
    });

    document.addEventListener("mouseup", () => {
      dragging = false;

      icon.classList.remove("dragging");
    });

    window.addEventListener("resize", () => {
      updateIconPosition(currentX, currentY);
    });

    return () => moved;
  }

  /* =========================
              INIT
  ========================= */

  function init() {
    const icon = el("div");
    icon.id = "cfpp";

    icon.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M17 10a5 5 0 0 0-10 1 4 4 0 0 0 0 8h10a3 3 0 0 0 0-6z"/>
      </svg>
    `;

    const panel = el("div");
    panel.id = "cfpanel";

    document.body.appendChild(icon);
    document.body.appendChild(panel);

    const hasMoved = enableDrag(panel, icon);

    let opened = false;
    let loading = false;

    icon.addEventListener("click", async () => {
      if (hasMoved()) return;

      if (loading) return;

      opened = !opened;

      if (!opened) {
        panel.classList.remove("show");

        setTimeout(() => {
          if (!opened) {
            panel.style.display = "none";
          }
        }, 180);

        return;
      }

      panel.style.display = "block";

      requestAnimationFrame(() => {
        panel.classList.add("show");
      });

      panel.innerHTML = `
          <div class="cf-title">
            ⏳ Cloudflare Detector
          </div>

          <div class="cf-row">
            <span class="cf-loading cf-warn">
              正在检测节点
            </span>
          </div>
        `;

      updatePanelPosition(icon, panel);

      loading = true;

      const d = await detect();

      loading = false;

      const st = getStatus(d);

      let info = "";

      if (d.cf) {
        if (d.trace) {
          info = `
              <div class="cf-row">
                节点： ${d.colo}
              </div>

              <div class="cf-row">
                IP：
                <span
                  class="cf-ip"
                  id="cf-copy-ip"
                >
                  ${d.ip}
                </span>
              </div>
            `;
        } else {
          info = `
              <div class="cf-row">
                Trace 被禁用
              </div>
            `;
        }
      }

      panel.innerHTML = `
          <div class="cf-title">
            ${st.dot} Cloudflare Detector
          </div>

          <div class="cf-row">
            状态：
            <span class="${st.color}">
              ${st.text}
            </span>
          </div>

          ${info}
        `;

      updatePanelPosition(icon, panel);

      if (d.cf && d.trace) {
        const ipEl = document.getElementById("cf-copy-ip");

        ipEl?.addEventListener("click", async () => {
          const ok = await copy(d.ip);

          if (!ok) return;

          const old = ipEl.innerText;

          ipEl.innerHTML = '<span class="cf-copy-ok">已复制 ✓</span>';

          setTimeout(() => {
            ipEl.innerText = old;
          }, 1200);
        });
      }
    });
  }

  init();
})();
