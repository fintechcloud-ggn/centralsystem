import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { getAdminToken } from "../components/adminAuth";

function DeleteExisting() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [deletingCode, setDeletingCode] = useState("");
  const [confirmCode, setConfirmCode] = useState("");

  const fetchEmployees = useCallback(async () => {
    const token = getAdminToken();
    const response = await axios.get(`${API_BASE_URL}/api/employees`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    setItems(response.data || []);
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchEmployees().catch((error) => console.error(error));
  }, [fetchEmployees]);

  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        `${item.employee_code} ${item.employee_name} ${item.department} ${item.designation}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [items, query]
  );

  const handleDelete = async (employeeCode) => {
    try {
      setDeletingCode(employeeCode);
      const token = getAdminToken();
      await axios.delete(`${API_BASE_URL}/api/employees/${employeeCode}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      await fetchEmployees();
      setConfirmCode("");
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.error || "Delete failed");
    } finally {
      setDeletingCode("");
    }
  };

  return (
    <section className="mx-auto w-full max-w-6xl space-y-5">
      <div className="rounded-[28px] border border-white/80 bg-gradient-to-r from-[#f7f6fd] via-[#f8f5fb] to-[#efe5ff] p-5 shadow-[0_18px_50px_rgba(148,163,184,0.12)] md:p-7">
        <h2 className="text-2xl font-bold text-slate-800">Delete Employee</h2>
        <p className="mt-1 text-sm text-slate-500">
          Records shown below are live from database. Deletion is permanent.
        </p>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by code, name, department, designation"
          className="mt-4 w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#ffc3cf]"
        />
      </div>

      <div className="overflow-x-auto rounded-[28px] border border-white/80 bg-white/70 shadow-[0_16px_45px_rgba(148,163,184,0.12)] backdrop-blur-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-[#f8f7fc] text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Employee Code</th>
              <th className="px-4 py-3 font-medium">Employee Name</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Designation</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <tr key={item.employee_code} className="border-t border-[#efedf8]">
                  <td className="px-4 py-3 font-medium text-slate-800">{item.employee_code}</td>
                  <td className="px-4 py-3 text-slate-700">{item.employee_name}</td>
                  <td className="px-4 py-3 text-slate-700">{item.department}</td>
                  <td className="px-4 py-3 text-slate-700">{item.designation}</td>
                  <td className="px-4 py-3 text-slate-700">{item.status}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setConfirmCode(item.employee_code)}
                      disabled={deletingCode === item.employee_code}
                      className="rounded-full bg-gradient-to-r from-[#ff8c8c] to-[#ff6f91] px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingCode === item.employee_code ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No employee records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {confirmCode && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#e6e2f4]/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-[0_18px_60px_rgba(148,163,184,0.18)] backdrop-blur-xl">
            <h3 className="text-lg font-semibold text-slate-900">Confirm Deletion</h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete employee <span className="font-semibold">{confirmCode}</span>?
            </p>
            <p className="mt-2 text-sm text-red-600">
              This will permanently remove employee details, and his/her birthday and anniversary will not be visible.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmCode("")}
                className="rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmCode)}
                disabled={deletingCode === confirmCode}
                className="rounded-full bg-gradient-to-r from-[#ff8c8c] to-[#ff6f91] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingCode === confirmCode ? "Deleting..." : "Delete Employee"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default DeleteExisting;
