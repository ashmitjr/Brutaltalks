import React, { useEffect } from "react";
import { useWebRTC } from "@/hooks/use-webrtc";
import { BrutalButton } from "@/components/BrutalButton";
import { NoiseOverlay } from "@/components/NoiseOverlay";
import {
  VideoOff,
  MicOff,
  AlertTriangle,
  Zap,
  XSquare,
} from "lucide-react";

export default function Home() {
  const {
    appState,
    errorMsg,
    localVideoRef,
    remoteVideoRef,
    start,
    next,
    disconnect,
  } = useWebRTC();

  // Prevent accidental tab close during session
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (appState === "CONNECTED" || appState === "WAITING") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [appState]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-background flex items-center justify-center">
      <NoiseOverlay />

      {/* ================= IDLE ================= */}
      {appState === "IDLE" && (
        <div className="z-10 text-center space-y-10">
          <h1 className="text-6xl font-bold tracking-tighter">
            NO <span className="text-accent">LOGIN</span>
            <br />
            NO <span className="text-accent">LOGS</span>
          </h1>

          <BrutalButton onClick={start} className="h-24 text-2xl">
            <Zap className="mr-3 h-8 w-8" />
            INITIALIZE
          </BrutalButton>

          <div className="flex gap-6 text-xs opacity-60 justify-center">
            <span className="flex items-center">
              <VideoOff className="mr-1 h-4 w-4" />
              Camera Required
            </span>
            <span className="flex items-center">
              <MicOff className="mr-1 h-4 w-4" />
              Mic Required
            </span>
          </div>
        </div>
      )}

      {/* ================= ERROR ================= */}
      {appState === "ERROR" && (
        <div className="z-10 text-center space-y-6">
          <AlertTriangle className="h-20 w-20 text-destructive mx-auto" />
          <p className="font-mono text-destructive">{errorMsg}</p>
          <BrutalButton onClick={disconnect}>RESET</BrutalButton>
        </div>
      )}

      {/* ================= WAITING / CONNECTED ================= */}
      {(appState === "WAITING" || appState === "CONNECTED") && (
        <div className="absolute inset-0 bg-black">
          {/* Remote Video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Waiting Overlay */}
          {appState === "WAITING" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <h2 className="text-6xl font-bold text-accent animate-pulse">
                SEARCHING…
              </h2>
            </div>
          )}

          {/* Local Self Video */}
          <div className="absolute top-4 right-4 w-40 aspect-video bg-black brutal-border z-20">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              disablePictureInPicture
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 left-0 bg-background px-2 text-xs font-bold">
              YOU
            </span>
          </div>

          {/* Controls */}
          <div className="absolute bottom-0 w-full h-32 bg-background brutal-border flex gap-4 p-4">
            <BrutalButton
              variant="destructive"
              onClick={disconnect}
              className="flex-1"
            >
              <XSquare className="mr-2" />
              END
            </BrutalButton>

            <BrutalButton
              onClick={next}
              className="flex-[2] text-3xl bg-accent text-black"
            >
              NEXT →
            </BrutalButton>
          </div>
        </div>
      )}
    </main>
  );
}            className="absolute inset-0 w-full h-full object-cover bg-black"
          />

          {/* Waiting Overlay */}
          {appState === "WAITING" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <h2 className="text-6xl font-bold text-accent animate-pulse">
                SEARCHING…
              </h2>
            </div>
          )}

          {/* Local Video */}
          <div className="absolute top-4 right-4 w-40 aspect-video bg-black z-20 brutal-border">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              disablePictureInPicture
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 left-0 bg-background px-2 text-xs font-bold">
              YOU
            </span>
          </div>

          {/* Controls */}
          <div className="absolute bottom-0 w-full h-32 bg-background brutal-border flex gap-4 p-4">
            <BrutalButton
              variant="destructive"
              onClick={disconnect}
              className="flex-1"
            >
              <XSquare className="mr-2" />
              END
            </BrutalButton>

            <BrutalButton
              onClick={next}
              className="flex-[2] text-3xl bg-accent text-black"
            >
              NEXT →
            </BrutalButton>
          </div>
        </div>
      )}
    </main>
  );
}              </h2>
            </div>
          )}

          {/* Local */}
          <div className="absolute top-4 right-4 w-40 aspect-video brutal-border bg-black z-20">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              disablePictureInPicture
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 left-0 bg-background px-2 text-xs font-bold">
              YOU
            </span>
          </div>

          {/* Controls */}
          <div className="absolute bottom-0 w-full h-32 bg-background brutal-border flex gap-4 p-4">
            <BrutalButton variant="destructive" onClick={disconnect} className="flex-1">
              <XSquare className="mr-2" /> END
            </BrutalButton>
            <BrutalButton onClick={next} className="flex-[2] text-3xl bg-accent text-black">
              NEXT →
            </BrutalButton>
          </div>
        </div>
      )}
    </main>
  );
        }      {appState === 'REQUESTING_MEDIA' && (
        <div className="relative z-10 flex flex-col items-center space-y-8">
          <div className="w-16 h-16 border-4 border-foreground border-t-accent animate-spin" />
          <h2 className="text-2xl font-bold animate-pulse">AWAITING HARDWARE PERMISSIONS...</h2>
        </div>
      )}

      {/* VIEW: ACTIVE SESSION (Waiting or Connected) */}
      {(appState === 'WAITING' || appState === 'CONNECTED') && (
        <div className="absolute inset-0 flex flex-col">
          
          {/* Main Remote Video Area */}
          <div className="relative flex-1 bg-black overflow-hidden">
            {appState === 'WAITING' ? (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
                <h2 className="text-4xl md:text-6xl font-bold text-accent animate-flash tracking-widest">
                  SEARCHING...
                </h2>
              </div>
            ) : (
              <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover filter contrast-125 saturate-110"
              />
            )}

            {/* Local Video Inset */}
            <div className="absolute top-4 right-4 w-1/3 max-w-[180px] aspect-[3/4] md:aspect-video brutal-border bg-black shadow-2xl z-20">
              <video 
                ref={localVideoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-300"
              />
              <div className="absolute bottom-0 left-0 bg-background px-2 py-1 text-xs font-bold border-t-2 border-r-2 border-foreground">
                YOU
              </div>
            </div>
            
            {/* Target Status Label */}
            {appState === 'CONNECTED' && (
              <div className="absolute top-4 left-4 bg-accent text-black px-3 py-1 font-bold tracking-widest brutal-border text-sm">
                TARGET ACQUIRED
              </div>
            )}
          </div>

          {/* Controls Dock */}
          <div className="h-32 md:h-40 bg-background brutal-border border-l-0 border-r-0 border-b-0 p-4 flex gap-4 z-30">
            <BrutalButton 
              variant="destructive" 
              onClick={disconnect}
              className="flex-1 text-lg md:text-2xl"
            >
              <XSquare className="mr-2 h-6 w-6 md:h-8 md:w-8" />
              <span className="hidden md:inline">DISCONNECT</span>
              <span className="md:hidden">END</span>
            </BrutalButton>
            
            <BrutalButton 
              onClick={next}
              className="flex-[2] text-2xl md:text-4xl bg-accent text-black hover:bg-foreground active:bg-white border-accent brutal-shadow-none shadow-none"
            >
              NEXT &#10142;
            </BrutalButton>
          </div>
        </div>
      )}

    </main>
  );
}
