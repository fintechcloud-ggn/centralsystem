import React, { useEffect, useRef, useState } from "react";
import { getSocket } from "../lib/socket";
import { apiUrl } from "../lib/api";

export default function AdminVideoCallModal({ isOpen, onClose }) {
  const localVideoRef = useRef(null);
  const pcRef = useRef(null);
  const streamRef = useRef(null);

  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

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

  useEffect(() => {
    if (!isOpen) return;

    // Get User Media (Camera & Mic)
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("Camera access error:", err);
        setErrorMsg("Unable to access camera or microphone. Please check permissions.");
      });

    return () => {
      stopMediaTracks();
      if (pcRef.current) pcRef.current.close();
    };
  }, [isOpen]);

  const processedCandidatesRef = useRef(new Set());

  // Polling for viewer WebRTC answer and ICE candidates over REST API (Vercel Serverless Compatible)
  useEffect(() => {
    if (!isOpen || !isBroadcasting) return;

    const checkSignals = async () => {
      try {
        const pc = pcRef.current;
        if (!pc || pc.signalingState === "closed") return;

        const res = await fetch(apiUrl("/api/live-call/signals"));
        if (!res.ok || pc.signalingState === "closed") return;

        const data = await res.json();

        // If viewer answer received and not yet set
        if (data?.answer && pc.signalingState === "have-local-offer") {
          const answerObj = typeof data.answer === "string" ? JSON.parse(data.answer) : data.answer;
          await pc.setRemoteDescription(new RTCSessionDescription(answerObj));
        }

        // Add viewer ICE candidates
        if (data?.viewerIceCandidates && Array.isArray(data.viewerIceCandidates)) {
          for (const cand of data.viewerIceCandidates) {
            try {
              if (!cand || pc.signalingState === "closed" || !pc.remoteDescription) continue;
              const candKey = typeof cand === "string" ? cand : JSON.stringify(cand);
              if (!processedCandidatesRef.current.has(candKey)) {
                processedCandidatesRef.current.add(candKey);
                await pc.addIceCandidate(new RTCIceCandidate(cand));
              }
            } catch (_) {}
          }
        }
      } catch (err) {
        if (pcRef.current?.signalingState !== "closed") {
          console.error("Error polling signals on admin:", err);
        }
      }
    };

    const interval = setInterval(checkSignals, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isBroadcasting]);

  const startBroadcast = async () => {
    try {
      if (!streamRef.current) return;

      const pc = new RTCPeerConnection(configuration);
      pcRef.current = pc;

      // Add local video/audio tracks
      streamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, streamRef.current);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // Relay ICE candidate via Socket and REST API
          const socket = getSocket();
          if (socket) socket.emit("webrtc:ice_candidate", { candidate: event.candidate });

          fetch(apiUrl("/api/live-call/signal"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "admin_ice", payload: event.candidate })
          }).catch(() => {});
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const offerData = JSON.stringify(offer);

      // Emit via Socket
      const socket = getSocket();
      if (socket) socket.emit("admin:start_call", { offer: offerData });

      // Post via REST API for Vercel Serverless persistence
      await fetch(apiUrl("/api/live-call/start"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer: offerData })
      });

      setIsBroadcasting(true);
    } catch (err) {
      console.error("Failed to start broadcast:", err);
      setErrorMsg("Failed to start live broadcast.");
    }
  };

  const endBroadcast = () => {
    const socket = getSocket();
    if (socket) socket.emit("admin:end_call");

    fetch(apiUrl("/api/live-call/end"), { method: "POST" }).catch(() => {});

    setIsBroadcasting(false);
    stopMediaTracks();
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    onClose();
  };

  const stopMediaTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraEnabled(videoTrack.enabled);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/20 bg-gray-900 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-xl font-bold">Admin Live Video Call Broadcast</h2>
          </div>
          <button
            onClick={endBroadcast}
            className="rounded-full bg-white/10 p-2 hover:bg-white/20 text-gray-300 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Video Preview */}
        <div className="relative aspect-video w-full bg-black">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />

          {errorMsg && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-6 text-center text-red-400">
              <p>{errorMsg}</p>
            </div>
          )}

          {isBroadcasting && (
            <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-red-600/90 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-lg animate-pulse">
              ● Live on Display Screens
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 p-6">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMic}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all border ${
                micEnabled
                  ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  : "bg-red-500/20 border-red-500/40 text-red-400"
              }`}
            >
              {micEnabled ? "🎤 Mic On" : "🎙️ Mic Off"}
            </button>

            <button
              onClick={toggleCamera}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all border ${
                cameraEnabled
                  ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  : "bg-red-500/20 border-red-500/40 text-red-400"
              }`}
            >
              {cameraEnabled ? "📹 Camera On" : "📷 Camera Off"}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {!isBroadcasting ? (
              <button
                onClick={startBroadcast}
                className="rounded-xl bg-emerald-600 px-6 py-2.5 font-bold text-white shadow-lg hover:bg-emerald-500 transition-all hover:scale-105 active:scale-95"
              >
                🚀 Start Live Broadcast
              </button>
            ) : (
              <button
                onClick={endBroadcast}
                className="rounded-xl bg-red-600 px-6 py-2.5 font-bold text-white shadow-lg hover:bg-red-500 transition-all hover:scale-105 active:scale-95"
              >
                ⏹️ End Call Broadcast
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
