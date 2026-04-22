import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { getAdminToken } from "../components/adminAuth";
import { apiUrl } from "../lib/api";
import PaginationFooter from "../components/PaginationFooter";

const initialPayload = {
  title: "",
  category: "Photography",
  startsOn: "",
  endsOn: "",
  prize: "",
  description: "",
  designType: "contest1",
  firstPlace: "",
  firstPoints: "",
  secondPlace: "",
  secondPoints: "",
  thirdPlace: "",
  thirdPoints: ""
};

const toDateInputValue = (value) => (value ? String(value).slice(0, 10) : "");

function EditContest() {
  const [contests, setContests] = useState([]);
  const [query, setQuery] = useState("");
  const [editingContest, setEditingContest] = useState(null);
  const [payload, setPayload] = useState(initialPayload);
  const [isSaving, setIsSaving] = useState(false);
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

  const startEdit = (contest) => {
    setEditingContest(contest);
    setPayload({
      title: contest.title || "",
      category: contest.category || "Photography",
      startsOn: toDateInputValue(contest.starts_on),
      endsOn: toDateInputValue(contest.ends_on),
      prize: contest.prize || "",
      description: contest.description || "",
      designType: contest.design_type || "contest1",
      firstPlace: contest.first_place || "",
      firstPoints: contest.first_points || "",
      secondPlace: contest.second_place || "",
      secondPoints: contest.second_points || "",
      thirdPlace: contest.third_place || "",
      thirdPoints: contest.third_points || ""
    });
  };

  const closeModal = () => {
    setEditingContest(null);
    setPayload(initialPayload);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    if (!editingContest) return;

    try {
      setIsSaving(true);
      const token = getAdminToken();
      await axios.put(apiUrl(`/api/contests/${editingContest.id}`), payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      await fetchContests();
      closeModal();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.error || "Contest update failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-6xl space-y-5 2xl:max-w-[90rem]">
      <div className="rounded-[28px] border border-white/80 bg-gradient-to-r from-[#f7f6fd] via-[#f8f5fb] to-[#efe5ff] p-5 shadow-[0_18px_50px_rgba(148,163,184,0.12)] md:p-7">
        <h2 className="text-2xl font-bold text-slate-800">Edit Contest</h2>
        <p className="mt-1 text-sm text-slate-500">Click Edit to update contest details in popup.</p>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by title, category, prize, design"
          className="mt-4 w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
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
                   {/* <td className="px-4 py-3 font-medium text-slate-800">{contest.title}</td> */}
                  <td className="px-4 py-3 text-slate-700">{contest.category}</td>
                  <td className="px-4 py-3 text-slate-700">{toDateInputValue(contest.starts_on)}</td>
                  <td className="px-4 py-3 text-slate-700">{toDateInputValue(contest.ends_on)}</td>
                  <td className="px-4 py-3 text-slate-700">{contest.design_type}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => startEdit(contest)}
                      className="rounded-full bg-gradient-to-r from-[#ff9f6f] to-[#f17dac] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-95"
                    >
                      Edit
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

      {editingContest && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#e6e2f4]/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_18px_60px_rgba(148,163,184,0.18)] backdrop-blur-xl md:p-7">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Edit Contest</h3>
                <p className="text-sm text-slate-500">Contest ID: {editingContest.id}</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-white"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm text-slate-600">Contest Title</label>
                <input name="title" value={payload.title} onChange={handleChange} className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Category</label>
                <select name="category" value={payload.category} onChange={handleChange} className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5">
                  <option>Photography</option>
                  <option>Essay</option>
                  <option>Innovation</option>
                  <option>Sports</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Contest Design</label>
                <select name="designType" value={payload.designType} onChange={handleChange} className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5">
                  <option value="contest1">Contest One</option>
                  <option value="contest2">Contest Two</option>
                  <option value="contest3">Contest Three</option>
                  <option value="contest4">Contest Four</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Start Date</label>
                <input type="date" name="startsOn" value={payload.startsOn} onChange={handleChange} className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">End Date</label>
                <input type="date" name="endsOn" value={payload.endsOn} onChange={handleChange} className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm text-slate-600">Prize</label>
                <input name="prize" value={payload.prize} onChange={handleChange} className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm text-slate-600">Description</label>
                <textarea name="description" value={payload.description} onChange={handleChange} rows={4} className="w-full rounded-[26px] border border-[#ece9f8] bg-white/90 px-4 py-2.5" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">First Place Winner</label>
                <input name="firstPlace" value={payload.firstPlace} onChange={handleChange} className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">First Points</label>
                <input type="number" name="firstPoints" value={payload.firstPoints} onChange={handleChange} className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Second Place Winner</label>
                <input name="secondPlace" value={payload.secondPlace} onChange={handleChange} className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Second Points</label>
                <input type="number" name="secondPoints" value={payload.secondPoints} onChange={handleChange} className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Third Place Winner</label>
                <input name="thirdPlace" value={payload.thirdPlace} onChange={handleChange} className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Third Points</label>
                <input type="number" name="thirdPoints" value={payload.thirdPoints} onChange={handleChange} className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5" />
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                disabled={isSaving}
                className="rounded-full bg-gradient-to-r from-[#ff9f6f] to-[#f17dac] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default EditContest;
