import React from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiUser, FiBarChart2 } from 'react-icons/fi';

// Default classroom image from Unsplash
const DEFAULT_THUMBNAIL = "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80";

// Helper function to get level badge color
const getLevelColor = (level) => {
  switch(level?.toLowerCase()) {
    case 'beginner':
      return 'bg-green-100 text-green-800';
    case 'intermediate':
      return 'bg-blue-100 text-blue-800';
    case 'advanced':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Helper function to format rating stars
const renderRatingStars = (rating) => {
  // Convert rating to number and handle null/undefined
  const numericRating = parseFloat(rating) || 0;
  
  const fullStars = Math.floor(numericRating);
  const hasHalfStar = numericRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} className="text-yellow-400">★</span>
      ))}
      {hasHalfStar && <span className="text-yellow-400">★</span>}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} className="text-gray-300">★</span>
      ))}
      <span className="ml-1 text-sm text-gray-600">{numericRating.toFixed(1)}</span>
    </div>
  );
};

function CourseCard({ id, title, instructor, thumbnail, price, rating, level }) {
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/20 border border-gray-700 hover:border-primary-500/50 group">
      <div className="relative">
      <img 
          src={thumbnail || DEFAULT_THUMBNAIL} 
        alt={title} 
          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_THUMBNAIL;
          }}
      />
        <div className="absolute top-3 right-3">
          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(level)}`}>
            {level || 'All Levels'}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">{title}</h3>
        <div className="flex items-center mb-3">
          <FiUser className="text-gray-400 mr-1.5" size={14} />
          <p className="text-sm text-gray-400">{instructor}</p>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <FiBarChart2 className="text-gray-400 mr-1.5" size={14} />
            <span className="text-sm text-gray-400">{level || 'All Levels'}</span>
          </div>
          <div className="flex items-center">
            <FiClock className="text-gray-400 mr-1.5" size={14} />
            <span className="text-sm text-gray-400">8 weeks</span>
          </div>
        </div>
        
        <div className="flex items-center mb-4">
          {renderRatingStars(rating)}
        </div>
        
        <div className="flex justify-between items-center pt-3 border-t border-gray-700">
          <span className="text-xl font-bold text-primary-400">${parseFloat(price || 0).toFixed(2)}</span>
          <Link 
            to={`/courses/${id}`}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-500 transition-colors flex items-center"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CourseCard;
