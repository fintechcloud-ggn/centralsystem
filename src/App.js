import './App.css';
import BirthdayCard from './components/BirthdayCard';
import AdminPanel from './pages/Admin_Panel';
import { Route, Routes } from 'react-router-dom';
import Login from './pages/LoginPage';
import NewUser from './pages/AddNewUser';
import AdminOverview from './pages/AdminOverview';
import AddNewContest from './pages/AddNewContest';
import EditExisting from './pages/EditExisting';
import DeleteExisting from './pages/DeleteExisting';
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
    <Route index element={<AdminOverview/>}/>
    <Route path="NewUser" element={<NewUser/>}/>
    <Route path="add-contest" element={<AddNewContest/>}/>
    <Route path="edit-existing" element={<EditExisting/>}/>
    <Route path="delete-existing" element={<DeleteExisting/>}/>
    </Route>
  </Routes>
  </>
  );
}

export default App;
