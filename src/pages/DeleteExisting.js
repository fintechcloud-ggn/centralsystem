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
      <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-amber-50 p-5 shadow-sm md:p-7">
        <h2 className="text-2xl font-bold text-slate-900">Delete Employee</h2>
        <p className="mt-1 text-sm text-slate-600">
          Records shown below are live from database. Deletion is permanent.
        </p>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by code, name, department, designation"
          className="mt-4 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
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
                <tr key={item.employee_code} className="border-t border-slate-100">
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
                      className="rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
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
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
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
                className="rounded-md bg-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmCode)}
                disabled={deletingCode === confirmCode}
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
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
