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

  useEffect(() => {
    if (appState === "CONNECTED") {
      setSessionTime(0);
      timerRef.current = setInterval(() => setSessionTime((t) => t + 1), 1000);
    } else {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [appState]);

  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const isActive = appState === "WAITING" || appState === "CONNECTED";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;500;700&display=swap');

        *, *::before, *::after {
          box-sizing: border-box; margin: 0; padding: 0;
          -webkit-tap-highlight-color: transparent;
        }

        :root {
          --bg:       #050505;
          --surface:  #0d0d0d;
          --line:     #1a1a1a;
          --white:    #f0eee9;
          --dim:      #404040;
          --red:      #e01010;
          --red-bg:   #5a0000;
          --yellow:   #d8cc00;
          --yellow-h: #eee000;
          --B: 2px solid #f0eee9;
          --fd: 'Bebas Neue', sans-serif;
          --fm: 'IBM Plex Mono', monospace;
        }

        html, body {
          background: var(--bg);
          color: var(--white);
          font-family: var(--fm);
          height: 100dvh;
          overflow: hidden;
        }

        /* grain */
        body::after {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23g)' opacity='0.055'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 9999;
        }

        /* ═══ SHELL: fixed header + fixed footer btns + videos fill middle ═══ */
        .shell {
          position: fixed; inset: 0;
          display: flex; flex-direction: column;
        }

        /* ─── HEADER (fixed height) ─── */
        .hdr {
          height: 54px;
          display: flex; align-items: stretch;
          border-bottom: var(--B);
          flex-shrink: 0;
          background: var(--bg);
          z-index: 20;
        }

        .hdr-brand {
          display: flex; align-items: center; gap: 10px;
          padding: 0 18px;
          border-right: var(--B);
        }

        .bars {
          display: flex; align-items: flex-end; gap: 2px; height: 18px;
        }
        .bars span { width: 4px; background: var(--red); border-radius: 1px; }
        .bars span:nth-child(1) { height: 5px; }
        .bars span:nth-child(2) { height: 9px; }
        .bars span:nth-child(3) { height: 14px; }
        .bars span:nth-child(4) { height: 18px; opacity: 0.2; }

        .brand-name {
          font-family: var(--fd);
          font-size: 1.6rem;
          letter-spacing: 0.05em;
          line-height: 1;
        }

        .hdr-gap { flex: 1; }

        .hdr-badge {
          display: flex; align-items: center; gap: 8px;
          padding: 0 18px;
          border-left: var(--B);
          font-size: 0.58rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--dim);
        }

        .dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--dim); flex-shrink: 0;
        }
        .dot.live { background: var(--red); animation: blink 1s steps(2) infinite; }
        .dot.wait { background: var(--yellow); animation: blink 1.5s steps(2) infinite; }
        .dot.init { background: #00b050; }
        @keyframes blink { 50% { opacity: 0; } }

        /* ─── ERROR BAR ─── */
        .errbar {
          flex-shrink: 0;
          background: var(--red-bg);
          border-bottom: 2px solid var(--red);
          padding: 10px 18px;
          font-size: 0.6rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          display: flex; align-items: center; gap: 10px;
          z-index: 19;
        }
        .errbar::before { content: 'ERR ›'; font-weight: 700; color: var(--red); }

        /* ─── VIDEOS (fill remaining space) ─── */
        .vids {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }

        .vslot {
          flex: 1;
          position: relative;
          background: #000;
          overflow: hidden;
          border-bottom: var(--B);
        }
        .vslot:last-child { border-bottom: none; }

        .vslot video {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
        }

        /* scanlines */
        .vslot::before {
          content: '';
          position: absolute; inset: 0;
          background: repeating-linear-gradient(
            to bottom, transparent 0px, transparent 2px,
            rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 3px
          );
          pointer-events: none; z-index: 3;
        }

        .vtag {
          position: absolute; top: 0; left: 0; z-index: 5;
          font-size: 0.5rem; font-weight: 700;
          letter-spacing: 0.3em; text-transform: uppercase;
          padding: 5px 10px;
          background: var(--bg); color: var(--white);
          border-right: 2px solid var(--white);
          border-bottom: 2px solid var(--white);
        }
        .vslot.stranger .vtag {
          background: var(--red); border-color: var(--red);
        }
        .vslot.stranger.live .vtag { animation: tagPulse 2s ease-in-out infinite; }
        @keyframes tagPulse {
          0%,100% { background: var(--red); }
          50% { background: #900; }
        }

        .vtimer {
          position: absolute; bottom: 10px; right: 12px; z-index: 5;
          font-size: 0.58rem; letter-spacing: 0.1em;
          color: rgba(224,16,16,0.7);
        }

        /* NO SIGNAL overlay */
        .nosig {
          position: absolute; inset: 0; z-index: 4;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 12px;
        }

        .nosig-txt {
          font-family: var(--fd);
          font-size: clamp(1.6rem, 10vw, 4rem);
          letter-spacing: 0.08em;
          color: rgba(240,238,233,0.05);
          user-select: none;
        }

        .static {
          display: grid; grid-template-columns: repeat(8, 5px); gap: 2px;
          opacity: 0.1;
        }
        .static span { width: 5px; height: 5px; background: var(--white); }

        .spin {
          width: 36px; height: 36px;
          border: 2px solid rgba(255,255,255,0.07);
          border-top-color: var(--red);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .wait-txt {
          font-size: 0.52rem; letter-spacing: 0.28em; text-transform: uppercase;
          color: rgba(240,238,233,0.25);
          animation: osc 2.2s ease-in-out infinite;
        }
        @keyframes osc { 0%,100% { opacity: 0.25; } 50% { opacity: 1; } }

        /* ═══ BUTTON BAR (fixed height, always visible) ═══ */
        .btnbar {
          flex-shrink: 0;
          border-top: var(--B);
          background: var(--bg);
          z-index: 20;
        }

        /* status strip inside btnbar */
        .bstatus {
          display: flex; align-items: center; justify-content: space-between;
          padding: 7px 16px;
          border-bottom: 1px solid var(--line);
          font-size: 0.55rem; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--dim);
        }
        .bstatus-l { display: flex; align-items: center; gap: 8px; }

        /* the actual buttons */
        .btns {
          display: flex;
          height: 72px;       /* tall, finger-friendly, never changes */
        }

        .btn {
          flex: 1;
          border: none;
          cursor: pointer;
          font-family: var(--fd);
          font-size: 2rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 20px;
          border-right: var(--B);
          transition: filter 0.1s, transform 0.08s;
          user-select: none;
          touch-action: manipulation;
          -webkit-appearance: none;
          outline: none;
        }
        .btn:last-child { border-right: none; }
        .btn:active { filter: brightness(1.4); transform: scale(0.96); }

        .btn-ico {
          font-family: var(--fm);
          font-size: 1rem; font-weight: 400;
          opacity: 0.4;
        }

        /* START — white fill, dark text */
        .btn-start { background: var(--white); color: var(--bg); }
        .btn-start:hover { background: #fff; }

        /* NEXT — yellow, always punchy */
        .btn-next { background: var(--yellow); color: #000; }
        .btn-next:hover { background: var(--yellow-h); }
        .btn-next:disabled {
          background: #252200; color: #555;
          cursor: not-allowed; pointer-events: none;
        }

        /* END — dark bg, red text → fills red on hover */
        .btn-end { background: var(--bg); color: var(--red); }
        .btn-end:hover { background: var(--red); color: var(--white); }

        /* INIT — loading state */
        .btn-init {
          background: var(--surface); color: var(--dim);
          cursor: not-allowed; pointer-events: none;
          justify-content: center; gap: 14px;
          font-size: 0.65rem; letter-spacing: 0.22em;
        }

        /* RETRY — same as start */
        .btn-retry { background: var(--red); color: var(--white); }
        .btn-retry:hover { background: #ff2020; }

        /* ─── FOOTER ─── */
        .ftr {
          border-top: 1px solid var(--line);
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 16px;
          font-size: 0.46rem; letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--dim); flex-shrink: 0;
          background: var(--bg);
        }

        /* ═══ DESKTOP ═══ */
        @media (min-width: 768px) {
          .hdr { height: 60px; }
          .brand-name { font-size: 1.9rem; }

          /* side-by-side layout */
          .vids { flex-direction: row; }
          .vslot { border-bottom: none; border-right: var(--B); }
          .vslot:last-child { border-right: none; }

          /* controls move to right sidebar */
          .shell { flex-direction: column; }
          .mid { display: flex; flex: 1; min-height: 0; }

          .vids-wrap {
            flex: 1; display: flex; flex-direction: row;
            border-right: var(--B);
          }

          .sidebar {
            width: 240px; display: flex; flex-direction: column;
            border-left: none;
          }

          .btnbar {
            border-top: none;
            border-left: var(--B);
          }

          .btns {
            flex-direction: column;
            height: auto; flex: 1;
          }

          .btn {
            border-right: none;
            border-bottom: var(--B);
            flex: 1;
            font-size: 2.2rem;
            padding: 0 22px;
          }
          .btn:last-child { border-bottom: none; }
        }
      `}</style>

      <div className="shell">

        {/* ── HEADER ── */}
        <header className="hdr">
          <div className="hdr-brand">
            <div className="bars"><span /><span /><span /><span /></div>
            <span className="brand-name">BRUTAL TALKS</span>
          </div>

          <div className="hdr-gap" />

          <div className="hdr-badge">
            <span className={`dot ${
              appState === "CONNECTED"        ? "live" :
              appState === "WAITING"          ? "wait" :
              appState === "REQUESTING_MEDIA" ? "init" : ""
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
        {errorMsg && <div className="errbar">{errorMsg}</div>}

        {/* ── VIDEOS ── */}
        <div className="vids">
          {/* Stranger */}
          <div className={`vslot stranger${appState === "CONNECTED" ? " live" : ""}`}>
            <video ref={remoteVideoRef} autoPlay playsInline />
            <span className="vtag">
              {appState === "CONNECTED" ? "● STRANGER" : "STRANGER"}
            </span>
            {appState === "CONNECTED" && (
              <div className="vtimer">{fmt(sessionTime)}</div>
            )}
            {appState !== "CONNECTED" && (
              <div className="nosig">
                <div className="nosig-txt">NO SIGNAL</div>
                <div className="static">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <span key={i} style={{ opacity: [1,.3,.7,.15,.9,.4,.6,1,.2,.8,.4,.55,1,.3,.65,.5][i] }} />
                  ))}
                </div>
                {appState === "WAITING" && (
                  <>
                    <div className="spin" />
                    <div className="wait-txt">SEARCHING FOR STRANGER</div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* You */}
          <div className="vslot">
            <video ref={localVideoRef} autoPlay muted playsInline />
            <span className="vtag">YOU</span>
            {appState === "IDLE" && (
              <div className="nosig">
                <div className="nosig-txt">CAMERA</div>
              </div>
            )}
          </div>
        </div>

        {/* ══ BUTTON BAR — always pinned, always 72px tall ══ */}
        <div className="btnbar">
          {/* status strip */}
          <div className="bstatus">
            <div className="bstatus-l">
              <span className={`dot ${
                appState === "CONNECTED" ? "live" :
                appState === "WAITING"   ? "wait" : ""
              }`} />
              <span>
                {appState === "IDLE"             && "READY TO CONNECT"}
                {appState === "REQUESTING_MEDIA" && "REQUESTING CAMERA..."}
                {appState === "WAITING"          && "FINDING MATCH…"}
                {appState === "CONNECTED"        && `SESSION · ${fmt(sessionTime)}`}
                {appState === "ERROR"            && "CONNECTION FAILED"}
              </span>
            </div>
            <span>P2P · NO LOG</span>
          </div>

          {/* buttons */}
          <div className="btns">

            {appState === "IDLE" && (
              <button className="btn btn-start" onClick={start}>
                <span>START TALKING</span>
                <span className="btn-ico">→</span>
              </button>
            )}

            {appState === "REQUESTING_MEDIA" && (
              <div className="btn btn-init">
                <div className="spin" style={{ width: 22, height: 22, borderWidth: 2 }} />
                <span>INITIALISING</span>
              </div>
            )}

            {appState === "ERROR" && (
              <button className="btn btn-retry" onClick={start}>
                <span>RETRY</span>
                <span className="btn-ico">↺</span>
              </button>
            )}

            {isActive && (
              <>
                <button
                  className="btn btn-next"
                  onClick={next}
                  disabled={appState === "WAITING"}
                >
                  <span>NEXT</span>
                  <span className="btn-ico">↻</span>
                </button>

                <button className="btn btn-end" onClick={disconnect}>
                  <span>END</span>
                  <span className="btn-ico">✕</span>
                </button>
              </>
            )}

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
