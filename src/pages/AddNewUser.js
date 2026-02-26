import React, { useState } from "react";
import axios from "axios";
import { getAdminToken } from "../components/adminAuth";

function NewUser() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

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
      await axios.post(`${API_BASE_URL}/api/employees`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      alert("Employee Created Successfully!");
      setFormData(initialFormData);
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.error || "Error creating employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <div className="rounded-2xl bg-gradient-to-r from-emerald-700 to-cyan-700 p-5 text-white shadow-md md:p-6">
        <h2 className="text-2xl font-bold">Add New Employee</h2>
        <p className="mt-1 text-sm text-emerald-100">
          Fill all table fields and upload the employee image. Date of birth must be in ddmmyy format.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
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
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Employment Type</label>
              <select
                name="employmentType"
                required
                value={formData.employmentType}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Date of Birth (ddmmyy)</label>
              <input
                type="text"
                name="dateOfBirth"
                required
                pattern="\\d{6}"
                maxLength={6}
                value={formData.dateOfBirth}
                onChange={handleChange}
                placeholder="010600"
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Status</label>
              <select
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md bg-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-md bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewUser;
