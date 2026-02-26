import logo from './logo.svg';
import './App.css';
import BirthdayCard from './components/BirthdayCard';
import AdminPanel from './pages/Admin_Panel';
import { Route, Routes } from 'react-router-dom';
import CreateEmployee from './components/CreateEmployee';
import Login from './pages/LoginPage';
import NewUser from './pages/AddNewUser';
import { Toaster } from "react-hot-toast";
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
function App() {
  return (
  <>
<Toaster position="top-center" reverseOrder={false} />
  <Routes>
     <Route path="/" element={<BirthdayCard/>}/>
     <Route path="/login" element={<Login/>}/>
    <Route
      path="/admin"
      element={
        <ProtectedAdminRoute>
          <AdminPanel />
        </ProtectedAdminRoute>
      }
    >
    <Route index element={<NewUser/>}/>
    <Route path="NewUser" element={<NewUser/>}/>
    </Route>
  </Routes>
  </>
  );
}

export default App;
