import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TimerProvider, useTimer } from './context/TimerContext';
import { GamificationProvider } from './context/GamificationContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Study from './pages/Study';
import Tasks from './pages/Tasks';
import Schedule from './pages/Schedule';
import Insights from './pages/Insights';
import Mastery from './pages/Mastery';

import Resources from './pages/Resources';
import Settings from './pages/Settings';
import Terms from './pages/Terms';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import SpotifyCallback from './pages/SpotifyCallback';
import OnboardingFlow from "./components/OnboardingFlow";
import Footer from './components/Footer';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardProvider } from './context/DashboardContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { AdminProvider } from './context/AdminContext';
import Admin from './pages/Admin';
import Unsupported from './pages/Unsupported';
import NotFound from './pages/NotFound';
import { isMobileDevice } from './utils/deviceDetection';
import { useWebsiteTimeTracker } from './hooks/useWebsiteTimeTracker';
import './styles/index.css';


const RouteCleanup = () => {
  const location = useLocation();
  const { isRunning, stopTimer, resetTimer } = useTimer();
  React.useEffect(() => {
    if (location.pathname !== '/study' && isRunning) {
      try { stopTimer(); } catch {}
      try { resetTimer(); } catch {}
    }
  }, [location.pathname, isRunning, stopTimer, resetTimer]);
  return null;
};

// Component to track website time globally
const WebsiteTimeTracker = () => {
  useWebsiteTimeTracker();
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Show unsupported page for mobile devices
  if (isMobile) {
    return <Unsupported />;
  }

  return (
    <HelmetProvider>
      <AuthProvider>
        <AdminProvider>
          <SubscriptionProvider>
            <GamificationProvider>
              <TimerProvider>
                <ThemeProvider>
                  <DashboardProvider>
                    <Router>
                      <RouteCleanup />
                      <WebsiteTimeTracker />
                      <OnboardingWrapper>
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
                        <Schedule />
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

              <Route path="/callback" element={<SpotifyCallback />} />

              {/* Blog Routes - Not in navigation, SEO only */}
              <Route path="/blog" element={<div className="flex flex-col min-h-screen"><main className="flex-1"><Blog /></main></div>} />
              <Route path="/blog/:slug" element={<div className="flex flex-col min-h-screen"><main className="flex-1"><BlogPost /></main></div>} />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
                      </OnboardingWrapper>
                    </Router>
                  </DashboardProvider>
                </ThemeProvider>
              </TimerProvider>
            </GamificationProvider>
          </SubscriptionProvider>
        </AdminProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
