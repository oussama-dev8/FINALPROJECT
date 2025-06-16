import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/shared/context/AuthContext';
import { FiCheck, FiX, FiAlertTriangle } from 'react-icons/fi';

// Password requirement checker component
const PasswordRequirement = ({ label, met }) => (
  <div className="flex items-center space-x-2">
    {met ? (
      <FiCheck className="text-green-400 flex-shrink-0" />
    ) : (
      <FiX className="text-red-400 flex-shrink-0" />
    )}
    <span className={`text-sm ${met ? 'text-green-400' : 'text-gray-400'}`}>{label}</span>
  </div>
);

function Settings() {
  const { changePassword, deleteAccount } = useAuth();
  
  // State for toggles
  const [toggles, setToggles] = useState({
    'email-notifications': true,
    'two-factor': false
  });

  // State for selects
  const [selects, setSelects] = useState({
    'language': 'English',
    'difficulty': 'Intermediate',
    'profile-visibility': 'Public'
  });

  // State for password change form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // State for delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Password requirements state
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    match: false
  });
  
  // Check password requirements whenever password changes
  useEffect(() => {
    if (passwordData.newPassword) {
      setPasswordRequirements({
        length: passwordData.newPassword.length >= 8,
        uppercase: /[A-Z]/.test(passwordData.newPassword),
        lowercase: /[a-z]/.test(passwordData.newPassword),
        number: /[0-9]/.test(passwordData.newPassword),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordData.newPassword),
        match: passwordData.newPassword === passwordData.confirmPassword && 
               passwordData.confirmPassword !== ''
      });
    } else {
      setPasswordRequirements({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
        match: false
      });
    }
  }, [passwordData.newPassword, passwordData.confirmPassword]);

  // Toggle handler
  const handleToggle = (id) => {
    setToggles(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Select handler
  const handleSelectChange = (id, value) => {
    setSelects(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Password form handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear messages when user starts typing
    if (passwordMessage) setPasswordMessage('');
    if (passwordError) setPasswordError('');
  };

  const validatePasswordForm = () => {
    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required');
      return false;
    }
    
    if (!passwordData.newPassword) {
      setPasswordError('New password is required');
      return false;
    }
    
    // Password length check
    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return false;
    }
    
    // Check for uppercase letters
    if (!/[A-Z]/.test(passwordData.newPassword)) {
      setPasswordError('Password must contain at least one uppercase letter');
      return false;
    }
    
    // Check for lowercase letters
    if (!/[a-z]/.test(passwordData.newPassword)) {
      setPasswordError('Password must contain at least one lowercase letter');
      return false;
    }
    
    // Check for numbers
    if (!/[0-9]/.test(passwordData.newPassword)) {
      setPasswordError('Password must contain at least one number');
      return false;
    }
    
    // Check for special characters
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordData.newPassword)) {
      setPasswordError('Password must contain at least one special character');
      return false;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return false;
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError('New password must be different from current password');
      return false;
    }
    
    return true;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordMessage('');
    
    try {
      await changePassword({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });
      
      setPasswordMessage('Password updated successfully!');
      
      // Clear the form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error) {
      console.error('Password change error:', error);
      setPasswordError(error.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle delete account
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    
    if (!deletePassword) {
      setDeleteError('Please enter your password to confirm');
      return;
    }
    
    setDeleteLoading(true);
    setDeleteError('');
    
    try {
      await deleteAccount(deletePassword);
      // No need to handle success as the user will be redirected to login page
    } catch (error) {
      console.error('Delete account error:', error);
      setDeleteError(error.message || 'Failed to delete account');
      setDeleteLoading(false);
    }
  };

  const sections = [
    {
      title: 'Account Settings',
      settings: [
        {
          id: 'email-notifications',
          title: 'Email Notifications',
          description: 'Receive email notifications about your course progress and updates',
          type: 'toggle',
          value: toggles['email-notifications']
        },
        {
          id: 'two-factor',
          title: 'Two-Factor Authentication',
          description: 'Add an extra layer of security to your account',
          type: 'toggle',
          value: toggles['two-factor']
        }
      ]
    },
    {
      title: 'Learning Preferences',
      settings: [
        {
          id: 'language',
          title: 'Preferred Language',
          type: 'select',
          options: ['English', 'Spanish', 'French'],
          value: selects['language']
        },
        {
          id: 'difficulty',
          title: 'Content Difficulty',
          type: 'select',
          options: ['Beginner', 'Intermediate', 'Advanced'],
          value: selects['difficulty']
        }
      ]
    },
    {
      title: 'Privacy',
      settings: [
        {
          id: 'profile-visibility',
          title: 'Profile Visibility',
          description: 'Control who can see your profile and learning activity',
          type: 'select',
          options: ['Public', 'Private', 'Friends Only'],
          value: selects['profile-visibility']
        }
      ]
    }
  ];

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-semibold text-white mb-6">Settings</h1>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-700">
              <h2 className="text-lg font-medium text-white">{section.title}</h2>
            </div>
            <div className="p-4 sm:p-6 space-y-6">
              {section.settings.map((setting) => (
                <div key={setting.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-200">
                      {setting.title}
                    </h3>
                    {setting.description && (
                      <p className="text-sm text-gray-400 mt-1">{setting.description}</p>
                    )}
                  </div>
                  
                  {setting.type === 'toggle' && (
                    <button
                      type="button"
                      className={`
                        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-800
                        ${setting.value ? 'bg-primary-500' : 'bg-gray-600'}
                      `}
                      onClick={() => handleToggle(setting.id)}
                    >
                      <span
                        className={`
                          pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                          transition duration-200 ease-in-out
                          ${setting.value ? 'translate-x-5' : 'translate-x-0'}
                        `}
                      />
                    </button>
                  )}

                  {setting.type === 'select' && (
                    <select
                      className="block w-full sm:w-48 rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-1.5 px-3"
                      value={setting.value}
                      onChange={(e) => handleSelectChange(setting.id, e.target.value)}
                    >
                      {setting.options.map((option) => (
                        <option key={option} value={option} className="bg-gray-700">
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Password Change Section */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-medium text-white">Change Password</h2>
          </div>
          <div className="p-4 sm:p-6">
            {/* Success/Error Messages */}
            {passwordMessage && (
              <div className="mb-4 p-3 bg-green-900/30 border border-green-700/50 text-green-100 rounded-lg">
                {passwordMessage}
              </div>
            )}
            
            {passwordError && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 text-red-100 rounded-lg">
                {passwordError}
              </div>
            )}
            
            <form className="space-y-4" onSubmit={handlePasswordSubmit}>
              <Input
                label="Current Password"
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                required
              />
              <Input
                label="New Password"
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                required
              />
              
              {/* Password Requirements */}
              {passwordData.newPassword && (
                <div className="bg-gray-700/50 p-3 rounded-md border border-gray-600 mt-2">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Password Requirements:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <PasswordRequirement 
                      label="At least 8 characters" 
                      met={passwordRequirements.length} 
                    />
                    <PasswordRequirement 
                      label="At least one uppercase letter" 
                      met={passwordRequirements.uppercase} 
                    />
                    <PasswordRequirement 
                      label="At least one lowercase letter" 
                      met={passwordRequirements.lowercase} 
                    />
                    <PasswordRequirement 
                      label="At least one number" 
                      met={passwordRequirements.number} 
                    />
                    <PasswordRequirement 
                      label="At least one special character" 
                      met={passwordRequirements.special} 
                    />
                    <PasswordRequirement 
                      label="Passwords match" 
                      met={passwordRequirements.match} 
                    />
                  </div>
                </div>
              )}
              
              <Input
                label="Confirm New Password"
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                required
              />
              <div className="flex justify-end pt-2">
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-red-500/30">
          <div className="px-4 sm:px-6 py-4 border-b border-red-500/30">
            <h2 className="text-lg font-medium text-red-400">Danger Zone</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-300">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button 
                variant="outline" 
                className="w-full sm:w-auto border-red-500 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-400 focus:ring-red-500"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full border border-red-500/30 shadow-xl">
            <div className="p-6 border-b border-red-500/30">
              <div className="flex items-center gap-3">
                <FiAlertTriangle className="text-red-400 text-xl flex-shrink-0" />
                <h3 className="text-lg font-medium text-white">Delete Account</h3>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <p className="text-sm text-gray-300">
                  This action <span className="font-semibold text-red-400">cannot be undone</span>. 
                  This will permanently delete your account and remove all your data from our servers.
                </p>
                
                {deleteError && (
                  <div className="p-3 bg-red-900/30 border border-red-700/50 text-red-100 rounded-lg text-sm">
                    {deleteError}
                  </div>
                )}
                
                <form onSubmit={handleDeleteAccount}>
                  <Input
                    label="Enter your password to confirm"
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  
                  <div className="flex gap-3 justify-end mt-6">
                    <Button 
                      type="button" 
                      variant="outline"
                      className="border-gray-600 text-gray-300"
                      onClick={() => {
                        setShowDeleteModal(false);
                        setDeletePassword('');
                        setDeleteError('');
                      }}
                      disabled={deleteLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-red-600 hover:bg-red-700 text-white"
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? 'Deleting...' : 'Delete Account'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
