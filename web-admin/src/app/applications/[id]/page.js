'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileAlt, 
  faSearch, 
  faClipboardCheck, 
  faComments, 
  faCheckCircle, 
  faIdCard,
  faArrowLeft,
  faCheck,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import AdminLayout from '@/components/AdminLayout';
import { adminAPI } from '@/services/api';
import { formatDate, getStatusColor } from '@/utils/formatters';
import { showToast } from '@/utils/toast';
import { confirmDialog } from '@/components/ConfirmDialog';

export default function ApplicationDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingStage, setEditingStage] = useState(null);
  const [stageData, setStageData] = useState({ status: 'pending', details: [] });

  useEffect(() => {
    if (params.id) loadApplication();
  }, [params.id]);

  const loadApplication = async () => {
    try {
      const response = await adminAPI.getApplication(params.id);
      setApplication(response.data);
    } catch (error) {
      console.error('Error loading application:', error);
      showToast.error('Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStage = async (stageName) => {
    try {
      await adminAPI.updateStage(params.id, stageName, stageData);
      showToast.success('Stage updated successfully');
      setEditingStage(null);
      loadApplication();
    } catch (error) {
      showToast.error('Failed to update stage');
    }
  };

  const handleUpdateStatus = async (status) => {
    const confirmed = await confirmDialog(`Are you sure you want to ${status} this application?`);
    if (!confirmed) return;

    try {
      await adminAPI.updateApplication(params.id, { status });
      showToast.success(`Application ${status} successfully`);
      loadApplication();
    } catch (error) {
      showToast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse">
          {/* Back Button Skeleton */}
          <div className="mb-4 h-6 bg-gray-200 rounded w-40"></div>

          {/* Header Card Skeleton */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex gap-6 mb-6">
              <div className="w-32 h-32 bg-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-56"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded-full w-24"></div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex gap-3 mb-6">
              <div className="h-10 bg-gray-200 rounded w-28"></div>
              <div className="h-10 bg-gray-200 rounded w-28"></div>
            </div>

            {/* Sections Skeleton */}
            <div className="space-y-6">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!application) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">Application not found</p>
          <button
            onClick={() => router.push('/applications')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Back to Applications
          </button>
        </div>
      </AdminLayout>
    );
  }

  const stages = [
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
      name: 'Entrance Exam', 
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
        <button
          onClick={() => router.push('/applications')}
          className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Applications
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Header with Photo */}
          <div className="flex gap-6 mb-6 pb-6 border-b">
            {/* Profile Photo - Show uploaded 2x2 if available */}
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-blue-300 overflow-hidden">
              {application.documents?.idPhoto?.base64 ? (
                <img 
                  src={`data:image/jpeg;base64,${application.documents.idPhoto.base64}`}
                  alt="2x2 ID Photo" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.querySelector('.fallback-initials').style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`fallback-initials text-center w-full h-full flex flex-col items-center justify-center ${application.documents?.idPhoto?.base64 ? 'hidden' : ''}`}>
                <div className="text-4xl font-bold text-blue-600">
                  {application.personalInfo?.firstName?.charAt(0)}{application.personalInfo?.lastName?.charAt(0)}
                </div>
                <div className="text-xs text-blue-500 mt-1">
                  {application.documents?.idPhoto ? 'Photo Uploaded' : 'No Photo'}
                </div>
              </div>
            </div>

            {/* Header Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {application.personalInfo?.firstName} {application.personalInfo?.middleName} {application.personalInfo?.lastName} {application.personalInfo?.suffix}
              </h2>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Tracking Code:</span> {application.trackingCode}</p>
                <p><span className="font-medium">Submitted:</span> {application.submittedAt ? new Date(application.submittedAt).toLocaleString('en-US', { 
                  month: '2-digit', 
                  day: '2-digit', 
                  year: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                }) : 'N/A'}</p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex flex-col items-end gap-2">
              <span className={`px-4 py-1.5 text-sm font-semibold rounded-full ${getStatusColor(application.status)}`}>
                {application.status}
              </span>
            </div>
          </div>

          {/* Program Application Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faFileAlt} className="text-indigo-600 text-lg" />
              <h3 className="text-lg font-bold text-gray-900">Program Application</h3>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Category</div>
                  <div className="font-medium text-gray-900">{application.programData?.category || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">College</div>
                  <div className="font-medium text-gray-900">{application.programData?.college || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Session</div>
                  <div className="font-medium text-gray-900">{application.programData?.session || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">GWA (General Weighted Average)</div>
                  <div className="font-medium text-gray-900">{application.programData?.gwa || 'N/A'}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-gray-500 mb-0.5">Preferred Course</div>
                  <div className="font-bold text-indigo-600 text-lg">{application.preferredCourse || 'N/A'}</div>
                  {application.programData?.courseName && (
                    <div className="text-sm text-gray-600 mt-0.5">{application.programData.courseName}</div>
                  )}
                </div>
                {application.aiRecommendedCourse && (
                  <div className="col-span-2 pt-2 border-t border-indigo-200">
                    <div className="text-xs text-gray-500 mb-0.5">AI Recommended Course</div>
                    <div className="font-medium text-indigo-600">{application.aiRecommendedCourse}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faIdCard} className="text-blue-600 text-lg" />
              <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Full Name</div>
                <div className="font-medium text-gray-900">
                  {application.personalInfo?.firstName} {application.personalInfo?.middleName} {application.personalInfo?.lastName} {application.personalInfo?.suffix}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Email Address</div>
                <div className="font-medium text-gray-900">{application.personalInfo?.email || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Contact Number</div>
                <div className="font-medium text-gray-900">{application.personalInfo?.contactNumber || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Birth Date</div>
                <div className="font-medium text-gray-900">{application.personalInfo?.birthDate || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Birth Place</div>
                <div className="font-medium text-gray-900">{application.personalInfo?.birthPlace || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Gender</div>
                <div className="font-medium text-gray-900">{application.personalInfo?.gender || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Civil Status</div>
                <div className="font-medium text-gray-900">{application.personalInfo?.civilStatus || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Nationality</div>
                <div className="font-medium text-gray-900">{application.personalInfo?.nationality || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Religion</div>
                <div className="font-medium text-gray-900">{application.personalInfo?.religion || 'N/A'}</div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-gray-500 mb-0.5">Complete Address</div>
                <div className="font-medium text-gray-900">
                  {application.personalInfo?.address ? 
                    `${application.personalInfo.address.street || ''}, ${application.personalInfo.address.barangay || ''}, ${application.personalInfo.address.municipality || ''}, ${application.personalInfo.address.province || ''} ${application.personalInfo.address.zipCode || ''}`.replace(/^,\s*|,\s*,/g, ',').replace(/^,\s*/, '').trim()
                    : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Requirements Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faFileAlt} className="text-green-600 text-lg" />
              <h3 className="text-lg font-bold text-gray-900">Uploaded Requirements</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'birthCertificate', name: 'Birth Certificate (PSA)', required: true },
                { id: 'form137', name: 'Form 137 / Report Card', required: true },
                { id: 'goodMoral', name: 'Certificate of Good Moral', required: true },
                { id: 'transferCredentials', name: 'Transfer Credentials', required: false }
              ].map((doc) => {
                const uploaded = application.documents?.[doc.id];
                
                return (
                  <div key={doc.id} className={`border-2 rounded-lg p-4 ${
                    uploaded ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        uploaded ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <FontAwesomeIcon 
                          icon={uploaded ? faCheckCircle : faFileAlt} 
                          className={`text-xl ${uploaded ? 'text-green-600' : 'text-gray-400'}`} 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`font-semibold ${uploaded ? 'text-green-900' : 'text-gray-700'}`}>
                            {doc.name}
                          </div>
                          {doc.required && (
                            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
                              Required
                            </span>
                          )}
                          {uploaded && (
                            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                              Uploaded
                            </span>
                          )}
                        </div>
                        {uploaded && (
                          <div className="text-sm text-green-700 truncate">
                            {uploaded.name || 'Document uploaded'}
                          </div>
                        )}
                        {uploaded && uploaded.size && (
                          <div className="text-xs text-green-600 mt-1">
                            Size: {(uploaded.size / 1024).toFixed(2)} KB
                          </div>
                        )}
                        {!uploaded && (
                          <div className="text-sm text-gray-500">
                            Not uploaded
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Document Preview */}
                    {uploaded && (
                      <div className="mt-3 rounded-lg overflow-hidden border-2 border-white">
                        {uploaded.base64 && uploaded.type?.includes('image') ? (
                          <img 
                            src={`data:image/jpeg;base64,${uploaded.base64}`}
                            alt={doc.name}
                            className="w-full h-48 object-cover bg-white"
                          />
                        ) : uploaded.type?.includes('pdf') ? (
                          <div className="w-full h-48 bg-white flex flex-col items-center justify-center">
                            <FontAwesomeIcon icon={faFileAlt} className="text-green-600 text-4xl mb-2" />
                            <div className="text-sm text-green-700 font-medium">PDF Document</div>
                          </div>
                        ) : (
                          <div className="w-full h-48 bg-gray-100 flex flex-col items-center justify-center">
                            <FontAwesomeIcon icon={faFileAlt} className="text-gray-400 text-4xl mb-2" />
                            <div className="text-sm text-gray-600 font-medium">Preview Not Available</div>
                            <div className="text-xs text-gray-500 mt-1">File uploaded on mobile device</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Documents Acknowledgment Status */}
            <div className={`mt-4 border-2 rounded-lg p-4 ${
              application.documentsAcknowledged ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  application.documentsAcknowledged ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <FontAwesomeIcon 
                    icon={application.documentsAcknowledged ? faCheckCircle : faTimes} 
                    className={`text-xl ${application.documentsAcknowledged ? 'text-green-600' : 'text-gray-400'}`} 
                  />
                </div>
                <div className="flex-1">
                  <div className={`font-semibold mb-1 ${
                    application.documentsAcknowledged ? 'text-green-900' : 'text-gray-700'
                  }`}>
                    {application.documentsAcknowledged ? 'Documents Acknowledged' : 'Documents Not Acknowledged'}
                  </div>
                  <div className={`text-sm ${
                    application.documentsAcknowledged ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    {application.documentsAcknowledged 
                      ? 'Student has acknowledged the document requirements and will submit them to the registrar\'s office.'
                      : 'Student has not yet acknowledged the document requirements.'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Remarks */}
          {application.remarks && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={faComments} className="text-yellow-600 text-lg" />
                <h3 className="text-lg font-bold text-gray-900">Admin Remarks</h3>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">{application.remarks}</p>
              </div>
            </div>
          )}
        </div>

        {/* Stages */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Admission Process Stages</h3>
          <div className="space-y-4">
            {stages.map((stage) => {
              const stageStatus = application.stages?.[stage.key] || 'pending';
              const stageDetails = application[`${stage.key}Details`] || [];

              return (
                <div key={stage.key} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${stage.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <FontAwesomeIcon icon={stage.icon} className={`${stage.color} text-lg`} />
                      </div>
                      <span className="font-medium">{stage.name}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        stageStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {stageStatus}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setEditingStage(stage.key);
                        setStageData({ status: stageStatus, details: stageDetails });
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                  </div>

                  {stageDetails.length > 0 && (
                    <div className="mt-2 pl-14">
                      {stageDetails.map((detail, idx) => (
                        <p key={idx} className="text-sm text-gray-600">• {detail}</p>
                      ))}
                    </div>
                  )}

                  {/* Edit Modal */}
                  {editingStage === stage.key && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h4 className="text-lg font-semibold mb-4">Edit {stage.name}</h4>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-2">Status</label>
                          <select
                            value={stageData.status}
                            onChange={(e) => setStageData({ ...stageData, status: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                          >
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-2">Details (one per line)</label>
                          <textarea
                            value={stageData.details.join('\n')}
                            onChange={(e) => setStageData({ ...stageData, details: e.target.value.split('\n').filter(d => d.trim()) })}
                            className="w-full border rounded px-3 py-2"
                            rows="4"
                            placeholder="Enter details..."
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleUpdateStage(stage.key)}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingStage(null)}
                            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
