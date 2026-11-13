"use strict";
/* RIFTBORN — Arena of Legends (cleaned, single-layer version) */
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
// The ninja emoji (🥷) is missing from older OS/font versions, so it is drawn as an inline SVG instead.
const NINJA_SVG = '<svg viewBox="0 0 100 100" width="1em" height="1em" style="vertical-align:-.12em" aria-label="Shadow Ninja"><path d="M16 100Q16 66 50 62Q84 66 84 100Z" fill="#1f2937"/><rect x="30" y="74" width="40" height="6" fill="#dc2626"/><circle cx="50" cy="38" r="27" fill="#111827"/><rect x="27" y="31" width="46" height="17" rx="8.5" fill="#f2c9a0"/><ellipse cx="41" cy="39.5" rx="3.6" ry="4" fill="#111"/><ellipse cx="59" cy="39.5" rx="3.6" ry="4" fill="#111"/><circle cx="42.2" cy="38.2" r="1.1" fill="#fff"/><circle cx="60.2" cy="38.2" r="1.1" fill="#fff"/><rect x="23" y="22" width="54" height="8" rx="3" fill="#dc2626"/><polygon points="74,24 93,17 88,28 97,35 74,31" fill="#dc2626"/></svg>';
const avatar = look => look === "🥷" ? NINJA_SVG : esc(look);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

/* ---------- Data ---------- */
const DEFAULT_FIGHTERS = [
  {id:1, name:"Astra Vex",   style:"Solar Boxing",       classType:"Striker",  look:"🦸", ability:"Solar Flare",  color:"#d97706", energy:"#ffd166", accessory:"Sun-forged gauntlets", wins:0},
  {id:2, name:"Nyx Phantom", style:"Phantom Kickboxing", classType:"Assassin", look:"🥷", ability:"Phantom Rush", color:"#6d4aff", energy:"#55e6ef", accessory:"Afterimage veil",      wins:0},
  {id:3, name:"Kairo Volt",  style:"Storm Kenjutsu",     classType:"Mage",     look:"🤖", ability:"Electric Kick",color:"#087e9b", energy:"#5df5ff", accessory:"Thunder blade",        wins:0},
  {id:4, name:"Mordrake",    style:"Void Grappling",     classType:"Guardian", look:"🐉", ability:"Dark Aura",    color:"#63284f", energy:"#bd68ff", accessory:"Abyss armor",          wins:0}
];
const CLASS_KITS = {
  Striker:  {hp:100, attack:1.25, defense:.85, energy:1.05, moves:["Jab Flurry","Meteor Fist","Comet Breaker"],        desc:"High damage and fast pressure. Best at ending fights quickly."},
  Guardian: {hp:135, attack:.9,   defense:1.35,energy:1,    moves:["Shield Bash","Aegis Counter","Titan's Verdict"], desc:"More health and stronger guarding. Built to outlast bosses."},
  Mage:     {hp:90,  attack:1.05, defense:.85, energy:1.35, moves:["Arc Bolt","Solar Nova","Astral Cataclysm"],      desc:"Lower health, powerful energy attacks, and faster energy gain."},
  Assassin: {hp:95,  attack:1.15, defense:.9,  energy:1.15, moves:["Shadow Cut","Phantom Rush","Nightfall Execution"],desc:"Balanced damage with evasion and precision burst attacks."},
  Brawler:  {hp:120, attack:1.1,  defense:1.05,energy:.9,   moves:["Heavy Hook","Quake Slam","Worldbreaker"],        desc:"A sturdy close-range fighter with reliable heavy hits."}
};
const TIERS = [
  {name:"Street Challengers", diff:"Easy",      grunts:["Corner Challengers","Court Rivals","Neighborhood Crew Members","Rookie Competitors"]},
  {name:"Neighborhood Rivals", diff:"Moderate",  grunts:["West Side Veterans","Parking Lot Challengers","Elite Crew Members","Rival Captains"]},
  {name:"Crew Captains",       diff:"Hard",      grunts:["Campus Competitors","Varsity Rivals","Elite Athletes","Competition Team Captains"]},
  {name:"District Bosses",     diff:"Very hard", grunts:["Warehouse Veterans","Heavyweight Challengers","Industrial Crew Captains","Elite Competitors"]},
  {name:"Elite Champions",     diff:"Extreme",   grunts:["VIP Competitors","Elite Tournament Champions","Crown's Inner Circle","Former District Champions"]},
  {name:"Final Bosses",        diff:"Legendary", grunts:["Crown's Inner Circle","Former District Champions","Elite Tournament Champions"]}
];
// trait = signature mechanic (see enemyAction/playerMove); phases = cinematic power-ups at HP thresholds
const BOSSES = [
  {rank:1, name:'Miguel "Rook" Delgado', short:"Rook", title:"Corner Kid Turned Menace", look:"🥊", style:"Rushdown Brawler", trait:"rush", hp:120, attack:11,
   pers:"Cocky, loud, never backs down.", passive:"Rushes in with a flurry every third turn.", arena:["Corner Lot","🏙️"],
   intro:`"Everybody on this block knows my name. Learn it."`, post:`Rook grins through the blood. "Go see the Court King. He'll love you."`, story:"Every legend starts on a corner. Rook guards yours.",
   minions:["🧢 Lookout","🧢 Runner"], phases:[{at:.5, bonus:3, line:"Rook stops joking. The footwork gets serious."}],
   theme:{tempo:120, wave:"square", root:196, pattern:[0,null,3,null,7,null,3,5]}},
  {rank:2, name:'Marcus "Court King" Hale', short:"Hale", title:"Ruler of Riverside Court", look:"🏀", style:"Counter-Puncher", trait:"counter", hp:150, attack:13,
   pers:"Smooth, patient, loves an audience.", passive:"Punishes you for repeating the same move.", arena:["Riverside Court","🏀"],
   intro:`"Run the same play twice and I'll own it. Show me something new."`, post:`Hale spins the ball on a finger. "Campus has a captain who hits harder. Good luck."`, story:"The neighborhood bows to Hale until someone makes him sweat.",
   minions:["🏀 Point Guard","🏀 Enforcer"], phases:[{at:.5, bonus:3, line:"Hale cracks his neck. The showboating stops."}],
   theme:{tempo:100, wave:"triangle", root:220, pattern:[0,3,7,null,5,3,0,null]}},
  {rank:3, name:'Dani "Blitz" Reyes', short:"Blitz", title:"Campus Crew Captain", look:"🏈", style:"Combo Captain", trait:"combo", hp:185, attack:15,
   pers:"Disciplined, loud, leads from the front.", passive:"Chains a second strike every third turn.", arena:["Campus Stadium","🏟️"],
   intro:`"Whistle's blown. Nobody leaves my field standing."`, post:`Blitz salutes you. "The warehouse crews don't play by rules. Watch your back."`, story:"Campus is where reputations get ranked. Blitz does the ranking.",
   minions:["🎓 Linebacker","🎓 Safety"], phases:[{at:.5, bonus:4, line:"Blitz tears off her pads. Two-minute drill."}],
   theme:{tempo:140, wave:"sawtooth", root:174, pattern:[0,0,7,0,5,0,3,5]}},
  {rank:4, name:'Anton "Anvil" Kowalski', short:"Anvil", title:"Warehouse District Boss", look:"🏋️", style:"Armored Heavyweight", trait:"armor", hp:235, attack:18,
   pers:"Quiet, immovable, respects only strength.", passive:"Heavy armor cuts your damage by 20%.", arena:["Warehouse Row","🏭"],
   intro:`"I've been hit by everything this city has. You're next."`, post:`Anvil nods slowly. "The VIP floor is waiting. They'll smile while they cut you."`, story:"The docks answer to Anvil. Nobody has ever moved him.",
   minions:["⛓️ Dockhand","🏭 Forklift Rig"], phases:[{at:.5, bonus:5, line:"Anvil rolls his shoulders. Steel groans."}],
   theme:{tempo:80, wave:"sawtooth", root:110, pattern:[0,null,null,0,3,null,5,null]}},
  {rank:5, name:'Sienna "Velvet" Voss', short:"Velvet", title:"Elite Champion of the VIP Floor", look:"🕴️", style:"Evasive Technician", trait:"evade", hp:270, attack:19,
   pers:"Elegant, amused, always one step ahead.", passive:"Slips away from 25% of your attacks.", arena:["VIP Penthouse Ring","🏙️"],
   intro:`"Darling, the champagne is warm and your chances are cold."`, post:`Velvet fixes her hair. "Cross wants to meet you. Don't keep a king waiting."`, story:"Velvet is the Crown's gatekeeper. You are about to meet the Crown.",
   minions:["🥂 Bodyguard","🕶️ Fixer"], phases:[{at:.5, bonus:4, line:"Velvet kicks off her heels. The smile fades."}],
   theme:{tempo:96, wave:"sine", root:262, pattern:[0,4,7,11,7,4,null,null]}},
  {rank:6, name:'Victor "The Kingmaker" Cross', short:"Cross", title:"Master of the Elite Tournament", look:"🤵", style:"Grandmaster Strategist", trait:"kingmaker", hp:340, attack:21, ach:"kingmaker",
   pers:"Calm, calculating, treats every fight as a chess match.", passive:"Counters repeated moves hard. Three cinematic phases.", arena:["Crown Tower Grand Arena","👑"],
   intro:`"I built this tournament. Every champion in it was my choice. Including you."`, post:`Cross smiles, finally. "A king can be made. And unmade. Remember that."`, story:"The tournament was never a competition. It was a stage built by one man.",
   minions:["👔 Enforcer","📋 Analyst"],
   phases:[{at:.75, bonus:3, line:"Cross adjusts his cuffs. 'Phase two. Let us see how you adapt.'"},{at:.5, bonus:4, line:"The lights dim. Cross stops holding back."},{at:.25, bonus:6, line:"'Impossible.' The Kingmaker abandons strategy for pure force."}],
   theme:{tempo:110, wave:"square", root:147, pattern:[0,7,3,10,0,7,5,8]}},
  {rank:6, secret:true, name:'Damien "Ghost" Mercer', short:"Ghost", title:"The Vanished Champion", look:"👻", style:"Unpredictable Phantom", trait:"ghost", hp:320, attack:22, ach:"ghost",
   pers:"Rarely speaks. Nobody knows what he wants.", passive:"Erratic damage; vanishes from 20% of your attacks.", arena:["Midnight Rail Yard","🚉"],
   intro:`...`, post:`Ghost looks at you for a long moment. "...Stone is waiting." Then he is gone.`, story:"A secret championship, held at midnight, for those Cross could not control.",
   minions:["🌫️ Echo","🌫️ Shadow"], phases:[{at:.66, bonus:3, line:"Ghost flickers. Then he is behind you."},{at:.33, bonus:5, line:"Silence. The rail yard lights go out."}],
   theme:{tempo:70, wave:"sine", root:233, pattern:[0,null,1,null,null,6,null,null]}},
  {rank:6, name:'Terrence "The Dynasty" Stone', short:"Stone", title:"Former City Champion", look:"🦁", style:"Reigning Legend", trait:"dynasty", hp:400, attack:25, ach:"dynasty",
   pers:"Regal and unhurried. Even rival bosses stand when he enters.", passive:"Calls the Crown Guard for a heavy blow every fourth turn.", arena:["Dynasty Hall","🏛️"],
   intro:`"Every champion in this city stands on my shoulders. Climb, if you can."`, post:`Stone lowers his guard and bows. "The city has a new name to chant. Wear it well."`, story:"The final challenge. Beat Stone and the city belongs to you.",
   minions:["👑 Crown Guard","👑 Crown Guard"], phases:[{at:.66, bonus:3, line:"Stone smiles. 'Now the real fight.'"},{at:.33, bonus:6, line:"The crowd rises. The Dynasty fights for his legacy."}],
   theme:{tempo:90, wave:"triangle", root:98, pattern:[0,7,12,7,0,5,10,5]}}
];
// Procedural chiptune soundtrack (Web Audio, no audio files). Starts after a user click.
const Music = {
  ctx:null, timer:null, on:true,
  play(t) {
    this.stop(); if (!this.on) return;
    try { this.ctx = this.ctx || new AudioContext(); } catch { return; }
    const c = this.ctx, step = 30 / t.tempo; let i = 0;
    this.timer = setInterval(() => {
      const n = t.pattern[i++ % t.pattern.length]; if (n === null) return;
      const o = c.createOscillator(), g = c.createGain();
      o.type = t.wave; o.frequency.value = t.root * 2 ** (n / 12);
      g.gain.setValueAtTime(.06, c.currentTime); g.gain.exponentialRampToValueAtTime(.001, c.currentTime + step * .9);
      o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + step);
    }, step * 1000);
  },
  stop() { clearInterval(this.timer); }
};
// slot = index into a class's three named moves
const MOVES = {
  strike:   {icon:"👊", slot:0, dmg:10, gain:14},
  special:  {icon:"⚡", slot:1, dmg:23, cost:25},
  guard:    {icon:"🛡"},
  ultimate: {icon:"☄",  slot:2, dmg:42, cost:60}
};
const ACHIEVEMENTS = [
  ["first_win","First Victory","Win any battle"], ["three_wins","Rising Champion","Win 3 battles"], ["ten_wins","Arena Legend","Win 10 battles"],
  ["first_boss","First Boss Down","Defeat a boss"], ["boss_hunter","Boss Hunter","Defeat 3 bosses"], ["boss_legend","Boss Legend","Defeat 8 bosses"], ["kingmaker","Kingmaker Dethroned","Defeat Victor Cross"], ["ghost","Ghost Hunter","Defeat Damien Mercer"], ["dynasty","End of a Dynasty","Defeat Terrence Stone"],
  ["minion_slayer","Minion Breaker","Defeat a boss minion"]
];

/* ---------- Persistence (same localStorage keys as before, so old saves still load) ---------- */
const KEYS = {fighters:"riftbornFighters", wins:"riftbornWins", bossIndex:"riftbornBossIndex", bossDefeats:"riftbornBossDefeats", xp:"riftbornXP", level:"riftbornLevel", achievements:"riftbornAchievements"};
const load = (key, fallback) => { try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch { return fallback; } };
const S = {
  fighters: load(KEYS.fighters, null) || DEFAULT_FIGHTERS,
  wins: load(KEYS.wins, 0), bossIndex: load(KEYS.bossIndex, 0), bossDefeats: load(KEYS.bossDefeats, 0),
  xp: load(KEYS.xp, 0), level: load(KEYS.level, 1), achievements: load(KEYS.achievements, [])
};
const save = () => { try { for (const k in KEYS) localStorage.setItem(KEYS[k], JSON.stringify(S[k])); } catch {} };

/* ---------- State ---------- */
let selected = S.fighters[0].id, arenaIdx = S.bossIndex % BOSSES.length, editId = null;
const idle = () => ({enemy:null, boss:null, playerHP:100, enemyHP:100, energy:40, guarding:false, over:false, minions:[], target:-1, turn:0, minionTurn:0, recent:[]});
let B = idle();

const fighter = () => S.fighters.find(f => f.id === selected) || S.fighters[0];
const classOf = f => CLASS_KITS[f.classType] ? f.classType : "Striker";
const kit = f => CLASS_KITS[classOf(f)];
const maxHP = f => kit(f).hp + (S.level - 1) * 5;
const log = s => { $("log").innerHTML = s + "<br>" + $("log").innerHTML; };

/* ---------- Navigation ---------- */
function tab(name) {
  if (name !== "battle") Music.stop();
  document.querySelectorAll(".screen").forEach(s => s.classList.toggle("hidden", s.id !== name));
  document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b.dataset.tab === name));
  if (name === "fighters") renderRoster();
  if (name === "tournament") renderRewards();
  if (name === "arena") { renderArenas(); showArenaInfo(); }
  if (name === "battle") { if (!B.enemy) startMatch(false); else updateBattle(); } // auto-start only when no match exists
}
document.querySelectorAll(".tab").forEach(b => b.onclick = () => tab(b.dataset.tab));

/* ---------- Roster, arenas, creator ---------- */
function renderRoster() {
  $("fighterCount").textContent = S.fighters.length + " FIGHTERS";
  $("roster").innerHTML = S.fighters.map(f => {
    const k = kit(f);
    return `<article class="fighter ${f.id === selected ? "selected" : ""}" data-id="${f.id}" style="--tone:${esc(f.color)}"><div class="portrait">${avatar(f.look)}</div><h3>${esc(f.name)}</h3><span class="tag">${classOf(f)}</span><span class="tag">${esc(f.style)}</span><span class="tag">${esc(f.ability)}</span><div class="stats"><span>❤ <b>${k.hp}</b> HP</span><span>⚔ <b>${Math.round(70 * k.attack)}</b> ATK</span><span>🛡 <b>${Math.round(50 * k.defense)}</b> DEF</span><span>🏆 <b>${f.wins || 0}</b> W</span></div></article>`;
  }).join("");
  document.querySelectorAll(".fighter").forEach(c => c.onclick = () => { selected = Number(c.dataset.id); renderRoster(); });
}
// Each map belongs to one boss/rank. Difficulty is shown; the boss inside is not.
const mapUnlocked = i => S.bossIndex >= BOSSES.length || i <= S.bossIndex;
function renderArenas() {
  $("arenas").innerHTML = BOSSES.map((b, i) => {
    const t = TIERS[b.rank - 1], ok = mapUnlocked(i);
    return `<div class="arena-card ${i === arenaIdx ? "selected" : ""}" data-i="${i}" style="${ok ? "" : "opacity:.45;cursor:not-allowed"}"><div style="font-size:30px">${ok ? b.arena[1] : "🔒"}</div><strong>${esc(b.arena[0])}</strong><small>Rank ${b.rank} · ${t.name}</small><br><span class="tag">${t.diff.toUpperCase()}</span></div>`;
  }).join("");
  document.querySelectorAll(".arena-card").forEach(c => c.onclick = () => {
    const i = Number(c.dataset.i);
    if (!mapUnlocked(i)) { $("arenaInfo").textContent = "Locked. Defeat the boss of the previous map to unlock this one."; return; }
    arenaIdx = i; renderArenas(); showArenaInfo();
  });
}
const showArenaInfo = () => {
  const b = BOSSES[arenaIdx];
  $("arenaInfo").textContent = `Selected: ${b.arena[0]} · ${TIERS[b.rank - 1].diff} difficulty. Something is waiting inside.`;
};
const FORM_IDS = ["name", "style", "classType", "look", "ability", "color", "energy", "accessory"];
function showClassDescription() {
  const k = CLASS_KITS[$("classType").value];
  $("classDescription").textContent = `${k.desc} Class moves: ${k.moves.join(" · ")}`;
}
function preview() {
  $("previewAvatar").innerHTML = avatar($("look").value);
  $("previewAvatar").style.filter = `drop-shadow(0 0 16px ${$("energy").value})`;
  $("previewName").textContent = $("name").value || "Your New Fighter";
  $("previewStyle").textContent = $("style").value;
  $("previewAbility").textContent = "✦ " + $("ability").value;
  $("previewAccessory").textContent = $("accessory").value || "Your design detail appears here";
  $("preview").style.background = `linear-gradient(145deg,${$("color").value}44,transparent)`;
  showClassDescription();
}
FORM_IDS.forEach(id => $(id).addEventListener("input", preview));

function loadEditor(f) {
  editId = f.id;
  FORM_IDS.forEach(id => { $(id).value = id === "classType" ? classOf(f) : f[id]; });
  preview(); tab("creator");
}
$("editSelected").onclick = () => loadEditor(fighter());

$("saveFighter").onclick = () => {
  const name = $("name").value.trim();
  if (!name) { alert("Give your fighter a name first."); return; }
  const old = S.fighters.find(x => x.id === editId);
  const f = {id: editId || Date.now(), name, style:$("style").value, classType:$("classType").value, look:$("look").value, ability:$("ability").value,
             color:$("color").value, energy:$("energy").value, accessory:$("accessory").value || "Custom design", wins: old?.wins || 0};
  S.fighters = editId ? S.fighters.map(x => x.id === editId ? f : x) : [...S.fighters, f];
  selected = f.id; editId = null; save(); tab("fighters");
};
$("randomize").onclick = () => {
  $("name").value = pick(["Vanta Blaze","Echo Storm","Riven Sol","Zenith Kai","Onyx Nova"]);
  $("style").value = pick(["Solar Boxing","Phantom Kickboxing","Void Grappling","Storm Kenjutsu","Dimension Dance"]);
  $("classType").value = pick(Object.keys(CLASS_KITS));
  $("look").value = pick(["🥷","🦸","🤖","🧙","🐉","🥊"]);
  $("ability").value = pick(["Solar Flare","Dark Aura","Phantom Rush","Dimension Shift","Electric Kick","Fire Punch"]);
  $("color").value = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
  $("accessory").value = "Mystic energy armor";
  preview();
};

/* ---------- Progression ---------- */
function renderProgress() {
  const needed = S.level * 100;
  $("xpWrap").innerHTML = `<div style="display:flex;justify-content:space-between"><b>⭐ LEVEL ${S.level}</b><span class="muted">${S.xp} / ${needed} XP</span></div><div class="xp-track"><span style="width:${S.xp / needed * 100}%"></span></div>`;
}
function addXP(amount) {
  S.xp += amount;
  while (S.xp >= S.level * 100) {
    S.xp -= S.level * 100; S.level++;
    log(`🌟 LEVEL UP! You reached level ${S.level}. Your max health increased.`);
  }
  save(); renderProgress();
}
function unlock(id, label = ACHIEVEMENTS.find(a => a[0] === id)?.[1]) {
  if (S.achievements.includes(id)) return;
  S.achievements.push(id); save();
  log(`🏅 ACHIEVEMENT UNLOCKED: ${label}!`);
}
function renderRewards() {
  $("wins").textContent = S.wins + " wins";
  const items = [
    ["🥉","Bronze Champion Trophy","Win your first battle", S.wins >= 1],
    ["🥈","Silver Champion Trophy","Win three battles", S.wins >= 3],
    ["☠️","Boss Slayer Title","Defeat three bosses", S.bossDefeats >= 3],
    ["🏆","World Champion Belt","Win ten battles", S.wins >= 10],
    ["🌟","First Boss Down","Defeat your first boss", S.bossDefeats >= 1],
    ["⚔️","Minion Breaker","Defeat a boss minion", S.achievements.includes("minion_slayer")]
  ];
  $("rewards").innerHTML = items.map(r => `<div class="reward ${r[3] ? "" : "locked"}"><div class="trophy">${r[0]}</div><div><b>${r[1]}</b><div class="muted" style="font-size:12px">${r[2]}</div><small>${r[3] ? "UNLOCKED" : "LOCKED"}</small></div></div>`).join("");
  $("achievementPanel").innerHTML = "<h2>🏅 Achievements</h2><div class='achievement-grid'>" + ACHIEVEMENTS.map(a => {
    const on = S.achievements.includes(a[0]);
    return `<div class="achievement ${on ? "unlocked" : ""}"><b>${on ? "✓ " : "🔒 "}${a[1]}</b><span class="muted">${a[2]}</span></div>`;
  }).join("") + "</div>";
  const cur = S.bossIndex % BOSSES.length, lap = S.bossIndex >= BOSSES.length;
  $("bossProgress").innerHTML = "<b>Championship ladder</b>" + BOSSES.map((b, i) => {
    const done = lap || i < cur, now = !lap && i === cur, t = TIERS[b.rank - 1];
    return `<div style="margin-top:9px"><b>${done ? "✓" : now ? "▶" : "🔒"} Rank ${b.rank} · ${t.name} (${t.diff})</b><br><span class="muted">${done ? esc(b.name) + " — " + esc(b.title) + ". " + esc(b.story) : b.secret ? "??? Secret championship event" : "???"}</span></div>`;
  }).join("") + "<br><small>Quick Fights draw enemies from your current rank. Bosses scale after the ladder is cleared.</small>";
}
$("resetProgress").onclick = () => {
  if (!confirm("Reset ALL fighters, wins, XP and achievements? This cannot be undone.")) return;
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  location.reload();
};

/* ---------- Battle ---------- */
function startMatch(boss) {
  if (!mapUnlocked(arenaIdx)) return;
  const f = fighter(), cur = BOSSES[arenaIdx], b = boss ? cur : null;
  const loop = Math.floor(S.bossIndex / BOSSES.length), rank = cur.rank, tier = TIERS[rank - 1];
  const enemy = b ? {name:b.name, look:b.look, label:b.title, hp:b.hp + loop * 25, attack:b.attack + loop * 2}
                  : {name:pick(tier.grunts), look:pick(["🥷","🥋","🧢","🤼"]), label:`${tier.name} · ${tier.diff}`, hp:70 + rank * 20 + loop * 10, attack:6 + Math.round(rank * 2.5) + loop};
  B = {enemy, boss:b, rank, playerHP:maxHP(f), enemyHP:enemy.hp, energy:kit(f).energy > 1 ? 50 : 40, guarding:false, over:false, phase:0, revealed:!b,
       minions: b ? b.minions.map((name, i) => ({name, hp:25 + i * 8})) : [], target:-1, turn:0, minionTurn:0, recent:[]};
  $("arenaLabel").textContent = cur.arena[0].toUpperCase();
  $("battleHint").textContent = b ? "A challenger awaits. Press FIGHT! to begin." : `Rank ${rank} ${tier.name}. Your class determines your stats and combat kit.`;
  if (!b) log(`${f.name} faces ${enemy.name}.`);
  tab("battle");
  if (b) showIntro(b); else Music.play({tempo:100 + rank * 6, wave:"square", root:165, pattern:[0,null,5,null,3,null,7,null]});
}
function showIntro(b) {
  const t = TIERS[b.rank - 1];
  $("introKicker").textContent = (b.secret ? "🔒 SECRET CHAMPIONSHIP EVENT · " : "") + `RANK ${b.rank} · ${t.name.toUpperCase()} · ${t.diff.toUpperCase()}`;
  $("introIcon").innerHTML = avatar(b.look);
  $("introName").textContent = b.name;
  $("introTitle").textContent = `${b.title} · ${b.style}`;
  $("introArena").textContent = `${b.arena[1]} ${b.arena[0]}`;
  $("introLine").textContent = `${b.pers} ${b.intro}`;
  $("intro").classList.remove("hidden");
  $("introGo").onclick = () => { $("intro").classList.add("hidden"); B.revealed = true;
    $("battleHint").textContent = `BOSS · ${b.style}: ${b.passive} ${b.pers}`;
    log(`⚠ ${b.name} — ${b.title}! ${b.intro}`); updateBattle(); Music.play(b.theme);
  };
}
function updateBattle() {
  const f = fighter(), k = kit(f), hp = maxHP(f);
  $("playerLabel").textContent = `${f.name} · ${classOf(f)}`;
  $("playerAvatar").innerHTML = avatar(f.look);
  $("playerStyle").textContent = `${classOf(f)} · ${k.moves[0]}`;
  $("playerHealth").textContent = `${B.playerHP} / ${hp} HP`;
  $("playerBar").style.width = B.playerHP / hp * 100 + "%";
  $("energyValue").textContent = B.energy;
  if (B.enemy) {
    const hide = B.boss && !B.revealed; // keep the boss secret until the intro is dismissed
    $("enemyLabel").textContent = hide ? "???" : B.enemy.name;
    $("enemyAvatar").innerHTML = hide ? "❔" : avatar(B.enemy.look);
    $("enemyStyle").textContent = hide ? "Unknown challenger" : B.enemy.label;
    $("enemyHealth").textContent = `${Math.max(0, B.enemyHP)} / ${B.enemy.hp} HP`;
    $("enemyBar").style.width = Math.max(0, B.enemyHP) / B.enemy.hp * 100 + "%";
  }
  document.querySelectorAll(".move").forEach(btn => {
    const m = MOVES[btn.dataset.move];
    const name = m.slot === undefined ? "Defense" : k.moves[m.slot];
    const info = btn.dataset.move === "guard" ? `Reduce next hit · +${Math.round(18 * k.energy)} energy`
      : m.cost ? `${Math.round(m.dmg * k.attack)} damage · ${m.cost} energy`
      : `${Math.round(m.dmg * k.attack)} damage · +${Math.round(m.gain * k.energy)} energy`;
    btn.innerHTML = `${m.icon} ${esc(name.toUpperCase())}<small>${info}</small>`;
    btn.disabled = B.over || !B.enemy || (m.cost || 0) > B.energy;
  });
  const row = $("minionRow");
  row.innerHTML = B.minions.length
    ? B.minions.map((m, i) => `<button class="minion-chip" data-minion="${i}">${i === B.target ? "▶" : "🎯"} ${m.name} · ${m.hp} HP</button>`).join("")
    : `<span class="muted">${B.boss ? "No minions remain." : ""}</span>`;
  row.querySelectorAll("button").forEach(b => b.onclick = () => {
    const i = Number(b.dataset.minion);
    B.target = B.target === i ? -1 : i;
    log(B.target < 0 ? "Target cleared. Attacks hit the main enemy." : `Target locked: ${B.minions[i].name}`);
    updateBattle();
  });
  renderProgress();
}

function checkPhase() {
  const b = B.boss; if (!b) return;
  while (B.phase < b.phases.length && B.enemyHP <= B.enemy.hp * b.phases[B.phase].at) {
    const p = b.phases[B.phase++]; B.enemy.attack += p.bonus;
    log(`🎬 PHASE ${B.phase + 1}: ${p.line}`);
  }
}
function playerMove(move) {
  if (B.over || !B.enemy) return;
  const f = fighter(), k = kit(f), m = MOVES[move], boss = B.boss;
  if ((m.cost || 0) > B.energy) return;
  B.recent.push(move); if (B.recent.length > 3) B.recent.shift();
  B.energy = Math.min(100, B.energy - (m.cost || 0) + Math.round((m.gain || 0) * k.energy));
  if (move === "guard") { B.guarding = true; B.energy = Math.min(100, B.energy + Math.round(18 * k.energy)); log(`${f.name} activates a class guard.`); }
  else log(`${m.icon} ${f.name} uses ${k.moves[m.slot]}!`);

  const dmg = m.dmg ? Math.round(m.dmg * k.attack) : 0;
  if (dmg) {
    const minion = B.minions[B.target], dodge = {evade:.25, ghost:.2}[boss?.trait];
    if (minion) {
      minion.hp -= dmg; log(`You hit ${minion.name} for ${dmg} damage.`);
      if (minion.hp <= 0) {
        log(`💥 ${minion.name} has been defeated! +15 XP`);
        B.minions.splice(B.target, 1); B.target = -1; addXP(15); unlock("minion_slayer", "Minion Breaker");
      }
    } else if (dodge && Math.random() < dodge) {
      log(`🌀 ${boss.short} slips away from your attack!`);
    } else {
      const d = boss?.trait === "armor" ? Math.round(dmg * .8) : dmg;
      B.enemyHP -= d; log(`You deal ${d} damage to ${B.enemy.name}${d < dmg ? " (armor absorbs some)" : ""}.`);
      checkPhase();
    }
  }
  if (B.enemyHP <= 0) return playerVictory();
  enemyAction();
  updateBattle();
}

function enemyAction() {
  const f = fighter(), boss = B.boss, T = boss?.trait, guarded = B.guarding;
  B.guarding = false; B.turn++;
  let dmg = B.enemy.attack;
  if (T === "rush" && B.turn % 3 === 0) { dmg += 7; log("💨 Rook rushes in with a flurry!"); }
  if (T === "combo" && B.turn % 3 === 0) { dmg += Math.round(dmg * .7); log("⚡ Blitz chains a second strike!"); }
  if (T === "dynasty" && B.turn % 4 === 0) { dmg += 14; log("👑 Stone calls the Crown Guard!"); }
  if ((T === "counter" || T === "kingmaker") && B.recent.length >= 2 && B.recent.at(-1) === B.recent.at(-2)) {
    dmg += T === "kingmaker" ? 14 : 10; log(`🧠 ${boss.short} reads your repeated move and counters!`);
  }
  if (T === "ghost") { dmg = Math.round(dmg * (.5 + Math.random() * 1.5)); log("👻 Ghost strikes from nowhere."); }
  if (Math.random() < .18) { dmg = Math.round(dmg * 1.5); log("Critical enemy hit!"); }
  if (guarded) { dmg = Math.ceil(dmg * (classOf(f) === "Guardian" ? .2 : .35)); log("Your guard reduces the incoming damage."); }
  B.playerHP = Math.max(0, B.playerHP - dmg);
  log(`${B.enemy.name} deals ${dmg} damage.`);
  if (B.minions.length) {
    const m = B.minions[++B.minionTurn % B.minions.length];
    const md = guarded ? 2 : classOf(f) === "Guardian" ? 4 : 6;
    B.playerHP = Math.max(0, B.playerHP - md); log(`${m.name} chips you for ${md} damage.`);
  }
  if (B.playerHP <= 0) {
    B.over = true; Music.stop(); log("💥 DEFEAT. Your XP is safe. Adjust your class or strategy and try again.");
    $("battleHint").textContent = "Defeated. Reset the match to retry.";
  }
}

function playerVictory() {
  B.over = true; B.enemyHP = 0; Music.stop();
  const xp = B.boss ? 120 + B.rank * 30 : 40 + B.rank * 10;
  if (B.boss) {
    if (arenaIdx === S.bossIndex % BOSSES.length) { S.bossDefeats++; S.bossIndex++; arenaIdx = S.bossIndex % BOSSES.length; }
    unlock("first_boss", "First Boss Down");
    if (S.bossDefeats >= 3) unlock("boss_hunter", "Boss Hunter");
    if (S.bossDefeats >= 8) unlock("boss_legend", "Boss Legend");
    if (B.boss.ach) unlock(B.boss.ach);
    log(`🎬 ${B.boss.post}`);
  }
  S.wins++; fighter().wins = (fighter().wins || 0) + 1;
  if (S.wins >= 1) unlock("first_win", "First Victory");
  if (S.wins >= 3) unlock("three_wins", "Rising Champion");
  if (S.wins >= 10) unlock("ten_wins", "Arena Legend");
  addXP(xp);
  log(`🏆 VICTORY! ${B.enemy.name} defeated. +${xp} XP.`);
  $("battleHint").textContent = B.boss ? `Victory! ${B.boss.post}` : "Victory! Visit Tournament for your progression and achievements.";
  save(); updateBattle();
}

document.querySelectorAll(".move").forEach(b => b.onclick = () => playerMove(b.dataset.move));
$("fightSelected").onclick = $("quickFight").onclick = () => startMatch(false);
$("startTournament").onclick = () => startMatch(true);
$("restart").onclick = () => startMatch(!!B.boss);
$("leaveFight").onclick = () => {
  if (B.enemy && !B.over && !confirm("Leave this fight? Your progress in it will be lost.")) return;
  B = idle(); $("intro").classList.add("hidden"); tab("fighters");
};

$("musicToggle").onclick = () => { Music.on = !Music.on; if (!Music.on) Music.stop(); $("musicToggle").textContent = Music.on ? "🔊 MUSIC" : "🔇 MUSIC"; };
/* ---------- Init ---------- */
showArenaInfo(); renderArenas(); renderRoster(); renderRewards(); preview(); updateBattle();
