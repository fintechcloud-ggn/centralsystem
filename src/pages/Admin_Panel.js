import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

function ChevronIcon({ collapsed }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      {collapsed ? <path d="M9 6l6 6-6 6" /> : <path d="M15 6l-6 6 6 6" />}
    </svg>
  );
}

function AdminPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-200">

      <div
        className={`fixed inset-0 z-20 bg-black/60 backdrop-blur-sm transition-opacity md:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-30 h-full transform transition-all duration-300 md:static md:translate-x-0
        ${isSidebarCollapsed ? "md:w-20" : "md:w-72"}
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar
          closeSidebar={() => setSidebarOpen(false)}
          collapsed={isSidebarCollapsed}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Header */}
        <header className="relative h-40 flex items-center justify-between border-b border-slate-700/60 bg-slate-900/60 px-6 py-4 backdrop-blur-xl">

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-200 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              Menu
            </button>

            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-600 bg-slate-800 text-slate-300 transition hover:bg-slate-700"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <ChevronIcon collapsed={isSidebarCollapsed} />
            </button>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-700 bg-gradient-to-r from-slate-800/80 to-slate-700/60 px-6 py-3 shadow-[0_0_40px_rgba(99,102,241,0.15)] backdrop-blur-xl">

              <div className="h-10 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />

              <div>
                <p className="text-base font-semibold tracking-wide text-white">
                  Admin Control Center
                </p>
                <p className="text-xs text-slate-400">
                  Employees, contests, and content operations
                </p>
              </div>
            </div>
          </div>

        </header>

        {/* Page Content */}
        <main className="min-h-0 flex-1 overflow-y-auto bg-slate-900/40 p-6">
          <div className="rounded-2xl bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}

export default AdminPanel;