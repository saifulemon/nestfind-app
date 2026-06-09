import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/app.css";
import Providers from "./hooks/providers/providers";
import RenterLayout from "./components/layouts/RenterLayout";
import AdminLayout from "./components/layouts/AdminLayout";
import AuthLayout from "./pages/auth/layout";
import LandingPage from "./pages/landing";
import LoginPage from "./pages/auth/login";
import SignupPage from "./pages/auth/signup";
import ForgotPassword from "./pages/auth/forgot-password";
import ResetPassword from "./pages/auth/reset-password";
import AdminDashboard from "./pages/admin/dashboard";
import AdminProperties from "./pages/admin/properties";
import AdminInquiries from "./pages/admin/inquiries";
import AdminUsers from "./pages/admin/users";
import PropertyForm from "./pages/admin/property-form";
import AdminReviewsPage from "./pages/admin/reviews";
import AdminToursPage from "./pages/admin/tours";
import AdminApplicationsPage from "./pages/admin/applications";
import AdminMessagesPage from "./pages/admin/messages";
import SearchPage from "./pages/renter/search";
import DetailPage from "./pages/renter/detail";
import FavoritesPage from "./pages/renter/favorites";
import InquiriesPage from "./pages/renter/inquiries";
import ProfilePage from "./pages/profile";
import RecommendationsPage from "./pages/renter/recommendations";
import SavedSearchesPage from "./pages/renter/saved-searches";
import MapSearchPage from "./pages/renter/map-search";
import MyToursPage from "./pages/renter/my-tours";
import MessagesPage from "./pages/renter/messages";
import MyApplicationsPage from "./pages/renter/my-applications";
import ApplicationFormPage from "./pages/renter/application-form";
import NotFound from "./pages/not-found";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Providers>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth pages — wrapped in AuthLayout with GuestGuard */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/register" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Renter protected — wrapped in RenterLayout */}
          <Route element={<RenterLayout />}>
            <Route path="/search" element={<SearchPage />} />
            <Route path="/property/:id" element={<DetailPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/inquiries" element={<InquiriesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/saved-searches" element={<SavedSearchesPage />} />
            <Route path="/map-search" element={<MapSearchPage />} />
            <Route path="/tours" element={<MyToursPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/applications" element={<MyApplicationsPage />} />
            <Route path="/applications/new/:propertyId" element={<ApplicationFormPage />} />
          </Route>

          {/* Admin protected — wrapped in AdminLayout */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/properties" element={<AdminProperties />} />
            <Route path="/admin/properties/new" element={<PropertyForm />} />
            <Route path="/admin/properties/:id/edit" element={<PropertyForm />} />
            <Route path="/admin/inquiries" element={<AdminInquiries />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/reviews" element={<AdminReviewsPage />} />
            <Route path="/admin/tours" element={<AdminToursPage />} />
            <Route path="/admin/applications" element={<AdminApplicationsPage />} />
            <Route path="/admin/messages" element={<AdminMessagesPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Providers>
    </BrowserRouter>
  </StrictMode>
);
