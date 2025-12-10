import { useTheme } from '../../contexts/ThemeContext'
import { FaTimes } from 'react-icons/fa'

/**
 * BaseModal Component
 * Reusable modal wrapper that eliminates code duplication across all modals
 * 
 * @param {boolean} isOpen - Modal visibility state
 * @param {Function} onClose - Close modal handler
 * @param {React.ReactNode} children - Modal content
 * @param {string} title - Modal title (optional)
 * @param {boolean} showCloseButton - Show close button in header (default: true)
 * @param {string} size - Modal size: 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', 'full' (default: '2xl')
 * @param {boolean} closeOnBackdropClick - Close modal when clicking backdrop (default: true)
 * @param {string} className - Additional classes for modal content
 * @param {React.ReactNode} footer - Optional footer content
 * @param {boolean} noPadding - Remove default padding from content area (default: false)
 */
const BaseModal = ({
  isOpen,
  onClose,
  children,
  title,
  showCloseButton = true,
  size = '2xl',
  closeOnBackdropClick = true,
  className = '',
  footer,
  noPadding = false
}) => {
  const { isDarkMode } = useTheme()

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full mx-4'
  }

  const handleBackdropClick = () => {
    if (closeOnBackdropClick) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative rounded-2xl shadow-2xl w-full ${sizeClasses[size]} transform transition-all ${
            isDarkMode
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700'
              : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
          } ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div
              className={`flex items-center justify-between p-6 border-b ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              {title && (
                <h2
                  className={`text-2xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className={`ml-auto p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                      : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                  }`}
                  aria-label="Close modal"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className={noPadding ? '' : 'p-6'}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div
              className={`flex items-center justify-end gap-3 p-6 pt-0 border-t ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BaseModal
