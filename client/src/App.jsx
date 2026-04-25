import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth
import LoginPage    from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import LandingPage  from './pages/LandingPage';

// Job Poster
import PosterDashboard  from './pages/jobposter/Dashboard';
import PosterJobs       from './pages/jobposter/MyJobs';
import PosterJobForm    from './pages/jobposter/JobForm';
import PosterApplicants from './pages/jobposter/Applicants';
import PosterProfile    from './pages/jobposter/Profile';
import SeekerProfileView from './pages/jobposter/SeekerProfile';

// Job Seeker
import SeekerDashboard    from './pages/jobseeker/Dashboard';
import SeekerBrowseJobs   from './pages/jobseeker/BrowseJobs';
import SeekerJobDetail    from './pages/jobseeker/JobDetail';
import SeekerApplications from './pages/jobseeker/MyApplications';
import SeekerProfile      from './pages/jobseeker/Profile';

// Admin
import AdminDashboard    from './pages/admin/Dashboard';
import AdminUsers        from './pages/admin/Users';
import AdminJobs         from './pages/admin/Jobs';
import AdminApplications from './pages/admin/Applications';
import AdminReviews      from './pages/admin/Reviews';
import SeekerHistory     from './pages/admin/SeekerHistory';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role === 'jobposter')   return <Navigate to="/poster/dashboard" replace />;
  if (user.role === 'jobseeker')   return <Navigate to="/seeker/dashboard" replace />;
  if (user.role === 'systemadmin') return <Navigate to="/admin/dashboard"  replace />;
  return <Navigate to="/" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"         element={<LandingPage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/home"     element={<RoleRedirect />} />

          {/* Job Poster */}
          <Route path="/poster/dashboard"               element={<ProtectedRoute roles={['jobposter']}><PosterDashboard /></ProtectedRoute>} />
          <Route path="/poster/jobs"                    element={<ProtectedRoute roles={['jobposter']}><PosterJobs /></ProtectedRoute>} />
          <Route path="/poster/jobs/new"                element={<ProtectedRoute roles={['jobposter']}><PosterJobForm /></ProtectedRoute>} />
          <Route path="/poster/jobs/:id/edit"           element={<ProtectedRoute roles={['jobposter']}><PosterJobForm /></ProtectedRoute>} />
          <Route path="/poster/jobs/:id/applicants"     element={<ProtectedRoute roles={['jobposter']}><PosterApplicants /></ProtectedRoute>} />
          <Route path="/poster/profile"                 element={<ProtectedRoute roles={['jobposter']}><PosterProfile /></ProtectedRoute>} />
          <Route path="/poster/seekers/:userId/profile" element={<ProtectedRoute roles={['jobposter']}><SeekerProfileView /></ProtectedRoute>} />

          {/* Job Seeker */}
          <Route path="/seeker/dashboard"    element={<ProtectedRoute roles={['jobseeker']}><SeekerDashboard /></ProtectedRoute>} />
          <Route path="/seeker/jobs"         element={<ProtectedRoute roles={['jobseeker']}><SeekerBrowseJobs /></ProtectedRoute>} />
          <Route path="/seeker/jobs/:id"     element={<ProtectedRoute roles={['jobseeker']}><SeekerJobDetail /></ProtectedRoute>} />
          <Route path="/seeker/applications" element={<ProtectedRoute roles={['jobseeker']}><SeekerApplications /></ProtectedRoute>} />
          <Route path="/seeker/profile"      element={<ProtectedRoute roles={['jobseeker']}><SeekerProfile /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/dashboard"           element={<ProtectedRoute roles={['systemadmin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users"               element={<ProtectedRoute roles={['systemadmin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/jobs"                element={<ProtectedRoute roles={['systemadmin']}><AdminJobs /></ProtectedRoute>} />
          <Route path="/admin/applications"        element={<ProtectedRoute roles={['systemadmin']}><AdminApplications /></ProtectedRoute>} />
          <Route path="/admin/reviews"             element={<ProtectedRoute roles={['systemadmin']}><AdminReviews /></ProtectedRoute>} />
          <Route path="/admin/seekers/:id/history" element={<ProtectedRoute roles={['systemadmin']}><SeekerHistory /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}