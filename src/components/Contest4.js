import React from "react";
import { API_BASE_URL } from "../config/api";

export default function Contest4() {
  const contestUrl = process.env.REACT_APP_CONTEST_IFRAME_URL || `${API_BASE_URL}/contest`;

  return (
    <div className="w-full h-screen">
      <iframe
        src={contestUrl}
        title="Contest"
        className="w-full h-full border-0"
      />
    </div>
  );
}
