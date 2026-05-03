// src/components/SettingsPanel.jsx
export default function SettingsPanel({ theme, toggle, onClose }) {
    const options = [
      {
        key: "dyslexiaFont",
        icon: "🔡",
        label: "Dyslexia-Friendly Font",
        desc: "Switches to OpenDyslexic — easier to tell letters apart",
      },
      {
        key: "focusMode",
        icon: "🧘",
        label: "Focus Mode",
        desc: "Softer colors and fewer distractions for ADHD",
      },
    ];
  
    return (
      <>
        {/* Backdrop */}
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.3)",
            zIndex: 200,
            backdropFilter: "blur(2px)",
          }}
        />
  
        {/* Panel */}
        <div
          style={{
            position: "fixed",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#fff",
            borderRadius: 24,
            padding: 28,
            width: "min(380px, 92vw)",
            zIndex: 201,
            boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>⚙️ Accessibility</h3>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#9ca3af" }}
            >✕</button>
          </div>
  
          {options.map((opt) => (
            <div
              key={opt.key}
              onClick={() => toggle(opt.key)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 16px", borderRadius: 14, marginBottom: 10,
                border: "2px solid",
                borderColor: theme[opt.key] ? "#6366f1" : "#e5e7eb",
                background: theme[opt.key] ? "#eef2ff" : "#f9fafb",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: 28 }}>{opt.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: theme[opt.key] ? "#3730a3" : "#1f2937" }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{opt.desc}</div>
              </div>
              {/* Toggle pill */}
              <div style={{
                width: 44, height: 24, borderRadius: 12,
                background: theme[opt.key] ? "#6366f1" : "#d1d5db",
                position: "relative", transition: "background 0.25s", flexShrink: 0,
              }}>
                <div style={{
                  position: "absolute", top: 3,
                  left: theme[opt.key] ? 23 : 3,
                  width: 18, height: 18, borderRadius: "50%",
                  background: "#fff", transition: "left 0.25s",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                }}/>
              </div>
            </div>
          ))}
  
          <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", marginTop: 16, marginBottom: 0 }}>
            Settings are saved automatically
          </p>
        </div>
      </>
    );
}