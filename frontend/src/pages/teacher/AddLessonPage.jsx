import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiX, FiUpload, FiTrash2, FiPaperclip } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import courseApi from '@/shared/api/courseApi';
import { useAuth } from '@/shared/context/AuthContext';

function AddLessonPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isTeacher } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lesson_type: 'reading',
    order: 1,
    duration_minutes: 30,
    content: '',
    is_published: false
  });
  
  // Materials state
  const [materials, setMaterials] = useState([]);
  const [materialTitle, setMaterialTitle] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [courseTitle, setCourseTitle] = useState('');

  // Fetch course details to get the title
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!isTeacher) {
        navigate('/dashboard');
        return;
      }
      
      try {
        const courseData = await courseApi.getCourseById(courseId);
        setCourseTitle(courseData.title);
        
        // Set the next order number based on existing lessons
        if (courseData.lessons && courseData.lessons.length > 0) {
          const maxOrder = Math.max(...courseData.lessons.map(lesson => lesson.order));
          setFormData(prev => ({ ...prev, order: maxOrder + 1 }));
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course details');
      }
    };

    fetchCourseDetails();
  }, [courseId, isTeacher, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddMaterial = (e) => {
    e.preventDefault();
    const fileInput = e.target.files[0];
    if (fileInput) {
      const newMaterial = {
        file: fileInput,
        title: materialTitle || fileInput.name,
        size: fileInput.size,
        type: fileInput.type
      };
      setMaterials([...materials, newMaterial]);
      setMaterialTitle('');
    }
  };

  const handleRemoveMaterial = (index) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      // Create FormData to handle file uploads
      const lessonFormData = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        lessonFormData.append(key, formData[key]);
      });
      
      // Add materials if any
      if (materials.length > 0) {
        materials.forEach((material, index) => {
          lessonFormData.append(`material_${index}`, material.file);
          lessonFormData.append(`material_${index}_title`, material.title);
        });
        lessonFormData.append('materials_count', materials.length);
      }
      
      // Create lesson
      const response = await courseApi.createLesson(courseId, lessonFormData);
      
      setSuccessMessage('Lesson created successfully!');
      setTimeout(() => {
        navigate(`/dashboard/teacher/courses/${courseId}/view`);
      }, 1500);
    } catch (err) {
      console.error('Error creating lesson:', err);
      setError(err.message || 'Failed to create lesson');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Add New Lesson</h1>
          <p className="text-gray-400">Course: {courseTitle}</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/dashboard/teacher/courses/${courseId}/view`)}
            className="border-gray-600 hover:bg-gray-700"
          >
            <FiX className="mr-2" /> Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={saving}
          >
            <FiSave className="mr-2" /> {saving ? 'Saving...' : 'Save Lesson'}
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-800 text-red-200 rounded-lg">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-6 p-4 bg-green-900/30 border border-green-800 text-green-200 rounded-lg">
          {successMessage}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700/50 mb-6">
            <h2 className="text-xl font-bold mb-4">Lesson Details</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                  Lesson Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter lesson title"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe what this lesson is about"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="lesson_type" className="block text-sm font-medium text-gray-300 mb-1">
                    Lesson Type
                  </label>
                  <select
                    id="lesson_type"
                    name="lesson_type"
                    value={formData.lesson_type}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="reading">Reading Material</option>
                    <option value="video">Video</option>
                    <option value="quiz">Quiz</option>
                    <option value="live">Live Session</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-300 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    id="duration_minutes"
                    name="duration_minutes"
                    value={formData.duration_minutes}
                    onChange={handleChange}
                    min="1"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="order" className="block text-sm font-medium text-gray-300 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    id="order"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    min="1"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-1">
                  Lesson Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={10}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Write your lesson content here..."
                />
              </div>
              
              {formData.lesson_type === 'video' && (
                <div>
                  <label htmlFor="video_url" className="block text-sm font-medium text-gray-300 mb-1">
                    Video URL
                  </label>
                  <input
                    type="url"
                    id="video_url"
                    name="video_url"
                    value={formData.video_url || ''}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter YouTube or Vimeo URL"
                  />
                </div>
              )}
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_published"
                  name="is_published"
                  checked={formData.is_published}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-600 rounded bg-gray-700"
                />
                <label htmlFor="is_published" className="ml-2 block text-sm text-gray-300">
                  Publish immediately
                </label>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700/50">
            <h2 className="text-xl font-bold mb-4">Lesson Materials</h2>
            
            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Upload Materials
                </label>
                
                <div className="flex flex-col space-y-2">
                  <input
                    type="text"
                    value={materialTitle}
                    onChange={(e) => setMaterialTitle(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Material title (optional)"
                  />
                  
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-gray-600 hover:border-gray-500 bg-gray-700 hover:bg-gray-600 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FiUpload className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF, DOC, PPT, ZIP, etc.</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={handleAddMaterial}
                    />
                  </label>
                </div>
              </div>
              
              {materials.length > 0 && (
                <div>
                  <h3 className="text-md font-medium text-gray-300 mb-2">Uploaded Materials</h3>
                  <div className="space-y-2">
                    {materials.map((material, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600"
                      >
                        <div className="flex items-center">
                          <FiPaperclip className="text-primary-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-white">{material.title}</p>
                            <p className="text-xs text-gray-400">
                              {(material.size / 1024 / 1024).toFixed(2)} MB • {material.type}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="icon" 
                          onClick={() => handleRemoveMaterial(index)}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <FiTrash2 />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700/50 sticky top-6">
            <h2 className="text-xl font-bold mb-4">Tips</h2>
            
            <div className="space-y-4 text-sm text-gray-300">
              <div>
                <h3 className="font-medium text-white">Creating Effective Lessons</h3>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Keep your content clear and concise</li>
                  <li>Include examples and practical applications</li>
                  <li>Use visuals to enhance understanding</li>
                  <li>Break complex topics into smaller sections</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-white">Supported File Types</h3>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Documents: PDF, DOC, DOCX, TXT</li>
                  <li>Presentations: PPT, PPTX</li>
                  <li>Spreadsheets: XLS, XLSX, CSV</li>
                  <li>Archives: ZIP, RAR</li>
                  <li>Images: JPG, PNG, GIF</li>
                </ul>
              </div>
              
              <div className="bg-primary-900/30 p-3 rounded-lg border border-primary-800/50">
                <p className="text-primary-200">
                  <strong>Note:</strong> If you don't publish the lesson now, students won't be able to see it until you publish it later.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddLessonPage;
