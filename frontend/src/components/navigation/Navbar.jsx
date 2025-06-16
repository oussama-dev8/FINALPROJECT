import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const element = document.getElementById(sectionId.replace('#', ''));
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80, // Adjust for fixed header
        behavior: 'smooth'
      });
    }
  };

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-gray-900/95 backdrop-blur-md border-b border-gray-800' : 'bg-transparent'
    }`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="flex items-center">
                <div className="h-8 w-8 mr-2 flex items-center justify-center">
                  <img 
                    src="/favicon.svg" 
                    alt="Darsy Logo" 
                    className="h-6 w-6" 
                  />
                </div>
                <span className={`text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent`}>
                  Darsy
                </span>
              </div>
            </Link>
            <div className="hidden md:flex md:ml-10 space-x-6">
              {navLinks.map((item) => (
                item.href.startsWith('#') ? (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => scrollToSection(e, item.href)}
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    {item.name}
                  </a>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                )
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 overflow-hidden">
                    {user.avatar ? (
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
                    <div className={`absolute inset-0 flex items-center justify-center ${user.avatar ? 'hidden' : 'flex'}`}>
                      <span className="text-primary-700 font-medium text-sm">
                        {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                      </span>
                    </div>
                  </div>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 ring-1 ring-black/5">
                    <div className="px-4 py-3 border-b border-neutral-100">
                      <p className="text-sm font-sans font-medium text-neutral-900">{user.name}</p>
                      <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2.5 text-sm font-sans font-medium text-neutral-700 hover:bg-neutral-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/dashboard/profile"
                      className="block px-4 py-2.5 text-sm font-sans font-medium text-neutral-700 hover:bg-neutral-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <div className="border-t border-neutral-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2.5 text-sm font-sans font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className={`nav-button px-4 py-2 text-sm font-sans font-medium rounded-lg transition-all ${
                    scrolled 
                      ? 'bg-secondary-600 hover:bg-secondary-700 text-white border-transparent' 
                      : 'bg-secondary-500/90 hover:bg-secondary-600/90 text-white border-transparent backdrop-blur-sm'
                  }`}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="nav-button px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm shadow-primary-500/20"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
