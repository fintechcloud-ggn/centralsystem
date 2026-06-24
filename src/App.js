import React, { useEffect, useRef } from 'react';
import './App.css';
import BirthdayCard from './components/BirthdayCard';
import AnniversaryCardPage from './pages/AnniversaryCardPage';
import AdminPanel from './pages/Admin_Panel';
import { Route, Routes } from 'react-router-dom';
import Login from './pages/LoginPage';
import NewUser from './pages/AddNewUser';
import AdminOverview from './pages/AdminOverview';
import AddNewContest from './pages/AddNewContest';
import EditContest from './pages/EditContest';
import DeleteContest from './pages/DeleteContest';
import AddQuote from './pages/AddQuote';
import EditQuote from './pages/EditQuote';
import EditExisting from './pages/EditExisting';
import DeleteExisting from './pages/DeleteExisting';
import ActivityLogs from './pages/ActivityLogs';
import { Toaster } from "react-hot-toast";
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
function App() {
  const videoRef = useRef(null);

  useEffect(() => {
    let keepAliveInterval = null;
    let rafId = null;
    let audioCtx = null;

    const ensureVideoPlaying = () => {
      const video = videoRef.current;
      if (video && video.paused) {
        video.play().catch(() => {});
      }
    };

    ensureVideoPlaying();

    // Screen Wake Lock (modern Chromium; no-op on WebOS)
    if ('wakeLock' in navigator) {
      const acquireWakeLock = async () => {
        try {
          const lock = await navigator.wakeLock.request('screen');
          lock.addEventListener('release', () => {
            if (document.visibilityState === 'visible') acquireWakeLock();
          });
        } catch (_) {}
      };
      acquireWakeLock();
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') acquireWakeLock();
      });
    }

    // Continuous requestAnimationFrame loop — keeps the browser rendering pipeline
    // active so WebOS doesn't consider the page idle.
    const rafLoop = () => { rafId = requestAnimationFrame(rafLoop); };
    rafId = requestAnimationFrame(rafLoop);

    // Silent Web Audio oscillator — signals to the OS that media is active.
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
    } catch (_) {}

    // LG WebOS: PalmServiceBridge is a native API available in the WebOS browser.
    // Calling setDisplayOn every 20s directly prevents the display from sleeping.
    let webosBridge = null;
    try {
      if (typeof window.PalmServiceBridge !== 'undefined') {
        webosBridge = new window.PalmServiceBridge();
      }
    } catch (_) {}

    // Every 20s: call WebOS power service + dispatch input events as fallback.
    keepAliveInterval = setInterval(() => {
      ensureVideoPlaying();
      // Try WebOS native display-on call
      if (webosBridge) {
        try { webosBridge.call('luna://com.webos.service.tvpower/power/turnOn', '{}'); } catch (_) {}
        try { webosBridge.call('luna://com.webos.service.power2/setDisplayOn', '{}'); } catch (_) {}
      }
      // Fallback: input events
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', keyCode: 39, bubbles: true }));
      document.dispatchEvent(new KeyboardEvent('keyup',   { key: 'ArrowRight', keyCode: 39, bubbles: true }));
      document.dispatchEvent(new MouseEvent('mousemove',  { bubbles: true, clientX: 1, clientY: 1 }));
    }, 20000);

    return () => {
      clearInterval(keepAliveInterval);
      cancelAnimationFrame(rafId);
      audioCtx?.close();
    };
  }, []);

  return (
  <>
    {/*
      autoplay + muted + loop = WebOS plays this without user gesture.
      LG WebOS will not sleep the display while a video is actively playing.
      4x4 is large enough that WebOS counts it as real media (1x1 sometimes ignored).
    */}
    <video
      ref={videoRef}
      src="/keep-awake-video.mp4"
      autoPlay
      loop
      muted
      playsInline
      style={{ position: 'fixed', zIndex: -9999, opacity: 0.01, width: '32px', height: '32px', pointerEvents: 'none' }}
    />
<Toaster position="top-center" reverseOrder={false} />
  <Routes>
     <Route path="/" element={<BirthdayCard/>}/>
     <Route path="/anniversary" element={<AnniversaryCardPage/>}/>
     <Route path="/anniversary-card" element={<AnniversaryCardPage/>}/>
     <Route path="/login" element={<Login/>}/>
    <Route
      path="/admin"
      element={
        <ProtectedAdminRoute>
          <AdminPanel />
        </ProtectedAdminRoute>
      }
    >
    <Route index element={<AdminOverview/>}/>
    <Route path="NewUser" element={<NewUser/>}/>
    <Route path="add-contest" element={<AddNewContest/>}/>
    <Route path="edit-contest" element={<EditContest/>}/>
    <Route path="delete-contest" element={<DeleteContest/>}/>
    <Route path="add-quote" element={<AddQuote/>}/>
    <Route path="edit-quote" element={<EditQuote/>}/>
    <Route path="edit-existing" element={<EditExisting/>}/>
    <Route path="delete-existing" element={<DeleteExisting/>}/>
    <Route path="activity-logs" element={<ActivityLogs/>}/>
    </Route>
  </Routes>
  </>
  );
}

export default App;
