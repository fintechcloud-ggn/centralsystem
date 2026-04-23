import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { getAdminToken, isSuperUser, setAdminRole } from "../components/adminAuth";
import { apiUrl } from "../lib/api";
import PaginationFooter from "../components/PaginationFooter";

const quickActions = [
  { label: "Add New Employee", to: "/admin/NewUser" },
  { label: "Add New Contest", to: "/admin/add-contest" },
  { label: "Edit Contest", to: "/admin/edit-contest" },
  { label: "Delete Contest", to: "/admin/delete-contest", superUserOnly: true },
  { label: "Edit Employee", to: "/admin/edit-existing" },
  { label: "Delete Employee", to: "/admin/delete-existing", superUserOnly: true },
  { label: "Activity Logs", to: "/admin/activity-logs" }
];

function AdminOverview() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [canDelete, setCanDelete] = useState(isSuperUser());
  const visibleQuickActions = quickActions.filter(
    (action) => !action.superUserOnly || canDelete
  );

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = getAdminToken();
        const response = await axios.get(apiUrl("/api/employees"), {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setEmployees(response.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    const syncRole = async () => {
      try {
        const token = getAdminToken();
        if (!token) return;
        const response = await axios.get(apiUrl("/api/admin/verify"), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const role = response.data?.admin?.role;
        setAdminRole(role);
        setCanDelete(role === "super_user");
      } catch (error) {
        setCanDelete(isSuperUser());
      }
    };

    syncRole();
  }, []);

  const stats = useMemo(() => {
    const normalize = (value) => String(value || "").trim().toLowerCase();
    const currentStatuses = new Set(["working", "active"]);
    const inactiveStatuses = new Set(["inactive", "resigned", "left", "terminated"]);
    const working = employees.filter((item) => {
      const status = normalize(item.status);
      return currentStatuses.has(status) || (status && !inactiveStatuses.has(status));
    }).length;
    const biometricActive = employees.filter((item) => normalize(item.biometric_status) === "active").length;
    const maleCount = employees.filter((item) => normalize(item.gender) === "male").length;
    const femaleCount = employees.filter((item) => normalize(item.gender) === "female").length;

    return [
      { label: "Employees", value: String(employees.length), change: "Total records" },
      { label: "Working", value: String(working), change: "Current status" },
      { label: "Biometric Active", value: String(biometricActive), change: "Attendance ready" },
      {
        label: "Gender",
        value: {
          male: String(maleCount),
          female: String(femaleCount)
        },
        change: "Gender split"
      }
    ];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    if (!normalizedQuery) return employees;

    return employees.filter((item) =>
      [
        item.employee_code,
        item.employee_name,
        item.company,
        item.department,
        item.designation
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [employees, searchTerm]);

  const isShowingAllRows = rowsPerPage === "all";
  const totalPages = isShowingAllRows ? 1 : Math.max(1, Math.ceil(filteredEmployees.length / rowsPerPage));
  const paginatedEmployees = useMemo(() => {
    if (isShowingAllRows) return filteredEmployees;
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredEmployees.slice(startIndex, startIndex + rowsPerPage);
  }, [currentPage, filteredEmployees, isShowingAllRows, rowsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <section className="space-y-4 sm:space-y-6 2xl:mx-auto 2xl:max-w-7xl">
      <div className="rounded-[28px] border border-white/80 bg-gradient-to-r from-[#f7f6fd] via-[#f8f5fb] to-[#efe5ff] p-6 text-slate-700 shadow-[0_18px_50px_rgba(148,163,184,0.12)] md:p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-[#9d98bb]">Control Center</p>
        <h2 className="mt-2 text-2xl font-semibold md:text-3xl">Welcome back, Admin</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base">
          Employee widgets now update from live database records.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {visibleQuickActions.map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className="rounded-full border border-white/80 bg-white/75 px-4 py-3 text-sm font-medium text-slate-700 no-underline shadow-sm backdrop-blur-sm transition hover:bg-white"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <article
            key={item.label}
            className="rounded-[24px] border border-white/80 bg-white/75 p-5 shadow-[0_12px_35px_rgba(148,163,184,0.10)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(148,163,184,0.16)]"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            {typeof item.value === "string" ? (
              <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? "..." : item.value}</p>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#f7f6fd] px-3 py-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Male</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {loading ? "..." : item.value.male}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#f7f6fd] px-3 py-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Female</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {loading ? "..." : item.value.female}
                  </p>
                </div>
              </div>
            )}
            <p className="mt-2 text-sm text-emerald-600">{item.change}</p>
          </article>
        ))}
      </div>

      <div className="rounded-[28px] border border-white/80 bg-white/70 p-5 shadow-[0_16px_45px_rgba(148,163,184,0.12)] backdrop-blur-sm md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">All Employees</h3>
          </div>
          <div className="w-full md:max-w-sm">
            {/* <label className="mb-1 block text-sm font-medium text-slate-600">Search employee</label> */}
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by code, name, company, department"
              className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
            />
          </div>
        </div>

        {/* <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <p />
          <p>Page {currentPage} of {totalPages}</p>
        </div> */}

        <div className="mt-4 overflow-x-auto rounded-2xl border border-[#ece9f8] bg-white/70">
          <table className="min-w-[1280px] w-full text-left text-sm text-slate-600">
            <thead className="bg-[#f8f7fc] text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Code</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Company</th>
                <th className="px-4 py-3 font-semibold">Department</th>
                <th className="px-4 py-3 font-semibold">Division</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Designation</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Gender</th>
                <th className="px-4 py-3 font-semibold">DOB</th>
                <th className="px-4 py-3 font-semibold">DOJ</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Biometric</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.map((item) => (
                <tr key={item.employee_code} className="border-t border-[#efedf8]">
                  <td className="px-4 py-3 font-medium text-slate-900">{item.employee_code || "-"}</td>
                  <td className="px-4 py-3">{item.employee_name || "-"}</td>
                  <td className="px-4 py-3">{item.company || "-"}</td>
                  <td className="px-4 py-3">{item.department || "-"}</td>
                  <td className="px-4 py-3">{item.division || "-"}</td>
                  <td className="px-4 py-3">{item.location || "-"}</td>
                  <td className="px-4 py-3">{item.designation || "-"}</td>
                  <td className="px-4 py-3">{item.employment_type || "-"}</td>
                  <td className="px-4 py-3">{item.gender || "-"}</td>
                  <td className="px-4 py-3">{item.date_of_birth || "-"}</td>
                  <td className="px-4 py-3">{item.doj ? String(item.doj).slice(0, 10) : "-"}</td>
                  <td className="px-4 py-3">{item.status || "-"}</td>
                  <td className="px-4 py-3">{item.biometric_status || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && employees.length > 0 && filteredEmployees.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-slate-500">No employees match your search.</p>
          )}
          {!loading && employees.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-slate-500">No employees found yet.</p>
          )}
        </div>

        <PaginationFooter
          currentPage={currentPage}
          totalItems={filteredEmployees.length}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
        />
      </div>
    </section>
  );
}

export default AdminOverview;
