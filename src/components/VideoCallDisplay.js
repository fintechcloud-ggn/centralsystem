import React, { useEffect, useRef, useState } from "react";
import { getSocket } from "../lib/socket";

export default function VideoCallDisplay({ initialOffer, onCallEnded }) {
  const videoRef = useRef(null);
  const pcRef = useRef(null);
  const [streamConnected, setStreamConnected] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);

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
        // Play video automatically
        videoRef.current.play().catch((err) => {
          console.warn("Auto-play blocked or waiting for gesture:", err);
        });
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc:ice_candidate", { candidate: event.candidate });
      }
    };

    const handleOffer = async (offerData) => {
      try {
        if (!offerData?.offer) return;
        await pc.setRemoteDescription(new RTCSessionDescription(offerData.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc:answer", { answer });
      } catch (err) {
        console.error("Error handling offer in VideoCallDisplay:", err);
      }
    };

    const handleIceCandidate = async (data) => {
      try {
        if (data?.candidate && pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      } catch (err) {
        console.error("Error adding ice candidate:", err);
      }
    };

    const handleCallEnded = () => {
      if (onCallEnded) onCallEnded();
    };

    socket.on("webrtc:offer", handleOffer);
    socket.on("webrtc:ice_candidate", handleIceCandidate);
    socket.on("call:ended", handleCallEnded);

    // If offer was already present on mount
    if (initialOffer) {
      handleOffer({ offer: initialOffer });
    }

    return () => {
      socket.off("webrtc:offer", handleOffer);
      socket.off("webrtc:ice_candidate", handleIceCandidate);
      socket.off("call:ended", handleCallEnded);
      pc.close();
    };
  }, [initialOffer, onCallEnded]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setAudioMuted(videoRef.current.muted);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black">
      {/* Live Badge Overlay */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-3 rounded-full bg-black/60 px-5 py-2.5 backdrop-blur-md border border-white/20 shadow-2xl">
        <span className="relative flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
        </span>
        <span className="text-sm font-black tracking-widest uppercase text-white">
          Live Broadcast
        </span>
      </div>

      {/* Audio Mute Toggle Button */}
      <button
        onClick={toggleMute}
        className="absolute top-6 right-6 z-20 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-white backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all text-sm font-bold"
      >
        {audioMuted ? "🔇 Unmute Audio" : "🔊 Mute Audio"}
      </button>

      {/* Main Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="h-full w-full object-cover"
      />

      {/* Connecting Loader Overlay */}
      {!streamConnected && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/90 text-white gap-4 backdrop-blur-lg z-10">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-red-500 border-t-transparent shadow-lg shadow-red-500/50" />
          <p className="text-xl font-bold tracking-wide animate-pulse">
            Connecting to Admin Live Call...
          </p>
        </div>
      )}
    </div>
  );
}
