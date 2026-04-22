import { useState } from "react";
import Contest1 from "../components/Contest1";
import Contest2 from "../components/Contest2";
import Contest3 from "../components/Contest3";
import Contest4 from "../components/Contest4";
import { getAdminToken } from "../components/adminAuth";
import { apiUrl } from "../lib/api";

function AddNewContest() {
  const [formData, setFormData] = useState({
    title: "",
    category: "Photography",
    startsOn: "",
    endsOn: "",
    prize: "",
    description: "",
    designType:"contest1",

     firstPlace: "",
      firstPoints: "",

    secondPlace: "",
     secondPoints: "",

    thirdPlace: "",
    thirdPoints: ""
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  //Preview renderer
  const renderPreview = () => {
  switch (formData.designType) {
    case "contest1":
      return <Contest1 previewData={formData} />;
    case "contest2":
      return <Contest2 previewData={formData} />;
    case "contest3":
      return <Contest3 previewData={formData} />;
    case "contest4":
      return <Contest4 previewData={formData} />;
    default:
      return null;
  }
};

// handle submit
const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    const token = getAdminToken()
    try {
    const res =  await fetch(apiUrl("/api/contests"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

       const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to create contest");
    }

      alert("Contest created successfully!");

      setFormData({
        title: "",
        category: "Photography",
        startsOn: "",
        endsOn: "",
        prize: "",
        description: "",
        designType: "contest1",
         firstPlace: "",
      secondPlace: "",
      thirdPlace: ""
      });
    } catch (error) {
      console.error(error);
      alert("Error creating contest");
    }

    setIsSaving(false);
  };

 return (
    <section className="mx-auto w-full max-w-5xl 2xl:max-w-7xl">
      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        
        <div className="rounded-[28px] border border-white/80 bg-white/70 p-5 shadow-[0_16px_45px_rgba(148,163,184,0.12)] backdrop-blur-sm md:p-7">
          <h2 className="text-2xl font-bold text-slate-900">Add New Contest</h2>
          <p className="mt-1 text-sm text-slate-500">
            Set up a contest and publish it for employee participation.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            
            <div>
              <label className="mb-1 block text-sm text-slate-600">
                Contest Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
                placeholder="Employee Talent Hunt"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              
              <div>
                <label className="mb-1 block text-sm text-slate-600">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
                >
                  <option>Photography</option>
                  <option>Essay</option>
                  <option>Innovation</option>
                  <option>Sports</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-600">
                  Contest Design
                </label>
                <select
                  name="designType"
                  value={formData.designType}
                  onChange={handleChange}
                  className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
                >
                  <option value="contest1">Contest One</option>
                  <option value="contest2">Contest Two</option>
                  <option value="contest3">Contest Three</option>
                  <option value="contest4">Contest Four</option>
                </select>
              </div>

            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-600">
                Prize
              </label>
              <input
                type="text"
                name="prize"
                value={formData.prize}
                onChange={handleChange}
                placeholder="$500 + Certificate"
                className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              
              <div>
                <label className="mb-1 block text-sm text-slate-600">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startsOn"
                  value={formData.startsOn}
                  onChange={handleChange}
                  required
                  className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-600">
                  End Date
                </label>
                <input
                  type="date"
                  name="endsOn"
                  value={formData.endsOn}
                  onChange={handleChange}
                  required
                  className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
                />
              </div>

            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-600">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
                placeholder="Write contest rules, participation steps, and judging criteria"
              />
            </div>



            {/* top 3 winners */}
<div className="grid gap-3">

  {/* First */}
  <div className="flex flex-col gap-2 sm:flex-row">
    <input
      type="text"
      name="firstPlace"
      value={formData.firstPlace}
      onChange={handleChange}
      placeholder="🥇 First Place Winner"
      className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5"
    />
    <input
      type="number"
      name="firstPoints"
      value={formData.firstPoints}
      onChange={handleChange}
      placeholder="Points"
      className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 sm:w-32"
    />
  </div>

  {/* Second */}
  <div className="flex flex-col gap-2 sm:flex-row">
    <input
      type="text"
      name="secondPlace"
      value={formData.secondPlace}
      onChange={handleChange}
      placeholder="🥈 Second Place Winner"
      className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5"
    />
    <input
      type="number"
      name="secondPoints"
      value={formData.secondPoints}
      onChange={handleChange}
      placeholder="Points"
      className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 sm:w-32"
    />
  </div>

  {/* Third */}
  <div className="flex flex-col gap-2 sm:flex-row">
    <input
      type="text"
      name="thirdPlace"
      value={formData.thirdPlace}
      onChange={handleChange}
      placeholder="🥉 Third Place Winner"
      className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5"
    />
    <input
      type="number"
      name="thirdPoints"
      value={formData.thirdPoints}
      onChange={handleChange}
      placeholder="Points"
      className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 sm:w-32"
    />
  </div>

</div>






            <button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-gradient-to-r from-[#ff9f6f] to-[#f17dac] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Publish Contest"}
            </button>

          </form>
        </div>

        <aside className="rounded-[28px] border border-white/80 bg-white/70 p-5 shadow-[0_16px_45px_rgba(148,163,184,0.12)] backdrop-blur-sm md:p-6">
          <h3 className="text-lg font-semibold text-slate-900">Preview</h3>

<div className="mt-4 flex aspect-[10/7] w-full max-w-[420px] items-center justify-center overflow-hidden rounded-[24px] bg-[#f8f7fc]">
  <div className="scale-[0.22] origin-center sm:scale-[0.3] xl:scale-[0.28] 2xl:scale-[0.38]">
    <div className="w-[1000px] h-[700px]">
      {renderPreview()}
    </div>
  </div>
</div>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>Starts: {formData.startsOn || "Not selected"}</p>
            <p>Ends: {formData.endsOn || "Not selected"}</p>
            <p>Prize: {formData.prize || "Not specified"}</p>
            <p>Design: {formData.designType}</p>


              <p>🥇 {formData.firstPlace || "-"}</p>
            <p>🥈 {formData.secondPlace || "-"}</p>
            <p>🥉 {formData.thirdPlace || "-"}</p>
          </div>

        </aside>
      </div>
    </section>
  );
}

export default AddNewContest;
