
import { useState, useEffect } from "react";

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

const clusterColors = {
  Work: "#6366f1",
  Research: "#06b6d4",
  Shopping: "#f59e0b",
  Entertainment: "#ec4899",
  Reading: "#8b5cf6",
};

export default function TabOptimizer() {
  const [activeView, setActiveView] = useState("tabs");
  const [expandedDomain, setExpandedDomain] = useState(null);
  const [expandedCluster, setExpandedCluster] = useState(null);
  const [focusLimit, setFocusLimit] = useState(8);
  const [suspended, setSuspended] = useState([]);
  const [readLater, setReadLater] = useState(readLaterItems);
  const [showReport, setShowReport] = useState(false);
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
    { id: "tabs", icon: "⬚", label: "Tabs" },
    { id: "clusters", icon: "◈", label: "Clusters" },
    { id: "focus", icon: "◎", label: "Focus" },
    { id: "queue", icon: "⊞", label: "Queue" },
    { id: "report", icon: "⊡", label: "Report" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080c14",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      padding: 40,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />

      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>

        {/* Extension name */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg, #6366f1, #06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, boxShadow: "0 0 20px rgba(99,102,241,0.4)",
          }}>⬡</div>
          <span style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 600, letterSpacing: "0.04em" }}>TABWISE</span>
          <span style={{ color: "#2d3748", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>v0.1</span>
        </div>

        {/* Main popup shell */}
        <div style={{
          width: 360,
          background: "#0d1117",
          borderRadius: 16,
          border: "1px solid #1a2236",
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.08)",
        }}>

          {/* Header bar */}
          <div style={{
            padding: "14px 16px 10px",
            borderBottom: "1px solid #0f1623",
            background: "linear-gradient(180deg, #111827, #0d1117)",
          }}>
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
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: ramSaverOn ? "#4ade80" : "#4a5568", display: "inline-block", boxShadow: ramSaverOn ? "0 0 6px #4ade80" : "none" }} />
                RAM SAVER
              </button>
            </div>

            {/* RAM bar */}
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

          {/* Nav */}
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

          {/* Content area */}
          <div style={{ height: 380, overflowY: "auto", padding: "8px 0" }} className="scroll">

            {/* ——— TABS VIEW ——— */}
            {activeView === "tabs" && (
              <div>
                {Object.entries(domainMap).map(([domain, tabs]) => {
                  const hasDupes = tabs.length > 1;
                  const isExpanded = expandedDomain === domain;
                  const primaryTab = tabs[0];
                  const isSuspended = suspended.includes(primaryTab.id);

                  return (
                    <div key={domain}>
                      <div
                        onClick={() => {
                          if (hasDupes) setExpandedDomain(isExpanded ? null : domain);
                          else { setActiveTab(primaryTab.id); showToast(`Jumped to ${domain}`); }
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
                        <span style={{ fontSize: 14, filter: isSuspended ? "grayscale(1) opacity(0.4)" : "none" }}>{primaryTab.favicon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 12, color: isSuspended ? "#2d3748" : "#cbd5e0", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
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
                          <button onClick={e => { e.stopPropagation(); setSuspended(p => isSuspended ? p.filter(x => x !== primaryTab.id) : [...p, primaryTab.id]); showToast(isSuspended ? "Tab restored" : "Tab suspended"); }}
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
                            <div key={t.id} onClick={() => { setActiveTab(t.id); showToast(`Jumped to tab`); }}
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
                            <button onClick={() => showToast("Duplicate tabs closed")}
                              style={{ fontSize: 9, padding: "3px 8px", borderRadius: 5, border: "1px solid rgba(255,107,53,0.2)", background: "rgba(255,107,53,0.06)", color: "#ff6b35", cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
                              CLOSE DUPES
                            </button>
                            <button onClick={() => showToast("Kept newest tab")}
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

            {/* ——— CLUSTERS VIEW ——— */}
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
                      <div onClick={() => setExpandedCluster(isOpen ? null : cluster)}
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
                            <div key={t.id} onClick={() => { setActiveTab(t.id); showToast("Jumped to tab"); }}
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
                            <button onClick={() => showToast(`Closed all ${cluster} tabs`)}
                              style={{ fontSize: 9, padding: "3px 8px", borderRadius: 5, border: `1px solid ${color}33`, background: `${color}11`, color: color, cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
                              CLOSE ALL
                            </button>
                            <button onClick={() => showToast(`${cluster} cluster saved`)}
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

            {/* ——— FOCUS VIEW ——— */}
            {activeView === "focus" && (
              <div style={{ padding: "16px 16px" }}>
                <div style={{ fontSize: 10, color: "#3d4f6e", fontFamily: "'DM Mono', monospace", marginBottom: 16 }}>FOCUS MODE — TAB BUDGET</div>

                <div style={{ background: "#080c14", borderRadius: 10, border: "1px solid #1a2236", padding: 16, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ color: "#718096", fontSize: 12 }}>Active Tab Limit</span>
                    <span style={{ color: "#e2e8f0", fontSize: 20, fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>{focusLimit}</span>
                  </div>
                  <input type="range" min={3} max={20} value={focusLimit} onChange={e => setFocusLimit(+e.target.value)}
                    style={{ width: "100%", accentColor: "#6366f1", cursor: "pointer" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#2d3748", fontFamily: "'DM Mono', monospace", marginTop: 4 }}>
                    <span>3 MINIMAL</span><span>20 CHAOS</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  {[...Array(Math.min(focusLimit, 16))].map((_, i) => (
                    <div key={i} style={{
                      flex: 1, height: 24, borderRadius: 4,
                      background: i < mockTabs.length ? (i < focusLimit ? "#6366f1" : "#ff6b35") : "#0f1623",
                      opacity: i < mockTabs.length ? 1 : 0.3,
                      transition: "all 0.3s",
                      boxShadow: i < Math.min(mockTabs.length, focusLimit) ? "0 0 6px rgba(99,102,241,0.3)" : "none",
                    }} />
                  ))}
                </div>

                <div style={{ fontSize: 11, color: mockTabs.length > focusLimit ? "#ff6b35" : "#4ade80", fontFamily: "'DM Mono', monospace", marginBottom: 16 }}>
                  {mockTabs.length > focusLimit
                    ? `⚠ ${mockTabs.length - focusLimit} tabs over budget — suspend to continue`
                    : `✓ Within budget (${focusLimit - mockTabs.length} slots free)`}
                </div>

                <div style={{ background: "#080c14", borderRadius: 10, border: "1px solid #1a2236", padding: 14 }}>
                  <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace", marginBottom: 10 }}>DUSTIEST TABS (suggested for suspension)</div>
                  {mockTabs.filter(t => t.age > 5).slice(0, 3).map(t => (
                    <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 12 }}>{t.favicon}</span>
                      <span style={{ flex: 1, fontSize: 11, color: "#718096", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.domain}</span>
                      <DustBar age={t.age} />
                      <button onClick={() => { setSuspended(p => [...p, t.id]); showToast("Tab suspended"); }}
                        style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, border: "1px solid rgba(255,107,53,0.2)", background: "transparent", color: "#ff6b35", cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
                        SUSPEND
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ——— QUEUE VIEW ——— */}
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
                        <button onClick={() => { showToast("Opening tab…"); }}
                          style={{ fontSize: 9, padding: "3px 8px", borderRadius: 5, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)", color: "#6366f1", cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
                          OPEN
                        </button>
                        <button onClick={() => { setReadLater(p => p.filter(x => x.id !== item.id)); showToast("Removed"); }}
                          style={{ fontSize: 9, padding: "3px 8px", borderRadius: 5, border: "1px solid #1a2236", background: "transparent", color: "#4a5568", cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
                          ✕
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: 9, color: "#2d3748", marginTop: 8, fontFamily: "'DM Mono', monospace" }}>Saved {item.saved}</div>
                  </div>
                ))}

                <button onClick={() => { setReadLater(p => [...p, { id: Date.now(), title: "Current Tab Title", domain: "example.com", saved: "just now" }]); showToast("Added to queue"); }}
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px dashed #1a2236", background: "transparent", color: "#3d4f6e", cursor: "pointer", fontSize: 11, fontFamily: "'DM Mono', monospace", marginTop: 4 }}>
                  + SOFT CLOSE CURRENT TAB
                </button>
              </div>
            )}

            {/* ——— REPORT VIEW ——— */}
            {activeView === "report" && (
              <div style={{ padding: "16px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#3d4f6e", fontFamily: "'DM Mono', monospace" }}>WEEKLY REPORT</div>
                    <div style={{ fontSize: 9, color: "#2d3748", fontFamily: "'DM Mono', monospace" }}>MAR 3 — MAR 10, 2025 · LOCAL ONLY</div>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                  {[
                    { label: "TABS OPENED", value: weeklyStats.opened, sub: "this week" },
                    { label: "TABS REVISITED", value: weeklyStats.revisited, sub: `${Math.round(weeklyStats.revisited / weeklyStats.opened * 100)}% revisit rate` },
                    { label: "RAM FREED", value: weeklyStats.ramSaved, sub: "via suspension" },
                    { label: "AVG TAB AGE", value: `${weeklyStats.avgTabAge}d`, sub: "before close" },
                  ].map(s => (
                    <div key={s.label} style={{ background: "#080c14", borderRadius: 8, border: "1px solid #1a2236", padding: 12 }}>
                      <div style={{ fontSize: 9, color: "#4a5568", fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 22, color: "#e2e8f0", fontFamily: "'DM Mono', monospace", fontWeight: 500, lineHeight: 1 }}>{s.value}</div>
                      <div style={{ fontSize: 9, color: "#2d3748", marginTop: 4 }}>{s.sub}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background: "#080c14", borderRadius: 8, border: "1px solid #1a2236", padding: 12, marginBottom: 8 }}>
                  <div style={{ fontSize: 9, color: "#4a5568", fontFamily: "'DM Mono', monospace", marginBottom: 8 }}>TOP DOMAINS</div>
                  {[
                    { domain: "github.com", visits: 34, bar: 0.9 },
                    { domain: "stackoverflow.com", visits: 21, bar: 0.55 },
                    { domain: "notion.so", visits: 18, bar: 0.47 },
                    { domain: "youtube.com", visits: 9, bar: 0.23 },
                  ].map(d => (
                    <div key={d.domain} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace", width: 110 }}>{d.domain}</span>
                      <div style={{ flex: 1, height: 4, background: "#0f1623", borderRadius: 2 }}>
                        <div style={{ width: `${d.bar * 100}%`, height: "100%", borderRadius: 2, background: "linear-gradient(90deg, #6366f1, #06b6d4)" }} />
                      </div>
                      <span style={{ fontSize: 9, color: "#3d4f6e", fontFamily: "'DM Mono', monospace", width: 20, textAlign: "right" }}>{d.visits}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: "rgba(74,222,128,0.05)", borderRadius: 8, border: "1px solid rgba(74,222,128,0.1)", padding: 12, fontSize: 11, color: "#4ade80" }}>
                  🌿 You freed 4.2GB of RAM and closed 23 tabs before they went stale. Clean week.
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div style={{
            position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
            background: "#1a2236", border: "1px solid #2d3748", borderRadius: 8,
            padding: "8px 16px", fontSize: 12, color: "#e2e8f0",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            animation: "fadeIn 0.2s ease",
            zIndex: 100,
          }}>
            {toast}
          </div>
        )}

        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(6px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
          .scroll::-webkit-scrollbar { width: 4px; }
          .scroll::-webkit-scrollbar-track { background: transparent; }
          .scroll::-webkit-scrollbar-thumb { background: #1a2236; border-radius: 2px; }
        `}</style>
      </div>
    </div>
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
