import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { getAdminToken } from "../components/adminAuth";
import toast from "react-hot-toast";
import { apiUrl } from "../lib/api";
import {
  formatFileSize,
  getUploadErrorMessage,
  MAX_IMAGE_UPLOAD_BYTES,
  prepareImageForUpload
} from "../lib/imageUpload";

const BULK_UPLOAD_BATCH_SIZE = 10;

const createBulkSummary = (total) => ({
  total,
  processed: 0,
  imported: 0,
  failed: 0,
  errors: [],
  warnings: []
});

function NewUser() {
  const initialFormData = {
    employeeCode: "",
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
    image: null
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreparingImage, setIsPreparingImage] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  const handleChange = async (event) => {
    const { name, value, files } = event.target;

    if (name === "image") {
      const selectedFile = files?.[0] || null;

      if (!selectedFile) {
        setFormData((prev) => ({ ...prev, image: null }));
        return;
      }

      try {
        setIsPreparingImage(true);
        const preparedImage = await prepareImageForUpload(selectedFile);
        setFormData((prev) => ({ ...prev, image: preparedImage }));

        if (preparedImage !== selectedFile) {
          toast.success(
            `Image optimized from ${formatFileSize(selectedFile.size)} to ${formatFileSize(preparedImage.size)}`
          );
        }
      } catch (error) {
        console.error(error);
        setFormData((prev) => ({ ...prev, image: null }));
        event.target.value = "";
        toast.error(error.message || "Unable to process the selected image");
      } finally {
        setIsPreparingImage(false);
      }

      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isPreparingImage) {
      toast.error("Please wait for the image to finish processing");
      return;
    }

    setIsSubmitting(true);

    const token = getAdminToken();
    const data = new FormData();

    data.append("employeeCode", formData.employeeCode.trim());
    data.append("employeeName", formData.employeeName.trim());
    data.append("company", formData.company.trim());
    data.append("department", formData.department.trim());
    data.append("division", formData.division.trim());
    data.append("location", formData.location.trim());
    data.append("designation", formData.designation.trim());
    data.append("employmentType", formData.employmentType);
    data.append("gender", formData.gender);
    data.append("dateOfBirth", formData.dateOfBirth.trim());
    data.append("doj", formData.doj);
    data.append("status", formData.status);
    data.append("biometricStatus", formData.biometricStatus);

    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      await axios.post(apiUrl("/api/employees"), data, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      toast.success("Employee created successfully");
      setFormData(initialFormData);
    } catch (error) {
      console.error(error);
      toast.error(getUploadErrorMessage(error, "Error creating employee"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
  };

  const parseBulkFile = async (file) => {
    const fileBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(fileBuffer, { type: "array", raw: true });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      throw new Error("No sheet found in file");
    }

    return XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], {
      defval: "",
      raw: true
    });
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      toast.error("Select a CSV or Excel file");
      return;
    }

    try {
      setIsBulkUploading(true);
      setBulkResult(null);
      const rows = await parseBulkFile(bulkFile);
      const token = getAdminToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const summary = createBulkSummary(rows.length);

      if (rows.length === 0) {
        toast.error("No employee rows found in file");
        return;
      }

      setBulkResult(summary);

      for (let startIndex = 0; startIndex < rows.length; startIndex += BULK_UPLOAD_BATCH_SIZE) {
        const batchRows = rows.slice(startIndex, startIndex + BULK_UPLOAD_BATCH_SIZE);
        const response = await axios.post(
          apiUrl("/api/employees/bulk"),
          {
            rows: batchRows,
            startRow: startIndex + 2
          },
          { headers }
        );

        const batchResult = response.data || {};
        summary.processed += batchRows.length;
        summary.imported += Number(batchResult.imported || 0);
        summary.failed += Number(batchResult.failed || 0);
        summary.errors = summary.errors.concat(batchResult.errors || []);
        summary.warnings = summary.warnings.concat(batchResult.warnings || []);

        setBulkResult({ ...summary });
      }

      toast.success(`Imported ${summary.imported} employees`);
      setBulkFile(null);
    } catch (error) {
      console.error(error);
      toast.error(getUploadErrorMessage(error, "Bulk upload failed"));
    } finally {
      setIsBulkUploading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 sm:space-y-5 2xl:max-w-7xl">
      <div className="rounded-[28px] border border-white/80 bg-gradient-to-r from-[#f7f6fd] via-[#f8f5fb] to-[#efe5ff] p-5 text-slate-700 shadow-[0_18px_50px_rgba(148,163,184,0.12)] md:p-6">
        <h2 className="text-2xl font-bold text-slate-800">Add New Employee</h2>
        <p className="mt-1 text-sm text-slate-500">
          Fill all table fields and upload the employee image. Date of birth must be in ddmmyy format.
          Large photos are automatically compressed before upload.
        </p>
      </div>

      <div className="rounded-[28px] border border-white/80 bg-white/70 p-5 shadow-[0_16px_45px_rgba(148,163,184,0.12)] backdrop-blur-sm md:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Bulk Upload Employees</h3>
            {/* <p className="mt-1 text-sm text-slate-500">
              Upload CSV or Excel with Employee Code, Employee Name, Company, Department, Division, Location, Designation, Employment Type, Gender, Date of Birth, DOJ, Status, Biometric Status, and Image URL.
            </p> */}
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(event) => setBulkFile(event.target.files?.[0] || null)}
              className="w-full min-w-0 rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 text-sm sm:w-80"
            />
            <button
              type="button"
              onClick={handleBulkUpload}
              disabled={isBulkUploading}
              className="rounded-full bg-gradient-to-r from-[#7c6cff] to-[#c17cff] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBulkUploading ? "Uploading..." : "Upload File"}
            </button>
          </div>
        </div>

        {bulkResult && (
          <div className="mt-4 rounded-3xl border border-[#ece9f8] bg-[#f8f7fc] p-4 text-sm text-slate-700">
            <p className="font-semibold">
              Imported {bulkResult.imported} of {bulkResult.total} rows
              {bulkResult.failed ? `, ${bulkResult.failed} failed` : ""}
            </p>
            {isBulkUploading && (
              <div className="mt-3">
                <div className="h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#7c6cff] to-[#c17cff] transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(((bulkResult.processed || 0) / Math.max(1, bulkResult.total)) * 100)
                      )}%`
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Processed {bulkResult.processed || 0} of {bulkResult.total} rows
                </p>
              </div>
            )}
            {bulkResult.errors?.length > 0 && (
              <div className="mt-3 max-h-36 overflow-auto rounded-2xl bg-white/80 p-3">
                {bulkResult.errors.slice(0, 20).map((item) => (
                  <p key={`${item.row}-${item.message}`} className="text-xs text-red-600">
                    Row {item.row}: {item.message}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-[28px] border border-white/80 bg-white/70 p-5 shadow-[0_16px_45px_rgba(148,163,184,0.12)] backdrop-blur-sm md:p-7">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-600">Employee Code</label>
              <input
                type="text"
                name="employeeCode"
                required
                value={formData.employeeCode}
                onChange={handleChange}
                placeholder="FTP25001"
                className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Employee Name</label>
              <input
                type="text"
                name="employeeName"
                required
                value={formData.employeeName}
                onChange={handleChange}
                placeholder="Ashutosh Sharma"
                className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm text-slate-600">Company</label>
              <input
                type="text"
                name="company"
                required
                value={formData.company}
                onChange={handleChange}
                className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Department</label>
              <input
                type="text"
                name="department"
                required
                value={formData.department}
                onChange={handleChange}
                className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Division</label>
              <input
                type="text"
                name="division"
                required
                value={formData.division}
                onChange={handleChange}
                className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm text-slate-600">Location</label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Designation</label>
              <input
                type="text"
                name="designation"
                required
                value={formData.designation}
                onChange={handleChange}
                className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Employment Type</label>
              <select
                name="employmentType"
                required
                value={formData.employmentType}
                onChange={handleChange}
                className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
              >
                <option value="Permanent">Permanent</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-600">Gender</label>
              <select
                name="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Date of Birth (ddmmyy)</label>
              <input
                type="date"
                name="dateOfBirth"
                required
                pattern="\\d{6}"
                maxLength={6}
                value={formData.dateOfBirth}
                onChange={handleChange}
                placeholder="010600"
                className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm text-slate-600">DOJ</label>
              <input
                type="date"
                name="doj"
                required
                value={formData.doj}
                onChange={handleChange}
                className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Status</label>
              <select
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
              >
                <option value="Working">Working</option>
                <option value="Resigned">Resigned</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Biometric Status</label>
              <select
                name="biometricStatus"
                required
                value={formData.biometricStatus}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-600">Upload Profile Picture</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              required
              onChange={handleChange}
              className="w-full rounded-full border border-[#ece9f8] bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#cdc3ff]"
            />
            <p className="mt-1 text-xs text-slate-500">
              Images above {formatFileSize(MAX_IMAGE_UPLOAD_BYTES)} may be compressed automatically.
            </p>
            {isPreparingImage && (
              <p className="mt-1 text-xs text-slate-500">Optimizing image for upload...</p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isPreparingImage}
              className="rounded-full bg-gradient-to-r from-[#ff9f6f] to-[#f17dac] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPreparingImage ? "Preparing image..." : isSubmitting ? "Creating..." : "Create Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewUser;
