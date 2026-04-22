import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { getAdminToken } from "../components/adminAuth";
import PaginationFooter from "../components/PaginationFooter";
import { apiUrl } from "../lib/api";

const formatLogAction = (log) => {
  const label = String(log.action || "")
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  if (["create_employee", "update_employee", "delete_employee"].includes(log.action) && log.entity_id) {
    return `${label} #${log.entity_id}`;
  }

  return label;
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const formatRole = (role) =>
  String(role || "-")
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = getAdminToken();
        const response = await axios.get(apiUrl("/api/activity-logs"), {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setLogs(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    if (!normalizedQuery) return logs;

    return logs.filter((log) =>
      [
        log.admin_email,
        log.admin_role,
        log.action,
        log.entity_type,
        log.entity_id
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [logs, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / rowsPerPage));
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredLogs.slice(startIndex, startIndex + rowsPerPage);
  }, [currentPage, filteredLogs, rowsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <section className="mx-auto w-full max-w-6xl space-y-5 2xl:max-w-[90rem]">
      <div className="rounded-[28px] border border-white/80 bg-gradient-to-r from-[#f7f6fd] via-[#f8f5fb] to-[#efe5ff] p-5 shadow-[0_18px_50px_rgba(148,163,184,0.12)] md:p-7">
        <h2 className="text-2xl font-bold text-slate-800">Activity Logs</h2>
        <p className="mt-1 text-sm text-slate-500">
          Admin and super admin actions are recorded here with identity and timestamp.
        </p>
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by admin, action, entity"
          className="mt-4 w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
        />
      </div>

      <div className="w-full overflow-x-auto rounded-[28px] border border-white/80 bg-white/70 shadow-[0_16px_45px_rgba(148,163,184,0.12)] backdrop-blur-sm">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-[#f8f7fc] text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Admin</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Action</th>
              {/* <th className="px-4 py-3 font-medium">Entity</th> */}
              {/* <th className="px-4 py-3 font-medium">Details</th> */}
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.length > 0 ? (
              paginatedLogs.map((log) => (
                <tr key={log.id} className="border-t border-[#efedf8]">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                    {formatDateTime(log.created_at)}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">{log.admin_email || "-"}</td>
                  <td className="px-4 py-3 text-slate-700">{formatRole(log.admin_role)}</td>
                  <td className="px-4 py-3 text-slate-700">{formatLogAction(log)}</td>
                  {/* <td className="px-4 py-3 text-slate-700">
                    {log.entity_type || "-"} {log.entity_id ? `#${log.entity_id}` : ""}
                  </td> */}
                  {/* <td className="max-w-md px-4 py-3 text-slate-600">{formatDetails(log.details)}</td> */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  {loading ? "Loading logs..." : "No activity logs found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PaginationFooter
        currentPage={currentPage}
        totalItems={filteredLogs.length}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={setRowsPerPage}
      />
    </section>
  );
}

export default ActivityLogs;
