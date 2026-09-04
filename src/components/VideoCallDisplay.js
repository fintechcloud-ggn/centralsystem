import React, { useEffect, useRef, useState } from "react";
import { getSocket } from "../lib/socket";
import { apiUrl } from "../lib/api";

export default function VideoCallDisplay({ onCallEnded }) {
  const videoRef = useRef(null);
  const pcRef = useRef(null);
  const [streamConnected, setStreamConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const socket = getSocket();
    const configuration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ]
    };

    const pc = new RTCPeerConnection(configuration);
    pcRef.current = pc;

    pc.ontrack = (event) => {
      if (videoRef.current && event.streams[0]) {
        videoRef.current.srcObject = event.streams[0];
        setStreamConnected(true);
        videoRef.current
          .play()
          .catch((err) => console.warn("Video play error:", err));
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        if (socket) socket.emit("webrtc:ice_candidate", { candidate: event.candidate });

        fetch(apiUrl("/api/live-call/signal"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "viewer_ice", payload: event.candidate })
        }).catch(() => {});
      }
    };

    const setupStreamFromOffer = async (offerStr) => {
      try {
        if (!offerStr || pc.remoteDescription) return;
        const offerObj = typeof offerStr === "string" ? JSON.parse(offerStr) : offerStr;

        await pc.setRemoteDescription(new RTCSessionDescription(offerObj));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        const answerData = JSON.stringify(answer);

        if (socket) socket.emit("webrtc:answer", { answer: answerData });

        fetch(apiUrl("/api/live-call/signal"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "answer", payload: answerData })
        }).catch(() => {});
      } catch (err) {
        console.error("Error setting up stream from offer:", err);
      }
    };

    // Socket Handlers
    const handleSocketOffer = ({ offer }) => {
      setupStreamFromOffer(offer);
    };

    const handleCallEnded = () => {
      if (onCallEnded) onCallEnded();
    };

    socket.on("webrtc:offer", handleSocketOffer);
    socket.on("call:ended", handleCallEnded);

    // Initial Fetch & Polling for signals over HTTP
    const pollSignals = async () => {
      try {
        const res = await fetch(apiUrl("/api/live-call/signals"));
        if (!res.ok) return;

        const data = await res.json();
        if (data?.offer && !pc.remoteDescription) {
          await setupStreamFromOffer(data.offer);
        }

        if (data?.adminIceCandidates && Array.isArray(data.adminIceCandidates)) {
          for (const cand of data.adminIceCandidates) {
            try {
              if (pc.remoteDescription && cand) {
                await pc.addIceCandidate(new RTCIceCandidate(cand));
              }
            } catch (_) {}
          }
        }
      } catch (err) {
        console.error("Error polling signals in display:", err);
      }
    };

    pollSignals();
    const interval = setInterval(pollSignals, 1000);

    return () => {
      socket.off("webrtc:offer", handleSocketOffer);
      socket.off("call:ended", handleCallEnded);
      clearInterval(interval);
      pc.close();
    };
  }, [onCallEnded]);

  const toggleSound = () => {
    if (videoRef.current) {
      const nextMutedState = !videoRef.current.muted;
      videoRef.current.muted = nextMutedState;
      setIsMuted(nextMutedState);
      if (!nextMutedState) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black overflow-hidden">
      {/* Live Badge Overlay */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-3 rounded-full bg-black/70 px-5 py-2.5 backdrop-blur-md border border-white/20 shadow-2xl">
        <span className="relative flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
        </span>
        <span className="text-sm font-black tracking-widest uppercase text-white">
          Live Admin Broadcast
        </span>
      </div>

      {/* Audio Sound Toggle Control */}
      <button
        onClick={toggleSound}
        className={`absolute top-6 right-6 z-20 flex items-center gap-2 rounded-full px-5 py-2.5 backdrop-blur-md border shadow-2xl text-sm font-bold transition-all ${
          isMuted
            ? "bg-amber-500/90 border-amber-400 text-black animate-bounce hover:bg-amber-400"
            : "bg-white/15 border-white/25 text-white hover:bg-white/25"
        }`}
      >
        {isMuted ? "🔊 Tap to Enable Audio" : "🔊 Sound On (Tap to Mute)"}
      </button>

      {/* Main Stream Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted}
        className="h-full w-full object-cover"
      />

      {/* Connecting Loader Overlay */}
      {!streamConnected && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/90 text-white gap-4 backdrop-blur-lg z-10">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-red-500 border-t-transparent shadow-lg shadow-red-500/50" />
          <p className="text-xl font-bold tracking-wide animate-pulse">
            Connecting to Live Admin Broadcast...
          </p>
        </div>
      )}
    </div>
  );
}
