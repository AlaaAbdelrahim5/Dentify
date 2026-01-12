import { useState, useEffect } from 'react'
import {
  FaChartBar,
  FaUsers,
  FaUserMd,
  FaCalendarCheck,
  FaDollarSign,
  FaTooth,
  FaArrowUp,
  FaArrowDown,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf
} from 'react-icons/fa'
import { useTheme } from '../../../contexts/ThemeContext'
import { Card, LoadingSpinner, PageHeader } from '../../../components'
import {
  appointmentsAPI,
  dentistsAPI,
  treatmentsAPI,
  paymentsAPI
} from '../../../services/api'

const ClinicAnalytics = () => {
  const { isDarkMode } = useTheme()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalPatients: 0,
    totalDentists: 0,
    totalRevenue: 0,
    appointmentsThisMonth: 0,
    revenueThisMonth: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    pendingAppointments: 0,
    activeTreatments: 0
  })

  const [trends, setTrends] = useState({
    appointmentsTrend: 0,
    revenueTrend: 0,
    patientsTrend: 0
  })

  useEffect(() => {
    loadAnalyticsData()
  }, [])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)

      // Fetch all data in parallel
      const [
        appointmentsResponse,
        dentistsResponse,
        treatmentsResponse,
        paymentsResponse
      ] = await Promise.all([
        appointmentsAPI.getClinicAppointments().catch(() => ({ success: false, data: [] })),
        dentistsAPI.getForClinic().catch(() => ({ success: false, data: [] })),
        treatmentsAPI.getClinicTreatments().catch(() => ({ success: false, data: [] })),
        paymentsAPI.getClinicPayments().catch(() => ({ success: false, data: [] }))
      ])

      // Process appointments data
      const appointments = appointmentsResponse?.data || appointmentsResponse?.appointments || []
      const totalAppointments = appointments.length

      // Extract unique patients from treatments and appointments
      const treatments = treatmentsResponse?.data || treatmentsResponse?.treatments || []
      const patientMap = new Map()
      
      // Add patients from treatments
      treatments.forEach(treatment => {
        if (treatment.patient && treatment.patient.userId) {
          patientMap.set(treatment.patient.userId, {
            id: treatment.patient.userId,
            createdAt: treatment.patient.createdAt || treatment.patient.user?.createdAt
          })
        }
      })
      
      // Add patients from appointments (if not already added)
      appointments.forEach(apt => {
        if (apt.patient && apt.patient.userId && !patientMap.has(apt.patient.userId)) {
          patientMap.set(apt.patient.userId, {
            id: apt.patient.userId,
            createdAt: apt.patient.createdAt || apt.patient.user?.createdAt
          })
        }
      })
      
      const patients = Array.from(patientMap.values())
      const totalPatients = patients.length

      // Current month calculations
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

      const appointmentsThisMonth = appointments.filter(apt => {
        const aptDate = new Date(apt.date)
        return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear
      }).length

      const appointmentsLastMonth = appointments.filter(apt => {
        const aptDate = new Date(apt.date)
        return aptDate.getMonth() === lastMonth && aptDate.getFullYear() === lastMonthYear
      }).length

      // Appointment status counts
      const completedAppointments = appointments.filter(apt =>
        apt.status?.toLowerCase() === 'completed'
      ).length

      const cancelledAppointments = appointments.filter(apt =>
        apt.status?.toLowerCase() === 'cancelled'
      ).length

      const pendingAppointments = appointments.filter(apt =>
        apt.status?.toLowerCase() === 'scheduled' || apt.status?.toLowerCase() === 'confirmed'
      ).length

      const patientsThisMonth = patients.filter(patient => {
        if (!patient.createdAt) return false
        const createdDate = new Date(patient.createdAt)
        return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear
      }).length

      const patientsLastMonth = patients.filter(patient => {
        if (!patient.createdAt) return false
        const createdDate = new Date(patient.createdAt)
        return createdDate.getMonth() === lastMonth && createdDate.getFullYear() === lastMonthYear
      }).length

      // Dentists data
      const dentists = dentistsResponse?.data || []
      const activeDentists = dentists.filter(d =>
        d.user?.status?.toLowerCase() === 'active'
      ).length

      // Treatments data
      const activeTreatments = treatments.filter(t =>
        t.status?.toLowerCase() === 'in-progress' || t.status?.toLowerCase() === 'in_progress'
      ).length

      // Payments/Revenue data
      const payments = paymentsResponse?.data || []
      const totalRevenue = payments.reduce((sum, payment) =>
        sum + (parseFloat(payment.amount) || 0), 0
      )

      const revenueThisMonth = payments
        .filter(payment => {
          const paymentDate = new Date(payment.date || payment.createdAt)
          return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear
        })
        .reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0)

      const revenueLastMonth = payments
        .filter(payment => {
          const paymentDate = new Date(payment.date || payment.createdAt)
          return paymentDate.getMonth() === lastMonth && paymentDate.getFullYear() === lastMonthYear
        })
        .reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0)

      // Calculate trends (percentage change from last month)
      const appointmentsTrend = appointmentsLastMonth > 0
        ? ((appointmentsThisMonth - appointmentsLastMonth) / appointmentsLastMonth) * 100
        : appointmentsThisMonth > 0 ? 100 : 0

      const patientsTrend = patientsLastMonth > 0
        ? ((patientsThisMonth - patientsLastMonth) / patientsLastMonth) * 100
        : patientsThisMonth > 0 ? 100 : 0

      const revenueTrend = revenueLastMonth > 0
        ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
        : revenueThisMonth > 0 ? 100 : 0

      setStats({
        totalAppointments,
        totalPatients,
        totalDentists: activeDentists,
        totalRevenue,
        appointmentsThisMonth,
        revenueThisMonth,
        completedAppointments,
        cancelledAppointments,
        pendingAppointments,
        activeTreatments
      })

      setTrends({
        appointmentsTrend: Math.round(appointmentsTrend * 10) / 10,
        patientsTrend: Math.round(patientsTrend * 10) / 10,
        revenueTrend: Math.round(revenueTrend * 10) / 10
      })

    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ icon: Icon, label, value, subValue, trend, gradient, iconColor }) => (
    <Card className="p-6 hover:shadow-xl transition-shadow">
      {loading ? (
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-gray-300 dark:bg-gray-600 animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mb-2"></div>
                <div className="h-8 w-16 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {label}
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {value}
                </p>
              </div>
            </div>
            {subValue && (
              <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {subValue}
              </p>
            )}
            {trend !== undefined && trend !== null && (
              <div className="flex items-center gap-1 mt-2">
                {trend > 0 ? (
                  <>
                    <FaArrowUp className="w-3 h-3 text-green-500" />
                    <span className="text-sm font-semibold text-green-500">+{trend}%</span>
                  </>
                ) : trend < 0 ? (
                  <>
                    <FaArrowDown className="w-3 h-3 text-red-500" />
                    <span className="text-sm font-semibold text-red-500">{trend}%</span>
                  </>
                ) : (
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No change
                  </span>
                )}
                <span className={`text-xs ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  vs last month
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Analytics & Reports"
        description="Track your clinic's performance and key metrics"
      />

      {/* Key Metrics - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FaCalendarCheck}
          label="Appointments This Month"
          value={stats.appointmentsThisMonth}
          subValue={`Total: ${stats.totalAppointments} appointments`}
          trend={trends.appointmentsTrend}
          gradient="from-blue-600 to-blue-700"
        />

        <StatCard
          icon={FaDollarSign}
          label="Revenue This Month"
          value={`$${stats.revenueThisMonth.toLocaleString()}`}
          subValue={`Total: $${stats.totalRevenue.toLocaleString()}`}
          trend={trends.revenueTrend}
          gradient="from-green-600 to-green-700"
        />

        <StatCard
          icon={FaUsers}
          label="Total Patients"
          value={stats.totalPatients}
          trend={trends.patientsTrend}
          gradient="from-purple-600 to-purple-700"
        />

        <StatCard
          icon={FaUserMd}
          label="Active Dentists"
          value={stats.totalDentists}
          gradient="from-teal-600 to-cyan-600"
        />
      </div>

      {/* Appointment Status Breakdown */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <FaChartBar className="w-6 h-6 text-teal-600" />
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Appointment Status Overview
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`p-4 rounded-lg border ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-300 dark:bg-gray-600 animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-3 w-16 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mb-2"></div>
                    <div className="h-6 w-12 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center">
                <FaCheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Completed
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.completedAppointments}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center">
                <FaHourglassHalf className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Pending
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.pendingAppointments}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center">
                <FaTimesCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Cancelled
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.cancelledAppointments}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-600 to-orange-700 flex items-center justify-center">
                <FaTooth className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Active Treatments
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.activeTreatments}
                </p>
              </div>
            </div>
          </div>
        </div>
        )}
      </Card>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Performance Summary
          </h3>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                    <div className="h-4 w-12 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                  </div>
                  <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div className="h-full w-1/2 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Completion Rate
              </span>
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalAppointments > 0
                  ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100)
                  : 0}%
              </span>
            </div>
            <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-600 to-green-700"
                style={{
                  width: `${stats.totalAppointments > 0
                    ? (stats.completedAppointments / stats.totalAppointments) * 100
                    : 0}%`
                }}
              />
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Cancellation Rate
              </span>
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalAppointments > 0
                  ? Math.round((stats.cancelledAppointments / stats.totalAppointments) * 100)
                  : 0}%
              </span>
            </div>
            <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-700"
                style={{
                  width: `${stats.totalAppointments > 0
                    ? (stats.cancelledAppointments / stats.totalAppointments) * 100
                    : 0}%`
                }}
              />
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Average Revenue per Appointment
              </span>
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ${stats.completedAppointments > 0
                  ? Math.round(stats.totalRevenue / stats.completedAppointments)
                  : 0}
              </span>
            </div>
          </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Growth Trends
          </h3>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`p-4 rounded-lg ${
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                  <div className="h-4 w-40 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mb-2"></div>
                  <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Appointments Growth
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {trends.appointmentsTrend > 0 ? (
                      <FaArrowUp className="w-4 h-4 text-green-500" />
                    ) : trends.appointmentsTrend < 0 ? (
                      <FaArrowDown className="w-4 h-4 text-red-500" />
                    ) : null}
                    <span className={`text-lg font-bold ${
                      trends.appointmentsTrend > 0 ? 'text-green-500' :
                      trends.appointmentsTrend < 0 ? 'text-red-500' :
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {trends.appointmentsTrend > 0 ? '+' : ''}{trends.appointmentsTrend}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Revenue Growth
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {trends.revenueTrend > 0 ? (
                      <FaArrowUp className="w-4 h-4 text-green-500" />
                    ) : trends.revenueTrend < 0 ? (
                      <FaArrowDown className="w-4 h-4 text-red-500" />
                    ) : null}
                    <span className={`text-lg font-bold ${
                      trends.revenueTrend > 0 ? 'text-green-500' :
                      trends.revenueTrend < 0 ? 'text-red-500' :
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {trends.revenueTrend > 0 ? '+' : ''}{trends.revenueTrend}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Patient Growth
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {trends.patientsTrend > 0 ? (
                      <FaArrowUp className="w-4 h-4 text-green-500" />
                    ) : trends.patientsTrend < 0 ? (
                      <FaArrowDown className="w-4 h-4 text-red-500" />
                    ) : null}
                    <span className={`text-lg font-bold ${
                      trends.patientsTrend > 0 ? 'text-green-500' :
                      trends.patientsTrend < 0 ? 'text-red-500' :
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {trends.patientsTrend > 0 ? '+' : ''}{trends.patientsTrend}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default ClinicAnalytics
