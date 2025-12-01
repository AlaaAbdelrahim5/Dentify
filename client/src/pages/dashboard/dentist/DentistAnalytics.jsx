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
  FaMinus,
  FaEquals,
  FaCalendarCheck,
  FaClock,
  FaCheckCircle,
  FaFilter,
  FaDownload
} from 'react-icons/fa'
import { Card, Button, PageHeader } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { treatmentsAPI, appointmentsAPI, paymentsAPI } from '../../../services/api'

const DentistAnalytics = () => {
  const { isDarkMode } = useTheme()
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('year') // month, quarter, year
  const [chartView, setChartView] = useState('revenue') // revenue, treatments, patients, appointments
  
  // Data states
  const [treatments, setTreatments] = useState([])
  const [appointments, setAppointments] = useState([])
  const [payments, setPayments] = useState([])

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

  // Generate time series data for charts
  const generateTimeSeriesData = () => {
    const now = new Date()
    const periods = []
    let periodsCount = 12 // Default for year view
    
    if (dateRange === 'month') {
      periodsCount = 30
      for (let i = periodsCount - 1; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        periods.push({
          label: date.getDate().toString(),
          fullDate: date.toISOString().split('T')[0],
          date: date
        })
      }
    } else if (dateRange === 'quarter') {
      periodsCount = 12
      for (let i = periodsCount - 1; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - (i * 7))
        periods.push({
          label: `Week ${12 - i}`,
          fullDate: date.toISOString().split('T')[0],
          date: date
        })
      }
    } else { // year
      periodsCount = 12
      for (let i = periodsCount - 1; i >= 0; i--) {
        const date = new Date(now)
        date.setMonth(date.getMonth() - i)
        periods.push({
          label: date.toLocaleDateString('en-US', { month: 'short' }),
          fullDate: date.toISOString().split('T')[0].substring(0, 7),
          date: date
        })
      }
    }
    
    return periods
  }

  // Calculate revenue trend data
  const revenueData = useMemo(() => {
    const periods = generateTimeSeriesData()
    
    return periods.map(period => {
      const periodPayments = payments.filter(p => {
        if (!p.createdAt) return false
        const paymentDate = new Date(p.createdAt)
        if (isNaN(paymentDate.getTime())) return false
        
        if (dateRange === 'month') {
          return paymentDate.toISOString().split('T')[0] === period.fullDate
        } else if (dateRange === 'quarter') {
          const weekStart = new Date(period.fullDate)
          const weekEnd = new Date(period.fullDate)
          weekEnd.setDate(weekEnd.getDate() + 7)
          return paymentDate >= weekStart && paymentDate < weekEnd
        } else {
          return paymentDate.toISOString().substring(0, 7) === period.fullDate
        }
      })
      
      const revenue = periodPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
      return { label: period.label, value: revenue }
    })
  }, [payments, dateRange])

  // Calculate treatments trend data
  const treatmentsData = useMemo(() => {
    const periods = generateTimeSeriesData()
    
    return periods.map(period => {
      const periodTreatments = treatments.filter(t => {
        if (!t.createdAt) return false
        const treatmentDate = new Date(t.createdAt)
        if (isNaN(treatmentDate.getTime())) return false
        
        if (dateRange === 'month') {
          return treatmentDate.toISOString().split('T')[0] === period.fullDate
        } else if (dateRange === 'quarter') {
          const weekStart = new Date(period.fullDate)
          const weekEnd = new Date(period.fullDate)
          weekEnd.setDate(weekEnd.getDate() + 7)
          return treatmentDate >= weekStart && treatmentDate < weekEnd
        } else {
          return treatmentDate.toISOString().substring(0, 7) === period.fullDate
        }
      })
      
      return { label: period.label, value: periodTreatments.length }
    })
  }, [treatments, dateRange])

  // Calculate patients trend data
  const patientsData = useMemo(() => {
    const periods = generateTimeSeriesData()
    
    return periods.map(period => {
      const periodTreatments = treatments.filter(t => {
        if (!t.createdAt) return false
        const treatmentDate = new Date(t.createdAt)
        if (isNaN(treatmentDate.getTime())) return false
        
        if (dateRange === 'month') {
          return treatmentDate.toISOString().split('T')[0] === period.fullDate
        } else if (dateRange === 'quarter') {
          const weekStart = new Date(period.fullDate)
          const weekEnd = new Date(period.fullDate)
          weekEnd.setDate(weekEnd.getDate() + 7)
          return treatmentDate >= weekStart && treatmentDate < weekEnd
        } else {
          return treatmentDate.toISOString().substring(0, 7) === period.fullDate
        }
      })
      
      const uniquePatients = new Set(periodTreatments.map(t => t.patientId))
      return { label: period.label, value: uniquePatients.size }
    })
  }, [treatments, dateRange])

  // Calculate appointments trend data
  const appointmentsData = useMemo(() => {
    const periods = generateTimeSeriesData()
    
    return periods.map(period => {
      const periodAppointments = appointments.filter(a => {
        if (!a.appointmentDate) return false
        const appointmentDate = new Date(a.appointmentDate)
        if (isNaN(appointmentDate.getTime())) return false
        
        if (dateRange === 'month') {
          return appointmentDate.toISOString().split('T')[0] === period.fullDate
        } else if (dateRange === 'quarter') {
          const weekStart = new Date(period.fullDate)
          const weekEnd = new Date(period.fullDate)
          weekEnd.setDate(weekEnd.getDate() + 7)
          return appointmentDate >= weekStart && appointmentDate < weekEnd
        } else {
          return appointmentDate.toISOString().substring(0, 7) === period.fullDate
        }
      })
      
      return { label: period.label, value: periodAppointments.length }
    })
  }, [appointments, dateRange])

  // Get current chart data based on view
  const getCurrentChartData = () => {
    switch (chartView) {
      case 'revenue':
        return { data: revenueData, label: 'Revenue', color: 'from-green-600 to-emerald-600', prefix: '$' }
      case 'treatments':
        return { data: treatmentsData, label: 'Treatments', color: 'from-purple-600 to-pink-600', prefix: '' }
      case 'patients':
        return { data: patientsData, label: 'Patients', color: 'from-blue-600 to-cyan-600', prefix: '' }
      case 'appointments':
        return { data: appointmentsData, label: 'Appointments', color: 'from-orange-600 to-red-600', prefix: '' }
      default:
        return { data: revenueData, label: 'Revenue', color: 'from-green-600 to-emerald-600', prefix: '$' }
    }
  }

  const chartData = getCurrentChartData()

  // Calculate trend
  const calculateTrend = (data) => {
    if (data.length < 2) return { trend: 'stable', percentage: 0 }
    
    const current = data[data.length - 1].value
    const previous = data[data.length - 2].value
    
    if (previous === 0) return { trend: 'up', percentage: 100 }
    
    const percentageChange = ((current - previous) / previous) * 100
    
    if (Math.abs(percentageChange) < 5) return { trend: 'stable', percentage: percentageChange }
    return { 
      trend: percentageChange > 0 ? 'up' : 'down', 
      percentage: Math.abs(percentageChange) 
    }
  }

  const trend = calculateTrend(chartData.data)

  // Bar Chart Component
  const BarChart = ({ data, color, prefix = '' }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1)
    
    return (
      <div className="space-y-2">
        <div className="flex items-end justify-between gap-2 h-64">
          {data.map((item, index) => {
            const height = (item.value / maxValue) * 100
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center justify-end h-full">
                  <div 
                    className={`w-full bg-gradient-to-t ${color} rounded-t-lg transition-all duration-500 hover:opacity-80 cursor-pointer relative group`}
                    style={{ height: `${height}%`, minHeight: item.value > 0 ? '8px' : '0' }}
                  >
                    <div className={`absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap`}>
                      {prefix}{item.value.toFixed(prefix === '$' ? 2 : 0)}
                    </div>
                  </div>
                </div>
                <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {item.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Line Chart Component
  const LineChart = ({ data, color }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1)
    const width = 100 / (data.length - 1 || 1)
    
    const points = data.map((item, index) => {
      const x = index * width
      const y = 100 - ((item.value / maxValue) * 100)
      return `${x},${y}`
    }).join(' ')
    
    const areaPoints = `0,100 ${points} 100,100`
    
    return (
      <div className="space-y-4">
        <div className="relative h-64">
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke={isDarkMode ? '#374151' : '#E5E7EB'}
                strokeWidth="0.2"
              />
            ))}
            
            {/* Area fill */}
            <polygon
              points={areaPoints}
              fill="url(#gradient)"
              opacity="0.3"
            />
            
            {/* Line */}
            <polyline
              points={points}
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Points */}
            {data.map((item, index) => {
              const x = index * width
              const y = 100 - ((item.value / maxValue) * 100)
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="1.5"
                    fill="white"
                    stroke="url(#gradient)"
                    strokeWidth="1"
                    className="cursor-pointer hover:r-2 transition-all"
                  />
                </g>
              )
            })}
            
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" className={`${color.includes('green') ? 'text-green-600' : color.includes('blue') ? 'text-blue-600' : color.includes('purple') ? 'text-purple-600' : 'text-orange-600'}`} style={{ stopColor: 'currentColor' }} />
                <stop offset="100%" className={`${color.includes('green') ? 'text-emerald-600' : color.includes('blue') ? 'text-cyan-600' : color.includes('purple') ? 'text-pink-600' : 'text-red-600'}`} style={{ stopColor: 'currentColor' }} />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        <div className="flex items-center justify-between">
          {data.map((item, index) => (
            <span key={index} className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {item.label}
            </span>
          ))}
        </div>
      </div>
    )
  }

  // Treatment type distribution
  const treatmentDistribution = useMemo(() => {
    const distribution = {}
    treatments.forEach(t => {
      const type = t.treatmentType || 'Other'
      distribution[type] = (distribution[type] || 0) + 1
    })
    return Object.entries(distribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
  }, [treatments])

  const colors = [
    'from-blue-600 to-cyan-600',
    'from-purple-600 to-pink-600',
    'from-green-600 to-emerald-600',
    'from-orange-600 to-red-600',
    'from-yellow-600 to-amber-600',
    'from-indigo-600 to-purple-600'
  ]

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
        title="Analytics Dashboard"
        description="Visual insights and trends for your dental practice"
      />

      {/* Filters */}
      <Card>
        <Card.Content className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FaFilter className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
              <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Time Range:
              </span>
              <div className="flex gap-2">
                {['month', 'quarter', 'year'].map(range => (
                  <Button
                    key={range}
                    variant={dateRange === range ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setDateRange(range)}
                    className={dateRange === range ? 'bg-gradient-to-r from-teal-600 to-cyan-600' : ''}
                  >
                    {range === 'month' ? 'Last 30 Days' : range === 'quarter' ? 'Last 3 Months' : 'Last 12 Months'}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <FaDownload />
              Export Charts
            </Button>
          </div>
        </Card.Content>
      </Card>

      {/* Chart Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { id: 'revenue', label: 'Revenue Trend', icon: FaDollarSign, color: 'from-green-600 to-emerald-600' },
          { id: 'treatments', label: 'Treatments Trend', icon: FaTooth, color: 'from-purple-600 to-pink-600' },
          { id: 'patients', label: 'Patients Trend', icon: FaUsers, color: 'from-blue-600 to-cyan-600' },
          { id: 'appointments', label: 'Appointments Trend', icon: FaCalendarAlt, color: 'from-orange-600 to-red-600' }
        ].map(view => (
          <Card 
            key={view.id}
            hover
            onClick={() => setChartView(view.id)}
            className={`cursor-pointer transition-all ${
              chartView === view.id 
                ? 'ring-2 ring-teal-600 ring-offset-2 dark:ring-offset-gray-800' 
                : ''
            }`}
          >
            <Card.Content className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {view.label}
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {view.id === 'revenue' && '$'}
                    {view.id === 'revenue' 
                      ? revenueData.reduce((sum, d) => sum + d.value, 0).toFixed(2)
                      : view.id === 'treatments'
                      ? treatmentsData.reduce((sum, d) => sum + d.value, 0)
                      : view.id === 'patients'
                      ? Math.max(...patientsData.map(d => d.value))
                      : appointmentsData.reduce((sum, d) => sum + d.value, 0)
                    }
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${view.color} flex items-center justify-center`}>
                  <view.icon className="text-white text-xl" />
                </div>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>

      {/* Main Chart */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <FaChartLine className="text-teal-600" />
                {chartData.label} Over Time
              </h3>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Showing {dateRange === 'month' ? 'daily' : dateRange === 'quarter' ? 'weekly' : 'monthly'} trends
              </p>
            </div>
            <div className="flex items-center gap-2">
              {trend.trend === 'up' && <FaArrowUp className="text-green-500 text-2xl" />}
              {trend.trend === 'down' && <FaArrowDown className="text-red-500 text-2xl" />}
              {trend.trend === 'stable' && <FaMinus className="text-gray-500 text-2xl" />}
              <div className="text-right">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Trend
                </p>
                <p className={`text-lg font-bold ${
                  trend.trend === 'up' ? 'text-green-500' : 
                  trend.trend === 'down' ? 'text-red-500' : 
                  'text-gray-500'
                }`}>
                  {trend.trend === 'up' ? '+' : trend.trend === 'down' ? '-' : ''}{trend.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </Card.Header>
        <Card.Content className="p-6">
          <LineChart data={chartData.data} color={chartData.color} />
        </Card.Content>
      </Card>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <Card.Header>
            <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <FaChartBar className="text-teal-600" />
              {chartData.label} Distribution
            </h3>
          </Card.Header>
          <Card.Content>
            <BarChart data={chartData.data} color={chartData.color} prefix={chartData.prefix} />
          </Card.Content>
        </Card>

        {/* Treatment Distribution */}
        <Card>
          <Card.Header>
            <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <FaChartPie className="text-teal-600" />
              Treatment Type Distribution
            </h3>
          </Card.Header>
          <Card.Content className="space-y-3">
            {treatmentDistribution.map(([type, count], index) => {
              const percentage = (count / treatments.length) * 100
              return (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors[index]} flex items-center justify-center text-white font-bold text-xs`}>
                        {index + 1}
                      </div>
                      <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {type}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {count}
                      </span>
                      <span className={`text-xs ml-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${colors[index]} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </Card.Content>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <Card.Content className="p-6 text-center">
            <FaCheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Avg. Daily Revenue
            </p>
            <p className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ${(revenueData.reduce((sum, d) => sum + d.value, 0) / revenueData.length).toFixed(2)}
            </p>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6 text-center">
            <FaTooth className="w-12 h-12 mx-auto mb-3 text-purple-500" />
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Avg. Daily Treatments
            </p>
            <p className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {(treatmentsData.reduce((sum, d) => sum + d.value, 0) / treatmentsData.length).toFixed(1)}
            </p>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6 text-center">
            <FaCalendarCheck className="w-12 h-12 mx-auto mb-3 text-blue-500" />
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Avg. Daily Appointments
            </p>
            <p className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {(appointmentsData.reduce((sum, d) => sum + d.value, 0) / appointmentsData.length).toFixed(1)}
            </p>
          </Card.Content>
        </Card>
      </div>
    </div>
  )
}

export default DentistAnalytics
