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
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#f4f1fb] via-[#f8f7fc] to-[#eef3ff] text-slate-700">

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
        <header className="relative h-40 flex items-center justify-between border-b border-white/60 bg-white/55 px-6 py-4 backdrop-blur-xl">

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-md border border-white/70 bg-white/75 px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              Menu
            </button>

            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/70 bg-white/75 text-slate-500 shadow-sm transition hover:bg-white"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <ChevronIcon collapsed={isSidebarCollapsed} />
            </button>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-4 rounded-[28px] border border-white/80 bg-white/65 px-6 py-3 shadow-[0_14px_40px_rgba(148,163,184,0.14)] backdrop-blur-xl">

              <div className="h-10 w-1 rounded-full bg-gradient-to-b from-[#c8b8ff] to-[#8cc8ff]" />

              <div>
                <p className="text-base font-semibold tracking-wide text-slate-800">
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
        <main className="min-h-0 flex-1 overflow-y-auto bg-transparent p-6">
          <div className="rounded-[32px] border border-white/70 bg-white/55 p-6 shadow-[0_18px_60px_rgba(148,163,184,0.16)] backdrop-blur-xl">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}

export default AdminPanel;
