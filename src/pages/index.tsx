import { Routes, Route } from "react-router-dom";
import { AppLayout, AuthLayout } from "@/components/layouts";
import { LoginPage, RegisterPage } from "./auth";

export default function Pages() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<div>Pages</div>} />
        <Route path="/trips" element={<div>Trips</div>} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>
    </Routes>
  );
}
