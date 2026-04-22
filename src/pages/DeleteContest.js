import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { getAdminToken } from "../components/adminAuth";
import { apiUrl } from "../lib/api";
import PaginationFooter from "../components/PaginationFooter";

function DeleteContest() {
  const [contests, setContests] = useState([]);
  const [query, setQuery] = useState("");
  const [confirmContest, setConfirmContest] = useState(null);
  const [deletingId, setDeletingId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchContests = useCallback(async () => {
    const response = await axios.get(apiUrl("/api/contests"));
    setContests(response.data || []);
  }, []);

  useEffect(() => {
    fetchContests().catch((error) => console.error(error));
  }, [fetchContests]);

  const filteredContests = useMemo(() => {
    const normalizedQuery = query.toLowerCase();
    return contests.filter((contest) =>
      `${contest.title} ${contest.category} ${contest.prize} ${contest.design_type}`
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [contests, query]);

  const totalPages = Math.max(1, Math.ceil(filteredContests.length / rowsPerPage));
  const paginatedContests = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredContests.slice(startIndex, startIndex + rowsPerPage);
  }, [currentPage, filteredContests, rowsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleDelete = async (contestId) => {
    try {
      setDeletingId(contestId);
      const token = getAdminToken();
      await axios.delete(apiUrl(`/api/contests/${contestId}`), {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      await fetchContests();
      setConfirmContest(null);
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.error || "Contest delete failed");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <section className="mx-auto w-full max-w-6xl space-y-5 2xl:max-w-[90rem]">
      <div className="rounded-[28px] border border-white/80 bg-gradient-to-r from-[#f7f6fd] via-[#f8f5fb] to-[#efe5ff] p-5 shadow-[0_18px_50px_rgba(148,163,184,0.12)] md:p-7">
        <h2 className="text-2xl font-bold text-slate-800">Delete Contest</h2>
        <p className="mt-1 text-sm text-slate-500">
          Select a contest from the live database list. Deletion is permanent.
        </p>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by title, category, prize, design"
          className="mt-4 w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#ffc3cf]"
        />
      </div>

      <div className="w-full overflow-x-auto rounded-[28px] border border-white/80 bg-white/70 shadow-[0_16px_45px_rgba(148,163,184,0.12)] backdrop-blur-sm">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-[#f8f7fc] text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Start Date</th>
              <th className="px-4 py-3 font-medium">End Date</th>
              <th className="px-4 py-3 font-medium">Design</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredContests.length > 0 ? (
              paginatedContests.map((contest) => (
                <tr key={contest.id} className="border-t border-[#efedf8]">
                  <td className="px-4 py-3 font-medium text-slate-800">{contest.title}</td>
                  <td className="px-4 py-3 text-slate-700">{contest.category}</td>
                  <td className="px-4 py-3 text-slate-700">{String(contest.starts_on || "").slice(0, 10)}</td>
                  <td className="px-4 py-3 text-slate-700">{String(contest.ends_on || "").slice(0, 10)}</td>
                  <td className="px-4 py-3 text-slate-700">{contest.design_type}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setConfirmContest(contest)}
                      disabled={deletingId === contest.id}
                      className="rounded-full bg-gradient-to-r from-[#ff8c8c] to-[#ff6f91] px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === contest.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No contest records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PaginationFooter
        currentPage={currentPage}
        totalItems={filteredContests.length}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={setRowsPerPage}
      />

      {confirmContest && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#e6e2f4]/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-[0_18px_60px_rgba(148,163,184,0.18)] backdrop-blur-xl">
            <h3 className="text-lg font-semibold text-slate-900">Confirm Deletion</h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete <span className="font-semibold">{confirmContest.title}</span>?
            </p>
            <p className="mt-2 text-sm text-red-600">
              This will permanently remove the contest from the database and carousel.
            </p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmContest(null)}
                className="rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmContest.id)}
                disabled={deletingId === confirmContest.id}
                className="rounded-full bg-gradient-to-r from-[#ff8c8c] to-[#ff6f91] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId === confirmContest.id ? "Deleting..." : "Delete Contest"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default DeleteContest;
