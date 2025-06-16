import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiX, FiUpload, FiTrash } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import courseApi from '@/shared/api/courseApi';
import { useAuth } from '@/shared/context/AuthContext';

// Default classroom image from Unsplash
const DEFAULT_THUMBNAIL = "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80";

function CourseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isTeacher } = useAuth();
  const isEditMode = Boolean(id);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    category: '',
    difficulty_level: 'beginner',
    duration_weeks: 1,
    max_students: 50,
    status: 'draft',
    thumbnail: null
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  // Fetch categories and course data if in edit mode
  useEffect(() => {
    const fetchData = async () => {
      if (!isTeacher) {
        navigate('/dashboard');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch categories
        const categoriesData = await courseApi.getCategories();
        console.log('Categories data:', categoriesData);
        setCategories(categoriesData || []);
        
        // If edit mode, fetch course data
        if (isEditMode) {
          const courseData = await courseApi.getCourseById(id);
          
          // Set form data from course
          setFormData({
            title: courseData.title || '',
            description: courseData.description || '',
            price: courseData.price || 0,
            category: courseData.category || '',
            difficulty_level: courseData.difficulty_level || 'beginner',
            duration_weeks: courseData.duration_weeks || 1,
            max_students: courseData.max_students || 50,
            status: courseData.status || 'draft',
            thumbnail: null // We don't load the file itself
          });
          
          // Set thumbnail preview if exists
          if (courseData.thumbnail) {
            setThumbnailPreview(courseData.thumbnail);
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditMode, isTeacher, navigate]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'publish_status') {
      // Handle the publish checkbox
      setFormData(prev => ({
        ...prev,
        status: checked ? 'published' : 'draft'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Handle thumbnail upload
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      thumbnail: file
    }));
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setThumbnailPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Remove thumbnail
  const handleRemoveThumbnail = () => {
    setFormData(prev => ({
      ...prev,
      thumbnail: null
    }));
    setThumbnailPreview(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isTeacher) {
      setError('Only teachers can create or edit courses');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      // Create FormData object to handle file uploads
      const courseFormData = new FormData();
      
      // Add all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (key === 'thumbnail' && formData[key] === null) {
          // Skip null thumbnail
          return;
        }
        courseFormData.append(key, formData[key]);
      });
      
      // Call API to create or update course
      if (isEditMode) {
        await courseApi.updateCourse(id, courseFormData);
      } else {
        await courseApi.createCourse(courseFormData);
      }
      
      // Redirect to courses list
      navigate('/dashboard/teacher/courses');
    } catch (err) {
      console.error('Error saving course:', err);
      setError(err.message || 'Failed to save course');
      window.scrollTo(0, 0); // Scroll to top to show error
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">
          {isEditMode ? 'Edit Course' : 'Create New Course'}
        </h1>
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard/teacher/courses')}
          className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500"
        >
          Cancel
        </Button>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 text-red-100 rounded-lg">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
          <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 gap-6">
            {/* Course Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                Course Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter course title"
              />
            </div>
            
            {/* Course Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                Course Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={5}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe your course"
              />
            </div>
            
            {/* Category and Difficulty Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {Array.isArray(categories) && categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="difficulty_level" className="block text-sm font-medium text-gray-300 mb-1">
                  Difficulty Level <span className="text-red-500">*</span>
                </label>
                <select
                  id="difficulty_level"
                  name="difficulty_level"
                  value={formData.difficulty_level}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            
            {/* Duration and Max Students */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="duration_weeks" className="block text-sm font-medium text-gray-300 mb-1">
                  Duration (weeks) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="duration_weeks"
                  name="duration_weeks"
                  value={formData.duration_weeks}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="max_students" className="block text-sm font-medium text-gray-300 mb-1">
                  Maximum Students <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="max_students"
                  name="max_students"
                  value={formData.max_students}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Course Thumbnail
              </label>
              
              {thumbnailPreview ? (
                <div className="mb-4">
                  <div className="relative w-full h-40 bg-gray-700 rounded-lg overflow-hidden">
                    <img 
                      src={thumbnailPreview} 
                      alt="Course thumbnail" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
                      <FiTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="flex flex-col items-center justify-center w-full">
                    <div className="mb-4 w-full">
                      <img
                        src={DEFAULT_THUMBNAIL}
                        alt="Default course thumbnail"
                        className="mx-auto h-32 w-auto object-cover rounded-lg opacity-50"
                      />
                      <p className="text-xs text-center text-gray-400 mt-2">Default thumbnail preview</p>
                    </div>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-gray-600 hover:border-gray-500 bg-gray-700 hover:bg-gray-600 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FiUpload className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG or WEBP (MAX. 2MB)</p>
                      </div>
                      <input 
                        id="thumbnail" 
                        name="thumbnail" 
                        type="file" 
                        className="hidden" 
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleThumbnailChange}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
            
            {/* Published Status */}
            <div className="flex items-center">
              <input
                id="publish_status"
                name="publish_status"
                type="checkbox"
                checked={formData.status === 'published'}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-600 rounded bg-gray-700"
              />
              <label htmlFor="publish_status" className="ml-2 block text-sm text-gray-300">
                Publish course (make it visible to students)
              </label>
            </div>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard/teacher/courses')}
            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500"
            disabled={saving}
          >
            <FiX className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <FiSave className="h-4 w-4 mr-2" />
                {isEditMode ? 'Update Course' : 'Create Course'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CourseForm; 