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

    // LG WebOS: ensure video is playing (HTML autoplay attr handles initial play,
    // but we also call .play() in case the attribute alone isn't enough)
    const ensureVideoPlaying = () => {
      const video = videoRef.current;
      if (video && video.paused) {
        video.play().catch(() => {});
      }
    };

    ensureVideoPlaying();

    // Try Screen Wake Lock API (works on modern Chromium; silently ignored on WebOS)
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

    // LG WebOS treats keyboard input as "user activity" — dispatch arrow key events
    // every 60s to prevent the OS-level screen saver / auto-off from triggering.
    keepAliveInterval = setInterval(() => {
      ensureVideoPlaying();
      // Arrow key down+up (harmless, won't scroll since no focused scrollable element)
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', keyCode: 39, bubbles: true }));
      document.dispatchEvent(new KeyboardEvent('keyup',   { key: 'ArrowRight', keyCode: 39, bubbles: true }));
    }, 60000);

    return () => {
      clearInterval(keepAliveInterval);
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
      style={{ position: 'fixed', zIndex: -9999, opacity: 0, width: '4px', height: '4px', pointerEvents: 'none' }}
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
