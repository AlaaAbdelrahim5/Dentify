import { useState, useRef, useEffect } from 'react'
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
import { Card, Button, Input, DataTable, Select, StatsOverview, FilterBar, PageHeader } from '../../../components'
import PaymentModal from '../../../components/dentist/PaymentModal'
import { paymentsAPI, treatmentsAPI, patientsAPI } from '../../../services/api'

const DentistPayments = () => {
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
        paymentsAPI.getDentistPayments(),
        treatmentsAPI.getDentistTreatments()
      ])
      setPayments(paymentsRes.payments || [])
      setTreatments(treatmentsRes.treatments || [])
      
      // Extract unique patients from the dentist's treatments
      // Only include patients with IN_PROGRESS or COMPLETED treatments
      const patientMap = new Map()
      treatmentsRes.treatments?.forEach(treatment => {
        const status = treatment.status // This is already "IN_PROGRESS", "COMPLETED", or "CANCELLED" from DB
        if (status === 'IN_PROGRESS' || status === 'COMPLETED') {
          const patientId = treatment.patient.userId
          if (!patientMap.has(patientId)) {
            patientMap.set(patientId, treatment.patient)
          }
        }
      })
      
      setPatients(Array.from(patientMap.values()))
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Transform patients for display
  const mockPatients = patients.map(p => ({
    id: p.userId,
    name: `${p.firstName} ${p.lastName}`,
    phone: p.user?.phone || 'N/A'
  }))

  // Transform treatments for display
  const mockTreatments = treatments.map(t => ({
    id: t.id,
    patientId: t.patientId,
    patientName: `${t.patient.firstName} ${t.patient.lastName}`,
    treatmentType: t.treatmentType,
    totalAmount: t.totalAmount,
    treatmentDiscount: t.treatmentDiscount || 0,
    paidAmount: t.paidAmount,
    status: t.status.replace('_', ' '),
    creationDate: t.createdAt
  }))

  // Transform payments for display
  const mockPayments = payments.map(p => ({
    id: p.id,
    treatmentId: p.treatmentId,
    patientId: p.treatment.patientId,
    patientName: `${p.treatment.patient.firstName} ${p.treatment.patient.lastName}`,
    treatmentType: p.treatment.treatmentType,
    amount: p.amount,
    discount: p.discount || 0,
    paymentMethod: p.method, // Keep uppercase: 'CASH' or 'CARD'
    paymentDate: p.paymentDate,
    notes: p.notes || ''
  }))

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
    const matchesSearch = payment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.treatmentType.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPaymentMethod = selectedPaymentMethod === 'all' || payment.paymentMethod === selectedPaymentMethod
    
    const matchesPatient = selectedPatient === 'all' || payment.patientId === parseInt(selectedPatient)
    
    return matchesSearch && matchesPaymentMethod && matchesPatient
  })

  const getStats = () => {
    const dateFilteredPayments = filterPaymentsByDate(mockPayments)
    const total = dateFilteredPayments.reduce((sum, p) => sum + p.amount, 0)
    const totalDiscount = dateFilteredPayments.reduce((sum, p) => sum + p.discount, 0)
    const cashPayments = dateFilteredPayments.filter(p => p.paymentMethod === 'CASH').reduce((sum, p) => sum + p.amount, 0)
    const cardPayments = dateFilteredPayments.filter(p => p.paymentMethod === 'CARD').reduce((sum, p) => sum + p.amount, 0)
    const count = dateFilteredPayments.length
    
    return { total, totalDiscount, cashPayments, cardPayments, count }
  }

  const stats = getStats()

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
    // Create a printable invoice
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Invoice #${payment.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .invoice-details { margin-bottom: 20px; }
          .invoice-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .invoice-table th { background-color: #f4f4f4; }
          .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Payment Invoice</h1>
          <p>Invoice #${payment.id}</p>
        </div>
        <div class="invoice-details">
          <p><strong>Patient:</strong> ${payment.patientName}</p>
          <p><strong>Date:</strong> ${new Date(payment.paymentDate).toLocaleDateString()}</p>
          <p><strong>Treatment:</strong> ${payment.treatmentType}</p>
          <p><strong>Payment Method:</strong> ${payment.paymentMethod === 'CASH' ? 'Cash' : 'Card'}</p>
        </div>
        <table class="invoice-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${payment.treatmentType} - Payment</td>
              <td>$${payment.amount.toFixed(2)}</td>
            </tr>
            ${payment.discount > 0 ? `
            <tr>
              <td>Discount Applied to Treatment</td>
              <td style="color: #f97316;">$${payment.discount.toFixed(2)}</td>
            </tr>
            ` : ''}
          </tbody>
        </table>
        <div class="total">
          Total Paid: $${payment.amount.toFixed(2)}
          ${payment.discount > 0 ? `<br><small style="color: #f97316;">($${payment.discount.toFixed(2)} discount applied to treatment total)</small>` : ''}
        </div>
        ${payment.notes ? `<p><strong>Notes:</strong> ${payment.notes}</p>` : ''}
        <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #4F46E5; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Invoice</button>
      </body>
      </html>
    `)
    printWindow.document.close()
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
          value: `$${stats.total.toFixed(2)}`,
          icon: FaDollarSign,
          gradient: 'from-green-600 to-green-700'
        },
        {
          label: 'Total Discounts',
          value: `$${stats.totalDiscount.toFixed(2)}`,
          icon: FaFileInvoiceDollar,
          gradient: 'from-orange-600 to-orange-700'
        },
        {
          label: 'Cash Payments',
          value: `$${stats.cashPayments.toFixed(2)}`,
          icon: FaMoneyBillWave,
          gradient: 'from-emerald-600 to-emerald-700'
        },
        {
          label: 'Card Payments',
          value: `$${stats.cardPayments.toFixed(2)}`,
          icon: FaCreditCard,
          gradient: 'from-blue-600 to-blue-700'
        },
        {
          label: 'Transactions',
          value: stats.count,
          icon: FaChartLine,
          gradient: 'from-purple-600 to-purple-700'
        }
      ]} />

      {/* Patient Summary Section - Shows when patient filter is selected */}
      {selectedPatient !== 'all' && (
        <Card className={`p-6 ${isDarkMode ? 'bg-gradient-to-br from-teal-900/20 to-blue-900/20 border-teal-700' : 'bg-gradient-to-br from-teal-50 to-blue-50 border-teal-200'} border-2`}>
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
                      const balance = treatment.totalAmount - treatment.paidAmount
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
          searchPlaceholder="Search by patient name or treatment..."
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
        {filteredPayments.length === 0 ? (
          <div className="p-8 text-center">
            <FaMoneyBillWave className={`w-12 h-12 mx-auto mb-4 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <h3 className={`text-lg font-semibold mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              No payments found
            </h3>
            <p className={`${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              No payments match your current filters
            </p>
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

export default DentistPayments
