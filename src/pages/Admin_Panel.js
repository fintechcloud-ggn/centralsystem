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
        <header className="relative flex min-h-24 flex-col gap-4 border-b border-white/60 bg-white/55 px-4 py-4 backdrop-blur-xl sm:px-6 lg:min-h-28 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex w-full items-center justify-between gap-3 lg:w-auto lg:justify-start">
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

          <div className="flex w-full flex-wrap items-center justify-between gap-4 lg:w-auto lg:justify-end">
            <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/65 px-4 py-3 shadow-[0_14px_40px_rgba(148,163,184,0.14)] backdrop-blur-xl sm:gap-4 sm:rounded-[28px] sm:px-6">
              <div className="h-10 w-1 shrink-0 rounded-full bg-gradient-to-b from-[#c8b8ff] to-[#8cc8ff]" />
              <div className="min-w-0">
                <p className="text-base font-semibold tracking-wide text-slate-800">
                  Admin Control Center
                </p>
                <p className="text-xs text-slate-400">
                  Employees, contests, and content operations
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCallModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-red-500 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
              📹 Start Live Video Call Broadcast
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
