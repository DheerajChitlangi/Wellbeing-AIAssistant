import React, { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActivePath = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/mood', label: 'Mood', icon: '😊' },
    { path: '/activities', label: 'Activities', icon: '🏃' },
    { path: '/sleep', label: 'Sleep', icon: '😴' },
    { path: '/goals', label: 'Goals', icon: '🎯' },
    { path: '/financial', label: 'Financial', icon: '💰' },
    { path: '/worklife', label: 'Work-Life', icon: '⚖️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center group">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300">
                  ✨ Wellbeing Copilot
                </span>
              </Link>
            </div>

            {isAuthenticated && (
              <div className="hidden lg:flex items-center space-x-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`group relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isActivePath(link.path)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center">
                      <span className="mr-1.5 transform group-hover:scale-110 transition-transform duration-300">
                        {link.icon}
                      </span>
                      {link.label}
                    </span>
                    {isActivePath(link.path) && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                    )}
                  </Link>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <div className="hidden sm:flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      👤 {user?.username}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition-all duration-300"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          {isAuthenticated && (
            <div className="lg:hidden pb-3 pt-2 overflow-x-auto">
              <div className="flex space-x-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                      isActivePath(link.path)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-1">{link.icon}</span>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
