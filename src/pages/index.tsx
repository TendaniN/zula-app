import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout, DefaultLayout, AuthLayout } from "@/components/layouts";
import { lazy, Suspense } from "react";
import { DefaultLoader } from "@/components/ui/DefaultLoader";

const TripLayout = lazy(() => import("@/components/layouts/TripLayout"));
const TripListPage = lazy(() => import("./trip-list"));
const TripDetailPage = lazy(() => import("./trip-detail"));
const ItineraryListPage = lazy(() => import("./itinerary-list"));
const LoginPage = lazy(() =>
  import("./auth").then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import("./auth").then((m) => ({ default: m.RegisterPage })),
);
const LogoutPage = lazy(() =>
  import("./auth").then((m) => ({ default: m.LogoutPage })),
);

const RouteFallback = () => <DefaultLoader />;

export default function Pages() {
  return (
    <Suspense fallback={<RouteFallback />}>
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
    </Suspense>
  );
}
