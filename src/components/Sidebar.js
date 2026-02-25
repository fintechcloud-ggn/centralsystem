import { Link } from "react-router-dom";
function Sidebar() {
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
        <li className="hover:text-blue-300 cursor-pointer">Logout</li>
      </ul>
    </div>
  );
}

export default Sidebar;