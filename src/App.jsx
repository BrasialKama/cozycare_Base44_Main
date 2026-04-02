import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppLayout from '@/components/layout/AppLayout';
import Onboarding from '@/pages/Onboarding';
import NannyOnboarding from '@/pages/NannyOnboarding';
import Home from '@/pages/Home';
import FindNannies from '@/pages/FindNannies';
import NannyDetail from '@/pages/NannyDetail';
import BookNanny from '@/pages/BookNanny.jsx';
import MyBookings from '@/pages/MyBookings';
import NannyBookings from '@/pages/NannyBookings';
import Messages from '@/pages/Messages';
import FamilySettings from '@/pages/FamilySettings';
import NannyProfile from '@/pages/NannyProfile';
import LeaveReview from '@/pages/LeaveReview';
import Earnings from '@/pages/Earnings';
import SafetyCenter from '@/pages/SafetyCenter';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminApplications from '@/pages/AdminApplications';
import AdminBookings from '@/pages/AdminBookings';
import AdminReports from '@/pages/AdminReports';
import Landing from '@/pages/Landing';
import NannyPortal from '@/pages/NannyPortal';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, isAuthenticated, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground font-body">Učitavanje CozyCare...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    // For auth_required, still allow public browsing routes
    // Only redirect to login for protected routes
  }

  return (
    <Routes>
      {/* Public routes — always accessible */}
      <Route path="/Onboarding" element={<Onboarding />} />
      <Route path="/NannyOnboarding" element={<NannyOnboarding />} />

      {/* Landing page — outside AppLayout, shown to unauthenticated users */}
      <Route path="/" element={!isAuthenticated ? <Landing /> : <Navigate to="/Home" replace />} />
      <Route path="/Landing" element={<Landing />} />

      {/* Routes inside AppLayout */}
      <Route element={<AppLayout />}>
        <Route path="/Home" element={<Home />} />
        <Route path="/FindNannies" element={<FindNannies />} />
        <Route path="/NannyDetail" element={<NannyDetail />} />
        <Route path="/BookNanny" element={<BookNanny />} />
        <Route path="/MyBookings" element={<MyBookings />} />
        <Route path="/NannyBookings" element={<NannyBookings />} />
        <Route path="/Messages" element={<Messages />} />
        <Route path="/FamilySettings" element={<FamilySettings />} />
        <Route path="/NannyProfile" element={<NannyProfile />} />
        <Route path="/LeaveReview" element={<LeaveReview />} />
        <Route path="/Earnings" element={<Earnings />} />
        <Route path="/SafetyCenter" element={<SafetyCenter />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/AdminApplications" element={<AdminApplications />} />
        <Route path="/AdminBookings" element={<AdminBookings />} />
        <Route path="/AdminReports" element={<AdminReports />} />
        <Route path="/NannyPortal" element={<NannyPortal />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App