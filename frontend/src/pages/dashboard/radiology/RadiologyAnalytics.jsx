import { useState, useEffect, useMemo } from 'react'
import { 
  FaChartBar,
  FaUserMd,
  FaImage,
  FaBuilding,
  FaXRay
} from 'react-icons/fa'
import { Card, LoadingSpinner, PageHeader } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { authUtils } from '../../../utils/auth'

const RadiologyAnalytics = () => {
  const { isDarkMode } = useTheme()
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch all requests for analytics
  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setIsLoading(true)
      const token = authUtils.getAccessToken()
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/radiology-requests/center/my-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setRequests(data.radiologyRequests || data.data || data.requests || [])
      }
    } catch (error) {
      console.error('Error fetching requests for analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate analytics from requests
  const analytics = useMemo(() => {
    // Count by dentist
    const dentistCounts = {}
    requests.forEach(req => {
      if (req.dentist?.firstName && req.dentist?.lastName) {
        const dentistName = `Dr. ${req.dentist.firstName} ${req.dentist.lastName}`.trim()
        dentistCounts[dentistName] = (dentistCounts[dentistName] || 0) + 1
      }
    })

    // Count by clinic
    const clinicCounts = {}
    requests.forEach(req => {
      if (req.dentist?.clinic?.clinicName) {
        const clinicName = req.dentist.clinic.clinicName
        clinicCounts[clinicName] = (clinicCounts[clinicName] || 0) + 1
      }
    })

    // Count by imaging type
    const imagingTypeCounts = {}
    requests.forEach(req => {
      const imagingType = req.imagingType || 'Unknown'
      imagingTypeCounts[imagingType] = (imagingTypeCounts[imagingType] || 0) + 1
    })

    // Sort and get top 10 for dentists and clinics
    const topDentists = Object.entries(dentistCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)

    const topClinics = Object.entries(clinicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)

    const imagingTypes = Object.entries(imagingTypeCounts)
      .sort(([, a], [, b]) => b - a)

    return {
      dentistCounts: topDentists,
      clinicCounts: topClinics,
      imagingTypeCounts: imagingTypes,
      totalDentists: Object.keys(dentistCounts).length,
      totalClinics: Object.keys(clinicCounts).length,
      totalRequests: requests.length
    }
  }, [requests])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Analytics & Reports"
        description="Detailed statistics and insights from radiology requests"
        icon={FaChartBar}
      />

      {/* Summary Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <FaXRay className="text-white text-xl" />
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Requests
              </p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {analytics.totalRequests}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center">
              <FaUserMd className="text-white text-xl" />
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Dentists
              </p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {analytics.totalDentists}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <FaBuilding className="text-white text-xl" />
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Clinics
              </p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {analytics.totalClinics}
              </p>
            </div>
          </div>
        </Card>
      </div>
      )}

      {/* Analytics & Reports Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests by Dentist */}
        <Card className="p-6">
          <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <FaUserMd className="text-teal-600 dark:text-teal-400" />
            Top Dentists
          </h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-lg animate-pulse ${
                  isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                  </div>
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : analytics.dentistCounts.length > 0 ? (
            <div className="space-y-3">
              {analytics.dentistCounts.map(([dentist, count], index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' :
                      'bg-teal-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {dentist}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      isDarkMode ? 'bg-teal-900 text-teal-200' : 'bg-teal-100 text-teal-700'
                    }`}>
                      {count} requests
                    </span>
                  </div>
                </div>
              ))}
              <div className={`text-sm text-center pt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total: {analytics.totalDentists} dentists
              </div>
            </div>
          ) : (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No dentist data available
            </div>
          )}
        </Card>

        {/* Requests by Clinic */}
        <Card className="p-6">
          <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <FaBuilding className="text-blue-600 dark:text-blue-400" />
            Top Clinics
          </h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-lg animate-pulse ${
                  isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-40"></div>
                  </div>
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : analytics.clinicCounts.length > 0 ? (
            <div className="space-y-3">
              {analytics.clinicCounts.map(([clinic, count], index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' :
                      'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {clinic}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {count} requests
                    </span>
                  </div>
                </div>
              ))}
              <div className={`text-sm text-center pt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total: {analytics.totalClinics} clinics
              </div>
            </div>
          ) : (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No clinic data available
            </div>
          )}
        </Card>
      </div>

      {/* Imaging Types Distribution */}
      <Card className="p-6">
        <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <FaImage className="text-purple-600 dark:text-purple-400" />
          Imaging Types Distribution
        </h3>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={`p-4 rounded-lg border animate-pulse ${
                isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                  <div className="h-5 w-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-1"></div>
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-1"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                <div className="mt-2 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              </div>
            ))}
          </div>
        ) : analytics.imagingTypeCounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.imagingTypeCounts.map(([type, count], index) => {
              const totalRequests = requests.length
              const percentage = totalRequests > 0 ? ((count / totalRequests) * 100).toFixed(1) : 0
              
              const colors = [
                { bg: 'bg-blue-500', light: 'bg-blue-100 text-blue-700', dark: 'bg-blue-900 text-blue-200' },
                { bg: 'bg-green-500', light: 'bg-green-100 text-green-700', dark: 'bg-green-900 text-green-200' },
                { bg: 'bg-purple-500', light: 'bg-purple-100 text-purple-700', dark: 'bg-purple-900 text-purple-200' },
                { bg: 'bg-orange-500', light: 'bg-orange-100 text-orange-700', dark: 'bg-orange-900 text-orange-200' },
                { bg: 'bg-pink-500', light: 'bg-pink-100 text-pink-700', dark: 'bg-pink-900 text-pink-200' },
                { bg: 'bg-cyan-500', light: 'bg-cyan-100 text-cyan-700', dark: 'bg-cyan-900 text-cyan-200' },
                { bg: 'bg-indigo-500', light: 'bg-indigo-100 text-indigo-700', dark: 'bg-indigo-900 text-indigo-200' },
                { bg: 'bg-teal-500', light: 'bg-teal-100 text-teal-700', dark: 'bg-teal-900 text-teal-200' },
              ]
              const color = colors[index % colors.length]
              
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-full ${color.bg} flex items-center justify-center`}>
                      <FaXRay className="text-white text-lg" />
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      isDarkMode ? color.dark : color.light
                    }`}>
                      {percentage}%
                    </span>
                  </div>
                  <h4 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {type}
                  </h4>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {count}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    requests
                  </p>
                  {/* Progress bar */}
                  <div className={`mt-2 h-1.5 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                    <div 
                      className={`h-full rounded-full ${color.bg}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No imaging type data available
          </div>
        )}
      </Card>
    </div>
  )
}

export default RadiologyAnalytics
