import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiChevronRight, FiLoader, FiGrid, FiList, FiBookOpen, FiArrowLeft } from 'react-icons/fi';
import CourseCard from '@/components/ui/CourseCard';
import CourseListItem from '@/components/ui/CourseListItem';
import CategoryChips from '@/components/ui/CategoryChips';
import { useNavigate } from 'react-router-dom';
import courseApi from '@/shared/api/courseApi';

// Default classroom image from Unsplash
const DEFAULT_THUMBNAIL = "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80";

function CoursesPage() {
  const navigate = useNavigate();
  
  // State for courses and loading
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  
  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'popular', 'rating'

  // Fetch courses and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch courses
        const coursesData = await courseApi.getCourses();
        
        // Handle different response formats
        if (coursesData && coursesData.results && Array.isArray(coursesData.results)) {
          // Paginated response format
          setCourses(coursesData.results);
        } else if (Array.isArray(coursesData)) {
          // Direct array response
          setCourses(coursesData);
        } else {
          console.error('Unexpected response format from courses endpoint:', coursesData);
          setCourses([]);
        }
        
        // Fetch categories
        const categoriesData = await courseApi.getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Apply filters and sorting
  const filteredCourses = Array.isArray(courses) ? courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        course.teacher_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || course.difficulty_level?.toLowerCase() === selectedLevel;
    const matchesCategory = selectedCategory === 'all' || course.category === parseInt(selectedCategory);
    return matchesSearch && matchesLevel && matchesCategory;
  }) : [];

  // Sort courses based on sortBy value
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.current_students || 0) - (a.current_students || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'newest':
      default:
        // Assuming newer courses have higher IDs or using created_at if available
        return b.id - a.id;
    }
  });

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 pb-16">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 text-white hover:bg-gray-700 transition-colors shadow-lg"
          aria-label="Go back"
        >
          <FiArrowLeft size={20} />
        </button>
      </div>
      
      {/* Hero Section with Background */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900 py-20 mb-12">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-primary-300 bg-clip-text text-transparent mb-6">
            Discover Your Next Skill
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Explore our wide range of courses designed to help you advance your career and achieve your learning goals.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search for courses, topics, or instructors..."
              className="block w-full pl-12 pr-4 py-4 rounded-xl bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 shadow-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filters and Sorting */}
        <div className="mb-8" id="all-courses">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-4 md:mb-0 flex items-center">
              <FiBookOpen className="mr-2 text-primary-400" />
              All Courses
            </h2>
            
            <div className="flex flex-wrap gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-800 rounded-lg p-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <FiGrid size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <FiList size={18} />
                </button>
              </div>
              
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-gray-800 border border-gray-700 text-white rounded-lg py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {/* Filter Button */}
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${showFilters ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              >
                <FiFilter className="h-4 w-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>
          
          {/* Category Chips */}
          {!loading && !error && categories.length > 0 && (
            <CategoryChips 
              categories={categories} 
              selectedCategory={selectedCategory} 
              onChange={setSelectedCategory}
            />
          )}
          
          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-700/50 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label htmlFor="level-filter" className="block text-sm font-medium text-gray-300 mb-2">
                    Course Level
                  </label>
                  <select
                    id="level-filter"
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                
                <div className="md:col-span-3 flex items-end justify-end">
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedLevel('all');
                      setSelectedCategory('all');
                    }}
                    className="px-4 py-2.5 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg mr-3 transition-colors"
                  >
                    Reset Filters
                  </button>
                  <button 
                    onClick={() => setShowFilters(false)}
                    className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700/50 p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/20 mb-4">
              <span className="text-red-500 text-2xl">!</span>
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Failed to load courses</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors inline-flex items-center"
            >
              Try again
              <FiChevronRight className="ml-1 h-4 w-4" />
            </button>
          </div>
        )}

        {/* Course Grid */}
        {!loading && !error && sortedCourses.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {sortedCourses.map(course => (
              viewMode === 'grid' ? (
                <CourseCard 
                  key={course.id} 
                  id={course.id}
                  title={course.title}
                  instructor={course.teacher_name}
                  thumbnail={course.thumbnail || DEFAULT_THUMBNAIL}
                  price={course.price}
                  rating={course.rating}
                  level={course.difficulty_level}
                />
              ) : (
                <CourseListItem
                  key={course.id} 
                  id={course.id}
                  title={course.title}
                  instructor={course.teacher_name}
                  thumbnail={course.thumbnail || DEFAULT_THUMBNAIL}
                  price={course.price}
                  rating={course.rating}
                  level={course.difficulty_level}
                />
              )
            ))}
          </div>
        ) : !loading && !error && (
          <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700/50 p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700 mb-4">
              <FiSearch className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No courses found</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              We couldn't find any courses matching your search. Try adjusting your filters.
            </p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedLevel('all');
                setSelectedCategory('all');
              }}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors inline-flex items-center"
            >
              Clear all filters
              <FiChevronRight className="ml-1 h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CoursesPage;
