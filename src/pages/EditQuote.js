import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import QuoteTemplateRenderer, { QUOTE_TEMPLATE_OPTIONS } from "../components/QuoteTemplates";
import { getAdminToken } from "../components/adminAuth";
import { apiUrl } from "../lib/api";
import PaginationFooter from "../components/PaginationFooter";

const initialPayload = {
  quoteText: "",
  durationHours: "24",
  templateKey: "template1",
  image: null,
  imageUrl: ""
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

function EditQuote() {
  const [quotes, setQuotes] = useState([]);
  const [query, setQuery] = useState("");
  const [editingQuote, setEditingQuote] = useState(null);
  const [payload, setPayload] = useState(initialPayload);
  const [previewUrl, setPreviewUrl] = useState("/sachin mittal.jpeg");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchQuotes = useCallback(async () => {
    const response = await axios.get(apiUrl("/api/quotes?all=1"));
    setQuotes(response.data || []);
  }, []);

  useEffect(() => {
    fetchQuotes().catch((error) => console.error(error));
  }, [fetchQuotes]);

  useEffect(() => {
    if (!payload.image) {
      setPreviewUrl(payload.imageUrl || "/sachin mittal.jpeg");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(payload.image);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [payload.image, payload.imageUrl]);

  const filteredQuotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return quotes;

    return quotes.filter((quote) =>
      `${quote.quote_text} ${quote.duration_hours} ${quote.template_key || "template1"} ${quote.is_active ? "active" : "inactive"}`
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [quotes, query]);

  const totalPages = Math.max(1, Math.ceil(filteredQuotes.length / rowsPerPage));
  const paginatedQuotes = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredQuotes.slice(startIndex, startIndex + rowsPerPage);
  }, [currentPage, filteredQuotes, rowsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startEdit = (quote) => {
    setEditingQuote(quote);
    setPayload({
      quoteText: quote.quote_text || "",
      durationHours: String(quote.duration_hours || 24),
      templateKey: quote.template_key || "template1",
      image: null,
      imageUrl: quote.image_url || "/sachin mittal.jpeg"
    });
  };

  const closeModal = () => {
    setEditingQuote(null);
    setPayload(initialPayload);
    setPreviewUrl("/sachin mittal.jpeg");
  };

  const handleChange = (event) => {
    const { name, value, files } = event.target;

    if (name === "image") {
      setPayload((prev) => ({ ...prev, image: files?.[0] || null }));
      return;
    }

    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    if (!editingQuote) return;

    try {
      setIsSaving(true);
      const token = getAdminToken();
      const formData = new FormData();
      formData.append("quoteText", payload.quoteText.trim());
      formData.append("durationHours", payload.durationHours);
      formData.append("templateKey", payload.templateKey);
      if (payload.image) {
        formData.append("image", payload.image);
      }

      await axios.put(apiUrl(`/api/quotes/${editingQuote.id}`), formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      await fetchQuotes();
      closeModal();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.error || "Quote update failed");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteQuote = async (quote) => {
    const shouldDelete = window.confirm(`Delete this quote?\n\n"${quote.quote_text}"`);
    if (!shouldDelete) return;

    try {
      setDeletingId(quote.id);
      const token = getAdminToken();
      await axios.delete(apiUrl(`/api/quotes/${quote.id}`), {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (editingQuote?.id === quote.id) {
        closeModal();
      }

      await fetchQuotes();
    } catch (error) {
      console.error(error);
      if (error?.response?.status === 404) {
        alert("Quote delete API not found. Restart the backend server and try again.");
        return;
      }
      alert(error?.response?.data?.error || "Quote delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="mx-auto w-full max-w-6xl space-y-5 2xl:max-w-[90rem]">
      <div className="rounded-[28px] border border-white/80 bg-gradient-to-r from-[#f7f6fd] via-[#f8f5fb] to-[#efe5ff] p-5 shadow-[0_18px_50px_rgba(148,163,184,0.12)] md:p-7">
        <h2 className="text-2xl font-bold text-slate-800">Edit Quote</h2>
        <p className="mt-1 text-sm text-slate-500">Click Edit to update quote image, text, duration, or template.</p>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by quote text, template, or status"
          className="mt-4 w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
        />
      </div>

      <div className="w-full overflow-x-auto rounded-[28px] border border-white/80 bg-white/70 shadow-[0_16px_45px_rgba(148,163,184,0.12)] backdrop-blur-sm">
        <table className="w-full min-w-[1080px] text-sm">
          <thead className="bg-[#f8f7fc] text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Quote</th>
              <th className="px-4 py-3 font-medium">Template</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Published</th>
              <th className="px-4 py-3 font-medium">Expires</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotes.length > 0 ? (
              paginatedQuotes.map((quote) => (
                <tr key={quote.id} className="border-t border-[#efedf8]">
                  <td className="max-w-[420px] px-4 py-3 font-medium text-slate-800">
                    <span className="block max-w-[420px] truncate">{quote.quote_text}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {QUOTE_TEMPLATE_OPTIONS.find((item) => item.value === (quote.template_key || "template1"))?.label || "Template One"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{quote.duration_hours} hrs</td>
                  <td className="px-4 py-3 text-slate-700">{formatDateTime(quote.published_at)}</td>
                  <td className="px-4 py-3 text-slate-700">{formatDateTime(quote.expires_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${quote.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {quote.is_active ? "Active" : "Expired"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(quote)}
                        className="rounded-full bg-gradient-to-r from-[#ff9f6f] to-[#f17dac] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-95"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteQuote(quote)}
                        disabled={deletingId === quote.id}
                        className="rounded-full border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === quote.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No quote records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PaginationFooter
        currentPage={currentPage}
        totalItems={filteredQuotes.length}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={setRowsPerPage}
      />

      {editingQuote && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#e6e2f4]/70 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[32px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_60px_rgba(148,163,184,0.18)] backdrop-blur-xl md:p-7">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Edit Quote</h3>
                <p className="text-sm text-slate-500">Quote ID: {editingQuote.id}</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-white"
              >
                Close
              </button>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
              <div className="rounded-[28px] border border-[#ece9f8] bg-white/80 p-5 shadow-[0_12px_35px_rgba(148,163,184,0.08)]">
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Quote Text</label>
                    <textarea
                      name="quoteText"
                      value={payload.quoteText}
                      onChange={handleChange}
                      rows={7}
                      className="w-full rounded-[26px] border border-[#ece9f8] bg-white/95 px-4 py-3 text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Quote Template</label>
                      <select
                        name="templateKey"
                        value={payload.templateKey}
                        onChange={handleChange}
                        className="w-full rounded-full border border-[#ece9f8] bg-white/95 px-4 py-2.5 text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
                      >
                        {QUOTE_TEMPLATE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Display Duration</label>
                      <select
                        name="durationHours"
                        value={payload.durationHours}
                        onChange={handleChange}
                        className="w-full rounded-full border border-[#ece9f8] bg-white/95 px-4 py-2.5 text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
                      >
                        <option value="24">24 Hours</option>
                        <option value="48">48 Hours</option>
                        <option value="72">72 Hours</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Replace Image</label>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleChange}
                      className="w-full rounded-full border border-[#ece9f8] bg-white/95 px-4 py-2.5 text-sm text-slate-700 shadow-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#f5f1ff] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
                    />
                  </div>

                  <div className="rounded-[24px] bg-[#f8f7fc] px-4 py-3 text-sm text-slate-600">
                    Saving this quote will refresh its live timing from the current moment.
                  </div>
                </div>
              </div>

              <aside className="rounded-[28px] border border-[#ece9f8] bg-[#f8f7fc] p-5 shadow-[0_12px_35px_rgba(148,163,184,0.08)]">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-base font-semibold text-slate-900">Live Preview</h4>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
                    {QUOTE_TEMPLATE_OPTIONS.find((item) => item.value === payload.templateKey)?.label}
                  </span>
                </div>

                <div className="mt-4 overflow-hidden rounded-[24px] border border-white/80 bg-white">
                  <div className="flex aspect-[10/7] w-full items-center justify-center overflow-hidden rounded-[24px] bg-white">
                    <div className="scale-[0.2] origin-center sm:scale-[0.22] md:scale-[0.24] xl:scale-[0.26]">
                      <div className="h-[700px] w-[1000px]">
                        <QuoteTemplateRenderer
                          templateKey={payload.templateKey}
                          quoteText={payload.quoteText || "Your quote preview will appear here."}
                          imageSrc={previewUrl}
                          autoRotate={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>Image: {payload.image?.name || "Current uploaded image"}</p>
                  <p>Quote status will update after saving.</p>
                </div>
              </aside>
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

export default EditQuote;
