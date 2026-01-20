import { useState } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiSearch, FiUserPlus } from 'react-icons/fi';
import { useTheme } from '../../../contexts/ThemeContext';
import { getImageUrl } from '../../../utils/helpers';

const FindContactsModal = ({ isOpen, onClose, users, onSelectUser }) => {
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredContacts = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClose = () => {
    setSearchTerm('');
    onClose();
  };

  const handleSelectUser = (user) => {
    setSearchTerm('');
    onSelectUser(user);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Modal Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal Content */}
      <div className={`relative w-[500px] max-h-[600px] rounded-2xl shadow-2xl overflow-hidden ${
        isDarkMode ? 'bg-gray-900 border-2 border-gray-700' : 'bg-white border-2 border-gray-200'
      }`}>
        {/* Modal Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          isDarkMode ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900' : 'border-gray-200 bg-gradient-to-r from-teal-50 to-cyan-50'
        }`}>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl blur-md opacity-60 animate-pulse" />
              <div className="relative bg-gradient-to-br from-teal-500 to-cyan-600 p-3 rounded-xl shadow-lg">
                <FiUserPlus className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Find Contacts
            </h2>
          </div>
          <button
            onClick={handleClose}
            className={`p-2.5 rounded-xl transition-all duration-200 hover:scale-110 ${
              isDarkMode
                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 bg-gradient-to-br from-transparent to-teal-500/5 dark:to-teal-500/10">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-500 dark:text-teal-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              autoFocus
              className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 shadow-sm ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-teal-500/50 focus:border-teal-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-teal-500/50 focus:border-teal-500'
              }`}
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="overflow-y-auto max-h-[400px] px-4 pb-4" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#14b8a6 transparent'
        }}>
          {filteredContacts.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-12 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className="w-16 h-16 bg-linear-to-br from-teal-100 to-cyan-100 dark:from-gray-700 dark:to-gray-700 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                <FiSearch className="w-8 h-8 text-teal-600 dark:text-teal-400" />
              </div>
              <p className="text-sm font-medium">
                {searchTerm ? 'No contacts found' : 'Start typing to search contacts'}
              </p>
            </div>
          ) : (
            filteredContacts.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl mb-2 transition-all duration-200 hover:scale-[1.02] shadow-sm hover:shadow-md ${
                  isDarkMode
                    ? 'hover:bg-gray-700/80'
                    : 'hover:bg-linear-to-r hover:from-teal-50 hover:to-cyan-50'
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  {user.profileImage ? (
                    <img
                      src={getImageUrl(user.profileImage)}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-teal-100 dark:ring-teal-900"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-teal-500 via-cyan-500 to-blue-500 flex items-center justify-center shadow-lg ring-2 ring-teal-100 dark:ring-teal-900">
                      <span className="text-white font-bold text-sm">
                        {user.name?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"></div>
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0 text-left">
                  <h4 className={`font-bold truncate ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {user.name}
                  </h4>
                  <p className={`text-sm truncate ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {user.email}
                  </p>
                </div>

                {/* Role Badge */}
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize shrink-0 ${
                  isDarkMode 
                    ? 'bg-teal-900/50 text-teal-300 border border-teal-700' 
                    : 'bg-teal-100 text-teal-700 border border-teal-200'
                }`}>
                  {user.role}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default FindContactsModal;
