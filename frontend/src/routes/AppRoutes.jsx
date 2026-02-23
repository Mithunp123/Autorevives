import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout, PublicLayout } from '@/layouts';
import { ProtectedRoute, PublicRoute } from './ProtectedRoute';
import {
  Dashboard,
  Users,
  UserDetails,
  Managers,
  Offices,
  Vehicles,
  VehicleDetails,
  VehicleForm,
  Auctions,
  Approvals,
  Reports,
  Settings,
  Login,
  Register,
  NotFound,
  Home,
  About,
  Contact,
  FAQ,
  Investors,
  PrivacyPolicy,
  Profile,
  OfficeProfile,
  PublicAuctions,
  PublicAuctionDetails,
} from '@/pages';

export default function AppRoutes() {
  return (
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
        <Route path="/auctions" element={<Auctions />} />

        {/* Office profile */}
        <Route path="/office-profile" element={<OfficeProfile />} />

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
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/investors" element={<Investors />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/public/auctions" element={<PublicAuctions />} />
        <Route path="/public/auctions/:id" element={<PublicAuctionDetails />} />
      </Route>

      {/* Profile (protected, inside dashboard) */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
