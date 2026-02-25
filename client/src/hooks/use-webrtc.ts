import { useState, useEffect, useRef, useCallback } from 'react';

type AppState = 'IDLE' | 'REQUESTING_MEDIA' | 'WAITING' | 'CONNECTED' | 'ERROR';

const ICE_SERVERS = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

export function useWebRTC() {
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const localStream = useRef<MediaStream | null>(null);
  const remoteStream = useRef<MediaStream | null>(null);
  
  const ws = useRef<WebSocket | null>(null);
  const pc = useRef<RTCPeerConnection | null>(null);

  // Clean up RTCPeerConnection
  const cleanupPC = useCallback(() => {
    if (pc.current) {
      pc.current.onicecandidate = null;
      pc.current.ontrack = null;
      pc.current.close();
      pc.current = null;
    }
    if (remoteStream.current) {
      remoteStream.current.getTracks().forEach(track => track.stop());
      remoteStream.current = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, []);

  // Full disconnect
  const disconnect = useCallback(() => {
    cleanupPC();
    if (ws.current) {
      if (ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: 'leave' }));
      }
      ws.current.close();
      ws.current = null;
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    setAppState('IDLE');
  }, [cleanupPC]);

  // Skip to next partner
  const next = useCallback(() => {
    cleanupPC();
    setAppState('WAITING');
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'join' }));
    } else {
      // If WS dropped, attempt full reconnect
      start();
    }
  }, [cleanupPC]);

  // Handle incoming signaling messages
  const handleSignalingData = useCallback(async (data: any) => {
    try {
      switch (data.type) {
        case 'waiting':
          setAppState('WAITING');
          break;

        case 'paired':
          console.log('Paired!', data.payload);
          setAppState('CONNECTED');
          cleanupPC();
          
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
