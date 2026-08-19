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
    // The only browser-side lever that actually reaches a TV's power manager is
    // real, continuous media playback. Synthetic key/mouse events, zero-gain
    // AudioContext oscillators and requestAnimationFrame loops do not — they
    // never leave the page sandbox, so they were removed. PalmServiceBridge is
    // likewise unavailable to browser pages (privileged webOS apps only).
    //
    // Anything beyond this has to be done in the TV's own settings:
    // Auto Power Off, Power Off after No Signal, Energy Saving, and Store Mode.
    let watchdog = null;
    let wakeLock = null;
    let released = false;

    // Keep the decoder running. If the element stalled or the TV suspended it,
    // reload the source before retrying so play() has something to resume from.
    const ensureVideoPlaying = () => {
      const video = videoRef.current;
      if (!video) return;
      if (video.error || video.readyState < 2) {
        try { video.load(); } catch (_) {}
      }
      if (video.paused || video.ended) {
        video.play().catch(() => {});
      }
    };

    // Works on newer WebOS builds (Chromium 84+); harmless no-op on older ones.
    const acquireWakeLock = async () => {
      if (!('wakeLock' in navigator) || released) return;
      try {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => {
          if (!released && document.visibilityState === 'visible') acquireWakeLock();
        });
      } catch (_) {}
    };

    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      acquireWakeLock();
      ensureVideoPlaying();
    };

    ensureVideoPlaying();
    acquireWakeLock();
    document.addEventListener('visibilitychange', onVisibilityChange);
    watchdog = setInterval(ensureVideoPlaying, 10000);

    return () => {
      released = true;
      clearInterval(watchdog);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      wakeLock?.release().catch(() => {});
    };
  }, []);

  return (
  <>
    {/*
      autoplay + muted + loop = WebOS starts this without a user gesture.
      It must stay full-size and composited: a 32px, near-transparent element
      gets treated as decorative and does not hold the display awake. Sitting at
      zIndex -1 behind the opaque page content keeps it invisible while the
      decoder stays genuinely active, which is what the TV's power manager sees.
      Do not use display:none, visibility:hidden or opacity:0 here — each one
      lets the browser drop the decoder and the whole thing stops working.
    */}
    {/* <video
      ref={videoRef}
      src="/keep-awake-video.mp4"
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        objectFit: 'cover',
        zIndex: -1,
        opacity: 0.02,
        pointerEvents: 'none',
      }}
    /> */}
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
