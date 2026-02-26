import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { getAdminToken } from "../components/adminAuth";

const quickActions = [
  { label: "Add New Employee", to: "/admin/NewUser" },
  { label: "Add New Contest", to: "/admin/add-contest" },
  { label: "Edit Employee", to: "/admin/edit-existing" },
  { label: "Delete Employee", to: "/admin/delete-existing" }
];

function AdminOverview() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = getAdminToken();
        const response = await axios.get(`${API_BASE_URL}/api/employees`, {
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
  }, [API_BASE_URL]);

  const stats = useMemo(() => {
    const working = employees.filter((item) => item.status === "Working").length;
    const biometricActive = employees.filter((item) => item.biometric_status === "Active").length;
    const maleCount = employees.filter((item) => item.gender === "Male").length;

    return [
      { label: "Employees", value: String(employees.length), change: "Total records" },
      { label: "Working", value: String(working), change: "Current status" },
      { label: "Biometric Active", value: String(biometricActive), change: "Attendance ready" },
      { label: "Male", value: String(maleCount), change: "Gender split" }
    ];
  }, [employees]);

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-800 p-6 text-white shadow-lg md:p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-blue-200">Control Center</p>
        <h2 className="mt-2 text-2xl font-semibold md:text-3xl">Welcome back, Admin</h2>
        <p className="mt-2 max-w-2xl text-sm text-blue-100 md:text-base">
          Employee widgets now update from live database records.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className="rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-white no-underline backdrop-blur-sm transition hover:bg-white/20"
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
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? "..." : item.value}</p>
            <p className="mt-2 text-sm text-emerald-600">{item.change}</p>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <h3 className="text-lg font-semibold text-slate-900">Recent Employees</h3>
        <div className="mt-4 space-y-2 text-sm text-slate-600">
          {employees.slice(0, 5).map((item) => (
            <p key={item.employee_code} className="rounded-lg bg-slate-50 px-4 py-3">
              {item.employee_code} - {item.employee_name} ({item.designation || "-"})
            </p>
          ))}
          {!loading && employees.length === 0 && (
            <p className="rounded-lg bg-slate-50 px-4 py-3">No employees found yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminOverview;
