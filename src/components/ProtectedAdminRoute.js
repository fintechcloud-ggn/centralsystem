import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  clearAdminToken,
  getAdminToken,
  isAdminAuthenticated,
  setAdminRole
} from "./adminAuth";
import { apiUrl } from "../lib/api";

function ProtectedAdminRoute({ children }) {
  const location = useLocation();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [validAuth, setValidAuth] = useState(isAdminAuthenticated());

  useEffect(() => {
    const verifyAdmin = async () => {
      const token = getAdminToken();
      if (!token) {
        setValidAuth(false);
        setCheckingAuth(false);
        return;
      }

      try {
        const response = await axios.get(apiUrl("/api/admin/verify"), {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAdminRole(response.data?.admin?.role);
        setValidAuth(true);
      } catch (error) {
        clearAdminToken();
        setValidAuth(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    verifyAdmin();
  }, []);

  if (checkingAuth) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#f8f7fc]">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-[#ddd7fb] border-t-[#7c72b6]" />
      </div>
    );
  }

  if (!validAuth) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedAdminRoute;
