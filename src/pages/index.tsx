import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout, DefaultLayout, AuthLayout } from "@/components/layouts";
import { LoginPage, RegisterPage, LogoutPage } from "./auth";
import TripListPage from "./trip-list";
import TripDetailPage from "./trip-detail";
import TripLayout from "@/components/layouts/TripLayout";
import ItineraryListPage from "./itinerary-list";

export default function Pages() {
  return (
    <Routes>
      <Route path="*" element={<Navigate to="/trips" replace />} />

      <Route element={<DefaultLayout />}>
        <Route element={<AppLayout />}>
          <Route path="trips" element={<TripListPage />} />

          <Route path="trips/:tripId" element={<TripLayout />}>
            <Route index element={<TripDetailPage />} />
            <Route
              path="locations/:locationId"
              element={<ItineraryListPage />}
            />
          </Route>
        </Route>
        <Route path="logout" element={<LogoutPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>
    </Routes>
  );
}
