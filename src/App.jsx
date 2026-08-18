import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AlertCircle } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TimerProvider } from './context/TimerContext';
import { GamificationProvider } from './context/GamificationContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
// Lazy-load page routes so the initial bundle stays small and the app
// starts/feels faster (each page is only fetched when it's first visited).
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Subjects = React.lazy(() => import('./pages/Subjects'));
const Study = React.lazy(() => import('./pages/Study'));
const Tasks = React.lazy(() => import('./pages/Tasks'));
const AISchedule = React.lazy(() => import('./pages/Schedule'));
const Insights = React.lazy(() => import('./pages/Insights'));
const Mastery = React.lazy(() => import('./pages/Mastery'));
const Resources = React.lazy(() => import('./pages/Resources'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Terms = React.lazy(() => import('./pages/Terms'));
const Landing = React.lazy(() => import('./pages/Landing'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Payment = React.lazy(() => import('./pages/Payment'));
const PaymentSuccess = React.lazy(() => import('./pages/PaymentSuccess'));
const Blog = React.lazy(() => import('./pages/Blog'));
const BlogPost = React.lazy(() => import('./pages/BlogPost'));
import OnboardingFlow from "./components/OnboardingFlow";
import Footer from './components/Footer';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardProvider } from './context/DashboardContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { AdminProvider } from './context/AdminContext';
const Admin = React.lazy(() => import('./pages/Admin'));
import Unsupported from './pages/Unsupported';
const NotFound = React.lazy(() => import('./pages/NotFound'));
import { isMobileDevice } from './utils/deviceDetection';
import { useWebsiteTimeTracker } from './hooks/useWebsiteTimeTracker';
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';
import ToastProvider from './context/ToastContext';
import { useOffline } from './hooks/useOffline';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import RewardSystem from './components/RewardSystem';
import PremiumGiftSystem from './components/PremiumGiftSystem';
import MilestonePromoPopup from './components/MilestonePromoPopup';
import FloatingStudyTimer from './components/FloatingStudyTimer';
import CrossDeviceStudySync from './components/CrossDeviceStudySync';
import UserFeedbackSurveyPopup from './components/UserFeedbackSurveyPopup';
import './styles/index.css';


const RouteCleanup = () => {
  const location = useLocation();

  // Capture referral code from URL
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) {
      sessionStorage.setItem('referralCode', ref);
      // Clean up the URL
      try {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      } catch (e) {
        console.warn('Failed to clean up URL:', e);
      }
    }
  }, [location]);

  return null;
};

// Component to track website time globally
const WebsiteTimeTracker = () => {
  useWebsiteTimeTracker();
  return null;
};

// Offline indicator component
const OfflineIndicator = () => {
  const { isOnline } = useOffline();
  
  if (isOnline) return null;
  
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 bg-yellow-600 text-white rounded-lg shadow-lg flex items-center gap-2">
      <AlertCircle className="w-4 h-4" />
      <span className="text-sm font-medium">You are offline</span>
    </div>
  );
};

// Keyboard shortcuts handler
const KeyboardShortcutsHandler = () => {
  useKeyboardShortcuts();
  return null;
};

// Onboarding wrapper to show onboarding for new users
const OnboardingWrapper = ({ children }) => {
  const { user, onboardingCompleted, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Only show onboarding for logged-in users who haven't completed it
    if (user && !onboardingCompleted && !loading) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [user, onboardingCompleted, loading]);

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  return children;
};

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check on mount
    setIsMobile(isMobileDevice());
    setIsChecking(false);

    // Check on window resize
    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show loading while checking
  if (isChecking) {
    return <LoadingScreen />;
  }

  // Show unsupported page for mobile devices
  if (isMobile) {
    return <Unsupported />;
  }

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <ToastProvider>
          <AuthProvider>
            <AdminProvider>
            <SubscriptionProvider>
              <GamificationProvider>
                <TimerProvider>
                  <ThemeProvider>
                    <DashboardProvider>
                      <OfflineIndicator />
                      <Router>
                        <MilestonePromoPopup />
                        <UserFeedbackSurveyPopup />
                        <RewardSystem />
                        <PremiumGiftSystem />
                        <RouteCleanup />
                        <FloatingStudyTimer />
                        <CrossDeviceStudySync />
                          <WebsiteTimeTracker />
                          <KeyboardShortcutsHandler />
                          <OnboardingWrapper>
                    <Suspense fallback={<LoadingScreen />}>
                    <Routes>
              {/* Public Routes */}
              <Route path="/" element={<div className="flex flex-col min-h-screen"><main className="flex-1"><Landing /><Footer /></main></div>} />
              <Route path="/login" element={<div className="flex flex-col min-h-screen"><main className="flex-1"><Login /><Footer /></main></div>} />
              <Route path="/signup" element={<div className="flex flex-col min-h-screen"><main className="flex-1"><Signup /><Footer /></main></div>} />

              <Route path="/terms" element={<div className="flex flex-col min-h-screen"><main className="flex-1"><Terms /><Footer /></main></div>} />

              

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <div className="flex h-screen bg-[var(--app-bg)]">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Navbar />
                      <main className="flex-1 overflow-auto">
                        <Dashboard />
                        <Footer withSidebar />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/subjects" element={
                <ProtectedRoute>
                  <div className="flex h-screen bg-[var(--app-bg)]">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Navbar />
                      <main className="flex-1 overflow-auto">
                        <Subjects />
                        <Footer withSidebar />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/study" element={
                <ProtectedRoute>
                  <div className="flex h-screen bg-[var(--app-bg)]">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Navbar />
                      <main className="flex-1 overflow-auto">
                        <Study />
                        <Footer withSidebar />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />

              

              <Route path="/tasks" element={
                <ProtectedRoute>
                  <div className="flex h-screen bg-[var(--app-bg)]">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Navbar />
                      <main className="flex-1 overflow-auto">
                        <Tasks />
                        <Footer withSidebar />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/schedule" element={
                <ProtectedRoute>
                  <div className="flex h-screen bg-[var(--app-bg)]">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Navbar />
                      <main className="flex-1 overflow-auto">
                        <AISchedule />
                        <Footer withSidebar />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/insights" element={
                <ProtectedRoute>
                  <div className="flex h-screen bg-[var(--app-bg)]">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Navbar />
                      <main className="flex-1 overflow-auto">
                        <Insights />
                        <Footer withSidebar />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/mastery" element={
                <ProtectedRoute>
                  <div className="flex h-screen bg-[var(--app-bg)]">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Navbar />
                      <main className="flex-1 overflow-auto">
                        <Mastery />
                        <Footer withSidebar />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/settings" element={
                <ProtectedRoute>
                  <div className="flex h-screen bg-[var(--app-bg)]">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Navbar />
                      <main className="flex-1 overflow-auto">
                        <Settings />
                        <Footer withSidebar />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/admin" element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } />

              <Route path="/resources" element={
                <ProtectedRoute>
                  <div className="flex h-screen bg-[var(--app-bg)]">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Navbar />
                      <main className="flex-1 overflow-auto">
                        <Resources />
                        <Footer withSidebar />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/payment" element={
                <ProtectedRoute>
                  <div className="flex h-screen bg-[var(--app-bg)]">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Navbar />
                      <main className="flex-1 overflow-auto">
                        <Payment />
                        <Footer withSidebar />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/payment/success" element={
                <ProtectedRoute>
                  <PaymentSuccess />
                </ProtectedRoute>
              } />


              {/* Blog Routes - Not in navigation, SEO only */}
              <Route path="/blog" element={<div className="flex flex-col min-h-screen"><main className="flex-1"><Blog /></main></div>} />
              <Route path="/blog/:slug" element={<div className="flex flex-col min-h-screen"><main className="flex-1"><BlogPost /></main></div>} />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
                    </Suspense>
                          </OnboardingWrapper>
                      </Router>
                    </DashboardProvider>
                  </ThemeProvider>
                </TimerProvider>
              </GamificationProvider>
            </SubscriptionProvider>
            </AdminProvider>
          </AuthProvider>
        </ToastProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
