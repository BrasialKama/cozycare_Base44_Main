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
import NannyReviews from '@/pages/NannyReviews';
import LeaveReview from '@/pages/LeaveReview';
import Earnings from '@/pages/Earnings';
import SafetyCenter from '@/pages/SafetyCenter';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminApplications from '@/pages/AdminApplications';
import AdminBookings from '@/pages/AdminBookings';
import AdminReports from '@/pages/AdminReports';
import Join from '@/pages/Join';
import Landing from '@/pages/Landing';
import NannyPortal from '@/pages/NannyPortal';
import RequireRole from '@/components/auth/RequireRole';
import ErrorBoundary from '@/components/shared/ErrorBoundary';

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
  }

  return (
    <Routes>
      {/* Public routes — always accessible */}
      <Route path="/Onboarding" element={<ErrorBoundary><Onboarding /></ErrorBoundary>} />
      <Route path="/NannyOnboarding" element={<ErrorBoundary><NannyOnboarding /></ErrorBoundary>} />
      <Route path="/Join" element={<ErrorBoundary><Join /></ErrorBoundary>} />

      {/* Landing page — outside AppLayout, shown to unauthenticated users */}
      <Route path="/" element={!isAuthenticated ? <Landing /> : <Navigate to="/Home" replace />} />
      {!isAuthenticated && <Route path="/Landing" element={<Landing />} />}

      {/* Routes inside AppLayout — ErrorBoundary keeps the nav alive on page crash */}
      <Route element={<AppLayout />}>
        {isAuthenticated && <Route path="/Landing" element={<Landing />} />}
        <Route path="/Home" element={<ErrorBoundary><Home /></ErrorBoundary>} />
        <Route path="/FindNannies" element={<ErrorBoundary><FindNannies /></ErrorBoundary>} />
        <Route path="/NannyDetail" element={<ErrorBoundary><NannyDetail /></ErrorBoundary>} />
        <Route path="/BookNanny" element={<ErrorBoundary><BookNanny /></ErrorBoundary>} />
        <Route path="/MyBookings" element={<ErrorBoundary><MyBookings /></ErrorBoundary>} />
        <Route path="/Messages" element={<ErrorBoundary><Messages /></ErrorBoundary>} />
        <Route path="/FamilySettings" element={<ErrorBoundary><FamilySettings /></ErrorBoundary>} />
        <Route path="/LeaveReview" element={<ErrorBoundary><LeaveReview /></ErrorBoundary>} />
        <Route path="/SafetyCenter" element={<ErrorBoundary><SafetyCenter /></ErrorBoundary>} />

        {/* Admin-only routes */}
        <Route element={<RequireRole allowed={['admin']} />}>
          <Route path="/AdminDashboard" element={<AdminDashboard />} />
          <Route path="/AdminApplications" element={<AdminApplications />} />
          <Route path="/AdminBookings" element={<AdminBookings />} />
          <Route path="/AdminReports" element={<AdminReports />} />
        </Route>

        {/* Nanny-only routes */}
        <Route element={<RequireRole allowed={['nanny']} />}>
          <Route path="/NannyPortal" element={<NannyPortal />} />
          <Route path="/NannyProfile" element={<NannyProfile />} />
          <Route path="/NannyReviews" element={<NannyReviews />} />
          <Route path="/NannyBookings" element={<NannyBookings />} />
          <Route path="/Earnings" element={<Earnings />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App