import { useState, useMemo } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import {
  FaBoxes,
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaExclamationTriangle,
  FaTruck,
  FaHistory,
  FaChartLine,
  FaFilter,
  FaDownload,
  FaWarehouse,
  FaShoppingCart,
  FaClipboardList,
  FaSave,
  FaCheck
} from 'react-icons/fa'
import { 
  Card, 
  Button, 
  Input, 
  PageHeader, 
  StatsOverview, 
  Toast,
  ItemModal,
  SupplierModal,
  ViewSupplierModal,
  SupplierItemsModal,
  CreatePurchaseOrderModal,
  ReorderItemModal,
  ViewItemModal,
  ConfirmationModal,
  FilterBar
} from '../../../components'
import { getTodayISO } from '../../../utils/helpers'
import { useDebounce } from '../../../hooks'

const ClinicInventory = () => {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('items') // items, suppliers, orders, usage, alerts
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [supplierFilter, setSupplierFilter] = useState('all')
  const [filtering, setFiltering] = useState(false)
  const [toast, setToast] = useState(null)
  
  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false)
  const [isViewSupplierModalOpen, setIsViewSupplierModalOpen] = useState(false)
  const [isSupplierItemsModalOpen, setIsSupplierItemsModalOpen] = useState(false)
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false)
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false)
  const [isViewItemModalOpen, setIsViewItemModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [itemToDelete, setItemToDelete] = useState(null)

  // Mock data - will be replaced with API calls
  const [inventoryItems, setInventoryItems] = useState([
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

  const [suppliers] = useState([
    {
      id: 1,
      name: 'Dental Supply Co.',
      contact: 'John Smith',
      email: 'john@dentalsupply.com',
      phone: '+1234567890',
      address: '123 Medical St, City',
      itemsCount: 12,
      lastOrder: '2024-11-20',
      status: 'active'
    },
    {
      id: 2,
      name: 'Medical Supplies Inc.',
      contact: 'Sarah Johnson',
      email: 'sarah@medsupplies.com',
      phone: '+1234567891',
      address: '456 Health Ave, City',
      itemsCount: 8,
      lastOrder: '2024-11-10',
      status: 'active'
    },
    {
      id: 3,
      name: 'Safety First',
      contact: 'Mike Wilson',
      email: 'mike@safetyfirst.com',
      phone: '+1234567892',
      address: '789 Safety Rd, City',
      itemsCount: 5,
      lastOrder: '2024-11-28',
      status: 'active'
    }
  ])

  const [purchaseOrders] = useState([
    {
      id: 1,
      orderNumber: 'PO-2024-001',
      supplier: 'Dental Supply Co.',
      items: 5,
      totalAmount: 450.00,
      orderDate: '2024-11-15',
      expectedDate: '2024-11-20',
      status: 'delivered'
    },
    {
      id: 2,
      orderNumber: 'PO-2024-002',
      supplier: 'Medical Supplies Inc.',
      items: 3,
      totalAmount: 280.00,
      orderDate: '2024-11-25',
      expectedDate: '2024-12-05',
      status: 'pending'
    }
  ])

  const [usageHistory] = useState([
    {
      id: 1,
      itemName: 'Dental Composite Resin',
      dentist: 'Dr. Sarah Johnson',
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
      dentist: 'Dr. Mike Wilson',
      quantity: 1,
      unit: 'box',
      patient: 'Jane Smith',
      treatment: 'Root Canal',
      date: '2024-11-27',
      notes: 'Standard procedure'
    },
    {
      id: 3,
      itemName: 'Disposable Gloves',
      dentist: 'Dr. Sarah Johnson',
      quantity: 3,
      unit: 'boxes',
      patient: 'Multiple patients',
      treatment: 'Various',
      date: '2024-11-26',
      notes: 'Daily usage'
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
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      const matchesSupplier = supplierFilter === 'all' || item.supplier === supplierFilter
      
      return matchesSearch && matchesCategory && matchesSupplier
    })
  }, [inventoryItems, searchTerm, selectedCategory, supplierFilter])

  const categories = ['all', ...new Set(inventoryItems.map(item => item.category))]
  const suppliersList = ['all', ...new Set(inventoryItems.map(item => item.supplier))]

  const getStatusBadge = (status) => {
    const statusConfig = {
      adequate: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Adequate' },
      low: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Low Stock' },
      critical: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Critical' }
    }
    const config = statusConfig[status] || statusConfig.adequate
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const handleAddItem = (itemData) => {
    // Mock implementation - will be replaced with API call
    const newItem = {
      id: inventoryItems.length + 1,
      ...itemData,
      supplier: suppliers.find(s => s.id === parseInt(itemData.supplierId))?.name || '',
      lastRestocked: getTodayISO(),
      status: parseInt(itemData.quantity) <= parseInt(itemData.minQuantity) 
        ? (parseInt(itemData.quantity) < parseInt(itemData.minQuantity) / 2 ? 'critical' : 'low')
        : 'adequate'
    }
    setInventoryItems(prev => [...prev, newItem])
    setToast({ type: 'success', message: 'Item added successfully!' })
    setIsItemModalOpen(false)
    setSelectedItem(null)
  }

  const handleEditItem = (updatedItem) => {
    // Mock implementation - will be replaced with API call
    setInventoryItems(prev => prev.map(item => 
      item.id === updatedItem.id 
        ? {
            ...updatedItem,
            supplier: suppliers.find(s => s.id === parseInt(updatedItem.supplierId))?.name || item.supplier,
            status: parseInt(updatedItem.quantity) <= parseInt(updatedItem.minQuantity)
              ? (parseInt(updatedItem.quantity) < parseInt(updatedItem.minQuantity) / 2 ? 'critical' : 'low')
              : 'adequate'
          }
        : item
    ))
    setToast({ type: 'success', message: 'Item updated successfully!' })
    setIsItemModalOpen(false)
    setSelectedItem(null)
  }

  const handleDeleteItem = (itemId) => {
    setInventoryItems(items => items.filter(item => item.id !== itemId))
    setToast({ type: 'success', message: 'Item deleted successfully!' })
    setIsDeleteModalOpen(false)
    setItemToDelete(null)
  }

  const confirmDelete = (item) => {
    setItemToDelete(item)
    setIsDeleteModalOpen(true)
  }

  const handleAddSupplier = (supplierData) => {
    // Mock implementation - will be replaced with API call
    const newSupplier = {
      id: suppliers.length + 1,
      ...supplierData,
      itemsCount: 0,
      lastOrder: getTodayISO(),
      status: 'active'
    }
    // This would update suppliers state if it was in useState
    setToast({ type: 'success', message: 'Supplier added successfully!' })
    setIsSupplierModalOpen(false)
  }

  const handleEditSupplier = (updatedSupplier) => {
    // Mock implementation - will be replaced with API call
    // This would update suppliers array in real implementation
    setToast({ type: 'success', message: 'Supplier updated successfully!' })
    setIsSupplierModalOpen(false)
    setSelectedSupplier(null)
  }

  const handleViewSupplier = (supplier) => {
    setSelectedSupplier(supplier)
    setIsViewSupplierModalOpen(true)
  }

  const handleEditFromSupplierView = (supplier) => {
    setIsViewSupplierModalOpen(false)
    setSelectedSupplier(supplier)
    setIsSupplierModalOpen(true)
  }

  const handleViewSupplierItems = (supplier) => {
    setSelectedSupplier(supplier)
    setIsSupplierItemsModalOpen(true)
  }

  const handleCreateOrder = (orderData) => {
    // Mock implementation - will be replaced with API call
    const newOrder = {
      id: purchaseOrders.length + 1,
      orderNumber: `PO-2024-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      supplier: suppliers.find(s => s.id === parseInt(orderData.supplierId))?.name || '',
      items: orderData.orderItems.length,
      totalAmount: orderData.totalAmount,
      orderDate: getTodayISO(),
      expectedDate: orderData.expectedDate,
      status: 'pending'
    }
    // This would update purchaseOrders state if it was in useState
    setToast({ type: 'success', message: 'Purchase order created successfully!' })
    setIsCreateOrderModalOpen(false)
  }

  const handleReorder = (reorderData) => {
    // Mock implementation - will be replaced with API call
    // This would create a new purchase order and update inventory
    const newOrder = {
      id: purchaseOrders.length + 1,
      orderNumber: `PO-2024-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      supplier: reorderData.supplierName,
      items: 1,
      totalAmount: reorderData.totalAmount,
      orderDate: getTodayISO(),
      expectedDate: reorderData.expectedDate,
      status: 'pending'
    }
    setToast({ type: 'success', message: `Reorder created for ${reorderData.itemName}!` })
    setIsReorderModalOpen(false)
    setSelectedItem(null)
  }

  const handleViewItem = (item) => {
    setSelectedItem(item)
    setIsViewItemModalOpen(true)
  }

  const handleEditFromView = (item) => {
    setIsViewItemModalOpen(false)
    setSelectedItem(item)
    setIsItemModalOpen(true)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedStatus('all')
    setSupplierFilter('all')
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
        title="Clinic Inventory Management"
        description="Manage clinic-wide inventory, supplies, and materials"
        action={{
          label: 'Add New Item',
          onClick: () => { setSelectedItem(null); setIsItemModalOpen(true); },
          icon: FaPlus,
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
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {[
          { id: 'items', label: 'Inventory Items', icon: FaBoxes },
          { id: 'suppliers', label: 'Suppliers', icon: FaTruck },
          { id: 'orders', label: 'Purchase Orders', icon: FaShoppingCart },
          { id: 'usage', label: 'Usage by Dentists', icon: FaHistory },
          { id: 'alerts', label: 'Stock Alerts', icon: FaExclamationTriangle }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
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
                type: 'select',
                value: selectedCategory,
                onChange: (e) => setSelectedCategory(e.target.value),
                options: categories.map(cat => ({
                  value: cat,
                  label: cat === 'all' ? 'All Categories' : cat
                })),
                placeholder: 'Filter by category'
              },
              {
                type: 'select',
                value: supplierFilter,
                onChange: (e) => setSupplierFilter(e.target.value),
                options: suppliersList.map(sup => ({
                  value: sup,
                  label: sup === 'all' ? 'All Suppliers' : sup
                })),
                placeholder: 'Filter by supplier'
              }
            ]}
            onClearFilters={handleClearFilters}
            filtering={filtering}
          />
          </Card>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
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
                    {getStatusBadge(item.status)}
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

                  <div className="space-y-2">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="w-full bg-linear-to-r from-blue-600 to-cyan-600"
                      onClick={() => handleViewItem(item)}
                    >
                      <FaBoxes className="mr-2" />
                      View Details
                    </Button>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedItem(item)
                          setIsItemModalOpen(true)
                        }}
                      >
                        <FaEdit className="mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => confirmDelete(item)}
                      >
                        <FaTrash className="mr-2" />
                        Delete
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="flex-1 bg-linear-to-r from-orange-600 to-red-600"
                        onClick={() => {
                          setSelectedItem(item)
                          setIsReorderModalOpen(true)
                        }}
                      >
                        <FaShoppingCart className="mr-2" />
                        Reorder
                      </Button>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Suppliers Tab */}
      {activeTab === 'suppliers' && (
        <div className="space-y-6">
          <div className="flex justify-end mb-4">
            <Button 
              variant="primary"
              className="bg-linear-to-r from-purple-600 to-pink-600"
              onClick={() => { setSelectedSupplier(null); setIsSupplierModalOpen(true); }}
            >
              <FaPlus className="mr-2" />
              Add Supplier
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map(supplier => (
              <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
                <Card.Content className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {supplier.name}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {supplier.contact}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400`}>
                      Active
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Email:</span>
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{supplier.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Phone:</span>
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{supplier.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Address:</span>
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{supplier.address}</span>
                    </div>
                  </div>

                  <div className={`pt-3 mb-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Items Supplied:
                      </span>
                      <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {supplier.itemsCount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Last Order:
                      </span>
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {new Date(supplier.lastOrder).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="w-full bg-linear-to-r from-purple-600 to-pink-600"
                      onClick={() => handleViewSupplier(supplier)}
                    >
                      <FaTruck className="mr-2" />
                      View Details
                    </Button>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedSupplier(supplier)
                          setIsSupplierModalOpen(true)
                        }}
                      >
                        <FaEdit className="mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewSupplierItems(supplier)}
                      >
                        <FaClipboardList className="mr-2" />
                        Items
                      </Button>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Purchase Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex justify-end mb-4">
            <Button 
              variant="primary"
              className="bg-linear-to-r from-green-600 to-emerald-600"
              onClick={() => setIsCreateOrderModalOpen(true)}
            >
              <FaPlus className="mr-2" />
              Create Purchase Order
            </Button>
          </div>

          <Card>
            <Card.Content className="p-6">
              <div className="space-y-4">
                {purchaseOrders.map(order => (
                  <div
                    key={order.id}
                    className={`p-4 rounded-lg border ${
                      isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {order.orderNumber}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'delivered'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Supplier:</p>
                            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {order.supplier}
                            </p>
                          </div>
                          <div>
                            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Items:</p>
                            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {order.items}
                            </p>
                          </div>
                          <div>
                            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Total Amount:</p>
                            <p className={`font-medium text-green-600`}>
                              ${order.totalAmount.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Expected:</p>
                            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {new Date(order.expectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {order.status === 'pending' && (
                          <Button variant="primary" size="sm" className="bg-linear-to-r from-green-600 to-emerald-600">
                            <FaCheck className="mr-2" />
                            Mark Received
                          </Button>
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

      {/* Usage by Dentists Tab */}
      {activeTab === 'usage' && (
        <div className="space-y-6">
          <Card>
            <Card.Header className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Inventory Usage by Dentists
              </h3>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Track material consumption by each dentist
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Dentist:</p>
                            <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {usage.dentist}
                            </p>
                          </div>
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
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-linear-to-r from-teal-600 to-cyan-600"
                    >
                      <FaShoppingCart className="mr-2" />
                      Create Purchase Order
                    </Button>
                  </div>
                </Card.Content>
              </Card>
            ))}
        </div>
      )}

      {/* Modals */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false)
          setSelectedItem(null)
        }}
        onSubmit={selectedItem ? handleEditItem : handleAddItem}
        item={selectedItem}
        suppliers={suppliers}
      />

      <SupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => {
          setIsSupplierModalOpen(false)
          setSelectedSupplier(null)
        }}
        onSubmit={selectedSupplier ? handleEditSupplier : handleAddSupplier}
        supplier={selectedSupplier}
      />

      <ViewSupplierModal
        isOpen={isViewSupplierModalOpen}
        onClose={() => {
          setIsViewSupplierModalOpen(false)
          setSelectedSupplier(null)
        }}
        supplier={selectedSupplier}
        onEdit={handleEditFromSupplierView}
        canEdit={true}
      />

      <SupplierItemsModal
        isOpen={isSupplierItemsModalOpen}
        onClose={() => {
          setIsSupplierItemsModalOpen(false)
          setSelectedSupplier(null)
        }}
        supplier={selectedSupplier}
        items={inventoryItems}
      />

      <CreatePurchaseOrderModal
        isOpen={isCreateOrderModalOpen}
        onClose={() => setIsCreateOrderModalOpen(false)}
        onSubmit={handleCreateOrder}
        suppliers={suppliers}
        items={inventoryItems}
      />

      <ReorderItemModal
        isOpen={isReorderModalOpen}
        onClose={() => {
          setIsReorderModalOpen(false)
          setSelectedItem(null)
        }}
        onSubmit={handleReorder}
        item={selectedItem}
        suppliers={suppliers}
      />

      <ViewItemModal
        isOpen={isViewItemModalOpen}
        onClose={() => {
          setIsViewItemModalOpen(false)
          setSelectedItem(null)
        }}
        item={selectedItem}
        onEdit={handleEditFromView}
        canEdit={true}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setItemToDelete(null)
        }}
        onConfirm={() => handleDeleteItem(itemToDelete.id)}
        item={itemToDelete}
        action="delete"
        itemName={itemToDelete?.name}
        itemType="Item"
      />
    </div>
  )
}

export default ClinicInventory
