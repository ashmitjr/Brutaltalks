import { useWebRTC } from "@/hooks/useWebRTC";

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

  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden flex flex-col">
      {/* Remote Video */}
      <div className="relative flex-1 bg-black">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Waiting Overlay */}
        {appState === "WAITING" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-widest text-white animate-pulse">
              SEARCHING…
            </h2>
          </div>
        )}

        {/* Error Overlay */}
        {appState === "ERROR" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-30 text-white gap-4">
            <p className="text-lg text-red-400">{errorMsg}</p>
            <button
              onClick={start}
              className="px-6 py-3 bg-white text-black font-bold rounded"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Local Preview */}
      <div className="absolute bottom-24 right-4 w-28 h-40 sm:w-40 sm:h-56 border border-white/20 rounded-lg overflow-hidden z-40">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      {/* Controls */}
      <div className="h-20 flex items-center justify-center gap-4 bg-black z-50">
        {appState === "IDLE" && (
          <button
            onClick={start}
            className="px-8 py-3 bg-white text-black font-bold rounded-full"
          >
            Start
          </button>
        )}

        {appState === "CONNECTED" && (
          <>
            <button
              onClick={next}
              className="px-6 py-3 bg-yellow-400 text-black font-bold rounded-full"
            >
              Next
            </button>
            <button
              onClick={disconnect}
              className="px-6 py-3 bg-red-500 text-white font-bold rounded-full"
            >
              End
            </button>
          </>
        )}
      </div>
    </main>
  );
}      {(appState === "WAITING" || appState === "CONNECTED") && (
        <section className="absolute inset-0 bg-black">
          {/* Remote Video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Waiting Overlay */}
          {appState === "WAITING" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
              <h2 className="text-4xl md:text-6xl font-bold animate-pulse">
                MATCHING…
              </h2>
            </div>
          )}

          {/* Local Preview (Mobile-safe) */}
          <div className="absolute top-3 right-3 w-28 md:w-40 aspect-video bg-black border-2 border-white z-20">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 left-0 bg-black px-1 text-[10px] font-bold">
              YOU
            </span>
          </div>

          {/* Bottom Controls (Thumb-friendly) */}
          <div className="absolute bottom-0 left-0 w-full h-24 md:h-28 bg-black border-t-2 border-white flex gap-3 p-3 z-30">
            <BrutalButton
              variant="destructive"
              onClick={disconnect}
              className="flex-1 text-sm md:text-base"
            >
              <X className="mr-1" />
              END
            </BrutalButton>

            <BrutalButton
              onClick={next}
              className="flex-[2] text-lg md:text-2xl bg-white text-black"
            >
              <SkipForward className="mr-2" />
              NEXT
            </BrutalButton>
          </div>
        </section>
      )}
    </main>
  );
}            playsInline
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
