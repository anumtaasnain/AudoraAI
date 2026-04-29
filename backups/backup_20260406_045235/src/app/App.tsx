import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import LandingPage       from './components/LandingPage';
import LoginPage         from './components/LoginPage';
import RegistrationPage  from './components/RegistrationPage';
import DashboardLayout   from './components/DashboardLayout';
import DashboardPage     from './components/DashboardPage';
import AttendeesPage     from './components/AttendeesPage';
import AnalyticsPage     from './components/AnalyticsPage';
import SponsorPage       from './components/SponsorPage';
import EventsPage        from './components/EventsPage';
import RegistrationsPage from './components/RegistrationsPage';
import UserProfilePage   from './components/UserProfilePage';
import ProtectedRoute    from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />

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
          <Route path="registrations" element={<RegistrationsPage />} />
          <Route path="profile"       element={<UserProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}