import React, { useState } from "react";
import axios from "axios";
import { getAdminToken } from "../components/adminAuth";
function NewUser() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    dob: "",
    email: "",
    phone: "",
    image: null
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };



const handleSubmit = async (e) => {
  e.preventDefault();
  const token = getAdminToken();

  const data = new FormData();
  data.append("employeeId", formData.employeeId);
  data.append("name", formData.name);
  data.append("dob", formData.dob);
  data.append("email", formData.email);
  data.append("phone", formData.phone);
  data.append("image", formData.image);

  try {
    await axios.post(`${API_BASE_URL}/api/employees`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }
    });

    alert("Employee Created Successfully!");
  } catch (error) {
    console.error(error);
    alert("Error creating employee");
  }
};

  // Cancel button → clear form
  const handleCancel = () => {
    setFormData({
      employeeId: "",
      name: "",
      dob: "",
      email: "",
      phone: "",
      image: null
    });
  };



  // Create button → submit form
  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   console.log("Employee Created:", formData);
  //   alert("Employee Created Successfully!");
  // };

  return (
    <div className="flex items-center justify-center h-screen bg-opacity-90">
      <div className="bg-white w-80 p-4 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-2">
          Add New Employee
        </h2>

        <form className="space-y-4 " onSubmit={handleSubmit}>

          <div>
            <label className="block text-gray-600 text-sm mb-1">
              Employee ID
            </label>
            <input
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              placeholder="Enter employee ID"
              className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter employee name"
              className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-1">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(XXX) XXX-XXXX"
              className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-1">
              Upload Profile Picture
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-2 py-1  bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Employee
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default NewUser;
