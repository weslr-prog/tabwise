# TABWISE — Chrome Extension Build Guide
> Stack: React 18 · Vite · CRXJS · chrome.storage.local · ExtensionPay · Stripe  
> Editor: VS Code · AI: GitHub Copilot  
> Popup width: 360px fixed · Design: Mission-control dark (DM Sans + DM Mono)

---

## SECTION 01 — The Approved UI (Source of Truth)

The file below is the **exact, approved popup UI**. All component work in later sections must match this visual design. Mock data is replaced with live Chrome API data as described in Section 04. Do not change colors, fonts, layout, or component structure without explicit instruction.

### `src/popup/App.jsx` — Full UI (start here, refactor outward)

```jsx
import { useState, useEffect } from "react";

// ─── REPLACE THIS SECTION WITH LIVE DATA (see Section 04) ───────────────────
// During development, mockTabs drives the UI.
// In production, replace mockTabs with the useTabs() hook output.
const mockTabs = [
  { id: 1, domain: "github.com", title: "TabOptimizer / main — GitHub", favicon: "🐙", age: 2, cluster: "Work", ram: 180, visited: true, duplicates: 0 },
  { id: 2, domain: "stackoverflow.com", title: "How to suspend chrome tabs programmatically", favicon: "🔶", age: 11, cluster: "Research", ram: 95, visited: false, duplicates: 2 },
  { id: 3, domain: "stackoverflow.com", title: "Chrome extension manifest v3 service worker", favicon: "🔶", age: 11, cluster: "Research", ram: 88, visited: false, isDuplicate: true },
  { id: 4, domain: "stackoverflow.com", title: "Chrome tabs API getSelected deprecated", favicon: "🔶", age: 11, cluster: "Research", ram: 91, visited: false, isDuplicate: true },
  { id: 5, domain: "figma.com", title: "Extension UI — Figma", favicon: "🎨", age: 1, cluster: "Work", ram: 240, visited: true, duplicates: 0 },
  { id: 6, domain: "amazon.com", title: "Mechanical Keyboard — Amazon", favicon: "📦", age: 6, cluster: "Shopping", ram: 310, visited: false, duplicates: 1 },
  { id: 7, domain: "amazon.com", title: "USB-C Hub 7-in-1 — Amazon", favicon: "📦", age: 6, cluster: "Shopping", ram: 295, visited: false, isDuplicate: true },
  { id: 8, domain: "youtube.com", title: "Chrome Extension Tutorial — YouTube", favicon: "▶️", age: 3, cluster: "Research", ram: 520, visited: true, duplicates: 0 },
  { id: 9, domain: "notion.so", title: "Project Notes — Notion", favicon: "📝", age: 0, cluster: "Work", ram: 145, visited: true, duplicates: 0 },
  { id: 10, domain: "reddit.com", title: "r/webdev — Reddit", favicon: "🤖", age: 14, cluster: "Entertainment", ram: 200, visited: false, duplicates: 0 },
  { id: 11, domain: "css-tricks.com", title: "Complete Guide to Flexbox — CSS-Tricks", favicon: "✨", age: 8, cluster: "Research", ram: 75, visited: false, duplicates: 0 },
];

const readLaterItems = [
  { id: 1, title: "The Future of Browser Extensions", domain: "smashingmagazine.com", saved: "2 days ago" },
  { id: 2, title: "V8 Memory Management Deep Dive", domain: "v8.dev", saved: "5 days ago" },
  { id: 3, title: "Tab Hoarders Anonymous", domain: "medium.com", saved: "1 week ago" },
];

const weeklyStats = {
  opened: 87,
  revisited: 34,
  ramSaved: "4.2 GB",
  topDomain: "github.com",
  suspendedCount: 23,
  avgTabAge: 5.4,
};
// ─── END MOCK DATA ────────────────────────────────────────────────────────────

// ─── SHARED SUB-COMPONENTS ────────────────────────────────────────────────────

function DustBar({ age }) {
  const level = Math.min(age / 14, 1);
  const color = level > 0.7 ? "#ff6b35" : level > 0.4 ? "#f5c842" : "#4ade80";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 48, height: 4, background: "#1e2433", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${level * 100}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.4s ease" }} />
      </div>
      <span style={{ fontSize: 9, color: "#4a5568", fontFamily: "monospace" }}>{age}d</span>
    </div>
  );
}

function RamBadge({ ram }) {
  const high = ram > 300;
  return (
    <span style={{
      fontSize: 9, padding: "2px 5px", borderRadius: 3,
      background: high ? "rgba(255,107,53,0.12)" : "rgba(74,222,128,0.08)",
      color: high ? "#ff6b35" : "#4ade80",
      fontFamily: "monospace", border: `1px solid ${high ? "rgba(255,107,53,0.2)" : "rgba(74,222,128,0.1)"}`,
    }}>
      {ram}MB
    </span>
  );
}

function Stat({ label, value, warn }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <span style={{ fontSize: 8, color: "#2d3748", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>{label}</span>
      <span style={{ fontSize: 16, color: warn ? "#f5c842" : "#e2e8f0", fontFamily: "'DM Mono', monospace", fontWeight: 500, lineHeight: 1 }}>{value}</span>
    </div>
  );
}

const clusterColors = {
  Work: "#6366f1",
  Research: "#06b6d4",
  Shopping: "#f59e0b",
  Entertainment: "#ec4899",
  Reading: "#8b5cf6",
};

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────

export default function TabOptimizer() {
  const [activeView, setActiveView] = useState("tabs");
  const [expandedDomain, setExpandedDomain] = useState(null);
  const [expandedCluster, setExpandedCluster] = useState(null);
  const [focusLimit, setFocusLimit] = useState(8);
  const [suspended, setSuspended] = useState([]);
  const [readLater, setReadLater] = useState(readLaterItems);
  const [activeTab, setActiveTab] = useState(1);
  const [ramSaverOn, setRamSaverOn] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  // Group tabs by domain
  const domainMap = {};
  mockTabs.forEach(t => {
    if (!domainMap[t.domain]) domainMap[t.domain] = [];
    domainMap[t.domain].push(t);
  });

  // Group tabs by cluster
  const clusterMap = {};
  mockTabs.forEach(t => {
    if (!clusterMap[t.cluster]) clusterMap[t.cluster] = [];
    clusterMap[t.cluster].push(t);
  });

  const totalRam = mockTabs.reduce((a, t) => a + t.ram, 0);
  const suspendedRam = suspended.reduce((a, id) => {
    const t = mockTabs.find(x => x.id === id);
    return a + (t ? t.ram : 0);
  }, 0);
  const dustyCount = mockTabs.filter(t => t.age > 7).length;
  const dupDomains = Object.entries(domainMap).filter(([, tabs]) => tabs.length > 1);

  const nav = [
    { id: "tabs",     icon: "⬚", label: "Tabs"     },
    { id: "clusters", icon: "◈", label: "Clusters" },
    { id: "focus",    icon: "◎", label: "Focus"    },
    { id: "queue",    icon: "⊞", label: "Queue"    },
    { id: "report",   icon: "⊡", label: "Report"   },
  ];

  return (
    <div style={{
      width: 360,
      minHeight: 480,
      background: "#080c14",
      fontFamily: "'DM Sans', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Google Fonts — load in index.html <head> in production */}
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div style={{
        padding: "14px 16px 10px",
        borderBottom: "1px solid #0f1623",
        background: "linear-gradient(180deg, #111827, #0d1117)",
      }}>
        {/* Logo + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            background: "linear-gradient(135deg, #6366f1, #06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, boxShadow: "0 0 12px rgba(99,102,241,0.4)",
          }}>⬡</div>
          <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600, letterSpacing: "0.04em" }}>TABWISE</span>
          <span style={{ color: "#2d3748", fontSize: 10, fontFamily: "'DM Mono', monospace", marginLeft: 2 }}>v1.0</span>
        </div>

        {/* Stat chips + RAM Saver toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12 }}>
            <Stat label="TABS" value={mockTabs.length} />
            <Stat label="RAM" value={`${(totalRam / 1024).toFixed(1)}GB`} warn={totalRam > 2000} />
            <Stat label="DUST" value={dustyCount} warn={dustyCount > 3} />
            <Stat label="DUPES" value={dupDomains.length} warn />
          </div>
          <button
            onClick={() => { setRamSaverOn(!ramSaverOn); showToast(ramSaverOn ? "RAM Saver paused" : "RAM Saver active"); }}
            style={{
              padding: "4px 10px", borderRadius: 6, border: "none", cursor: "pointer",
              background: ramSaverOn ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.04)",
              color: ramSaverOn ? "#4ade80" : "#4a5568",
              fontSize: 10, fontFamily: "'DM Mono', monospace",
              transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 5,
            }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: ramSaverOn ? "#4ade80" : "#4a5568",
              display: "inline-block",
              boxShadow: ramSaverOn ? "0 0 6px #4ade80" : "none",
            }} />
            RAM SAVER
          </button>
        </div>

        {/* RAM usage bar */}
        <div style={{ marginTop: 10 }}>
          <div style={{ height: 3, background: "#0f1623", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 2,
              width: `${Math.min((totalRam / 4096) * 100, 100)}%`,
              background: "linear-gradient(90deg, #6366f1, #06b6d4)",
              transition: "width 0.6s ease",
            }} />
          </div>
          {suspendedRam > 0 && (
            <div style={{ marginTop: 4, fontSize: 9, color: "#4ade80", fontFamily: "'DM Mono', monospace" }}>
              ↓ {suspendedRam}MB freed by suspension
            </div>
          )}
        </div>
      </div>

      {/* ── NAV BAR ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", borderBottom: "1px solid #0f1623" }}>
        {nav.map(n => (
          <button key={n.id} onClick={() => setActiveView(n.id)} style={{
            flex: 1, padding: "8px 4px", border: "none", cursor: "pointer",
            background: activeView === n.id ? "#111827" : "transparent",
            color: activeView === n.id ? "#e2e8f0" : "#3d4f6e",
            fontSize: 9, fontFamily: "'DM Mono', monospace",
            borderBottom: activeView === n.id ? "2px solid #6366f1" : "2px solid transparent",
            transition: "all 0.2s",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          }}>
            <span style={{ fontSize: 14 }}>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </div>

      {/* ── CONTENT AREA ────────────────────────────────────────── */}
      <div style={{ height: 380, overflowY: "auto" }} className="tabwise-scroll">

        {/* ══ TABS VIEW ══════════════════════════════════════════ */}
        {activeView === "tabs" && (
          <div>
            {Object.entries(domainMap).map(([domain, tabs]) => {
              const hasDupes = tabs.length > 1;
              const isExpanded = expandedDomain === domain;
              const primaryTab = tabs[0];
              const isSuspended = suspended.includes(primaryTab.id);

              return (
                <div key={domain}>
                  {/* Domain row */}
                  <div
                    onClick={() => {
                      if (hasDupes) {
                        setExpandedDomain(isExpanded ? null : domain);
                      } else {
                        // LIVE: replace with chrome.tabs.update(primaryTab.id, { active: true })
                        setActiveTab(primaryTab.id);
                        showToast(`Jumped to ${domain}`);
                      }
                    }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 14px", cursor: "pointer",
                      background: activeTab === primaryTab.id ? "rgba(99,102,241,0.06)" : "transparent",
                      borderLeft: activeTab === primaryTab.id ? "2px solid #6366f1" : "2px solid transparent",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                    onMouseLeave={e => e.currentTarget.style.background = activeTab === primaryTab.id ? "rgba(99,102,241,0.06)" : "transparent"}
                  >
                    <span style={{ fontSize: 14, filter: isSuspended ? "grayscale(1) opacity(0.4)" : "none" }}>
                      {primaryTab.favicon}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{
                          fontSize: 12, color: isSuspended ? "#2d3748" : "#cbd5e0", fontWeight: 500,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160,
                        }}>
                          {domain}
                        </span>
                        {hasDupes && (
                          <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: "rgba(245,200,66,0.12)", color: "#f5c842", fontFamily: "'DM Mono', monospace" }}>
                            ×{tabs.length}
                          </span>
                        )}
                        {isSuspended && (
                          <span style={{ fontSize: 9, color: "#2d3748", fontFamily: "'DM Mono', monospace" }}>SUSPENDED</span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                        <DustBar age={primaryTab.age} />
                        <RamBadge ram={primaryTab.ram} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          // LIVE: replace with chrome.runtime.sendMessage({ type: isSuspended ? 'RESTORE_TAB' : 'SUSPEND_TAB', tabId: primaryTab.id })
                          setSuspended(p => isSuspended ? p.filter(x => x !== primaryTab.id) : [...p, primaryTab.id]);
                          showToast(isSuspended ? "Tab restored" : "Tab suspended");
                        }}
                        style={{ fontSize: 10, padding: "3px 7px", borderRadius: 5, border: "1px solid #1a2236", background: "transparent", color: "#3d4f6e", cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
                        {isSuspended ? "↑" : "⊘"}
                      </button>
                      {hasDupes && <span style={{ color: "#3d4f6e", fontSize: 10 }}>{isExpanded ? "▴" : "▾"}</span>}
                    </div>
                  </div>

                  {/* Duplicate dropdown */}
                  {hasDupes && isExpanded && (
                    <div style={{ background: "#080c14", borderTop: "1px solid #0f1623", borderBottom: "1px solid #0f1623" }}>
                      {tabs.map((t, i) => (
                        <div
                          key={t.id}
                          onClick={() => {
                            // LIVE: chrome.tabs.update(t.id, { active: true })
                            setActiveTab(t.id);
                            showToast("Jumped to tab");
                          }}
                          style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px 6px 30px", cursor: "pointer", borderLeft: "2px solid #1a2236" }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <span style={{ color: "#3d4f6e", fontFamily: "'DM Mono', monospace", fontSize: 9 }}>#{i + 1}</span>
                          <span style={{ fontSize: 11, color: "#718096", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{t.title}</span>
                          <DustBar age={t.age} />
                        </div>
                      ))}
                      <div style={{ padding: "6px 14px 6px 30px", display: "flex", gap: 8 }}>
                        <button
                          onClick={() => {
                            // LIVE: tabs.slice(1).forEach(t => chrome.tabs.remove(t.id))
                            showToast("Duplicate tabs closed");
                          }}
                          style={{ fontSize: 9, padding: "3px 8px", borderRadius: 5, border: "1px solid rgba(255,107,53,0.2)", background: "rgba(255,107,53,0.06)", color: "#ff6b35", cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
                          CLOSE DUPES
                        </button>
                        <button
                          onClick={() => showToast("Kept newest tab")}
                          style={{ fontSize: 9, padding: "3px 8px", borderRadius: 5, border: "1px solid #1a2236", background: "transparent", color: "#4a5568", cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
                          KEEP NEWEST
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ══ CLUSTERS VIEW ══════════════════════════════════════ */}
        {activeView === "clusters" && (
          <div style={{ padding: "4px 0" }}>
            <div style={{ padding: "4px 14px 10px", fontSize: 10, color: "#3d4f6e", fontFamily: "'DM Mono', monospace" }}>
              AUTO-GROUPED BY INTENT
            </div>
            {Object.entries(clusterMap).map(([cluster, tabs]) => {
              const color = clusterColors[cluster] || "#6366f1";
              const isOpen = expandedCluster === cluster;
              return (
                <div key={cluster} style={{ marginBottom: 2 }}>
                  <div
                    onClick={() => setExpandedCluster(isOpen ? null : cluster)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: color, boxShadow: `0 0 8px ${color}` }} />
                    <span style={{ flex: 1, color: "#cbd5e0", fontSize: 12, fontWeight: 500 }}>{cluster}</span>
                    <span style={{ fontSize: 9, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>{tabs.length} tabs</span>
                    <span style={{ fontSize: 9, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>
                      {tabs.reduce((a, t) => a + t.ram, 0)}MB
                    </span>
                    <span style={{ color: "#3d4f6e", fontSize: 10 }}>{isOpen ? "▴" : "▾"}</span>
                  </div>
                  {isOpen && (
                    <div style={{ background: "#080c14", borderTop: "1px solid #0f1623" }}>
                      {tabs.map(t => (
                        <div
                          key={t.id}
                          onClick={() => {
                            // LIVE: chrome.tabs.update(t.id, { active: true })
                            setActiveTab(t.id);
                            showToast("Jumped to tab");
                          }}
                          style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px 6px 28px", cursor: "pointer", borderLeft: `2px solid ${color}22` }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <span style={{ fontSize: 12 }}>{t.favicon}</span>
                          <span style={{ fontSize: 11, color: "#718096", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                          <DustBar age={t.age} />
                        </div>
                      ))}
                      <div style={{ padding: "6px 14px 8px 28px", display: "flex", gap: 6 }}>
                        <button
                          onClick={() => {
                            // LIVE: tabs.forEach(t => chrome.tabs.remove(t.id))
                            showToast(`Closed all ${cluster} tabs`);
                          }}
                          style={{ fontSize: 9, padding: "3px 8px", borderRadius: 5, border: `1px solid ${color}33`, background: `${color}11`, color: color, cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
                          CLOSE ALL
                        </button>
                        <button
                          onClick={() => {
                            // LIVE: save tabs array to chrome.storage.local under 'sessions'
                            showToast(`${cluster} cluster saved`);
                          }}
                          style={{ fontSize: 9, padding: "3px 8px", borderRadius: 5, border: "1px solid #1a2236", background: "transparent", color: "#4a5568", cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
                          SAVE SESSION
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ══ FOCUS VIEW ═════════════════════════════════════════ */}
        {activeView === "focus" && (
          <div style={{ padding: "16px 16px" }}>
            {/* PRO GATE — wrap this entire view with <PaywallGate feature="Focus Mode"> in production */}
            <div style={{ fontSize: 10, color: "#3d4f6e", fontFamily: "'DM Mono', monospace", marginBottom: 16 }}>
              FOCUS MODE — TAB BUDGET
            </div>

            <div style={{ background: "#080c14", borderRadius: 10, border: "1px solid #1a2236", padding: 16, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ color: "#718096", fontSize: 12 }}>Active Tab Limit</span>
                <span style={{ color: "#e2e8f0", fontSize: 20, fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>{focusLimit}</span>
              </div>
              <input
                type="range" min={3} max={20} value={focusLimit}
                onChange={e => {
                  setFocusLimit(+e.target.value);
                  // LIVE: chrome.storage.local.set({ focusLimit: +e.target.value })
                }}
                style={{ width: "100%", accentColor: "#6366f1", cursor: "pointer" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#2d3748", fontFamily: "'DM Mono', monospace", marginTop: 4 }}>
                <span>3 MINIMAL</span><span>20 CHAOS</span>
              </div>
            </div>

            {/* Slot indicators */}
            <div style={{ display: "flex", gap: 3, marginBottom: 12, flexWrap: "wrap" }}>
              {[...Array(Math.min(focusLimit, 20))].map((_, i) => (
                <div key={i} style={{
                  width: 14, height: 20, borderRadius: 3,
                  background: i < mockTabs.length ? (i < focusLimit ? "#6366f1" : "#ff6b35") : "#0f1623",
                  opacity: i < mockTabs.length ? 1 : 0.3,
                  transition: "all 0.3s",
                  boxShadow: i < Math.min(mockTabs.length, focusLimit) ? "0 0 5px rgba(99,102,241,0.3)" : "none",
                }} />
              ))}
            </div>

            <div style={{ fontSize: 11, color: mockTabs.length > focusLimit ? "#ff6b35" : "#4ade80", fontFamily: "'DM Mono', monospace", marginBottom: 16 }}>
              {mockTabs.length > focusLimit
                ? `⚠ ${mockTabs.length - focusLimit} tabs over budget — suspend to continue`
                : `✓ Within budget (${focusLimit - mockTabs.length} slots free)`}
            </div>

            {/* Dustiest tabs */}
            <div style={{ background: "#080c14", borderRadius: 10, border: "1px solid #1a2236", padding: 14 }}>
              <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace", marginBottom: 10 }}>
                DUSTIEST TABS (suggested for suspension)
              </div>
              {mockTabs.filter(t => t.age > 5).slice(0, 3).map(t => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 12 }}>{t.favicon}</span>
                  <span style={{ flex: 1, fontSize: 11, color: "#718096", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.domain}</span>
                  <DustBar age={t.age} />
                  <button
                    onClick={() => {
                      setSuspended(p => [...p, t.id]);
                      // LIVE: chrome.runtime.sendMessage({ type: 'SUSPEND_TAB', tabId: t.id })
                      showToast("Tab suspended");
                    }}
                    style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, border: "1px solid rgba(255,107,53,0.2)", background: "transparent", color: "#ff6b35", cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
                    SUSPEND
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ QUEUE VIEW ═════════════════════════════════════════ */}
        {activeView === "queue" && (
          <div style={{ padding: "16px 16px" }}>
            <div style={{ fontSize: 10, color: "#3d4f6e", fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>READ LATER QUEUE</div>
            <div style={{ fontSize: 10, color: "#2d3748", marginBottom: 16 }}>Tabs closed from memory · resurface at idle</div>

            {readLater.length === 0 ? (
              <div style={{ textAlign: "center", color: "#2d3748", fontSize: 12, padding: 40 }}>Queue is empty</div>
            ) : readLater.map(item => (
              <div key={item.id} style={{ background: "#080c14", borderRadius: 8, border: "1px solid #1a2236", padding: 12, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: "#cbd5e0", fontWeight: 500, marginBottom: 3 }}>{item.title}</div>
                    <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>{item.domain}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginLeft: 10 }}>
                    <button
                      onClick={() => {
                        // LIVE: chrome.tabs.create({ url: item.url })
                        showToast("Opening tab…");
                      }}
                      style={{ fontSize: 9, padding: "3px 8px", borderRadius: 5, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)", color: "#6366f1", cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
                      OPEN
                    </button>
                    <button
                      onClick={() => {
                        setReadLater(p => p.filter(x => x.id !== item.id));
                        // LIVE: update chrome.storage.local 'readLaterQueue'
                        showToast("Removed");
                      }}
                      style={{ fontSize: 9, padding: "3px 8px", borderRadius: 5, border: "1px solid #1a2236", background: "transparent", color: "#4a5568", cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
                      ✕
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: 9, color: "#2d3748", marginTop: 8, fontFamily: "'DM Mono', monospace" }}>Saved {item.saved}</div>
              </div>
            ))}

            <button
              onClick={() => {
                // LIVE:
                // chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
                //   const item = { id: tab.id, title: tab.title, url: tab.url, domain: new URL(tab.url).hostname, saved: 'just now' }
                //   chrome.storage.local.get('readLaterQueue', ({ readLaterQueue = [] }) => {
                //     chrome.storage.local.set({ readLaterQueue: [...readLaterQueue, item] })
                //   })
                //   chrome.tabs.remove(tab.id)
                // })
                setReadLater(p => [...p, { id: Date.now(), title: "Current Tab Title", domain: "example.com", saved: "just now" }]);
                showToast("Added to queue");
              }}
              style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px dashed #1a2236", background: "transparent", color: "#3d4f6e", cursor: "pointer", fontSize: 11, fontFamily: "'DM Mono', monospace", marginTop: 4 }}>
              + SOFT CLOSE CURRENT TAB
            </button>
          </div>
        )}

        {/* ══ REPORT VIEW ════════════════════════════════════════ */}
        {activeView === "report" && (
          <div style={{ padding: "16px 16px" }}>
            {/* PRO GATE — wrap this entire view with <PaywallGate feature="Weekly Report"> in production */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: "#3d4f6e", fontFamily: "'DM Mono', monospace" }}>WEEKLY REPORT</div>
                <div style={{ fontSize: 9, color: "#2d3748", fontFamily: "'DM Mono', monospace" }}>LOCAL ONLY · NO DATA LEAVES YOUR BROWSER</div>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} />
            </div>

            {/* 2x2 stat grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              {[
                { label: "TABS OPENED",    value: weeklyStats.opened,   sub: "this week" },
                { label: "TABS REVISITED", value: weeklyStats.revisited, sub: `${Math.round(weeklyStats.revisited / weeklyStats.opened * 100)}% revisit rate` },
                { label: "RAM FREED",      value: weeklyStats.ramSaved, sub: "via suspension" },
                { label: "AVG TAB AGE",    value: `${weeklyStats.avgTabAge}d`, sub: "before close" },
              ].map(s => (
                <div key={s.label} style={{ background: "#080c14", borderRadius: 8, border: "1px solid #1a2236", padding: 12 }}>
                  <div style={{ fontSize: 9, color: "#4a5568", fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 22, color: "#e2e8f0", fontFamily: "'DM Mono', monospace", fontWeight: 500, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: "#2d3748", marginTop: 4 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Domain bar chart */}
            <div style={{ background: "#080c14", borderRadius: 8, border: "1px solid #1a2236", padding: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 9, color: "#4a5568", fontFamily: "'DM Mono', monospace", marginBottom: 8 }}>TOP DOMAINS</div>
              {[
                { domain: "github.com",        visits: 34, bar: 0.90 },
                { domain: "stackoverflow.com", visits: 21, bar: 0.55 },
                { domain: "notion.so",         visits: 18, bar: 0.47 },
                { domain: "youtube.com",       visits:  9, bar: 0.23 },
              ].map(d => (
                // LIVE: derive these from weeklyReport.topDomains in chrome.storage.local
                <div key={d.domain} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace", width: 110 }}>{d.domain}</span>
                  <div style={{ flex: 1, height: 4, background: "#0f1623", borderRadius: 2 }}>
                    <div style={{ width: `${d.bar * 100}%`, height: "100%", borderRadius: 2, background: "linear-gradient(90deg, #6366f1, #06b6d4)" }} />
                  </div>
                  <span style={{ fontSize: 9, color: "#3d4f6e", fontFamily: "'DM Mono', monospace", width: 20, textAlign: "right" }}>{d.visits}</span>
                </div>
              ))}
            </div>

            {/* Plain-language summary */}
            <div style={{ background: "rgba(74,222,128,0.05)", borderRadius: 8, border: "1px solid rgba(74,222,128,0.1)", padding: 12, fontSize: 11, color: "#4ade80" }}>
              🌿 You freed 4.2GB of RAM and closed 23 tabs before they went stale. Clean week.
              {/* LIVE: generate this string in background.js and store in weeklyReport.summary */}
            </div>
          </div>
        )}

      </div>{/* end content area */}

      {/* ── TOAST ───────────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
          background: "#1a2236", border: "1px solid #2d3748", borderRadius: 8,
          padding: "8px 16px", fontSize: 12, color: "#e2e8f0",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          animation: "tabwise-fadein 0.2s ease",
          zIndex: 100, whiteSpace: "nowrap",
        }}>
          {toast}
        </div>
      )}

      {/* ── GLOBAL STYLES ───────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@300;400;500&display=swap');
        @keyframes tabwise-fadein {
          from { opacity: 0; transform: translateX(-50%) translateY(6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .tabwise-scroll::-webkit-scrollbar { width: 4px; }
        .tabwise-scroll::-webkit-scrollbar-track { background: transparent; }
        .tabwise-scroll::-webkit-scrollbar-thumb { background: #1a2236; border-radius: 2px; }
        input[type=range] { accent-color: #6366f1; }
      `}</style>
    </div>
  );
}
```

---

## SECTION 02 — What "// LIVE:" Comments Mean

Every `// LIVE:` comment in the UI above marks a mock action that must be swapped for a real Chrome API call. Here is the complete map:

| Mock action | Chrome API replacement |
|---|---|
| `setActiveTab(id)` | `chrome.tabs.update(id, { active: true })` |
| `setSuspended(p => [...p, id])` | `chrome.runtime.sendMessage({ type: 'SUSPEND_TAB', tabId: id })` |
| `setSuspended(p => p.filter...)` | `chrome.runtime.sendMessage({ type: 'RESTORE_TAB', tabId: id })` |
| `setReadLater(p => p.filter...)` on OPEN | `chrome.tabs.create({ url: item.url })` then remove from storage |
| Soft Close button | `chrome.tabs.query` → save to storage → `chrome.tabs.remove` |
| CLOSE DUPES | `tabs.slice(1).forEach(t => chrome.tabs.remove(t.id))` |
| CLOSE ALL cluster | `tabs.forEach(t => chrome.tabs.remove(t.id))` |
| SAVE SESSION cluster | `chrome.storage.local.set({ sessions: [...sessions, { name: cluster, tabs }] })` |
| Focus slider onChange | `chrome.storage.local.set({ focusLimit: value })` |
| `mockTabs` data | Output of `useTabs()` hook (see Section 03) |
| `readLaterItems` data | `chrome.storage.local.get('readLaterQueue')` |
| `weeklyStats` data | `chrome.storage.local.get('weeklyReport')` |

---

## SECTION 03 — Live Data Hooks

### `src/popup/hooks/useTabs.js`

Replaces `mockTabs`. Returns an array of tab objects in the same shape the UI expects.

```js
import { useState, useEffect } from 'react'

// Days since a timestamp
function daysSince(ts) {
  return Math.floor((Date.now() - ts) / 86400000)
}

// Infer cluster from URL + title
function detectCluster(tab) {
  const u = (tab.url || '').toLowerCase()
  const t = (tab.title || '').toLowerCase()
  if (/github|notion|linear|jira|figma|slack|docs\.google/.test(u)) return 'Work'
  if (/amazon|ebay|etsy|shop|store|cart/.test(u)) return 'Shopping'
  if (/youtube|netflix|spotify|twitch|twitter|x\.com/.test(u)) return 'Entertainment'
  if (/stackoverflow|wikipedia|arxiv|reddit|medium|news|dev\.to/.test(u)) return 'Research'
  return 'Research'
}

// Get favicon URL from tab
function faviconUrl(tab) {
  return tab.favIconUrl || `https://www.google.com/s2/favicons?domain=${new URL(tab.url || 'https://example.com').hostname}&sz=32`
}

export function useTabs() {
  const [tabs, setTabs] = useState([])
  const [registry, setRegistry] = useState({})

  async function loadTabs() {
    const [chromeTabs, { tabRegistry = {} }] = await Promise.all([
      chrome.tabs.query({}),
      chrome.storage.local.get('tabRegistry'),
    ])

    const enriched = chromeTabs.map(tab => {
      const meta = tabRegistry[tab.id] || {}
      return {
        id:        tab.id,
        domain:    new URL(tab.url || 'https://example.com').hostname,
        title:     tab.title || tab.url,
        favicon:   faviconUrl(tab),
        age:       daysSince(meta.createdAt || Date.now()),
        cluster:   meta.cluster || detectCluster(tab),
        ram:       meta.ram || 0,           // populated by background.js
        visited:   meta.lastVisited > (Date.now() - 86400000),
        suspended: meta.suspended || false,
      }
    })

    setTabs(enriched)
    setRegistry(tabRegistry)
  }

  useEffect(() => {
    loadTabs()
    // Re-load when tabs change
    chrome.tabs.onUpdated.addListener(loadTabs)
    chrome.tabs.onRemoved.addListener(loadTabs)
    chrome.tabs.onCreated.addListener(loadTabs)
    return () => {
      chrome.tabs.onUpdated.removeListener(loadTabs)
      chrome.tabs.onRemoved.removeListener(loadTabs)
      chrome.tabs.onCreated.removeListener(loadTabs)
    }
  }, [])

  return tabs
}
```

### Wiring useTabs into App.jsx

Replace the `mockTabs` constant at the top of `App.jsx` with:

```jsx
import { useTabs } from './hooks/useTabs'

// Inside TabOptimizer():
const tabs = useTabs()            // ← replaces const mockTabs = [...]
// then replace every reference to mockTabs with tabs
```

### `src/popup/hooks/useStorage.js`

```js
import { useState, useEffect } from 'react'

export function useStorage(key, defaultValue) {
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    chrome.storage.local.get(key, result => {
      if (result[key] !== undefined) setValue(result[key])
    })
    const listener = (changes) => {
      if (changes[key]) setValue(changes[key].newValue)
    }
    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }, [key])

  function set(newValue) {
    setValue(newValue)
    chrome.storage.local.set({ [key]: newValue })
  }

  return [value, set]
}
```

Usage example in `FocusView` slider:

```jsx
const [focusLimit, setFocusLimit] = useStorage('focusLimit', 8)
```

### `src/popup/hooks/usePaywall.js`

```js
import { useState, useEffect } from 'react'

export function usePaywall() {
  const [tier, setTier] = useState('free')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    chrome.storage.local.get('userTier', result => {
      setTier(result.userTier || 'free')
      setLoading(false)
    })
  }, [])

  const isPro = tier === 'pro'

  function triggerUpgrade(plan = 'monthly') {
    // plan: 'monthly' | 'yearly'
    chrome.runtime.sendMessage({ type: 'OPEN_PAYMENT', plan })
  }

  return { tier, isPro, loading, triggerUpgrade }
}
```

---

## SECTION 04 — background.js (Service Worker)

Create `src/background.js`. This is the brain. The popup reads from storage; the background writes to it.

```js
// src/background.js
import { extpay } from 'extensionpay'

const extPay = extpay('YOUR_EXTENSIONPAY_EXTENSION_ID')
extPay.startBackground()

// ── Tab Registry ────────────────────────────────────────────────
async function getRegistry() {
  const { tabRegistry = {} } = await chrome.storage.local.get('tabRegistry')
  return tabRegistry
}

async function saveRegistry(registry) {
  await chrome.storage.local.set({ tabRegistry: registry })
}

function detectCluster(tab) {
  const u = (tab.url || '').toLowerCase()
  if (/github|notion|linear|jira|figma|slack|docs\.google/.test(u)) return 'Work'
  if (/amazon|ebay|etsy|shop|store|cart/.test(u)) return 'Shopping'
  if (/youtube|netflix|spotify|twitch|twitter|x\.com/.test(u)) return 'Entertainment'
  return 'Research'
}

chrome.tabs.onCreated.addListener(async tab => {
  const registry = await getRegistry()
  registry[tab.id] = {
    createdAt:   Date.now(),
    lastVisited: Date.now(),
    cluster:     detectCluster(tab),
    openerTabId: tab.openerTabId || null,
    suspended:   false,
    ram:         0,
    url:         tab.url,
  }
  await saveRegistry(registry)
})

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const registry = await getRegistry()
  if (registry[tabId]) {
    registry[tabId].lastVisited = Date.now()
    registry[tabId].visitCount = (registry[tabId].visitCount || 0) + 1
  }
  await saveRegistry(registry)
})

chrome.tabs.onRemoved.addListener(async tabId => {
  const registry = await getRegistry()
  delete registry[tabId]
  await saveRegistry(registry)
})

// ── Tab Suspension ───────────────────────────────────────────────
async function suspendTab(tabId) {
  const [tab] = await chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT })
  const target = await chrome.tabs.get(tabId)
  const registry = await getRegistry()
  if (registry[tabId]) {
    registry[tabId].suspended = true
    registry[tabId].suspendedUrl = target.url
    await saveRegistry(registry)
  }
  const suspendUrl = chrome.runtime.getURL('suspended.html') + `?title=${encodeURIComponent(target.title)}&url=${encodeURIComponent(target.url)}`
  await chrome.tabs.update(tabId, { url: suspendUrl })
}

async function restoreTab(tabId) {
  const registry = await getRegistry()
  const meta = registry[tabId]
  if (meta && meta.suspendedUrl) {
    await chrome.tabs.update(tabId, { url: meta.suspendedUrl })
    registry[tabId].suspended = false
    delete registry[tabId].suspendedUrl
    await saveRegistry(registry)
  }
}

// ── Message Handler ──────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'SUSPEND_TAB')  suspendTab(msg.tabId).then(() => sendResponse({ ok: true }))
  if (msg.type === 'RESTORE_TAB')  restoreTab(msg.tabId).then(() => sendResponse({ ok: true }))
  if (msg.type === 'OPEN_PAYMENT') {
    extPay.openPaymentPage()
    sendResponse({ ok: true })
  }
  return true // keep channel open for async
})

// ── Weekly Report Alarm ──────────────────────────────────────────
chrome.alarms.create('weeklyReport', {
  when: nextSunday2359(),
  periodInMinutes: 60 * 24 * 7,
})

function nextSunday2359() {
  const now = new Date()
  const day = now.getDay()
  const daysUntilSunday = (7 - day) % 7 || 7
  const sunday = new Date(now)
  sunday.setDate(now.getDate() + daysUntilSunday)
  sunday.setHours(23, 59, 0, 0)
  return sunday.getTime()
}

chrome.alarms.onAlarm.addListener(async alarm => {
  if (alarm.name !== 'weeklyReport') return
  const registry = await getRegistry()
  const entries = Object.values(registry)
  const weekAgo = Date.now() - 7 * 86400000

  const opened = entries.filter(e => e.createdAt > weekAgo).length
  const revisited = entries.filter(e => (e.visitCount || 0) > 1 && e.createdAt > weekAgo).length
  const suspendedCount = entries.filter(e => e.suspended).length
  const avgAge = entries.length
    ? Math.round(entries.reduce((a, e) => a + (Date.now() - e.createdAt) / 86400000, 0) / entries.length * 10) / 10
    : 0

  const domainCounts = {}
  entries.forEach(e => {
    if (!e.url) return
    try {
      const domain = new URL(e.url).hostname
      domainCounts[domain] = (domainCounts[domain] || 0) + (e.visitCount || 1)
    } catch {}
  })
  const topDomains = Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([domain, visits]) => ({ domain, visits }))

  await chrome.storage.local.set({
    weeklyReport: {
      opened, revisited, suspendedCount, avgAge, topDomains,
      ramSaved: `${(suspendedCount * 180 / 1024).toFixed(1)} GB`,
      summary: `You opened ${opened} tabs and revisited ${revisited} of them. ${suspendedCount} tabs freed RAM this week.`,
      generatedAt: Date.now(),
    }
  })
})

// ── Payment Status ───────────────────────────────────────────────
extPay.onPaid.addListener(async user => {
  await chrome.storage.local.set({ userTier: 'pro' })
})

async function checkPaymentStatus() {
  try {
    const user = await extPay.getUser()
    const tier = user.paid ? 'pro' : 'free'
    await chrome.storage.local.set({ userTier: tier })
    return tier
  } catch {
    return 'free'
  }
}

checkPaymentStatus()
```

---

## SECTION 05 — Paywall Gate Component

Create this component and wrap Pro-gated views with it.

```jsx
// src/popup/components/PaywallGate.jsx
import { usePaywall } from '../hooks/usePaywall'

const plans = [
  { id: 'monthly', label: 'Monthly',    price: '$3.99/mo',  note: '' },
  { id: 'yearly',  label: 'Yearly',     price: '$29.99/yr', note: 'BEST VALUE — save 37%' },
]

export function PaywallGate({ feature, children }) {
  const { isPro, loading, triggerUpgrade } = usePaywall()
  if (loading) return null
  if (isPro) return children

  return (
    <div style={{ padding: 16 }}>
      <div style={{ background: "#080c14", borderRadius: 12, border: "1px solid #1a2236", padding: 20, textAlign: "center" }}>
        <div style={{ fontSize: 24, marginBottom: 10 }}>◎</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 6 }}>{feature}</div>
        <div style={{ fontSize: 11, color: "#4a5568", marginBottom: 20, lineHeight: 1.5 }}>
          This feature is part of TABWISE Pro.
        </div>
        {plans.map(plan => (
          <button
            key={plan.id}
            onClick={() => triggerUpgrade(plan.id)}
            style={{
              display: "block", width: "100%", marginBottom: 8,
              padding: "10px 16px", borderRadius: 8, cursor: "pointer",
              background: plan.id === 'yearly' ? "#6366f1" : "transparent",
              border: plan.id === 'yearly' ? "none" : "1px solid #1a2236",
              color: plan.id === 'yearly' ? "#fff" : "#718096",
              fontSize: 12, fontFamily: "'DM Sans', sans-serif",
            }}>
            <span style={{ fontWeight: 600 }}>{plan.price}</span>
            {plan.note ? <span style={{ fontSize: 10, marginLeft: 8, opacity: 0.8 }}>{plan.note}</span> : null}
          </button>
        ))}
      </div>
    </div>
  )
}
```

### Usage in FocusView and ReportView

```jsx
// Wrap the Pro view content:
return (
  <PaywallGate feature="Focus Mode">
    {/* existing Focus view JSX */}
  </PaywallGate>
)
```

---

## SECTION 06 — manifest.json

```json
{
  "manifest_version": 3,
  "name": "TABWISE — Smart Tab Optimizer",
  "version": "1.0.0",
  "description": "Intelligent tab management with RAM saving, clustering, focus mode, and a local-only weekly report.",
  "permissions": ["tabs", "storage", "idle", "alarms", "scripting"],
  "host_permissions": ["<all_urls>"],
  "action": {
    "default_popup": "index.html",
    "default_icon": {
      "16":  "icons/icon16.png",
      "48":  "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "background": {
    "service_worker": "src/background.js",
    "type": "module"
  },
  "icons": {
    "16":  "icons/icon16.png",
    "48":  "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "externally_connectable": {
    "matches": ["https://extensionpay.com/*"]
  }
}
```

---

## SECTION 07 — index.html (Popup Entry Point)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=360" />
  <link
    href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@300;400;500&display=swap"
    rel="stylesheet"
  />
  <title>TABWISE</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { width: 360px; min-height: 480px; overflow: hidden; background: #080c14; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/popup/main.jsx"></script>
</body>
</html>
```

### `src/popup/main.jsx`

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import TabOptimizer from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TabOptimizer />
  </React.StrictMode>
)
```

---

## SECTION 08 — vite.config.js

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  build: {
    rollupOptions: {
      input: { popup: 'index.html' },
    },
  },
})
```

---

## SECTION 09 — Project Folder Layout

```
tabwise-extension/
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── src/
│   ├── background.js
│   └── popup/
│       ├── main.jsx
│       ├── App.jsx               ← THE APPROVED UI (Section 01)
│       ├── hooks/
│       │   ├── useTabs.js
│       │   ├── useStorage.js
│       │   └── usePaywall.js
│       └── components/
│           └── PaywallGate.jsx
├── suspended.html                ← Simple placeholder for suspended tabs
├── manifest.json
├── vite.config.js
├── index.html
└── package.json
```

### `suspended.html` — Suspension Placeholder

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { background: #080c14; color: #4a5568; font-family: 'DM Sans', sans-serif;
           display: flex; align-items: center; justify-content: center; height: 100vh; }
    .card { text-align: center; }
    h2 { color: #cbd5e0; font-size: 18px; margin-bottom: 8px; }
    p  { font-size: 13px; margin-bottom: 20px; }
    button { background: #6366f1; color: #fff; border: none; padding: 10px 24px;
             border-radius: 8px; cursor: pointer; font-size: 13px; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size:32px;margin-bottom:12px">⊘</div>
    <h2 id="title">Tab Suspended</h2>
    <p>This tab is sleeping to save RAM.</p>
    <button onclick="restore()">Restore Tab</button>
  </div>
  <script>
    const params = new URLSearchParams(location.search)
    document.getElementById('title').textContent = params.get('title') || 'Tab Suspended'
    function restore() {
      const url = params.get('url')
      if (url) location.href = url
    }
  </script>
</body>
</html>
```

---

## SECTION 10 — Setup Commands (Run in Order)

```bash
# 1. Scaffold
mkdir tabwise-extension && cd tabwise-extension
npm create vite@latest . -- --template react
npm install

# 2. Extension build tooling
npm install -D @crxjs/vite-plugin

# 3. Payments
npm install extensionpay

# 4. Dev server
npm run dev

# 5. Load in Chrome
# → chrome://extensions → Developer mode ON → Load unpacked → select dist/

# 6. Production build
npm run build
cd dist && zip -r ../tabwise-v1.0.zip . && cd ..
```

---

## SECTION 11 — Monetization Tier Reference

| Feature | Free | Pro Monthly ($3.99/mo) | Pro Yearly ($29.99/yr) |
|---|---|---|---|
| Tab list + jump | ✓ | ✓ | ✓ |
| Duplicate detection | ✓ | ✓ | ✓ |
| Tab Dust bars | ✓ | ✓ | ✓ |
| RAM display | ✓ | ✓ | ✓ |
| RAM Saver (suspension) | Up to 5 tabs | Unlimited | Unlimited |
| Auto-clustering (view) | ✓ | ✓ | ✓ |
| Cluster actions (close/save) | ✗ | ✓ | ✓ |
| Focus Mode / Tab Budget | ✗ | ✓ | ✓ |
| Read Later Queue | 5 items max | Unlimited | Unlimited |
| Weekly Report | ✗ | ✓ | ✓ |
| Session Save & Restore | ✗ | ✓ | ✓ |

Pro gates are enforced by wrapping views with `<PaywallGate>` (see Section 05).  
ExtensionPay handles Stripe checkout — call `extPay.openPaymentPage()` from the background on `OPEN_PAYMENT` message.

---

*TABWISE Build Guide — UI wired to build flow — ExtensionPay + Stripe — VSCode + GitHub Copilot*
