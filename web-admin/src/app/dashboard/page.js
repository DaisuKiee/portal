'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { StatCardSkeleton } from '@/components/SkeletonLoader';
import { adminAPI } from '@/services/api';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Applications',
      value: stats?.totalApplications || 0,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Pending Review',
      value: stats?.pendingApplications || 0,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      title: 'Approved',
      value: stats?.approvedApplications || 0,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Rejected',
      value: stats?.rejectedApplications || 0,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Verified Users',
      value: stats?.verifiedUsers || 0,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
              ))}
            </>
          ) : (
            statCards.map((card, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 ${card.bgColor} dark:bg-opacity-20 rounded-xl flex items-center justify-center ${card.textColor} dark:text-opacity-90 group-hover:scale-110 transition-transform duration-200`}>
                    {card.icon}
                  </div>
                  <div className={`w-10 h-10 bg-gradient-to-br ${card.color} rounded-full opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                </div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">{card.title}</h3>
                <p className={`text-4xl font-bold ${card.textColor} dark:text-opacity-90`}>
                  {card.value}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Analytics Charts */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Analytics Overview</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Application Status Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Application Status Distribution</h4>
              <div className="relative">
                {/* Donut Chart */}
                <div className="flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      
                      {/* Pending applications arc */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#f39c12"
                        strokeWidth="8"
                        strokeDasharray={`${((stats?.pendingApplications || 0) / Math.max(stats?.totalApplications || 1, 1)) * 251.2} 251.2`}
                        strokeDashoffset="0"
                        className="transition-all duration-1000 ease-out"
                      />
                      
                      {/* Approved applications arc */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#27ae60"
                        strokeWidth="8"
                        strokeDasharray={`${((stats?.approvedApplications || 0) / Math.max(stats?.totalApplications || 1, 1)) * 251.2} 251.2`}
                        strokeDashoffset={`-${((stats?.pendingApplications || 0) / Math.max(stats?.totalApplications || 1, 1)) * 251.2}`}
                        className="transition-all duration-1000 ease-out"
                      />
                      
                      {/* Rejected applications arc */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#e74c3c"
                        strokeWidth="8"
                        strokeDasharray={`${((stats?.rejectedApplications || 0) / Math.max(stats?.totalApplications || 1, 1)) * 251.2} 251.2`}
                        strokeDashoffset={`-${(((stats?.pendingApplications || 0) + (stats?.approvedApplications || 0)) / Math.max(stats?.totalApplications || 1, 1)) * 251.2}`}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    
                    {/* Center text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800 dark:text-white">
                          {stats?.totalApplications || 0}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Pending ({stats?.pendingApplications || 0})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Approved ({stats?.approvedApplications || 0})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Rejected ({stats?.rejectedApplications || 0})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* User Verification Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">User Verification Status</h4>
              <div className="space-y-4">
                {/* Verified Users Bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Verified Users</span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {stats?.verifiedUsers || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${Math.min(((stats?.verifiedUsers || 0) / Math.max(stats?.totalUsers || 1, 1)) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {Math.round(((stats?.verifiedUsers || 0) / Math.max(stats?.totalUsers || 1, 1)) * 100)}% of total users
                  </div>
                </div>

                {/* Unverified Users Bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Unverified Users</span>
                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                      {(stats?.totalUsers || 0) - (stats?.verifiedUsers || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${Math.min((((stats?.totalUsers || 0) - (stats?.verifiedUsers || 0)) / Math.max(stats?.totalUsers || 1, 1)) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {Math.round((((stats?.totalUsers || 0) - (stats?.verifiedUsers || 0)) / Math.max(stats?.totalUsers || 1, 1)) * 100)}% of total users
                  </div>
                </div>

                {/* Total Users Summary */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-800 dark:text-white">Total Users</span>
                    <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {stats?.totalUsers || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Application Trends Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Application Processing Overview</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Processing Rate */}
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#3498db"
                      strokeWidth="8"
                      strokeDasharray={`${(((stats?.approvedApplications || 0) + (stats?.rejectedApplications || 0)) / Math.max(stats?.totalApplications || 1, 1)) * 251.2} 251.2`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {Math.round((((stats?.approvedApplications || 0) + (stats?.rejectedApplications || 0)) / Math.max(stats?.totalApplications || 1, 1)) * 100)}%
                    </span>
                  </div>
                </div>
                <h5 className="font-semibold text-gray-800 dark:text-white">Processing Rate</h5>
                <p className="text-sm text-gray-500 dark:text-gray-400">Applications processed</p>
              </div>

              {/* Approval Rate */}
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#27ae60"
                      strokeWidth="8"
                      strokeDasharray={`${((stats?.approvedApplications || 0) / Math.max((stats?.approvedApplications || 0) + (stats?.rejectedApplications || 0), 1)) * 251.2} 251.2`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {Math.round(((stats?.approvedApplications || 0) / Math.max((stats?.approvedApplications || 0) + (stats?.rejectedApplications || 0), 1)) * 100)}%
                    </span>
                  </div>
                </div>
                <h5 className="font-semibold text-gray-800 dark:text-white">Approval Rate</h5>
                <p className="text-sm text-gray-500 dark:text-gray-400">Of processed applications</p>
              </div>

              {/* User Verification Rate */}
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#9b59b6"
                      strokeWidth="8"
                      strokeDasharray={`${((stats?.verifiedUsers || 0) / Math.max(stats?.totalUsers || 1, 1)) * 251.2} 251.2`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      {Math.round(((stats?.verifiedUsers || 0) / Math.max(stats?.totalUsers || 1, 1)) * 100)}%
                    </span>
                  </div>
                </div>
                <h5 className="font-semibold text-gray-800 dark:text-white">Verification Rate</h5>
                <p className="text-sm text-gray-500 dark:text-gray-400">Users verified</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
