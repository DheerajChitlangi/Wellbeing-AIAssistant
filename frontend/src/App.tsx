import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MainDashboard from './pages/MainDashboard';
import DailyBriefingPage from './pages/DailyBriefingPage';
import CorrelationsView from './pages/CorrelationsView';
import RecommendationsCenter from './pages/RecommendationsCenter';
import WeeklyReviewPage from './pages/WeeklyReviewPage';
import InsightsTimeline from './pages/InsightsTimeline';
import Mood from './pages/Mood';
import Activities from './pages/Activities';
import Sleep from './pages/Sleep';
import Goals from './pages/Goals';
import Financial from './pages/Financial';
import WorkLife from './pages/WorkLife';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mood"
          element={
            <ProtectedRoute>
              <Mood />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activities"
          element={
            <ProtectedRoute>
              <Activities />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sleep"
          element={
            <ProtectedRoute>
              <Sleep />
            </ProtectedRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <Goals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/financial"
          element={
            <ProtectedRoute>
              <Financial />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worklife"
          element={
            <ProtectedRoute>
              <WorkLife />
            </ProtectedRoute>
          }
        />
        <Route
          path="/intelligence"
          element={
            <ProtectedRoute>
              <MainDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/intelligence/briefing"
          element={
            <ProtectedRoute>
              <DailyBriefingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/intelligence/correlations"
          element={
            <ProtectedRoute>
              <CorrelationsView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/intelligence/recommendations"
          element={
            <ProtectedRoute>
              <RecommendationsCenter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/intelligence/weekly-review"
          element={
            <ProtectedRoute>
              <WeeklyReviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/intelligence/insights"
          element={
            <ProtectedRoute>
              <InsightsTimeline />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
