import { useWebRTC } from "@/hooks/use-webrtc";

export default function Home() {
  const {
    appState,
    localVideoRef,
    remoteVideoRef,
    start,
    next,
    disconnect,
  } = useWebRTC();

  return (
    <main className="w-screen h-screen bg-black flex flex-col">
      <div className="flex-1 relative">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        {appState === "WAITING" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <h1 className="text-white text-4xl font-bold">SEARCHING…</h1>
          </div>
        )}
      </div>

      <div className="absolute bottom-24 right-4 w-32 h-44 bg-black border">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      <div className="h-20 flex items-center justify-center gap-4 bg-black">
        {appState === "IDLE" && (
          <button onClick={start} className="bg-white px-6 py-2">
            Start
          </button>
        )}

        {appState === "CONNECTED" && (
          <>
            <button onClick={next} className="bg-yellow-400 px-4 py-2">
              Next
            </button>
            <button onClick={disconnect} className="bg-red-500 px-4 py-2">
              End
            </button>
          </>
        )}
      </div>
    </main>
  );
}
