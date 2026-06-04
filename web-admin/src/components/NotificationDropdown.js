'use client';

import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell,
  faFileText,
  faUsers,
  faExclamationCircle,
  faTimes,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import { adminAPI } from '@/services/api';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Load notification count
  const loadNotificationCount = async () => {
    try {
      const response = await adminAPI.getNotificationCount();
      setNotificationCount(response.data.count);
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  };

  // Load notifications
  const loadNotifications = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await adminAPI.getNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load notification count on mount and set up polling
  useEffect(() => {
    loadNotificationCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotificationCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Load notifications when dropdown opens
  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      loadNotifications();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application':
        return faFileText;
      case 'user':
        return faUsers;
      default:
        return faExclamationCircle;
    }
  };

  const getNotificationColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-orange-600 dark:text-orange-400';
      case 'low':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <FontAwesomeIcon 
          icon={faBell} 
          className="w-6 h-6 text-gray-600 dark:text-gray-300" 
        />
        
        {/* Notification Badge */}
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {notificationCount > 9 ? '9+' : notificationCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              // Loading skeleton
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              // Empty state
              <div className="p-8 text-center">
                <FontAwesomeIcon 
                  icon={faCheck} 
                  className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" 
                />
                <p className="text-gray-500 dark:text-gray-400 font-medium">All caught up!</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">No new notifications</p>
              </div>
            ) : (
              // Notification items
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      notification.priority === 'high' ? 'bg-red-100 dark:bg-red-900' :
                      notification.priority === 'medium' ? 'bg-orange-100 dark:bg-orange-900' :
                      'bg-blue-100 dark:bg-blue-900'
                    }`}>
                      <FontAwesomeIcon 
                        icon={getNotificationIcon(notification.type)} 
                        className={`w-5 h-5 ${getNotificationColor(notification.priority)}`}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {notification.title}
                        </h4>
                        {notification.count && (
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                            notification.priority === 'high' ? 'bg-red-500 text-white' :
                            notification.priority === 'medium' ? 'bg-orange-500 text-white' :
                            'bg-blue-500 text-white'
                          }`}>
                            {notification.count}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <button
                onClick={() => {
                  // Refresh notifications
                  loadNotifications();
                  loadNotificationCount();
                }}
                className="w-full text-sm text-primary dark:text-primary-light hover:text-primary-dark font-medium transition-colors"
              >
                Refresh Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}