import { useState, useRef } from 'react'
import { FaCamera, FaTrash, FaUser } from 'react-icons/fa'
import { useTheme } from '../../contexts/ThemeContext'
import { authUtils } from '../../utils/auth'
import { getImageUrl as getImageUrlHelper } from '../../utils/helpers'

const ProfileImageUpload = ({ currentImage, onImageUpdate, userName = "User" }) => {
  const { isDarkMode } = useTheme()
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState(currentImage)
  const fileInputRef = useRef(null)

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, GIF, or WebP)')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    try {
      setUploading(true)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)

      // Upload to server
      const token = authUtils.getAccessToken()
      const formData = new FormData()
      formData.append('profileImage', file)
      formData.append('oldImageUrl', currentImage || '')

      const response = await fetch('http://localhost:5000/api/upload/profile-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload image')
      }

      const data = await response.json()
      
      // Update parent component
      if (onImageUpdate) {
        onImageUpdate(data.imageUrl)
      }

      // Update user in localStorage to reflect in navbar
      authUtils.updateUser({ profileImage: data.imageUrl })
      
      // Trigger a custom event to notify Navbar to refresh
      window.dispatchEvent(new Event('profileImageUpdated'))

      alert('Profile image updated successfully!')
    } catch (error) {
      console.error('Error uploading image:', error)
      alert(error.message || 'Failed to upload image. Please try again.')
      setImagePreview(currentImage) // Revert preview on error
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = async () => {
    if (!imagePreview) return

    if (!confirm('Are you sure you want to delete your profile image?')) {
      return
    }

    try {
      setUploading(true)

      const token = authUtils.getAccessToken()
      const response = await fetch('http://localhost:5000/api/upload/profile-image', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete image')
      }

      setImagePreview(null)
      
      // Update parent component
      if (onImageUpdate) {
        onImageUpdate(null)
      }

      // Update user in localStorage
      authUtils.updateUser({ profileImage: null })
      
      // Trigger a custom event to notify Navbar to refresh
      window.dispatchEvent(new Event('profileImageUpdated'))

      alert('Profile image deleted successfully!')
    } catch (error) {
      console.error('Error deleting image:', error)
      alert(error.message || 'Failed to delete image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-6">
      <div className="relative group">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center overflow-hidden ${
          isDarkMode ? 'bg-teal-900' : 'bg-teal-100'
        } ${uploading ? 'opacity-50' : ''}`}>
          {imagePreview ? (
            <img 
              src={getImageUrlHelper(imagePreview)} 
              alt={userName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.parentElement.innerHTML = '<svg class="w-10 h-10 text-teal-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg>'
              }}
            />
          ) : (
            <FaUser className="w-10 h-10 text-teal-600" />
          )}
        </div>
        
        {/* Upload button */}
        <button
          onClick={handleImageClick}
          disabled={uploading}
          className={`absolute bottom-0 right-0 w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white hover:bg-teal-700 transition-colors ${
            uploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}
          title="Upload new image"
        >
          <FaCamera className="w-4 h-4" />
        </button>

        {/* Delete button - only show if there's an image */}
        {imagePreview && (
          <button
            onClick={handleDeleteImage}
            disabled={uploading}
            className={`absolute top-0 right-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100 ${
              uploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            }`}
            title="Delete image"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleImageChange}
          className="hidden"
          disabled={uploading}
        />
      </div>

      <div>
        <h3 className={`text-xl font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          {userName}
        </h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
          {uploading ? 'Uploading...' : 'Click camera icon to upload'}
        </p>
        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
          Max size: 5MB (JPEG, PNG, GIF, WebP)
        </p>
      </div>
    </div>
  )
}

export default ProfileImageUpload
