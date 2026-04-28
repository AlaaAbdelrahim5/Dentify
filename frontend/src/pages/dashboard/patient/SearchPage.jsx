import { useState } from 'react'
import { FaUserMd, FaHospital } from 'react-icons/fa'
import { useTheme } from '../../../contexts/ThemeContext'
import { Button } from '../../../components'
import FindDentist from './FindDentist'
import FindClinic from './FindClinic'

const SearchPage = () => {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('dentists')

  const tabs = [
    { id: 'dentists', label: 'Find Dentists', icon: FaUserMd },
    { id: 'clinics', label: 'Find Clinics', icon: FaHospital }
  ]

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className={`border-b ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                variant={activeTab === tab.id ? 'primary' : 'ghost'}
                className={`flex items-center gap-2 border-b-2 rounded-none ${
                  activeTab === tab.id
                    ? isDarkMode
                      ? 'border-teal-500 text-teal-400'
                      : 'border-teal-600 text-teal-600'
                    : 'border-transparent'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'dentists' && <FindDentist />}
        {activeTab === 'clinics' && <FindClinic />}
      </div>
    </div>
  )
}

export default SearchPage
