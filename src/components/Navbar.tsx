import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onSearchChange: (searchTerm: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSearchChange }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchChange(value);
  };

  return (
    <nav className="bg-black bg-opacity-80 backdrop-blur-md fixed top-0 left-0 right-0 z-50 px-4 py-3 border-b border-gray-700">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-2xl tv-argentina-text">TV Argentina</h1>
        </div>

        {/* Search Bar and User Menu */}
        <div className="flex items-center space-x-4">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar canales..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="block w-64 pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
            />
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 text-white hover:text-red-400 transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <span className="hidden md:block text-sm">{user?.name}</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  showUserMenu ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-black bg-opacity-90 backdrop-blur-sm rounded-md shadow-lg border border-gray-700">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
                    <div className="truncate" title={user?.email}>
                      {user?.email}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-red-600 hover:text-white transition-colors duration-200"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;