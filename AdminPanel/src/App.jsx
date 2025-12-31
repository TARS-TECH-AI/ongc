import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import Approvals from "./pages/approvals";
import Members from "./pages/members";
import Documents from "./pages/documents";
import Gallery from "./pages/gallery";
import Settings from "./pages/settings";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./layout/Layout";

function App() {
  return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="members" element={<React.Suspense fallback={<div>Loading...</div>}><Members /></React.Suspense>} />
          <Route path="documents" element={<Documents />} />
          <Route path="gallery" element={<React.Suspense fallback={<div>Loading...</div>}><Gallery /></React.Suspense>} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}

export default App;
