'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser,
  faEnvelope,
  faShield,
  faCalendar,
  faEdit,
  faSave,
  faTimes,
  faKey,
  faEye,
  faEyeSlash,
  faUserShield,
  faCog,
  faHashtag,
  faCopy,
  faCheck,
  faQrcode,
  faDownload,
  faLock,
  faUnlock,
  faCamera,
  faImage
} from '@fortawesome/free-solid-svg-icons';
import AdminLayout from '@/components/AdminLayout';
import { adminAPI } from '@/services/api';
import { confirmDialog } from '@/components/ConfirmDialog';

export default function AdminProfilePage() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordHash, setPasswordHash] = useState('');
  const [fullHash, setFullHash] = useState('');
  const [hashLoading, setHashLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hashAuthCode, setHashAuthCode] = useState('');
  const [showHashInput, setShowHashInput] = useState(false);
  
  // 2FA states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState(null);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [disableToken, setDisableToken] = useState('');
  const [showDisablePassword, setShowDisablePassword] = useState(false);
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);
  
  const [editForm, setEditForm] = useState({
    fullName: '',
    profilePicture: '',
  });

  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Load user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setEditForm({
        fullName: parsedUser.fullName || '',
        profilePicture: parsedUser.profilePicture || '',
      });
      setProfilePicturePreview(parsedUser.profilePicture || null);
    }
    
    // Check 2FA status
    check2FAStatus();
  }, []);

  const check2FAStatus = async () => {
    try {
      const response = await adminAPI.get2FAStatus();
      setTwoFactorEnabled(response.data.enabled);
    } catch (error) {
      console.error('Failed to check 2FA status:', error);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form when canceling
      setEditForm({
        fullName: user?.fullName || '',
        profilePicture: user?.profilePicture || '',
      });
      setProfilePicturePreview(user?.profilePicture || null);
    }
    setIsEditing(!isEditing);
    setMessage({ type: '', text: '' });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select a valid image file.' });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 2MB.' });
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64String = reader.result;
      setEditForm({ ...editForm, profilePicture: base64String });
      setProfilePicturePreview(base64String);
      setUploadingImage(false);
      setMessage({ type: '', text: '' });
    };

    reader.onerror = () => {
      setMessage({ type: 'error', text: 'Failed to read image file.' });
      setUploadingImage(false);
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveProfilePicture = () => {
    setEditForm({ ...editForm, profilePicture: null });
    setProfilePicturePreview(null);
  };

  const handleSaveProfile = async () => {
    // Confirmation dialog
    const confirmed = await confirmDialog(
      'Are you sure you want to save these profile changes?'
    );
    if (!confirmed) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await adminAPI.updateProfile({
        fullName: editForm.fullName,
        profilePicture: editForm.profilePicture
      });
      
      // Update user data
      const updatedUser = response.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('userUpdated'));
      
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Simulate API call - In real app, this would update the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsChangingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateHash = async () => {
    if (!hashAuthCode || hashAuthCode.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter a valid 6-digit authentication code.' });
      return;
    }

    setHashLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await adminAPI.getPasswordHash(hashAuthCode);
      setPasswordHash(response.data.hash);
      setFullHash(response.data.fullHash);
      setHashAuthCode('');
      setShowHashInput(false);
      setMessage({ type: 'success', text: 'Password hash generated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to generate password hash. Please try again.' });
    } finally {
      setHashLoading(false);
    }
  };

  const handleCopyHash = async () => {
    try {
      await navigator.clipboard.writeText(fullHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to copy hash to clipboard.' });
    }
  };

  const handleSetup2FA = async () => {
    setTwoFactorLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await adminAPI.setup2FA();
      setTwoFactorSetup(response.data);
      setMessage({ type: 'success', text: '2FA setup initiated. Scan the QR code with Google Authenticator.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to setup 2FA. Please try again.' });
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationToken || verificationToken.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter a valid 6-digit code.' });
      return;
    }

    setTwoFactorLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await adminAPI.verify2FASetup(verificationToken);
      setTwoFactorEnabled(true);
      setMessage({ type: 'success', text: '2FA enabled successfully! Save your backup codes in a safe place.' });
      setVerificationToken('');
    } catch (error) {
      setMessage({ type: 'error', text: 'Invalid verification code. Please try again.' });
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!disablePassword || !disableToken) {
      setMessage({ type: 'error', text: 'Please provide both password and authentication code.' });
      return;
    }

    setTwoFactorLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await adminAPI.disable2FA(disablePassword, disableToken);
      setTwoFactorEnabled(false);
      setTwoFactorSetup(null);
      setIsDisabling2FA(false);
      setDisablePassword('');
      setDisableToken('');
      setMessage({ type: 'success', text: '2FA disabled successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to disable 2FA. Please check your credentials.' });
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleDownloadBackupCodes = () => {
    if (!twoFactorSetup?.backupCodes) return;

    const content = `CTU Admin Portal - Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\n\nBackup Codes (use these if you lose access to your authenticator):\n\n${twoFactorSetup.backupCodes.join('\n')}\n\nKeep these codes in a safe place. Each code can only be used once.`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ctu-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyBackupCodes = async () => {
    if (!twoFactorSetup?.backupCodes) return;

    try {
      await navigator.clipboard.writeText(twoFactorSetup.backupCodes.join('\n'));
      setMessage({ type: 'success', text: 'Backup codes copied to clipboard!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to copy backup codes.' });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Profile</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account settings and preferences</p>
          </div>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faUserShield} className="text-2xl text-primary" />
          </div>
        </div>

        {/* Success/Error Messages */}
        {message.text && (
          <div className={`p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information Card */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-primary-dark p-6">
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    {profilePicturePreview ? (
                      <img 
                        src={profilePicturePreview} 
                        alt="Profile" 
                        className="w-20 h-20 rounded-full object-cover border-4 border-white/20"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white/20">
                        {user.fullName?.charAt(0) || 'A'}
                      </div>
                    )}
                    {isEditing && (
                      <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                        <FontAwesomeIcon icon={faCamera} className="text-white text-xl" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>
                    )}
                  </div>
                  <div className="text-white flex-1">
                    <h3 className="text-2xl font-bold">{user.fullName || 'Administrator'}</h3>
                    <p className="text-primary-light">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <FontAwesomeIcon icon={faShield} className="text-sm" />
                      <span className="text-sm font-medium">Administrator</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Profile Information</h4>
                  <button
                    onClick={handleEditToggle}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isEditing
                        ? 'bg-gray-500 hover:bg-gray-600 text-white'
                        : 'bg-primary hover:bg-primary-dark text-white'
                    }`}
                  >
                    <FontAwesomeIcon icon={isEditing ? faTimes : faEdit} className="mr-2" />
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Profile Picture */}
                  {isEditing && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <FontAwesomeIcon icon={faImage} className="mr-2 text-primary" />
                        Profile Picture
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {profilePicturePreview ? (
                            <img 
                              src={profilePicturePreview} 
                              alt="Preview" 
                              className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                            />
                          ) : (
                            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-3xl font-bold">
                              {editForm.fullName?.charAt(0) || 'A'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <label className="block">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              disabled={uploadingImage}
                            />
                            <span className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer transition-colors disabled:opacity-50">
                              {uploadingImage ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <FontAwesomeIcon icon={faCamera} className="mr-2" />
                                  Upload Photo
                                </>
                              )}
                            </span>
                          </label>
                          {profilePicturePreview && (
                            <button
                              onClick={handleRemoveProfilePicture}
                              className="block px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            >
                              <FontAwesomeIcon icon={faTimes} className="mr-2" />
                              Remove Photo
                            </button>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            JPG, PNG or GIF. Max size 2MB.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FontAwesomeIcon icon={faUser} className="mr-2 text-primary" />
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                        {user.fullName || 'Not provided'}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-primary" />
                      Email Address
                    </label>
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                      {user.email || 'Not provided'}
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(Read-only)</span>
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FontAwesomeIcon icon={faShield} className="mr-2 text-primary" />
                      Role
                    </label>
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                        <FontAwesomeIcon icon={faUserShield} className="mr-2" />
                        Administrator
                      </span>
                    </div>
                  </div>

                  {/* Save Button */}
                  {isEditing && (
                    <div className="pt-4">
                      <button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Saving...
                          </div>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faSave} className="mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Account Information</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Account Created</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(user.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Login</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(user.lastLogin || new Date())}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faShield} className="text-primary" />
                Security
              </h4>
              
              {/* 2FA Section */}
              <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <FontAwesomeIcon icon={faLock} className="text-blue-600 dark:text-blue-400" />
                    Two-Factor Authentication
                  </h5>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    twoFactorEnabled 
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}>
                    {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                  Add an extra layer of security to your account using Google Authenticator
                </p>

                {!twoFactorEnabled && !twoFactorSetup && (
                  <button
                    onClick={handleSetup2FA}
                    disabled={twoFactorLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {twoFactorLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Setting up...
                      </div>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faQrcode} className="mr-2" />
                        Setup 2FA
                      </>
                    )}
                  </button>
                )}

                {!twoFactorEnabled && twoFactorSetup && (
                  <div className="space-y-4">
                    {/* QR Code */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                      <p className="text-sm font-medium text-gray-800 dark:text-white mb-3">
                        Step 1: Scan QR Code
                      </p>
                      <div className="flex justify-center mb-3">
                        <img 
                          src={twoFactorSetup.qrCode} 
                          alt="2FA QR Code" 
                          className="w-48 h-48 border-4 border-gray-200 dark:border-gray-600 rounded-lg"
                        />
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                        Scan this QR code with Google Authenticator app
                      </p>
                    </div>

                    {/* Manual Entry Key */}
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Or enter this key manually:
                      </p>
                      <code className="block text-xs font-mono text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 p-2 rounded break-all">
                        {twoFactorSetup.manualEntryKey}
                      </code>
                    </div>

                    {/* Verification */}
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white mb-2">
                        Step 2: Enter 6-digit code
                      </p>
                      <input
                        type="text"
                        value={verificationToken}
                        onChange={(e) => setVerificationToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    {/* Backup Codes */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
                        <FontAwesomeIcon icon={faKey} />
                        Backup Codes (Save These!)
                      </p>
                      <div className="grid grid-cols-2 gap-1 mb-2">
                        {twoFactorSetup.backupCodes.map((code, index) => (
                          <code key={index} className="text-xs font-mono text-yellow-900 dark:text-yellow-100 bg-yellow-100 dark:bg-yellow-900/40 px-2 py-1 rounded">
                            {code}
                          </code>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleDownloadBackupCodes}
                          className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-xs font-medium transition-colors"
                        >
                          <FontAwesomeIcon icon={faDownload} className="mr-1" />
                          Download
                        </button>
                        <button
                          onClick={handleCopyBackupCodes}
                          className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-xs font-medium transition-colors"
                        >
                          <FontAwesomeIcon icon={faCopy} className="mr-1" />
                          Copy
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleVerify2FA}
                        disabled={twoFactorLoading || verificationToken.length !== 6}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {twoFactorLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Verifying...
                          </div>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faCheck} className="mr-2" />
                            Enable 2FA
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setTwoFactorSetup(null);
                          setVerificationToken('');
                          setMessage({ type: '', text: '' });
                        }}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        <FontAwesomeIcon icon={faTimes} className="mr-2" />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {twoFactorEnabled && !isDisabling2FA && (
                  <div className="space-y-3">
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                        <FontAwesomeIcon icon={faCheck} className="text-green-600 dark:text-green-400" />
                        Your account is protected with 2FA
                      </p>
                    </div>
                    <button
                      onClick={() => setIsDisabling2FA(true)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                    >
                      <FontAwesomeIcon icon={faUnlock} className="mr-2" />
                      Disable 2FA
                    </button>
                  </div>
                )}

                {twoFactorEnabled && isDisabling2FA && (
                  <div className="space-y-4">
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        To disable 2FA, enter your password and current authentication code
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showDisablePassword ? 'text' : 'password'}
                          value={disablePassword}
                          onChange={(e) => setDisablePassword(e.target.value)}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowDisablePassword(!showDisablePassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                        >
                          <FontAwesomeIcon icon={showDisablePassword ? faEyeSlash : faEye} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Authentication Code
                      </label>
                      <input
                        type="text"
                        value={disableToken}
                        onChange={(e) => setDisableToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleDisable2FA}
                        disabled={twoFactorLoading || !disablePassword || disableToken.length !== 6}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {twoFactorLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Disabling...
                          </div>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faUnlock} className="mr-2" />
                            Confirm Disable
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setIsDisabling2FA(false);
                          setDisablePassword('');
                          setDisableToken('');
                          setMessage({ type: '', text: '' });
                        }}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        <FontAwesomeIcon icon={faTimes} className="mr-2" />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Password Hash Generator */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <h5 className="text-sm font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faHashtag} className="text-primary" />
                  Password Hash
                </h5>
                
                {!passwordHash && !showHashInput ? (
                  <button
                    onClick={() => setShowHashInput(true)}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    <FontAwesomeIcon icon={faHashtag} className="mr-2" />
                    Generate Hash
                  </button>
                ) : !passwordHash && showHashInput ? (
                  <div className="space-y-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-800 dark:text-blue-200 flex items-center gap-2">
                        <FontAwesomeIcon icon={faLock} />
                        Enter your authentication code for security verification
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Authentication Code
                      </label>
                      <input
                        type="text"
                        value={hashAuthCode}
                        onChange={(e) => setHashAuthCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        autoFocus
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Enter the 6-digit code from your Google Authenticator app
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleGenerateHash}
                        disabled={hashLoading || hashAuthCode.length !== 6}
                        className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {hashLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Generating...
                          </div>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faCheck} className="mr-2" />
                            Generate
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowHashInput(false);
                          setHashAuthCode('');
                          setMessage({ type: '', text: '' });
                        }}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                      >
                        <FontAwesomeIcon icon={faTimes} className="mr-2" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
                      <code className="flex-1 text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
                        {passwordHash}
                      </code>
                      <button
                        onClick={handleCopyHash}
                        className={`p-2 rounded-lg transition-colors ${
                          copied 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                        }`}
                        title={copied ? 'Copied!' : 'Copy full hash'}
                      >
                        <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setPasswordHash('');
                          setFullHash('');
                          setShowHashInput(true);
                        }}
                        disabled={hashLoading}
                        className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        <FontAwesomeIcon icon={faHashtag} className="mr-2" />
                        Regenerate
                      </button>
                      <button
                        onClick={() => {
                          setPasswordHash('');
                          setFullHash('');
                          setHashAuthCode('');
                          setShowHashInput(false);
                        }}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        <FontAwesomeIcon icon={faTimes} className="mr-2" />
                        Clear
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Hash is masked for security. Click copy to get the full hash.
                    </p>
                  </div>
                )}
              </div>
              
              {!isChangingPassword ? (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  <FontAwesomeIcon icon={faKey} className="mr-2" />
                  Change Password
                </button>
              ) : (
                <div className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        <FontAwesomeIcon icon={showCurrentPassword ? faEyeSlash : faEye} />
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handlePasswordChange}
                      disabled={loading}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </div>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faSave} className="mr-2" />
                          Save
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        setMessage({ type: '', text: '' });
                      }}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      <FontAwesomeIcon icon={faTimes} className="mr-2" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Settings</h4>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/settings'}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                >
                  <FontAwesomeIcon icon={faCog} className="text-primary" />
                  <span className="text-gray-700 dark:text-gray-300">Application Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}