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

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center">
      {/* ================= HEADER ================= */}
      <header className="w-full border-b-4 border-white px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">
          BRUTAL TALKS
        </h1>

        <div className="text-xs font-mono opacity-70">
          {appState}
        </div>
      </header>

      {/* ================= CONTENT ================= */}
      <section className="flex-1 w-full max-w-5xl px-4 py-6 flex flex-col gap-6">
        {/* ---------- ERROR ---------- */}
        {errorMsg && (
          <div className="border-4 border-red-500 text-red-400 p-4 font-mono text-sm">
            {errorMsg}
          </div>
        )}

        {/* ---------- VIDEOS ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Remote */}
          <div className="relative border-4 border-white aspect-video bg-black">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            <span className="absolute top-1 left-1 border border-white px-2 py-0.5 text-xs font-mono bg-black">
              STRANGER
            </span>

            {appState !== "CONNECTED" && (
              <div className="absolute inset-0 flex items-center justify-center text-xs font-mono opacity-50">
                NO SIGNAL
              </div>
            )}
          </div>

          {/* Local */}
          <div className="relative border-4 border-white aspect-video bg-black">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            <span className="absolute top-1 left-1 border border-white px-2 py-0.5 text-xs font-mono bg-black">
              YOU
            </span>
          </div>
        </div>

        {/* ---------- CONTROLS ---------- */}
        <div className="flex flex-col sm:flex-row gap-4">
          {appState === "IDLE" && (
            <button
              onClick={start}
              className="w-full border-4 border-white py-4 font-black text-lg hover:bg-white hover:text-black transition"
            >
              START TALKING
            </button>
          )}

          {(appState === "WAITING" || appState === "CONNECTED") && (
            <>
              <button
                onClick={next}
                className="flex-1 border-4 border-white py-4 font-black text-lg hover:bg-white hover:text-black transition"
              >
                NEXT
              </button>

              <button
                onClick={disconnect}
                className="flex-1 border-4 border-red-500 text-red-400 py-4 font-black text-lg hover:bg-red-500 hover:text-black transition"
              >
                DISCONNECT
              </button>
            </>
          )}
        </div>

        {/* ---------- STATUS STRIP ---------- */}
        <div className="border-t-4 border-white pt-3 text-xs font-mono flex justify-between opacity-70">
          <span>
            {appState === "IDLE" && "READY"}
            {appState === "REQUESTING_MEDIA" && "REQUESTING MEDIA"}
            {appState === "WAITING" && "MATCHING"}
            {appState === "CONNECTED" && "LIVE"}
            {appState === "ERROR" && "ERROR"}
          </span>
          <span>NO LOGIN • NO HISTORY</span>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="w-full border-t-4 border-white px-4 py-3 text-center text-[10px] font-mono opacity-50">
        brutal talks — raw human connection
      </footer>
    </main>
  );
        }
