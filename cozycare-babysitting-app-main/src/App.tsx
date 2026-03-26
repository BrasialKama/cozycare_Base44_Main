import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { HomePage } from './pages/HomePage';
import { NanniesPage } from './pages/NanniesPage';
import { NannyProfilePage } from './pages/NannyProfilePage';
import { LocationDateEntryPage } from './pages/LocationDateEntryPage';
import { AuthChoicePage } from './pages/AuthChoicePage';
import { ParentHomePage } from './pages/ParentHomePage';
import { ParentLocationsPage } from './pages/ParentLocationsPage';
import { ParentAccountPage } from './pages/ParentAccountPage';
import { BookingRequestPage } from './pages/BookingRequestPage';
import { NannyOnboardingPage } from './pages/NannyOnboardingPage';
import { NannyDashboardPage } from './pages/NannyDashboardPage';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

const rootRoute = createRootRoute({
  component: () => (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const nanniesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/nannies',
  component: NanniesPage,
});

const nannyProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/nannies/$nannyId',
  component: NannyProfilePage,
});

const startRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/start',
  component: LocationDateEntryPage,
});

const authChoiceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/choose',
  component: AuthChoicePage,
});

const parentHomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/parent/home',
  component: ParentHomePage,
});

const parentLocationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/parent/locations',
  component: ParentLocationsPage,
});

const parentAccountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/parent/account',
  component: ParentAccountPage,
});

const bookingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/booking/$nannyId',
  component: BookingRequestPage,
});

const nannyOnboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/nanny/onboarding',
  component: NannyOnboardingPage,
});

const nannyDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/nanny/dashboard',
  component: NannyDashboardPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  nanniesRoute,
  nannyProfileRoute,
  startRoute,
  authChoiceRoute,
  parentHomeRoute,
  parentLocationsRoute,
  parentAccountRoute,
  bookingRoute,
  nannyOnboardingRoute,
  nannyDashboardRoute,
]);
const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
