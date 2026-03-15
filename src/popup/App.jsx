import { useState, useEffect } from "react";
import { useTabs } from "./hooks/useTabs";
import { useStorage } from "./hooks/useStorage";
import { usePaywall } from "./hooks/usePaywall";
import { PaywallGate } from "./components/PaywallGate";

// ─── SHARED SUB-COMPONENTS ────────────────────────────────────────────────

function DustBar({ age }) {
  const level = Math.min(age / 14, 1);
  const color = level > 0.7 ? "#ff6b35" : level > 0.4 ? "#f5c842" : "#4ade80";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 48, height: 4, background: "#1e2433", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${level * 100}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.4s ease" }} />
      </div>
      <span style={{ fontSize: 11, color: "#8fa2bf", fontFamily: "'DM Mono', monospace" }}>{age}d</span>
    </div>
  );
}

function RamBadge({ ram }) {
  const high = ram > 300;
  return (
    <span style={{
      fontSize: 11, padding: "2px 6px", borderRadius: 3,
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
      <span style={{ fontSize: 10, color: "#7f93b1", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>{label}</span>
      <span style={{ fontSize: 16, color: warn ? "#f5c842" : "#e2e8f0", fontFamily: "'DM Mono', monospace", fontWeight: 500, lineHeight: 1 }}>{value}</span>
    </div>
  );
}

function Favicon({ value, size = 14, muted = false }) {
  const isUrl = typeof value === "string" && /^https?:\/\//.test(value);
  if (isUrl) {
    return (
      <img
        src={value}
        width={size}
        height={size}
        alt=""
        style={{
          width: size,
          height: size,
          borderRadius: 3,
          objectFit: "cover",
          filter: muted ? "grayscale(1) opacity(0.4)" : "none",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <span style={{ fontSize: size, filter: muted ? "grayscale(1) opacity(0.4)" : "none", lineHeight: 1 }}>
      {value || "🌐"}
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

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────

export default function TabOptimizer() {
  const [activeView, setActiveView] = useState("tabs");
  const [expandedDomain, setExpandedDomain] = useState(null);
  const [expandedCluster, setExpandedCluster] = useState(null);
  const [focusLimit, setFocusLimit] = useStorage("focusLimit", 8);
  const [highContrast, setHighContrast] = useStorage("highContrastMode", false);
  const [readLater, setReadLater] = useStorage("readLaterQueue", []);
  const [recentlyClosed, setRecentlyClosed] = useStorage("recentlyClosed", []);
  const [activeTab, setActiveTab] = useState(1);
  const [ramSaverOn, setRamSaverOn] = useState(true);
  const [toast, setToast] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState({
    opened: 0,
    revisited: 0,
    ramSaved: "0 GB",
    topDomain: "—",
    suspendedCount: 0,
    avgTabAge: 0,
  });
  const {
    tier,
    isPro,
    paymentConfigured,
    triggerUpgrade,
    restorePurchase,
    manageBilling,
    refreshStatus,
  } = usePaywall();

  const tabs = useTabs();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  useEffect(() => {
    chrome.storage.local.get("weeklyReport", (result) => {
      if (result.weeklyReport) {
        setWeeklyStats(result.weeklyReport);
      }
    });
  }, []);

  // Split sleeping vs active
  const sleepingTabs = tabs.filter(t => t.suspended);
  const activeTabs = tabs.filter(t => !t.suspended);

  // Group active tabs by domain
  const domainMap = {};
  activeTabs.forEach(t => {
    if (!domainMap[t.domain]) domainMap[t.domain] = [];
    domainMap[t.domain].push(t);
  });

  // Group tabs by cluster
  const clusterMap = {};
  tabs.forEach(t => {
    if (!clusterMap[t.cluster]) clusterMap[t.cluster] = [];
    clusterMap[t.cluster].push(t);
  });

  const totalRam = tabs.reduce((a, t) => a + t.ram, 0);
  const suspendedRam = sleepingTabs.reduce((a, t) => a + t.ram, 0);
  const dustyCount = activeTabs.filter(t => t.age > 7).length;
  const dupDomains = Object.entries(domainMap).filter(([, tabList]) => tabList.length > 1);

  const nav = [
    { id: "tabs", icon: "⬚", label: "Tabs" },
    { id: "clusters", icon: "◈", label: "Clusters" },
    { id: "focus", icon: "◎", label: "Budget" },
    { id: "queue", icon: "⊞", label: "Reading" },
    { id: "report", icon: "⊡", label: "Report" },
    { id: "settings", icon: "⚙", label: "Settings" },
  ];

  return (
    <div style={{
      width: 360,
      minHeight: 480,
      background: "#080c14",
      fontFamily: "'DM Sans', sans-serif",
      position: "relative",
      overflow: "hidden",
      filter: highContrast ? "contrast(1.14) brightness(1.08)" : "none",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* HEADER */}
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
          <span style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600, letterSpacing: "0.04em" }}>TABWISE</span>
          <span style={{ color: "#7f93b1", fontSize: 11, fontFamily: "'DM Mono', monospace", marginLeft: 2 }}>v1.0</span>
        </div>

        {/* Stats + RAM Saver */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12 }}>
            <Stat label="TABS" value={tabs.length} />
            <Stat label="RAM" value={`${(totalRam / 1024).toFixed(1)}GB`} warn={totalRam > 2000} />
            <Stat label="DUST" value={dustyCount} warn={dustyCount > 3} />
            <Stat label="DUPES" value={dupDomains.length} warn />
          </div>
          <button
            onClick={() => { setRamSaverOn(!ramSaverOn); showToast(ramSaverOn ? "RAM Saver paused" : "RAM Saver active"); }}
            style={{
              padding: "4px 10px", borderRadius: 6, border: "none", cursor: "pointer",
              background: ramSaverOn ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.04)",
              color: ramSaverOn ? "#4ade80" : "#8fa2bf",
              fontSize: 12, fontFamily: "'DM Mono', monospace",
              transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 5,
            }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: ramSaverOn ? "#4ade80" : "#8fa2bf",
              display: "inline-block",
              boxShadow: ramSaverOn ? "0 0 6px #4ade80" : "none",
            }} />
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
            <div style={{ marginTop: 4, fontSize: 10, color: "#4ade80", fontFamily: "'DM Mono', monospace" }}>
              ↓ {suspendedRam}MB freed by suspension
            </div>
          )}
        </div>
      </div>

      {/* NAV BAR */}
      <div style={{ display: "flex", borderBottom: "1px solid #0f1623" }}>
        {nav.map(n => (
          <button key={n.id} onClick={() => setActiveView(n.id)} style={{
            flex: 1, padding: "8px 4px", border: "none", cursor: "pointer",
            background: activeView === n.id ? "#111827" : "transparent",
            color: activeView === n.id ? "#e2e8f0" : "#8ea6cb",
            fontSize: 12, fontFamily: "'DM Mono', monospace",
            borderBottom: activeView === n.id ? "2px solid #6366f1" : "2px solid transparent",
            transition: "all 0.2s",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          }}>
            <span style={{ fontSize: 15 }}>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div style={{ height: 380, overflowY: "auto" }} className="tabwise-scroll">

        {/* TABS VIEW */}
        {activeView === "tabs" && (
          <div>

            {/* SLEEPING TABS SECTION */}
            {sleepingTabs.length > 0 && (
              <div style={{ borderBottom: "1px solid #0f1623", paddingBottom: 4, marginBottom: 2 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 14px 6px",
                }}>  
                  <span style={{ fontSize: 11, color: "#4ade80", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>
                    ● SLEEPING ({sleepingTabs.length})
                  </span>
                  <span style={{ fontSize: 11, color: "#7f93b1", fontFamily: "'DM Mono', monospace" }}>
                    — {suspendedRam}MB freed
                  </span>
                </div>
                {sleepingTabs.map(t => (
                  <div key={t.id} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "7px 14px",
                    background: "rgba(74,222,128,0.03)",
                    borderLeft: "2px solid rgba(74,222,128,0.25)",
                  }}>
                    <Favicon value={t.favicon} size={14} muted />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 12, color: "#b3c1d8", fontWeight: 500,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {t.title || t.domain || "Sleeping Tab"}
                      </div>
                      <div style={{ fontSize: 11, color: "#7f93b1", fontFamily: "'DM Mono', monospace", marginTop: 1,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.domain}
                      </div>
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        chrome.runtime.sendMessage({ type: 'RESTORE_TAB', tabId: t.id });
                        showToast(`Restoring ${t.title || t.domain}…`);
                      }}
                      style={{
                        fontSize: 11, padding: "4px 10px", borderRadius: 5,
                        border: "1px solid rgba(74,222,128,0.3)",
                        background: "rgba(74,222,128,0.08)",
                        color: "#4ade80", cursor: "pointer",
                        fontFamily: "'DM Mono', monospace", flexShrink: 0,
                      }}>
                      RESTORE
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* RECENTLY CLOSED SLEEPING TABS */}
            {recentlyClosed.length > 0 && (
              <div style={{ borderBottom: "1px solid #0f1623", paddingBottom: 4, marginBottom: 2 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px 6px" }}>
                  <span style={{ fontSize: 11, color: "#f5c842", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>
                    ⚠ CLOSED WHILE SLEEPING ({recentlyClosed.length})
                  </span>
                  <button
                    onClick={() => setRecentlyClosed([])}
                    style={{ fontSize: 10, background: "transparent", border: "none", color: "#7f93b1", cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
                    CLEAR
                  </button>
                </div>
                {recentlyClosed.map(item => (
                  <div key={item.id} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "7px 14px",
                    background: "rgba(245,200,66,0.03)",
                    borderLeft: "2px solid rgba(245,200,66,0.2)",
                  }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>🌐</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 12, color: "#b3c1d8", fontWeight: 500,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {item.title || item.domain}
                      </div>
                      <div style={{ fontSize: 11, color: "#7f93b1", fontFamily: "'DM Mono', monospace", marginTop: 1 }}>
                        {item.domain}
                      </div>
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        chrome.tabs.create({ url: item.url });
                        setRecentlyClosed(prev => prev.filter(x => x.id !== item.id));
                        showToast(`Reopened ${item.title || item.domain}`);
                      }}
                      style={{
                        fontSize: 11, padding: "4px 10px", borderRadius: 5,
                        border: "1px solid rgba(245,200,66,0.25)",
                        background: "rgba(245,200,66,0.07)",
                        color: "#f5c842", cursor: "pointer",
                        fontFamily: "'DM Mono', monospace", flexShrink: 0,
                      }}>
                      REOPEN
                    </button>
                  </div>
                ))}
              </div>
            )}

            {Object.entries(domainMap).map(([domain, tabList]) => {
              const hasDupes = tabList.length > 1;
              const isExpanded = expandedDomain === domain;
              const primaryTab = tabList[0];

              return (
                <div key={domain}>
                  <div
                    onClick={() => {
                      if (hasDupes) {
                        setExpandedDomain(isExpanded ? null : domain);
                      } else {
                        chrome.tabs.update(primaryTab.id, { active: true });
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
                    <Favicon value={primaryTab.favicon} size={14} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{
                          fontSize: 12, color: "#ffffff", fontWeight: 700, opacity: 1, textShadow: "none",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160,
                        }}>
                          {primaryTab.title || domain || "Untitled Tab"}
                        </span>
                        {hasDupes && (
                          <span style={{ fontSize: 10, padding: "1px 5px", borderRadius: 3, background: "rgba(245,200,66,0.12)", color: "#f5c842", fontFamily: "'DM Mono', monospace" }}>
                            ×{tabList.length}
                          </span>
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
                          chrome.runtime.sendMessage({ type: 'SUSPEND_TAB', tabId: primaryTab.id });
                          showToast("Tab put to sleep — find it above to restore");
                        }}
                        style={{ fontSize: 11, padding: "3px 8px", borderRadius: 5, border: "1px solid #1a2236", background: "transparent", color: "#8ea6cb", cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
                        SUSPEND
                      </button>
                      {hasDupes && <span style={{ color: "#8ea6cb", fontSize: 11 }}>{isExpanded ? "▴" : "▾"}</span>}
                    </div>
                  </div>

                  {/* Duplicate dropdown */}
                  {hasDupes && isExpanded && (
                    <div style={{ background: "#080c14", borderTop: "1px solid #0f1623", borderBottom: "1px solid #0f1623" }}>
                      {tabList.map((t, i) => (
                        <div
                          key={t.id}
                          onClick={() => {
                            chrome.tabs.update(t.id, { active: true });
                            setActiveTab(t.id);
                            showToast("Jumped to tab");
                          }}
                          style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px 6px 30px", cursor: "pointer", borderLeft: "2px solid #1a2236" }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <span style={{ color: "#8ea6cb", fontFamily: "'DM Mono', monospace", fontSize: 10 }}>#{i + 1}</span>
                          <span style={{ fontSize: 12, color: "#b3c1d8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{t.title}</span>
                          <DustBar age={t.age} />
                        </div>
                      ))}
                      <div style={{ padding: "6px 14px 6px 30px", display: "flex", gap: 8 }}>
                        <button
                          onClick={() => {
                            tabList.slice(1).forEach(t => chrome.tabs.remove(t.id));
                            showToast("Duplicate tabs closed");
                          }}
                          style={{ fontSize: 10, padding: "3px 8px", borderRadius: 5, border: "1px solid rgba(255,107,53,0.2)", background: "rgba(255,107,53,0.06)", color: "#ff6b35", cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
                          CLOSE DUPES
                        </button>
                        <button
                          onClick={() => showToast("Kept newest tab")}
                          style={{ fontSize: 10, padding: "3px 8px", borderRadius: 5, border: "1px solid #1a2236", background: "transparent", color: "#8fa2bf", cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
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

        {/* CLUSTERS VIEW */}
        {activeView === "clusters" && (
          <div style={{ padding: "4px 0" }}>
            <div style={{ padding: "4px 14px 10px", fontSize: 11, color: "#8ea6cb", fontFamily: "'DM Mono', monospace" }}>
              AUTO-GROUPED BY INTENT
            </div>
            {Object.entries(clusterMap).map(([cluster, tabList]) => {
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
                    <span style={{ flex: 1, color: "#cbd5e0", fontSize: 13, fontWeight: 500 }}>{cluster}</span>
                    <span style={{ fontSize: 10, color: "#8fa2bf", fontFamily: "'DM Mono', monospace" }}>{tabList.length} tabs</span>
                    <span style={{ fontSize: 10, color: "#8fa2bf", fontFamily: "'DM Mono', monospace" }}>
                      {tabList.reduce((a, t) => a + t.ram, 0)}MB
                    </span>
                    <span style={{ color: "#8ea6cb", fontSize: 11 }}>{isOpen ? "▴" : "▾"}</span>
                  </div>
                  {isOpen && (
                    <div style={{ background: "#080c14", borderTop: "1px solid #0f1623" }}>
                      {tabList.map(t => (
                        <div
                          key={t.id}
                          onClick={() => {
                            chrome.tabs.update(t.id, { active: true });
                            setActiveTab(t.id);
                            showToast("Jumped to tab");
                          }}
                          style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px 6px 28px", cursor: "pointer", borderLeft: `2px solid ${color}22` }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <Favicon value={t.favicon} size={12} />
                          <span style={{ fontSize: 12, color: "#b3c1d8", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                          <DustBar age={t.age} />
                        </div>
                      ))}
                      <div style={{ padding: "6px 14px 8px 28px", display: "flex", gap: 6 }}>
                        <button
                          onClick={() => {
                            tabList.forEach(t => chrome.tabs.remove(t.id));
                            showToast(`Closed all ${cluster} tabs`);
                          }}
                          style={{ fontSize: 10, padding: "3px 8px", borderRadius: 5, border: `1px solid ${color}33`, background: `${color}11`, color: color, cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
                          CLOSE ALL
                        </button>
                        <button
                          onClick={() => {
                            chrome.storage.local.get("sessions", ({ sessions = [] }) => {
                              chrome.storage.local.set({ sessions: [...sessions, { name: cluster, tabs: tabList, savedAt: Date.now() }] });
                            });
                            showToast(`${cluster} cluster saved`);
                          }}
                          style={{ fontSize: 10, padding: "3px 8px", borderRadius: 5, border: "1px solid #1a2236", background: "transparent", color: "#8fa2bf", cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
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

        {/* FOCUS VIEW */}
        {activeView === "focus" && (
          <PaywallGate feature="Tab Budget">
            <div style={{ padding: "16px 16px" }}>
              <div style={{ fontSize: 11, color: "#8ea6cb", fontFamily: "'DM Mono', monospace", marginBottom: 8 }}>
                BUDGET — TAB LIMIT
              </div>
              <div style={{ fontSize: 12, color: "#b3c1d8", lineHeight: 1.45, marginBottom: 14 }}>
                Budget sets your target number of active tabs. It does not auto-delete tabs; it shows when you are over budget and suggests older tabs to suspend.
              </div>

              <div style={{ background: "#080c14", borderRadius: 10, border: "1px solid #1a2236", padding: 16, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ color: "#b3c1d8", fontSize: 13 }}>Active Tab Limit</span>
                  <span style={{ color: "#e2e8f0", fontSize: 20, fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>{focusLimit}</span>
                </div>
                <input
                  type="range" min={3} max={20} value={focusLimit}
                  onChange={e => setFocusLimit(+e.target.value)}
                  style={{ width: "100%", accentColor: "#6366f1", cursor: "pointer" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#7f93b1", fontFamily: "'DM Mono', monospace", marginTop: 4 }}>
                  <span>3 MINIMAL</span><span>20 CHAOS</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 3, marginBottom: 12, flexWrap: "wrap" }}>
                {[...Array(Math.min(focusLimit, 20))].map((_, i) => (
                  <div key={i} style={{
                    width: 14, height: 20, borderRadius: 3,
                    background: i < tabs.length ? (i < focusLimit ? "#6366f1" : "#ff6b35") : "#0f1623",
                    opacity: i < tabs.length ? 1 : 0.3,
                    transition: "all 0.3s",
                    boxShadow: i < Math.min(tabs.length, focusLimit) ? "0 0 5px rgba(99,102,241,0.3)" : "none",
                  }} />
                ))}
              </div>

              <div style={{ fontSize: 12, color: tabs.length > focusLimit ? "#ff6b35" : "#4ade80", fontFamily: "'DM Mono', monospace", marginBottom: 16 }}>
                {tabs.length > focusLimit
                  ? `⚠ ${tabs.length - focusLimit} tabs over budget — suspend to continue`
                  : `✓ Within budget (${focusLimit - tabs.length} slots free)`}
              </div>

              <div style={{ background: "#080c14", borderRadius: 10, border: "1px solid #1a2236", padding: 14 }}>
                <div style={{ fontSize: 11, color: "#8fa2bf", fontFamily: "'DM Mono', monospace", marginBottom: 10 }}>
                  DUSTIEST TABS (suggested for suspension)
                </div>
                {tabs.filter(t => t.age > 5).slice(0, 3).map(t => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <Favicon value={t.favicon} size={12} />
                    <span style={{ flex: 1, fontSize: 11, color: "#b3c1d8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.domain}</span>
                    <DustBar age={t.age} />
                    <button
                      onClick={() => {
                        chrome.runtime.sendMessage({ type: 'SUSPEND_TAB', tabId: t.id });
                        showToast("Tab suspended");
                      }}
                      style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, border: "1px solid rgba(255,107,53,0.2)", background: "transparent", color: "#ff6b35", cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
                      SUSPEND
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </PaywallGate>
        )}

        {/* QUEUE VIEW */}
        {activeView === "queue" && (
          <div style={{ padding: "16px 16px" }}>
            <div style={{ fontSize: 11, color: "#8ea6cb", fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>READING QUEUE</div>
            <div style={{ fontSize: 12, color: "#b3c1d8", marginBottom: 6, lineHeight: 1.45 }}>
              Add tabs here with the button at the bottom. It saves the active tab and closes it now, so you can reopen later.
            </div>
            <div style={{ fontSize: 11, color: "#8fa2bf", marginBottom: 16 }}>Saved locally in this browser profile only.</div>

            {readLater.length === 0 ? (
              <div style={{ textAlign: "center", color: "#7f93b1", fontSize: 12, padding: 40 }}>Reading Queue is empty</div>
            ) : readLater.map(item => (
              <div key={item.id} style={{ background: "#080c14", borderRadius: 8, border: "1px solid #1a2236", padding: 12, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: "#cbd5e0", fontWeight: 500, marginBottom: 3 }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: "#8fa2bf", fontFamily: "'DM Mono', monospace" }}>{item.domain}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginLeft: 10 }}>
                    <button
                      onClick={() => {
                        chrome.tabs.create({ url: item.url });
                        setReadLater(p => p.filter(x => x.id !== item.id));
                        showToast("Opening tab…");
                      }}
                      style={{ fontSize: 10, padding: "3px 8px", borderRadius: 5, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)", color: "#6366f1", cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
                      OPEN
                    </button>
                    <button
                      onClick={() => {
                        setReadLater(p => p.filter(x => x.id !== item.id));
                        showToast("Removed");
                      }}
                      style={{ fontSize: 10, padding: "3px 8px", borderRadius: 5, border: "1px solid #1a2236", background: "transparent", color: "#8fa2bf", cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
                      ✕
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "#7f93b1", marginTop: 8, fontFamily: "'DM Mono', monospace" }}>Saved {item.saved}</div>
              </div>
            ))}

            <button
              onClick={() => {
                chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
                  const item = { id: Date.now(), title: tab.title, url: tab.url, domain: new URL(tab.url).hostname, saved: 'just now' };
                  setReadLater(p => [...p, item]);
                  chrome.tabs.remove(tab.id);
                  showToast("Added to Reading Queue");
                });
              }}
              style={{ width: "100%", padding: "12px", borderRadius: 8, border: "1px dashed #1a2236", background: "transparent", color: "#8ea6cb", cursor: "pointer", fontSize: 12, fontFamily: "'DM Mono', monospace", marginTop: 4 }}>
              + ADD ACTIVE TAB TO READ LATER (CLOSES IT NOW)
            </button>
          </div>
        )}

        {/* REPORT VIEW */}
        {activeView === "report" && (
          <PaywallGate feature="Weekly Report">
            <div style={{ padding: "16px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#8ea6cb", fontFamily: "'DM Mono', monospace" }}>WEEKLY REPORT</div>
                  <div style={{ fontSize: 10, color: "#7f93b1", fontFamily: "'DM Mono', monospace" }}>LOCAL ONLY · NO DATA LEAVES YOUR BROWSER</div>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                {[
                  { label: "TABS OPENED", value: weeklyStats.opened, sub: "this week" },
                  { label: "TABS REVISITED", value: weeklyStats.revisited, sub: `${weeklyStats.opened ? Math.round(weeklyStats.revisited / weeklyStats.opened * 100) : 0}% revisit rate` },
                  { label: "RAM FREED", value: weeklyStats.ramSaved, sub: "via suspension" },
                  { label: "AVG TAB AGE", value: `${weeklyStats.avgTabAge}d`, sub: "before close" },
                ].map(s => (
                  <div key={s.label} style={{ background: "#080c14", borderRadius: 8, border: "1px solid #1a2236", padding: 12 }}>
                    <div style={{ fontSize: 10, color: "#8fa2bf", fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 22, color: "#e2e8f0", fontFamily: "'DM Mono', monospace", fontWeight: 500, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: "#7f93b1", marginTop: 4 }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: "#080c14", borderRadius: 8, border: "1px solid #1a2236", padding: 12, marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: "#8fa2bf", fontFamily: "'DM Mono', monospace", marginBottom: 8 }}>TOP DOMAINS</div>
                {(weeklyStats.topDomains || []).map(d => (
                  <div key={d.domain} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: "#8fa2bf", fontFamily: "'DM Mono', monospace", width: 110 }}>{d.domain}</span>
                    <div style={{ flex: 1, height: 4, background: "#0f1623", borderRadius: 2 }}>
                      <div style={{ width: `${(d.visits / (weeklyStats.topDomains?.[0]?.visits || 1)) * 100}%`, height: "100%", borderRadius: 2, background: "linear-gradient(90deg, #6366f1, #06b6d4)" }} />
                    </div>
                    <span style={{ fontSize: 10, color: "#8ea6cb", fontFamily: "'DM Mono', monospace", width: 20, textAlign: "right" }}>{d.visits}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: "rgba(74,222,128,0.05)", borderRadius: 8, border: "1px solid rgba(74,222,128,0.1)", padding: 12, fontSize: 11, color: "#4ade80" }}>
                🌿 {weeklyStats.summary || "No data yet. Check back after this week completes."}
              </div>
            </div>
          </PaywallGate>
        )}

        {/* SETTINGS VIEW */}
        {activeView === "settings" && (
          <div style={{ padding: "16px 16px" }}>
            <div style={{ fontSize: 11, color: "#8ea6cb", fontFamily: "'DM Mono', monospace", marginBottom: 10 }}>
              SETTINGS
            </div>

            <div style={{ background: "#080c14", borderRadius: 10, border: "1px solid #1a2236", padding: 14, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600, marginBottom: 4 }}>
                    High Contrast Text
                  </div>
                  <div style={{ fontSize: 11, color: "#8fa2bf", lineHeight: 1.4 }}>
                    Improves readability across labels and metadata.
                  </div>
                </div>
                <button
                  onClick={() => {
                    setHighContrast(!highContrast);
                    showToast(!highContrast ? "High contrast enabled" : "High contrast disabled");
                  }}
                  style={{
                    minWidth: 72,
                    padding: "6px 10px",
                    borderRadius: 7,
                    border: "1px solid #1a2236",
                    background: highContrast ? "rgba(99,102,241,0.18)" : "transparent",
                    color: highContrast ? "#c7d2fe" : "#8fa2bf",
                    cursor: "pointer",
                    fontSize: 11,
                    fontFamily: "'DM Mono', monospace",
                  }}>
                  {highContrast ? "ON" : "OFF"}
                </button>
              </div>
            </div>

            <div style={{ background: "#080c14", borderRadius: 10, border: "1px solid #1a2236", padding: 14, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600, marginBottom: 4 }}>
                    TABWISE Pro Billing
                  </div>
                  <div style={{ fontSize: 11, color: "#8fa2bf", lineHeight: 1.4 }}>
                    Status: {isPro ? "PRO ACTIVE" : tier === "free" ? "FREE" : tier.toUpperCase()}
                  </div>
                </div>
                <div style={{
                  fontSize: 10,
                  color: paymentConfigured ? "#4ade80" : "#f5c842",
                  fontFamily: "'DM Mono', monospace",
                }}>
                  {paymentConfigured ? "LIVE" : "NOT CONFIGURED"}
                </div>
              </div>

              <div style={{ fontSize: 11, color: "#8fa2bf", lineHeight: 1.45, marginBottom: 12 }}>
                Use this section to upgrade, restore access after payment, or manage an existing subscription.
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <button
                  onClick={async () => {
                    const result = await triggerUpgrade("yearly");
                    showToast(result.ok ? "Opening checkout..." : (result.error || "Unable to open checkout"));
                  }}
                  style={{ padding: "9px 10px", borderRadius: 7, border: "none", background: "#6366f1", color: "#fff", cursor: "pointer", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
                  UPGRADE
                </button>
                <button
                  onClick={async () => {
                    const result = await manageBilling();
                    showToast(result.ok ? "Opening billing..." : (result.error || "Unable to open billing"));
                  }}
                  style={{ padding: "9px 10px", borderRadius: 7, border: "1px solid #1a2236", background: "transparent", color: "#b3c1d8", cursor: "pointer", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
                  MANAGE
                </button>
                <button
                  onClick={async () => {
                    const result = await restorePurchase();
                    showToast(result.ok ? "Opening restore access..." : (result.error || "Unable to open restore access"));
                  }}
                  style={{ padding: "9px 10px", borderRadius: 7, border: "1px solid #1a2236", background: "transparent", color: "#8fa2bf", cursor: "pointer", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
                  RESTORE
                </button>
                <button
                  onClick={async () => {
                    const result = await refreshStatus();
                    showToast(result.ok ? `Payment status: ${(result.tier || tier).toUpperCase()}` : (result.error || "Unable to refresh status"));
                  }}
                  style={{ padding: "9px 10px", borderRadius: 7, border: "1px solid #1a2236", background: "transparent", color: "#8fa2bf", cursor: "pointer", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
                  REFRESH
                </button>
              </div>
            </div>

            <div style={{ background: "#080c14", borderRadius: 10, border: "1px solid #1a2236", padding: 14 }}>
              <div style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 600, marginBottom: 6 }}>
                Future Settings
              </div>
              <div style={{ fontSize: 11, color: "#8fa2bf", lineHeight: 1.45 }}>
                This section is reserved for upcoming options like automation controls and report preferences.
              </div>
            </div>
          </div>
        )}

      </div>

      {/* TOAST */}
      {toast && (
        <div style={{
          position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
          background: "#1a2236", border: "1px solid #7f93b1", borderRadius: 8,
          padding: "8px 16px", fontSize: 12, color: "#e2e8f0",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          animation: "tabwise-fadein 0.2s ease",
          zIndex: 100, whiteSpace: "nowrap",
        }}>
          {toast}
        </div>
      )}

      {/* GLOBAL STYLES */}
      <style>{`
        @keyframes tabwise-fadein {
          from { opacity: 0; transform: translateX(-50%) translateY(6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .tabwise-scroll::-webkit-scrollbar { width: 4px; }
        .tabwise-scroll::-webkit-scrollbar-track { background: transparent; }
        .tabwise-scroll::-webkit-scrollbar-thumb { background: #1a2236; border-radius: 2px; }
        input[type=range] { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; background: #0f1623; border-radius: 3px; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 14px; height: 14px; background: #6366f1; border-radius: 50%; cursor: pointer; box-shadow: 0 0 6px rgba(99,102,241,0.4); }
        input[type=range]::-moz-range-thumb { width: 14px; height: 14px; background: #6366f1; border-radius: 50%; cursor: pointer; border: none; box-shadow: 0 0 6px rgba(99,102,241,0.4); }
      `}</style>
    </div>
  );
}
