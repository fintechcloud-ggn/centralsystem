import logo from './logo.svg';
import './App.css';
import BirthdayCard from './components/BirthdayCard';
import AdminPanel from './pages/Admin_Panel';
import { Route, Routes } from 'react-router-dom';
import CreateEmployee from './components/CreateEmployee';
import Login from './pages/LoginPage';
import NewUser from './pages/AddNewUser';
import { Toaster } from "react-hot-toast";
function App() {
  return (
  <>
<Toaster position="top-center" reverseOrder={false} />
  <Routes>
     <Route path="/" element={<BirthdayCard/>}/>
     <Route path="/login" element={<Login/>}/>
    <Route path="/admin" element={<AdminPanel/>}>
    <Route path="NewUser" element={<NewUser/>}/>
    </Route>
  </Routes>
  </>
  );
}

export default App;
