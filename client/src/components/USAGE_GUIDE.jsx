/**
 * REUSABLE DASHBOARD COMPONENTS - USAGE GUIDE
 * ============================================
 * 
 * This file demonstrates how to use the reusable dashboard components
 * across all dashboards (Admin, Clinic, Dentist, Patient).
 * 
 * Components included:
 * 1. PageHeader - Page title, description, and action button
 * 2. StatsOverview - Statistics cards in a grid
 * 3. FilterBar - Search and filter controls
 * 4. DataTable - Table with loading and empty states
 * 5. Pagination - Page navigation controls
 * 6. StatusBadge - Status indicator badge
 * 7. ActionButtons - Row action buttons
 * 8. ConfirmationModal - Confirmation dialog
 */

import { useState, useEffect, useRef } from 'react'
import { 
  FaUsers, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaPlus,
  FaEye,
  FaEdit,
  FaHospital
} from 'react-icons/fa'
import {
  PageHeader,
  StatsOverview,
  FilterBar,
  DataTable,
  Pagination,
  StatusBadge,
  ActionButtons,
  ConfirmationModal,
  Card
} from '../../../components'

const ExampleManagement = () => {
  // ==================== STATE ====================
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtering, setFiltering] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  })

  const searchTimeoutRef = useRef(null)

  // ==================== DEBOUNCE SEARCH ====================
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm])

  // ==================== FILTERS ====================
  const cities = [
    { value: 'ramallah', label: 'Ramallah' },
    { value: 'jerusalem', label: 'Jerusalem' },
    { value: 'bethlehem', label: 'Bethlehem' }
  ]

  const statusOptions = [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' }
  ]

  const filters = [
    {
      value: filterCity,
      onChange: (e) => {
        setFilterCity(e.target.value)
        setCurrentPage(1)
      },
      options: cities,
      placeholder: 'All Cities'
    },
    {
      value: filterStatus,
      onChange: (e) => {
        setFilterStatus(e.target.value)
        setCurrentPage(1)
      },
      options: statusOptions,
      placeholder: 'All Status'
    }
  ]

  const clearFilters = () => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
    setFilterCity('')
    setFilterStatus('')
    setCurrentPage(1)
  }

  // ==================== STATS CONFIGURATION ====================
  const statsConfig = [
    {
      label: 'Total Items',
      value: stats.total,
      icon: FaUsers,
      gradient: 'from-teal-600 to-cyan-600'
    },
    {
      label: 'Active Items',
      value: stats.active,
      icon: FaCheckCircle,
      gradient: 'from-green-600 to-green-700'
    },
    {
      label: 'Inactive Items',
      value: stats.inactive,
      icon: FaTimesCircle,
      gradient: 'from-red-600 to-red-700'
    }
  ]

  // ==================== TABLE CONFIGURATION ====================
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'location', label: 'Location' },
    { key: 'contact', label: 'Contact' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ]

  const renderRow = (item, index) => {
    // Define action buttons for each row
    const actions = [
      {
        icon: FaEye,
        onClick: () => handleView(item),
        title: 'View Details',
        variant: 'default'
      },
      {
        icon: FaEdit,
        onClick: () => handleEdit(item),
        title: 'Edit',
        variant: 'default'
      },
      {
        icon: item.isActive ? FaTimesCircle : FaCheckCircle,
        onClick: () => handleToggleStatus(item),
        title: item.isActive ? 'Deactivate' : 'Activate',
        variant: item.isActive ? 'warning' : 'success'
      }
    ]

    return (
      <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 flex items-center justify-center">
              <FaHospital className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {item.name}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900 dark:text-white">
            {item.city}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900 dark:text-white">
            {item.email}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {item.phone}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <StatusBadge isActive={item.isActive} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <ActionButtons actions={actions} />
        </td>
      </tr>
    )
  }

  // ==================== HANDLERS ====================
  const handleView = (item) => {
    console.log('View:', item)
  }

  const handleEdit = (item) => {
    console.log('Edit:', item)
  }

  const handleToggleStatus = (item) => {
    setSelectedItem(item)
    setConfirmAction(item.isActive ? 'deactivate' : 'activate')
    setShowConfirmModal(true)
  }

  const executeToggleStatus = async () => {
    try {
      // Your API call here
      console.log('Toggling status for:', selectedItem)
      setShowConfirmModal(false)
      setSelectedItem(null)
      setConfirmAction(null)
      // Refresh data
    } catch (error) {
      console.error('Error toggling status:', error)
    }
  }

  // ==================== RENDER ====================
  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <PageHeader
        title="Items Management"
        description="Manage and add items in the system"
        action={{
          label: 'Add New Item',
          onClick: () => console.log('Add new item'),
          icon: FaPlus,
          gradient: 'from-teal-600 to-cyan-600'
        }}
      />

      {/* STATISTICS OVERVIEW */}
      <StatsOverview stats={statsConfig} />

      {/* FILTER BAR */}
      <Card className="p-6">
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          debouncedSearchTerm={debouncedSearchTerm}
          filters={filters}
          onClearFilters={clearFilters}
          filtering={filtering}
          searchPlaceholder="Search for items..."
        />
      </Card>

      {/* DATA TABLE */}
      <DataTable
        columns={columns}
        data={items}
        renderRow={renderRow}
        loading={filtering}
        emptyMessage="No items yet"
        emptyIcon={FaHospital}
        emptyTitle="No items found"
        hasFilters={!!(searchTerm || filterCity || filterStatus)}
      />

      {/* PAGINATION */}
      <Card>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </Card>

      {/* CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false)
          setSelectedItem(null)
          setConfirmAction(null)
        }}
        onConfirm={executeToggleStatus}
        item={selectedItem}
        action={confirmAction}
        itemName={selectedItem?.name}
        itemType="Item"
      />
    </div>
  )
}

export default ExampleManagement

/**
 * USAGE EXAMPLES FOR EACH COMPONENT
 * ==================================
 * 
 * 1. PageHeader
 * --------------
 * <PageHeader
 *   title="Your Page Title"
 *   description="Optional description"
 *   action={{
 *     label: 'Button Text',
 *     onClick: () => {},
 *     icon: FaPlus,
 *     gradient: 'from-teal-600 to-cyan-600'
 *   }}
 * />
 * 
 * 2. StatsOverview
 * -----------------
 * <StatsOverview stats={[
 *   {
 *     label: 'Total Users',
 *     value: 100,
 *     icon: FaUsers,
 *     gradient: 'from-blue-600 to-indigo-600'
 *   }
 * ]} />
 * 
 * 3. FilterBar
 * ------------
 * <FilterBar
 *   searchTerm={searchTerm}
 *   onSearchChange={(e) => setSearchTerm(e.target.value)}
 *   debouncedSearchTerm={debouncedSearchTerm}
 *   filters={[
 *     {
 *       value: filterValue,
 *       onChange: (e) => setFilterValue(e.target.value),
 *       options: [{value: 'opt1', label: 'Option 1'}],
 *       placeholder: 'Select...'
 *     }
 *   ]}
 *   onClearFilters={() => {}}
 *   filtering={false}
 *   searchPlaceholder="Search..."
 * />
 * 
 * 4. DataTable
 * ------------
 * <DataTable
 *   columns={[{key: 'name', label: 'Name'}]}
 *   data={items}
 *   renderRow={(item) => <tr>...</tr>}
 *   loading={false}
 *   emptyMessage="No data"
 *   emptyIcon={FaIcon}
 *   emptyTitle="No results"
 *   hasFilters={true}
 * />
 * 
 * 5. Pagination
 * -------------
 * <Pagination
 *   currentPage={1}
 *   totalPages={10}
 *   onPageChange={(page) => setCurrentPage(page)}
 * />
 * 
 * 6. StatusBadge
 * --------------
 * <StatusBadge
 *   isActive={true}
 *   activeLabel="Active"
 *   inactiveLabel="Inactive"
 * />
 * 
 * 7. ActionButtons
 * ----------------
 * <ActionButtons actions={[
 *   {
 *     icon: FaEye,
 *     onClick: () => {},
 *     title: 'View',
 *     variant: 'default' // or 'success', 'danger', 'warning'
 *   }
 * ]} />
 * 
 * 8. ConfirmationModal
 * --------------------
 * <ConfirmationModal
 *   isOpen={true}
 *   onClose={() => {}}
 *   onConfirm={() => {}}
 *   item={selectedItem}
 *   action="activate" // or 'deactivate', 'delete'
 *   itemName="Item Name"
 *   itemType="Clinic" // or 'Admin', 'Dentist', etc.
 * />
 */
