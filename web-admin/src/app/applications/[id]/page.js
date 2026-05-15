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
  const [stageFormData, setStageFormData] = useState({});

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
      // Merge form data into details
      const detailsArray = [];
      
      // Add form data as structured details
      Object.entries(stageFormData).forEach(([key, value]) => {
        if (value) {
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          detailsArray.push(`${label}: ${value}`);
        }
      });
      
      // Add any additional text details
      if (stageData.details && stageData.details.length > 0) {
        detailsArray.push(...stageData.details);
      }

      const updateData = {
        status: stageData.status,
        details: detailsArray,
        formData: stageFormData // Store structured data separately
      };

      await adminAPI.updateStage(params.id, stageName, updateData);
      showToast.success('Stage updated successfully');
      setEditingStage(null);
      setStageFormData({});
      loadApplication();
    } catch (error) {
      showToast.error('Failed to update stage');
    }
  };

  // Render stage-specific form fields
  const renderStageForm = (stageKey) => {
    switch (stageKey) {
      case 'application':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Application Review Status</label>
              <select
                value={stageFormData.reviewStatus || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, reviewStatus: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select status</option>
                <option value="Under Review">Under Review</option>
                <option value="Documents Verified">Documents Verified</option>
                <option value="Approved for Next Stage">Approved for Next Stage</option>
                <option value="Needs Clarification">Needs Clarification</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Reviewed By</label>
              <input
                type="text"
                value={stageFormData.reviewedBy || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, reviewedBy: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Admin name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Review Date</label>
              <input
                type="date"
                value={stageFormData.reviewDate || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, reviewDate: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'screening':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Screening Result</label>
              <select
                value={stageFormData.screeningResult || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, screeningResult: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select result</option>
                <option value="Passed">Passed</option>
                <option value="Failed">Failed</option>
                <option value="Conditional Pass">Conditional Pass</option>
                <option value="Pending Review">Pending Review</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">GWA Verification</label>
              <input
                type="text"
                value={stageFormData.gwaVerification || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, gwaVerification: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 90.5% - Verified"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Documents Status</label>
              <select
                value={stageFormData.documentsStatus || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, documentsStatus: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select status</option>
                <option value="All Complete">All Complete</option>
                <option value="Missing Documents">Missing Documents</option>
                <option value="Under Verification">Under Verification</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Screened By</label>
              <input
                type="text"
                value={stageFormData.screenedBy || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, screenedBy: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Staff name"
              />
            </div>
          </div>
        );

      case 'exam':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Exam Schedule</label>
              <input
                type="datetime-local"
                value={stageFormData.examSchedule || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, examSchedule: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Exam Venue</label>
              <input
                type="text"
                value={stageFormData.examVenue || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, examVenue: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Room 301, Main Building"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Exam Score</label>
              <input
                type="text"
                value={stageFormData.examScore || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, examScore: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 85/100 or 85%"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Exam Result</label>
              <select
                value={stageFormData.examResult || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, examResult: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select result</option>
                <option value="Passed">Passed</option>
                <option value="Failed">Failed</option>
                <option value="For Re-examination">For Re-examination</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Proctor Name</label>
              <input
                type="text"
                value={stageFormData.proctorName || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, proctorName: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Exam proctor"
              />
            </div>
          </div>
        );

      case 'interview':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Interview Schedule</label>
              <input
                type="datetime-local"
                value={stageFormData.interviewSchedule || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, interviewSchedule: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Interview Mode</label>
              <select
                value={stageFormData.interviewMode || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, interviewMode: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select mode</option>
                <option value="In-Person">In-Person</option>
                <option value="Online (Zoom)">Online (Zoom)</option>
                <option value="Online (Google Meet)">Online (Google Meet)</option>
                <option value="Phone">Phone</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Interview Location/Link</label>
              <input
                type="text"
                value={stageFormData.interviewLocation || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, interviewLocation: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Room number or meeting link"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Interviewer(s)</label>
              <input
                type="text"
                value={stageFormData.interviewers || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, interviewers: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Dr. Smith, Prof. Johnson"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Interview Rating</label>
              <select
                value={stageFormData.interviewRating || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, interviewRating: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select rating</option>
                <option value="Excellent">Excellent</option>
                <option value="Very Good">Very Good</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Interview Result</label>
              <select
                value={stageFormData.interviewResult || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, interviewResult: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select result</option>
                <option value="Passed">Passed</option>
                <option value="Failed">Failed</option>
                <option value="Pending Decision">Pending Decision</option>
              </select>
            </div>
          </div>
        );

      case 'enrollment':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Enrollment Status</label>
              <select
                value={stageFormData.enrollmentStatus || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, enrollmentStatus: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select status</option>
                <option value="Accepted">Accepted</option>
                <option value="Waitlisted">Waitlisted</option>
                <option value="Rejected">Rejected</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Assigned Course</label>
              <input
                type="text"
                value={stageFormData.assignedCourse || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, assignedCourse: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Final course assignment"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Year</label>
              <input
                type="text"
                value={stageFormData.academicYear || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, academicYear: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2024-2025"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Semester</label>
              <select
                value={stageFormData.semester || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, semester: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select semester</option>
                <option value="1st Semester">1st Semester</option>
                <option value="2nd Semester">2nd Semester</option>
                <option value="Summer">Summer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Enrollment Deadline</label>
              <input
                type="date"
                value={stageFormData.enrollmentDeadline || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, enrollmentDeadline: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Scholarship Offered</label>
              <select
                value={stageFormData.scholarshipOffered || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, scholarshipOffered: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select option</option>
                <option value="Full Scholarship">Full Scholarship</option>
                <option value="Partial Scholarship">Partial Scholarship</option>
                <option value="No Scholarship">No Scholarship</option>
              </select>
            </div>
          </div>
        );

      case 'idIssuance':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Student ID Number</label>
              <input
                type="text"
                value={stageFormData.studentIdNumber || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, studentIdNumber: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2024-12345"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">University Email</label>
              <input
                type="email"
                value={stageFormData.universityEmail || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, universityEmail: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., student@ctu.edu.ph"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ID Card Status</label>
              <select
                value={stageFormData.idCardStatus || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, idCardStatus: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select status</option>
                <option value="Printed">Printed</option>
                <option value="Ready for Pickup">Ready for Pickup</option>
                <option value="Released">Released</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ID Release Date</label>
              <input
                type="date"
                value={stageFormData.idReleaseDate || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, idReleaseDate: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Portal Access</label>
              <select
                value={stageFormData.portalAccess || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, portalAccess: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select status</option>
                <option value="Activated">Activated</option>
                <option value="Pending Activation">Pending Activation</option>
                <option value="Credentials Sent">Credentials Sent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Issued By</label>
              <input
                type="text"
                value={stageFormData.issuedBy || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, issuedBy: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Staff name"
              />
            </div>
          </div>
        );

      default:
        return null;
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

        {/* Admission Process Stages - Enhanced Timeline */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Admission Process Stages</h3>
              <p className="text-sm text-gray-600 mt-1">Track the applicant's progress through each stage</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {stages.filter(s => (application.stages?.[s.key] || 'pending') === 'completed').length}/{stages.length}
              </div>
              <div className="text-xs text-gray-500">Stages Completed</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm font-semibold text-blue-600">
                {Math.round((stages.filter(s => (application.stages?.[s.key] || 'pending') === 'completed').length / stages.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${(stages.filter(s => (application.stages?.[s.key] || 'pending') === 'completed').length / stages.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Timeline View */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-[29px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200"></div>

            <div className="space-y-6">
              {stages.map((stage, index) => {
                const stageStatus = application.stages?.[stage.key] || 'pending';
                const stageDetails = application[`${stage.key}Details`] || [];
                const isCompleted = stageStatus === 'completed';
                const isInProgress = stageStatus === 'in-progress';
                const isPending = stageStatus === 'pending';

                return (
                  <div key={stage.key} className="relative">
                    {/* Timeline Node */}
                    <div className={`absolute left-0 w-[60px] h-[60px] rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-200' 
                        : isInProgress
                        ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-200 animate-pulse'
                        : 'bg-white border-4 border-gray-300'
                    }`}>
                      <FontAwesomeIcon 
                        icon={isCompleted ? faCheckCircle : stage.icon} 
                        className={`text-2xl ${
                          isCompleted 
                            ? 'text-white' 
                            : isInProgress
                            ? 'text-white'
                            : stage.color
                        }`} 
                      />
                    </div>

                    {/* Stage Content Card */}
                    <div className={`ml-20 border-2 rounded-xl p-5 transition-all duration-300 ${
                      isCompleted 
                        ? 'border-green-300 bg-gradient-to-br from-green-50 to-white shadow-md hover:shadow-lg' 
                        : isInProgress
                        ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-white shadow-md hover:shadow-lg'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className={`text-lg font-bold ${
                              isCompleted ? 'text-green-900' : isInProgress ? 'text-blue-900' : 'text-gray-700'
                            }`}>
                              {index + 1}. {stage.name}
                            </h4>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              isCompleted 
                                ? 'bg-green-100 text-green-800' 
                                : isInProgress
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {isCompleted ? '✓ Completed' : isInProgress ? '⟳ In Progress' : '○ Pending'}
                            </span>
                          </div>
                          
                          {/* Stage Details */}
                          {stageDetails.length > 0 && (
                            <div className="space-y-2 mt-3">
                              {stageDetails.map((detail, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                                    isCompleted ? 'bg-green-500' : isInProgress ? 'bg-blue-500' : 'bg-gray-400'
                                  }`}></div>
                                  <p className={`text-sm ${
                                    isCompleted ? 'text-green-800' : isInProgress ? 'text-blue-800' : 'text-gray-600'
                                  }`}>
                                    {detail}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}

                          {stageDetails.length === 0 && (
                            <p className="text-sm text-gray-500 italic">No details added yet</p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => {
                              setEditingStage(stage.key);
                              setStageData({ status: stageStatus, details: stageDetails });
                              // Load existing form data if available
                              const existingFormData = application[`${stage.key}FormData`] || {};
                              setStageFormData(existingFormData);
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              isCompleted
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : isInProgress
                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Edit Stage
                          </button>
                          
                          {!isCompleted && (
                            <button
                              onClick={() => {
                                setEditingStage(stage.key);
                                setStageData({ status: 'completed', details: stageDetails });
                                const existingFormData = application[`${stage.key}FormData`] || {};
                                setStageFormData(existingFormData);
                                handleUpdateStage(stage.key);
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                            >
                              Mark Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Edit Modal */}
                    {editingStage === stage.key && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                          <div className="flex items-center gap-3 mb-6">
                            <div className={`w-12 h-12 ${stage.bgColor} rounded-xl flex items-center justify-center`}>
                              <FontAwesomeIcon icon={stage.icon} className={`${stage.color} text-xl`} />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-gray-900">Edit {stage.name}</h4>
                              <p className="text-sm text-gray-600">Update stage status and collect relevant data</p>
                            </div>
                          </div>
                          
                          <div className="mb-5">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Stage Status</label>
                            <select
                              value={stageData.status}
                              onChange={(e) => setStageData({ ...stageData, status: e.target.value })}
                              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="pending">○ Pending</option>
                              <option value="in-progress">⟳ In Progress</option>
                              <option value="completed">✓ Completed</option>
                            </select>
                          </div>

                          {/* Stage-Specific Form Fields */}
                          <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                            <h5 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Stage-Specific Information
                            </h5>
                            {renderStageForm(stage.key)}
                          </div>

                          <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Additional Notes
                              <span className="text-gray-500 font-normal ml-2">(optional)</span>
                            </label>
                            <textarea
                              value={stageData.details.join('\n')}
                              onChange={(e) => setStageData({ ...stageData, details: e.target.value.split('\n').filter(d => d.trim()) })}
                              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              rows="4"
                              placeholder="Add any additional notes or comments..."
                            />
                            <p className="text-xs text-gray-500 mt-2">
                              Add extra information not covered by the form fields above
                            </p>
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={() => handleUpdateStage(stage.key)}
                              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                            >
                              Save Changes
                            </button>
                            <button
                              onClick={() => {
                                setEditingStage(null);
                                setStageFormData({});
                              }}
                              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
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
      </div>
    </AdminLayout>
  );
}
