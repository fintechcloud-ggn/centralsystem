import React, { useEffect, useRef, useState } from "react";
import { getSocket } from "../lib/socket";
import { apiUrl } from "../lib/api";

export default function AdminVideoCallModal({ isOpen, onClose }) {
  const localVideoRef = useRef(null);
  const peerConnectionsRef = useRef(new Map()); // Map of viewerId -> RTCPeerConnection
  const streamRef = useRef(null);

  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const screenStreamRef = useRef(null);

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
      closeAllPeerConnections();
    };
  }, [isOpen]);

  const closeAllPeerConnections = () => {
    peerConnectionsRef.current.forEach((pc) => {
      try {
        if (pc.signalingState !== "closed") pc.close();
      } catch (_) {}
    });
    peerConnectionsRef.current.clear();
  };

  const createPeerConnectionForViewer = async (viewerId) => {
    try {
      if (!viewerId) return;

      // Close existing connection for this viewer if present
      if (peerConnectionsRef.current.has(viewerId)) {
        const oldPc = peerConnectionsRef.current.get(viewerId);
        try {
          if (oldPc.signalingState !== "closed") oldPc.close();
        } catch (_) {}
        peerConnectionsRef.current.delete(viewerId);
      }

      const activeStream = screenStreamRef.current || streamRef.current;
      if (!activeStream) return;

      const pc = new RTCPeerConnection(configuration);

      activeStream.getTracks().forEach((track) => {
        pc.addTrack(track, activeStream);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const socket = getSocket();
          if (socket) {
            socket.emit("webrtc:ice_candidate", {
              targetSocketId: viewerId,
              candidate: event.candidate,
              viewerSocketId: viewerId
            });
          }

          fetch(apiUrl("/api/live-call/signal"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "admin_ice", viewerId, payload: event.candidate })
          }).catch(() => {});
        }
      };

      peerConnectionsRef.current.set(viewerId, pc);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const offerData = JSON.stringify(offer);

      const socket = getSocket();
      if (socket) {
        socket.emit("webrtc:offer", { viewerSocketId: viewerId, offer: offerData });
      }

      fetch(apiUrl("/api/live-call/signal"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "admin_offer", viewerId, payload: offerData })
      }).catch(() => {});
    } catch (err) {
      console.error(`Failed to create peer connection for viewer ${viewerId}:`, err);
    }
  };

  // Socket & Polling Event Listeners for Multi-Viewer Broadcast
  useEffect(() => {
    if (!isOpen || !isBroadcasting) return;

    const socket = getSocket();

    const handleViewerJoined = ({ viewerSocketId }) => {
      if (viewerSocketId) {
        createPeerConnectionForViewer(viewerSocketId);
      }
    };

    const handleViewerAnswer = async ({ viewerSocketId, answer }) => {
      try {
        const targetId = viewerSocketId || "default_viewer";
        const pc = peerConnectionsRef.current.get(targetId);
        if (pc && pc.signalingState === "have-local-offer" && answer) {
          const answerObj = typeof answer === "string" ? JSON.parse(answer) : answer;
          await pc.setRemoteDescription(new RTCSessionDescription(answerObj));
        }
      } catch (err) {
        console.error("Error setting viewer answer:", err);
      }
    };

    const handleViewerIceCandidate = async ({ viewerSocketId, candidate }) => {
      try {
        const targetId = viewerSocketId || "default_viewer";
        const pc = peerConnectionsRef.current.get(targetId);
        if (pc && pc.remoteDescription && candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (_) {}
    };

    if (socket) {
      socket.on("viewer:joined", handleViewerJoined);
      socket.on("webrtc:answer", handleViewerAnswer);
      socket.on("webrtc:ice_candidate", handleViewerIceCandidate);
    }

    // Polling fallback for REST API viewers
    const checkSignals = async () => {
      try {
        const res = await fetch(apiUrl("/api/live-call/signals"));
        if (!res.ok) return;

        const data = await res.json();
        if (data?.allViewers && Array.isArray(data.allViewers)) {
          for (const viewer of data.allViewers) {
            const vId = viewer.viewerId;
            if (!vId) continue;

            let pc = peerConnectionsRef.current.get(vId);

            // If viewer has no peer connection yet, create one
            if (!pc) {
              await createPeerConnectionForViewer(vId);
              pc = peerConnectionsRef.current.get(vId);
            }

            // Process answer if waiting for answer
            if (pc && pc.signalingState === "have-local-offer" && viewer.answer) {
              const answerObj = typeof viewer.answer === "string" ? JSON.parse(viewer.answer) : viewer.answer;
              await pc.setRemoteDescription(new RTCSessionDescription(answerObj));
            }

            // Process viewer ICE candidates
            if (pc && pc.remoteDescription && Array.isArray(viewer.viewerIceCandidates)) {
              for (const cand of viewer.viewerIceCandidates) {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(cand));
                } catch (_) {}
              }
            }
          }
        }
      } catch (err) {
        console.error("Error polling signals on admin:", err);
      }
    };

    const interval = setInterval(checkSignals, 1000);

    return () => {
      if (socket) {
        socket.off("viewer:joined", handleViewerJoined);
        socket.off("webrtc:answer", handleViewerAnswer);
        socket.off("webrtc:ice_candidate", handleViewerIceCandidate);
      }
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isBroadcasting]);

  const startBroadcast = async () => {
    try {
      if (!streamRef.current) return;

      closeAllPeerConnections();

      const socket = getSocket();
      if (socket) socket.emit("admin:start_call");

      await fetch(apiUrl("/api/live-call/start"), {
        method: "POST",
        headers: { "Content-Type": "application/json" }
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
    closeAllPeerConnections();
    onClose();
  };

  const stopMediaTracks = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        stopScreenShare();
        return;
      }

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      screenStreamRef.current = screenStream;
      const screenTrack = screenStream.getVideoTracks()[0];

      if (!screenTrack) return;

      screenTrack.onended = () => {
        stopScreenShare();
      };

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }

      // Replace track on ALL active viewer peer connections
      peerConnectionsRef.current.forEach(async (pc) => {
        const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
        if (sender) {
          await sender.replaceTrack(screenTrack);
        }
      });

      setIsScreenSharing(true);
    } catch (err) {
      if (err.name !== "NotAllowedError") {
        console.error("Screen share error:", err);
        setErrorMsg("Failed to share screen.");
      }
    }
  };

  const stopScreenShare = async () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }

    setIsScreenSharing(false);

    if (streamRef.current && localVideoRef.current) {
      localVideoRef.current.srcObject = streamRef.current;
      const cameraTrack = streamRef.current.getVideoTracks()[0];

      if (cameraTrack) {
        peerConnectionsRef.current.forEach(async (pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
          if (sender) {
            await sender.replaceTrack(cameraTrack);
          }
        });
      }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-md">
      <div className="relative flex flex-col w-full max-w-6xl h-[88vh] max-h-[800px] overflow-hidden rounded-3xl border border-white/20 bg-gray-950 shadow-2xl text-white">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-gray-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-lg font-bold tracking-wide">
              Admin Live Video Call Broadcast
            </h2>
            {isBroadcasting && (
              <span className="ml-2 rounded-full bg-red-600/90 px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-lg animate-pulse">
                ● Live on Display Screens ({peerConnectionsRef.current.size} TVs Connected)
              </span>
            )}
          </div>

          <button
            onClick={endBroadcast}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gray-300 transition hover:bg-white/20 hover:text-white"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Video Viewport */}
        <div className="relative flex-1 w-full bg-black overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />

          {errorMsg && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/90 p-6 text-center text-red-400">
              <p className="text-base font-medium">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 px-6 py-4 bg-gray-900/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMic}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all border ${
                micEnabled
                  ? "bg-white/10 text-white border-white/20 hover:bg-white/20"
                  : "bg-red-500/20 text-red-400 border-red-500/40"
              }`}
            >
              {micEnabled ? "🎤 Mic On" : "🎙️ Mic Off"}
            </button>

            <button
              onClick={toggleCamera}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all border ${
                cameraEnabled
                  ? "bg-white/10 text-white border-white/20 hover:bg-white/20"
                  : "bg-red-500/20 text-red-400 border-red-500/40"
              }`}
            >
              {cameraEnabled ? "📹 Camera On" : "📷 Camera Off"}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all border ${
                isScreenSharing
                  ? "bg-indigo-600 border-indigo-400 text-white animate-pulse hover:bg-indigo-500"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }`}
            >
              {isScreenSharing ? "🖥️ Stop Screen Share" : "🖥️ Share Screen"}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {!isBroadcasting ? (
              <button
                onClick={startBroadcast}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-500 hover:scale-105 active:scale-95"
              >
                🚀 Start Live Broadcast
              </button>
            ) : (
              <button
                onClick={endBroadcast}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-red-500 hover:scale-105 active:scale-95"
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

