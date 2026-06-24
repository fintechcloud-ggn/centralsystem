import React, { useEffect, useRef } from 'react';
import NoSleep from 'nosleep.js';
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
    const noSleep = new NoSleep();
    let wakeLock = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
          console.log('Wake Lock is active! TV will stay awake.');
        }
      } catch (err) {
        console.error(`Wake Lock error: ${err.name}, ${err.message}`);
      }
    };

    const enableNoSleep = () => {
      if (videoRef.current) {
        videoRef.current.play().catch(e => console.error("Custom video play error:", e));
      }
      noSleep.enable();
      requestWakeLock();
      console.log("NoSleep.js and WakeLock enabled on user interaction!");
      document.removeEventListener('click', enableNoSleep, false);
      document.removeEventListener('touchstart', enableNoSleep, false);
    };

    document.addEventListener('click', enableNoSleep, false);
    document.addEventListener('touchstart', enableNoSleep, false);

    const handleVisibilityChange = async () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('click', enableNoSleep, false);
      document.removeEventListener('touchstart', enableNoSleep, false);
      if (wakeLock !== null) {
        wakeLock.release().catch(console.error);
      }
      noSleep.disable();
    };
  }, []);

  return (
  <>
    <video
      ref={videoRef}
      src="/keep-awake-video.mp4"
      loop
      muted
      playsInline
      style={{ position: 'fixed', zIndex: -9999, opacity: 0.01, width: '1px', height: '1px', pointerEvents: 'none' }}
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
