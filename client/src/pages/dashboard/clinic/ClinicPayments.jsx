import { useState, useRef, useEffect, useMemo } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import {
  FaMoneyBillWave,
  FaPlus,
  FaSearch,
  FaCalendarAlt,
  FaDollarSign,
  FaCreditCard,
  FaFileInvoiceDollar,
  FaChartLine,
  FaFilter,
  FaPrint,
  FaUser,
  FaEye
} from 'react-icons/fa'
import { Card, Button, Input, DataTable, Select, StatsOverview, FilterBar, PageHeader, PaymentModal, generatePaymentReceipt } from '../../../components'
import { paymentsAPI, treatmentsAPI, patientsAPI } from '../../../services/api'
import { calculateRemainingBalance } from '../../../utils/helpers'

const ClinicPayments = () => {
  const { isDarkMode } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState('all')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all')
  const [selectedDateRange, setSelectedDateRange] = useState('all') // all, today, week, month
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedTreatment, setSelectedTreatment] = useState(null)
  const [viewPatientId, setViewPatientId] = useState(null)
  const printRef = useRef()

  // Data states
  const [payments, setPayments] = useState([])
  const [treatments, setTreatments] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch data on mount
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [paymentsRes, treatmentsRes] = await Promise.all([
        paymentsAPI.getClinicPayments(),
        treatmentsAPI.getClinicTreatments()
      ])
      console.log('=== PAYMENTS DATA ===')
      console.log('Payments response:', paymentsRes)
      console.log('Payments count:', paymentsRes.payments?.length || 0)
      console.log('=== TREATMENTS DATA ===')
      console.log('Treatments response:', treatmentsRes)
      console.log('Treatments count:', treatmentsRes.treatments?.length || 0)
      setPayments(paymentsRes.payments || [])
      setTreatments(treatmentsRes.treatments || [])
      
      // Extract unique patients from treatments that have unpaid balances
      const patientMap = new Map()
      console.log('Processing treatments for patients...')
      treatmentsRes.treatments?.forEach(treatment => {
        const remainingBalance = calculateRemainingBalance(treatment.totalAmount, treatment.paidAmount || 0, treatment.treatmentDiscount)
        console.log(`Treatment ${treatment.id}: Total=${treatment.totalAmount}, Discount=${treatment.treatmentDiscount || 0}, Paid=${treatment.paidAmount || 0}, Remaining=${remainingBalance}`)
        // Only include patients with treatments that have unpaid balances
        if (remainingBalance > 0) {
          const patientId = treatment.patient.userId
          console.log(`Adding patient ${patientId}: ${treatment.patient.firstName} ${treatment.patient.lastName}`)
          if (!patientMap.has(patientId)) {
            patientMap.set(patientId, treatment.patient)
          }
        }
      })
      
      const extractedPatients = Array.from(patientMap.values())
      console.log('Total patients with unpaid balances:', extractedPatients.length)
      setPatients(extractedPatients)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Transform patients for display - use useMemo for performance
  const mockPatients = useMemo(() => {
    const transformed = patients.map(p => ({
      id: p.userId,
      name: `${p.firstName} ${p.lastName}`,
      phone: p.user?.phone || 'N/A'
    }))
    console.log('mockPatients transformed:', transformed)
    return transformed
  }, [patients])

  // Transform treatments for display - use useMemo for performance
  const mockTreatments = useMemo(() => 
    treatments.map(t => ({
      id: t.id,
      patientId: t.patientId,
      patientName: `${t.patient.firstName} ${t.patient.lastName}`,
      dentistName: `Dr. ${t.dentist.firstName} ${t.dentist.lastName}`,
      treatmentType: t.treatmentType,
      totalAmount: t.totalAmount,
      treatmentDiscount: t.treatmentDiscount || 0,
      paidAmount: t.paidAmount,
      status: t.status.replace('_', ' '),
      creationDate: t.createdAt
    }))
  , [treatments])

  // Transform payments for display - use useMemo for performance
  const mockPayments = useMemo(() => 
    payments.map(p => ({
      id: p.id,
      treatmentId: p.treatmentId,
      patientId: p.treatment.patientId,
      patientName: `${p.treatment.patient.firstName} ${p.treatment.patient.lastName}`,
      dentistName: `Dr. ${p.treatment.dentist.firstName} ${p.treatment.dentist.lastName}`,
      clinicName: p.treatment.dentist.clinic?.clinicName || 'N/A',
      clinicLocation: p.treatment.dentist.clinic?.location || p.treatment.dentist.clinic?.city || 'N/A',
      treatmentType: p.treatment.treatmentType,
      amount: p.amount,
      discount: p.discount || 0,
      paymentMethod: p.method,
      paymentDate: p.paymentDate,
      notes: p.notes || ''
    }))
  , [payments])

  // Get patient summary (all treatments and total balance)
  const getPatientSummary = (patientId) => {
    const patientTreatments = mockTreatments.filter(t => t.patientId === patientId)
    const totalTreatmentAmount = patientTreatments.reduce((sum, t) => sum + t.totalAmount, 0)
    const totalPaidAmount = patientTreatments.reduce((sum, t) => sum + t.paidAmount, 0)
    const totalBalance = totalTreatmentAmount - totalPaidAmount
    const treatmentCount = patientTreatments.length
    const activeTreatments = patientTreatments.filter(t => t.status === 'In Progress')
    
    return {
      treatments: patientTreatments,
      totalTreatmentAmount,
      totalPaidAmount,
      totalBalance,
      treatmentCount,
      activeTreatments
    }
  }

  // Get active treatments (with balance > 0)
  const getActiveTreatments = () => {
    return mockTreatments.filter(t => t.totalAmount > t.paidAmount)
  }

  // Filter payments - use useMemo for performance
  const filteredPayments = useMemo(() => {
    let filtered = mockPayments

    // Date range filter
    if (selectedDateRange !== 'all') {
      const now = new Date()
      filtered = filtered.filter(payment => {
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

    // Other filters
    return filtered.filter(payment => {
      const matchesSearch = payment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           payment.treatmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           payment.dentistName.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesPaymentMethod = selectedPaymentMethod === 'all' || payment.paymentMethod === selectedPaymentMethod
      
      const matchesPatient = selectedPatient === 'all' || payment.patientId === parseInt(selectedPatient)
      
      return matchesSearch && matchesPaymentMethod && matchesPatient
    })
  }, [mockPayments, selectedDateRange, searchTerm, selectedPaymentMethod, selectedPatient])

  // Calculate stats - use useMemo for performance
  const stats = useMemo(() => {
    // Apply date filter for stats
    let dateFilteredPayments = mockPayments
    
    if (selectedDateRange !== 'all') {
      const now = new Date()
      dateFilteredPayments = mockPayments.filter(payment => {
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

    const total = dateFilteredPayments.reduce((sum, p) => sum + p.amount, 0)
    const totalDiscount = dateFilteredPayments.reduce((sum, p) => sum + p.discount, 0)
    const cashPayments = dateFilteredPayments.filter(p => p.paymentMethod === 'CASH').reduce((sum, p) => sum + p.amount, 0)
    const cardPayments = dateFilteredPayments.filter(p => p.paymentMethod === 'CARD').reduce((sum, p) => sum + p.amount, 0)
    const count = dateFilteredPayments.length
    
    return { total, totalDiscount, cashPayments, cardPayments, count }
  }, [mockPayments, selectedDateRange])

  const handleAddPayment = (treatment = null) => {
    setSelectedTreatment(treatment)
    setIsPaymentModalOpen(true)
  }

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false)
    setSelectedTreatment(null)
  }

  const handleSavePayment = async (paymentData) => {
    try {
      await paymentsAPI.create(paymentData)
      await fetchAllData()
      setIsPaymentModalOpen(false)
      setSelectedTreatment(null)
    } catch (error) {
      console.error('Error creating payment:', error)
      alert('Failed to create payment. Please try again.')
    }
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedPatient('all')
    setSelectedPaymentMethod('all')
    setSelectedDateRange('all')
  }

  const handlePrintInvoice = (payment) => {
    generatePaymentReceipt(payment)
  }

  const handleViewPatient = (patientId) => {
    setViewPatientId(viewPatientId === patientId ? null : patientId)
  }

  const columns = [
    {
      label: 'Date',
      accessor: 'paymentDate',
      render: (value) => (
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-gray-500 w-4 h-4" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      label: 'Patient',
      accessor: 'patientName',
      render: (value) => (
        <div className="flex items-center gap-2">
          <FaUser className="text-gray-500 w-4 h-4" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      label: 'Dentist',
      accessor: 'dentistName'
    },
    {
      label: 'Treatment',
      accessor: 'treatmentType'
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
      label: 'Discount',
      accessor: 'discount',
      render: (value) => (
        <span className={`font-semibold ${value > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'}`}>
          ${value.toFixed(2)}
        </span>
      )
    },
    {
      label: 'Method',
      accessor: 'paymentMethod',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'CASH'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        }`}>
          {value === 'CASH' ? '💵 Cash' : '💳 Card'}
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
        title="Payment Management"
        description="Track and manage treatment payments"
        action={{
          label: 'Record Payment',
          onClick: () => handleAddPayment(),
          icon: FaPlus,
          gradient: 'from-green-600 to-green-700'
        }}
      />

      {/* Stats Overview */}
      <StatsOverview stats={[
        {
          label: `${selectedDateRange === 'all' ? 'Total' : 
                   selectedDateRange === 'today' ? 'Today' :
                   selectedDateRange === 'week' ? 'This Week' : 'This Month'} Revenue`,
          value: loading ? '-' : `$${stats.total.toFixed(2)}`,
          icon: FaDollarSign,
          gradient: 'from-green-600 to-green-700'
        },
        {
          label: 'Total Discounts',
          value: loading ? '-' : `$${stats.totalDiscount.toFixed(2)}`,
          icon: FaFileInvoiceDollar,
          gradient: 'from-orange-600 to-orange-700'
        },
        {
          label: 'Cash Payments',
          value: loading ? '-' : `$${stats.cashPayments.toFixed(2)}`,
          icon: FaMoneyBillWave,
          gradient: 'from-emerald-600 to-emerald-700'
        },
        {
          label: 'Card Payments',
          value: loading ? '-' : `$${stats.cardPayments.toFixed(2)}`,
          icon: FaCreditCard,
          gradient: 'from-blue-600 to-blue-700'
        },
        {
          label: 'Transactions',
          value: loading ? '-' : stats.count,
          icon: FaChartLine,
          gradient: 'from-purple-600 to-purple-700'
        }
      ]} />

      {/* Patient Summary Section - Shows when patient filter is selected */}
      {selectedPatient !== 'all' && (
        <Card className={`p-6 ${isDarkMode ? 'bg-linear-to-br from-teal-900/20 to-blue-900/20 border-teal-700' : 'bg-linear-to-br from-teal-50 to-blue-50 border-teal-200'} border-2`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold flex items-center gap-2 ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              <FaUser className="text-teal-500" />
              Patient Financial Summary
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedPatient('all')}
            >
              Clear Filter
            </Button>
          </div>
          
          {(() => {
            const patient = mockPatients.find(p => p.id === parseInt(selectedPatient))
            const summary = getPatientSummary(parseInt(selectedPatient))
            
            return (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  isDarkMode ? 'bg-gray-800/50' : 'bg-white'
                }`}>
                  <h3 className={`font-semibold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    {patient?.name}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Total Treatments
                      </p>
                      <p className={`text-xl font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        {summary.treatmentCount}
                      </p>
                    </div>
                    <div>
                      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Total Cost
                      </p>
                      <p className={`text-xl font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        ${summary.totalTreatmentAmount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Total Paid
                      </p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        ${summary.totalPaidAmount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Total Balance
                      </p>
                      <p className={`text-xl font-bold ${
                        summary.totalBalance > 0
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        ${summary.totalBalance.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Patient's Treatments List */}
                <div>
                  <h4 className={`font-semibold mb-3 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    Treatment Details
                  </h4>
                  <div className="space-y-2">
                    {summary.treatments.map(treatment => {
                      const balance = calculateRemainingBalance(treatment.totalAmount, treatment.paidAmount)
                      return (
                        <div
                          key={treatment.id}
                          className={`p-4 rounded-lg border ${
                            isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h5 className={`font-semibold ${
                                  isDarkMode ? 'text-white' : 'text-gray-800'
                                }`}>
                                  {treatment.treatmentType}
                                </h5>
                                <span className={`px-2 py-0.5 rounded text-xs ${
                                  treatment.status === 'Completed'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}>
                                  {treatment.status}
                                </span>
                              </div>
                              <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {treatment.dentistName}
                              </p>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                    Total
                                  </p>
                                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                    ${treatment.totalAmount.toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                    Paid
                                  </p>
                                  <p className="text-green-600 dark:text-green-400">
                                    ${treatment.paidAmount.toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                    Balance
                                  </p>
                                  <p className={`font-semibold ${
                                    balance > 0
                                      ? 'text-orange-600 dark:text-orange-400'
                                      : 'text-green-600 dark:text-green-400'
                                  }`}>
                                    ${balance.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            {balance > 0 && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleAddPayment(treatment)}
                              >
                                <FaPlus className="w-3 h-3 mr-1" />
                                Pay
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })()}
        </Card>
      )}

      {/* Filters */}
      <Card className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          searchPlaceholder="Search by patient, dentist, or treatment..."
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
            }
          ]}
          onClearFilters={handleClearFilters}
        />
      </Card>

      {/* Payments Table */}
      <Card className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {loading ? (
          <div className="p-8 text-center">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
            <p className={`mt-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Loading payments...
            </p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-8 text-center">
            <FaMoneyBillWave className={`w-12 h-12 mx-auto mb-4 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <h3 className={`text-lg font-semibold mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {mockPayments.length === 0 ? 'No payments recorded yet' : 'No payments match your filters'}
            </h3>
            <p className={`mb-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {mockPayments.length === 0 
                ? 'Record your first payment to get started'
                : 'Try adjusting your search or filter criteria'}
            </p>
            {mockPayments.length === 0 && (
              <Button 
                variant="primary" 
                onClick={() => handleAddPayment()}
                className="bg-green-600 hover:bg-green-700"
              >
                <FaPlus className="w-4 h-4 mr-2" />
                Record First Payment
              </Button>
            )}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredPayments}
            emptyMessage="No payments found"
          />
        )}
      </Card>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        onSave={handleSavePayment}
        treatmentInfo={selectedTreatment}
        patients={mockPatients}
        treatments={mockTreatments}
      />
    </div>
  )
}

export default ClinicPayments
