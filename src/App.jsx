import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
import OnboardingModal from "./components/OnboardingModal";
import Footer from './components/Footer';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardProvider } from './context/DashboardContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
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

function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <GamificationProvider>
          <TimerProvider>
            <ThemeProvider>
              <DashboardProvider>
              <Router>
              <RouteCleanup />
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
            </Routes>
            </Router>
            </DashboardProvider>
          </ThemeProvider>
        </TimerProvider>
      </GamificationProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;
