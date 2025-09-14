import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TimerProvider, useTimer } from './context/TimerContext';
import { GamificationProvider } from './context/GamificationContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import GamifiedDashboard from './components/GamifiedDashboard';
import Subjects from './pages/Subjects';
import Study from './pages/Study';
import Tasks from './pages/Tasks';
import Schedule from './pages/Schedule';
import Insights from './pages/Insights';
import Privacy from './pages/Privacy';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OnboardingModal from "./components/OnboardingModal";
import Footer from './components/Footer';
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
      <GamificationProvider>
        <TimerProvider>
          <Router>
            <RouteCleanup />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<div className="flex flex-col min-h-screen"><main className="flex-1"><Landing /></main><Footer /></div>} />
              <Route path="/login" element={<div className="flex flex-col min-h-screen"><main className="flex-1"><Login /></main><Footer /></div>} />
              <Route path="/signup" element={<div className="flex flex-col min-h-screen"><main className="flex-1"><Signup /></main><Footer /></div>} />

              

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <div className="flex h-screen bg-gray-50">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Navbar />
                      <main className="flex-1 overflow-auto">
                        <GamifiedDashboard />
                      </main>
                      <Footer />
                    </div>
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/classic-dashboard" element={
                <ProtectedRoute>
                  <div className="flex h-screen bg-gray-50">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Navbar />
                      <main className="flex-1 overflow-auto">
                        <Dashboard />
                      </main>
                      <Footer />
                    </div>
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/subjects" element={
                <ProtectedRoute>
                  <div className="flex h-screen bg-gray-50">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Navbar />
                      <main className="flex-1 overflow-auto">
                        <Subjects />
                      </main>
                      <Footer />
                    </div>
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/study" element={
                <ProtectedRoute>
                  <div className="flex h-screen bg-gray-50">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Navbar />
                      <main className="flex-1 overflow-auto">
                        <Study />
                      </main>
                      <Footer />
                    </div>
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/tasks" element={
                <ProtectedRoute>
                  <div className="flex h-screen bg-gray-50">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Navbar />
                      <main className="flex-1 overflow-auto">
                        <Tasks />
                      </main>
                      <Footer />
                    </div>
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/schedule" element={
                <ProtectedRoute>
                  <div className="flex h-screen bg-gray-50">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Navbar />
                      <main className="flex-1 overflow-auto">
                        <Schedule />
                      </main>
                      <Footer />
                    </div>
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/insights" element={
                <ProtectedRoute>
                  <div className="flex h-screen bg-gray-50">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Navbar />
                      <main className="flex-1 overflow-auto">
                        <Insights />
                      </main>
                      <Footer />
                    </div>
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/privacy" element={
                <ProtectedRoute>
                  <div className="flex h-screen bg-gray-50">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Navbar />
                      <main className="flex-1 overflow-auto">
                        <Privacy />
                      </main>
                      <Footer />
                    </div>
                  </div>
                </ProtectedRoute>
              } />
            </Routes>
          </Router>
        </TimerProvider>
      </GamificationProvider>
    </AuthProvider>
  );
}

export default App;
