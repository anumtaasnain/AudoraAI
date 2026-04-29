import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from '../../context/AuthContext';
import LandingPage       from './components/LandingPage';
import LoginPage         from './components/LoginPage';
import RegistrationPage  from './components/RegistrationPage';
import RoleSelectionPage from './components/RoleSelectionPage';
import DashboardLayout   from './components/DashboardLayout';
import DashboardPage     from './components/DashboardPage';
import AttendeesPage     from './components/AttendeesPage';
import AnalyticsPage     from './components/AnalyticsPage';
import SponsorPage       from './components/SponsorPage';
import EventsPage        from './components/EventsPage';
import RegistrationsPage from './components/RegistrationsPage';
import UserProfilePage   from './components/UserProfilePage';
import CategoryManager   from './components/CategoryManager';
import ProtectedRoute    from './components/ProtectedRoute';
import SponsorshipRequestsPage from './components/SponsorshipRequestsPage';
import AudienceReportPage from './components/AudienceReportPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RoleSelectionPage />} />
        <Route path="/register/:role" element={<RegistrationPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index                element={<DashboardPage />} />
          <Route path="attendees"     element={<AttendeesPage />} />
          <Route path="analytics"     element={<AnalyticsPage />} />
          <Route path="sponsors"      element={<SponsorPage />} />
          <Route path="events"        element={<EventsPage />} />
          <Route path="events/:eventId/report" element={<AudienceReportPage />} />
          <Route path="registrations" element={<RegistrationsPage />} />
          <Route path="sponsorships" element={<SponsorshipRequestsPage />} />
          <Route path="profile"       element={<UserProfilePage />} />
          <Route path="categories"    element={
            <ProtectedRoute roles={['admin']}>
              <CategoryManager />
            </ProtectedRoute>
          } />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

