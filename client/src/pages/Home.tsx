import { useWebRTC } from "@/hooks/use-webrtc";

export default function Home() {
  const {
    appState,
    errorMsg,
    localVideoRef,
    remoteVideoRef,
    start,
    disconnect,
  } = useWebRTC();

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-6 gap-6">
      {/* HEADER */}
      <header className="w-full max-w-md border-4 border-white p-4 text-center">
        <h1 className="text-3xl font-black tracking-tight">
          KAGAMI
        </h1>
        <p className="text-xs mt-1 opacity-70">
          RAW • LIVE • NO LOGIN
        </p>
      </header>

      {/* STATUS */}
      <div className="w-full max-w-md border-2 border-white p-3 text-center text-sm font-mono">
        {appState === "IDLE" && "READY"}
        {appState === "REQUESTING_MEDIA" && "REQUESTING CAMERA / MIC"}
        {appState === "WAITING" && "WAITING FOR STRANGER"}
        {appState === "CONNECTED" && "CONNECTED"}
        {appState === "ERROR" && "ERROR"}
      </div>

      {/* ERROR */}
      {errorMsg && (
        <div className="w-full max-w-md border-2 border-red-500 text-red-400 p-3 text-sm text-center">
          {errorMsg}
        </div>
      )}

      {/* VIDEOS */}
      <section className="w-full max-w-md flex flex-col gap-4">
        {/* REMOTE VIDEO */}
        <div className="border-4 border-white aspect-video bg-black relative">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-1 left-1 text-xs bg-black px-1 border border-white">
            STRANGER
          </span>
        </div>

        {/* LOCAL VIDEO */}
        <div className="border-2 border-white aspect-video bg-black relative">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-1 left-1 text-xs bg-black px-1 border border-white">
            YOU
          </span>
        </div>
      </section>

      {/* CONTROLS */}
      <section className="w-full max-w-md flex gap-3">
        {appState === "IDLE" && (
          <button
            onClick={start}
            className="flex-1 border-4 border-white py-4 font-black text-lg hover:bg-white hover:text-black transition"
          >
            START
          </button>
        )}

        {(appState === "WAITING" || appState === "CONNECTED") && (
          <button
            onClick={disconnect}
            className="flex-1 border-4 border-red-500 text-red-400 py-4 font-black text-lg hover:bg-red-500 hover:text-black transition"
          >
            DISCONNECT
          </button>
        )}
      </section>

      {/* FOOTER */}
      <footer className="mt-auto text-[10px] opacity-40 text-center">
        no accounts • no history • no mercy
      </footer>
    </main>
  );
      }
