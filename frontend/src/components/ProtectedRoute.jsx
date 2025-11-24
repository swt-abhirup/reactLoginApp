import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth) {
    // redirect to login, remember attempted url in state
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}
