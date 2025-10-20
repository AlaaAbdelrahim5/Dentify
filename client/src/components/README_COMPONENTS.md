# Reusable Dashboard Components

This directory contains reusable components designed to work across all dashboards (Admin, Clinic, Dentist, Patient) in the Dentify application.

## 📦 Components Overview

### 1. **PageHeader**
Displays page title, description, and an optional action button.

**Props:**
- `title` (string) - Page title
- `description` (string, optional) - Page description
- `action` (object, optional) - Action button configuration
  - `label` (string) - Button text
  - `onClick` (function) - Click handler
  - `icon` (ReactComponent, optional) - Icon component
  - `gradient` (string, optional) - Tailwind gradient classes

**Example:**
```jsx
<PageHeader
  title="Clinics Management"
  description="Manage and add registered clinics"
  action={{
    label: 'Add New Clinic',
    onClick: () => setShowModal(true),
    icon: FaPlus,
    gradient: 'from-teal-600 to-cyan-600'
  }}
/>
```

---

### 2. **StatsOverview**
Displays statistics cards in a responsive grid layout.

**Props:**
- `stats` (array) - Array of stat objects
  - `label` (string) - Stat label
  - `value` (number) - Stat value
  - `icon` (ReactComponent) - Icon component
  - `gradient` (string) - Tailwind gradient classes

**Example:**
```jsx
<StatsOverview stats={[
  {
    label: 'Total Clinics',
    value: 42,
    icon: FaHospital,
    gradient: 'from-teal-600 to-cyan-600'
  },
  {
    label: 'Active Clinics',
    value: 38,
    icon: FaCheckCircle,
    gradient: 'from-green-600 to-green-700'
  },
  {
    label: 'Inactive Clinics',
    value: 4,
    icon: FaTimesCircle,
    gradient: 'from-red-600 to-red-700'
  }
]} />
```

---

### 3. **FilterBar**
Provides search input, dynamic filters, and clear filters button.

**Props:**
- `searchTerm` (string) - Current search value
- `onSearchChange` (function) - Search change handler
- `debouncedSearchTerm` (string) - Debounced search value (for loading indicator)
- `filters` (array) - Array of filter configurations
  - `value` (string) - Current filter value
  - `onChange` (function) - Filter change handler
  - `options` (array) - Array of {value, label} objects
  - `placeholder` (string) - Placeholder text
  - `disabled` (boolean, optional) - Disable state
- `onClearFilters` (function) - Clear filters handler
- `filtering` (boolean) - Loading state
- `searchPlaceholder` (string, optional) - Search placeholder text

**Example:**
```jsx
<FilterBar
  searchTerm={searchTerm}
  onSearchChange={(e) => setSearchTerm(e.target.value)}
  debouncedSearchTerm={debouncedSearchTerm}
  filters={[
    {
      value: filterCity,
      onChange: (e) => setFilterCity(e.target.value),
      options: cities,
      placeholder: 'All Cities'
    },
    {
      value: filterStatus,
      onChange: (e) => setFilterStatus(e.target.value),
      options: statusOptions,
      placeholder: 'All Status'
    }
  ]}
  onClearFilters={clearFilters}
  filtering={filtering}
  searchPlaceholder="Search for clinics..."
/>
```

---

### 4. **DataTable**
Displays data in a table with loading and empty states.

**Props:**
- `columns` (array) - Column configurations
  - `key` (string) - Unique key
  - `label` (string) - Column header text
  - `className` (string, optional) - Additional classes
- `data` (array) - Data array
- `renderRow` (function) - Row render function (item, index) => JSX
- `loading` (boolean) - Loading state
- `emptyMessage` (string) - Empty state message
- `emptyIcon` (ReactComponent) - Empty state icon
- `emptyTitle` (string) - Empty state title
- `hasFilters` (boolean) - Whether filters are active

**Example:**
```jsx
<DataTable
  columns={[
    { key: 'name', label: 'Clinic' },
    { key: 'location', label: 'Location' },
    { key: 'contact', label: 'Contact' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ]}
  data={clinics}
  renderRow={(clinic, index) => (
    <tr key={clinic._id}>
      <td>{clinic.name}</td>
      {/* ... more cells ... */}
    </tr>
  )}
  loading={filtering}
  emptyMessage="No clinics yet"
  emptyIcon={FaHospital}
  emptyTitle="No clinics found"
  hasFilters={!!(searchTerm || filterCity || filterStatus)}
/>
```

---

### 5. **Pagination**
Displays pagination controls with page info and navigation buttons.

**Props:**
- `currentPage` (number) - Current page number
- `totalPages` (number) - Total number of pages
- `onPageChange` (function) - Page change handler
- `show` (boolean, optional) - Whether to show (defaults to totalPages > 1)

**Example:**
```jsx
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>
```

---

### 6. **StatusBadge**
Displays a status badge with icon and label.

**Props:**
- `isActive` (boolean) - Whether status is active
- `activeLabel` (string, optional) - Label for active state (default: 'Active')
- `inactiveLabel` (string, optional) - Label for inactive state (default: 'Inactive')
- `activeIcon` (ReactComponent, optional) - Custom active icon (default: FaCheckCircle)
- `inactiveIcon` (ReactComponent, optional) - Custom inactive icon (default: FaTimesCircle)

**Example:**
```jsx
<StatusBadge 
  isActive={clinic.isActive}
  activeLabel="Active"
  inactiveLabel="Inactive"
/>
```

---

### 7. **ActionButtons**
Displays a row of action buttons (View, Edit, Delete, etc.).

**Props:**
- `actions` (array) - Array of action configurations
  - `icon` (ReactComponent) - Icon component
  - `onClick` (function) - Click handler
  - `title` (string) - Tooltip text
  - `variant` (string, optional) - 'default', 'success', 'danger', 'warning'
  - `className` (string, optional) - Additional classes

**Example:**
```jsx
<ActionButtons actions={[
  {
    icon: FaEye,
    onClick: () => handleView(clinic),
    title: 'View Details',
    variant: 'default'
  },
  {
    icon: FaEdit,
    onClick: () => handleEdit(clinic),
    title: 'Edit',
    variant: 'default'
  },
  {
    icon: clinic.isActive ? FaTimesCircle : FaCheckCircle,
    onClick: () => handleToggle(clinic),
    title: clinic.isActive ? 'Deactivate' : 'Activate',
    variant: clinic.isActive ? 'warning' : 'success'
  }
]} />
```

---

### 8. **ConfirmationModal**
Modern confirmation dialog for activate/deactivate/delete actions.

**Props:**
- `isOpen` (boolean) - Modal visibility
- `onClose` (function) - Close handler
- `onConfirm` (function) - Confirm handler
- `item` (object) - Item being affected
- `action` (string) - 'activate', 'deactivate', or 'delete'
- `itemName` (string) - Name of the item to display
- `itemType` (string) - Type of item ('Clinic', 'Admin', 'Dentist', etc.)

**Example:**
```jsx
<ConfirmationModal
  isOpen={showConfirmModal}
  onClose={() => setShowConfirmModal(false)}
  onConfirm={executeToggleStatus}
  item={selectedClinic}
  action={confirmAction} // 'activate' or 'deactivate'
  itemName={selectedClinic?.name}
  itemType="Clinic"
/>
```

---

## 🎨 Design Consistency

All components follow these design principles:

1. **Dark Mode Support** - All components respect `isDarkMode` from ThemeContext
2. **Responsive Design** - Mobile-first approach with responsive grids
3. **Consistent Colors** - Uses Tailwind's color palette consistently
4. **Smooth Transitions** - Hover states and transitions for better UX
5. **Accessibility** - Proper ARIA labels and keyboard navigation

---

## 🚀 Usage Pattern

Here's a complete example of a management page using all components:

```jsx
import { useState, useEffect, useRef } from 'react'
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
} from '../../components'

const MyManagementPage = () => {
  // State management
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  // ... more state

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Management Page"
        description="Manage items"
        action={{
          label: 'Add New',
          onClick: () => setShowModal(true),
          icon: FaPlus,
          gradient: 'from-teal-600 to-cyan-600'
        }}
      />

      {/* Stats */}
      <StatsOverview stats={statsConfig} />

      {/* Filters */}
      <Card className="p-6">
        <FilterBar {...filterProps} />
      </Card>

      {/* Table */}
      <DataTable {...tableProps} />

      {/* Pagination */}
      <Card>
        <Pagination {...paginationProps} />
      </Card>

      {/* Modal */}
      <ConfirmationModal {...modalProps} />
    </div>
  )
}
```

---

## 📝 Notes

- All components are fully typed with JSDoc comments
- Components handle loading states automatically
- Empty states are built-in and customizable
- All components work with the existing theme system
- Components are optimized for performance

---

## 🔧 Customization

Each component accepts className props and can be extended with additional functionality. The components are designed to be flexible while maintaining consistency across the application.

For detailed examples, see `USAGE_GUIDE.jsx` in this directory.
