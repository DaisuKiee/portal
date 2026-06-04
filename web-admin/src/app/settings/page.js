'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faInfoCircle,
  faPalette,
  faSun,
  faMoon,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import AdminLayout from '@/components/AdminLayout';
import { useTheme } from '@/contexts/ThemeContext';

export default function SettingsPage() {
  const { theme, setThemeMode } = useTheme();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Settings</h2>

        {/* Theme Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faPalette} className="text-purple-600 dark:text-purple-400 text-lg" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Appearance</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Customize your interface theme</p>
            </div>
          </div>

          {/* Theme Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Light Mode Card */}
            <button
              onClick={() => setThemeMode('light')}
              className={`relative group p-6 rounded-xl border-2 transition-all duration-300 ${
                theme === 'light'
                  ? 'border-primary bg-primary/5 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:shadow-md'
              }`}
            >
              {/* Selected Checkmark */}
              {theme === 'light' && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />
                </div>
              )}

              {/* Icon */}
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <FontAwesomeIcon icon={faSun} className="text-yellow-500 text-2xl" />
              </div>

              {/* Title */}
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Light Mode</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Bright and clean interface for daytime use
              </p>

              {/* Preview */}
              <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200 space-y-2">
                <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                <div className="h-2 bg-gray-100 rounded w-2/3"></div>
              </div>
            </button>

            {/* Dark Mode Card */}
            <button
              onClick={() => setThemeMode('dark')}
              className={`relative group p-6 rounded-xl border-2 transition-all duration-300 ${
                theme === 'dark'
                  ? 'border-primary bg-primary/5 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:shadow-md'
              }`}
            >
              {/* Selected Checkmark */}
              {theme === 'dark' && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />
                </div>
              )}

              {/* Icon */}
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <FontAwesomeIcon icon={faMoon} className="text-indigo-300 text-2xl" />
              </div>

              {/* Title */}
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Dark Mode</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Easy on the eyes for low-light environments
              </p>

              {/* Preview */}
              <div className="mt-4 p-3 bg-gray-900 rounded-lg border border-gray-700 space-y-2">
                <div className="h-2 bg-gray-700 rounded w-3/4"></div>
                <div className="h-2 bg-gray-800 rounded w-1/2"></div>
                <div className="h-2 bg-gray-800 rounded w-2/3"></div>
              </div>
            </button>
          </div>

          {/* Current Theme Info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <FontAwesomeIcon 
                  icon={theme === 'light' ? faSun : faMoon} 
                  className="text-blue-600 dark:text-blue-400 text-sm" 
                />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Current Theme: <span className="font-bold capitalize">{theme} Mode</span>
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Your preference is saved automatically
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600 dark:text-blue-400 text-lg" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">System Information</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Application details and configuration</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Version:</span>
              <span className="font-medium text-gray-800 dark:text-white">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Environment:</span>
              <span className="font-medium text-gray-800 dark:text-white">Production</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600 dark:text-gray-400">API URL:</span>
              <span className="font-medium text-primary dark:text-primary-light">{process.env.NEXT_PUBLIC_API_URL}</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
