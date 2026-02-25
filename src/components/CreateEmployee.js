import React from "react";
/// no use
function CreateEmployee() {
  return (
    <div className="flex items-center justify-center min-h-screen  bg-opacity-90">
      <div className="bg-white w-96 p-8 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6">
          CREATE NEW USER
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-600 text-sm mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter user's full name"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-1">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="(XXX) XXX-XXXX"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-between pt-4">
            <button className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
              Cancel
            </button>

            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateEmployee;