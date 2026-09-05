import React, { useEffect, useRef, useState } from "react";
import { getSocket } from "../lib/socket";
import { apiUrl } from "../lib/api";

export default function VideoCallDisplay({ onCallEnded }) {
  const videoRef = useRef(null);
  const pcRef = useRef(null);
  const [streamConnected, setStreamConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const onCallEndedRef = useRef(onCallEnded);
  onCallEndedRef.current = onCallEnded;

  const processedCandidatesRef = useRef(new Set());

  useEffect(() => {
    const socket = getSocket();
    const configuration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" }
      ]
    };

    const pc = new RTCPeerConnection(configuration);
    pcRef.current = pc;

    pc.ontrack = (event) => {
      if (videoRef.current) {
        let stream = event.streams && event.streams[0];
        if (!stream) {
          if (!videoRef.current.srcObject) {
            videoRef.current.srcObject = new MediaStream();
          }
          stream = videoRef.current.srcObject;
          if (!stream.getTracks().some((t) => t.id === event.track.id)) {
            stream.addTrack(event.track);
          }
        } else {
          if (videoRef.current.srcObject !== stream) {
            videoRef.current.srcObject = stream;
          }
        }

        if (videoRef.current.paused) {
          videoRef.current
            .play()
            .catch((err) => console.warn("Video play error:", err));
        }

        setStreamConnected(true);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        if (socket) socket.emit("webrtc:ice_candidate", { candidate: event.candidate });

        fetch(apiUrl("/api/live-call/signal"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "viewer_ice", payload: event.candidate })
        }).catch(() => { });
      }
    };

    const setupStreamFromOffer = async (offerStr) => {
      try {
        if (!offerStr || pc.signalingState === "closed" || pc.remoteDescription) return;
        const offerObj = typeof offerStr === "string" ? JSON.parse(offerStr) : offerStr;

        await pc.setRemoteDescription(new RTCSessionDescription(offerObj));
        if (pc.signalingState === "closed") return;

        const answer = await pc.createAnswer();
        if (pc.signalingState === "closed") return;

        await pc.setLocalDescription(answer);
        if (pc.signalingState === "closed") return;

        const answerData = JSON.stringify(answer);

        if (socket) socket.emit("webrtc:answer", { answer: answerData });

        fetch(apiUrl("/api/live-call/signal"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "answer", payload: answerData })
        }).catch(() => { });
      } catch (err) {
        if (pc.signalingState !== "closed") {
          console.error("Error setting up stream from offer:", err);
        }
      }
    };

    // Socket Handlers
    const handleSocketOffer = ({ offer }) => {
      setupStreamFromOffer(offer);
    };

    const handleCallEnded = () => {
      if (onCallEndedRef.current) onCallEndedRef.current();
    };

    socket.on("webrtc:offer", handleSocketOffer);
    socket.on("call:ended", handleCallEnded);

    // Initial Fetch & Polling for signals over HTTP
    const pollSignals = async () => {
      try {
        if (pc.signalingState === "closed") return;

        const res = await fetch(apiUrl("/api/live-call/signals"));
        if (!res.ok || pc.signalingState === "closed") return;

        const data = await res.json();
        if (data?.offer && !pc.remoteDescription && pc.signalingState !== "closed") {
          await setupStreamFromOffer(data.offer);
        }

        if (data?.adminIceCandidates && Array.isArray(data.adminIceCandidates)) {
          for (const cand of data.adminIceCandidates) {
            try {
              if (!cand || pc.signalingState === "closed" || !pc.remoteDescription) continue;
              const candKey = typeof cand === "string" ? cand : JSON.stringify(cand);
              if (!processedCandidatesRef.current.has(candKey)) {
                processedCandidatesRef.current.add(candKey);
                await pc.addIceCandidate(new RTCIceCandidate(cand));
              }
            } catch (_) { }
          }
        }
      } catch (err) {
        if (pc.signalingState !== "closed") {
          console.error("Error polling signals in display:", err);
        }
      }
    };

    pollSignals();
    const interval = setInterval(pollSignals, 1000);

    return () => {
      socket.off("webrtc:offer", handleSocketOffer);
      socket.off("call:ended", handleCallEnded);
      clearInterval(interval);
      if (pc.signalingState !== "closed") {
        pc.close();
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      if (!isMuted) {
        videoRef.current.volume = 1.0;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isMuted]);

  const enableAudio = (e) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = 1.0;
      setIsMuted(false);
      videoRef.current.play().catch(() => { });
    }
  };

  const toggleSound = (e) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      const nextMutedState = !isMuted;
      videoRef.current.muted = nextMutedState;
      if (!nextMutedState) {
        videoRef.current.volume = 1.0;
      }
      setIsMuted(nextMutedState);
    }
  };

  return (
    <div
      onClick={enableAudio}
      className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black overflow-hidden cursor-pointer"
    >
      {/* Live Badge Overlay */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-3 rounded-full bg-black/70 px-5 py-2.5 backdrop-blur-md border border-white/20 shadow-2xl">
        <span className="relative flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
        </span>
        {/* <span className="text-sm font-black tracking-widest uppercase text-white">
          Live Admin Broadcast
        </span> */}
        <span className="text-sm font-black tracking-widest uppercase text-white">
          Live Admin Broadcast
        </span>
      </div>

      {/* Audio Sound Toggle Control */}
      <button
        onClick={toggleSound}
        className={`absolute top-6 right-6 z-20 flex items-center gap-2 rounded-full px-5 py-2.5 backdrop-blur-md border shadow-2xl text-sm font-bold transition-all ${isMuted
            ? "bg-amber-500/90 border-amber-400 text-black animate-bounce hover:bg-amber-400"
            : "bg-white/15 border-white/25 text-white hover:bg-white/25"
          }`}
      >
        {isMuted ? "🔊 Tap Anywhere to Enable Audio" : "🔊 Sound On (Tap to Mute)"}
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
