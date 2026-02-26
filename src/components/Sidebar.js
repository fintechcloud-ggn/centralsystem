import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { clearAdminToken } from "./adminAuth";
function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAdminToken();
    navigate("/login");
  };

  return (
    <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-700 text-white min-h-screen p-6">
      <div className="mb-10">
        <h1 className="text-2xl font-bold">ADMIN</h1>
        <p className="text-sm tracking-widest text-blue-200">DASHBOARD</p>
      </div>

      <ul className="space-y-6">
        <li > <Link to="/admin/NewUser" className="hover:text-blue-300 text-white cursor-pointer no-underline">
            Add new User
          </Link></li>
        <li className="hover:text-blue-300 cursor-pointer">Add new Contest</li>
        <li className="hover:text-blue-300 cursor-pointer">Edit Existing</li>
        <li className="hover:text-blue-300 cursor-pointer">Delete Existing</li>
        <li>
          <button type="button" onClick={handleLogout} className="hover:text-blue-300 cursor-pointer text-white bg-transparent border-0 p-0">
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
