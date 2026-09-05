import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import AdminVideoCallModal from "../components/AdminVideoCallModal";

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
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-gradient-to-br from-[#f4f1fb] via-[#f8f7fc] to-[#eef3ff] text-slate-700">

      <div
        className={`fixed inset-0 z-20 bg-black/60 backdrop-blur-sm transition-opacity md:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-30 h-full w-[min(20rem,86vw)] transform transition-all duration-300 md:static md:translate-x-0
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
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">

        {/* Header */}
        <header className="relative flex flex-col gap-4 border-b border-slate-200/60 bg-white/70 px-4 py-3.5 backdrop-blur-md sm:px-6 lg:flex-row lg:items-center lg:justify-between shadow-xs">

          {/* Left Side: Sidebar Toggle + Admin Control Center */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-white md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              Menu
            </button>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/90 text-slate-600 shadow-xs transition-all duration-200 hover:bg-white hover:border-indigo-300 hover:text-indigo-600 active:scale-95"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <ChevronIcon collapsed={isSidebarCollapsed} />
            </button>

            {/* Admin Control Center Card (Left Side) */}
            <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-md transition-all hover:border-slate-300">
              <div className="h-8 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold tracking-tight text-slate-900">
                    Admin Control Center
                  </p>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 border border-emerald-200/60">
                    <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-400">
                  Employees, contests, and content operations
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Start Live Video Call Broadcast Button Card */}
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setIsCallModalOpen(true)}
              className="flex items-center gap-3.5 rounded-2xl border border-red-200/80 bg-white/85 px-4 py-2.5 shadow-[0_4px_20px_rgba(225,29,72,0.06)] backdrop-blur-md text-left transition-all duration-200 hover:border-red-300 hover:bg-white hover:shadow-[0_6px_24px_rgba(225,29,72,0.12)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="h-8 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-red-500 via-rose-500 to-pink-500" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold tracking-tight text-slate-900">
                    Live Video Broadcast
                  </p>
                  <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600 border border-red-200/60">
                    <span className="mr-1 h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    Ready
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-400">
                  Click to start live video call stream
                </p>
              </div>
            </button>
          </div>

        </header>

        <AdminVideoCallModal
          isOpen={isCallModalOpen}
          onClose={() => setIsCallModalOpen(false)}
        />

        {/* Page Content */}
        <main className="min-h-0 flex-1 overflow-y-auto bg-transparent p-3 sm:p-5 lg:p-6 2xl:p-8">
          <div className="min-h-full rounded-2xl border border-white/70 bg-white/55 p-3 shadow-[0_18px_60px_rgba(148,163,184,0.16)] backdrop-blur-xl sm:rounded-[32px] sm:p-5 lg:p-6 2xl:p-8">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}

export default AdminPanel;
