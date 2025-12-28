import { useState, useEffect, useMemo } from 'react'
import { 
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaDollarSign,
  FaUsers,
  FaTooth,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaFileExport,
  FaFilter,
  FaCalendarCheck,
  FaTimes,
  FaPercentage,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaUserPlus,
  FaUserCheck
} from 'react-icons/fa'
import { Card, Button, Select, PageHeader, StatCard } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { treatmentsAPI, appointmentsAPI, paymentsAPI } from '../../../services/api'
import { safeJsonParse, ensureArray } from '../../../utils/helpers'

const DentistReports = () => {
  const { isDarkMode } = useTheme()
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('month') // week, month, quarter, year, custom
  const [activeTab, setActiveTab] = useState('overview') // overview, financial, clinical, patients
  
  // Data states
  const [treatments, setTreatments] = useState([])
  const [appointments, setAppointments] = useState([])
  const [payments, setPayments] = useState([])
  
  // Date range states
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const [treatmentsRes, appointmentsRes, paymentsRes] = await Promise.all([
        treatmentsAPI.getDentistTreatments(),
        appointmentsAPI.getDentistAppointments(),
        paymentsAPI.getDentistPayments()
      ])
      
      setTreatments(treatmentsRes.treatments || [])
      setAppointments(appointmentsRes.appointments || [])
      setPayments(paymentsRes.payments || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Date filtering logic
  const getDateRange = () => {
    const now = new Date()
    let startDate = new Date()
    
    switch (dateRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case 'custom':
        return {
          start: customStartDate ? new Date(customStartDate) : new Date(0),
          end: customEndDate ? new Date(customEndDate) : now
        }
      default:
        startDate.setMonth(now.getMonth() - 1)
    }
    
    return { start: startDate, end: now }
  }

  const filterDataByDateRange = (data, dateField = 'createdAt') => {
    const { start, end } = getDateRange()
    return data.filter(item => {
      const itemDate = new Date(item[dateField])
      return itemDate >= start && itemDate <= end
    })
  }

  // Filtered data
  const filteredTreatments = useMemo(() => filterDataByDateRange(treatments), [treatments, dateRange, customStartDate, customEndDate])
  const filteredAppointments = useMemo(() => filterDataByDateRange(appointments, 'appointmentDate'), [appointments, dateRange, customStartDate, customEndDate])
  const filteredPayments = useMemo(() => filterDataByDateRange(payments), [payments, dateRange, customStartDate, customEndDate])

  // Financial Metrics
  const financialMetrics = useMemo(() => {
    const totalRevenue = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
    const totalBilled = filteredTreatments.reduce((sum, t) => sum + (t.totalAmount || 0), 0)
    const totalPaid = filteredTreatments.reduce((sum, t) => sum + (t.paidAmount || 0), 0)
    const pendingPayments = totalBilled - totalPaid
    const collectionRate = totalBilled > 0 ? (totalPaid / totalBilled * 100) : 0
    
    // Treatment type revenue
    const revenueByTreatment = {}
    filteredTreatments.forEach(t => {
      const type = t.treatmentName || 'Other'
      revenueByTreatment[type] = (revenueByTreatment[type] || 0) + (t.paidAmount || 0)
    })
    
    return {
      totalRevenue,
      totalBilled,
      totalPaid,
      pendingPayments,
      collectionRate,
      revenueByTreatment,
      averageTransactionValue: filteredPayments.length > 0 ? totalRevenue / filteredPayments.length : 0
    }
  }, [filteredTreatments, filteredPayments])

  // Patient Metrics
  const patientMetrics = useMemo(() => {
    const uniquePatients = new Set(filteredTreatments.map(t => t.patientId))
    const totalPatients = uniquePatients.size
    
    const patientTreatmentCount = {}
    filteredTreatments.forEach(t => {
      patientTreatmentCount[t.patientId] = (patientTreatmentCount[t.patientId] || 0) + 1
    })
    
    const returningPatients = Object.values(patientTreatmentCount).filter(count => count > 1).length
    const retentionRate = totalPatients > 0 ? (returningPatients / totalPatients * 100) : 0
    
    return {
      totalPatients,
      returningPatients,
      newPatients: totalPatients - returningPatients,
      retentionRate,
      averageTreatmentsPerPatient: totalPatients > 0 ? filteredTreatments.length / totalPatients : 0
    }
  }, [filteredTreatments])

  // Treatment Metrics
  const treatmentMetrics = useMemo(() => {
    const totalTreatments = filteredTreatments.length
    const completed = filteredTreatments.filter(t => t.status === 'COMPLETED').length
    const inProgress = filteredTreatments.filter(t => t.status === 'IN_PROGRESS').length
    const cancelled = filteredTreatments.filter(t => t.status === 'CANCELLED').length
    const completionRate = totalTreatments > 0 ? (completed / totalTreatments * 100) : 0
    
    // Most common treatments
    const treatmentCount = {}
    filteredTreatments.forEach(t => {
      const type = t.treatmentName || 'Other'
      treatmentCount[type] = (treatmentCount[type] || 0) + 1
    })
    
    const sortedTreatments = Object.entries(treatmentCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
    
    // Teeth analysis
    const teethTreated = {}
    filteredTreatments.forEach(t => {
      const teethStatus = typeof t.teethStatus === 'string'
        ? ensureArray(safeJsonParse(t.teethStatus, []))
        : ensureArray(t.teethStatus)
      
      teethStatus.forEach(tooth => {
        const toothNum = tooth.toothNumber
        teethTreated[toothNum] = (teethTreated[toothNum] || 0) + 1
      })
    })
    
    return {
      totalTreatments,
      completed,
      inProgress,
      cancelled,
      completionRate,
      topTreatments: sortedTreatments,
      teethTreated
    }
  }, [filteredTreatments])

  // Appointment Metrics
  const appointmentMetrics = useMemo(() => {
    const totalAppointments = filteredAppointments.length
    const confirmed = filteredAppointments.filter(a => a.status === 'CONFIRMED').length
    const completed = filteredAppointments.filter(a => a.status === 'COMPLETED').length
    const cancelled = filteredAppointments.filter(a => a.status === 'CANCELLED').length
    const pending = filteredAppointments.filter(a => a.status === 'PENDING').length
    
    const noShowRate = totalAppointments > 0 ? (cancelled / totalAppointments * 100) : 0
    const completionRate = totalAppointments > 0 ? (completed / totalAppointments * 100) : 0
    
    // Busiest days
    const dayCount = {}
    filteredAppointments.forEach(a => {
      const day = new Date(a.appointmentDate).toLocaleDateString('en-US', { weekday: 'long' })
      dayCount[day] = (dayCount[day] || 0) + 1
    })
    
    return {
      totalAppointments,
      confirmed,
      completed,
      cancelled,
      pending,
      noShowRate,
      completionRate,
      busiestDay: Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]
    }
  }, [filteredAppointments])

  // Component removed - using shared StatCard from components/common instead

  const ProgressBar = ({ percentage, color = 'teal' }) => {
    const colorClasses = {
      teal: 'bg-teal-600',
      green: 'bg-green-600',
      blue: 'bg-blue-600',
      yellow: 'bg-yellow-600',
      red: 'bg-red-600'
    }
    
    return (
      <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <div 
          className={`h-full rounded-full ${colorClasses[color]} transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    )
  }

  const exportToCSV = () => {
    // Implementation for CSV export
    alert('Export functionality - Coming soon!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <PageHeader
          title="Reports & Analytics"
          description="Comprehensive insights and performance metrics for your dental practice"
        />
        
        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <Card className={`${isDarkMode ? 'bg-linear-to-br from-green-900/40 to-emerald-900/40 border-green-700' : 'bg-linear-to-br from-green-50 to-emerald-50 border-green-200'} border-2`}>
            <Card.Content className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-medium uppercase tracking-wide ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                    Period Revenue
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {loading ? (
                      <span className="inline-block w-24 h-8 bg-gray-300 dark:bg-gray-700 animate-pulse rounded"></span>
                    ) : (
                      `$${financialMetrics.totalRevenue.toFixed(2)}`
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-lg">
                  <FaDollarSign className="text-white text-xl" />
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card className={`${isDarkMode ? 'bg-linear-to-br from-blue-900/40 to-cyan-900/40 border-blue-700' : 'bg-linear-to-br from-blue-50 to-cyan-50 border-blue-200'} border-2`}>
            <Card.Content className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-medium uppercase tracking-wide ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                    Active Patients
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {loading ? (
                      <span className="inline-block w-16 h-8 bg-gray-300 dark:bg-gray-700 animate-pulse rounded"></span>
                    ) : (
                      patientMetrics.totalPatients
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
                  <FaUsers className="text-white text-xl" />
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card className={`${isDarkMode ? 'bg-linear-to-br from-purple-900/40 to-pink-900/40 border-purple-700' : 'bg-linear-to-br from-purple-50 to-pink-50 border-purple-200'} border-2`}>
            <Card.Content className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-medium uppercase tracking-wide ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                    Treatments Done
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {loading ? (
                      <span className="inline-block w-16 h-8 bg-gray-300 dark:bg-gray-700 animate-pulse rounded"></span>
                    ) : (
                      treatmentMetrics.totalTreatments
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                  <FaTooth className="text-white text-xl" />
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card className={`${isDarkMode ? 'bg-linear-to-br from-orange-900/40 to-red-900/40 border-orange-700' : 'bg-linear-to-br from-orange-50 to-red-50 border-orange-200'} border-2`}>
            <Card.Content className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-medium uppercase tracking-wide ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`}>
                    Success Rate
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {loading ? (
                      <span className="inline-block w-20 h-8 bg-gray-300 dark:bg-gray-700 animate-pulse rounded"></span>
                    ) : (
                      `${treatmentMetrics.completionRate.toFixed(1)}%`
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-orange-600 to-red-600 flex items-center justify-center shadow-lg">
                  <FaCheckCircle className="text-white text-xl" />
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <Card.Content className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <FaFilter className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
              <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Time Period:
              </span>
            </div>
            
            <div className="flex gap-2">
              {['week', 'month', 'quarter', 'year'].map(range => (
                <Button
                  key={range}
                  variant={dateRange === range ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setDateRange(range)}
                  className={dateRange === range ? 'bg-linear-to-r from-teal-600 to-cyan-600' : ''}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </Button>
              ))}
              <Button
                variant={dateRange === 'custom' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setDateRange('custom')}
                className={dateRange === 'custom' ? 'bg-linear-to-r from-teal-600 to-cyan-600' : ''}
              >
                Custom
              </Button>
            </div>

            {dateRange === 'custom' && (
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className={`px-3 py-1.5 rounded-lg border text-sm ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className={`px-3 py-1.5 rounded-lg border text-sm ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            )}

            <div className="ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                className="flex items-center gap-2"
              >
                <FaFileExport />
                Export Report
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'overview', label: 'Overview', icon: FaChartLine },
          { id: 'financial', label: 'Financial', icon: FaDollarSign },
          { id: 'clinical', label: 'Clinical', icon: FaTooth },
          { id: 'patients', label: 'Patients', icon: FaUsers }
        ].map(tab => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            variant={activeTab === tab.id ? 'primary' : 'ghost'}
            className={`flex items-center gap-2 border-b-2 rounded-none ${
              activeTab === tab.id
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent'
            }`}
          >
            <tab.icon />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <FaChartLine className="text-teal-600" />
              Key Performance Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Revenue"
                value={`$${financialMetrics.totalRevenue.toFixed(2)}`}
                subtitle={`${filteredPayments.length} transactions`}
                icon={FaDollarSign}
                gradient="from-green-600 to-emerald-600"
              />
              <StatCard
                title="Total Patients"
                value={patientMetrics.totalPatients}
                subtitle={`${patientMetrics.newPatients} new, ${patientMetrics.returningPatients} returning`}
                icon={FaUsers}
                gradient="from-blue-600 to-cyan-600"
              />
              <StatCard
                title="Treatments"
                value={treatmentMetrics.totalTreatments}
                subtitle={`${treatmentMetrics.completed} completed, ${treatmentMetrics.inProgress} active`}
                icon={FaTooth}
                gradient="from-purple-600 to-pink-600"
              />
              <StatCard
                title="Appointments"
                value={appointmentMetrics.totalAppointments}
                subtitle={`${appointmentMetrics.completed} completed, ${appointmentMetrics.pending} pending`}
                icon={FaCalendarAlt}
                gradient="from-orange-600 to-red-600"
              />
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <Card.Header className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-linear-to-r from-teal-50 to-cyan-50'}`}>
                <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <div className="w-10 h-10 rounded-lg bg-linear-to-br from-teal-600 to-cyan-600 flex items-center justify-center">
                    <FaPercentage className="text-white" />
                  </div>
                  Key Performance Indicators
                </h3>
              </Card.Header>
              <Card.Content className="space-y-5 p-6">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-600" />
                      <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        Collection Rate
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {financialMetrics.collectionRate.toFixed(1)}%
                      </span>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                        ${financialMetrics.totalPaid.toFixed(0)} / ${financialMetrics.totalBilled.toFixed(0)}
                      </p>
                    </div>
                  </div>
                  <ProgressBar percentage={financialMetrics.collectionRate} color="green" />
                </div>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-teal-900/20 border border-teal-800' : 'bg-teal-50 border border-teal-200'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <FaTooth className="text-teal-600" />
                      <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        Treatment Completion Rate
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {treatmentMetrics.completionRate.toFixed(1)}%
                      </span>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                        {treatmentMetrics.completed} / {treatmentMetrics.totalTreatments}
                      </p>
                    </div>
                  </div>
                  <ProgressBar percentage={treatmentMetrics.completionRate} color="teal" />
                </div>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <FaUsers className="text-blue-600" />
                      <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        Patient Retention Rate
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {patientMetrics.retentionRate.toFixed(1)}%
                      </span>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                        {patientMetrics.returningPatients} returning patients
                      </p>
                    </div>
                  </div>
                  <ProgressBar percentage={patientMetrics.retentionRate} color="blue" />
                </div>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-purple-900/20 border border-purple-800' : 'bg-purple-50 border border-purple-200'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-purple-600" />
                      <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        Appointment Completion Rate
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {appointmentMetrics.completionRate.toFixed(1)}%
                      </span>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                        {appointmentMetrics.completed} / {appointmentMetrics.totalAppointments}
                      </p>
                    </div>
                  </div>
                  <ProgressBar percentage={appointmentMetrics.completionRate} color="teal" />
                </div>
              </Card.Content>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <Card.Header className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-linear-to-r from-purple-50 to-pink-50'}`}>
                <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <FaTooth className="text-white" />
                  </div>
                  Top 5 Treatments
                </h3>
              </Card.Header>
              <Card.Content className="space-y-3 p-6">
                {treatmentMetrics.topTreatments.length > 0 ? (
                  treatmentMetrics.topTreatments.map(([treatment, count], index) => {
                    const colors = [
                      'from-teal-600 to-cyan-600',
                      'from-blue-600 to-indigo-600',
                      'from-purple-600 to-pink-600',
                      'from-orange-600 to-red-600',
                      'from-green-600 to-emerald-600'
                    ]
                    const percentage = (count / treatmentMetrics.totalTreatments * 100).toFixed(1)
                    return (
                      <div key={treatment} className={`p-3 rounded-lg transition-all hover:scale-102 ${isDarkMode ? 'bg-gray-800/50 hover:bg-gray-700/50' : 'bg-gray-50 hover:bg-gray-100'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${colors[index]} flex items-center justify-center text-white font-bold shadow-lg`}>
                              {index + 1}
                            </div>
                            <div>
                              <span className={`font-semibold block ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                {treatment}
                              </span>
                              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                                {percentage}% of all treatments
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {count}
                            </span>
                            <span className={`text-xs block ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                              treatments
                            </span>
                          </div>
                        </div>
                        <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div 
                            className={`h-full rounded-full bg-linear-to-r ${colors[index]} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    No treatment data available
                  </p>
                )}
              </Card.Content>
            </Card>
          </div>
        </div>
      )}

      {/* Financial Tab */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          {/* Financial Summary Cards */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <FaDollarSign className="text-teal-600" />
              Financial Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Billed"
                value={`$${financialMetrics.totalBilled.toFixed(2)}`}
                subtitle={`${filteredTreatments.length} treatments`}
                icon={FaFileExport}
                gradient="from-blue-600 to-cyan-600"
              />
              <StatCard
                title="Total Collected"
                value={`$${financialMetrics.totalPaid.toFixed(2)}`}
                subtitle={`${financialMetrics.collectionRate.toFixed(1)}% collection rate`}
                icon={FaCheckCircle}
                gradient="from-green-600 to-emerald-600"
              />
              <StatCard
                title="Pending Payments"
                value={`$${financialMetrics.pendingPayments.toFixed(2)}`}
                subtitle={`${((financialMetrics.pendingPayments / financialMetrics.totalBilled) * 100 || 0).toFixed(1)}% of total`}
                icon={FaExclamationCircle}
                gradient="from-orange-600 to-red-600"
              />
              <StatCard
                title="Avg Transaction"
                value={`$${financialMetrics.averageTransactionValue.toFixed(2)}`}
                subtitle={`per payment`}
                icon={FaDollarSign}
                gradient="from-purple-600 to-pink-600"
              />
            </div>
          </div>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <Card.Header className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-linear-to-r from-green-50 to-emerald-50'}`}>
              <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-green-600 to-emerald-600 flex items-center justify-center">
                  <FaChartBar className="text-white" />
                </div>
                Revenue by Treatment Type
              </h3>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Distribution of revenue across treatment categories
              </p>
            </Card.Header>
            <Card.Content className="p-6">
              <div className="space-y-4">
                {Object.entries(financialMetrics.revenueByTreatment)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 8)
                  .map(([treatment, revenue], index) => {
                    const percentage = (revenue / financialMetrics.totalPaid * 100) || 0
                    return (
                      <div key={treatment} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-8 rounded-full bg-linear-to-b from-green-600 to-emerald-600"></div>
                            <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              {treatment}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              ${revenue.toFixed(2)}
                            </span>
                            <span className={`text-xs block ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                              {percentage.toFixed(1)}% of total
                            </span>
                          </div>
                        </div>
                        <div className="relative">
                          <ProgressBar percentage={percentage} color="green" />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </Card.Content>
          </Card>
        </div>
      )}

      {/* Clinical Tab */}
      {activeTab === 'clinical' && (
        <div className="space-y-6">
          {/* Treatment Status Overview */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <FaTooth className="text-teal-600" />
              Treatment Status Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Completed"
                value={treatmentMetrics.completed}
                subtitle={`${treatmentMetrics.completionRate.toFixed(1)}% success rate`}
                icon={FaCheckCircle}
                gradient="from-green-600 to-emerald-600"
              />
              <StatCard
                title="In Progress"
                value={treatmentMetrics.inProgress}
                subtitle={`${((treatmentMetrics.inProgress / treatmentMetrics.totalTreatments) * 100 || 0).toFixed(1)}% of total`}
                icon={FaClock}
                gradient="from-blue-600 to-cyan-600"
              />
              <StatCard
                title="Cancelled"
                value={treatmentMetrics.cancelled}
                subtitle={`${((treatmentMetrics.cancelled / treatmentMetrics.totalTreatments) * 100 || 0).toFixed(1)}% cancellation rate`}
                icon={FaTimesCircle}
                gradient="from-red-600 to-pink-600"
              />
              <StatCard
                title="Total Treatments"
                value={treatmentMetrics.totalTreatments}
                subtitle={`across all statuses`}
                icon={FaTooth}
                gradient="from-purple-600 to-pink-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <Card.Header className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-linear-to-r from-teal-50 to-cyan-50'}`}>
                <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <div className="w-10 h-10 rounded-lg bg-linear-to-br from-teal-600 to-cyan-600 flex items-center justify-center">
                    <FaTooth className="text-white" />
                  </div>
                  Most Treated Teeth
                </h3>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Top 10 teeth by treatment frequency
                </p>
              </Card.Header>
              <Card.Content className="p-6">
                <div className="space-y-3">
                  {Object.entries(treatmentMetrics.teethTreated)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([tooth, count], index) => {
                      const maxCount = Math.max(...Object.values(treatmentMetrics.teethTreated))
                      const percentage = (count / maxCount) * 100
                      return (
                        <div key={tooth} className={`p-3 rounded-lg transition-all hover:scale-102 ${isDarkMode ? 'bg-gray-800/30 hover:bg-gray-700/30' : 'bg-gray-50 hover:bg-gray-100'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg bg-linear-to-br from-teal-600 to-cyan-600 flex items-center justify-center text-white font-bold text-xs shadow-lg`}>
                                {tooth}
                              </div>
                              <span className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                Tooth #{tooth}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {count}
                              </span>
                              <span className={`text-xs block ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                                treatments
                              </span>
                            </div>
                          </div>
                          <div className="relative">
                            <ProgressBar percentage={percentage} color="teal" />
                          </div>
                        </div>
                      )
                    })}
                </div>
              </Card.Content>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <Card.Header className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-linear-to-r from-blue-50 to-purple-50'}`}>
                <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                    <FaChartPie className="text-white" />
                  </div>
                  Treatment Status Distribution
                </h3>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Breakdown of treatment statuses
                </p>
              </Card.Header>
              <Card.Content className="p-6">
                <div className="space-y-4">
                  <div className={`flex items-center justify-between p-5 rounded-xl transition-all hover:scale-102 ${isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-linear-to-r from-green-50 to-emerald-50 border border-green-200'}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-lg">
                        <FaCheckCircle className="text-white text-2xl" />
                      </div>
                      <div>
                        <span className={`font-semibold block ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          Completed
                        </span>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                          {treatmentMetrics.completionRate.toFixed(1)}% success rate
                        </span>
                      </div>
                    </div>
                    <span className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {treatmentMetrics.completed}
                    </span>
                  </div>

                  <div className={`flex items-center justify-between p-5 rounded-xl transition-all hover:scale-102 ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-linear-to-r from-blue-50 to-cyan-50 border border-blue-200'}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
                        <FaClock className="text-white text-2xl" />
                      </div>
                      <div>
                        <span className={`font-semibold block ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          In Progress
                        </span>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                          {((treatmentMetrics.inProgress / treatmentMetrics.totalTreatments) * 100 || 0).toFixed(1)}% of total
                        </span>
                      </div>
                    </div>
                    <span className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {treatmentMetrics.inProgress}
                    </span>
                  </div>

                  <div className={`flex items-center justify-between p-5 rounded-xl transition-all hover:scale-102 ${isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-linear-to-r from-red-50 to-pink-50 border border-red-200'}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-red-600 to-pink-600 flex items-center justify-center shadow-lg">
                        <FaTimesCircle className="text-white text-2xl" />
                      </div>
                      <div>
                        <span className={`font-semibold block ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          Cancelled
                        </span>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                          {((treatmentMetrics.cancelled / treatmentMetrics.totalTreatments) * 100 || 0).toFixed(1)}% cancellation rate
                        </span>
                      </div>
                    </div>
                    <span className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {treatmentMetrics.cancelled}
                    </span>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      )}

      {/* Patients Tab */}
      {activeTab === 'patients' && (
        <div className="space-y-6">
          {/* Patient Overview */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <FaUsers className="text-teal-600" />
              Patient Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Patients"
                value={patientMetrics.totalPatients}
                subtitle={`in selected period`}
                icon={FaUsers}
                gradient="from-blue-600 to-cyan-600"
              />
              <StatCard
                title="New Patients"
                value={patientMetrics.newPatients}
                subtitle={`${((patientMetrics.newPatients / patientMetrics.totalPatients) * 100 || 0).toFixed(1)}% of total`}
                icon={FaUserPlus}
                gradient="from-green-600 to-emerald-600"
              />
              <StatCard
                title="Returning Patients"
                value={patientMetrics.returningPatients}
                subtitle={`${((patientMetrics.returningPatients / patientMetrics.totalPatients) * 100 || 0).toFixed(1)}% of total`}
                icon={FaUserCheck}
                gradient="from-purple-600 to-pink-600"
              />
              <StatCard
                title="Retention Rate"
                value={`${patientMetrics.retentionRate.toFixed(1)}%`}
                subtitle={`patient loyalty`}
                icon={FaPercentage}
                gradient="from-orange-600 to-red-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <Card.Header className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-linear-to-r from-blue-50 to-indigo-50'}`}>
                <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                    <FaUsers className="text-white" />
                  </div>
                  Patient Engagement
                </h3>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Patient loyalty and activity metrics
                </p>
              </Card.Header>
              <Card.Content className="space-y-5 p-6">
                <div className={`p-5 rounded-xl ${isDarkMode ? 'bg-purple-900/20 border border-purple-800' : 'bg-linear-to-r from-purple-50 to-pink-50 border border-purple-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                        <FaTooth className="text-white text-xl" />
                      </div>
                      <div>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Avg. Treatments per Patient
                        </span>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          Patient engagement level
                        </p>
                      </div>
                    </div>
                    <span className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {patientMetrics.averageTreatmentsPerPatient.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className={`p-5 rounded-xl ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-linear-to-r from-blue-50 to-cyan-50 border border-blue-200'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
                        <FaUserCheck className="text-white text-xl" />
                      </div>
                      <div>
                        <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          Patient Retention Rate
                        </span>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {patientMetrics.returningPatients} returning of {patientMetrics.totalPatients} total
                        </p>
                      </div>
                    </div>
                    <span className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {patientMetrics.retentionRate.toFixed(1)}%
                    </span>
                  </div>
                  <ProgressBar percentage={patientMetrics.retentionRate} color="blue" />
                </div>
              </Card.Content>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <Card.Header className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-linear-to-r from-orange-50 to-amber-50'}`}>
                <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <div className="w-10 h-10 rounded-lg bg-linear-to-br from-orange-600 to-amber-600 flex items-center justify-center">
                    <FaCalendarCheck className="text-white" />
                  </div>
                  Appointment Insights
                </h3>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Scheduling patterns and attendance
                </p>
              </Card.Header>
              <Card.Content className="space-y-4 p-6">
                <div className={`flex items-center justify-between p-5 rounded-xl transition-all hover:scale-102 ${isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-linear-to-r from-red-50 to-orange-50 border border-red-200'}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-linear-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-lg">
                      <FaTimesCircle className="text-white text-2xl" />
                    </div>
                    <div>
                      <p className={`text-xs font-medium uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        No-Show Rate
                      </p>
                      <p className={`text-3xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {appointmentMetrics.noShowRate.toFixed(1)}%
                      </p>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {appointmentMetrics.cancelled} cancelled appointments
                      </p>
                    </div>
                  </div>
                </div>

                {appointmentMetrics.busiestDay && (
                  <div className={`flex items-center justify-between p-5 rounded-xl transition-all hover:scale-102 ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200'}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                        <FaCalendarAlt className="text-white text-2xl" />
                      </div>
                      <div>
                        <p className={`text-xs font-medium uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Busiest Day
                        </p>
                        <p className={`text-3xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {appointmentMetrics.busiestDay[0]}
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {appointmentMetrics.busiestDay[1]} appointments scheduled
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </Card.Content>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

export default DentistReports
