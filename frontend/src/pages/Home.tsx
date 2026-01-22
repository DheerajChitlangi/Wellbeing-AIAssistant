import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: '😊',
      title: 'Mood Tracking',
      description: 'Monitor your emotional wellbeing with daily mood, energy, and stress tracking.',
      gradient: 'from-purple-400 to-pink-500',
    },
    {
      icon: '😴',
      title: 'Sleep Monitoring',
      description: 'Track your sleep patterns and quality to improve rest and recovery.',
      gradient: 'from-blue-400 to-cyan-500',
    },
    {
      icon: '🏃',
      title: 'Activity Logging',
      description: 'Record your physical activities and maintain an active lifestyle.',
      gradient: 'from-green-400 to-emerald-500',
    },
    {
      icon: '🎯',
      title: 'Goal Management',
      description: 'Set, track, and achieve your personal wellbeing goals.',
      gradient: 'from-orange-400 to-red-500',
    },
    {
      icon: '💰',
      title: 'Financial Health',
      description: 'Monitor your financial wellbeing with budgets and expense tracking.',
      gradient: 'from-yellow-400 to-amber-500',
    },
    {
      icon: '⚖️',
      title: 'Work-Life Balance',
      description: 'Achieve harmony between work and personal life.',
      gradient: 'from-indigo-400 to-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          {/* Animated Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold mb-8 shadow-lg animate-pulse">
            <span className="mr-2">✨</span>
            Your Complete Wellbeing Platform
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Wellbeing Copilot
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
            Take control of your mental, physical, and financial health.
            Track, analyze, and improve every aspect of your wellbeing in one place.
          </p>

          {/* CTA Buttons */}
          {isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dashboard"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <span className="mr-2">📊</span>
                Go to Dashboard
                <span className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <span className="mr-2">🚀</span>
                Get Started Free
                <span className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-gray-700 bg-white rounded-2xl shadow-lg hover:shadow-xl border-2 border-gray-200 transform hover:-translate-y-1 transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for a Balanced Life
          </h2>
          <p className="text-xl text-gray-600">
            Comprehensive tools to track and improve your wellbeing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

              {/* Content */}
              <div className="relative p-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white text-3xl mb-4 transform group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div className="transform hover:scale-105 transition-transform duration-300">
              <div className="text-5xl font-bold mb-2">6</div>
              <div className="text-xl opacity-90">Wellbeing Pillars</div>
            </div>
            <div className="transform hover:scale-105 transition-transform duration-300">
              <div className="text-5xl font-bold mb-2">∞</div>
              <div className="text-xl opacity-90">Track Unlimited Data</div>
            </div>
            <div className="transform hover:scale-105 transition-transform duration-300">
              <div className="text-5xl font-bold mb-2">24/7</div>
              <div className="text-xl opacity-90">Always Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!isAuthenticated && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Wellbeing?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join today and start your journey to a healthier, happier you.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-12 py-5 text-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <span className="mr-2">🌟</span>
              Start Your Free Journey
              <span className="ml-2">→</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
