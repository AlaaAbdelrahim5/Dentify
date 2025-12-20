import { FaTooth } from 'react-icons/fa'

const Logo = ({ className = "", size = "text-3xl" }) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="bg-linear-to-r from-teal-500 to-cyan-600 p-3 rounded-xl shadow-lg">
        <FaTooth className={`${size} text-white`} />
      </div>
      <div className="flex flex-col">
        <h1 className={`${size} font-bold bg-linear-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent`}>
          Dentify
        </h1>
        <p className="text-sm text-gray-600 font-medium">Dental Clinic Management</p>
      </div>
    </div>
  )
}

export default Logo