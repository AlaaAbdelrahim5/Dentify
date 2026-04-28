import { useState, useEffect } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { FaTooth, FaExclamationTriangle, FaCheck, FaTimes, FaInfo } from 'react-icons/fa'

/**
 * Interactive Tooth Chart Component with SVG
 * Universal Numbering System (1-32 for adults)
 * 
 * Quadrants:
 * Upper Right (1-8) | Upper Left (9-16)
 * Lower Right (17-24) | Lower Left (25-32)
 */

const ToothChart = ({ selectedTeeth = [], onToothSelect, readOnly = false, toothConditions = {} }) => {
  const { isDarkMode } = useTheme()
  const [hoveredTooth, setHoveredTooth] = useState(null)
  const [svgLoaded, setSvgLoaded] = useState(false)

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
    
    // If tooth has history (dentist worked on it), show in teal/purple color
    if (condition && condition.hasHistory) {
      return isSelected 
        ? 'bg-teal-600 text-white border-teal-600 shadow-lg' 
        : isDarkMode 
          ? 'bg-purple-900/30 text-purple-400 border-purple-600 hover:bg-purple-800/40' 
          : 'bg-purple-100 text-purple-700 border-purple-400 hover:bg-purple-200'
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
        return 'w-11 h-14 sm:w-12 sm:h-16'
      case 'premolar':
        return 'w-10 h-12 sm:w-11 sm:h-14'
      case 'canine':
        return 'w-9 h-12 sm:w-10 sm:h-14'
      case 'incisor':
        return 'w-8 h-11 sm:w-9 sm:h-12'
      default:
        return 'w-10 h-12 sm:w-11 sm:h-14'
    }
  }

  // Apply SVG interactions after component mount
  useEffect(() => {
    const svgElement = document.querySelector('#toothChartSvg')
    if (!svgElement) return

    const handleClick = (e) => {
      const tooth = e.target.closest('[data-key]')
      if (tooth) {
        const toothNumber = parseInt(tooth.getAttribute('data-key'))
        handleToothClick(toothNumber)
      }
    }

    const handleMouseEnter = (e) => {
      const tooth = e.target.closest('[data-key]')
      if (tooth) {
        const toothNumber = parseInt(tooth.getAttribute('data-key'))
        setHoveredTooth(toothNumber)
      }
    }

    const handleMouseLeave = (e) => {
      const tooth = e.target.closest('[data-key]')
      if (tooth) {
        setHoveredTooth(null)
      }
    }

    // Add event listeners to SVG element
    svgElement.addEventListener('click', handleClick)
    svgElement.addEventListener('mouseenter', handleMouseEnter, true)
    svgElement.addEventListener('mouseleave', handleMouseLeave, true)

    setSvgLoaded(true)

    // Cleanup
    return () => {
      svgElement.removeEventListener('click', handleClick)
      svgElement.removeEventListener('mouseenter', handleMouseEnter, true)
      svgElement.removeEventListener('mouseleave', handleMouseLeave, true)
    }
  }, [readOnly, onToothSelect])

  // Update tooth colors based on selection and conditions
  useEffect(() => {
    const svgElement = document.querySelector('#toothChartSvg')
    if (!svgElement) return

    const teeth = svgElement.querySelectorAll('[data-key]')
    teeth.forEach(tooth => {
      const toothNumber = parseInt(tooth.getAttribute('data-key'))
      const condition = getToothCondition(toothNumber)
      const isSelected = selectedTeeth.includes(toothNumber)
      
      let fillColor = '#FFFFFF' // Default white
      let strokeColor = '#d1d5db' // Default stroke
      
      if (isSelected) {
        fillColor = '#14b8a6' // Teal for selected
        strokeColor = '#0d9488' // Darker teal stroke
      } else if (condition && condition.hasHistory) {
        fillColor = isDarkMode ? '#a78bfa' : '#c4b5fd' // Purple for worked on
        strokeColor = isDarkMode ? '#8b5cf6' : '#a78bfa'
      } else {
        fillColor = isDarkMode ? '#6b7280' : '#f3f4f6' // Gray for default
        strokeColor = isDarkMode ? '#9ca3af' : '#d1d5db'
      }
      
      tooth.setAttribute('fill', fillColor)
      tooth.setAttribute('stroke', strokeColor)
      tooth.setAttribute('stroke-width', isSelected ? '3' : '2')
      tooth.style.pointerEvents = 'all'
      tooth.style.cursor = readOnly ? 'help' : 'pointer'
    })
  }, [selectedTeeth, toothConditions, isDarkMode, readOnly])

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
            border-2 rounded-lg sm:rounded-xl
            flex flex-col items-center justify-center
            transition-all duration-200
            ${!readOnly ? 'cursor-pointer transform hover:scale-110 hover:shadow-lg' : condition ? 'cursor-help' : 'cursor-default'}
            ${selectedTeeth.includes(tooth.number) ? 'ring-2 sm:ring-4 ring-teal-400/50 scale-105' : ''}
            relative font-semibold
          `}
        >
          <FaTooth className="text-lg sm:text-xl md:text-2xl mb-0.5 sm:mb-1" />
          <span className="text-xs sm:text-sm font-bold tracking-wide">{tooth.number}</span>
          
          {condition && condition.conditionCount && (
            <div className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-teal-600 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-lg">
              {condition.conditionCount}
            </div>
          )}
        </button>
        
        {/* Tooltip */}
        {isHovered && (
          <div className={`
            absolute z-50 bottom-full mb-3 left-1/2 transform -translate-x-1/2
            px-4 py-3 rounded-xl shadow-2xl text-sm pointer-events-none max-w-xs
            ${isDarkMode ? 'bg-gray-900 text-white border-2 border-gray-700' : 'bg-white text-gray-900 border-2 border-gray-200'}
          `}>
            <div className="font-bold text-base mb-1">Tooth #{tooth.number}</div>
            <div className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{tooth.name}</div>
            {condition && condition.allConditions && condition.allConditions.length > 0 && (
              <>
                <div className="h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent my-2"></div>
                <div className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {condition.conditionCount} {condition.conditionCount === 1 ? 'Condition' : 'Conditions'} Recorded:
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {condition.allConditions.map((cond, index) => (
                    <div key={index} className={`flex items-start gap-2 p-2 rounded-lg ${
                      isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                        cond.status === 'healthy' ? 'bg-green-500' :
                        cond.status === 'cavity' ? 'bg-orange-500' :
                        cond.status.includes('root') ? 'bg-red-500' :
                        cond.status === 'crown' ? 'bg-blue-500' :
                        cond.status === 'implant' ? 'bg-purple-500' :
                        cond.status === 'bridge' ? 'bg-indigo-500' :
                        cond.status === 'extraction' || cond.status === 'extracted' ? 'bg-gray-500' :
                        'bg-yellow-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold capitalize text-teal-500">
                          {cond.status.replace('-', ' ')}
                        </div>
                        {cond.treatment && (
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {cond.treatment}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
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

  // Get tooth info for tooltip
  const getToothInfo = (toothNumber) => {
    const toothNames = {
      1: '3rd Molar', 2: '2nd Molar', 3: '1st Molar', 4: '2nd Premolar', 5: '1st Premolar', 6: 'Canine', 7: 'Lateral Incisor', 8: 'Central Incisor',
      9: 'Central Incisor', 10: 'Lateral Incisor', 11: 'Canine', 12: '1st Premolar', 13: '2nd Premolar', 14: '1st Molar', 15: '2nd Molar', 16: '3rd Molar',
      17: '3rd Molar', 18: '2nd Molar', 19: '1st Molar', 20: '2nd Premolar', 21: '1st Premolar', 22: 'Canine', 23: 'Lateral Incisor', 24: 'Central Incisor',
      25: 'Central Incisor', 26: 'Lateral Incisor', 27: 'Canine', 28: '1st Premolar', 29: '2nd Premolar', 30: '1st Molar', 31: '2nd Molar', 32: '3rd Molar'
    }
    return toothNames[toothNumber] || 'Tooth'
  }

  return (
    <div className={`p-4 sm:p-6 lg:p-8 rounded-2xl w-full max-w-full overflow-x-auto ${
      isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
    }`}>
      {/* Title */}
      <div className="mb-4 sm:mb-6 text-center">
        <h3 className={`text-xl font-bold mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          Dental Chart (Universal Numbering System)
        </h3>
        <p className={`text-sm ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Click on teeth to select • Hover for details
        </p>
      </div>

      {/* Legend */}
      <div className={`mb-6 sm:mb-8 p-3 sm:p-4 rounded-xl ${
        isDarkMode ? 'bg-gray-900/50 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <FaInfo className={`${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
          <span className={`text-sm font-semibold ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Tooth Status Legend
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full shadow-sm ${
              isDarkMode ? 'bg-purple-900/50 border-2 border-purple-600' : 'bg-purple-100 border-2 border-purple-400'
            }`}></div>
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Worked On (Has History)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full shadow-sm bg-teal-600`}></div>
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full shadow-sm ${
              isDarkMode ? 'bg-gray-800 border-2 border-gray-600' : 'bg-white border-2 border-gray-300'
            }`}></div>
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>No History</span>
          </div>
        </div>
        <div className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>Note:</strong> Purple/colored teeth indicate you have worked on them. Click to see all conditions.
          </p>
        </div>
      </div>

      {/* SVG Tooth Chart and Info Side by Side */}
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {/* SVG Tooth Chart */}
        <div className="relative flex justify-center items-center flex-1">
          <style dangerouslySetInnerHTML={{__html: `
            .tooth-chart-svg polygon, .tooth-chart-svg path {
              transition: fill 0.25s, stroke 0.25s, filter 0.2s;
              cursor: pointer;
            }
            .tooth-chart-svg polygon:hover, .tooth-chart-svg path:hover {
              filter: brightness(1.3);
            }
          `}} />
          
          <svg 
            id="toothChartSvg"
            className="tooth-chart-svg w-full max-w-md h-auto mx-auto"
            version="1.1" 
            xmlns="http://www.w3.org/2000/svg" 
            xmlnsXlink="http://www.w3.org/1999/xlink" 
            viewBox="0 0 450 700" 
            enableBackground="new 0 0 450 700" 
            xmlSpace="preserve"
          >
          <g id="toothLabels">
            <text transform="matrix(1 0 0 1 97.9767 402.1409)" fontFamily="Avenir-Heavy" fontSize="21px" fill={isDarkMode ? '#d1d5db' : '#374151'}>32</text>
            <text transform="matrix(1 0 0 1 94.7426 449.1693)" fontFamily="Avenir-Heavy" fontSize="21px" fill={isDarkMode ? '#d1d5db' : '#374151'}>31</text>
            <text transform="matrix(1 0 0 1 106.0002 495.5433)" fontFamily="Avenir-Heavy" fontSize="21px" fill={isDarkMode ? '#d1d5db' : '#374151'}>30</text>
            <text transform="matrix(1 0 0 1 118.0002 538.667)" fontFamily="Avenir-Heavy" fontSize="21px" fill={isDarkMode ? '#d1d5db' : '#374151'}>29</text>
            <text transform="matrix(0.9999 -1.456241e-02 1.456241e-02 0.9999 136.4086 573.5098)" fontFamily="Avenir-Heavy" fontSize="21px" fill={isDarkMode ? '#d1d5db' : '#374151'}>28</text>
            <text transform="matrix(1 0 0 1 157.3335 603.8164)" fontFamily="Avenir-Heavy" fontSize="17px" fill={isDarkMode ? '#d1d5db' : '#374151'}>27</text>
            <text transform="matrix(1 0 0 1 179.3335 623.8164)" fontFamily="Avenir-Heavy" fontSize="18px" fill={isDarkMode ? '#d1d5db' : '#374151'}>26</text>
            <text transform="matrix(1 0 0 1 204.6669 628.483)" fontFamily="Avenir-Heavy" fontSize="18px" fill={isDarkMode ? '#d1d5db' : '#374151'}>25</text>
            <text transform="matrix(1 0 0 1 231.3335 628.1497)" fontFamily="Avenir-Heavy" fontSize="18px" fill={isDarkMode ? '#d1d5db' : '#374151'}>24</text>
            <text transform="matrix(1 0 0 1 256.3335 619.1497)" fontFamily="Avenir-Heavy" fontSize="17px" fill={isDarkMode ? '#d1d5db' : '#374151'}>23</text>
            <text transform="matrix(1 0 0 1 276.3335 602.483)" fontFamily="Avenir-Heavy" fontSize="18px" fill={isDarkMode ? '#d1d5db' : '#374151'}>22</text>
            <text transform="matrix(1 0 0 1 286.6669 573.1497)" fontFamily="Avenir-Heavy" fontSize="21px" fill={isDarkMode ? '#d1d5db' : '#374151'}>21</text>
            <text transform="matrix(1 0 0 1 303.6327 538.667)" fontFamily="Avenir-Heavy" fontSize="21px" fill={isDarkMode ? '#d1d5db' : '#374151'}>20</text>
            <text transform="matrix(1 0 0 1 322.983 495.5432)" fontFamily="Avenir-Heavy" fontSize="21px" fill={isDarkMode ? '#d1d5db' : '#374151'}>19</text>
            <text transform="matrix(1 0 0 1 325.1251 449.1686)" fontFamily="Avenir-Heavy" fontSize="21px" fill={isDarkMode ? '#d1d5db' : '#374151'}>18</text>
            <text transform="matrix(1 0 0 1 324.0004 402.1405)" fontFamily="Avenir-Heavy" fontSize="21px" fill={isDarkMode ? '#d1d5db' : '#374151'}>17</text>
            <text transform="matrix(1 0 0 1 312.8534 324.1021)" fontFamily="Avenir-Heavy" fontSize="21px" fill={isDarkMode ? '#d1d5db' : '#374151'}>16</text>
            <text transform="matrix(1 0 0 1 315.3335 275.3333)" fontFamily="Avenir-Heavy" fontSize="21px" fill={isDarkMode ? '#d1d5db' : '#374151'}>15</text>
            <text transform="matrix(1 0 0 1 311.3335 236)" fontFamily="Avenir-Heavy" fontSize="21px" fill={isDarkMode ? '#d1d5db' : '#374151'}>14</text>
            <text transform="matrix(1 0 0 1 300.3335 200.6667)" fontFamily="Avenir-Heavy" fontSize="21px" fill={isDarkMode ? '#d1d5db' : '#374151'}>13</text>
            <text transform="matrix(1 0 0 1 286.6669 172)" fontFamily="Avenir-Heavy" fontSize="21px" fill={isDarkMode ? '#d1d5db' : '#374151'}>12</text>
            <text transform="matrix(1 0 0 1 270.2269 142.439)" fontFamily="Avenir-Heavy" fontSize="21px" fill={isDarkMode ? '#d1d5db' : '#374151'}>11</text>
            <text transform="matrix(1 0 0 1 247.5099 118.9722)" fontFamily="Avenir-Heavy" fontSize="21px" fill={isDarkMode ? '#d1d5db' : '#374151'}>10</text>
            <text transform="matrix(1 0 0 1 227.8432 112.9722)" fontFamily="Avenir-Heavy" fontSize="21px" fill={isDarkMode ? '#d1d5db' : '#374151'}>9</text>
            <text transform="matrix(1 0 0 1 200.1766 112.9722)" fontFamily="Avenir-Heavy" fontSize="21px" fill={isDarkMode ? '#d1d5db' : '#374151'}>8</text>
            <text transform="matrix(1 0 0 1 170.5099 117.6388)" fontFamily="Avenir-Heavy" fontSize="21px" fill={isDarkMode ? '#d1d5db' : '#374151'}>7</text>
            <text transform="matrix(1 0 0 1 148.6667 134.167)" fontFamily="Avenir-Heavy" fontSize="21px" fill={isDarkMode ? '#d1d5db' : '#374151'}>6</text>
            <text transform="matrix(1 0 0 1 131.3605 164.8335)" fontFamily="Avenir-Heavy" fontSize="21px" fill={isDarkMode ? '#d1d5db' : '#374151'}>5</text>
            <text transform="matrix(1 0 0 1 119.3927 195.6387)" fontFamily="Avenir-Heavy" fontSize="21px" fill={isDarkMode ? '#d1d5db' : '#374151'}>4</text>
            <text transform="matrix(1 0 0 1 103.8631 234.4391)" fontFamily="Avenir-Heavy" fontSize="21px" fill={isDarkMode ? '#d1d5db' : '#374151'}>3</text>
            <text transform="matrix(1 0 0 1 96.2504 275.9999)" fontFamily="Avenir-Heavy" fontSize="21px" fill={isDarkMode ? '#d1d5db' : '#374151'}>2</text>
            <text transform="matrix(1 0 0 1 93.9767 324.769)" fontFamily="Avenir-Heavy" fontSize="21px" fill={isDarkMode ? '#d1d5db' : '#374151'}>1</text>
          </g>
          <g id="spots">
            <polygon id="Tooth32" fill="#FFFFFF" data-key="32" points="66.7,369.7 59,370.3 51,373.7 43.7,384.3 42.3,392 38.7,406 41,415.3 44.3,420.3 47.3,424 51.7,424.3 57.7,424 62.3,422.7 66.7,422.7 71,424.3 76.3,422.7 80.7,419.3 84.7,412.3 85.3,405 87.3,391.7 85,380 80.7,375 73.7,371.3" />
            <polygon id="Tooth31" fill="#FFFFFF" data-key="31" points="76,425.7 80.3,427.7 83.3,433 85.3,447.7 84.3,458.7 79.7,472.3 73,475 50.3,479.7 46.7,476.7 37.7,446.3 39.7,438.3 43.3,432 49,426.7 56,424.7 65,424.7" />
            <polygon id="Tooth30" fill="#FFFFFF" data-key="30" points="78.7,476 85,481 90.3,488.3 96.3,499.3 97.7,511.3 93,522 86,526.3 67,533 60.3,529.7 56.3,523.7 51.7,511 47.7,494.7 47.7,488.3 50.3,483.3 55,479.7 67,476.7" />
            <polygon id="Tooth29" fill="#FFFFFF" data-key="29" points="93.3,525 99.3,527.3 108.3,536 114,546.7 115.7,559.3 114.3,567.3 106.3,573 98.3,578.3 88,579 82,575 75,565 69.3,552.3 67.3,542 69.7,536 74.3,531.7 84.3,528.3" />
            <path id="Tooth28" fill="#FFFFFF" data-key="28" d="M117.3,569.7l7.7,1.3l6.3,3.7l6.3,7.7l4,8.3L144,602l-1.3,6.7l-6.7,6.7l-7.7,3.3l-7.3-1l-7-3l-7.3-7l-5-9l-2-10c0,0-0.7-7,0.3-7.3c1-0.3,5.3-6.7,5.3-6.7l9-5H117.3z"/>
            <polygon id="Tooth27" fill="#FFFFFF" data-key="27" points="155.7,611 160.3,615.3 165,624.7 161.7,634.3 156,641.3 149,644 140.7,644.3 133.3,641.3 128.7,634.7 128.7,629 132.7,621.3 137.7,615 143.7,611 149.7,610" />
            <polygon id="Tooth26" fill="#FFFFFF" data-key="26" points="178.3,627 186,629 187.7,633.7 188.7,644 189,657 189.3,662.7 186.3,663.7 176.7,663 168,656.3 159.3,649.7 156.7,644 162,639.3" />
            <polygon id="Tooth25" fill="#FFFFFF" data-key="25" points="214,637 218,642.7 223,654.3 225.7,664 225.3,666.3 219,668.3 206.7,668 196,665.7 190.3,662.7 193,657.3 199.7,647.3 207,638 210.7,635.5" />
            <path id="Tooth24" fill="#FFFFFF" data-key="24" d="M235.3,637c0,0,3-2,4-2.3c1-0.3,4.3,0,4.3,0l5,4.3l5.3,7.3l3.3,6.7l2,7.3l-2,3l-7.7,2.7l-10,0.3h-10l-2-6.7l2.7-7.3L235.3,637z"/>
            <polygon id="Tooth23" fill="#FFFFFF" data-key="23" points="269.3,624 273.3,624.7 275.3,627.3 279,628.7 281.7,631.3 285.3,634.7 289.3,638.3 292,643.3 291.3,650 287,655 280.7,658.7 272,660 265,660.7 261.3,657.3 261.7,650 263.7,637 264.3,627" />
            <polygon id="Tooth22" fill="#FFFFFF" data-key="22" points="286,629.3 286.7,633.3 291.3,638.7 295.3,642.3 302,644 311.7,643.3 318.3,637.7 321,630 321.3,620.3 317,614.3 308,608 298.3,607 291,609.3 287,612.3 286.7,617.7 287.3,624.7" />
            <polygon id="Tooth21" fill="#FFFFFF" data-key="21" points="331,565.7 335,565.7 341.3,568 349.3,574.3 352.3,578.3 352.7,583.7 350.7,593.7 342.7,604 337.7,609 328,612.7 320,613.3 315,611 308.3,604.7 306.7,598 307.3,591.3 309,584.7 312.7,578.3 318.3,571.7" />
            <polygon id="Tooth20" fill="#FFFFFF" data-key="20" points="334,561 338.7,566 346,570 354.7,573 360.7,571.7 368,568.3 383,545 385.3,532.7 381.3,524.3 374,520.7 363.7,516.3 356.3,515.3 351.3,518.3 346.3,524 340.3,534.3 336,546.7" />
            <path id="Tooth19" fill="#FFFFFF" data-key="19" d="M398,470l4.7,5.7l3,7.7l-0.3,11.7l-6,13.3l-6.3,10.3l-8.3,4.3l-7.3-1l-16.3-7c0,0-2.7-6-3-7.3c-0.3-1.3-0.3-11-0.3-11l3.7-14.3l3.7-7l5.3-6.7l8-2l9.7-0.7L398,470z"/>
            <polygon id="Tooth18" fill="#FFFFFF" data-key="18" points="410,435 408.7,447.3 404.3,459 399.3,467.7 393.7,468 388,466 376.3,466.3 369.7,466.3 365.7,460 364.7,444.7 366.3,434.3 369,424 378.3,417.3 386.7,415.7 391.7,415.3 396,418 399.7,418 404,421.7 407.7,427.3" />
            <polygon id="Tooth17" fill="#FFFFFF" data-key="17" points="371.7,417 378.3,417.3 386.7,415.7 391.7,415.3 397.3,417.7 402.7,416.3 407.7,409.7 406.7,395 401,377.7 397.3,373 390.7,367.3 380,365 373,366.7 367.3,369 364,374.3 360,389 363.3,401.3 367.7,412.3" />
            <polygon id="Tooth16" fill="#FFFFFF" data-key="16" points="404.3,293.7 408.7,299.3 408.7,308 405.3,318.7 401,329.7 392.3,339.7 382.7,341 369,339.7 359,335 354.7,327.7 354.3,316 358.3,304 363.7,294 368.7,294.7 378.7,296 389,296" />
            <polygon id="Tooth15" fill="#FFFFFF" data-key="15" points="362.3,247.3 357.3,251 357,259.3 358.7,268 359.7,279.7 361.3,286.7 365,291.7 371,294.3 392,295 404.3,293.7 410,280.7 412,263.3 407.3,246.7 401,240.3 396,239.7 389.3,243" />
            <polygon id="Tooth14" fill="#FFFFFF" data-key="14" points="359.7,243.7 350.7,224 345.7,211.7 348.7,205 358.3,202.7 375.7,197 388.7,193 393,196 399.3,207 401.3,222.7 400,234.3 394.7,240.7 381.7,244.7 371,246" />
            <polygon id="Tooth13" fill="#FFFFFF" data-key="13" points="386,188.7 383.3,192.7 377.7,196 356.3,203.3 345.7,202.3 341.7,199.7 338.7,196.3 335,188.7 332,177 333.7,169.7 338,164.7 346.3,161 353.7,156.7 360.3,150.3 364,151 370.7,156.3 376.3,164.3 380,170.3 383.3,178.3" />
            <polygon id="Tooth12" fill="#FFFFFF" data-key="12" points="358.7,134.3 360.3,145.7 357.3,152.7 352,157.3 346.3,161 336,164 329.7,163.3 321.7,157.7 314.3,149 310.7,139.3 310,133.7 312.3,127 318.3,125.7 326,122 332.7,116 334.7,114.3 337.7,117.3 343.3,119.7 348.7,122.7 354.3,127.7" />
            <polygon id="Tooth11" fill="#FFFFFF" data-key="11" points="336,93.3 337.7,100 336,104.7 332.7,113.7 324.3,121.3 315.3,125.7 306.3,126 297.3,120.3 294,112 295.7,102.7 299,95 303.3,90 309.3,88 316.3,87.3 322.7,87.3 328,88.3" />
            <polygon id="Tooth10" fill="#FFFFFF" data-key="10" points="310.3,83.3 298,90.7 286,95 276.3,98.3 270.3,93.3 269,82.7 269,69.3 270,58.7 274.7,54.7 282,53 287.7,54.7 297.3,60.3 304,64.3 308.7,68.7 312.3,74 313,81" />
            <polygon id="Tooth9" fill="#FFFFFF" data-key="9" points="273.3,52 266.7,61.7 258.3,72.3 253.3,79.7 247.3,85 239,87.7 232.3,82 224.7,67 222,58.3 219,50 220,44.3 224.3,40.3 230,38.7 237.3,38.7 253,39.3 258.7,41.3 264.3,43.7 268.3,45.7" />
            <polygon id="Tooth8" fill="#FFFFFF" data-key="8" points="176.7,46.3 195,41 203.3,39.7 209.3,40.7 215.3,42.7 217,47 217.7,54.3 215,64.7 212.3,75.7 208,83 201.7,85.7 195.7,86.7 189.7,83.3 183.7,74.7 175,62 171.7,54 172.7,49.7" />
            <path id="Tooth7" fill="#FFFFFF" data-key="7" d="M167,55l6.7,6.3L174,68l0.3,8l1,10l-2,8.3l-4.7,4.3l-6.7,1.7l-8-4.3l-7.3-4.7l-9.3-4.7l-6.3-5.3l-1-4.3l1.3-5c0,0,3.3-6,4.3-6s5.3-6,6.3-6s10.3-4.7,10.3-4.7L167,55z"/>
            <polygon id="Tooth6" fill="#FFFFFF" data-key="6" points="126.3,82 134.3,86.3 139.7,92.3 144.7,104.7 145.7,115.3 143.7,120.7 138,124.3 131.3,125 121,125 114.7,119.3 110.3,112.3 108.3,104.7 108.7,94.7 110.7,88.7 116,84" />
            <polygon id="Tooth5" fill="#FFFFFF" data-key="5" points="109,116.7 116,122.3 122.7,125.3 127.7,131.3 128.3,141 122.7,153.7 114,161.7 105.7,162.3 96.7,161 85.7,156 82,150 81,139.3 86.3,128 93,121.3 100.7,117.3" />
            <polygon id="Tooth4" fill="#FFFFFF" data-key="4" points="82,155.3 102.3,163.3 108.7,172 109.3,182 104.7,192 100,199 94,203.7 85.3,201.7 73.7,201 64.3,196.7 60.3,190.7 59,183.3 61.7,175.3 66.3,167.7 71.3,161.3" />
            <path id="Tooth3" fill="#FFFFFF" data-key="3" d="M92.7,207.3l2,5.3l-1.7,8l-1.7,9l-4,8l-5,7.7l-11,4.7l-13.7,0.7l-10-7l-1.7-5L45,220l3-10.7l5-7.3l4-3.3l4.7-2.7l5.3,3.7l6.7,1.3c0,0,7.3,1.3,9.3,1.3s6.3,0.7,6.3,0.7L92.7,207.3z"/>
            <polygon id="Tooth2" fill="#FFFFFF" data-key="2" points="79.7,288.3 71.7,291 55,293 40.3,291.3 36,287 33,273.7 36.3,260 42,248.7 44.7,244.7 50.3,246.7 56,249 65.3,250.7 74,249.7 80.3,249.7 82.3,254 85.3,259.3 87,267.7 87.7,274.7 85.3,282.7" />
            <polygon id="Tooth1" fill="#FFFFFF" data-key="1" points="33,314.3 38,325.7 45.7,335.7 55.7,341.7 64.7,343 73.3,340 77.7,335.7 81.3,326.3 82,314.3 81.3,302 80.7,292.7 73.7,292 51.3,293.7 38.7,293.7 34,298 31.7,302.3 32,311" />
          </g>
        </svg>

        </div>

        {/* Tooth Information Panel */}
        <div className="shrink-0 w-full lg:w-80">
          {hoveredTooth ? (
            <div className={`
              p-4 rounded-xl shadow-lg text-sm h-full
              ${isDarkMode ? 'bg-gray-900 text-white border-2 border-gray-700' : 'bg-white text-gray-900 border-2 border-gray-200'}
            `}>
              <div className="font-bold text-lg mb-1 text-teal-500">Tooth #{hoveredTooth}</div>
              <div className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{getToothInfo(hoveredTooth)}</div>
              
              {toothConditions[hoveredTooth] && toothConditions[hoveredTooth].allConditions && toothConditions[hoveredTooth].allConditions.length > 0 ? (
                <>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent my-3"></div>
                  <div className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {toothConditions[hoveredTooth].conditionCount} {toothConditions[hoveredTooth].conditionCount === 1 ? 'Condition' : 'Conditions'} Recorded:
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {toothConditions[hoveredTooth].allConditions.map((cond, index) => (
                      <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${
                        isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                      }`}>
                        <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${
                          cond.status === 'healthy' ? 'bg-green-500' :
                          cond.status === 'cavity' ? 'bg-orange-500' :
                          cond.status.includes('root') ? 'bg-red-500' :
                          cond.status === 'crown' ? 'bg-blue-500' :
                          cond.status === 'implant' ? 'bg-purple-500' :
                          cond.status === 'bridge' ? 'bg-indigo-500' :
                          cond.status === 'extraction' || cond.status === 'extracted' ? 'bg-gray-500' :
                          'bg-yellow-500'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-base font-semibold capitalize text-teal-500">
                            {cond.status.replace('-', ' ')}
                          </div>
                          {cond.treatment && (
                            <div className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {cond.treatment}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No conditions recorded for this tooth.
                </div>
              )}
            </div>
          ) : (
            <div className={`
              p-6 rounded-xl shadow-lg text-center h-full flex flex-col items-center justify-center
              ${isDarkMode ? 'bg-gray-900 text-white border-2 border-gray-700' : 'bg-white text-gray-900 border-2 border-gray-200'}
            `}>
              <FaInfo className={`text-4xl mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Hover over a tooth to see details
              </div>
            </div>
          )}
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
