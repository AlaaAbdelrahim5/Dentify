import { useState, useMemo } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import {
  FaFileInvoiceDollar,
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaFilter,
  FaDownload,
  FaReceipt,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaFileAlt
} from 'react-icons/fa'
import { 
  Card, 
  Button, 
  Input, 
  PageHeader, 
  StatsOverview, 
  Toast,
  AddInvoiceModal,
  AddExpenseModal,
  ConfirmationModal,
  FilterBar
} from '../../../components'
import { useDebounce } from '../../../hooks'

const ClinicExpenses = () => {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('invoices') // invoices, expenses
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [filtering, setFiltering] = useState(false)
  const [toast, setToast] = useState(null)
  
  // Modals state
  const [isAddInvoiceModalOpen, setIsAddInvoiceModalOpen] = useState(false)
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  // Mock suppliers data
  const suppliers = [
    { id: 1, name: 'Dental Supply Co.' },
    { id: 2, name: 'Medical Supplies Inc.' },
    { id: 3, name: 'Safety First' }
  ]

  // Mock data - Purchase Invoices (when orders are received)
  const [invoices, setInvoices] = useState([
    {
      id: 1,
      invoiceNumber: 'INV-2024-001',
      supplier: 'Dental Supply Co.',
      orderNumber: 'PO-2024-001',
      invoiceDate: '2024-11-20',
      dueDate: '2024-12-20',
      totalAmount: 1450.00,
      paidAmount: 1450.00,
      status: 'paid',
      items: [
        { name: 'Dental Composite Resin', quantity: 20, price: 45.00, total: 900.00 },
        { name: 'Anesthetic Cartridges', quantity: 10, price: 35.00, total: 350.00 },
        { name: 'Disposable Gloves', quantity: 10, price: 20.00, total: 200.00 }
      ],
      notes: 'All items received in good condition'
    },
    {
      id: 2,
      invoiceNumber: 'INV-2024-002',
      supplier: 'Medical Supplies Inc.',
      orderNumber: 'PO-2024-002',
      invoiceDate: '2024-11-25',
      dueDate: '2024-12-25',
      totalAmount: 890.00,
      paidAmount: 0.00,
      status: 'pending',
      items: [
        { name: 'Dental Impression Material', quantity: 10, price: 89.00, total: 890.00 }
      ],
      notes: 'Payment scheduled for next week'
    }
  ])

  // Mock data - General Expenses
  const [expenses, setExpenses] = useState([
    {
      id: 1,
      category: 'Utilities',
      description: 'Electricity Bill - November',
      amount: 250.00,
      date: '2024-11-05',
      paymentMethod: 'Bank Transfer',
      status: 'paid',
      receiptNumber: 'REC-2024-001'
    },
    {
      id: 2,
      category: 'Rent',
      description: 'Clinic Rent - December',
      amount: 2000.00,
      date: '2024-12-01',
      paymentMethod: 'Check',
      status: 'paid',
      receiptNumber: 'REC-2024-002'
    },
    {
      id: 3,
      category: 'Maintenance',
      description: 'Dental Chair Repair',
      amount: 350.00,
      date: '2024-11-15',
      paymentMethod: 'Cash',
      status: 'paid',
      receiptNumber: 'REC-2024-003'
    },
    {
      id: 4,
      category: 'Salaries',
      description: 'Staff Salaries - November',
      amount: 8500.00,
      date: '2024-11-30',
      paymentMethod: 'Bank Transfer',
      status: 'paid',
      receiptNumber: 'REC-2024-004'
    },
    {
      id: 5,
      category: 'Marketing',
      description: 'Social Media Advertising',
      amount: 150.00,
      date: '2024-11-10',
      paymentMethod: 'Credit Card',
      status: 'pending',
      receiptNumber: ''
    }
  ])

  // Statistics
  const stats = useMemo(() => {
    const totalInvoices = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0)
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const monthlyTotal = totalInvoices + totalExpenses

    return [
      {
        label: 'Total Invoices',
        value: `$${totalInvoices.toFixed(2)}`,
        icon: FaFileInvoiceDollar,
        color: 'blue',
        trend: '+12%'
      },
      {
        label: 'Pending Payments',
        value: `$${pendingInvoices.toFixed(2)}`,
        icon: FaReceipt,
        color: 'yellow',
        trend: `${invoices.filter(inv => inv.status === 'pending').length} invoices`
      },
      {
        label: 'Total Expenses',
        value: `$${totalExpenses.toFixed(2)}`,
        icon: FaMoneyBillWave,
        color: 'red',
        trend: '+8%'
      },
      {
        label: 'Monthly Total',
        value: `$${monthlyTotal.toFixed(2)}`,
        icon: FaCalendarAlt,
        color: 'purple',
        trend: 'This month'
      }
    ]
  }, [invoices, expenses])

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          invoice.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === 'all' || invoice.status === selectedStatus
      return matchesSearch && matchesStatus
    })
  }, [invoices, searchTerm, selectedStatus])

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          expense.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory
      const matchesStatus = selectedStatus === 'all' || expense.status === selectedStatus
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [expenses, searchTerm, selectedCategory, selectedStatus])

  const expenseCategories = ['all', 'Utilities', 'Rent', 'Maintenance', 'Salaries', 'Marketing', 'Equipment', 'Insurance', 'Other']

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedStatus('all')
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Paid' },
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Pending' },
      overdue: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Overdue' }
    }
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const handleAddInvoice = (invoiceData) => {
    // Mock implementation - will be replaced with API call
    const newInvoice = {
      id: invoices.length + 1,
      ...invoiceData
    }
    setInvoices(prev => [...prev, newInvoice])
    setToast({ type: 'success', message: 'Invoice added successfully!' })
    setIsAddInvoiceModalOpen(false)
  }

  const handleAddExpense = (expenseData) => {
    // Mock implementation - will be replaced with API call
    const newExpense = {
      id: expenses.length + 1,
      ...expenseData
    }
    setExpenses(prev => [...prev, newExpense])
    setToast({ type: 'success', message: 'Expense added successfully!' })
    setIsAddExpenseModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <PageHeader
        title="Expenses & Invoices"
        description="Manage purchase invoices and clinic expenses"
        icon={FaFileInvoiceDollar}
      />

      {/* Statistics */}
      <StatsOverview stats={stats} />

      {/* Tabs */}
      <Card>
        <Card.Content className="p-0">
          <div className={`flex border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'invoices'
                  ? isDarkMode
                    ? 'border-b-2 border-blue-500 text-blue-400 bg-gray-800/50'
                    : 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FaFileInvoiceDollar />
                <span>Purchase Invoices</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'expenses'
                  ? isDarkMode
                    ? 'border-b-2 border-blue-500 text-blue-400 bg-gray-800/50'
                    : 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FaMoneyBillWave />
                <span>General Expenses</span>
              </div>
            </button>
          </div>
        </Card.Content>
      </Card>

      {/* Purchase Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <Card>
            <Card.Header className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Purchase Invoices
                  </h3>
                  <Button 
                    variant="primary"
                    className="bg-linear-to-r from-blue-600 to-cyan-600"
                    onClick={() => setIsAddInvoiceModalOpen(true)}
                  >
                    <FaPlus className="mr-2" />
                    Add Invoice
                  </Button>
                </div>
                <FilterBar
                  searchTerm={searchTerm}
                  onSearchChange={(e) => setSearchTerm(e.target.value)}
                  debouncedSearchTerm={debouncedSearchTerm}
                  searchPlaceholder="Search invoices by number, supplier..."
                  filters={[
                    {
                      type: 'select',
                      value: selectedStatus,
                      onChange: (e) => setSelectedStatus(e.target.value),
                      options: [
                        { value: 'all', label: 'All Status' },
                        { value: 'paid', label: 'Paid' },
                        { value: 'pending', label: 'Pending' },
                        { value: 'overdue', label: 'Overdue' }
                      ],
                      placeholder: 'Filter by status'
                    }
                  ]}
                  onClearFilters={handleClearFilters}
                  filtering={filtering}
                />
              </div>
            </Card.Header>
          </Card>

          {/* Invoices List */}
          <div className="space-y-4">
            {filteredInvoices.map(invoice => (
              <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
                <Card.Content className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {invoice.invoiceNumber}
                          </h3>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Supplier: {invoice.supplier}
                          </p>
                          {invoice.orderNumber && (
                            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                              Order: {invoice.orderNumber}
                            </p>
                          )}
                        </div>
                        {getStatusBadge(invoice.status)}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Invoice Date:</p>
                          <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {new Date(invoice.invoiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <div>
                          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Due Date:</p>
                          <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <div>
                          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Total Amount:</p>
                          <p className={`font-semibold text-green-600 text-lg`}>
                            ${invoice.totalAmount.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Remaining:</p>
                          <p className={`font-semibold ${invoice.status === 'paid' ? 'text-green-600' : 'text-yellow-600'} text-lg`}>
                            ${(invoice.totalAmount - invoice.paidAmount).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {invoice.notes && (
                        <p className={`text-sm mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <FaFileAlt className="inline mr-2" />
                          {invoice.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex lg:flex-col gap-2">
                      <Button variant="outline" size="sm" className="flex-1 lg:flex-initial">
                        <FaFileAlt className="mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 lg:flex-initial">
                        <FaEdit className="mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 lg:flex-initial text-red-600 hover:bg-red-50">
                        <FaTrash className="mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* General Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <Card>
            <Card.Header className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    General Expenses
                  </h3>
                  <Button 
                    variant="primary"
                    className="bg-linear-to-r from-red-600 to-pink-600"
                    onClick={() => setIsAddExpenseModalOpen(true)}
                  >
                    <FaPlus className="mr-2" />
                    Add Expense
                  </Button>
                </div>
                <FilterBar
                  searchTerm={searchTerm}
                  onSearchChange={(e) => setSearchTerm(e.target.value)}
                  debouncedSearchTerm={debouncedSearchTerm}
                  searchPlaceholder="Search expenses by description or category..."
                  filters={[
                    {
                      type: 'select',
                      value: selectedCategory,
                      onChange: (e) => setSelectedCategory(e.target.value),
                      options: expenseCategories.map(cat => ({
                        value: cat,
                        label: cat === 'all' ? 'All Categories' : cat
                      })),
                      placeholder: 'Filter by category'
                    }
                  ]}
                  onClearFilters={handleClearFilters}
                  filtering={filtering}
                />
              </div>
            </Card.Header>
          </Card>

          {/* Expenses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExpenses.map(expense => (
              <Card key={expense.id} className="hover:shadow-lg transition-shadow">
                <Card.Content className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                        isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {expense.category}
                      </div>
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {expense.description}
                      </h3>
                    </div>
                    {getStatusBadge(expense.status)}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Amount:
                      </span>
                      <span className={`text-xl font-bold text-red-600`}>
                        ${expense.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Date:
                      </span>
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Payment:
                      </span>
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {expense.paymentMethod}
                      </span>
                    </div>
                    {expense.receiptNumber && (
                      <div className="flex justify-between items-center text-sm">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                          Receipt:
                        </span>
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                          {expense.receiptNumber}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <FaEdit className="mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:bg-red-50">
                      <FaTrash className="mr-2" />
                      Delete
                    </Button>
                  </div>
                </Card.Content>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <AddInvoiceModal
        isOpen={isAddInvoiceModalOpen}
        onClose={() => setIsAddInvoiceModalOpen(false)}
        onSubmit={handleAddInvoice}
        suppliers={suppliers}
      />

      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        onSubmit={handleAddExpense}
      />
    </div>
  )
}

export default ClinicExpenses
