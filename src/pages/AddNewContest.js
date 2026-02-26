import { useState } from "react";

function AddNewContest() {
  const [formData, setFormData] = useState({
    title: "",
    category: "Photography",
    startsOn: "",
    endsOn: "",
    prize: "",
    description: ""
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      alert("Contest created successfully!");
      setFormData({
        title: "",
        category: "Photography",
        startsOn: "",
        endsOn: "",
        prize: "",
        description: ""
      });
      setIsSaving(false);
    }, 650);
  };

  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <h2 className="text-2xl font-bold text-slate-900">Add New Contest</h2>
          <p className="mt-1 text-sm text-slate-500">Set up a contest and publish it for employee participation.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Contest Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Employee Talent Hunt"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-slate-600">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option>Photography</option>
                  <option>Essay</option>
                  <option>Innovation</option>
                  <option>Sports</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Prize</label>
                <input
                  type="text"
                  name="prize"
                  value={formData.prize}
                  onChange={handleChange}
                  placeholder="$500 + Certificate"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-slate-600">Start Date</label>
                <input
                  type="date"
                  name="startsOn"
                  value={formData.startsOn}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">End Date</label>
                <input
                  type="date"
                  name="endsOn"
                  value={formData.endsOn}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-600">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Write contest rules, participation steps, and judging criteria"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Publish Contest"}
            </button>
          </form>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h3 className="text-lg font-semibold text-slate-900">Preview</h3>
          <div className="mt-4 rounded-xl bg-slate-900 p-4 text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">{formData.category}</p>
            <p className="mt-2 text-xl font-semibold">{formData.title || "Contest title"}</p>
            <p className="mt-2 text-sm text-slate-300">{formData.description || "Contest description will appear here."}</p>
          </div>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>Starts: {formData.startsOn || "Not selected"}</p>
            <p>Ends: {formData.endsOn || "Not selected"}</p>
            <p>Prize: {formData.prize || "Not specified"}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default AddNewContest;
