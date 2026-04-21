'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import AdminLayout from '@/components/AdminLayout';

export default function SettingsPage() {
  return (
    <AdminLayout>
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Settings</h2>

        {/* System Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600 text-lg" />
            </div>
            <h3 className="text-xl font-semibold">System Information</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Version:</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Environment:</span>
              <span className="font-medium">Production</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">API URL:</span>
              <span className="font-medium text-primary">{process.env.NEXT_PUBLIC_API_URL}</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
