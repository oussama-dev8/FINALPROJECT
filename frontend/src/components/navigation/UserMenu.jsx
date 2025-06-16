import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';

function UserMenu() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
        aria-label="User menu"
      >
        <div className="relative w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`absolute inset-0 flex items-center justify-center ${user?.avatar ? 'hidden' : 'flex'}`}>
            <span className="text-gray-200 font-medium text-sm">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
            </span>
          </div>
        </div>
      </button>

      {/* Dropdown Menu */}
      <div 
        className={`absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl py-1 border border-gray-700 transition-all duration-200 origin-top-right transform ${isMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
        style={{ zIndex: 9999 }}
      >
        <div className="px-4 py-3 border-b border-gray-700">
          <p className="text-sm font-medium text-gray-100 truncate">{user?.name}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
        </div>
        <div className="py-1">
          <Link
            to="/dashboard"
            className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/dashboard/profile"
            className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Profile Settings
          </Link>
        </div>
        <div className="border-t border-gray-700"></div>
        <div className="py-1">
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserMenu;
