import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TimerProvider } from './context/TimerContext';
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
import './styles/index.css';


function App() {
  return (
    <AuthProvider>
      <GamificationProvider>
        <TimerProvider>
          <Router>

            <OnboardingModal />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              

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
