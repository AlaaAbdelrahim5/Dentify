import { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { FaTooth, FaExclamationTriangle, FaCheck, FaTimes, FaInfo } from 'react-icons/fa'

/**
 * Interactive Tooth Chart Component
 * Universal Numbering System (1-32 for adults)
 * 
 * Quadrants:
 * Upper Right (1-8) | Upper Left (9-16)
 * Lower Right (17-24) | Lower Left (25-32)
 */

const ToothChart = ({ selectedTeeth = [], onToothSelect, readOnly = false, toothConditions = {} }) => {
  const { isDarkMode } = useTheme()
  const [hoveredTooth, setHoveredTooth] = useState(null)

  // Define tooth positions and types
  const upperRight = [
    { number: 1, name: '3rd Molar', type: 'molar' },
    { number: 2, name: '2nd Molar', type: 'molar' },
    { number: 3, name: '1st Molar', type: 'molar' },
    { number: 4, name: '2nd Premolar', type: 'premolar' },
    { number: 5, name: '1st Premolar', type: 'premolar' },
    { number: 6, name: 'Canine', type: 'canine' },
    { number: 7, name: 'Lateral Incisor', type: 'incisor' },
    { number: 8, name: 'Central Incisor', type: 'incisor' }
  ]

  const upperLeft = [
    { number: 9, name: 'Central Incisor', type: 'incisor' },
    { number: 10, name: 'Lateral Incisor', type: 'incisor' },
    { number: 11, name: 'Canine', type: 'canine' },
    { number: 12, name: '1st Premolar', type: 'premolar' },
    { number: 13, name: '2nd Premolar', type: 'premolar' },
    { number: 14, name: '1st Molar', type: 'molar' },
    { number: 15, name: '2nd Molar', type: 'molar' },
    { number: 16, name: '3rd Molar', type: 'molar' }
  ]

  const lowerRight = [
    { number: 32, name: '3rd Molar', type: 'molar' },
    { number: 31, name: '2nd Molar', type: 'molar' },
    { number: 30, name: '1st Molar', type: 'molar' },
    { number: 29, name: '2nd Premolar', type: 'premolar' },
    { number: 28, name: '1st Premolar', type: 'premolar' },
    { number: 27, name: 'Canine', type: 'canine' },
    { number: 26, name: 'Lateral Incisor', type: 'incisor' },
    { number: 25, name: 'Central Incisor', type: 'incisor' }
  ]

  const lowerLeft = [
    { number: 24, name: 'Central Incisor', type: 'incisor' },
    { number: 23, name: 'Lateral Incisor', type: 'incisor' },
    { number: 22, name: 'Canine', type: 'canine' },
    { number: 21, name: '1st Premolar', type: 'premolar' },
    { number: 20, name: '2nd Premolar', type: 'premolar' },
    { number: 19, name: '1st Molar', type: 'molar' },
    { number: 18, name: '2nd Molar', type: 'molar' },
    { number: 17, name: '3rd Molar', type: 'molar' }
  ]

  const getToothCondition = (toothNumber) => {
    return toothConditions[toothNumber]
  }

  const getToothColor = (toothNumber) => {
    const condition = getToothCondition(toothNumber)
    const isSelected = selectedTeeth.includes(toothNumber)
    
    if (condition) {
      switch (condition.status) {
        case 'healthy':
          return isDarkMode ? 'bg-green-900/30 text-green-400 border-green-600' : 'bg-green-100 text-green-700 border-green-400'
        case 'cavity':
          return isDarkMode ? 'bg-orange-900/30 text-orange-400 border-orange-600' : 'bg-orange-100 text-orange-700 border-orange-400'
        case 'root-canal':
          return isDarkMode ? 'bg-red-900/30 text-red-400 border-red-600' : 'bg-red-100 text-red-700 border-red-400'
        case 'crown':
          return isDarkMode ? 'bg-blue-900/30 text-blue-400 border-blue-600' : 'bg-blue-100 text-blue-700 border-blue-400'
        case 'extracted':
          return isDarkMode ? 'bg-gray-900/30 text-gray-500 border-gray-600 line-through' : 'bg-gray-100 text-gray-500 border-gray-400 line-through'
        case 'implant':
          return isDarkMode ? 'bg-purple-900/30 text-purple-400 border-purple-600' : 'bg-purple-100 text-purple-700 border-purple-400'
        default:
          return isSelected 
            ? 'bg-teal-600 text-white border-teal-600 shadow-lg' 
            : isDarkMode 
              ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:border-teal-500' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-teal-50 hover:border-teal-400'
      }
    }
    
    return isSelected 
      ? 'bg-teal-600 text-white border-teal-600 shadow-lg' 
      : isDarkMode 
        ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:border-teal-500' 
        : 'bg-white text-gray-700 border-gray-300 hover:bg-teal-50 hover:border-teal-400'
  }

  const getToothSize = (type) => {
    switch (type) {
      case 'molar':
        return 'w-14 h-18'
      case 'premolar':
        return 'w-12 h-16'
      case 'canine':
        return 'w-11 h-16'
      case 'incisor':
        return 'w-10 h-14'
      default:
        return 'w-12 h-16'
    }
  }

  const handleToothClick = (toothNumber) => {
    if (!readOnly && onToothSelect) {
      onToothSelect(toothNumber)
    }
  }

  const ToothButton = ({ tooth }) => {
    const condition = getToothCondition(tooth.number)
    const isHovered = hoveredTooth === tooth.number
    
    return (
      <div className="relative group">
        <button
          onClick={() => handleToothClick(tooth.number)}
          onMouseEnter={() => setHoveredTooth(tooth.number)}
          onMouseLeave={() => setHoveredTooth(null)}
          disabled={readOnly && !condition}
          className={`
            ${getToothSize(tooth.type)}
            ${getToothColor(tooth.number)}
            border-2 rounded-xl
            flex flex-col items-center justify-center
            transition-all duration-200
            ${!readOnly ? 'cursor-pointer transform hover:scale-110 hover:shadow-lg' : condition ? 'cursor-help' : 'cursor-default'}
            ${selectedTeeth.includes(tooth.number) ? 'ring-4 ring-teal-400/50 scale-105' : ''}
            relative font-semibold
          `}
        >
          <FaTooth className="text-2xl mb-1.5" />
          <span className="text-sm font-bold tracking-wide">{tooth.number}</span>
          
          {condition && (
            <div className="absolute -top-1.5 -right-1.5 bg-white dark:bg-gray-800 rounded-full p-1">
              {condition.status === 'cavity' && (
                <FaExclamationTriangle className="w-3.5 h-3.5 text-orange-500" />
              )}
              {condition.status === 'root-canal' && (
                <FaExclamationTriangle className="w-3.5 h-3.5 text-red-500" />
              )}
              {condition.status === 'crown' && (
                <FaCheck className="w-3.5 h-3.5 text-blue-500" />
              )}
              {condition.status === 'healthy' && (
                <FaCheck className="w-3.5 h-3.5 text-green-500" />
              )}
            </div>
          )}
        </button>
        
        {/* Tooltip */}
        {isHovered && (
          <div className={`
            absolute z-50 bottom-full mb-3 left-1/2 transform -translate-x-1/2
            px-4 py-3 rounded-xl shadow-2xl whitespace-nowrap text-sm pointer-events-none
            ${isDarkMode ? 'bg-gray-900 text-white border-2 border-gray-700' : 'bg-white text-gray-900 border-2 border-gray-200'}
          `}>
            <div className="font-bold text-base mb-1">Tooth #{tooth.number}</div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{tooth.name}</div>
            {condition && (
              <>
                <div className="h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent my-2"></div>
                <div className="text-sm font-semibold capitalize flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    condition.status === 'healthy' ? 'bg-green-500' :
                    condition.status === 'cavity' ? 'bg-orange-500' :
                    condition.status === 'root-canal' ? 'bg-red-500' :
                    condition.status === 'crown' ? 'bg-blue-500' :
                    condition.status === 'implant' ? 'bg-purple-500' :
                    'bg-gray-500'
                  }`}></div>
                  <span className="text-teal-500">{condition.status.replace('-', ' ')}</span>
                </div>
              </>
            )}
            {/* Arrow */}
            <div className={`absolute top-full left-1/2 transform -translate-x-1/2 -mt-px`}>
              <div className={`w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent ${
                isDarkMode ? 'border-t-gray-700' : 'border-t-gray-200'
              }`}></div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`p-8 rounded-2xl ${
      isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
    }`}>
      {/* Title */}
      <div className="mb-6 text-center">
        <h3 className={`text-xl font-bold mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          Dental Chart
        </h3>
        <p className={`text-sm ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Click on teeth to select • Hover for details
        </p>
      </div>

      {/* Legend */}
      <div className={`mb-8 p-4 rounded-xl ${
        isDarkMode ? 'bg-gray-900/50 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <FaInfo className={`${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
          <span className={`text-sm font-semibold ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Condition Legend
          </span>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full shadow-sm"></div>
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Healthy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full shadow-sm"></div>
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Cavity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm"></div>
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Root Canal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full shadow-sm"></div>
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Crown</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded-full shadow-sm"></div>
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Implant</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded-full shadow-sm"></div>
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Extracted</span>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {/* Upper Jaw */}
        <div className="space-y-4">
          <div className={`text-base font-bold text-center mb-6 flex items-center justify-center gap-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <div className={`h-px flex-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            <span className="px-4">Upper Jaw</span>
            <div className={`h-px flex-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          </div>
          <div className="flex justify-center gap-12">
            {/* Upper Right */}
            <div>
              <div className={`text-sm font-semibold text-center mb-4 px-3 py-1 rounded-full inline-block ${
                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}>
                Right
              </div>
              <div className="flex gap-2">
                {upperRight.map(tooth => (
                  <ToothButton key={tooth.number} tooth={tooth} />
                ))}
              </div>
            </div>
            
            {/* Upper Left */}
            <div>
              <div className={`text-sm font-semibold text-center mb-4 px-3 py-1 rounded-full inline-block ${
                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}>
                Left
              </div>
              <div className="flex gap-2">
                {upperLeft.map(tooth => (
                  <ToothButton key={tooth.number} tooth={tooth} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className={`border-t-2 border-dashed ${
            isDarkMode ? 'border-gray-700' : 'border-gray-300'
          }`}></div>
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full text-xs font-semibold ${
            isDarkMode ? 'bg-gray-800 text-gray-400 border border-gray-700' : 'bg-gray-50 text-gray-600 border border-gray-300'
          }`}>
            Bite Line
          </div>
        </div>

        {/* Lower Jaw */}
        <div className="space-y-4">
          <div className={`text-base font-bold text-center mb-6 flex items-center justify-center gap-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <div className={`h-px flex-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            <span className="px-4">Lower Jaw</span>
            <div className={`h-px flex-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          </div>
          <div className="flex justify-center gap-12">
            {/* Lower Right */}
            <div>
              <div className="flex gap-2 mb-4">
                {lowerRight.map(tooth => (
                  <ToothButton key={tooth.number} tooth={tooth} />
                ))}
              </div>
              <div className={`text-sm font-semibold text-center px-3 py-1 rounded-full inline-block ${
                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}>
                Right
              </div>
            </div>
            
            {/* Lower Left */}
            <div>
              <div className="flex gap-2 mb-4">
                {lowerLeft.map(tooth => (
                  <ToothButton key={tooth.number} tooth={tooth} />
                ))}
              </div>
              <div className={`text-sm font-semibold text-center px-3 py-1 rounded-full inline-block ${
                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}>
                Left
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Teeth Info */}
      {!readOnly && selectedTeeth.length > 0 && (
        <div className={`mt-8 p-5 rounded-xl shadow-lg ${
          isDarkMode ? 'bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border-2 border-teal-700/50' : 'bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${
              isDarkMode ? 'bg-teal-900/50' : 'bg-teal-100'
            }`}>
              <FaInfo className="text-teal-500 text-lg" />
            </div>
            <div>
              <span className={`text-base font-bold ${
                isDarkMode ? 'text-teal-400' : 'text-teal-700'
              }`}>
                Selected Teeth
              </span>
              <p className={`text-xs ${
                isDarkMode ? 'text-teal-300/70' : 'text-teal-600/70'
              }`}>
                {selectedTeeth.length} {selectedTeeth.length === 1 ? 'tooth' : 'teeth'} selected
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTeeth.sort((a, b) => a - b).map(toothNumber => (
              <span
                key={toothNumber}
                className={`px-4 py-2 rounded-lg text-sm font-bold shadow-sm ${
                  isDarkMode 
                    ? 'bg-teal-900/60 text-teal-300 border-2 border-teal-700' 
                    : 'bg-white text-teal-700 border-2 border-teal-300'
                }`}
              >
                #{toothNumber}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ToothChart
