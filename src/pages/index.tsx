import { Routes, Route } from "react-router-dom";
import { AppLayout, DefaultLayout, AuthLayout } from "@/components/layouts";
import { LoginPage, RegisterPage } from "./auth";
import TripsPage from "./trips";

export default function Pages() {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route path="/" element={<div>Pages</div>} />

        <Route element={<AppLayout />}>
          <Route path="/trips" element={<TripsPage />} />
        </Route>
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>
    </Routes>
  );
}
