import { useTheme } from '../../contexts/ThemeContext'
import { FaCheck, FaCircle, FaClock } from 'react-icons/fa'

const TreatmentSteps = ({ currentStep, steps, onStepClick }) => {
  const { isDarkMode } = useTheme()

  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'completed'
    if (stepIndex === currentStep) return 'current'
    return 'upcoming'
  }

  const getStepColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600 text-white border-green-600'
      case 'current':
        return isDarkMode 
          ? 'bg-teal-600 text-white border-teal-600' 
          : 'bg-teal-600 text-white border-teal-600'
      case 'upcoming':
        return isDarkMode 
          ? 'bg-gray-700 text-gray-400 border-gray-600' 
          : 'bg-gray-100 text-gray-500 border-gray-300'
      default:
        return ''
    }
  }

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(index)
          const isLast = index === steps.length - 1

          return (
            <div key={index} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => onStepClick && onStepClick(index)}
                  disabled={status === 'upcoming'}
                  className={`
                    w-12 h-12 rounded-full border-2 flex items-center justify-center
                    transition-all duration-300 relative
                    ${getStepColor(status)}
                    ${status !== 'upcoming' && onStepClick ? 'cursor-pointer hover:scale-110' : ''}
                    ${status === 'upcoming' ? 'cursor-not-allowed' : ''}
                  `}
                >
                  {status === 'completed' ? (
                    <FaCheck className="w-5 h-5" />
                  ) : status === 'current' ? (
                    <FaClock className="w-5 h-5" />
                  ) : (
                    <FaCircle className="w-3 h-3" />
                  )}
                </button>
                
                {/* Step Label */}
                <div className="mt-3 text-center max-w-[120px]">
                  <p className={`text-sm font-semibold ${
                    status === 'current' 
                      ? 'text-teal-600' 
                      : status === 'completed'
                      ? 'text-green-600'
                      : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  {step.date && (
                    <p className={`text-xs mt-1 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {step.date}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className={`
                  flex-1 h-1 mx-2 rounded transition-all duration-300
                  ${status === 'completed' 
                    ? 'bg-green-600' 
                    : isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                  }
                `} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TreatmentSteps
