import React, { useEffect, useRef, useState } from "react";
import { getSocket } from "../lib/socket";

export default function VideoCallDisplay({ onCallEnded }) {
  const videoRef = useRef(null);
  const pcRef = useRef(null);
  const [streamConnected, setStreamConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Default muted to ensure 100% Chrome autoplay

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

        // Attempt playback (muted by default so Chrome/WebOS never blocks autoplay)
        videoRef.current
          .play()
          .catch((err) => console.warn("Video play error:", err));
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc:ice_candidate", {
          candidate: event.candidate
        });
      }
    };

    const handleOffer = async ({ adminSocketId, offer }) => {
      try {
        if (!offer) return;
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc:answer", {
          adminSocketId,
          answer
        });
      } catch (err) {
        console.error("Error handling offer in VideoCallDisplay:", err);
      }
    };

    const handleIceCandidate = async ({ candidate }) => {
      try {
        if (candidate && pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error("Error adding ice candidate in viewer:", err);
      }
    };

    const handleCallEnded = () => {
      if (onCallEnded) onCallEnded();
    };

    socket.on("webrtc:offer", handleOffer);
    socket.on("webrtc:ice_candidate", handleIceCandidate);
    socket.on("call:ended", handleCallEnded);

    // Notify backend that a viewer display has mounted and is ready to receive stream
    socket.emit("viewer:join");

    return () => {
      socket.off("webrtc:offer", handleOffer);
      socket.off("webrtc:ice_candidate", handleIceCandidate);
      socket.off("call:ended", handleCallEnded);
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
