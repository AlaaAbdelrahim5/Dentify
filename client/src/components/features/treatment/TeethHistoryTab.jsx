import { useState, useMemo } from 'react'
import { 
  FaTooth, 
  FaCalendarAlt, 
  FaExclamationCircle,
  FaFilter,
  FaHistory,
  FaStethoscope,
  FaStickyNote,
  FaInfoCircle,
  FaDollarSign
} from 'react-icons/fa'
import { useTheme } from '../../../contexts/ThemeContext'
import { formatDate as formatDateHelper, safeJsonParse, ensureArray } from '../../../utils/helpers'
import ToothChart from './ToothChart'
import { Card, Select, StatusBadge, Button, DataTable } from '../../common'

const TeethHistoryTab = ({ treatments = [] }) => {
  const { isDarkMode } = useTheme()
  const [selectedTooth, setSelectedTooth] = useState(null)
  const [conditionFilter, setConditionFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [expandedEntry, setExpandedEntry] = useState(null)

  // Aggregate all teeth history from all treatments
  const teethHistoryMap = useMemo(() => {
    const historyMap = {}
    
    treatments.forEach(treatment => {
      const teethStatus = typeof treatment.teethStatus === 'string'
        ? ensureArray(safeJsonParse(treatment.teethStatus, []))
        : ensureArray(treatment.teethStatus)
      
      teethStatus.forEach(toothEntry => {
        const toothNumber = toothEntry.toothNumber
        
        if (!historyMap[toothNumber]) {
          historyMap[toothNumber] = []
        }

        historyMap[toothNumber].push({
          ...toothEntry,
          treatmentId: treatment.id,
          treatmentName: treatment.treatmentName,
          treatmentStatus: treatment.status,
          treatmentDate: treatment.createdAt,
          totalAmount: treatment.totalAmount,
          paidAmount: treatment.paidAmount
        })
      })
    })

    // Sort each tooth's history by date (most recent first)
    Object.keys(historyMap).forEach(toothNumber => {
      historyMap[toothNumber].sort((a, b) => {
        const dateA = new Date(a.diagnosedDate || a.treatmentDate)
        const dateB = new Date(b.diagnosedDate || b.treatmentDate)
        return dateB - dateA
      })
    })

    return historyMap
  }, [treatments])

  // Get teeth with history for the chart
  const toothConditions = useMemo(() => {
    const conditions = {}
    Object.keys(teethHistoryMap).forEach(toothNumber => {
      const history = teethHistoryMap[toothNumber]
      if (history && history.length > 0) {
        // Pass all conditions for this tooth
        conditions[toothNumber] = {
          allConditions: history.map(entry => ({
            status: entry.conditionStatus?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
            priority: entry.priority,
            date: entry.diagnosedDate || entry.treatmentDate,
            treatment: entry.treatmentName
          })),
          hasHistory: true,
          conditionCount: history.length
        }
      }
    })
    return conditions
  }, [teethHistoryMap])

  // Filter history based on selected tooth and filters
  const filteredHistory = useMemo(() => {
    if (!selectedTooth || !teethHistoryMap[selectedTooth]) return []

    let history = teethHistoryMap[selectedTooth]

    // Apply condition status filter
    if (conditionFilter !== 'all') {
      history = history.filter(entry => 
        entry.conditionStatus?.toLowerCase() === conditionFilter.toLowerCase()
      )
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      history = history.filter(entry => 
        entry.priority?.toLowerCase() === priorityFilter.toLowerCase()
      )
    }

    return history
  }, [selectedTooth, teethHistoryMap, conditionFilter, priorityFilter])

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return isDarkMode 
          ? 'bg-red-900/30 text-red-400 border-red-600' 
          : 'bg-red-100 text-red-700 border-red-400'
      case 'high':
        return isDarkMode 
          ? 'bg-orange-900/30 text-orange-400 border-orange-600' 
          : 'bg-orange-100 text-orange-700 border-orange-400'
      case 'medium':
        return isDarkMode 
          ? 'bg-yellow-900/30 text-yellow-400 border-yellow-600' 
          : 'bg-yellow-100 text-yellow-700 border-yellow-400'
      case 'low':
        return isDarkMode 
          ? 'bg-green-900/30 text-green-400 border-green-600' 
          : 'bg-green-100 text-green-700 border-green-400'
      default:
        return isDarkMode 
          ? 'bg-gray-900/30 text-gray-400 border-gray-600' 
          : 'bg-gray-100 text-gray-700 border-gray-400'
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return isDarkMode 
          ? 'bg-blue-900/30 text-blue-400 border-blue-600' 
          : 'bg-blue-100 text-blue-700 border-blue-400'
      case 'in progress':
        return isDarkMode 
          ? 'bg-green-900/30 text-green-400 border-green-600' 
          : 'bg-green-100 text-green-700 border-green-400'
      case 'cancelled':
        return isDarkMode 
          ? 'bg-red-900/30 text-red-400 border-red-600' 
          : 'bg-red-100 text-red-700 border-red-400'
      default:
        return isDarkMode 
          ? 'bg-gray-900/30 text-gray-400 border-gray-600' 
          : 'bg-gray-100 text-gray-700 border-gray-400'
    }
  }

  const handleToothSelect = (toothNumber) => {
    setSelectedTooth(toothNumber)
    setExpandedEntry(null)
  }

  const teethWithHistory = Object.keys(teethHistoryMap).map(Number)

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className={`p-4 rounded-lg border-l-4 ${
        isDarkMode 
          ? 'bg-teal-900/20 border-teal-600' 
          : 'bg-teal-50 border-teal-600'
      }`}>
        <div className="flex items-start gap-3">
          <FaInfoCircle className={`mt-0.5 shrink-0 ${
            isDarkMode ? 'text-teal-400' : 'text-teal-600'
          }`} />
          <div>
            <h4 className={`font-semibold mb-1 ${
              isDarkMode ? 'text-teal-400' : 'text-teal-700'
            }`}>
              Complete Dental History
            </h4>
            <p className={`text-sm ${
              isDarkMode ? 'text-teal-300/80' : 'text-teal-600/80'
            }`}>
              Click on any tooth in the chart below to view its complete treatment history across all procedures. 
              Colored teeth indicate historical records.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`p-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-linear-to-br from-purple-50 to-purple-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${
              isDarkMode ? 'bg-purple-900/30' : 'bg-purple-200'
            }`}>
              <FaTooth className="text-purple-600 text-xl" />
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Teeth with History
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {teethWithHistory.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className={`p-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-linear-to-br from-blue-50 to-blue-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${
              isDarkMode ? 'bg-blue-900/30' : 'bg-blue-200'
            }`}>
              <FaStethoscope className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Treatments
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {treatments.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className={`p-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-linear-to-br from-teal-50 to-teal-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${
              isDarkMode ? 'bg-teal-900/30' : 'bg-teal-200'
            }`}>
              <FaHistory className="text-teal-600 text-xl" />
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Records
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {Object.values(teethHistoryMap).reduce((sum, arr) => sum + arr.length, 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tooth Chart */}
      <ToothChart
        selectedTeeth={selectedTooth ? [selectedTooth] : []}
        onToothSelect={handleToothSelect}
        toothConditions={toothConditions}
        readOnly={false}
      />

      {/* Filters and History */}
      {selectedTooth && (
        <div className="space-y-4">
          {/* Header with Filters */}
          <Card className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'
                  }`}>
                    <FaTooth className="text-teal-600 text-xl" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      Tooth #{selectedTooth} History
                    </h3>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {filteredHistory.length} {filteredHistory.length === 1 ? 'record' : 'records'} found
                    </p>
                  </div>
                </div>
                {(conditionFilter !== 'all' || priorityFilter !== 'all') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setConditionFilter('all')
                      setPriorityFilter('all')
                    }}
                    className="flex items-center gap-2"
                  >
                    <FaFilter className="w-4 h-4" />
                    Clear Filters
                  </Button>
                )}
              </div>

              {/* Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Condition Filter */}
                <Select
                  value={conditionFilter}
                  onChange={(e) => setConditionFilter(e.target.value)}
                  placeholder="All Tooth Conditions"
                  icon={FaTooth}
                  options={[
                    { value: 'all', label: 'All Tooth Conditions' },
                    { value: 'healthy', label: 'Healthy' },
                    { value: 'cavity', label: 'Cavity' },
                    { value: 'root canal', label: 'Root Canal' },
                    { value: 'crown', label: 'Crown' },
                    { value: 'extraction', label: 'Extraction' },
                    { value: 'extracted', label: 'Extracted' },
                    { value: 'filling', label: 'Filling' },
                    { value: 'cleaning', label: 'Cleaning' },
                    { value: 'implant', label: 'Implant' },
                    { value: 'bridge', label: 'Bridge' },
                    { value: 'veneer', label: 'Veneer' }
                  ]}
                />

                {/* Priority Filter */}
                <Select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  placeholder="All Priorities"
                  icon={FaExclamationCircle}
                  options={[
                    { value: 'all', label: 'All Priorities' },
                    { value: 'urgent', label: 'Urgent' },
                    { value: 'high', label: 'High' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'low', label: 'Low' }
                  ]}
                />
              </div>
            </div>
          </Card>

          {/* History Table */}
          <DataTable
            columns={[
              {
                label: 'Date',
                accessor: 'diagnosedDate',
                render: (value, item) => (
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-gray-400" />
                    <span className="font-medium">{formatDate(value || item.treatmentDate)}</span>
                  </div>
                )
              },
              {
                label: 'Tooth Condition',
                accessor: 'conditionStatus',
                render: (value) => (
                  <span className={`font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    {value || 'N/A'}
                  </span>
                )
              },
              {
                label: 'Priority',
                accessor: 'priority',
                render: (value) => (
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                    getPriorityColor(value)
                  }`}>
                    <FaExclamationCircle className="w-3 h-3" />
                    {value || 'Normal'}
                  </span>
                )
              },
              {
                label: 'Treatment',
                accessor: 'treatmentName',
                render: (value, item) => (
                  <div>
                    <p className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      {value}
                    </p>
                    <p className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      ID: #{item.treatmentId}
                    </p>
                  </div>
                )
              },
              {
                label: 'Notes',
                accessor: 'notes',
                render: (value) => (
                  value ? (
                    <div className="flex items-start gap-2 max-w-xs">
                      <FaStickyNote className={`mt-0.5 shrink-0 text-sm ${
                        isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                      }`} />
                      <span className={`text-sm line-clamp-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {value}
                      </span>
                    </div>
                  ) : (
                    <span className={`text-sm italic ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      No notes
                    </span>
                  )
                )
              }
            ]}
            data={filteredHistory}
            loading={false}
            emptyIcon={FaHistory}
            emptyTitle="No records found"
            emptyMessage="No tooth history records match your filters"
            hasFilters={conditionFilter !== 'all' || priorityFilter !== 'all'}
          />

        </div>
      )}

      {/* No Tooth Selected State */}
      {!selectedTooth && teethWithHistory.length > 0 && (
        <Card className={`p-12 text-center ${
          isDarkMode ? 'bg-linear-to-br from-gray-800 to-gray-850 border border-gray-700' : 'bg-linear-to-br from-white to-gray-50 border border-gray-200'
        }`}>
          <div className={`inline-flex p-4 rounded-full mb-4 ${
            isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'
          }`}>
            <FaTooth className="text-5xl text-teal-600" />
          </div>
          <h3 className={`text-xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Select a tooth to view history
          </h3>
          <p className={`text-sm max-w-md mx-auto ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Click on any <span className="font-semibold text-teal-600">colored tooth</span> in the chart above to explore its complete treatment timeline, conditions, and clinical notes
          </p>
        </Card>
      )}

      {/* No History Available State */}
      {teethWithHistory.length === 0 && (
        <Card className={`p-12 text-center ${
          isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <div className={`inline-flex p-4 rounded-full mb-4 ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <FaHistory className={`text-5xl ${
              isDarkMode ? 'text-gray-600' : 'text-gray-400'
            }`} />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            No dental history available
          </h3>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            This patient has no recorded teeth treatments yet
          </p>
        </Card>
      )}
    </div>
  )
}

export default TeethHistoryTab
