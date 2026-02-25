import { useState, useEffect, useRef, useCallback } from "react";

type AppState =
  | "IDLE"
  | "REQUESTING_MEDIA"
  | "WAITING"
  | "CONNECTED"
  | "ERROR";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export function useWebRTC() {
  const [appState, setAppState] = useState<AppState>("IDLE");
  const [errorMsg, setErrorMsg] = useState("");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  /* ---------- MEDIA ---------- */
  const initLocalMedia = useCallback(async () => {
    if (localStreamRef.current) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localStreamRef.current = stream;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.muted = true;
      localVideoRef.current.playsInline = true;
    }
  }, []);

  /* ---------- CLEANUP ---------- */
  const cleanupPeer = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;

    remoteStreamRef.current?.getTracks().forEach(t => t.stop());
    remoteStreamRef.current = null;

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    cleanupPeer();

    wsRef.current?.close();
    wsRef.current = null;

    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    setAppState("IDLE");
    setErrorMsg("");
  }, [cleanupPeer]);

  /* ---------- SIGNAL HANDLER ---------- */
  const handleSignal = useCallback(async (data: any) => {
    try {
      switch (data.type) {
        case "waiting":
          setAppState("WAITING");
          break;

        case "paired": {
          cleanupPeer();
          setAppState("CONNECTED");

          const pc = new RTCPeerConnection(ICE_SERVERS);
          pcRef.current = pc;

          localStreamRef.current?.getTracks().forEach(track =>
            pc.addTrack(track, localStreamRef.current!)
          );

          pc.ontrack = (e) => {
            if (!remoteStreamRef.current) {
              remoteStreamRef.current = new MediaStream();
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStreamRef.current;
                remoteVideoRef.current.playsInline = true;
              }
            }
            remoteStreamRef.current.addTrack(e.track);
          };

          pc.onicecandidate = (e) => {
            if (e.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({
                type: "iceCandidate",
                payload: { candidate: e.candidate },
              }));
            }
          };

          if (data.payload?.initiator) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            wsRef.current?.send(JSON.stringify({
              type: "offer",
              payload: { sdp: offer },
            }));
          }
          break;
        }

        case "offer": {
          if (!pcRef.current) return;
          await pcRef.current.setRemoteDescription(data.payload.sdp);
          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          wsRef.current?.send(JSON.stringify({
            type: "answer",
            payload: { sdp: answer },
          }));
          break;
        }

        case "answer":
          await pcRef.current?.setRemoteDescription(data.payload.sdp);
          break;

        case "iceCandidate":
          await pcRef.current?.addIceCandidate(data.payload.candidate);
          break;

        case "partnerDisconnected":
          cleanupPeer();
          setAppState("WAITING");
          wsRef.current?.send(JSON.stringify({ type: "join" }));
          break;
      }
    } catch (err) {
      console.error("Signal error", err);
      setErrorMsg("SIGNAL ERROR");
      setAppState("ERROR");
    }
  }, [cleanupPeer]);

  /* ---------- START ---------- */
  const start = useCallback(async () => {
    try {
      setAppState("REQUESTING_MEDIA");
      setErrorMsg("");

      await initLocalMedia();

      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        const protocol = location.protocol === "https:" ? "wss" : "ws";
        wsRef.current = new WebSocket(`${protocol}://${location.host}/ws`);

        wsRef.current.onopen = () => {
          setAppState("WAITING");
          wsRef.current?.send(JSON.stringify({ type: "join" }));
        };

        wsRef.current.onmessage = e => handleSignal(JSON.parse(e.data));

        wsRef.current.onerror = () => {
          setErrorMsg("CONNECTION ERROR");
          setAppState("ERROR");
        };
      }
    } catch (err: any) {
      setErrorMsg(
        err.name === "NotAllowedError"
          ? "CAMERA / MIC DENIED"
          : "FAILED TO START"
      );
      setAppState("ERROR");
    }
  }, [handleSignal, initLocalMedia]);

  useEffect(() => () => disconnect(), [disconnect]);

  return {
    appState,
    errorMsg,
    localVideoRef,
    remoteVideoRef,
    start,
    disconnect,
  };
    }      localVideoRef.current.srcObject = null;
    }

    setErrorMsg("");
    setAppState("IDLE");
  }, [cleanupPeer]);

  /* -------------------- NEXT -------------------- */
  const next = useCallback(() => {
    cleanupPeer();
    setAppState("WAITING");

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "join" }));
    } else {
      start();
    }
  }, [cleanupPeer]);

  /* -------------------- SIGNALING -------------------- */
  const handleSignal = useCallback(
    async (data: any) => {
      try {
        switch (data.type) {
          case "waiting":
            setAppState("WAITING");
            break;

          case "paired": {
            cleanupPeer();
            setAppState("CONNECTED");

            const pc = new RTCPeerConnection(ICE_SERVERS);
            pcRef.current = pc;

            const localStream = localStreamRef.current!;
            localStream.getTracks().forEach((track) =>
              pc.addTrack(track, localStream)
            );

            pc.ontrack = (event) => {
              if (!remoteStreamRef.current) {
                remoteStreamRef.current = new MediaStream();
                if (remoteVideoRef.current) {
                  remoteVideoRef.current.srcObject =
                    remoteStreamRef.current;
                }
              }
              remoteStreamRef.current.addTrack(event.track);
            };

            pc.onicecandidate = (event) => {
              if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(
                  JSON.stringify({
                    type: "iceCandidate",
                    payload: { candidate: event.candidate },
                  })
                );
              }
            };

            if (data.payload.initiator) {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              wsRef.current?.send(
                JSON.stringify({
                  type: "offer",
                  payload: { sdp: offer },
                })
              );
            }
            break;
          }

          case "offer": {
            if (!pcRef.current) return;
            await pcRef.current.setRemoteDescription(
              new RTCSessionDescription(data.payload.sdp)
            );
            const answer = await pcRef.current.createAnswer();
            await pcRef.current.setLocalDescription(answer);
            wsRef.current?.send(
              JSON.stringify({
                type: "answer",
                payload: { sdp: answer },
              })
            );
            break;
          }

          case "answer":
            if (!pcRef.current) return;
            await pcRef.current.setRemoteDescription(
              new RTCSessionDescription(data.payload.sdp)
            );
            break;

          case "iceCandidate":
            if (!pcRef.current) return;
            await pcRef.current.addIceCandidate(
              new RTCIceCandidate(data.payload.candidate)
            );
            break;

          case "partnerDisconnected":
            cleanupPeer();
            setAppState("WAITING");
            wsRef.current?.send(JSON.stringify({ type: "join" }));
            break;
        }
      } catch (err) {
        console.error("Signal error:", err);
      }
    },
    [cleanupPeer]
  );

  /* -------------------- START -------------------- */
  const start = useCallback(async () => {
    try {
      setErrorMsg("");
      setAppState("REQUESTING_MEDIA");

      await initLocalMedia(); // 👈 self video guaranteed

      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        const protocol =
          window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws`;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setAppState("WAITING");
          ws.send(JSON.stringify({ type: "join" }));
        };

        ws.onmessage = (e) => {
          handleSignal(JSON.parse(e.data));
        };

        ws.onerror = () => {
          setErrorMsg("CONNECTION ERROR");
          setAppState("ERROR");
        };

        ws.onclose = () => {
          if (appState !== "IDLE") {
            setErrorMsg("CONNECTION LOST");
            setAppState("ERROR");
          }
        };
      } else {
        setAppState("WAITING");
        wsRef.current.send(JSON.stringify({ type: "join" }));
      }
    } catch (err: any) {
      setErrorMsg(
        err.name === "NotAllowedError"
          ? "CAMERA / MIC DENIED"
          : "FAILED TO START MEDIA"
      );
      setAppState("ERROR");
    }
  }, [appState, handleSignal, initLocalMedia]);

  /* -------------------- UNMOUNT -------------------- */
  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  return {
    appState,
    errorMsg,
    localVideoRef,
    remoteVideoRef,
    start,
    next,
    disconnect,
  };
        }          
          pc.current = new RTCPeerConnection(ICE_SERVERS);
          
          // Add local tracks
          if (localStream.current) {
            localStream.current.getTracks().forEach(track => {
              pc.current?.addTrack(track, localStream.current!);
            });
          }

          // Handle incoming remote tracks
          pc.current.ontrack = (event) => {
            if (!remoteStream.current) {
              remoteStream.current = new MediaStream();
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream.current;
              }
            }
            remoteStream.current.addTrack(event.track);
          };

          // Send ICE candidates
          pc.current.onicecandidate = (event) => {
            if (event.candidate && ws.current?.readyState === WebSocket.OPEN) {
              ws.current.send(JSON.stringify({
                type: 'iceCandidate',
                payload: { candidate: event.candidate }
              }));
            }
          };

          // If initiator, create and send offer
          if (data.payload.initiator) {
            const offer = await pc.current.createOffer();
            await pc.current.setLocalDescription(offer);
            ws.current?.send(JSON.stringify({
              type: 'offer',
              payload: { sdp: offer }
            }));
          }
          break;

        case 'offer':
          if (!pc.current) return;
          await pc.current.setRemoteDescription(new RTCSessionDescription(data.payload.sdp));
          const answer = await pc.current.createAnswer();
          await pc.current.setLocalDescription(answer);
          ws.current?.send(JSON.stringify({
            type: 'answer',
            payload: { sdp: answer }
          }));
          break;

        case 'answer':
          if (!pc.current) return;
          await pc.current.setRemoteDescription(new RTCSessionDescription(data.payload.sdp));
          break;

        case 'iceCandidate':
          if (!pc.current) return;
          try {
            await pc.current.addIceCandidate(new RTCIceCandidate(data.payload.candidate));
          } catch (e) {
            console.error('Error adding ICE candidate', e);
          }
          break;

        case 'partnerDisconnected':
          cleanupPC();
          setAppState('WAITING');
          ws.current?.send(JSON.stringify({ type: 'join' }));
          break;
          
        default:
          console.warn('Unknown WS message type:', data.type);
      }
    } catch (err) {
      console.error('Error handling signaling data:', err);
    }
  }, [cleanupPC]);

  const start = useCallback(async () => {
    try {
      setAppState('REQUESTING_MEDIA');
      setErrorMsg('');

      // 1. Get Media
      if (!localStream.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStream.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }

      // 2. Connect WebSocket
      if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
          setAppState('WAITING');
          ws.current?.send(JSON.stringify({ type: 'join' }));
        };

        ws.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleSignalingData(data);
          } catch (e) {
            console.error('Failed to parse WS message', e);
          }
        };

        ws.current.onerror = () => {
          setErrorMsg('CONNECTION ERROR');
          setAppState('ERROR');
        };

        ws.current.onclose = () => {
          if (appState !== 'IDLE') {
            setErrorMsg('CONNECTION LOST');
            setAppState('ERROR');
          }
        };
      } else {
        // WS already open, just join
        setAppState('WAITING');
        ws.current.send(JSON.stringify({ type: 'join' }));
      }
      
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.name === 'NotAllowedError' ? 'CAMERA/MIC DENIED' : 'FAILED TO START HARDWARE');
      setAppState('ERROR');
    }
  }, [appState, handleSignalingData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    appState,
    errorMsg,
    localVideoRef,
    remoteVideoRef,
    start,
    next,
    disconnect
  };
}
