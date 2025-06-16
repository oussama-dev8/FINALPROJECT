import React from 'react';

// Predefined colors for categories
const categoryColors = [
  'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'bg-green-500/10 text-green-400 border-green-500/30',
  'bg-purple-500/10 text-purple-400 border-purple-500/30',
  'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  'bg-red-500/10 text-red-400 border-red-500/30',
  'bg-pink-500/10 text-pink-400 border-pink-500/30',
  'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  'bg-teal-500/10 text-teal-400 border-teal-500/30',
];

function CategoryChips({ categories, selectedCategory, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onChange('all')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all border 
          ${selectedCategory === 'all' 
            ? 'bg-primary-500/20 text-primary-400 border-primary-500/50' 
            : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'}`}
      >
        All Categories
      </button>
      
      {categories.map((category, index) => (
        <button
          key={category.id}
          onClick={() => onChange(category.id.toString())}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all border
            ${selectedCategory === category.id.toString() 
              ? 'bg-primary-500/20 text-primary-400 border-primary-500/50' 
              : `${categoryColors[index % categoryColors.length]} hover:bg-opacity-20`}`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}

export default CategoryChips; 