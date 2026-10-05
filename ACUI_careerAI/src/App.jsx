import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { CareerProvider } from './context/CareerContext'

const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Careers = lazy(() => import('./pages/Careers'))
const CareerDetails = lazy(() => import('./pages/CareerDetails'))
const Learning = lazy(() => import('./pages/Learning'))
const Roadmap = lazy(() => import('./pages/Roadmap'))
const Assessment = lazy(() => import('./pages/Assessment'))
const AssessmentStage = lazy(() => import('./pages/AssessmentStage'))
const MockInterview = lazy(() => import('./pages/MockInterview'))
const SkillAnalysis = lazy(() => import('./pages/SkillAnalysis'))
const Certificate = lazy(() => import('./pages/Certificate'))
const Jobs = lazy(() => import('./pages/Jobs'))
const Profile = lazy(() => import('./pages/Profile'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminUserDetail = lazy(() => import('./pages/AdminUserDetail'))
const NotFound = lazy(() => import('./pages/NotFound'))
import DashboardLayout from './components/Layout/DashboardLayout'
import ProtectedRoute from './components/common/ProtectedRoute'
import AdminProtectedRoute from './components/common/AdminProtectedRoute'
import LearningErrorBoundary from './components/common/LearningErrorBoundary'

function LearningRouteBoundary({ children }) {
  const { pathname } = useLocation()
  return <LearningErrorBoundary key={pathname}>{children}</LearningErrorBoundary>
}

function RouteLoadingFallback() {
  const { pathname } = useLocation()
  const isAdminRoute = pathname.startsWith('/admin')
  const colors = isAdminRoute ? 'bg-white text-slate-500' : 'bg-navy-900 text-gray-500'
  return <div className={`min-h-screen ${colors} p-8 text-center`} role="status" aria-live="polite">Loading CareerAI…</div>
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminAuthProvider>
          <CareerProvider>
            <Suspense fallback={<RouteLoadingFallback />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/admin/login" element={<AdminLogin />} />

                <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                <Route path="/admin/users/:userId" element={<AdminProtectedRoute><AdminUserDetail /></AdminProtectedRoute>} />

                <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/careers" element={<Careers />} />
                  <Route path="/careers/:careerId" element={<CareerDetails />} />
                  <Route path="/learning" element={<LearningRouteBoundary><Learning /></LearningRouteBoundary>} />
                  <Route path="/roadmap/:topicId" element={<LearningRouteBoundary><Roadmap /></LearningRouteBoundary>} />
                  <Route path="/assessment" element={<Assessment />} />
                  <Route path="/assessment/:stage" element={<AssessmentStage />} />
                  <Route path="/mock-interview" element={<MockInterview />} />
                  <Route path="/skill-analysis" element={<SkillAnalysis />} />
                  <Route path="/certificate" element={<Certificate />} />
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </CareerProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
