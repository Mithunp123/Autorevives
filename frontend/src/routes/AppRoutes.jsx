import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { DashboardLayout, PublicLayout } from '@/layouts';
import { ProtectedRoute, PublicRoute } from './ProtectedRoute';

/* ── Eagerly loaded (above the fold / first paint) ── */
import Home from '@/pages/Home';

/* ── Lazy loaded (code-split) ── */
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Users = lazy(() => import('@/pages/Users'));
const UserDetails = lazy(() => import('@/pages/UserDetails'));
const Managers = lazy(() => import('@/pages/Managers'));
const Offices = lazy(() => import('@/pages/Offices'));
const Finance = lazy(() => import('@/pages/Finance'));
const Vehicles = lazy(() => import('@/pages/Vehicles'));
const VehicleDetails = lazy(() => import('@/pages/VehicleDetails'));
const VehicleForm = lazy(() => import('@/pages/VehicleForm'));
const Auctions = lazy(() => import('@/pages/Auctions'));
const Approvals = lazy(() => import('@/pages/Approvals'));
const Reports = lazy(() => import('@/pages/Reports'));
const Settings = lazy(() => import('@/pages/Settings'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const Investors = lazy(() => import('@/pages/Investors'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const Profile = lazy(() => import('@/pages/Profile'));
const OfficeProfile = lazy(() => import('@/pages/OfficeProfile'));
const PublicAuctions = lazy(() => import('@/pages/PublicAuctions'));
const PublicAuctionDetails = lazy(() => import('@/pages/PublicAuctionDetails'));
const SellVehicle = lazy(() => import('@/pages/SellVehicle'));
const Wishlist = lazy(() => import('@/pages/Wishlist'));
const Transactions = lazy(() => import('@/pages/Transactions'));
const Winnings = lazy(() => import('@/pages/Winnings'));
const PaymentVerification = lazy(() => import('@/pages/PaymentVerification'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));

/* ── Minimal loading spinner ── */
function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-inherit">
      <div className="w-8 h-8 border-[3px] border-gold-200 border-t-gold-500 rounded-full animate-spin" />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Public routes */}
        {/* Login & Register are now nested inside PublicLayout so <Outlet /> renders them */}

        {/* Protected dashboard routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Vehicles — accessible by admin + office */}
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/vehicles/add" element={<VehicleForm />} />
          <Route path="/vehicles/:id" element={<VehicleDetails />} />
          <Route path="/vehicles/:id/edit" element={<VehicleForm />} />

          {/* Auctions — accessible by admin + office */}
          <Route path="/manage/auctions" element={<Auctions />} />

          {/* Office profile */}
          <Route path="/office-profile" element={<OfficeProfile />} />

          {/* Winnings — admin + office */}
          <Route path="/winnings" element={<Winnings />} />

          {/* Payment verification — admin only */}
          <Route
            path="/payments"
            element={
              <ProtectedRoute roles={['admin']}>
                <PaymentVerification />
              </ProtectedRoute>
            }
          />

          {/* Admin-only routes */}
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={['admin']}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:id"
            element={
              <ProtectedRoute roles={['admin']}>
                <UserDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/managers"
            element={
              <ProtectedRoute roles={['admin']}>
                <Managers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/offices"
            element={
              <ProtectedRoute roles={['admin']}>
                <Offices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance"
            element={
              <ProtectedRoute roles={['admin']}>
                <Finance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/approvals"
            element={
              <ProtectedRoute roles={['admin']}>
                <Approvals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute roles={['admin']}>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute roles={['admin']}>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Public pages wrapped in PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/investors" element={<Investors />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/sell" element={<SellVehicle />} />
          <Route path="/auctions" element={<PublicAuctions />} />
          <Route path="/auctions/:id" element={<PublicAuctionDetails />} />
        </Route>

        {/* Profile and User Features (protected, inside dashboard) */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/transactions" element={<Transactions />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
