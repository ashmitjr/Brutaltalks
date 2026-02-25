"use client";

import { useWebRTC } from "@/hooks/use-webrtc";
import { useEffect, useRef, useState } from "react";

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

  const [sessionTime, setSessionTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Session timer — resets on each new CONNECTED state
  useEffect(() => {
    if (appState === "CONNECTED") {
      setSessionTime(0);
      timerRef.current = setInterval(() => setSessionTime((t) => t + 1), 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [appState]);

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const isActive = appState === "WAITING" || appState === "CONNECTED";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@300;400;500;700&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          -webkit-tap-highlight-color: transparent;
        }

        :root {
          --bg:     #060606;
          --surf:   #0f0f0f;
          --line:   #1e1e1e;
          --white:  #f2f0ec;
          --muted:  #3a3a3a;
          --red:    #e01010;
          --red2:   #6b0000;
          --yellow: #ddd000;
          --border: 2px solid #f2f0ec;
          --ff-d:   'Bebas Neue', sans-serif;
          --ff-m:   'IBM Plex Mono', monospace;
        }

        html, body {
          background: var(--bg);
          color: var(--white);
          font-family: var(--ff-m);
          min-height: 100dvh;
          overscroll-behavior: none;
        }

        /* Film grain */
        body::after {
          content: '';
          position: fixed;
          inset: 0;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 9999;
        }

        /* ────── SHELL ────── */
        .app {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
        }

        /* ────── HEADER ────── */
        .hdr {
          height: 52px;
          display: flex;
          align-items: stretch;
          border-bottom: var(--border);
          flex-shrink: 0;
          position: relative;
          z-index: 10;
        }

        .hdr-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 16px;
          border-right: var(--border);
        }

        .hdr-sigbars {
          display: flex;
          align-items: flex-end;
          gap: 2px;
          height: 18px;
        }

        .hdr-sigbars span {
          width: 4px;
          background: var(--red);
          border-radius: 1px;
        }
        .hdr-sigbars span:nth-child(1) { height: 5px; }
        .hdr-sigbars span:nth-child(2) { height: 9px; }
        .hdr-sigbars span:nth-child(3) { height: 14px; }
        .hdr-sigbars span:nth-child(4) { height: 18px; opacity: 0.25; }

        .hdr-title {
          font-family: var(--ff-d);
          font-size: 1.55rem;
          letter-spacing: 0.05em;
          line-height: 1;
          color: var(--white);
        }

        .hdr-fill { flex: 1; }

        .hdr-state {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 16px;
          border-left: var(--border);
          font-size: 0.58rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--muted);
        }

        .dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--muted);
          flex-shrink: 0;
        }
        .dot.live   { background: var(--red);    animation: blink 1s  steps(2) infinite; }
        .dot.wait   { background: var(--yellow);  animation: blink 1.6s steps(2) infinite; }
        .dot.on     { background: #00c850; }

        @keyframes blink { 50% { opacity: 0; } }

        /* ────── ERROR ────── */
        .err {
          background: var(--red2);
          border-bottom: 2px solid var(--red);
          padding: 10px 16px;
          font-size: 0.62rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .err::before { content: 'ERR›'; font-weight: 700; color: var(--red); }

        /* ────── BODY ────── */
        .body {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }

        /* ────── VIDEO STACK ────── */
        .vids {
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          height: 52vw;
          max-height: 44vh;
        }

        .vslot {
          flex: 1;
          position: relative;
          background: #000;
          border-bottom: var(--border);
          overflow: hidden;
          min-height: 0;
        }
        .vslot:last-child { border-bottom: none; }

        .vslot video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* CRT scanlines */
        .vslot::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            to bottom,
            transparent 0px, transparent 2px,
            rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 3px
          );
          pointer-events: none;
          z-index: 4;
        }

        .vlabel {
          position: absolute;
          top: 0; left: 0;
          z-index: 6;
          font-size: 0.52rem;
          font-weight: 700;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          padding: 5px 10px;
          background: var(--bg);
          color: var(--white);
          border-right: 2px solid var(--white);
          border-bottom: 2px solid var(--white);
        }

        .vslot.stranger .vlabel {
          background: var(--red);
          border-color: var(--red);
        }

        .vtime {
          position: absolute;
          bottom: 10px; right: 12px;
          z-index: 6;
          font-size: 0.58rem;
          letter-spacing: 0.12em;
          color: rgba(242,240,236,0.25);
        }
        .vtime.live-t { color: rgba(224,16,16,0.75); }

        /* NO SIGNAL */
        .nosig {
          position: absolute;
          inset: 0;
          z-index: 5;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
        }

        .nosig-word {
          font-family: var(--ff-d);
          font-size: clamp(2rem, 12vw, 5.5rem);
          letter-spacing: 0.06em;
          color: rgba(242,240,236,0.04);
          user-select: none;
        }

        /* pixel static */
        .static-grid {
          display: grid;
          grid-template-columns: repeat(8, 6px);
          gap: 2px;
          opacity: 0.12;
        }
        .static-grid span {
          width: 6px; height: 6px;
          background: var(--white);
        }

        .spin-ring {
          width: 40px; height: 40px;
          border: 2px solid rgba(255,255,255,0.07);
          border-top-color: var(--red);
          border-radius: 50%;
          animation: spin 0.85s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .wait-label {
          font-size: 0.56rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(242,240,236,0.28);
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100% { opacity: 0.28; } 50% { opacity: 0.9; } }

        /* ────── CONTROLS ────── */
        .ctrl {
          border-top: var(--border);
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .ctrl-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 14px;
          border-bottom: 1px solid var(--line);
          font-size: 0.56rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--muted);
          flex-shrink: 0;
        }

        .ctrl-meta-l { display: flex; align-items: center; gap: 8px; }

        /* Button row */
        .btn-row {
          display: flex;
          flex: 1;
          min-height: 0;
        }

        .cbtn {
          flex: 1;
          appearance: none;
          border: none;
          cursor: pointer;
          font-family: var(--ff-d);
          font-size: clamp(1.6rem, 5.5vw, 2.6rem);
          letter-spacing: 0.07em;
          text-transform: uppercase;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-right: var(--border);
          transition: filter 0.08s, transform 0.08s;
          user-select: none;
          touch-action: manipulation;
          line-height: 1;
          min-height: 64px;
        }
        .cbtn:last-child { border-right: none; }
        .cbtn:active { filter: brightness(1.3); transform: scale(0.97); }

        .cbtn-ico {
          font-family: var(--ff-m);
          font-size: 0.9rem;
          font-weight: 300;
          opacity: 0.45;
          line-height: 1;
        }

        /* START */
        .cbtn-start { background: var(--white); color: var(--bg); }
        .cbtn-start:hover { background: #fff; }

        /* NEXT */
        .cbtn-next {
          background: var(--yellow);
          color: #000;
        }
        .cbtn-next:hover { background: #eeee00; }
        .cbtn-next:disabled {
          background: #2a2800;
          color: #666;
          cursor: not-allowed;
        }

        /* END */
        .cbtn-end { background: var(--bg); color: var(--red); }
        .cbtn-end:hover { background: var(--red); color: var(--white); }

        /* LOADING */
        .cbtn-load {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 18px 20px;
          font-size: 0.7rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--muted);
          background: var(--surf);
        }

        /* ────── FOOTER ────── */
        .ftr {
          border-top: 1px solid var(--line);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 9px 14px;
          font-size: 0.48rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--muted);
          flex-shrink: 0;
        }

        /* ────── DESKTOP ────── */
        @media (min-width: 760px) {
          .hdr { height: 60px; }
          .hdr-title { font-size: 1.9rem; }

          .body { flex-direction: row; overflow: hidden; }

          .vids {
            flex: 1;
            flex-direction: row;
            height: auto;
            max-height: none;
            border-right: var(--border);
          }

          .vslot {
            flex: 1;
            border-bottom: none;
            border-right: var(--border);
          }
          .vslot:last-child { border-right: none; }

          .ctrl {
            width: 240px;
            flex: none;
            border-top: none;
            border-left: none;
          }

          .btn-row { flex-direction: column; }
          .cbtn {
            border-right: none;
            border-bottom: var(--border);
            font-size: 2.2rem;
            padding: 0 22px;
          }
          .cbtn:last-child { border-bottom: none; }

          .cbtn-load {
            flex: 1;
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>

      <div className="app">

        {/* ── HEADER ── */}
        <header className="hdr">
          <div className="hdr-brand">
            <div className="hdr-sigbars">
              <span /><span /><span /><span />
            </div>
            <span className="hdr-title">BRUTAL TALKS</span>
          </div>

          <div className="hdr-fill" />

          <div className="hdr-state">
            <span className={`dot ${
              appState === "CONNECTED" ? "live" :
              appState === "WAITING"   ? "wait" :
              appState === "REQUESTING_MEDIA" ? "on" : ""
            }`} />
            <span>
              {appState === "IDLE"             && "STANDBY"}
              {appState === "REQUESTING_MEDIA" && "INIT"}
              {appState === "WAITING"          && "MATCHING"}
              {appState === "CONNECTED"        && "LIVE"}
              {appState === "ERROR"            && "FAULT"}
            </span>
          </div>
        </header>

        {/* ── ERROR ── */}
        {errorMsg && <div className="err">{errorMsg}</div>}

        {/* ── BODY ── */}
        <div className="body">

          {/* ── VIDEOS ── */}
          <div className="vids">

            {/* Stranger */}
            <div className={`vslot stranger`}>
              <video ref={remoteVideoRef} autoPlay playsInline />
              <span className="vlabel">
                {appState === "CONNECTED" ? "● STRANGER" : "STRANGER"}
              </span>
              {appState === "CONNECTED" && (
                <div className="vtime live-t">{fmtTime(sessionTime)}</div>
              )}
              {appState !== "CONNECTED" && (
                <div className="nosig">
                  <div className="nosig-word">NO SIGNAL</div>
                  <div className="static-grid">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <span key={i} style={{ opacity: [1, 0.4, 0.7, 0.2, 0.9, 0.3, 0.6, 1, 0.2, 0.8, 0.4, 0.6, 1, 0.3, 0.7, 0.5][i] }} />
                    ))}
                  </div>
                  {appState === "WAITING" && (
                    <>
                      <div className="spin-ring" />
                      <div className="wait-label">SEARCHING FOR STRANGER</div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* You */}
            <div className="vslot">
              <video ref={localVideoRef} autoPlay muted playsInline />
              <span className="vlabel">YOU</span>
              {appState === "CONNECTED" && (
                <div className="vtime">LOCAL</div>
              )}
              {appState === "IDLE" && (
                <div className="nosig">
                  <div className="nosig-word">CAMERA</div>
                </div>
              )}
            </div>
          </div>

          {/* ── CONTROLS ── */}
          <div className="ctrl">
            <div className="ctrl-meta">
              <div className="ctrl-meta-l">
                <span className={`dot ${
                  appState === "CONNECTED" ? "live" :
                  appState === "WAITING"   ? "wait" : ""
                }`} />
                <span>
                  {appState === "IDLE"             && "READY TO CONNECT"}
                  {appState === "REQUESTING_MEDIA" && "REQUESTING CAMERA"}
                  {appState === "WAITING"          && "FINDING MATCH…"}
                  {appState === "CONNECTED"        && `SESSION · ${fmtTime(sessionTime)}`}
                  {appState === "ERROR"            && "CONNECTION FAILED"}
                </span>
              </div>
              <span>P2P · NO LOG</span>
            </div>

            <div className="btn-row">

              {appState === "IDLE" && (
                <button className="cbtn cbtn-start" onClick={start}>
                  <span>START</span>
                  <span className="cbtn-ico">→</span>
                </button>
              )}

              {appState === "ERROR" && (
                <button className="cbtn cbtn-start" onClick={start}>
                  <span>RETRY</span>
                  <span className="cbtn-ico">↺</span>
                </button>
              )}

              {appState === "REQUESTING_MEDIA" && (
                <div className="cbtn-load">
                  <div className="spin-ring" style={{ width: 28, height: 28, borderWidth: 2 }} />
                  <span>INITIALISING</span>
                </div>
              )}

              {isActive && (
                <>
                  <button
                    className="cbtn cbtn-next"
                    onClick={next}
                    disabled={appState === "WAITING"}
                    title="Skip to next stranger"
                  >
                    <span>NEXT</span>
                    <span className="cbtn-ico">↻</span>
                  </button>

                  <button
                    className="cbtn cbtn-end"
                    onClick={disconnect}
                    title="End session"
                  >
                    <span>END</span>
                    <span className="cbtn-ico">✕</span>
                  </button>
                </>
              )}

            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="ftr">
          <span>BRUTAL TALKS — NO ACCOUNTS · NO HISTORY · EPHEMERAL</span>
          <span>WebRTC</span>
        </footer>
      </div>
    </>
  );
}
