# ☁ Cloudflare Detector

一个轻量级 DevTools 风格 Cloudflare 节点检测 Userscript（支持 IP / Colo / 状态灯 / 面板拖动记忆）

---

## 🚀 功能特性

### 🔍 Cloudflare 检测
- 自动检测网站是否使用 Cloudflare
- 支持 Header 检测（cf-ray / server）
- 支持 /cdn-cgi/trace 获取详细信息

---

### 🌍 节点信息（Colo）
自动解析 Cloudflare Edge 节点并映射为中文：

- SIN → 新加坡
- HKG → 香港
- SFO → 旧金山
- FRA → 法兰克福
- NRT → 东京

---

### 🧠 DevTools 状态系统

状态灯：

- 🟢 CF 正常（Header + trace 成功）
- 🟡 CF 不确定（仅 Header 命中）
- 🔴 无 Cloudflare

---

### 🪟 DevTools 面板体验

- 可拖动面板（类似 Chrome DevTools Dock）
- 自动记忆位置（localStorage）
- 半透明玻璃风格 UI
- 等宽字体（模拟开发者工具）

---

### 📦 IP & 节点信息

点击 IP 可复制。

---

## 🧩 安装方法

### Tampermonkey（推荐）
1. 安装 Tampermonkey
2. 新建脚本
3. 粘贴 userscript
4. 保存启用

---

### GreasyFork
发布后可通过以下方式安装：

https://greasyfork.org/

---

## ⚙️ 工作原理

### 1️⃣ Header 检测
用于快速判断：

cf-ray
server: cloudflare

---

### 2️⃣ Trace 检测

请求：

/cdn-cgi/trace

返回示例：

ip=1.2.3.4
colo=SIN
tls=TLSv1.3
http=h3

---

## 🧠 状态逻辑

| 条件 | 状态 |
|------|------|
| 无 CF Header | 🔴 无 CF |
| 仅 Header 命中 | 🟡 CF 不确定 |
| Header + Trace 成功 | 🟢 CF 正常 |

---

## 🪟 UI 说明

### 📌 悬浮按钮
- 左下角浮动按钮
- Cloudflare 风格渐变
- 点击打开面板

---

### 📋 面板内容

- 状态灯（🟢🟡🔴）
- Cloudflare 状态
- Edge Node（Colo）
- Client IP（可复制）

---

### 🪄 拖动功能

- 鼠标拖动面板
- 自动保存位置
- 刷新不丢失
- 类似 DevTools Dock

---

## 💡 设计理念

用最少信息模拟 DevTools Network 面板体验。

---

## ⚡ 性能

- 无后台轮询
- sessionStorage 缓存 30s
- 按需请求 trace
- 低资源占用

---

## 📦 技术栈

- Vanilla JavaScript
- GM_xmlhttpRequest
- localStorage / sessionStorage
- DOM injection

---

## 🔐 隐私

- 不上传任何数据
- 不包含统计
- 仅调用 Cloudflare trace

---

## 🧪 使用场景

- CDN 调试
- Cloudflare 排查
- 网络分析
- 学习 Edge routing

---

## 🛠️ 未来计划

- RTT 延迟检测
- ASN / ISP 显示
- CDN 自动识别
- Dark mode 自动适配
- 面板吸附边缘
- Network 可视化增强

---

## 📜 License

MIT License

---

## 👨‍💻 Author

coderyjf  
GitHub: https://github.com/coderyjf/CloudflareDetector
