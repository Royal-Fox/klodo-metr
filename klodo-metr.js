#!/usr/bin/env node
/*
 * Klódo-Metr - Kdo má většího klóda? 🍆
 * ------------------------------------------------------------
 * Vygeneruje interaktivní HTML přehled spotřeby tokenů v Claude Code
 * z tvých LOKÁLNÍCH transcriptů (~/.claude/projects) + soutěžní "Souboj klódů".
 *
 * SPUŠTĚNÍ:
 *   node klodo-metr.js
 *
 * Data NIKAM neodcházejí - vše běží jen na tvém počítači.
 * Nic se neinstaluje natrvalo (ccusage se stáhne přes npx do cache).
 * Vytvoří ~/klodo-metr.html a otevře ho v prohlížeči.
 *
 * Cena = ekvivalent v API cenách, ne reálná platba na předplatném.
 */
"use strict";
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

// -------- 1) data z ccusage --------
let raw;
try {
  process.stderr.write("Sbírám data přes ccusage (může chvíli trvat)...\n");
  raw = execSync("npx -y ccusage@latest session --json", {
    encoding: "utf8", maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "ignore"],
  });
} catch (e) {
  console.error("Nepodařilo se spustit ccusage. Potřebuješ Node + připojení k internetu.");
  process.exit(1);
}
let sessions;
try { sessions = JSON.parse(raw).session || []; }
catch (e) { console.error("ccusage nevrátil validní JSON."); process.exit(1); }
const byId = {}; for (const s of sessions) byId[s.period] = s;

// -------- 2) mapování session -> projekt přes filesystem --------
const root = path.join(os.homedir(), ".claude", "projects");
if (!fs.existsSync(root)) { console.error("Nenašel jsem ~/.claude/projects - používáš Claude Code na tomhle stroji?"); process.exit(1); }
const recs = [];
for (const dir of fs.readdirSync(root)) {
  const full = path.join(root, dir);
  let stat; try { stat = fs.statSync(full); } catch { continue; }
  if (!stat.isDirectory()) continue;
  const project = dir.replace(/^-Users-[^-]+-/, "").replace(/^-home-[^-]+-/, "").replace(/^-/, "");
  for (const f of fs.readdirSync(full)) {
    if (!f.endsWith(".jsonl")) continue;
    const s = byId[f.replace(/\.jsonl$/, "")];
    if (!s) continue;
    const date = (s.metadata && s.metadata.lastActivity) || "";
    for (const m of (s.modelBreakdowns || [])) {
      recs.push({
        p: project, m: m.modelName, s: s.period, d: date.slice(0, 10),
        c: +(+m.cost).toFixed(4),
        in: m.inputTokens, out: m.outputTokens, cc: m.cacheCreationTokens, cr: m.cacheReadTokens,
        t: m.inputTokens + m.outputTokens + m.cacheCreationTokens + m.cacheReadTokens,
      });
    }
  }
}
if (!recs.length) { console.error("Žádná data k zobrazení. Používáš Claude Code na tomhle stroji?"); process.exit(1); }

let generatedAt = "";
try { generatedAt = new Date().toLocaleString("cs-CZ"); } catch { generatedAt = ""; }

// -------- 3) HTML --------
const html = buildHtml(recs, generatedAt);

// -------- 4) zápis + otevření --------
const out = path.join(os.homedir(), "klodo-metr.html");
fs.writeFileSync(out, html);
console.error("Hotovo: " + out);
try {
  const cmd = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start \"\"" : "xdg-open";
  execSync(cmd + " \"" + out + "\"", { stdio: "ignore" });
} catch { /* uživatel si to otevře ručně */ }

// ============================================================
function buildHtml(recs, generatedAt) {
return `<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Klódo-Metr - Kdo má většího klóda?</title>
<meta name="description" content="Klódo-Metr - změř si, kolik jsi spálil v Claude Code. Vibecoding Akademie.">
<meta property="og:title" content="🍆 Klódo-Metr - Kdo má většího klóda?">
<meta property="og:description" content="Změř si, kolik jsi spálil v Claude Code. Běží lokálně. Vibecoding Akademie.">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍆</text></svg>">
<style>
:root{--bg:#0b0e14;--card:#141a24;--card2:#1a212d;--bd:rgba(255,255,255,.08);--tx:#e6eaf2;--mut:#8b93a7;--accent:#60a5fa}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--tx);font:14px/1.5 -apple-system,Segoe UI,Inter,Roboto,sans-serif}
.wrap{max-width:1180px;margin:0 auto;padding:28px 20px 80px}
h1{font-size:22px;margin:0 0 2px;letter-spacing:-.3px}
.sub{color:var(--mut);font-size:13px;margin-bottom:22px}
.foot{color:var(--mut);font-size:12px;text-align:center;margin-top:36px;border-top:1px solid var(--bd);padding-top:18px}
.viewtabs{display:flex;gap:10px}
.topbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:22px;flex-wrap:wrap}
.brandlogo{display:flex;align-items:center;gap:8px}
.bl-word{font-weight:700;color:#fff;font-size:18px;line-height:1}
.bl-pill{font-size:11px;color:#60a5fa;background:rgba(59,130,246,0.10);padding:3px 8px;border-radius:999px;line-height:1;font-weight:500}
.viewtabs button{flex:none;background:var(--card);border:1px solid var(--bd);color:var(--mut);padding:11px 20px;border-radius:12px;font-size:15px;cursor:pointer;font-weight:600}
.viewtabs button.on{background:linear-gradient(135deg,#3b82f6,#60a5fa);color:#0b0e14;border-color:transparent}
.bar{display:flex;flex-wrap:wrap;gap:14px;align-items:flex-end;background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:16px;margin-bottom:18px}
.field{display:flex;flex-direction:column;gap:5px}
.field label{font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--mut)}
select{background:var(--card2);color:var(--tx);border:1px solid var(--bd);border-radius:9px;padding:8px 10px;font-size:13px;min-width:150px;outline:none}
select:focus{border-color:var(--accent)}
.seg{display:flex;background:var(--card2);border:1px solid var(--bd);border-radius:9px;overflow:hidden}
.seg button{background:none;border:none;color:var(--mut);padding:8px 13px;font-size:13px;cursor:pointer}
.seg button.on{background:var(--accent);color:#0b0e14;font-weight:600}
.reset{margin-left:auto;background:var(--card2);border:1px solid var(--bd);color:var(--mut);border-radius:9px;padding:8px 13px;cursor:pointer;font-size:13px}
.reset:hover{color:var(--tx);border-color:var(--accent)}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px}
.kpi{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:16px}
.kpi .v{font-size:26px;font-weight:700;letter-spacing:-.5px}
.kpi .k{color:var(--mut);font-size:12px;margin-top:2px}
.panel{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:18px;margin-bottom:18px}
.panel h2{font-size:14px;margin:0 0 14px;font-weight:600}
.panel h2 span{color:var(--mut);font-weight:400}
table{width:100%;border-collapse:collapse;font-size:13px}
th,td{padding:9px 10px;text-align:right;border-bottom:1px solid var(--bd);white-space:nowrap}
th{color:var(--mut);font-weight:500;font-size:11px;text-transform:uppercase;letter-spacing:.4px;cursor:pointer;user-select:none}
th:first-child,td:first-child{text-align:left}
tbody tr{cursor:pointer}tbody tr:hover{background:var(--card2)}
.namecell{display:flex;align-items:center;gap:9px}
.dot{width:9px;height:9px;border-radius:50%;flex:none}
.sharebar{position:relative;height:6px;background:rgba(255,255,255,.06);border-radius:4px;width:120px;overflow:hidden}
.sharebar>i{position:absolute;left:0;top:0;bottom:0;background:var(--accent);border-radius:4px}
.chart{display:flex;align-items:flex-end;gap:10px;height:220px;padding-top:10px}
.col{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;cursor:pointer}
.stack{width:100%;max-width:64px;display:flex;flex-direction:column-reverse;flex:1;justify-content:flex-start;border-radius:6px 6px 0 0;overflow:hidden;background:rgba(255,255,255,.03)}
.seg2{width:100%}
.col .lbl{font-size:11px;color:var(--mut)}.col .val{font-size:11px;font-weight:600}
.col:hover .stack{outline:1px solid var(--accent)}
.legend{display:flex;flex-wrap:wrap;gap:14px;margin-top:14px;font-size:12px;color:var(--mut)}
.legend span{display:flex;align-items:center;gap:6px}
.muted{color:var(--mut)}.note{color:var(--mut);font-size:12px;margin-top:8px}
.hero{position:relative;overflow:hidden;background:radial-gradient(120% 140% at 15% 0%,#1e2a4a 0%,#141a24 55%);border:1px solid var(--bd);border-radius:20px;padding:30px;text-align:center;margin-bottom:18px}
.hero .eyebrow{font-size:13px;color:var(--mut);letter-spacing:1px;text-transform:uppercase}
.hero .big{font-size:74px;font-weight:800;line-height:1;letter-spacing:-2px;margin:10px 0 4px;background:linear-gradient(135deg,#a78bfa,#60a5fa 60%,#34d399);-webkit-background-clip:text;background-clip:text;color:transparent}
.hero .biglbl{font-size:14px;color:var(--mut);margin-bottom:18px}
.rankbadge{display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,.05);border:1px solid var(--bd);padding:9px 18px;border-radius:999px;font-size:19px;font-weight:700}
.rankbadge .em{font-size:26px}
.ranktag{color:var(--mut);font-size:13px;margin-top:9px;font-style:italic}
.meter{margin:22px auto 6px;max-width:620px}
.meterhead{display:flex;justify-content:space-between;font-size:12px;color:var(--mut);margin-bottom:6px}
.metertrack{height:16px;border-radius:999px;background:rgba(255,255,255,.06);overflow:hidden;border:1px solid var(--bd)}
.metertrack>i{display:block;height:100%;width:0;background:linear-gradient(90deg,#a78bfa,#60a5fa);border-radius:999px;transition:width 1.1s cubic-bezier(.2,.8,.2,1)}
.tonext{font-size:12px;color:var(--mut);margin-top:8px}
.flexgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:18px}
.stat{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:16px;text-align:center}
.stat .v{font-size:24px;font-weight:700}.stat .k{color:var(--mut);font-size:12px;margin-top:3px}
.ladder{display:flex;flex-direction:column;gap:8px}
.lrow{display:grid;grid-template-columns:34px 150px 150px 1fr;align-items:center;gap:12px;padding:10px 14px;border:1px solid var(--bd);border-radius:10px;background:var(--card2)}
.lrow.cur{border-color:var(--accent);background:linear-gradient(90deg,rgba(96,165,250,.18),rgba(167,139,250,.12));box-shadow:0 0 0 1px var(--accent) inset}
.lrow.done{opacity:.72}.lrow.todo{opacity:.5}
.lem{font-size:22px;text-align:center}.lname{font-weight:700}
.lreq{color:var(--mut);font-size:12px}.ltag{color:var(--mut);font-size:12px}
.lyou{margin-left:8px;font-size:11px;color:#0b0e14;background:var(--accent);padding:2px 8px;border-radius:999px;font-weight:700}
.ach{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.badge{background:var(--card2);border:1px solid var(--bd);border-radius:12px;padding:13px;display:flex;gap:11px;align-items:center}
.badge.locked{opacity:.38;filter:grayscale(1)}
.badge .be{font-size:26px;flex:none}.badge .bn{font-weight:700;font-size:13px}.badge .bd{color:var(--mut);font-size:11px}
.conv{display:flex;flex-wrap:wrap;gap:10px}
.conv .chip{background:var(--card2);border:1px solid var(--bd);border-radius:999px;padding:8px 14px;font-size:13px}
.conv .chip b{color:var(--accent)}
.flexbtn{background:linear-gradient(135deg,#3b82f6,#60a5fa);border:none;color:#0b0e14;font-weight:700;padding:12px 20px;border-radius:12px;font-size:14px;cursor:pointer}
.flexbtn:active{transform:translateY(1px)}
.flexbtn.ok{background:linear-gradient(135deg,#22c55e,#34d399)}
#confetti{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999}
.flexrow{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.podium{display:flex;flex-direction:column;gap:8px}
.prow{display:flex;align-items:center;gap:12px;background:var(--card2);border:1px solid var(--bd);border-radius:10px;padding:10px 14px}
.prow .medal{font-size:20px;width:26px;text-align:center}.prow .pname{flex:1;font-weight:600}
.prow .pbar{height:8px;border-radius:6px;background:linear-gradient(90deg,#a78bfa,#60a5fa)}
.prow .pval{color:var(--mut);font-size:12px;min-width:64px;text-align:right}
.disclaimer{color:var(--mut);font-size:12px;margin-top:6px;text-align:center}
.sharewrap{display:flex;justify-content:center}
.cardcanvas{width:100%;max-width:430px;border-radius:16px;border:1px solid var(--bd)}
@media(max-width:720px){.kpis,.flexgrid,.ach{grid-template-columns:repeat(2,1fr)}.hero .big{font-size:54px}.lrow{grid-template-columns:30px 1fr;row-gap:2px}.lreq,.ltag{grid-column:2}}
</style>
</head>
<body>
<canvas id="confetti"></canvas>
<div class="wrap">
  <div class="topbar">
    <div class="viewtabs"><button id="tabFlex" class="on">🍆 Souboj klódů</button><button id="tabDash">📊 Přehled</button></div>
    <div class="brandlogo"><span class="bl-word">Vibecoding</span><span class="bl-pill">Akademie</span></div>
  </div>

  <div id="viewDash" style="display:none">
    <div class="bar">
      <div class="field"><label>Od měsíce</label><select id="fFrom"></select></div>
      <div class="field"><label>Do měsíce</label><select id="fTo"></select></div>
      <div class="field"><label>Projekt</label><select id="fProj"></select></div>
      <div class="field"><label>Model</label><select id="fModel"></select></div>
      <div class="field"><label>Seskupit dle</label><div class="seg" id="groupSeg">
        <button data-g="p" class="on">Projekt</button><button data-g="m">Model</button><button data-g="month">Měsíc</button><button data-g="d">Den</button>
      </div></div>
      <button class="reset" id="reset">Reset filtrů</button>
    </div>
    <div class="kpis">
      <div class="kpi"><div class="v" id="kCost">-</div><div class="k">Cena (API ekvivalent)</div></div>
      <div class="kpi"><div class="v" id="kTok">-</div><div class="k">Tokeny celkem</div></div>
      <div class="kpi"><div class="v" id="kSess">-</div><div class="k">Sessions</div></div>
      <div class="kpi"><div class="v" id="kProj">-</div><div class="k">Projekty</div></div>
    </div>
    <div class="panel"><h2>Vývoj v čase <span id="chartSub"></span></h2><div class="chart" id="chart"></div><div class="legend" id="legend"></div><div class="note">Klik na sloupec = filtr na daný měsíc.</div></div>
    <div class="panel"><h2 id="tblTitle">Rozpad</h2>
      <table id="tbl"><thead><tr><th data-s="name">Název</th><th data-s="c">Cena</th><th data-s="t">Tokeny</th><th data-s="in">Input</th><th data-s="out">Output</th><th data-s="cache">Cache</th><th data-s="c">Podíl ceny</th></tr></thead><tbody id="tbody"></tbody></table>
      <div class="note" id="tblNote"></div>
    </div>
  </div>

  <div id="viewFlex">
    <div class="hero">
      <div class="eyebrow">🍆 Klódo-Metr</div>
      <div class="big" id="hBig">-</div>
      <div class="biglbl">tvoje oficiální délka klóda*</div>
      <div class="rankbadge"><span class="em" id="hEmoji">-</span><span id="hRank">-</span></div>
      <div class="ranktag" id="hTag">-</div>
      <div class="meter"><div class="meterhead"><span id="mCur">-</span><span id="mNext">-</span></div><div class="metertrack"><i id="mFill"></i></div><div class="tonext" id="mToNext">-</div></div>
    </div>
    <div class="panel sharepanel">
      <div class="flexrow" style="justify-content:center"><button class="flexbtn" id="copyCard">📸 Sdílet jako fotku (kartičku)</button></div>
      <div id="cardMsg" class="muted" style="text-align:center;margin-top:12px"></div>
      <canvas id="card" style="display:none"></canvas>
    </div>
    <div class="flexgrid">
      <div class="stat"><div class="v" id="sTok">-</div><div class="k">tokenů celkem (tvůj kalibr)</div></div>
      <div class="stat"><div class="v" id="sCost">-</div><div class="k">spáleno (API ekvivalent)</div></div>
      <div class="stat"><div class="v" id="sSess">-</div><div class="k">soubojů (sessions)</div></div>
      <div class="stat"><div class="v" id="sDays">-</div><div class="k">aktivních dní</div></div>
      <div class="stat"><div class="v" id="sBig">-</div><div class="k">největší jednorázovka</div></div>
      <div class="stat"><div class="v" id="sOpus">-</div><div class="k">podíl Opusu (čistá krev)</div></div>
    </div>
    <div class="panel"><h2>🪜 Žebříček levelů <span>(kam se cpát)</span></h2><div class="ladder" id="ladder"></div></div>
    <div class="panel"><h2>💬 Co to je v reálu</h2><div class="conv" id="conv"></div></div>
    <div class="panel"><h2>🏅 Odznaky cti</h2><div class="ach" id="ach"></div></div>
    <div class="panel"><h2>⚔️ Tvoje bojiště <span>(kde jsi spálil nejvíc)</span></h2><div class="podium" id="podium"></div></div>
    <div class="panel"><h2>📣 Naparuj se před komunitou</h2>
      <div class="flexrow"><button class="flexbtn" id="copyFlex">📋 Zkopírovat flex do schránky</button><span class="muted" id="copyMsg"></span></div>
      <div class="note" id="flexPreview" style="margin-top:12px"></div>
    </div>
    <div class="panel"><h2>♾️ Historie chatů navždy <span>(ať ti Claude Code nemaže přepisy)</span></h2>
      <div class="flexrow"><button class="flexbtn" id="copyKeepPrompt" title="Zkopíruje ti prompt - vlož ho do Claude Code a máš historii navždy">♾️ Nastavit neomezenou historii</button><span class="muted" id="keepMsg"></span></div>
      <div class="note" style="margin-top:12px">Zkopíruje ti prompt - vlož ho do Claude Code a máš historii navždy.</div>
    </div>
    <div class="disclaimer">* Délka klóda je 100% vědecky nepodložená hodnota (tokeny ÷ 100M). Slouží výhradně k mezikancelářskému měření klódů.</div>
  </div>
  <div class="foot">Zdroj: lokální transcripty (~/.claude/projects) přes ccusage. Cena = API ekvivalent, ne reálná platba na předplatném. Generováno ${generatedAt}.</div>
</div>

<script>
const DATA = ${JSON.stringify(recs)};
const MODEL_META={"claude-opus-4-8":{lbl:"opus-4.8",c:"#60a5fa"},"claude-opus-4-7":{lbl:"opus-4.7",c:"#818cf8"},"claude-fable-5":{lbl:"fable-5",c:"#a78bfa"},"claude-sonnet-5":{lbl:"sonnet-5",c:"#f472b6"},"claude-sonnet-4-6":{lbl:"sonnet-4.6",c:"#34d399"},"claude-haiku-4-5-20251001":{lbl:"haiku-4.5",c:"#fbbf24"}};
const mlbl=m=>(MODEL_META[m]||{lbl:m}).lbl, mcol=m=>(MODEL_META[m]||{c:"#94a3b8"}).c;
const months=[...new Set(DATA.map(r=>r.d.slice(0,7)).filter(Boolean))].sort();
const projects=[...new Set(DATA.map(r=>r.p))].sort();
const modelsAll=[...new Set(DATA.map(r=>r.m))];
const st={from:months[0],to:months[months.length-1],proj:"",model:"",group:"p",sortKey:"c",sortDir:-1};
function fmtTok(n){n=+n;return n>=1e9?(n/1e9).toFixed(2)+"B":n>=1e6?(n/1e6).toFixed(1)+"M":n>=1e3?(n/1e3).toFixed(1)+"k":""+n;}
function fmtCost(n){return "$"+(+n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});}
function fmtInt(n){return (+n).toLocaleString("cs-CZ");}
function animateNumber(el,to,fmt,dur){if(!el)return;dur=dur||850;const start=performance.now();function step(now){let p=Math.min(1,(now-start)/dur);p=1-Math.pow(1-p,3);el.textContent=fmt(to*p);if(p<1)requestAnimationFrame(step);}requestAnimationFrame(step);}
function fireConfetti(){const cv=document.getElementById("confetti");if(!cv)return;const dpr=Math.min(2,window.devicePixelRatio||1);cv.width=innerWidth*dpr;cv.height=innerHeight*dpr;const g=cv.getContext("2d");g.scale(dpr,dpr);const cols=["#60a5fa","#a78bfa","#34d399","#FFD700","#f472b6"];const parts=[];for(let i=0;i<150;i++){parts.push({x:innerWidth/2+(Math.random()-.5)*180,y:innerHeight*0.30,vx:(Math.random()-.5)*11,vy:Math.random()*-10-4,gr:0.30+Math.random()*0.12,s:5+Math.random()*7,rot:Math.random()*6.28,vr:(Math.random()-.5)*.45,c:cols[i%cols.length],life:1});}let t0=performance.now();function frame(now){const dt=Math.min(34,now-t0);t0=now;const k=dt/16;g.clearRect(0,0,innerWidth,innerHeight);let alive=false;for(const p of parts){p.vy+=p.gr*k;p.x+=p.vx*k;p.y+=p.vy*k;p.rot+=p.vr*k;p.life-=0.007*k;if(p.life>0&&p.y<innerHeight+30){alive=true;g.save();g.globalAlpha=Math.max(0,p.life);g.translate(p.x,p.y);g.rotate(p.rot);g.fillStyle=p.c;g.fillRect(-p.s/2,-p.s/2,p.s,p.s*0.62);g.restore();}}if(alive)requestAnimationFrame(frame);else g.clearRect(0,0,innerWidth,innerHeight);}requestAnimationFrame(frame);}

function filtered(){return DATA.filter(r=>{const mo=r.d.slice(0,7);if(mo<st.from||mo>st.to)return false;if(st.proj&&r.p!==st.proj)return false;if(st.model&&r.m!==st.model)return false;return true;});}
function initControls(){
  const opt=(v,t)=>\`<option value="\${v}">\${t}</option>\`;
  document.getElementById("fFrom").innerHTML=months.map(m=>opt(m,m)).join("");
  document.getElementById("fTo").innerHTML=months.map(m=>opt(m,m)).join("");
  document.getElementById("fProj").innerHTML=opt("","Všechny projekty")+projects.map(p=>opt(p,p)).join("");
  document.getElementById("fModel").innerHTML=opt("","Všechny modely")+modelsAll.map(m=>opt(m,mlbl(m))).join("");
  document.getElementById("fFrom").value=st.from;document.getElementById("fTo").value=st.to;
  document.getElementById("fFrom").onchange=e=>{st.from=e.target.value;if(st.from>st.to){st.to=st.from;document.getElementById("fTo").value=st.to;}renderDash();};
  document.getElementById("fTo").onchange=e=>{st.to=e.target.value;if(st.to<st.from){st.from=st.to;document.getElementById("fFrom").value=st.from;}renderDash();};
  document.getElementById("fProj").onchange=e=>{st.proj=e.target.value;renderDash();};
  document.getElementById("fModel").onchange=e=>{st.model=e.target.value;renderDash();};
  document.querySelectorAll("#groupSeg button").forEach(b=>b.onclick=()=>{st.group=b.dataset.g;document.querySelectorAll("#groupSeg button").forEach(x=>x.classList.toggle("on",x===b));renderDash();});
  document.getElementById("reset").onclick=()=>{st.from=months[0];st.to=months[months.length-1];st.proj="";st.model="";document.getElementById("fFrom").value=st.from;document.getElementById("fTo").value=st.to;document.getElementById("fProj").value="";document.getElementById("fModel").value="";renderDash();};
  document.querySelectorAll("#tbl th").forEach(th=>th.onclick=()=>{const k=th.dataset.s;if(st.sortKey===k)st.sortDir*=-1;else{st.sortKey=k;st.sortDir=-1;}renderDash();});
}
function renderDash(){
  const rows=filtered();let cost=0,tok=0;const sess=new Set(),prj=new Set();
  for(const r of rows){cost+=r.c;tok+=r.t;sess.add(r.s);prj.add(r.p);}
  document.getElementById("kCost").textContent=fmtCost(cost);document.getElementById("kTok").textContent=fmtTok(tok);
  document.getElementById("kSess").textContent=sess.size;document.getElementById("kProj").textContent=prj.size;
  renderChart(rows);renderTable(rows);
}
function renderChart(rows){
  const byMonth={};for(const r of rows){const mo=r.d.slice(0,7);(byMonth[mo]=byMonth[mo]||{});byMonth[mo][r.m]=(byMonth[mo][r.m]||0)+r.c;}
  const mos=months.filter(m=>m>=st.from&&m<=st.to);
  const max=Math.max(1,...mos.map(m=>Object.values(byMonth[m]||{}).reduce((a,b)=>a+b,0)));
  const usedModels=st.model?[st.model]:modelsAll.filter(m=>rows.some(r=>r.m===m));
  const chart=document.getElementById("chart");
  chart.innerHTML=mos.map(m=>{const md=byMonth[m]||{};const tot=Object.values(md).reduce((a,b)=>a+b,0);
    const segs=usedModels.filter(mm=>md[mm]).map(mm=>\`<div class="seg2" style="height:\${(md[mm]/max*100)}%;background:\${mcol(mm)}" title="\${mlbl(mm)}: \${fmtCost(md[mm])}"></div>\`).join("");
    return \`<div class="col" data-mo="\${m}"><div class="val">\${tot?fmtCost(tot):""}</div><div class="stack">\${segs}</div><div class="lbl">\${m}</div></div>\`;}).join("");
  chart.querySelectorAll(".col").forEach(c=>c.onclick=()=>{st.from=c.dataset.mo;st.to=c.dataset.mo;document.getElementById("fFrom").value=st.from;document.getElementById("fTo").value=st.to;renderDash();});
  document.getElementById("legend").innerHTML=usedModels.map(m=>\`<span><i class="dot" style="background:\${mcol(m)}"></i>\${mlbl(m)}</span>\`).join("");
  document.getElementById("chartSub").textContent="(cena po měsících, barvy = modely)";
}
function renderTable(rows){
  const gk=st.group;const keyFn=gk==="p"?r=>r.p:gk==="m"?r=>r.m:gk==="month"?r=>r.d.slice(0,7):r=>r.d;
  const g={};for(const r of rows){const k=keyFn(r)||"?";const o=g[k]||(g[k]={name:k,c:0,t:0,in:0,out:0,cache:0});o.c+=r.c;o.t+=r.t;o.in+=r.in;o.out+=r.out;o.cache+=r.cc+r.cr;}
  let arr=Object.values(g);const sk=st.sortKey;
  arr.sort((a,b)=>{let av=sk==="name"?a.name:a[sk],bv=sk==="name"?b.name:b[sk];if(sk==="name")return st.sortDir*String(av).localeCompare(String(bv));return st.sortDir*((av||0)-(bv||0));});
  const maxc=Math.max(1,...arr.map(a=>a.c));const isModel=gk==="m";const tbody=document.getElementById("tbody");
  tbody.innerHTML=arr.map(a=>{const disp=isModel?mlbl(a.name):a.name;const dot=isModel?\`<span class="dot" style="background:\${mcol(a.name)}"></span>\`:"";
    return \`<tr data-k="\${a.name}"><td><div class="namecell">\${dot}\${disp}</div></td><td>\${fmtCost(a.c)}</td><td>\${fmtTok(a.t)}</td><td>\${fmtTok(a.in)}</td><td>\${fmtTok(a.out)}</td><td>\${fmtTok(a.cache)}</td><td><div class="sharebar"><i style="width:\${(a.c/maxc*100)}%"></i></div></td></tr>\`;}).join("");
  const gname={p:"projektů",m:"modelů",month:"měsíců",d:"dní"}[gk];
  document.getElementById("tblTitle").textContent="Rozpad podle "+({p:"projektu",m:"modelu",month:"měsíce",d:"dne"}[gk]);
  document.getElementById("tblNote").textContent=arr.length+" "+gname+" | Klik na řádek = filtr. Klik na hlavičku = řazení.";
  tbody.querySelectorAll("tr").forEach(tr=>tr.onclick=()=>{const k=tr.dataset.k;
    if(gk==="p"){st.proj=k;document.getElementById("fProj").value=k;}else if(gk==="m"){st.model=k;document.getElementById("fModel").value=k;}
    else if(gk==="month"){st.from=k;st.to=k;document.getElementById("fFrom").value=k;document.getElementById("fTo").value=k;}
    else if(gk==="d"){st.from=k.slice(0,7);st.to=k.slice(0,7);document.getElementById("fFrom").value=st.from;document.getElementById("fTo").value=st.to;}renderDash();});
}

const TIERS=[
  {min:0,name:"Klóďátko",emoji:"🐣",tag:"Sotva jsi rozbalil terminál. Roztomilé."},
  {min:10e6,name:"Vibe nováček",emoji:"🌱",tag:"První prompty za tebou, jde ti to."},
  {min:100e6,name:"Prompt junior",emoji:"🔧",tag:"Už tomu přicházíš na chuť."},
  {min:500e6,name:"Token turista",emoji:"🧳",tag:"Cestuješ codebasem jako profík."},
  {min:1e9,name:"Klódožrout",emoji:"🔥",tag:"Miliarda za tebou. Žádná legrace."},
  {min:3e9,name:"Vibe veterán",emoji:"⚡",tag:"Claude tě zná křestním jménem."},
  {min:7e9,name:"Opus magnát",emoji:"👑",tag:"Tvůj účet za tokeny má vlastní PSČ."},
  {min:15e9,name:"Klóda božstvo",emoji:"🚀",tag:"Anthropic ti posílá vánoční přání."}
];
function tierFor(t){let cur=TIERS[0],idx=0;for(let i=0;i<TIERS.length;i++){if(t>=TIERS[i].min){cur=TIERS[i];idx=i;}}return{cur,idx,next:TIERS[idx+1]||null};}
function roundRect(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function drawLogo(g,cx,cy){
  g.textBaseline="middle";g.textAlign="left";
  g.font="700 44px sans-serif";const word="Vibecoding";const w1=g.measureText(word).width;
  g.font="500 22px sans-serif";const pill="Akademie";const pw=g.measureText(pill).width;
  const padX=16,pillW=pw+padX*2,pillH=38,gap=14,total=w1+gap+pillW;let x=cx-total/2;
  g.font="700 44px sans-serif";g.fillStyle="#ffffff";g.fillText(word,x,cy);
  x+=w1+gap;roundRect(g,x,cy-pillH/2,pillW,pillH,pillH/2);g.fillStyle="rgba(59,130,246,0.16)";g.fill();
  g.fillStyle="#60a5fa";g.font="500 22px sans-serif";g.fillText(pill,x+padX,cy+1);
}
function drawShareCard(s,t,cm,opts){
  const cnv=document.getElementById("card");if(!cnv)return;
  const W=1080,H=1080;cnv.width=W;cnv.height=H;const g=cnv.getContext("2d");
  g.fillStyle="#0a0a0f";g.fillRect(0,0,W,H);
  const rg=g.createRadialGradient(W*0.22,H*0.02,0,W*0.22,H*0.02,W*0.95);
  rg.addColorStop(0,"rgba(59,130,246,0.22)");rg.addColorStop(1,"rgba(59,130,246,0)");g.fillStyle=rg;g.fillRect(0,0,W,H);
  roundRect(g,60,60,W-120,H-120,44);g.fillStyle="#141422";g.fill();g.lineWidth=2;g.strokeStyle="rgba(255,255,255,0.08)";g.stroke();
  drawLogo(g,W/2,175);
  g.textAlign="center";g.textBaseline="middle";
  g.fillStyle="#8b93a7";g.font="600 30px sans-serif";g.fillText("🍆 KLÓDO-METR",W/2,300);
  const ng=g.createLinearGradient(W*0.28,0,W*0.72,0);ng.addColorStop(0,"#a78bfa");ng.addColorStop(0.6,"#60a5fa");ng.addColorStop(1,"#34d399");
  g.fillStyle=ng;g.font="800 148px sans-serif";g.fillText(cm.toFixed(1)+" cm",W/2,450);
  g.fillStyle="#ffffff";g.font="700 56px sans-serif";g.fillText(t.cur.emoji+"  "+t.cur.name,W/2,610);
  g.fillStyle="#8b93a7";g.font="italic 27px sans-serif";g.fillText("„"+t.cur.tag+"“",W/2,672);
  if(opts){g.fillStyle="#60a5fa";g.font="700 22px sans-serif";g.fillText("LEVEL "+opts.level+"/"+opts.levels+"      🏅 "+opts.achGot+"/"+opts.achTotal+" odznaků",W/2,728);}
  g.fillStyle="#e6eaf2";g.font="500 31px sans-serif";g.fillText(fmtTok(s.tok)+" tokenů   ·   "+s.sessCount+" soubojů   ·   "+s.days+" dní",W/2,792);
  g.strokeStyle="rgba(255,255,255,0.10)";g.lineWidth=2;g.beginPath();g.moveTo(180,880);g.lineTo(W-180,880);g.stroke();
  g.fillStyle="#ffffff";g.font="700 34px sans-serif";g.fillText("Kdo má většího klóda?",W/2,945);
  g.fillStyle="#60a5fa";g.font="600 30px sans-serif";g.fillText("vibecoding-akademie.cz",W/2,995);
}
function flexStats(){
  let cost=0,tok=0,cache=0,opus=0;const sess={},prj={},days=new Set(),mods=new Set();
  for(const r of DATA){cost+=r.c;tok+=r.t;cache+=r.cc+r.cr;mods.add(r.m);
    if(r.m==="claude-opus-4-8"||r.m==="claude-opus-4-7")opus+=r.t;
    sess[r.s]=(sess[r.s]||0)+r.t;prj[r.p]=(prj[r.p]||0)+r.t;if(r.d)days.add(r.d);}
  const biggest=Math.max(0,...Object.values(sess));
  const months=new Set([...days].map(x=>x.slice(0,7)));
  return{cost,tok,cache,opus,sessCount:Object.keys(sess).length,projCount:Object.keys(prj).length,days:days.size,months:months.size,models:mods.size,biggest,projTok:prj,usedFable:mods.has("claude-fable-5"),opusShare:tok?opus/tok:0,cacheShare:tok?cache/tok:0};
}
function renderFlex(){
  const s=flexStats();const cm=(s.tok/1e8);const t=tierFor(s.tok);
  animateNumber(document.getElementById("hBig"),cm,v=>v.toFixed(1)+" cm");
  document.getElementById("hEmoji").textContent=t.cur.emoji;
  document.getElementById("hRank").textContent=t.cur.name;
  document.getElementById("hTag").textContent=t.cur.tag;
  document.getElementById("mCur").textContent=t.cur.emoji+" "+t.cur.name;
  if(t.next){document.getElementById("mNext").textContent=t.next.name+" "+t.next.emoji;
    const span=t.next.min-t.cur.min,prog=(s.tok-t.cur.min)/span;
    setTimeout(()=>{document.getElementById("mFill").style.width=Math.max(3,Math.min(100,prog*100))+"%";},60);
    document.getElementById("mToNext").textContent="Do dalšího levelu ti chybí "+fmtTok(t.next.min-s.tok)+" tokenů ("+((t.next.min-s.tok)/1e8).toFixed(1)+" cm).";
  }else{document.getElementById("mNext").textContent="MAX 👑";setTimeout(()=>{document.getElementById("mFill").style.width="100%";},60);
    document.getElementById("mToNext").textContent="Jsi na vrcholu potravního řetězce. Gratulace, ty monstrum.";}
  animateNumber(document.getElementById("sTok"),s.tok,fmtTok);
  animateNumber(document.getElementById("sCost"),s.cost,fmtCost);
  animateNumber(document.getElementById("sSess"),s.sessCount,v=>Math.round(v));
  animateNumber(document.getElementById("sDays"),s.days,v=>Math.round(v));
  animateNumber(document.getElementById("sBig"),s.biggest,fmtTok);
  animateNumber(document.getElementById("sOpus"),s.opusShare*100,v=>Math.round(v)+"%");

  document.getElementById("ladder").innerHTML=TIERS.map((T,i)=>{
    const cls=i===t.idx?"cur":(i<t.idx?"done":"todo");
    const req=T.min?("od "+fmtTok(T.min)+" tok • "+(T.min/1e8).toFixed(0)+"+ cm"):"start (0 cm)";
    const you=i===t.idx?'<span class="lyou">TY</span>':"";
    return \`<div class="lrow \${cls}"><span class="lem">\${T.emoji}</span><span class="lname">\${T.name}\${you}</span><span class="lreq">\${req}</span><span class="ltag">\${T.tag}</span></div>\`;
  }).join("");

  const words=s.tok*0.75,pages=Math.round(words/500),books=(pages/320),speakH=(words/130/60),coffees=Math.round(s.cost/5),maxMonths=(s.cost/200);
  document.getElementById("conv").innerHTML=[
    "Kdybys ty tokeny vytiskl: <b>"+fmtInt(pages)+"</b> stran ("+books.toFixed(1)+" tlustých knih)",
    "Nahlas přečíst by trvalo <b>"+Math.round(speakH)+"</b> hodin v kuse",
    "V API cenách je to <b>"+fmtInt(coffees)+"</b> káv ☕",
    "Nebo <b>"+maxMonths.toFixed(1)+"</b> měsíců předplatného Claude Max"
  ].map(x=>\`<span class="chip">\${x}</span>\`).join("");

  const A=[
    {got:s.tok>=1e9,e:"🔥",n:"Miliardář",d:"Přes 1B tokenů"},
    {got:s.opusShare>=0.75,e:"👑",n:"Opus purista",d:">75 % na Opusu"},
    {got:s.projCount>=10,e:"🗺️",n:"Dobyvatel",d:"10+ projektů"},
    {got:s.biggest>=100e6,e:"🏃",n:"Maratonec",d:"Session přes 100M"},
    {got:s.cacheShare>=0.8,e:"🥷",n:"Cache ninja",d:">80 % z cache"},
    {got:s.cost>=1000,e:"💸",n:"Rozhazovač",d:"Přes $1000"},
    {got:s.models>=4,e:"🍱",n:"Všežravec",d:"4+ modelů"},
    {got:s.days>=30,e:"📅",n:"Vytrvalec",d:"30+ aktivních dní"},
    {got:s.usedFable,e:"🎩",n:"Fable flirt",d:"Ochutnal jsi Fable"},
    {got:s.tok>=5e9,e:"🐉",n:"Nenasyta",d:"Přes 5B tokenů"},
    {got:s.tok>=10e9,e:"📏",n:"Stovkař",d:"Přes 100 cm délky"},
    {got:s.months>=2,e:"💙",n:"Věrný",d:"Aktivní 2+ měsíce"},
    {got:s.tok>=15e9,e:"🌌",n:"Božstvo",d:"Nejvyšší level (15B+)"},
    {got:s.tok>=20e9,e:"🐋",n:"Velryba",d:"Přes 20B tokenů"},
    {got:s.days>=60,e:"🔱",n:"Nesmrtelný",d:"60+ aktivních dní"}
  ];
  const achGot=A.filter(a=>a.got).length,achTotal=A.length;
  document.getElementById("ach").innerHTML=A.map(a=>\`<div class="badge \${a.got?"":"locked"}"><span class="be">\${a.e}</span><div><div class="bn">\${a.n}</div><div class="bd">\${a.d}</div></div></div>\`).join("");

  const top=Object.entries(s.projTok).sort((a,b)=>b[1]-a[1]).slice(0,5);const maxp=top.length?top[0][1]:1;const medals=["🥇","🥈","🥉","4.","5."];
  document.getElementById("podium").innerHTML=top.map((p,i)=>\`<div class="prow"><span class="medal">\${medals[i]}</span><span class="pname">\${p[0]}</span><span class="pbar" style="width:\${Math.max(6,p[1]/maxp*45)}%"></span><span class="pval">\${fmtTok(p[1])}</span></div>\`).join("");

  const flexText="🍆 Můj Klódo-Metr: "+cm.toFixed(1)+" cm | "+fmtTok(s.tok)+" tokenů | rank: "+t.cur.name+" "+t.cur.emoji+" | "+fmtCost(s.cost)+" spáleno v Claude Code. Kdo víc? 😏";
  document.getElementById("flexPreview").textContent=flexText;
  document.getElementById("copyFlex").onclick=async()=>{try{await navigator.clipboard.writeText(flexText);document.getElementById("copyMsg").textContent="Zkopírováno! Šup s tím do chatu 🚀";}catch(e){document.getElementById("copyMsg").textContent="Nešlo zkopírovat - vyber text ručně dole.";}setTimeout(()=>document.getElementById("copyMsg").textContent="",4000);};

  const keepText='Uprav můj soubor ~/.claude/settings.json (pokud neexistuje, vytvoř ho jako platný JSON). Nastav v něm klíč "cleanupPeriodDays" na co nejvyšší možnou hodnotu, aby se přepisy chatů Claude Code ve složce ~/.claude/projects už nemazaly (výchozí je 30 dní). Pokud opravdu nelze nastavit neomezeně, nastav hodnotu 1825 (5 let). Zachovej všechna ostatní nastavení - jen slučuj, nic nemaž. Nakonec ověř, že je JSON platný.';
  const keepMsgEl=document.getElementById("keepMsg");
  document.getElementById("copyKeepPrompt").onclick=async()=>{try{await navigator.clipboard.writeText(keepText);keepMsgEl.textContent="Zkopírováno! Vlož to do Claude Code 🚀";}catch(e){window.prompt("Zkopíruj si prompt ručně (Ctrl/Cmd+C):",keepText);keepMsgEl.textContent="Zkopíruj prosím prompt ručně z okna výše.";}setTimeout(()=>keepMsgEl.textContent="",4000);};

  drawShareCard(s,t,cm,{level:t.idx+1,levels:TIERS.length,achGot,achTotal});
  const cbtn=document.getElementById("copyCard"),cmsg=document.getElementById("cardMsg");
  cbtn.onclick=()=>{document.getElementById("card").toBlob(async b=>{try{await navigator.clipboard.write([new ClipboardItem({"image/png":b})]);cbtn.textContent="✓ Zkopírováno do schránky!";cbtn.classList.add("ok");fireConfetti();cmsg.textContent="Obrázek zkopírován do schránky - můžeš ho vložit kamkoliv do komentářů v naší komunitě Vibecoding Akademie 🚀";setTimeout(()=>{cbtn.textContent="📸 Sdílet jako fotku (kartičku)";cbtn.classList.remove("ok");},2600);}catch(e){const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download="klodo-metr.png";a.click();URL.revokeObjectURL(u);cmsg.textContent="Schránka nejde, stáhl jsem obrázek - přilož ho do komentářů v naší komunitě Vibecoding Akademie.";}},"image/png");setTimeout(()=>{cmsg.textContent="";},8000);};
  if(!window.__flexSeen){window.__flexSeen=true;setTimeout(fireConfetti,300);}
}
function showView(v){const dash=v==="dash";document.getElementById("viewDash").style.display=dash?"":"none";document.getElementById("viewFlex").style.display=dash?"none":"";document.getElementById("tabDash").classList.toggle("on",dash);document.getElementById("tabFlex").classList.toggle("on",!dash);if(!dash)renderFlex();}
document.getElementById("tabDash").onclick=()=>showView("dash");
document.getElementById("tabFlex").onclick=()=>showView("flex");
initControls();renderDash();showView("flex");
</script>
</body>
</html>`;
}
