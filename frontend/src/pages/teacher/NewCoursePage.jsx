import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PhotoIcon, VideoCameraIcon, DocumentTextIcon, PlusIcon } from '@heroicons/react/24/outline';
import courseApi from '@/shared/api/courseApi';
import { useAuth } from '@/shared/context/AuthContext';

// Default classroom image from Unsplash
const DEFAULT_THUMBNAIL = "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80";

const NewCoursePage = () => {
  const navigate = useNavigate();
  const { isTeacher } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'programming',
    price: '0',
    difficulty_level: 'beginner',
    duration_weeks: 1,
    max_students: 50,
    status: 'draft',
    thumbnail: null,
    imagePreview: null
  });

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    
    if (name === 'image' && files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          thumbnail: files[0],
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(files[0]);
    } else if (name === 'publish_status') {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    
    if (!isTeacher) {
      setError('Only teachers can create courses');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create FormData object to handle file uploads
      const courseFormData = new FormData();
      
      // Add all form fields to FormData
      Object.keys(formData).forEach(key => {
        // Skip imagePreview as it's just for display
        if (key === 'imagePreview') return;
        
        // Skip thumbnail if null
        if (key === 'thumbnail' && formData[key] === null) {
          // If no thumbnail is provided, we'll use the default on the backend
          return;
        }
        
        courseFormData.append(key, formData[key]);
      });
      
      // Call API to create course
      await courseApi.createCourse(courseFormData);
      
      // Navigate to the course management page after creation
      navigate('/dashboard/teacher/courses');
    } catch (err) {
      console.error('Error creating course:', err);
      setError(err.message || 'Failed to create course');
      // Go back to step 2 to fix any issues
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-1">Course Title</h3>
              <p className="text-sm text-gray-400 mb-4">What will you teach in this course?</p>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Learn React from Scratch"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-1">Course Description</h3>
              <p className="text-sm text-gray-400 mb-4">What will students learn in your course?</p>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                placeholder="Describe what students will learn, what's included, and any requirements."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="programming">Programming</option>
                  <option value="design">Design</option>
                  <option value="business">Business</option>
                  <option value="marketing">Marketing</option>
                  <option value="photography">Photography</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Course Level</label>
                <select
                  name="difficulty_level"
                  value={formData.difficulty_level}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Duration (weeks)</label>
                <input
                  type="number"
                  name="duration_weeks"
                  value={formData.duration_weeks}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Maximum Students</label>
                <input
                  type="number"
                  name="max_students"
                  value={formData.max_students}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Course Image</h3>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  {formData.imagePreview ? (
                    <div className="relative">
                      <img
                        src={formData.imagePreview}
                        alt="Course preview"
                        className="mx-auto h-48 w-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, thumbnail: null, imagePreview: null }))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <img
                          src={DEFAULT_THUMBNAIL}
                          alt="Default course thumbnail"
                          className="mx-auto h-32 w-auto object-cover rounded-lg opacity-50"
                        />
                        <p className="text-xs text-gray-400 mt-2">Default thumbnail preview</p>
                      </div>
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-400">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-indigo-500 hover:text-indigo-400 focus-within:outline-none"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="image"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleChange}
                          />
                        </label>
                        <p className="pl-1 text-gray-300">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
                      <p className="text-xs text-gray-500 mt-2">A default image will be used if none is provided</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-1">Pricing</h3>
              <p className="text-sm text-gray-400 mb-4">Set a price for your course</p>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">$</span>
                </div>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-7 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">USD</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                id="publish_status"
                name="publish_status"
                type="checkbox"
                checked={formData.status === 'published'}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded bg-gray-700"
              />
              <label htmlFor="publish_status" className="ml-2 block text-sm text-gray-300">
                Publish course (make it visible to students)
              </label>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">You're all set!</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Your course "{formData.title}" has been created. You can now start adding content and customizing your course.
            </p>
            <div className="bg-gray-800 rounded-lg p-6 text-left max-w-2xl mx-auto">
              <h4 className="font-medium text-white mb-4">Next Steps:</h4>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-indigo-500">
                    <DocumentTextIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">Add course content</p>
                    <p className="text-sm text-gray-400">Create sections and lectures for your course</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-indigo-500">
                    <VideoCameraIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">Record or upload videos</p>
                    <p className="text-sm text-gray-400">Add video content to your lectures</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-indigo-500">
                    <PhotoIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">Add resources</p>
                    <p className="text-sm text-gray-400">Upload PDFs, slides, or other materials</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <button
          onClick={() => step > 1 ? setStep(step - 1) : navigate('/dashboard/teaching')}
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors duration-200"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to {step > 1 ? 'Previous' : 'Courses'}
        </button>
        <h1 className="text-3xl font-bold text-white mt-2">
          {step === 1 ? 'Create a New Course' : step === 2 ? 'Course Media & Pricing' : 'Course Created!'}
        </h1>
        <p className="text-gray-400 mt-2">
          {step === 1 
            ? 'Fill in the basic information about your course' 
            : step === 2 
              ? 'Add a course image and set your price'
              : 'Your course is ready for the next steps!'}
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 text-red-100 rounded-lg">
          {error}
        </div>
      )}

      {/* Progress Steps */}
      {step < 3 && (
        <div className="mb-8">
          <div className="flex items-center">
            {[1, 2, 3].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div 
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    stepNumber < step 
                      ? 'bg-green-500 text-white' 
                      : stepNumber === step 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${step > stepNumber ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span className={step >= 1 ? 'text-white font-medium' : ''}>Details</span>
            <span className={step >= 2 ? 'text-white font-medium' : ''}>Media & Pricing</span>
            <span>Publish</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl p-6 shadow-lg">
        {renderStep()}
        
        <div className="mt-8 flex justify-end">
          {step < 3 ? (
            <button
              type="submit"
              disabled={!formData.title || !formData.description || loading}
              className={`px-6 py-3 rounded-lg font-medium text-white ${
                (!formData.title || !formData.description || loading) 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } transition-colors duration-200 flex items-center`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {step === 2 ? 'Creating...' : 'Saving...'}
                </>
              ) : (
                step === 2 ? 'Create Course' : 'Continue'
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate(`/dashboard/teacher/courses`)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Go to My Courses
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default NewCoursePage;
