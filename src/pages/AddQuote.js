import { useEffect, useState } from "react";
import NoEventsPage from "../components/NoEventsPage";
import { getAdminToken } from "../components/adminAuth";
import { apiUrl } from "../lib/api";

const initialFormData = {
  quoteText: "",
  durationHours: "24",
  image: null
};

function AddQuote() {
  const [formData, setFormData] = useState(initialFormData);
  const [previewUrl, setPreviewUrl] = useState("/sachin mittal.jpeg");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!formData.image) {
      setPreviewUrl("/sachin mittal.jpeg");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(formData.image);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [formData.image]);

  const handleChange = (event) => {
    const { name, value, files } = event.target;

    if (name === "image") {
      setFormData((prev) => ({ ...prev, image: files?.[0] || null }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.image) {
      alert("Please select an image for the quote.");
      return;
    }

    try {
      setIsSaving(true);
      const token = getAdminToken();
      const payload = new FormData();
      payload.append("quoteText", formData.quoteText.trim());
      payload.append("durationHours", formData.durationHours);
      payload.append("image", formData.image);

      const response = await fetch(apiUrl("/api/quotes"), {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: payload
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Quote API not found. Restart the backend server and try again.");
        }
        throw new Error(data?.error || "Failed to create quote");
      }

      alert("Quote created successfully!");
      setFormData(initialFormData);
    } catch (error) {
      console.error(error);
      alert(error.message || "Quote creation failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl 2xl:max-w-7xl">
      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[28px] border border-white/80 bg-white/70 p-5 shadow-[0_16px_45px_rgba(148,163,184,0.12)] backdrop-blur-sm md:p-7">
          <h2 className="text-2xl font-bold text-slate-900">Add Quote</h2>
          <p className="mt-1 text-sm text-slate-500">
            Upload an image, write a thoughtful quote, and set how long it should stay live.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Quote Text</label>
              <textarea
                name="quoteText"
                value={formData.quoteText}
                onChange={handleChange}
                required
                rows={5}
                className="w-full rounded-[26px] border border-[#ece9f8] bg-white/90 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
                placeholder="Write the quote you want to display on the fallback page"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-slate-600">Display Duration</label>
                <select
                  name="durationHours"
                  value={formData.durationHours}
                  onChange={handleChange}
                  className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
                >
                  <option value="24">24 Hours</option>
                  <option value="48">48 Hours</option>
                  <option value="72">72 Hours</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-600">Quote Image</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  required
                  onChange={handleChange}
                  className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-gradient-to-r from-[#ff9f6f] to-[#f17dac] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Publish Quote"}
            </button>
          </form>
        </div>

        <aside className="rounded-[28px] border border-white/80 bg-white/70 p-5 shadow-[0_16px_45px_rgba(148,163,184,0.12)] backdrop-blur-sm md:p-6">
          <h3 className="text-lg font-semibold text-slate-900">Preview</h3>

          <div className="mt-4 flex aspect-[10/7] w-full max-w-[420px] items-center justify-center overflow-hidden rounded-[24px] bg-[#f8f7fc]">
            <div className="scale-[0.22] origin-center sm:scale-[0.3] xl:scale-[0.28] 2xl:scale-[0.38]">
              <div className="h-[700px] w-[1000px]">
                <NoEventsPage
                  quoteText={formData.quoteText || "Your quote preview will appear here."}
                  imageSrc={previewUrl}
                  autoRotate={false}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>Duration: {formData.durationHours} hours</p>
            <p>Image: {formData.image?.name || "Default preview image"}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default AddQuote;
