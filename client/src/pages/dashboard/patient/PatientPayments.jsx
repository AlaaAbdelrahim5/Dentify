import { useState, useEffect } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import {
  FaMoneyBillWave,
  FaSearch,
  FaCalendarAlt,
  FaDollarSign,
  FaCreditCard,
  FaFileInvoiceDollar,
  FaChartLine,
  FaFilter,
  FaPrint,
  FaUserMd,
  FaTooth
} from 'react-icons/fa'
import { Card, Button, Input, DataTable, Select, FilterBar, PageHeader, generatePaymentReceipt, EmptyState, LoadingState } from '../../../components'
import { paymentsAPI, treatmentsAPI } from '../../../services/api'
import { useDebounce } from '../../../hooks'

const PatientPayments = () => {
  const { isDarkMode } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all')
  const [selectedDateRange, setSelectedDateRange] = useState('all') // all, today, week, month
  const [selectedTreatment, setSelectedTreatment] = useState('all')

  // Data states
  const [payments, setPayments] = useState([])
  const [treatments, setTreatments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtering, setFiltering] = useState(false)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [error, setError] = useState(null)

  // Fetch data when filters change
  useEffect(() => {
    if (!isFirstLoad) {
      fetchAllData(true)
    }
  }, [searchTerm, selectedPaymentMethod, selectedDateRange, selectedTreatment])

  // Initial load
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async (isFiltering = false) => {
    try {
      if (isFiltering) {
        setFiltering(true)
      } else {
        setLoading(true)
      }
      setError(null)
      const [paymentsRes, treatmentsRes] = await Promise.all([
        paymentsAPI.getPatientPayments(),
        treatmentsAPI.getPatientTreatments()
      ])
      setPayments(paymentsRes.payments || [])
      setTreatments(treatmentsRes.treatments || [])
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data. Please try again.')
    } finally {
      if (isFiltering) {
        setFiltering(false)
      } else {
        setLoading(false)
        setIsFirstLoad(false)
      }
    }
  }

  // Transform payments for display
  const mockPayments = payments.map(p => ({
    id: p.id,
    treatmentId: p.treatmentId,
    dentistName: `Dr. ${p.treatment.dentist.firstName} ${p.treatment.dentist.lastName}`,
    dentistSpecialization: p.treatment.dentist.specialization,
    clinicName: p.treatment.dentist.clinic?.clinicName || 'N/A',
    clinicLocation: p.treatment.dentist.clinic?.location || p.treatment.dentist.clinic?.city || 'N/A',
    treatmentName: p.treatment.treatmentName,
    amount: p.amount,
    paymentMethod: p.method, // 'CASH' or 'CARD'
    paymentDate: p.paymentDate,
    notes: p.notes || ''
  }))

  // Transform treatments for display
  const mockTreatments = treatments.map(t => ({
    id: t.id,
    dentistName: `Dr. ${t.dentist.firstName} ${t.dentist.lastName}`,
    treatmentName: t.treatmentName,
    totalAmount: t.totalAmount,
    paidAmount: t.paidAmount,
    status: t.status.replace('_', ' '),
    createdAt: t.createdAt
  }))

  const filterPaymentsByDate = (payments) => {
    if (selectedDateRange === 'all') return payments

    const now = new Date()
    return payments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate)
      
      switch (selectedDateRange) {
        case 'today':
          return paymentDate.toDateString() === now.toDateString()
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return paymentDate >= weekAgo
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          return paymentDate >= monthAgo
        default:
          return true
      }
    })
  }

  const filteredPayments = filterPaymentsByDate(mockPayments).filter(payment => {
    const matchesSearch = payment.dentistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.treatmentName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPaymentMethod = selectedPaymentMethod === 'all' || payment.paymentMethod === selectedPaymentMethod
    
    const matchesTreatment = selectedTreatment === 'all' || payment.treatmentId === parseInt(selectedTreatment)
    
    return matchesSearch && matchesPaymentMethod && matchesTreatment
  })

  // Get treatment summary
  const getTreatmentSummary = () => {
    const totalTreatmentCost = mockTreatments.reduce((sum, t) => sum + t.totalAmount, 0)
    const totalPaid = mockTreatments.reduce((sum, t) => sum + t.paidAmount, 0)
    const totalBalance = totalTreatmentCost - totalPaid
    
    return { totalTreatmentCost, totalPaid, totalBalance }
  }

  const treatmentSummary = getTreatmentSummary()

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedPaymentMethod('all')
    setSelectedDateRange('all')
    setSelectedTreatment('all')
  }

  const handlePrintInvoice = (payment) => {
    generatePaymentReceipt(payment)
  }

  const columns = [
    {
      label: 'Date',
      accessor: 'paymentDate',
      render: (value) => (
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-gray-500 w-4 h-4" />
          <span>{new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      )
    },
    {
      label: 'Dentist',
      accessor: 'dentistName',
      render: (value, payment) => (
        <div>
          <div className="flex items-center gap-2">
            <FaUserMd className="text-gray-500 w-4 h-4" />
            <span className="font-medium">{value}</span>
          </div>
          <span className="text-xs text-gray-500">{payment.dentistSpecialization}</span>
        </div>
      )
    },
    {
      label: 'Treatment',
      accessor: 'treatmentName',
      render: (value) => (
        <div className="flex items-center gap-2">
          <FaTooth className="text-gray-500 w-4 h-4" />
          <span>{value}</span>
        </div>
      )
    },
    {
      label: 'Amount',
      accessor: 'amount',
      render: (value) => (
        <span className="font-semibold text-green-600 dark:text-green-400">
          ${value.toFixed(2)}
        </span>
      )
    },
    {
      label: 'Method',
      accessor: 'paymentMethod',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
          value === 'CASH'
            ? 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400 border border-green-500/30'
            : 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/30'
        }`}>
          {value === 'CASH' ? (
            <>
              <FaMoneyBillWave className="w-3 h-3" />
              <span>Cash</span>
            </>
          ) : (
            <>
              <FaCreditCard className="w-3 h-3" />
              <span>Card</span>
            </>
          )}
        </span>
      )
    },
    {
      label: 'Notes',
      accessor: 'notes',
      render: (value) => value || '-'
    },
    {
      label: 'Actions',
      accessor: 'id',
      render: (value, payment) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePrintInvoice(payment)}
        >
          <FaPrint className="w-3 h-3 mr-1" />
          Invoice
        </Button>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Payment History"
        description="View your treatment payments and financial overview"
        icon={FaMoneyBillWave}
      />

      {/* Filters */}
      <Card className="p-4">
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          debouncedSearchTerm={debouncedSearchTerm}
          searchPlaceholder="Search by dentist name or treatment..."
          filtering={filtering}
          filters={[
            {
              value: selectedDateRange,
              onChange: (e) => setSelectedDateRange(e.target.value),
              options: [
                { value: 'all', label: 'All Time' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' }
              ],
              placeholder: 'Date Range'
            },
            {
              value: selectedPaymentMethod,
              onChange: (e) => setSelectedPaymentMethod(e.target.value),
              options: [
                { value: 'all', label: 'All Methods' },
                { value: 'CASH', label: 'Cash' },
                { value: 'CARD', label: 'Card' }
              ],
              placeholder: 'Payment Method'
            },
            {
              value: selectedTreatment,
              onChange: (e) => setSelectedTreatment(e.target.value),
              options: [
                { value: 'all', label: 'All Treatments' },
                ...mockTreatments.map(t => ({
                  value: t.id.toString(),
                  label: t.treatmentName
                }))
              ],
              placeholder: 'Treatment'
            }
          ]}
        onClearFilters={handleClearFilters}
      />
      </Card>

      {loading ? (
        <Card>
          <LoadingState message="Loading payment history..." />
        </Card>
      ) : filteredPayments.length === 0 ? (
        <EmptyState
          icon={FaMoneyBillWave}
            title="No payments found"
            description="No payments match your current filters"
          />
        ) : (
        <DataTable
          columns={columns}
          data={filteredPayments}
          loading={loading || filtering}
          emptyMessage="No payments found"
        />
      )}
    </div>
  )
}

export default PatientPayments
