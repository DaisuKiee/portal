'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileAlt, 
  faSearch, 
  faClipboardCheck, 
  faComments, 
  faCheckCircle, 
  faIdCard,
  faSave,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import AdminLayout from '@/components/AdminLayout';
import { adminAPI } from '@/services/api';
import { showToast } from '@/utils/toast';

export default function SettingsPage() {
  const [stages, setStages] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadStages();
  }, []);

  const loadStages = async () => {
    try {
      const response = await adminAPI.getTrackingStages();
      setStages(response.data || {});
    } catch (error) {
      console.error('Error loading stages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminAPI.updateTrackingStages(stages);
      showToast.success('Settings saved successfully');
    } catch (error) {
      showToast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const stagesList = [
    { 
      key: 'application', 
      name: 'Application', 
      icon: faFileAlt,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      key: 'screening', 
      name: 'Screening', 
      icon: faSearch,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    },
    { 
      key: 'exam', 
      name: 'Entrance Examination', 
      icon: faClipboardCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    { 
      key: 'interview', 
      name: 'Interview', 
      icon: faComments,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    { 
      key: 'enrollment', 
      name: 'Enrollment Selection', 
      icon: faCheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      key: 'idIssuance', 
      name: 'ID & Email Issuance', 
      icon: faIdCard,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
  ];

  return (
    <AdminLayout>
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Settings</h2>

        {/* Tracking Stages Configuration */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Tracking Stages Configuration</h3>
          <p className="text-gray-600 mb-6">
            Configure the admission process stages that will be displayed to applicants.
          </p>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-4">
              {stagesList.map((stage) => (
                <div key={stage.key} className="border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all duration-200 bg-gradient-to-r from-white to-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${stage.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <FontAwesomeIcon icon={stage.icon} className={`${stage.color} text-xl`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 text-lg">{stage.name}</h4>
                        <p className="text-sm text-gray-500">Stage: <span className="font-mono text-xs">{stage.key}</span></p>
                      </div>
                    </div>
                    
                    {/* Modern Toggle Switch */}
                    <label className="relative inline-flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={stages[stage.key]?.enabled !== false}
                        onChange={(e) => setStages({
                          ...stages,
                          [stage.key]: { ...stages[stage.key], enabled: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary peer-checked:to-primary-dark shadow-inner"></div>
                      <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">
                        {stages[stage.key]?.enabled !== false ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FontAwesomeIcon icon={faInfoCircle} className="text-gray-400 text-xs" />
                      Description
                    </label>
                    <input
                      type="text"
                      value={stages[stage.key]?.description || ''}
                      onChange={(e) => setStages({
                        ...stages,
                        [stage.key]: { ...stages[stage.key], description: e.target.value }
                      })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-white"
                      placeholder={`Description for ${stage.name}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-2.5 rounded-lg hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-medium"
            >
              <FontAwesomeIcon icon={faSave} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

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
