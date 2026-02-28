import { NavLink, useNavigate } from "react-router-dom";
import { clearAdminToken } from "./adminAuth";

function MenuIcon({ children, className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function MenuGlyph({ type }) {
  if (type === "overview") {
    return (
      <MenuIcon>
        <rect x="3" y="3" width="8" height="8" rx="1" />
        <rect x="13" y="3" width="8" height="5" rx="1" />
        <rect x="13" y="10" width="8" height="11" rx="1" />
        <rect x="3" y="13" width="8" height="8" rx="1" />
      </MenuIcon>
    );
  }

  if (type === "add-user") {
    return (
      <MenuIcon>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
        <path d="M18 8v6M15 11h6" />
      </MenuIcon>
    );
  }

  if (type === "contest") {
    return (
      <MenuIcon>
        <path d="M8 4h8v3a4 4 0 0 1-8 0V4z" />
        <path d="M10 14h4M12 10v8M9 20h6" />
        <path d="M8 5H5a2 2 0 0 0 0 4h1M16 5h3a2 2 0 0 1 0 4h-1" />
      </MenuIcon>
    );
  }

  if (type === "edit") {
    return (
      <MenuIcon>
        <path d="M4 20h4l10-10-4-4L4 16v4z" />
        <path d="M12.5 7.5l4 4" />
      </MenuIcon>
    );
  }

  return (
    <MenuIcon>
      <path d="M4 7h16M10 11v6M14 11v6" />
      <path d="M6 7l1 13h10l1-13" />
      <path d="M9 7V4h6v3" />
    </MenuIcon>
  );
}

function Sidebar({ closeSidebar, collapsed = false }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAdminToken();
    navigate("/login");
  };

  const linkClassName = ({ isActive }) =>
    `w-full h-11 rounded-xl px-3 text-sm font-medium no-underline transition ${
      collapsed
        ? "flex items-center justify-center mr-7"
        : "grid grid-cols-[2.5rem_minmax(0,1fr)] items-center"
    } ${
      isActive
        ? collapsed
          ? "text-white"
          : "bg-white text-blue-950 shadow-sm"
        : "text-blue-100 hover:bg-white/10 hover:text-white"
    }`;

  const iconBadgeClass =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg ring-1";

  const commonItems = [
    {
      label: "Overview",
      to: "/admin",
      iconType: "overview"
    }
  ];

  const employeeItems = [
    {
      label: "Add New Employee",
      to: "/admin/NewUser",
      iconType: "add-user"
    },
    {
      label: "Edit Employee",
      to: "/admin/edit-existing",
      iconType: "edit"
    },
    {
      label: "Delete Employee",
      to: "/admin/delete-existing",
      iconType: "delete"
    }
  ];

  const contestItems = [
    {
      label: "Add New Contest",
      to: "/admin/add-contest",
      iconType: "contest"
    }
  ];

  const collapsedItems = [...commonItems, ...employeeItems, ...contestItems];

  const renderItem = (item) => (
    <li key={item.label}>
      <NavLink
        to={item.to}
        end={item.to === "/admin"}
        className={linkClassName}
        onClick={closeSidebar}
        title={item.label}
      >
        {({ isActive }) => (
          <>
            <span
              className={`${iconBadgeClass} ${
                isActive
                  ? "bg-blue-900/10 text-blue-900 ring-blue-900/20"
                  : collapsed
                    ? "bg-white/10 text-white ring-white/10"
                    : "bg-white/5 text-inherit ring-white/10"
              }`}
            >
              <MenuGlyph type={item.iconType} />
            </span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </>
        )}
      </NavLink>
    </li>
  );

  return (
    <aside
      className={`flex min-h-screen w-full flex-col bg-gradient-to-b from-slate-950 via-blue-950 to-blue-900 p-4 text-white shadow-xl md:p-5 ${
        collapsed ? "md:items-center" : ""
      }`}
    >
      <div className="mb-3 w-full border-b border-white/10 pb-4">
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
            <MenuGlyph type="overview" />
          </span>
          {!collapsed && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-200">
                Central System
              </p>
              <p className="text-base font-semibold leading-5 text-white">Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      {collapsed ? (
        <ul className="flex w-full flex-col items-center space-y-0.5">
          {collapsedItems.map(renderItem)}
        </ul>
      ) : (
        <>
          <p className="mb-0.5 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300">
            Dashboard
          </p>
          <ul className="w-full space-y-0.5">{commonItems.map(renderItem)}</ul>

          <p className="mb-0.5 mt-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300">
            Employee Menu
          </p>
          <ul className="w-full space-y-0.5">{employeeItems.map(renderItem)}</ul>

          <p className="mb-0.5 mt-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300">
            Contest Menu
          </p>
          <ul className="w-full space-y-0.5">{contestItems.map(renderItem)}</ul>
        </>
      )}

      {!collapsed && (
        <div className="mt-6 w-full rounded-xl border border-white/15 bg-white/5 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-200">Quick Tip</p>
          <p className="mt-2 text-sm leading-5 text-blue-100">
            Use Overview first, then choose an action from the menu to keep admin tasks organized.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handleLogout}
        className={`mt-auto h-11 w-full rounded-xl border border-white/20 bg-white/10 px-3 text-sm font-medium text-blue-100 transition hover:bg-white/15 hover:text-white ${
          collapsed
            ? "flex items-center justify-center"
            : "grid grid-cols-[2.5rem_minmax(0,1fr)] items-center text-left"
        }`}
        title="Logout"
      >
        <span
          className={`${iconBadgeClass} ${
            collapsed
              ? "bg-white/10 text-white ring-white/30"
              : "bg-white/5 text-inherit ring-white/10"
          }`}
        >
          <MenuIcon>
            <path d="M10 17l5-5-5-5" />
            <path d="M15 12H8" />
            <path d="M5 4h6a1 1 0 0 1 1 1v3" />
            <path d="M5 20h6a1 1 0 0 0 1-1v-3" />
            <path d="M5 4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1" />
          </MenuIcon>
        </span>
        {!collapsed && <span>Logout</span>}
      </button>
    </aside>
  );
}

export default Sidebar;
