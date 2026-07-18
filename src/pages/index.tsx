import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layouts";

export default function Pages() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<div>Pages</div>} />
      </Route>
    </Routes>
  );
}
