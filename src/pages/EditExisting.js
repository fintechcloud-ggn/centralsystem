import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { getAdminToken } from "../components/adminAuth";
import { apiUrl } from "../lib/api";

const initialEditPayload = {
  employeeName: "",
  company: "",
  department: "",
  division: "",
  location: "",
  designation: "",
  employmentType: "Permanent",
  gender: "Male",
  dateOfBirth: "",
  doj: "",
  status: "Working",
  biometricStatus: "Active",
  selectedImageS3Key: ""
};

function EditExisting() {
  const [records, setRecords] = useState([]);
  const [query, setQuery] = useState("");
  const [editingCode, setEditingCode] = useState("");
  const [editPayload, setEditPayload] = useState(initialEditPayload);
  const [isSaving, setIsSaving] = useState(false);
  const [photoOptions, setPhotoOptions] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const fetchEmployees = useCallback(async () => {
    const token = getAdminToken();
    const response = await axios.get(apiUrl("/api/employees"), {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    setRecords(response.data || []);
  }, []);

  useEffect(() => {
    fetchEmployees().catch((error) => console.error(error));
  }, [fetchEmployees]);

  const filteredRecords = useMemo(
    () =>
      records.filter((item) =>
        `${item.employee_code} ${item.employee_name} ${item.company} ${item.designation}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [records, query]
  );

  const startEdit = (item) => {
    setEditingCode(item.employee_code);
    setEditPayload({
      employeeName: item.employee_name || "",
      company: item.company || "",
      department: item.department || "",
      division: item.division || "",
      location: item.location || "",
      designation: item.designation || "",
      employmentType: item.employment_type || "Permanent",
      gender: item.gender || "Male",
      dateOfBirth: item.date_of_birth || "",
      doj: item.doj ? String(item.doj).slice(0, 10) : "",
      status: item.status || "Working",
      biometricStatus: item.biometric_status || "Active",
      selectedImageS3Key: item.image_s3_key || ""
    });
    fetchEmployeePhotos(item.employee_code).catch((error) => console.error(error));
  };

  const closeModal = () => {
    setEditingCode("");
    setEditPayload(initialEditPayload);
    setPhotoOptions([]);
    setPhotoFile(null);
  };

  const fetchEmployeePhotos = async (employeeCode) => {
    const token = getAdminToken();
    const response = await axios.get(apiUrl(`/api/employees/${employeeCode}/photos`), {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    setPhotoOptions(response.data || []);
  };

  const uploadNewPhoto = async () => {
    if (!photoFile || !editingCode) return;
    try {
      setIsUploadingPhoto(true);
      const token = getAdminToken();
      const data = new FormData();
      data.append("image", photoFile);
      const response = await axios.post(apiUrl(`/api/employees/${editingCode}/photos`), data, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      await fetchEmployeePhotos(editingCode);
      setEditPayload((prev) => ({
        ...prev,
        selectedImageS3Key: response?.data?.photo?.image_s3_key || prev.selectedImageS3Key
      }));
      setPhotoFile(null);
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.error || "Photo upload failed");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const saveEdit = async () => {
    try {
      setIsSaving(true);
      const token = getAdminToken();
      await axios.put(apiUrl(`/api/employees/${editingCode}`), editPayload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      await fetchEmployees();
      closeModal();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.error || "Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-6xl space-y-5">
      <div className="rounded-[28px] border border-white/80 bg-gradient-to-r from-[#f7f6fd] via-[#f8f5fb] to-[#efe5ff] p-5 shadow-[0_18px_50px_rgba(148,163,184,0.12)] md:p-7">
        <h2 className="text-2xl font-bold text-slate-800">Edit Employee</h2>
        <p className="mt-1 text-sm text-slate-500">Click Edit to open full employee details in popup.</p>
        <div className="mt-4">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by code, name, company, designation"
            className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-[28px] border border-white/80 bg-white/70 shadow-[0_16px_45px_rgba(148,163,184,0.12)] backdrop-blur-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-[#f8f7fc] text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Designation</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((item) => (
              <tr key={item.employee_code} className="border-t border-[#efedf8]">
                <td className="px-4 py-3 font-medium text-slate-800">{item.employee_code}</td>
                <td className="px-4 py-3 text-slate-700">{item.employee_name}</td>
                <td className="px-4 py-3 text-slate-700">{item.company}</td>
                <td className="px-4 py-3 text-slate-700">{item.designation}</td>
                <td className="px-4 py-3 text-slate-700">{item.status}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="rounded-full bg-gradient-to-r from-[#ff9f6f] to-[#f17dac] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-95"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {filteredRecords.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No matching employee records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingCode && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#e6e2f4]/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_18px_60px_rgba(148,163,184,0.18)] backdrop-blur-xl md:p-7">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Edit Employee</h3>
                <p className="text-sm text-slate-500">Employee Code: {editingCode}</p>
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
              <div>
                <label className="mb-1 block text-sm text-slate-600">Employee Name</label>
                <input type="text" value={editPayload.employeeName} onChange={(e) => setEditPayload((p) => ({ ...p, employeeName: e.target.value }))} className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Company</label>
                <input type="text" value={editPayload.company} onChange={(e) => setEditPayload((p) => ({ ...p, company: e.target.value }))} className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Department</label>
                <input type="text" value={editPayload.department} onChange={(e) => setEditPayload((p) => ({ ...p, department: e.target.value }))} className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Division</label>
                <input type="text" value={editPayload.division} onChange={(e) => setEditPayload((p) => ({ ...p, division: e.target.value }))} className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Location</label>
                <input type="text" value={editPayload.location} onChange={(e) => setEditPayload((p) => ({ ...p, location: e.target.value }))} className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Designation</label>
                <input type="text" value={editPayload.designation} onChange={(e) => setEditPayload((p) => ({ ...p, designation: e.target.value }))} className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Employment Type</label>
                <select value={editPayload.employmentType} onChange={(e) => setEditPayload((p) => ({ ...p, employmentType: e.target.value }))} className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5">
                  <option value="Permanent">Permanent</option>
                  <option value="Contract">Contract</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Gender</label>
                <select value={editPayload.gender} onChange={(e) => setEditPayload((p) => ({ ...p, gender: e.target.value }))} className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Date of Birth (ddmmyy)</label>
                <input type="text" maxLength={6} pattern="\\d{6}" value={editPayload.dateOfBirth} onChange={(e) => setEditPayload((p) => ({ ...p, dateOfBirth: e.target.value }))} className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">DOJ</label>
                <input type="date" value={editPayload.doj} onChange={(e) => setEditPayload((p) => ({ ...p, doj: e.target.value }))} className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Status</label>
                <select value={editPayload.status} onChange={(e) => setEditPayload((p) => ({ ...p, status: e.target.value }))} className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5">
                  <option value="Working">Working</option>
                  <option value="Resigned">Resigned</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Biometric Status</label>
                <select value={editPayload.biometricStatus} onChange={(e) => setEditPayload((p) => ({ ...p, biometricStatus: e.target.value }))} className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm text-slate-600">Employee Photo (Previously Uploaded)</label>
                <select
                  value={editPayload.selectedImageS3Key}
                  onChange={(e) => setEditPayload((p) => ({ ...p, selectedImageS3Key: e.target.value }))}
                  className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5"
                >
                  <option value="">Select photo</option>
                  {photoOptions.map((photo) => (
                    <option key={photo.image_s3_key} value={photo.image_s3_key}>
                      {photo.image_s3_key.split("/").pop()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm text-slate-600">Upload New Photo</label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                    className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5"
                  />
                  <button
                    type="button"
                    onClick={uploadNewPhoto}
                    disabled={!photoFile || isUploadingPhoto}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-[#f8f7fc] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUploadingPhoto ? "Uploading..." : "Upload Photo"}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
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

export default EditExisting;
