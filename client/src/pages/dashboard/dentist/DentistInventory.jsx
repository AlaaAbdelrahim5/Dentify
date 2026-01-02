import { useState, useMemo } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import {
  FaBoxes,
  FaSearch,
  FaExclamationTriangle,
  FaHistory,
  FaChartLine,
  FaDownload,
  FaWarehouse,
  FaClipboardCheck,
  FaTimes,
  FaSave,
  FaEye
} from 'react-icons/fa'
import { Card, Button, Input, PageHeader, Toast, StatsOverview, ViewItemModal, BaseModal, StatusBadge, FilterBar } from '../../../components'
import { useDebounce } from '../../../hooks'

const DentistInventory = () => {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('items') // items, usage, alerts
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [filtering, setFiltering] = useState(false)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [isRecordUsageModalOpen, setIsRecordUsageModalOpen] = useState(false)
  const [isViewItemModalOpen, setIsViewItemModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [toast, setToast] = useState(null)
  const [usageForm, setUsageForm] = useState({
    itemId: '',
    quantity: '',
    patientName: '',
    treatment: '',
    notes: ''
  })

  // Mock data - will be replaced with API calls
  const [inventoryItems] = useState([
    {
      id: 1,
      name: 'Dental Composite Resin',
      category: 'Filling Materials',
      quantity: 15,
      unit: 'units',
      minQuantity: 10,
      price: 45.00,
      supplier: 'Dental Supply Co.',
      lastRestocked: '2024-11-15',
      expiryDate: '2025-12-31',
      status: 'adequate'
    },
    {
      id: 2,
      name: 'Anesthetic Cartridges',
      category: 'Anesthetics',
      quantity: 5,
      unit: 'boxes',
      minQuantity: 8,
      price: 35.00,
      supplier: 'Medical Supplies Inc.',
      lastRestocked: '2024-10-20',
      expiryDate: '2025-06-30',
      status: 'low'
    },
    {
      id: 3,
      name: 'Disposable Gloves',
      category: 'PPE',
      quantity: 50,
      unit: 'boxes',
      minQuantity: 20,
      price: 12.00,
      supplier: 'Safety First',
      lastRestocked: '2024-11-28',
      expiryDate: '2026-12-31',
      status: 'adequate'
    },
    {
      id: 4,
      name: 'Dental Impression Material',
      category: 'Impression Materials',
      quantity: 3,
      unit: 'kits',
      minQuantity: 5,
      price: 89.00,
      supplier: 'Dental Supply Co.',
      lastRestocked: '2024-09-10',
      expiryDate: '2025-09-30',
      status: 'critical'
    },
    {
      id: 5,
      name: 'Dental Cement',
      category: 'Cements',
      quantity: 8,
      unit: 'units',
      minQuantity: 6,
      price: 28.00,
      supplier: 'ProDent Materials',
      lastRestocked: '2024-11-01',
      expiryDate: '2025-11-30',
      status: 'adequate'
    }
  ])

  // Usage history for this dentist
  const [usageHistory] = useState([
    {
      id: 1,
      itemName: 'Dental Composite Resin',
      quantity: 2,
      unit: 'units',
      patient: 'John Doe',
      treatment: 'Dental Filling',
      date: '2024-11-28',
      notes: 'Used for posterior filling'
    },
    {
      id: 2,
      itemName: 'Anesthetic Cartridges',
      quantity: 1,
      unit: 'box',
      patient: 'Jane Smith',
      treatment: 'Root Canal',
      date: '2024-11-27',
      notes: 'Standard procedure'
    }
  ])

  // Calculate stats
  const stats = useMemo(() => {
    const totalItems = inventoryItems.length
    const lowStock = inventoryItems.filter(item => item.status === 'low' || item.status === 'critical').length
    const totalValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    const criticalItems = inventoryItems.filter(item => item.status === 'critical').length

    return {
      totalItems,
      lowStock,
      totalValue,
      criticalItems
    }
  }, [inventoryItems])

  // Filter items
  const filteredItems = useMemo(() => {
    return inventoryItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                          item.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus
      
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [inventoryItems, debouncedSearchTerm, selectedCategory, selectedStatus])

  const categories = ['all', ...new Set(inventoryItems.map(item => item.category))]

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedStatus('all')
  }

  const handleRecordUsage = () => {
    // Mock usage recording - will be replaced with API call
    setToast({ type: 'success', message: 'Material usage recorded successfully!' })
    setIsRecordUsageModalOpen(false)
    setUsageForm({ itemId: '', quantity: '', patientName: '', treatment: '', notes: '' })
  }

  const handleViewItem = (item) => {
    setSelectedItem(item)
    setIsViewItemModalOpen(true)
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

      {/* Header */}
      <PageHeader
        title="Inventory Overview"
        description="View clinic inventory and record material usage"
        action={{
          label: 'Record Usage',
          onClick: () => setIsRecordUsageModalOpen(true),
          icon: FaClipboardCheck,
          gradient: 'from-teal-600 to-cyan-600'
        }}
      />

      {/* Stats Overview */}
      <StatsOverview stats={[
        {
          label: 'Total Items',
          value: stats.totalItems,
          icon: FaBoxes,
          gradient: 'from-blue-600 to-cyan-600'
        },
        {
          label: 'Low Stock Alerts',
          value: stats.lowStock,
          icon: FaExclamationTriangle,
          gradient: 'from-orange-600 to-red-600'
        },
        {
          label: 'Total Value',
          value: `$${stats.totalValue.toFixed(0)}`,
          icon: FaChartLine,
          gradient: 'from-green-600 to-emerald-600'
        },
        {
          label: 'Critical Items',
          value: stats.criticalItems,
          icon: FaWarehouse,
          gradient: 'from-purple-600 to-pink-600'
        }
      ]} />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'items', label: 'Available Items', icon: FaBoxes },
          { id: 'usage', label: 'My Usage History', icon: FaHistory },
          { id: 'alerts', label: 'Low Stock Alerts', icon: FaExclamationTriangle }
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

      {/* Inventory Items Tab */}
      {activeTab === 'items' && (
        <div className="space-y-6">
          {/* Filters */}
          <Card className="p-4">
            <FilterBar
              searchTerm={searchTerm}
              onSearchChange={(e) => setSearchTerm(e.target.value)}
              debouncedSearchTerm={debouncedSearchTerm}
              searchPlaceholder="Search items by name or category..."
              filters={[
                {
                  value: selectedCategory,
                  onChange: (e) => setSelectedCategory(e.target.value),
                  options: categories.map(cat => ({
                    value: cat,
                    label: cat === 'all' ? 'All Categories' : cat
                  })),
                  placeholder: 'Category'
                },
                {
                  value: selectedStatus,
                  onChange: (e) => setSelectedStatus(e.target.value),
                  options: [
                    { value: 'all', label: 'All Status' },
                    { value: 'adequate', label: 'Adequate' },
                    { value: 'low', label: 'Low Stock' },
                    { value: 'critical', label: 'Critical' }
                  ],
                  placeholder: 'Stock Status'
                }
              ]}
            onClearFilters={handleClearFilters}
            filtering={filtering}
          />
          </Card>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
                <Card.Content className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.name}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.category}
                      </p>
                    </div>
                    <StatusBadge 
                      status={item.status} 
                      label={item.status === 'adequate' ? 'Adequate' : item.status === 'low' ? 'Low Stock' : 'Critical'}
                    />
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Quantity:
                      </span>
                      <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Min. Quantity:
                      </span>
                      <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.minQuantity} {item.unit}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Price per unit:
                      </span>
                      <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Value:
                      </span>
                      <span className={`text-sm font-semibold text-green-600`}>
                        ${(item.quantity * item.price).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className={`pt-3 mb-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Supplier:
                      </span>
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {item.supplier}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Last Restocked:
                      </span>
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {new Date(item.lastRestocked).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Expiry Date:
                      </span>
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {new Date(item.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="flex-1 bg-linear-to-r from-blue-600 to-cyan-600"
                      onClick={() => handleViewItem(item)}
                    >
                      <FaEye className="mr-2" />
                      View Details
                    </Button>
                  </div>
                </Card.Content>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Usage History Tab */}
      {activeTab === 'usage' && (
        <div className="space-y-6">
          <Card>
            <Card.Header className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                My Usage History
              </h3>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Track your materials consumption during treatments
              </p>
            </Card.Header>
            <Card.Content className="p-6">
              <div className="space-y-3">
                {usageHistory.map(usage => (
                  <div
                    key={usage.id}
                    className={`p-4 rounded-lg border ${
                      isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {usage.itemName}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400`}>
                            {usage.quantity} {usage.unit}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Patient:</p>
                            <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {usage.patient}
                            </p>
                          </div>
                          <div>
                            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Treatment:</p>
                            <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {usage.treatment}
                            </p>
                          </div>
                          <div>
                            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Date:</p>
                            <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {new Date(usage.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        {usage.notes && (
                          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                            Note: {usage.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {filteredItems
            .filter(item => item.status === 'low' || item.status === 'critical')
            .map(item => (
              <Card key={item.id} className={`border-l-4 ${
                item.status === 'critical' ? 'border-red-600' : 'border-yellow-600'
              }`}>
                <Card.Content className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        item.status === 'critical'
                          ? 'bg-red-100 dark:bg-red-900/30'
                          : 'bg-yellow-100 dark:bg-yellow-900/30'
                      }`}>
                        <FaExclamationTriangle className={`text-2xl ${
                          item.status === 'critical' ? 'text-red-600' : 'text-yellow-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {item.name}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Current: {item.quantity} {item.unit} | Minimum: {item.minQuantity} {item.unit}
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          Category: {item.category} • Supplier: {item.supplier}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      item.status === 'critical'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      {item.status === 'critical' ? 'Critical' : 'Low Stock'}
                    </span>
                  </div>
                </Card.Content>
              </Card>
            ))}
        </div>
      )}

      {/* Record Usage Modal */}
      <BaseModal
        isOpen={isRecordUsageModalOpen}
        onClose={() => setIsRecordUsageModalOpen(false)}
        title="Record Material Usage"
        subtitle="Record materials used during patient treatment"
      >
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleRecordUsage(); }}>
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Item *
            </label>
            <select
              value={usageForm.itemId}
              onChange={(e) => setUsageForm({...usageForm, itemId: e.target.value})}
              className={`w-full px-4 py-2 border rounded-lg ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              required
            >
              <option value="">Select an item</option>
              {inventoryItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} (Available: {item.quantity} {item.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Quantity Used *
            </label>
            <Input
              type="number"
              value={usageForm.quantity}
              onChange={(e) => setUsageForm({...usageForm, quantity: e.target.value})}
              placeholder="Enter quantity"
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Patient Name *
            </label>
            <Input
              type="text"
              value={usageForm.patientName}
              onChange={(e) => setUsageForm({...usageForm, patientName: e.target.value})}
              placeholder="Enter patient name"
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Treatment Type *
            </label>
            <Input
              type="text"
              value={usageForm.treatment}
              onChange={(e) => setUsageForm({...usageForm, treatment: e.target.value})}
              placeholder="e.g., Dental Filling, Root Canal"
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Notes (Optional)
            </label>
            <textarea
              value={usageForm.notes}
              onChange={(e) => setUsageForm({...usageForm, notes: e.target.value})}
              placeholder="Additional notes about usage"
              rows={3}
              className={`w-full px-4 py-2 border rounded-lg ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRecordUsageModalOpen(false)}
              className="flex-1"
            >
              <FaTimes className="mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 bg-linear-to-r from-teal-600 to-cyan-600"
            >
              <FaSave className="mr-2" />
              Save Usage
            </Button>
          </div>
        </form>
      </BaseModal>

      {/* View Item Modal */}
      <ViewItemModal
        isOpen={isViewItemModalOpen}
        onClose={() => {
          setIsViewItemModalOpen(false)
          setSelectedItem(null)
        }}
        item={selectedItem}
        canEdit={false}
      />
    </div>
  )
}

export default DentistInventory
