// ==UserScript==
// @name         Cloudflare Detector Pro
// @namespace    https://github.com/coderyjf/CloudflareDetector
// @version      1.0
// @description  Cloudflare 节点检测（IP / Colo / 状态 / 复制）
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
  const POS_KEY = "cf_panel_pos_v1";

  /* =========================
           🌍 COLO MAP
  ========================= */
  const coloMap = {
    // Asia
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

    // China edge (Cloudflare limited but still seen in trace)
    CAN: "广州",
    SZX: "深圳",
    SHA: "上海",
    BJS: "北京",
    CKG: "重庆",

    // US
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

    // EU
    FRA: "法兰克福",
    LHR: "伦敦",
    AMS: "阿姆斯特丹",
    CDG: "巴黎",
    MAD: "马德里",
    ZRH: "苏黎世",
    MIL: "米兰",
    CPH: "哥本哈根",

    // Others
    SYD: "悉尼",
    MEL: "墨尔本",
    AKL: "奥克兰",
    GRU: "圣保罗",
    JNB: "约翰内斯堡",
  };

  /* =========================
           🎨 UI STYLE
  ========================= */
  GM_addStyle(`
    #cfpp{
    position:fixed;left:18px;bottom:130px;
    width:52px;height:52px;
    border-radius:50%;
    background:linear-gradient(135deg,#ff9a3c,#f38020);
    display:flex;align-items:center;justify-content:center;
    z-index:999999;
    cursor:pointer;
    box-shadow:0 8px 22px rgba(0,0,0,.28);
    transition:transform .2s ease;
    animation:cfpop .45s ease;
    }
    #cfpp:hover{transform:scale(1.08)}
    #cfpp svg{width:22px;height:22px;fill:#fff}

    #cfpanel{
    position:fixed;
    left:76px;
    bottom:128px;
    padding:12px 14px;
    border-radius:12px;
    font-size:13px;
    line-height:1.6;
    display:none;
    min-width:220px;
    background:rgba(255,255,255,.95);
    backdrop-filter:blur(12px);
    box-shadow:0 10px 30px rgba(0,0,0,.25);
    z-index:999998;
    font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas;
    cursor:move;
    }

    #cfpanel.show{display:block}

    .cf-title{
    font-weight:600;
    margin-bottom:8px;
    color:#f38020;
    display:flex;
    align-items:center;
    gap:6px;
    }

    .cf-ok{color:#18a058;font-weight:600}
    .cf-no{color:#ef4444;font-weight:600}
    .cf-warn{color:#f59e0b;font-weight:600}

    .cf-ip{
    cursor:pointer;
    padding:2px 6px;
    border-radius:6px;
    background:rgba(0,0,0,.06);
    }

    @keyframes cfpop{
    0%{transform:scale(.5);opacity:0}
    100%{transform:scale(1);opacity:1}
    }
  `);

  /* =========================
           🧩 HELPERS
  ========================= */
  function el(tag) {
    return document.createElement(tag);
  }

  function cacheGet() {
    try {
      let d = sessionStorage.getItem(CACHE_KEY);
      if (!d) return null;
      d = JSON.parse(d);
      if (Date.now() - d.t > CACHE_TTL) return null;
      return d.v;
    } catch {
      return null;
    }
  }

  function cacheSet(v) {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), v }));
  }

  function fetchTrace() {
    return new Promise((res) => {
      GM_xmlhttpRequest({
        method: "GET",
        url: location.origin + "/cdn-cgi/trace",
        onload: (r) => res(r.responseText || ""),
        onerror: () => res(""),
      });
    });
  }

  /* =========================
       🔍 DETECT ENGINE
  ========================= */
  async function detect() {
    let cached = cacheGet();
    if (cached) return cached;

    let data = { ip: "未知", colo: "未知", cf: false, trace: false };

    /* --- header detect --- */
    try {
      let r = await fetch(location.href, { method: "HEAD", cache: "no-store" });
      let server = r.headers.get("server") || "";
      let cfRay = r.headers.get("cf-ray") || "";
      if (server.toLowerCase().includes("cloudflare") || cfRay) data.cf = true;
    } catch {}

    /* --- trace detect --- */
    try {
      let text = await fetchTrace();
      if (text.includes("colo=")) {
        data.trace = true;
        let co = (text.match(/colo=([A-Z]+)/) || [])[1];
        data.colo = coloMap[co] ? `${coloMap[co]} (${co})` : co;
        let ip = (text.match(/ip=([^\n]+)/) || [])[1];
        if (ip) data.ip = ip;
      }
    } catch {}

    cacheSet(data);
    return data;
  }

  /* =========================
         🧠 STATUS LOGIC
  ========================= */
  function getStatus(d) {
    if (!d.cf) return { text: "无 CF", dot: "🔴", color: "cf-no" };
    if (d.cf && d.trace) return { text: "CF 正常", dot: "🟢", color: "cf-ok" };
    return { text: "CF 不确定", dot: "🟡", color: "cf-warn" };
  }

  /* =========================
         🪟 DRAG SYSTEM
  ========================= */
  function enableDrag(panel) {
    let pos = JSON.parse(localStorage.getItem(POS_KEY) || "null");

    if (pos) {
      panel.style.left = pos.x + "px";
      panel.style.top = pos.y + "px";
      panel.style.bottom = "auto";
      panel.style.position = "fixed";
    }

    let dragging = false,
      ox = 0,
      oy = 0;

    panel.addEventListener("mousedown", (e) => {
      dragging = true;
      ox = e.clientX - panel.offsetLeft;
      oy = e.clientY - panel.offsetTop;
    });

    document.addEventListener("mousemove", (e) => {
      if (!dragging) return;

      let x = e.clientX - ox;
      let y = e.clientY - oy;

      panel.style.left = x + "px";
      panel.style.top = y + "px";
      panel.style.bottom = "auto";

      localStorage.setItem(POS_KEY, JSON.stringify({ x, y }));
    });

    document.addEventListener("mouseup", () => (dragging = false));
  }

  /* =========================
           🚀 INIT
  ========================= */
  function init() {
    let icon = el("div");
    icon.id = "cfpp";
    icon.innerHTML = `<svg viewBox="0 0 24 24"><path d="M17 10a5 5 0 0 0-10 1 4 4 0 0 0 0 8h10a3 3 0 0 0 0-6z"/></svg>`;

    let panel = el("div");
    panel.id = "cfpanel";

    document.body.appendChild(icon);
    document.body.appendChild(panel);

    icon.style.display = "flex";

    enableDrag(panel);

    icon.onclick = async () => {
      panel.classList.toggle("show");

      panel.innerHTML = "检测中...";

      let d = await detect();
      let st = getStatus(d);

      /* 只在 CF 时显示信息 */
      let info = "";

      if (d.cf) {
        info = d.trace
          ? `节点： ${d.colo}<br>IP： <span class="cf-ip" id="ip">${d.ip}</span>`
          : `Trace 被禁用`;
      }

      panel.innerHTML = `
        <div class="cf-title">${st.dot} Cloudflare Detector</div>
        <div>状态： <span class="${st.color}">${st.text}</span></div>
        ${info}
      `;

      if (d.cf && d.trace) {
        let ip = document.getElementById("ip");
        ip.onclick = () => {
          navigator.clipboard.writeText(d.ip);
          ip.innerText = "已复制";
          setTimeout(() => (ip.innerText = d.ip), 1000);
        };
      }
    };
  }

  init();
})();
