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

    setErrorMsg("");
    setAppState("IDLE");
  }, [cleanupPeer]);

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

            localStreamRef.current?.getTracks().forEach(track =>
              pc.addTrack(track, localStreamRef.current!)
            );

            pc.ontrack = e => {
              if (!remoteStreamRef.current) {
                remoteStreamRef.current = new MediaStream();
                if (remoteVideoRef.current) {
                  remoteVideoRef.current.srcObject = remoteStreamRef.current;
                  remoteVideoRef.current.playsInline = true;
                }
              }
              remoteStreamRef.current.addTrack(e.track);
            };

            pc.onicecandidate = e => {
              if (e.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(
                  JSON.stringify({
                    type: "iceCandidate",
                    payload: { candidate: e.candidate },
                  })
                );
              }
            };

            if (data.payload?.initiator) {
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
            await pcRef.current.setRemoteDescription(data.payload.sdp);
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
    },
    [cleanupPeer]
  );

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

        wsRef.current.onmessage = e =>
          handleSignal(JSON.parse(e.data));

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

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  return {
    appState,
    errorMsg,
    localVideoRef,
    remoteVideoRef,
    start,
    disconnect,
  };
                          }
