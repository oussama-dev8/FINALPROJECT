import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/shared/context/AuthContext';
import authApi from '@/shared/api/authApi';

// Helper function to get full URL for media files
const getFullMediaUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${url}`;
};

function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    bio: '',
    phone_number: '',
    profile_picture: null,
    profile_picture_preview: null,
    // Teacher-specific fields
    specialization: '',
    experience: '',
    qualifications: '',
    // Student-specific fields
    grade_level: '',
    school: '',
    learning_goals: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Add state for image loading
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      console.log('Setting initial profile data from user:', user);
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        bio: user.bio || '',
        phone_number: user.phone_number || '',
        profile_picture: user.profile_picture ? getFullMediaUrl(user.profile_picture) : null,
        profile_picture_preview: null,
        // Teacher-specific fields
        specialization: user.specialization || '',
        experience: user.experience || '',
        qualifications: user.qualifications || '',
        // Student-specific fields
        grade_level: user.grade_level || '',
        school: user.school || '',
        learning_goals: user.learning_goals || ''
      });
    }
  }, [user]);

  // Add a useEffect to clean up object URLs when component unmounts
  useEffect(() => {
    // Clean up function to revoke object URLs to avoid memory leaks
    return () => {
      if (profileData.profile_picture_preview) {
        URL.revokeObjectURL(profileData.profile_picture_preview);
      }
    };
  }, [profileData.profile_picture_preview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      // Create form data to handle file upload
      const formData = new FormData();
      
      // Add basic fields
      formData.append('first_name', profileData.first_name);
      formData.append('last_name', profileData.last_name);
      formData.append('bio', profileData.bio || '');
      formData.append('phone_number', profileData.phone_number || '');
      
      // Add role-specific fields
      if (user.user_type === 'teacher') {
        formData.append('specialization', profileData.specialization || '');
        formData.append('experience', profileData.experience || '');
        formData.append('qualifications', profileData.qualifications || '');
      } else if (user.user_type === 'student') {
        formData.append('grade_level', profileData.grade_level || '');
        formData.append('school', profileData.school || '');
        formData.append('learning_goals', profileData.learning_goals || '');
      }
      
      // Add profile picture if changed
      if (profileData.profile_picture instanceof File) {
        formData.append('profile_picture', profileData.profile_picture);
      }
      
      // Log the form data for debugging
      console.log('Submitting profile update with form data:');
      for (let [key, value] of formData.entries()) {
        if (key !== 'profile_picture') {
          console.log(`${key}: ${value}`);
        } else {
          console.log(`${key}: [File]`);
        }
      }
      
      const updatedUser = await updateProfile(formData);
      
      // Log the response from the server
      console.log('Server response from updateProfile:', updatedUser);
      
      // Update local state with the returned user data
      if (updatedUser) {
        // Create a complete updated profile data object
        const updatedProfileData = {
          // Keep all existing data
          ...profileData,
          // Update with all fields from the server response
          first_name: updatedUser.first_name || profileData.first_name,
          last_name: updatedUser.last_name || profileData.last_name,
          email: updatedUser.email || profileData.email,
          bio: updatedUser.bio || '',
          phone_number: updatedUser.phone_number || '',
          // Handle profile picture separately
          profile_picture: updatedUser.profile_picture ? getFullMediaUrl(updatedUser.profile_picture) : profileData.profile_picture,
          profile_picture_preview: null, // Clear the preview now that we have the actual URL
        };
        
        // Add role-specific fields
        if (user.user_type === 'teacher') {
          updatedProfileData.specialization = updatedUser.specialization || profileData.specialization || '';
          updatedProfileData.experience = updatedUser.experience || profileData.experience || '';
          updatedProfileData.qualifications = updatedUser.qualifications || profileData.qualifications || '';
        } else if (user.user_type === 'student') {
          updatedProfileData.grade_level = updatedUser.grade_level || profileData.grade_level || '';
          updatedProfileData.school = updatedUser.school || profileData.school || '';
          updatedProfileData.learning_goals = updatedUser.learning_goals || profileData.learning_goals || '';
        }
        
        // Update state with complete data
        setProfileData(updatedProfileData);
        console.log('Updated profile data:', updatedProfileData);
      }
      
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      setOriginalData(null);
    } catch (error) {
      console.error('Profile update error:', error);
      setErrorMessage(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditToggle = () => {
    if (!isEditing) {
      // When entering edit mode, save the original data
      setOriginalData({...profileData});
    } else if (originalData) {
      // When cancelling, restore the original data
      setProfileData({...originalData});
      setOriginalData(null);
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Image size should not exceed 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.match('image.*')) {
        setErrorMessage('Please select an image file');
        return;
      }
      
      // Set loading state
      setIsImageLoading(true);
      
      // Create a preview URL and update state
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData({
          ...profileData,
          profile_picture: file,
          profile_picture_preview: e.target.result
        });
        setIsImageLoading(false);
      };
      reader.onerror = () => {
        setErrorMessage('Failed to load image');
        setIsImageLoading(false);
      };
      reader.readAsDataURL(file);
      
      // Clear any previous error messages
      setErrorMessage('');
    }
  };

  // Get user initials for avatar placeholder
  const getInitials = () => {
    if (profileData.first_name && profileData.last_name) {
      return `${profileData.first_name[0]}${profileData.last_name[0]}`.toUpperCase();
    } else if (profileData.first_name) {
      return profileData.first_name[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white">Profile Settings</h1>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-900/30 border border-green-700/50 text-green-100 rounded-lg">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 text-red-100 rounded-lg">
          {errorMessage}
        </div>
      )}

      <div className="bg-gray-800 rounded-lg shadow border border-gray-700">
        <div className="p-6">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-6 space-y-4 sm:space-y-0 mb-6">
            <div className="relative">
              <div className={`relative w-32 h-32 rounded-full bg-gray-700 overflow-hidden border-4 border-gray-700 shadow-md ${isEditing ? 'hover:opacity-90 cursor-pointer group' : ''}`} 
                   onClick={isEditing ? () => document.querySelector('input[type="file"]').click() : undefined}>
                {isImageLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                  </div>
                ) : (profileData.profile_picture || profileData.profile_picture_preview) ? (
                  <img
                    src={
                      profileData.profile_picture_preview || 
                      (typeof profileData.profile_picture === 'string' 
                        ? profileData.profile_picture 
                        : null)
                    }
                    alt={`${profileData.first_name} ${profileData.last_name}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`absolute inset-0 flex items-center justify-center bg-gray-700 ${isImageLoading || profileData.profile_picture || profileData.profile_picture_preview ? 'hidden' : 'flex'}`}>
                  <span className="text-4xl font-medium text-gray-300">
                    {getInitials()}
                  </span>
                </div>
                
                {/* Overlay for edit mode */}
              {isEditing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <svg
                      className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  </div>
                )}
                
                {/* Hidden file input */}
                {isEditing && (
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                )}
              </div>
              {!isEditing && (
                <div className="text-center mt-2 text-sm text-gray-400">
                  <p>Click "Edit Profile" to change picture</p>
                </div>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-white">{`${profileData.first_name} ${profileData.last_name}`}</h2>
              <p className="text-gray-300">{profileData.bio || 'No bio provided'}</p>
              <p className="text-sm text-primary-400 mt-1">{user?.user_type === 'teacher' ? 'Teacher' : 'Student'}</p>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-4 border-b border-gray-700 pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                  label="First Name"
                  name="first_name"
                  value={profileData.first_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
                <Input
                  label="Last Name"
                  name="last_name"
                  value={profileData.last_name}
                onChange={handleChange}
                disabled={!isEditing}
                  required
              />
              <Input
                label="Email"
                type="email"
                name="email"
                value={profileData.email}
                  disabled={true} // Email should not be editable
              />
                <Input
                  label="Phone Number"
                  name="phone_number"
                  value={profileData.phone_number}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="+1234567890"
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    rows={3}
                />
                </div>
              </div>
            </div>

            {/* Role-specific fields */}
            {user?.user_type === 'teacher' && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-4 border-b border-gray-700 pb-2">Teacher Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                    label="Specialization"
                    name="specialization"
                    value={profileData.specialization}
                onChange={handleChange}
                disabled={!isEditing}
                    placeholder="e.g., Mathematics, Computer Science"
              />
              <Input
                    label="Experience"
                    name="experience"
                    value={profileData.experience}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g., 5 years"
                  />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Qualifications</label>
                    <textarea
                      name="qualifications"
                      value={profileData.qualifications}
                onChange={handleChange}
                disabled={!isEditing}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      rows={3}
                      placeholder="List your degrees, certifications, and other qualifications"
                    />
                  </div>
                </div>
              </div>
            )}

            {user?.user_type === 'student' && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-4 border-b border-gray-700 pb-2">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                    label="Grade Level"
                    name="grade_level"
                    value={profileData.grade_level}
                onChange={handleChange}
                disabled={!isEditing}
                    placeholder="e.g., High School, College, Graduate"
              />
              <Input
                    label="School"
                    name="school"
                    value={profileData.school}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Your school or institution name"
                  />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Learning Goals</label>
                    <textarea
                      name="learning_goals"
                      value={profileData.learning_goals}
                onChange={handleChange}
                disabled={!isEditing}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      rows={3}
                      placeholder="What do you hope to achieve through your learning?"
              />
            </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
              {isEditing ? (
                <>
                  <Button 
                    type="button"
                    variant="secondary"
                    onClick={handleEditToggle}
                    className="w-full sm:w-auto"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    variant="primary"
                    className="w-full sm:w-auto"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <Button 
                  type="button"
                  variant="primary"
                  onClick={handleEditToggle}
                  className="w-full sm:w-auto"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
