import React from "react";
import Sidebar from "../components/Sidebar";
import CreateEmployee from "../components/CreateEmployee";
import { Outlet } from "react-router-dom";
function AdminPanel() {
  return (
      <div className="flex h-screen overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-5 bg-gray-100 overflow-hidden">
        <Outlet />
      </div>

    </div>
  );
}

export default AdminPanel;