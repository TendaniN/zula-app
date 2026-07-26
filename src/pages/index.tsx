import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout, DefaultLayout, AuthLayout } from "@/components/layouts";
import { LoginPage, RegisterPage } from "./auth";
import TripListPage from "./trip-list";

export default function Pages() {
  return (
    <Routes>
      <Route path="*" element={<Navigate to="/trips" replace />} />

      <Route element={<DefaultLayout />}>
        <Route path="/" element={<div>Pages</div>} />

        <Route element={<AppLayout />}>
          <Route path="/trips" element={<TripListPage />} />
        </Route>
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>
    </Routes>
  );
}
