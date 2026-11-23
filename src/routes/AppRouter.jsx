import { Routes, Route, Navigate } from "react-router-dom";

import Splash from "../pages/Splash/Splash";

import Dashboard from "../pages/Dashboard/Dashboard";

import AddCheque from "../pages/AddCheque/AddCheque";
import ChequeList from "../pages/Cheques/ChequeList";
import EditCheque from "../pages/EditCheque/EditCheque";

import InstallmentList from "../pages/Installments/InstallmentList";
import AddInstallment from "../pages/Installments/AddInstallment";
import EditInstallment from "../pages/Installments/EditInstallment";
import InstallmentDashboard from "../pages/Installments/InstallmentDashboard";
import InstallmentDetails from "../pages/Installments/InstallmentDetails";

import Reports from "../pages/Reports/Reports";

import Settings from "../pages/Settings/Settings";
import About from "../pages/About/About";

export default function AppRouter() {
  return (
    <Routes>
      {/* =========================
          شروع برنامه
      ========================= */}

      <Route path="/" element={<Splash />} />

      {/* =========================
          داشبورد
      ========================= */}

      <Route path="/dashboard" element={<Dashboard />} />

      {/* =========================
          چک‌ها
      ========================= */}

      <Route path="/cheques" element={<ChequeList />} />

      <Route path="/add-cheque" element={<AddCheque />} />

      <Route path="/edit-cheque/:id" element={<EditCheque />} />

      {/* =========================
          اقساط
      ========================= */}

      <Route path="/installments" element={<InstallmentList />} />

      <Route path="/installments/add" element={<AddInstallment />} />

      <Route path="/installments/:id" element={<InstallmentDetails />} />

      <Route path="/installments/edit/:id" element={<EditInstallment />} />

      <Route
        path="/installments-dashboard"
        element={<InstallmentDashboard />}
      />

      {/* =========================
          گزارش‌ها
      ========================= */}

      <Route path="/reports" element={<Reports />} />

      {/* =========================
          تنظیمات
      ========================= */}

      <Route path="/settings" element={<Settings />} />
      <Route path="/about" element={<About />} />

      {/* =========================
          مسیر اشتباه
      ========================= */}

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
