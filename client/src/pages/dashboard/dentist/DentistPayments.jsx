import { useState, useRef } from 'react'
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
import { Card, Button, Input, DataTable, Select } from '../../../components'
import PaymentModal from '../../../components/dentist/PaymentModal'

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

  // Mock patients data
  const mockPatients = [
    { id: 1, name: 'John Smith', phone: '555-0101' },
    { id: 2, name: 'Sarah Johnson', phone: '555-0102' },
    { id: 3, name: 'Mike Wilson', phone: '555-0103' },
    { id: 4, name: 'Emily Davis', phone: '555-0104' },
    { id: 5, name: 'Robert Brown', phone: '555-0105' }
  ]

  // Mock treatments with patient linkage
  const mockTreatments = [
    {
      id: 1,
      patientId: 1,
      patientName: 'John Smith',
      treatmentType: 'Root Canal',
      totalAmount: 800.00,
      paidAmount: 400.00,
      status: 'In Progress',
      creationDate: '2024-01-15'
    },
    {
      id: 2,
      patientId: 2,
      patientName: 'Sarah Johnson',
      treatmentType: 'Cleaning',
      totalAmount: 120.00,
      paidAmount: 120.00,
      status: 'Completed',
      creationDate: '2024-02-01'
    },
    {
      id: 3,
      patientId: 3,
      patientName: 'Mike Wilson',
      treatmentType: 'Crown Installation',
      totalAmount: 1200.00,
      paidAmount: 1200.00,
      status: 'Completed',
      creationDate: '2024-01-10'
    },
    {
      id: 4,
      patientId: 4,
      patientName: 'Emily Davis',
      treatmentType: 'Extraction',
      totalAmount: 300.00,
      paidAmount: 0.00,
      status: 'In Progress',
      creationDate: '2024-02-10'
    },
    {
      id: 5,
      patientId: 5,
      patientName: 'Robert Brown',
      treatmentType: 'Filling',
      totalAmount: 450.00,
      paidAmount: 225.00,
      status: 'In Progress',
      creationDate: '2024-02-08'
    },
    {
      id: 6,
      patientId: 1,
      patientName: 'John Smith',
      treatmentType: 'Whitening',
      totalAmount: 400.00,
      paidAmount: 0.00,
      status: 'In Progress',
      creationDate: '2024-02-18'
    }
  ]

  // Mock payments data
  const mockPayments = [
    {
      id: 1,
      treatmentId: 1,
      patientId: 1,
      patientName: 'John Smith',
      treatmentType: 'Root Canal',
      amount: 200.00,
      paymentMethod: 'Cash',
      paymentDate: '2024-02-20',
      notes: 'Initial payment'
    },
    {
      id: 2,
      treatmentId: 1,
      patientId: 1,
      patientName: 'John Smith',
      treatmentType: 'Root Canal',
      amount: 200.00,
      paymentMethod: 'Card',
      paymentDate: '2024-02-22',
      notes: 'Second installment'
    },
    {
      id: 3,
      treatmentId: 2,
      patientId: 2,
      patientName: 'Sarah Johnson',
      treatmentType: 'Cleaning',
      amount: 120.00,
      paymentMethod: 'Card',
      paymentDate: '2024-02-01',
      notes: 'Full payment'
    },
    {
      id: 4,
      treatmentId: 3,
      patientId: 3,
      patientName: 'Mike Wilson',
      treatmentType: 'Crown Installation',
      amount: 600.00,
      paymentMethod: 'Card',
      paymentDate: '2024-01-10',
      notes: 'Down payment'
    },
    {
      id: 5,
      treatmentId: 3,
      patientId: 3,
      patientName: 'Mike Wilson',
      treatmentType: 'Crown Installation',
      amount: 600.00,
      paymentMethod: 'Cash',
      paymentDate: '2024-01-25',
      notes: 'Final payment'
    },
    {
      id: 6,
      treatmentId: 5,
      patientId: 5,
      patientName: 'Robert Brown',
      treatmentType: 'Filling',
      amount: 225.00,
      paymentMethod: 'Card',
      paymentDate: '2024-02-15',
      notes: 'Down payment'
    }
  ]

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
    const cashPayments = dateFilteredPayments.filter(p => p.paymentMethod === 'Cash').reduce((sum, p) => sum + p.amount, 0)
    const cardPayments = dateFilteredPayments.filter(p => p.paymentMethod === 'Card').reduce((sum, p) => sum + p.amount, 0)
    const count = dateFilteredPayments.length
    
    return { total, cashPayments, cardPayments, count }
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

  const handleSavePayment = (paymentData) => {
    console.log('New payment:', paymentData)
    // Here you would save to backend
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
          <p><strong>Payment Method:</strong> ${payment.paymentMethod}</p>
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
          </tbody>
        </table>
        <div class="total">
          Total Paid: $${payment.amount.toFixed(2)}
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
      header: 'Date',
      accessor: 'paymentDate',
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      header: 'Patient',
      accessor: 'patientName'
    },
    {
      header: 'Treatment',
      accessor: 'treatmentType'
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (value) => (
        <span className="font-semibold text-green-600 dark:text-green-400">
          ${value.toFixed(2)}
        </span>
      )
    },
    {
      header: 'Method',
      accessor: 'paymentMethod',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'Cash'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        }`}>
          {value}
        </span>
      )
    },
    {
      header: 'Notes',
      accessor: 'notes',
      render: (value) => value || '-'
    },
    {
      header: 'Actions',
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Payment Management
          </h1>
          <p className={`mt-1 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Track and manage treatment payments
          </p>
        </div>
        <Button variant="primary" onClick={() => handleAddPayment()}>
          <FaPlus className="w-4 h-4 mr-2" />
          Record Payment
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {selectedDateRange === 'all' ? 'Total' : 
                 selectedDateRange === 'today' ? 'Today' :
                 selectedDateRange === 'week' ? 'This Week' : 'This Month'} Revenue
              </p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>${stats.total.toFixed(2)}</p>
            </div>
            <FaDollarSign className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Cash Payments</p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>${stats.cashPayments.toFixed(2)}</p>
            </div>
            <FaMoneyBillWave className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Card Payments</p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>${stats.cardPayments.toFixed(2)}</p>
            </div>
            <FaCreditCard className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Transactions</p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>{stats.count}</p>
            </div>
            <FaChartLine className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Active Treatments - Quick Payment */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          Active Treatments - Quick Payment
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {getActiveTreatments().slice(0, 6).map(treatment => {
            const remainingBalance = treatment.totalAmount - treatment.paidAmount
            return (
              <div
                key={treatment.id}
                className={`p-4 rounded-lg border ${
                  isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className={`font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      {treatment.patientName}
                    </h3>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {treatment.treatmentType}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAddPayment(treatment)}
                  >
                    <FaPlus className="w-3 h-3 mr-1" />
                    Pay
                  </Button>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Total:
                    </span>
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      ${treatment.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Paid:
                    </span>
                    <span className="text-green-600 dark:text-green-400">
                      ${treatment.paidAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Balance:
                    </span>
                    <span className="text-orange-600 dark:text-orange-400">
                      ${remainingBalance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

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
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by patient name or treatment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={FaSearch}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className={`px-3 py-2 border rounded-lg ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Patients</option>
              {mockPatients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className={`px-3 py-2 border rounded-lg ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className={`px-3 py-2 border rounded-lg ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
            </select>
          </div>
        </div>
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
