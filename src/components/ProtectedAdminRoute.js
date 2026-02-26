import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAdminAuthenticated } from "./adminAuth";

function ProtectedAdminRoute({ children }) {
  const location = useLocation();

  if (!isAdminAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedAdminRoute;
