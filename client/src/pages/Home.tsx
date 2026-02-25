import React, { useEffect } from 'react';
import { useWebRTC } from '@/hooks/use-webrtc';
import { BrutalButton } from '@/components/BrutalButton';
import { NoiseOverlay } from '@/components/NoiseOverlay';
import { VideoOff, MicOff, AlertTriangle, Zap, XSquare } from 'lucide-react';

export default function Home() {
  const { 
    appState, 
    errorMsg, 
    localVideoRef, 
    remoteVideoRef, 
    start, 
    next, 
    disconnect 
  } = useWebRTC();

  // Prevent accidental back navigation closing the call
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (appState === 'CONNECTED' || appState === 'WAITING') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [appState]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-background selection:bg-accent selection:text-black flex flex-col items-center justify-center">
      <NoiseOverlay />

      {/* BACKGROUND GRAPHIC (Visible when idle) */}
      {(appState === 'IDLE' || appState === 'ERROR') && (
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
          <span className="text-[20vw] font-bold leading-none tracking-tighter mix-blend-overlay">RAW.</span>
        </div>
      )}

      {/* VIEW: IDLE / ENTRY */}
      {appState === 'IDLE' && (
        <div className="relative z-10 max-w-lg w-full px-6 flex flex-col items-center text-center space-y-12">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
              NO <span className="text-accent">LOGIN.</span><br/>
              NO <span className="text-accent">LOGS.</span>
            </h1>
            <p className="text-muted-foreground text-lg border-l-4 border-accent pl-4 text-left">
              Instant, ephemeral video connections.
              Mechanical matchmaking.
              Close the tab and you cease to exist.
            </p>
          </div>
          
          <BrutalButton onClick={start} fullWidth className="h-24 text-2xl">
            <Zap className="mr-3 h-8 w-8" />
            INITIALIZE
          </BrutalButton>
          
          <div className="flex gap-4 text-xs text-muted-foreground opacity-50">
            <span className="flex items-center"><VideoOff className="w-4 h-4 mr-1"/> Camera Required</span>
            <span className="flex items-center"><MicOff className="w-4 h-4 mr-1"/> Mic Required</span>
          </div>
        </div>
      )}

      {/* VIEW: ERROR */}
      {appState === 'ERROR' && (
        <div className="relative z-10 max-w-md w-full px-6 flex flex-col items-center text-center space-y-8">
          <AlertTriangle className="h-24 w-24 text-destructive animate-pulse" />
          <h2 className="text-4xl font-bold text-destructive">FATAL ERROR</h2>
          <div className="bg-destructive/10 border-2 border-destructive p-4 w-full">
            <p className="text-destructive font-mono text-lg">{errorMsg}</p>
          </div>
          <BrutalButton onClick={() => disconnect()} variant="outline" fullWidth>
            ACKNOWLEDGE
          </BrutalButton>
        </div>
      )}

      {/* VIEW: REQUESTING MEDIA */}
      {appState === 'REQUESTING_MEDIA' && (
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
