import { useWebRTC } from "@/hooks/use-webrtc";

export default function Home() {
  const {
    appState,
    errorMsg,
    localVideoRef,
    remoteVideoRef,
    start,
    disconnect,
    next,
  } = useWebRTC();

  const isActive = appState === "WAITING" || appState === "CONNECTED";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Bebas+Neue&family=DM+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --ink: #0a0a0a;
          --paper: #f0ebe3;
          --red: #c8002e;
          --red-dim: #7a001c;
          --accent: #e8e000;
          --border: 3px solid #0a0a0a;
          --border-thick: 5px solid #0a0a0a;
          --font-display: 'Bebas Neue', sans-serif;
          --font-mono: 'DM Mono', monospace;
          --font-body: 'Space Mono', monospace;
        }

        body {
          background: var(--paper);
          color: var(--ink);
          font-family: var(--font-body);
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* NOISE TEXTURE OVERLAY */
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 999;
          opacity: 0.5;
        }

        .layout {
          display: grid;
          grid-template-rows: auto 1fr auto;
          min-height: 100vh;
        }

        /* ===== HEADER ===== */
        .header {
          border-bottom: var(--border-thick);
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: stretch;
        }

        .header-logo {
          padding: 18px 24px;
          border-right: var(--border-thick);
          display: flex;
          align-items: center;
        }

        .logo-text {
          font-family: var(--font-display);
          font-size: clamp(2rem, 4vw, 3.5rem);
          letter-spacing: 0.04em;
          line-height: 1;
          color: var(--ink);
        }

        .logo-sub {
          font-family: var(--font-mono);
          font-size: 0.6rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--ink);
          opacity: 0.5;
          margin-top: 4px;
        }

        .header-ticker {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 32px;
          overflow: hidden;
          position: relative;
        }

        .ticker-inner {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          opacity: 0.4;
          white-space: nowrap;
          animation: tickerScroll 20s linear infinite;
        }

        @keyframes tickerScroll {
          0% { transform: translateX(60px); }
          100% { transform: translateX(-100%); }
        }

        .header-status {
          padding: 18px 24px;
          border-left: var(--border-thick);
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: center;
          gap: 6px;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 5px 12px;
          border: 2px solid var(--ink);
          background: transparent;
        }

        .status-pill.live {
          background: var(--red);
          color: var(--paper);
          border-color: var(--red);
          animation: pulsePill 2s ease-in-out infinite;
        }

        .status-pill.waiting {
          background: var(--accent);
          color: var(--ink);
          border-color: var(--ink);
        }

        @keyframes pulsePill {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
        }

        .status-pill.live .status-dot {
          animation: blinkDot 1.2s steps(2) infinite;
        }

        @keyframes blinkDot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        /* ===== MAIN CONTENT ===== */
        .main {
          display: grid;
          grid-template-columns: 1fr 280px;
          border-bottom: var(--border-thick);
        }

        /* ===== VIDEO SECTION ===== */
        .video-section {
          border-right: var(--border-thick);
          display: flex;
          flex-direction: column;
        }

        .video-grid {
          display: grid;
          grid-template-rows: 1fr 1fr;
          flex: 1;
        }

        .video-slot {
          position: relative;
          border-bottom: var(--border);
          background: var(--ink);
          overflow: hidden;
          min-height: 200px;
        }

        .video-slot video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* SCANLINE effect */
        .video-slot::after {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 3px,
            rgba(0,0,0,0.06) 3px,
            rgba(0,0,0,0.06) 4px
          );
          pointer-events: none;
          z-index: 2;
        }

        .video-label {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 3;
          font-family: var(--font-mono);
          font-size: 0.6rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          padding: 6px 10px;
          background: var(--paper);
          color: var(--ink);
          border-right: 2px solid var(--ink);
          border-bottom: 2px solid var(--ink);
        }

        .video-slot.stranger .video-label {
          background: var(--ink);
          color: var(--paper);
          border-color: var(--paper);
        }

        .video-corner {
          position: absolute;
          bottom: 10px;
          right: 10px;
          z-index: 3;
          font-family: var(--font-mono);
          font-size: 0.5rem;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.5);
        }

        .no-signal {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 3;
          gap: 12px;
        }

        .no-signal-text {
          font-family: var(--font-display);
          font-size: clamp(2rem, 6vw, 4rem);
          color: rgba(240,235,227,0.08);
          letter-spacing: 0.08em;
        }

        .no-signal-bars {
          display: flex;
          gap: 4px;
          align-items: flex-end;
          height: 24px;
        }

        .no-signal-bars span {
          width: 5px;
          background: rgba(240,235,227,0.15);
          border-radius: 1px;
        }

        .no-signal-bars span:nth-child(1) { height: 8px; }
        .no-signal-bars span:nth-child(2) { height: 14px; }
        .no-signal-bars span:nth-child(3) { height: 20px; }
        .no-signal-bars span:nth-child(4) { height: 24px; }

        /* ===== SIDEBAR ===== */
        .sidebar {
          display: flex;
          flex-direction: column;
        }

        .sidebar-block {
          border-bottom: var(--border);
          padding: 20px;
        }

        .sidebar-block:last-child {
          border-bottom: none;
          flex: 1;
        }

        .sidebar-label {
          font-family: var(--font-mono);
          font-size: 0.55rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          opacity: 0.4;
          margin-bottom: 10px;
        }

        .sidebar-value {
          font-family: var(--font-display);
          font-size: 3rem;
          line-height: 1;
          letter-spacing: 0.02em;
        }

        /* CONTROLS */
        .controls-block {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .btn {
          display: block;
          width: 100%;
          border: none;
          border-bottom: var(--border);
          padding: 20px;
          font-family: var(--font-display);
          font-size: 1.8rem;
          letter-spacing: 0.06em;
          cursor: pointer;
          text-align: left;
          text-transform: uppercase;
          transition: background 0.1s, color 0.1s, transform 0.08s;
          position: relative;
          outline: none;
        }

        .btn:last-child {
          border-bottom: none;
        }

        .btn::after {
          content: '→';
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          font-family: var(--font-mono);
          font-size: 1rem;
          opacity: 0;
          transition: opacity 0.15s, right 0.15s;
        }

        .btn:hover::after {
          opacity: 1;
          right: 14px;
        }

        .btn-start {
          background: var(--ink);
          color: var(--paper);
        }

        .btn-start:hover {
          background: var(--red);
        }

        .btn-next {
          background: var(--paper);
          color: var(--ink);
        }

        .btn-next:hover {
          background: var(--accent);
        }

        .btn-end {
          background: var(--paper);
          color: var(--red);
        }

        .btn-end:hover {
          background: var(--red);
          color: var(--paper);
        }

        .btn:active {
          transform: scale(0.98);
        }

        /* MANIFESTO block */
        .manifesto {
          padding: 24px 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .manifesto-text {
          font-family: var(--font-mono);
          font-size: 0.6rem;
          line-height: 1.9;
          letter-spacing: 0.05em;
          opacity: 0.4;
          text-transform: uppercase;
        }

        /* ===== ERROR ===== */
        .error-bar {
          border-bottom: var(--border-thick);
          background: var(--red);
          color: var(--paper);
          padding: 12px 24px;
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .error-bar::before {
          content: '⚠';
          font-size: 1rem;
        }

        /* ===== FOOTER ===== */
        .footer {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }

        .footer-cell {
          padding: 12px 20px;
          border-right: var(--border);
          font-family: var(--font-mono);
          font-size: 0.55rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          opacity: 0.35;
          display: flex;
          align-items: center;
        }

        .footer-cell:last-child {
          border-right: none;
          justify-content: flex-end;
        }

        /* ===== WAITING ANIMATION ===== */
        .waiting-overlay {
          position: absolute;
          inset: 0;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .waiting-pulse {
          width: 60px;
          height: 60px;
          border: 3px solid rgba(240,235,227,0.3);
          border-top-color: var(--paper);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 768px) {
          .header {
            grid-template-columns: 1fr auto;
          }
          .header-ticker { display: none; }
          .main {
            grid-template-columns: 1fr;
          }
          .sidebar {
            border-top: var(--border-thick);
          }
          .video-grid {
            grid-template-rows: 1fr 1fr;
            min-height: 60vh;
          }
          .footer {
            grid-template-columns: 1fr 1fr;
          }
          .footer-cell:nth-child(2) { border-right: none; }
          .footer-cell:nth-child(3) { border-right: var(--border); }
        }
      `}</style>

      <div className="layout">
        {/* ===== HEADER ===== */}
        <header className="header">
          <div className="header-logo">
            <div>
              <div className="logo-text">BRUTAL TALKS</div>
              <div className="logo-sub">Raw Human Connection</div>
            </div>
          </div>

          <div className="header-ticker">
            <div className="ticker-inner">
              NO LOGIN • NO HISTORY • NO RECORD • EPHEMERAL • PEER TO PEER • ANONYMOUS • REAL TIME •&nbsp;
              NO LOGIN • NO HISTORY • NO RECORD • EPHEMERAL • PEER TO PEER • ANONYMOUS • REAL TIME •
            </div>
          </div>

          <div className="header-status">
            {appState === "CONNECTED" && (
              <div className="status-pill live">
                <span className="status-dot" />
                Live Session
              </div>
            )}
            {appState === "WAITING" && (
              <div className="status-pill waiting">
                <span className="status-dot" />
                Matching
              </div>
            )}
            {appState === "IDLE" && (
              <div className="status-pill">
                <span className="status-dot" />
                Standby
              </div>
            )}
            {appState === "REQUESTING_MEDIA" && (
              <div className="status-pill">
                <span className="status-dot" />
                Init
              </div>
            )}
            {appState === "ERROR" && (
              <div className="status-pill" style={{ background: "var(--red)", color: "var(--paper)", borderColor: "var(--red)" }}>
                <span className="status-dot" />
                Fault
              </div>
            )}
          </div>
        </header>

        {/* ===== ERROR BAR ===== */}
        {errorMsg && (
          <div className="error-bar">
            {errorMsg}
          </div>
        )}

        {/* ===== MAIN ===== */}
        <main className="main">
          {/* VIDEO SECTION */}
          <section className="video-section">
            <div className="video-grid">
              {/* Stranger */}
              <div className="video-slot stranger">
                <video ref={remoteVideoRef} autoPlay playsInline />
                <span className="video-label">Stranger</span>
                {appState !== "CONNECTED" && (
                  <div className="no-signal">
                    <div className="no-signal-text">NO SIGNAL</div>
                    <div className="no-signal-bars">
                      <span /><span /><span /><span />
                    </div>
                    {appState === "WAITING" && (
                      <div className="waiting-overlay">
                        <div className="waiting-pulse" />
                      </div>
                    )}
                  </div>
                )}
                {appState === "CONNECTED" && (
                  <div className="video-corner">REC ●</div>
                )}
              </div>

              {/* You */}
              <div className="video-slot">
                <video ref={localVideoRef} autoPlay muted playsInline />
                <span className="video-label">You</span>
                {appState === "IDLE" && (
                  <div className="no-signal">
                    <div className="no-signal-text">CAMERA OFF</div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* SIDEBAR */}
          <aside className="sidebar">
            {/* Session counter */}
            <div className="sidebar-block">
              <div className="sidebar-label">Session</div>
              <div className="sidebar-value" style={{ fontSize: "1.4rem", fontFamily: "var(--font-mono)", opacity: 0.35 }}>
                {appState.toUpperCase()}
              </div>
            </div>

            {/* Controls */}
            <div className="controls-block" style={{ borderBottom: "var(--border-thick)" }}>
              {appState === "IDLE" && (
                <button className="btn btn-start" onClick={start}>
                  Start
                </button>
              )}

              {isActive && (
                <>
                  <button className="btn btn-next" onClick={next}>
                    Next
                  </button>
                  <button className="btn btn-end" onClick={disconnect}>
                    End
                  </button>
                </>
              )}

              {appState === "REQUESTING_MEDIA" && (
                <div className="btn" style={{ opacity: 0.4, cursor: "default", background: "var(--ink)", color: "var(--paper)" }}>
                  Initialising
                </div>
              )}
            </div>

            {/* Manifesto */}
            <div className="manifesto">
              <div className="manifesto-text">
                No accounts.<br />
                No history.<br />
                No surveillance.<br />
                Just two humans,<br />
                face to face,<br />
                for a moment.<br />
                <br />
                Then it's gone.
              </div>
            </div>
          </aside>
        </main>

        {/* ===== FOOTER ===== */}
        <footer className="footer">
          <div className="footer-cell">Brutal Talks</div>
          <div className="footer-cell">WebRTC P2P</div>
          <div className="footer-cell">Zero Data Retained</div>
          <div className="footer-cell">brutalbrutalbrutalbrutalbr</div>
        </footer>
      </div>
    </>
  );
        }
