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
  FaExclamationCircle
} from 'react-icons/fa'
import { Card, Button, Select, PageHeader } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { treatmentsAPI, appointmentsAPI, paymentsAPI } from '../../../services/api'

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
      const type = t.treatmentType || 'Other'
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
      const type = t.treatmentType || 'Other'
      treatmentCount[type] = (treatmentCount[type] || 0) + 1
    })
    
    const sortedTreatments = Object.entries(treatmentCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
    
    // Teeth analysis
    const teethTreated = {}
    filteredTreatments.forEach(t => {
      let teethStatus = []
      try {
        if (typeof t.teethStatus === 'string') {
          teethStatus = JSON.parse(t.teethStatus)
        } else if (Array.isArray(t.teethStatus)) {
          teethStatus = t.teethStatus
        }
      } catch (e) {}
      
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

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, gradient, onClick }) => (
    <Card 
      hover={onClick ? true : false} 
      onClick={onClick}
      className={onClick ? 'cursor-pointer' : ''}
    >
      <Card.Content className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {title}
            </p>
            <p className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {value}
            </p>
            {subtitle && (
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {subtitle}
              </p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                {trend === 'up' ? (
                  <FaArrowUp className="text-green-500 text-sm" />
                ) : (
                  <FaArrowDown className="text-red-500 text-sm" />
                )}
                <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <Icon className="text-white text-2xl" />
          </div>
        </div>
      </Card.Content>
    </Card>
  )

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Reports & Analytics"
        description="Comprehensive insights into your practice performance"
      />

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
                  className={dateRange === range ? 'bg-gradient-to-r from-teal-600 to-cyan-600' : ''}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </Button>
              ))}
              <Button
                variant={dateRange === 'custom' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setDateRange('custom')}
                className={dateRange === 'custom' ? 'bg-gradient-to-r from-teal-600 to-cyan-600' : ''}
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
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-teal-600 text-teal-600'
                : isDarkMode
                ? 'border-transparent text-gray-400 hover:text-gray-300'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value={`$${financialMetrics.totalRevenue.toFixed(2)}`}
              subtitle={`${filteredPayments.length} payments`}
              icon={FaDollarSign}
              gradient="from-green-600 to-emerald-600"
            />
            <StatCard
              title="Total Patients"
              value={patientMetrics.totalPatients}
              subtitle={`${patientMetrics.newPatients} new patients`}
              icon={FaUsers}
              gradient="from-blue-600 to-cyan-600"
            />
            <StatCard
              title="Treatments"
              value={treatmentMetrics.totalTreatments}
              subtitle={`${treatmentMetrics.completed} completed`}
              icon={FaTooth}
              gradient="from-purple-600 to-pink-600"
            />
            <StatCard
              title="Appointments"
              value={appointmentMetrics.totalAppointments}
              subtitle={`${appointmentMetrics.completed} completed`}
              icon={FaCalendarAlt}
              gradient="from-orange-600 to-red-600"
            />
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <Card.Header>
                <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <FaPercentage className="text-teal-600" />
                  Key Performance Indicators
                </h3>
              </Card.Header>
              <Card.Content className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Collection Rate
                    </span>
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {financialMetrics.collectionRate.toFixed(1)}%
                    </span>
                  </div>
                  <ProgressBar percentage={financialMetrics.collectionRate} color="green" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Treatment Completion Rate
                    </span>
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {treatmentMetrics.completionRate.toFixed(1)}%
                    </span>
                  </div>
                  <ProgressBar percentage={treatmentMetrics.completionRate} color="teal" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Patient Retention Rate
                    </span>
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {patientMetrics.retentionRate.toFixed(1)}%
                    </span>
                  </div>
                  <ProgressBar percentage={patientMetrics.retentionRate} color="blue" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Appointment Completion Rate
                    </span>
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {appointmentMetrics.completionRate.toFixed(1)}%
                    </span>
                  </div>
                  <ProgressBar percentage={appointmentMetrics.completionRate} color="teal" />
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <FaTooth className="text-teal-600" />
                  Top Treatments
                </h3>
              </Card.Header>
              <Card.Content className="space-y-3">
                {treatmentMetrics.topTreatments.length > 0 ? (
                  treatmentMetrics.topTreatments.map(([treatment, count], index) => (
                    <div key={treatment} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-cyan-600 flex items-center justify-center text-white font-bold text-sm`}>
                          {index + 1}
                        </div>
                        <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {treatment}
                        </span>
                      </div>
                      <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {count} treatments
                      </span>
                    </div>
                  ))
                ) : (
                  <p className={`text-center py-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Billed"
              value={`$${financialMetrics.totalBilled.toFixed(2)}`}
              icon={FaFileExport}
              gradient="from-blue-600 to-cyan-600"
            />
            <StatCard
              title="Total Collected"
              value={`$${financialMetrics.totalPaid.toFixed(2)}`}
              icon={FaCheckCircle}
              gradient="from-green-600 to-emerald-600"
            />
            <StatCard
              title="Pending Payments"
              value={`$${financialMetrics.pendingPayments.toFixed(2)}`}
              icon={FaExclamationCircle}
              gradient="from-orange-600 to-red-600"
            />
          </div>

          <Card>
            <Card.Header>
              <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <FaChartBar className="text-teal-600" />
                Revenue by Treatment Type
              </h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                {Object.entries(financialMetrics.revenueByTreatment)
                  .sort((a, b) => b[1] - a[1])
                  .map(([treatment, revenue]) => {
                    const percentage = (revenue / financialMetrics.totalPaid * 100) || 0
                    return (
                      <div key={treatment}>
                        <div className="flex justify-between items-center mb-2">
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {treatment}
                          </span>
                          <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            ${revenue.toFixed(2)} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <ProgressBar percentage={percentage} color="green" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Completed"
              value={treatmentMetrics.completed}
              icon={FaCheckCircle}
              gradient="from-green-600 to-emerald-600"
            />
            <StatCard
              title="In Progress"
              value={treatmentMetrics.inProgress}
              icon={FaClock}
              gradient="from-blue-600 to-cyan-600"
            />
            <StatCard
              title="Cancelled"
              value={treatmentMetrics.cancelled}
              icon={FaTimesCircle}
              gradient="from-red-600 to-pink-600"
            />
            <StatCard
              title="Success Rate"
              value={`${treatmentMetrics.completionRate.toFixed(1)}%`}
              icon={FaPercentage}
              gradient="from-purple-600 to-pink-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <Card.Header>
                <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <FaTooth className="text-teal-600" />
                  Most Treated Teeth
                </h3>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3">
                  {Object.entries(treatmentMetrics.teethTreated)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([tooth, count]) => (
                      <div key={tooth} className="flex items-center justify-between">
                        <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Tooth #{tooth}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="w-32">
                            <ProgressBar 
                              percentage={(count / Math.max(...Object.values(treatmentMetrics.teethTreated))) * 100} 
                              color="teal" 
                            />
                          </div>
                          <span className={`text-sm font-bold w-12 text-right ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {count}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <FaChartPie className="text-teal-600" />
                  Treatment Status Distribution
                </h3>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10">
                    <div className="flex items-center gap-3">
                      <FaCheckCircle className="text-green-500 text-xl" />
                      <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Completed
                      </span>
                    </div>
                    <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {treatmentMetrics.completed}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-blue-500/10">
                    <div className="flex items-center gap-3">
                      <FaClock className="text-blue-500 text-xl" />
                      <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        In Progress
                      </span>
                    </div>
                    <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {treatmentMetrics.inProgress}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10">
                    <div className="flex items-center gap-3">
                      <FaTimesCircle className="text-red-500 text-xl" />
                      <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Cancelled
                      </span>
                    </div>
                    <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Patients"
              value={patientMetrics.totalPatients}
              icon={FaUsers}
              gradient="from-blue-600 to-cyan-600"
            />
            <StatCard
              title="New Patients"
              value={patientMetrics.newPatients}
              icon={FaUserPlus}
              gradient="from-green-600 to-emerald-600"
            />
            <StatCard
              title="Returning Patients"
              value={patientMetrics.returningPatients}
              icon={FaUserCheck}
              gradient="from-purple-600 to-pink-600"
            />
            <StatCard
              title="Retention Rate"
              value={`${patientMetrics.retentionRate.toFixed(1)}%`}
              icon={FaPercentage}
              gradient="from-orange-600 to-red-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <Card.Header>
                <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <FaUsers className="text-teal-600" />
                  Patient Engagement
                </h3>
              </Card.Header>
              <Card.Content className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Average Treatments per Patient
                    </span>
                    <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {patientMetrics.averageTreatmentsPerPatient.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Patient Retention
                    </span>
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {patientMetrics.retentionRate.toFixed(1)}%
                    </span>
                  </div>
                  <ProgressBar percentage={patientMetrics.retentionRate} color="blue" />
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <FaCalendarCheck className="text-teal-600" />
                  Appointment Insights
                </h3>
              </Card.Header>
              <Card.Content className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-teal-500/10">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      No-Show Rate
                    </p>
                    <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {appointmentMetrics.noShowRate.toFixed(1)}%
                    </p>
                  </div>
                  <FaTimesCircle className="text-red-500 text-3xl" />
                </div>

                {appointmentMetrics.busiestDay && (
                  <div className="flex items-center justify-between p-4 rounded-lg bg-blue-500/10">
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Busiest Day
                      </p>
                      <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {appointmentMetrics.busiestDay[0]}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {appointmentMetrics.busiestDay[1]} appointments
                      </p>
                    </div>
                    <FaCalendarAlt className="text-blue-500 text-3xl" />
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

// Missing icon imports (add at top)
import { FaUserPlus, FaUserCheck } from 'react-icons/fa'

export default DentistReports
