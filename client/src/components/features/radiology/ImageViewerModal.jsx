import { useState, useEffect, useRef } from 'react'
import {
  FaTimes,
  FaSearchPlus,
  FaSearchMinus,
  FaUndo,
  FaRedo,
  FaExpand,
  FaCompress,
  FaDownload,
  FaSync,
  FaAdjust,
  FaRulerHorizontal,
  FaCrosshairs,
  FaImage,
  FaBars,
  FaArrowsAlt,
  FaSun,
  FaMoon,
  FaEye,
  FaLayerGroup,
  FaPalette,
  FaChevronLeft,
  FaChevronRight,
  FaRuler,
  FaDrawPolygon,
  FaArrowsAltV,
  FaArrowsAltH,
  FaBrain,
  FaRobot,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa'
import { HiSparkles } from 'react-icons/hi'
import { useTheme } from '../../../contexts/ThemeContext'
import { Button } from '../../common'
import * as dicomParser from 'dicom-parser'
import { authUtils } from '../../../utils/auth'

const ImageViewerModal = ({ isOpen, onClose, images = [], initialIndex = 0, patientName = '', imagingType = 'X-Ray' }) => {
  const { isDarkMode } = useTheme()
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [showTools, setShowTools] = useState(true)
  const [isInverted, setIsInverted] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [sharpness, setSharpness] = useState(0)
  const [saturation, setSaturation] = useState(100)
  const [flipHorizontal, setFlipHorizontal] = useState(false)
  const [flipVertical, setFlipVertical] = useState(false)
  const [windowLevel, setWindowLevel] = useState(50)
  const [windowWidth, setWindowWidth] = useState(50)
  const [activeToolGroup, setActiveToolGroup] = useState('transform') // 'transform', 'adjust', 'advanced'
  const [isDicom, setIsDicom] = useState(false)
  const [dicomImage, setDicomImage] = useState(null)
  const [isLoadingDicom, setIsLoadingDicom] = useState(false)
  
  // AI Analysis states
  const [showAIAnalysis, setShowAIAnalysis] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState(null)
  
  const containerRef = useRef(null)
  const imageRef = useRef(null)
  const canvasRef = useRef(null)

  // Add custom styles for sliders
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .slider-teal::-webkit-slider-thumb {
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: linear-gradient(135deg, #14b8a6, #06b6d4);
        cursor: pointer;
        box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.2), 0 4px 12px rgba(0, 0, 0, 0.3);
        transition: all 0.2s ease;
      }
      
      .slider-teal::-webkit-slider-thumb:hover {
        transform: scale(1.2);
        box-shadow: 0 0 0 6px rgba(20, 184, 166, 0.3), 0 6px 16px rgba(0, 0, 0, 0.4);
      }
      
      .slider-teal::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: linear-gradient(135deg, #14b8a6, #06b6d4);
        cursor: pointer;
        border: none;
        box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.2), 0 4px 12px rgba(0, 0, 0, 0.3);
        transition: all 0.2s ease;
      }
      
      .slider-teal::-moz-range-thumb:hover {
        transform: scale(1.2);
        box-shadow: 0 0 0 6px rgba(20, 184, 166, 0.3), 0 6px 16px rgba(0, 0, 0, 0.4);
      }
      
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(51, 65, 85, 0.5);
        border-radius: 10px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #14b8a6, #06b6d4);
        border-radius: 10px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, #0d9488, #0891b2);
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      
      .animate-pulse {
        animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  // Parse images array
  const parsedImages = (() => {
    if (!images || images.length === 0) return []
    
    // If it's a string, try to parse it
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images)
        return Array.isArray(parsed) ? parsed : [images]
      } catch (e) {
        return [images]
      }
    }
    
    return Array.isArray(images) ? images : [images]
  })()

  const currentImage = parsedImages[currentIndex] || ''

  // Check if current image is DICOM
  const checkIfDicom = (url) => {
    if (!url) return false
    const lowerUrl = url.toLowerCase()
    // Check for .dcm extension or dicom in URL
    // Also check for common Firebase Storage patterns with .dcm
    // Check for data URIs with octet-stream (commonly used for DICOM)
    return lowerUrl.includes('.dcm') || 
           lowerUrl.includes('dicom') ||
           lowerUrl.includes('%2Edcm') || // URL encoded .dcm
           lowerUrl.includes('.dcm?') || // .dcm with query parameters
           lowerUrl.includes('data:application/octet-stream') || // Base64 DICOM
           lowerUrl.includes('data:application/dicom') // Base64 DICOM with proper MIME
  }

  // Load and render DICOM image
  const loadDicomImage = async (url) => {
    try {
      setIsLoadingDicom(true)
      console.log('Fetching DICOM file from URL:', url.substring(0, 100) + '...')
      
      let byteArray
      
      // Handle data URI (base64)
      if (url.startsWith('data:')) {
        console.log('Detected data URI, decoding base64...')
        const base64Data = url.split(',')[1]
        const binaryString = atob(base64Data)
        byteArray = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          byteArray[i] = binaryString.charCodeAt(i)
        }
        console.log('Decoded base64 data, size:', byteArray.length, 'bytes')
      } else {
        // Handle regular URL
        console.log('Fetching from URL...')
        const response = await fetch(url, {
          mode: 'cors',
          credentials: 'omit'
        })
        console.log('Fetch response status:', response.status, response.statusText)
        console.log('Content-Type:', response.headers.get('content-type'))
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const arrayBuffer = await response.arrayBuffer()
        byteArray = new Uint8Array(arrayBuffer)
        console.log('Array buffer size:', arrayBuffer.byteLength, 'bytes')
      }
      
      // Log first few bytes to verify it's a DICOM file
      console.log('First 4 bytes:', Array.from(byteArray.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(' '))
      console.log('Bytes 128-132 (DICOM magic):', String.fromCharCode(...byteArray.slice(128, 132)))
      
      // Parse DICOM file
      const dataSet = dicomParser.parseDicom(byteArray)
      console.log('DICOM parsed successfully')
      
      // Extract image data
      const pixelDataElement = dataSet.elements.x7fe00010
      if (!pixelDataElement) {
        console.error('Available DICOM elements:', Object.keys(dataSet.elements))
        throw new Error('No pixel data found in DICOM file')
      }
      
      console.log('Pixel data element found:', pixelDataElement)
      
      const width = dataSet.uint16('x00280011')
      const height = dataSet.uint16('x00280010')
      console.log('Image dimensions:', width, 'x', height)
      
      // Check bits allocated to determine data type
      const bitsAllocated = dataSet.uint16('x00280100') || 16
      let pixelData
      
      if (bitsAllocated === 8) {
        pixelData = new Uint8Array(
          dataSet.byteArray.buffer,
          pixelDataElement.dataOffset,
          pixelDataElement.length
        )
      } else {
        pixelData = new Uint16Array(
          dataSet.byteArray.buffer,
          pixelDataElement.dataOffset,
          pixelDataElement.length / 2
        )
      }
      
      // Get windowing parameters if available, otherwise use defaults
      let windowCenter = 2048 // Default for typical dental radiographs
      let windowWidthDicom = 4096 // Default window width
      
      try {
        const wcString = dataSet.string('x00281050')
        const wwString = dataSet.string('x00281051')
        if (wcString) windowCenter = parseFloat(wcString.split('\\')[0])
        if (wwString) windowWidthDicom = parseFloat(wwString.split('\\')[0])
      } catch (e) {
        console.log('Using default windowing values')
      }
      
      // Update UI sliders to match DICOM windowing (normalized to 0-100)
      // Find max pixel value using a loop to avoid stack overflow with large arrays
      let maxPixelValue = 0
      for (let i = 0; i < pixelData.length; i++) {
        if (pixelData[i] > maxPixelValue) {
          maxPixelValue = pixelData[i]
        }
      }
      console.log('Max pixel value:', maxPixelValue)
      console.log('DICOM Window Center:', windowCenter, 'Window Width:', windowWidthDicom)
      
      setDicomImage({
        width,
        height,
        pixelData,
        windowCenter,
        windowWidth: windowWidthDicom,
        maxPixelValue,
        bitsAllocated,
        dataSet
      })
      
      setIsLoadingDicom(false)
    } catch (error) {
      console.error('Error loading DICOM image:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        url: url
      })
      setIsLoadingDicom(false)
      setIsDicom(false)
      // Show error message to user
      alert('Error loading DICOM image: ' + error.message + '\n\nCheck browser console for details.')
    }
  }

  // Render DICOM to canvas
  useEffect(() => {
    if (!dicomImage || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    canvas.width = dicomImage.width
    canvas.height = dicomImage.height
    
    const imageData = ctx.createImageData(dicomImage.width, dicomImage.height)
    const pixelData = dicomImage.pixelData
    
    // Use actual DICOM windowing values from the file
    // For DICOM images, we should use the stored values unless user adjusts them
    const wc = dicomImage.windowCenter
    const ww = dicomImage.windowWidth
    
    const lower = wc - ww / 2
    const upper = wc + ww / 2
    const range = upper - lower || 1 // Prevent division by zero
    
    console.log('Rendering with Window Center:', wc, 'Window Width:', ww)
    
    for (let i = 0; i < pixelData.length; i++) {
      let pixel = pixelData[i]
      
      // Apply windowing (VOI LUT)
      if (pixel <= lower) {
        pixel = 0
      } else if (pixel >= upper) {
        pixel = 255
      } else {
        pixel = ((pixel - lower) / range) * 255
      }
      
      // For DICOM images, only apply brightness/contrast if user changed them
      // Don't apply by default to preserve medical image quality
      if (brightness !== 100 || contrast !== 100) {
        pixel = (pixel - 127.5) * (contrast / 100) + 127.5 + (brightness - 100)
      }
      
      pixel = Math.max(0, Math.min(255, pixel))
      
      const idx = i * 4
      imageData.data[idx] = pixel     // R
      imageData.data[idx + 1] = pixel // G
      imageData.data[idx + 2] = pixel // B
      imageData.data[idx + 3] = 255   // A
    }
    
    ctx.putImageData(imageData, 0, 0)
  }, [dicomImage, windowLevel, windowWidth, brightness, contrast])

  // Check and load DICOM when image changes
  useEffect(() => {
    console.log('Current image URL:', currentImage)
    const isDicomFile = checkIfDicom(currentImage)
    console.log('Is DICOM file:', isDicomFile)
    setIsDicom(isDicomFile)
    
    if (isDicomFile) {
      console.log('Loading DICOM image from:', currentImage)
      loadDicomImage(currentImage)
    } else {
      setDicomImage(null)
    }
  }, [currentImage])

  // Reset transformations when image changes
  useEffect(() => {
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
    setBrightness(100)
    setContrast(100)
    setIsInverted(false)
    setSharpness(0)
    setSaturation(100)
    setFlipHorizontal(false)
    setFlipVertical(false)
    setWindowLevel(50)
    setWindowWidth(50)
  }, [currentIndex])

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          handlePrevious()
          break
        case 'ArrowRight':
          handleNext()
          break
        case '+':
        case '=':
          handleZoomIn()
          break
        case '-':
        case '_':
          handleZoomOut()
          break
        case 'r':
        case 'R':
          handleRotateRight()
          break
        case 'f':
        case 'F':
          toggleFullscreen()
          break
        case '0':
          handleReset()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex, scale, rotation])

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return // Only left click
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Wheel zoom
  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setScale(prev => Math.max(0.5, Math.min(10, prev + delta)))
  }

  // Attach wheel event listener with passive: false
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const wheelHandler = (e) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      setScale(prev => Math.max(0.5, Math.min(10, prev + delta)))
    }

    container.addEventListener('wheel', wheelHandler, { passive: false })
    return () => container.removeEventListener('wheel', wheelHandler)
  }, [])

  const handleZoomIn = () => setScale(prev => Math.min(10, prev + 0.25))
  const handleZoomOut = () => setScale(prev => Math.max(0.5, prev - 0.25))
  const handleRotateLeft = () => setRotation(prev => prev - 90)
  const handleRotateRight = () => setRotation(prev => prev + 90)
  const handleFlipHorizontalToggle = () => setFlipHorizontal(prev => !prev)
  const handleFlipVerticalToggle = () => setFlipVertical(prev => !prev)
  const handlePanReset = () => setPosition({ x: 0, y: 0 })
  
  const handleReset = () => {
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
    setBrightness(100)
    setContrast(100)
    setIsInverted(false)
    setSharpness(0)
    setSaturation(100)
    setFlipHorizontal(false)
    setFlipVertical(false)
    setWindowLevel(50)
    setWindowWidth(50)
  }

  const handleNext = () => {
    if (currentIndex < parsedImages.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  // AI Analysis function
  const handleAnalyzeImage = async () => {
    try {
      setIsAnalyzing(true)
      setAnalysisError(null)
      
      const token = authUtils.getAccessToken()
      const currentImageData = parsedImages[currentIndex]
      
      if (!currentImageData) {
        throw new Error('No image available to analyze')
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/radiology-requests/analyze-xray`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageData: currentImageData,
          imagingType: imagingType
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setAiAnalysis(data)
        setShowAIAnalysis(true)
      } else {
        throw new Error(data.error || 'Failed to analyze image')
      }
    } catch (error) {
      console.error('AI Analysis error:', error)
      setAnalysisError(error.message || 'Failed to analyze image')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleDownload = () => {
    if (!currentImage) return
    
    // If it's a base64 data URI
    if (currentImage.startsWith('data:')) {
      const link = document.createElement('a')
      link.href = currentImage
      link.download = `radiology-image-${currentIndex + 1}-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      // If it's a URL
      window.open(currentImage, '_blank')
    }
  }

  if (!isOpen) return null

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isDarkMode ? 'bg-linear-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-linear-to-br from-slate-900 via-slate-800 to-slate-900'
      }`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <div className={`absolute top-0 left-0 right-0 z-50 ${
        showTools ? 'translate-y-0' : '-translate-y-full'
      } transition-transform duration-300`}>
        <div className={`${
          isDarkMode ? 'bg-linear-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95' : 'bg-linear-to-r from-slate-800/95 via-slate-700/95 to-slate-800/95'
        } backdrop-blur-xl shadow-2xl px-8 py-5 flex items-center justify-between border-b border-teal-500/30`}>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-br from-teal-400 to-cyan-500 rounded-2xl blur-md opacity-60 animate-pulse" />
              <div className="relative bg-linear-to-br from-teal-500 to-cyan-600 p-3 rounded-2xl shadow-lg">
                <FaImage className="w-7 h-7 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-linear-to-r from-white to-teal-200 bg-clip-text text-transparent tracking-wide">
                Medical Image Viewer
              </h2>
              {patientName && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-semibold text-teal-400">Patient:</span>
                  <span className="text-sm text-gray-200 font-medium">{patientName}</span>
                </div>
              )}
              {isDicom && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-1 bg-linear-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-lg shadow-lg">
                    DICOM
                  </span>
                  <span className="text-xs text-slate-300">Advanced medical imaging format</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* AI Analysis Button */}
            <button
              onClick={handleAnalyzeImage}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-purple-500/50 transition-all duration-200 hover:scale-105 flex items-center gap-2 group font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              title="Analyze with AI"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <HiSparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>AI Analysis</span>
                </>
              )}
            </button>
            
            {parsedImages.length > 1 && (
              <>
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className={`${
                    showSidebar
                      ? 'bg-linear-to-r from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/50'
                      : 'bg-slate-700 hover:bg-slate-600'
                  } text-white px-4 py-2.5 rounded-xl transition-all duration-200 hover:scale-105 flex items-center gap-2 font-medium`}
                  title={showSidebar ? 'Hide Images' : 'Show Images'}
                >
                  <FaBars className="w-4 h-4" />
                  <span className="text-sm">Images</span>
                </button>
                <div className="bg-slate-700/80 backdrop-blur-sm px-5 py-2.5 rounded-xl border border-slate-600/50 shadow-lg">
                  <span className="text-white font-bold text-lg">
                    {currentIndex + 1}
                  </span>
                  <span className="text-slate-400 mx-2">/</span>
                  <span className="text-slate-300 font-semibold">
                    {parsedImages.length}
                  </span>
                </div>
              </>
            )}
            <button
              onClick={onClose}
              className="bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-red-500/50 transition-all duration-200 hover:scale-105 flex items-center gap-2 group font-medium"
              title="Close (ESC)"
            >
              <FaTimes className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Image Container */}
      <div
        className="relative flex items-center justify-center overflow-hidden transition-all duration-300"
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          paddingTop: '88px',
          paddingBottom: '280px',
          height: '100vh',
          width: '100%'
        }}
        onMouseDown={handleMouseDown}
      >
        {currentImage ? (
          <div className="relative max-h-full max-w-full flex items-center justify-center">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-linear-to-br from-teal-400/20 via-cyan-500/20 to-blue-500/20 rounded-3xl blur-3xl transform scale-110 animate-pulse" />
            
            {isLoadingDicom ? (
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-2xl" />
                  <div className="relative w-20 h-20 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-slate-300 text-lg font-medium mt-4">Loading DICOM image...</p>
              </div>
            ) : isDicom && dicomImage ? (
              <canvas
                ref={canvasRef}
                className="max-h-full max-w-full object-contain select-none rounded-xl shadow-2xl relative z-10 ring-1 ring-white/10"
                style={{
                  transform: `
                    translate(${position.x}px, ${position.y}px) 
                    scale(${scale}) 
                    rotate(${rotation}deg) 
                    scaleX(${flipHorizontal ? -1 : 1}) 
                    scaleY(${flipVertical ? -1 : 1})
                  `,
                  filter: `
                    brightness(${brightness}%) 
                    contrast(${contrast}%) 
                    saturate(${saturation / 100})
                    ${isInverted ? 'invert(1)' : ''} 
                    ${sharpness > 0 ? `contrast(${100 + sharpness}%) brightness(${100 - sharpness * 0.1}%)` : ''}
                    drop-shadow(0 25px 50px rgba(0,0,0,0.5))
                  `,
                  transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            ) : (
              <img
                ref={imageRef}
                src={currentImage}
                alt={`Medical image ${currentIndex + 1}`}
                className="max-h-full max-w-full object-contain select-none rounded-xl shadow-2xl relative z-10 ring-1 ring-white/10"
                draggable={false}
                style={{
                  transform: `
                    translate(${position.x}px, ${position.y}px) 
                    scale(${scale}) 
                    rotate(${rotation}deg) 
                    scaleX(${flipHorizontal ? -1 : 1}) 
                    scaleY(${flipVertical ? -1 : 1})
                  `,
                  filter: `
                    brightness(${brightness}%) 
                    contrast(${contrast}%) 
                    saturate(${saturation / 100})
                    ${isInverted ? 'invert(1)' : ''} 
                    ${sharpness > 0 ? `contrast(${100 + sharpness}%) brightness(${100 - sharpness * 0.1}%)` : ''}
                    drop-shadow(0 25px 50px rgba(0,0,0,0.5))
                  `,
                  transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-2xl" />
              <FaImage className="relative w-20 h-20 text-slate-600 mb-4" />
            </div>
            <p className="text-slate-400 text-lg font-medium">No image available</p>
          </div>
        )}
      </div>



      {/* Toolbar */}
      <div className={`absolute bottom-0 left-0 right-0 z-50 ${
        showTools ? 'translate-y-0' : 'translate-y-full'
      } transition-transform duration-300`}>
        <div className={`${
          isDarkMode ? 'bg-linear-to-t from-slate-900/95 via-slate-800/95 to-slate-800/80' : 'bg-linear-to-t from-slate-800/95 via-slate-700/95 to-slate-700/80'
        } backdrop-blur-xl shadow-2xl px-8 py-6 border-t border-teal-500/30`}>
          
          {/* Tool Group Tabs */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <button
              onClick={() => setActiveToolGroup('transform')}
              className={`${
                activeToolGroup === 'transform'
                  ? 'bg-linear-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/50'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              } px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 hover:scale-105 flex items-center gap-2`}
            >
              <FaArrowsAlt className="w-4 h-4" />
              Transform
            </button>
            <button
              onClick={() => setActiveToolGroup('adjust')}
              className={`${
                activeToolGroup === 'adjust'
                  ? 'bg-linear-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/50'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              } px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 hover:scale-105 flex items-center gap-2`}
            >
              <FaPalette className="w-4 h-4" />
              Adjustments
            </button>
            <button
              onClick={() => setActiveToolGroup('advanced')}
              className={`${
                activeToolGroup === 'advanced'
                  ? 'bg-linear-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/50'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              } px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 hover:scale-105 flex items-center gap-2`}
            >
              <FaLayerGroup className="w-4 h-4" />
              Advanced
            </button>
          </div>

          {/* Transform Tools */}
          {activeToolGroup === 'transform' && (
            <div className="flex flex-wrap items-center justify-center gap-4">
              {/* Zoom Controls */}
              <div className="flex flex-col gap-2 bg-slate-700/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-600/50 shadow-xl">
                <div className="text-xs font-bold text-teal-400 text-center px-2 uppercase tracking-wider flex items-center justify-center gap-2">
                  <FaSearchPlus className="w-3 h-3" />
                  Zoom
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleZoomOut}
                    title="Zoom Out (-)"
                    className="bg-slate-600 hover:bg-teal-600 text-white p-3 rounded-xl transition-all duration-200 hover:scale-110 shadow-lg"
                  >
                    <FaSearchMinus className="w-4 h-4" />
                  </button>
                  <div className="bg-slate-800 px-5 py-2.5 rounded-xl min-w-24 text-center shadow-inner">
                    <span className="text-white font-bold text-sm">
                      {Math.round(scale * 100)}%
                    </span>
                  </div>
                  <button
                    onClick={handleZoomIn}
                    title="Zoom In (+)"
                    className="bg-slate-600 hover:bg-teal-600 text-white p-3 rounded-xl transition-all duration-200 hover:scale-110 shadow-lg"
                  >
                    <FaSearchPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Rotation Controls */}
              <div className="flex flex-col gap-2 bg-slate-700/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-600/50 shadow-xl">
                <div className="text-xs font-bold text-teal-400 text-center px-2 uppercase tracking-wider flex items-center justify-center gap-2">
                  <FaSync className="w-3 h-3" />
                  Rotate
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRotateLeft}
                    title="Rotate Left"
                    className="bg-slate-600 hover:bg-teal-600 text-white p-3 rounded-xl transition-all duration-200 hover:scale-110 shadow-lg"
                  >
                    <FaUndo className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleRotateRight}
                    title="Rotate Right (R)"
                    className="bg-slate-600 hover:bg-teal-600 text-white p-3 rounded-xl transition-all duration-200 hover:scale-110 shadow-lg"
                  >
                    <FaRedo className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Flip Controls */}
              <div className="flex flex-col gap-2 bg-slate-700/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-600/50 shadow-xl">
                <div className="text-xs font-bold text-teal-400 text-center px-2 uppercase tracking-wider flex items-center justify-center gap-2">
                  <FaSync className="w-3 h-3" />
                  Flip
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleFlipHorizontalToggle}
                    title="Flip Horizontal"
                    className={`${
                      flipHorizontal ? 'bg-teal-600 scale-105' : 'bg-slate-600'
                    } hover:bg-teal-600 text-white p-3 rounded-xl transition-all duration-200 hover:scale-110 shadow-lg`}
                  >
                    <FaArrowsAltH className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleFlipVerticalToggle}
                    title="Flip Vertical"
                    className={`${
                      flipVertical ? 'bg-teal-600 scale-105' : 'bg-slate-600'
                    } hover:bg-teal-600 text-white p-3 rounded-xl transition-all duration-200 hover:scale-110 shadow-lg`}
                  >
                    <FaArrowsAltV className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="w-px h-20 bg-slate-600" />

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handlePanReset}
                  title="Reset Position"
                  className="bg-slate-600 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-110 flex items-center gap-2 shadow-lg font-medium"
                >
                  <FaArrowsAlt className="w-4 h-4" />
                  <span className="text-sm">Center</span>
                </button>
                <button
                  onClick={handleReset}
                  title="Reset All (0)"
                  className="bg-slate-600 hover:bg-purple-600 text-white px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-110 flex items-center gap-2 shadow-lg font-medium"
                >
                  <FaSync className="w-4 h-4" />
                  <span className="text-sm">Reset All</span>
                </button>
              </div>
            </div>
          )}

          {/* Adjustment Tools */}
          {activeToolGroup === 'adjust' && (
            <div className="flex flex-wrap items-center justify-center gap-4">
              {/* Brightness */}
              <div className="flex flex-col gap-2 bg-slate-700/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-600/50 shadow-xl min-w-60">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <FaSun className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Brightness</span>
                  </div>
                  <span className="text-xs text-white font-bold bg-slate-800 px-3 py-1 rounded-lg">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-600 rounded-lg appearance-none cursor-pointer slider-teal"
                />
              </div>

              {/* Contrast */}
              <div className="flex flex-col gap-2 bg-slate-700/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-600/50 shadow-xl min-w-60">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <FaAdjust className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Contrast</span>
                  </div>
                  <span className="text-xs text-white font-bold bg-slate-800 px-3 py-1 rounded-lg">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-600 rounded-lg appearance-none cursor-pointer slider-teal"
                />
              </div>

              {/* Saturation */}
              <div className="flex flex-col gap-2 bg-slate-700/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-600/50 shadow-xl min-w-60">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <FaPalette className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Saturation</span>
                  </div>
                  <span className="text-xs text-white font-bold bg-slate-800 px-3 py-1 rounded-lg">{saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-600 rounded-lg appearance-none cursor-pointer slider-teal"
                />
              </div>

              {/* Sharpness */}
              <div className="flex flex-col gap-2 bg-slate-700/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-600/50 shadow-xl min-w-60">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <FaRulerHorizontal className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Sharpness</span>
                  </div>
                  <span className="text-xs text-white font-bold bg-slate-800 px-3 py-1 rounded-lg">{sharpness}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sharpness}
                  onChange={(e) => setSharpness(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-600 rounded-lg appearance-none cursor-pointer slider-teal"
                />
              </div>
            </div>
          )}

          {/* Advanced Tools */}
          {activeToolGroup === 'advanced' && (
            <div className="flex flex-col gap-4">
              {isDicom && (
                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-xl">
                  <FaEye className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-200 font-medium">
                    Window Level/Width controls are optimized for DICOM medical images
                  </span>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-center gap-4">
              {/* Window Level (Medical Imaging) */}
              <div className="flex flex-col gap-2 bg-slate-700/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-600/50 shadow-xl min-w-60">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <FaEye className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Window Level</span>
                  </div>
                  <span className="text-xs text-white font-bold bg-slate-800 px-3 py-1 rounded-lg">{windowLevel}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={windowLevel}
                  onChange={(e) => setWindowLevel(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-600 rounded-lg appearance-none cursor-pointer slider-teal"
                />
              </div>

              {/* Window Width */}
              <div className="flex flex-col gap-2 bg-slate-700/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-600/50 shadow-xl min-w-60">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <FaLayerGroup className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Window Width</span>
                  </div>
                  <span className="text-xs text-white font-bold bg-slate-800 px-3 py-1 rounded-lg">{windowWidth}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={windowWidth}
                  onChange={(e) => setWindowWidth(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-600 rounded-lg appearance-none cursor-pointer slider-teal"
                />
              </div>

              <div className="w-px h-20 bg-slate-600" />

              {/* Advanced Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setIsInverted(!isInverted)}
                  title="Invert Colors"
                  className={`${
                    isInverted ? 'bg-linear-to-r from-teal-500 to-cyan-600 scale-105 shadow-lg shadow-teal-500/50' : 'bg-slate-600'
                  } hover:bg-teal-600 text-white px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-110 flex items-center gap-2 shadow-lg font-medium`}
                >
                  <FaMoon className="w-4 h-4" />
                  <span className="text-sm">Invert</span>
                </button>

                <button
                  onClick={toggleFullscreen}
                  title="Fullscreen (F)"
                  className="bg-slate-600 hover:bg-purple-600 text-white px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-110 flex items-center gap-2 shadow-lg font-medium"
                >
                  {isFullscreen ? <FaCompress className="w-4 h-4" /> : <FaExpand className="w-4 h-4" />}
                  <span className="text-sm">
                    {isFullscreen ? 'Exit Full' : 'Fullscreen'}
                  </span>
                </button>
              </div>

              <button
                onClick={handleDownload}
                title="Download Image"
                className="bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2.5 rounded-xl transition-all duration-200 hover:scale-110 flex items-center gap-2 shadow-lg shadow-green-500/50 font-medium"
              >
                <FaDownload className="w-4 h-4" />
                <span className="text-sm">Download</span>
              </button>
            </div>
            </div>
          )}

          {/* Help text */}
          <div className="mt-5 pt-4 border-t border-slate-600/50">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-300">
              <span className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-slate-700 rounded font-mono text-teal-400 border border-slate-600">Wheel</kbd>
                Zoom
              </span>
              <span className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-slate-700 rounded font-mono text-teal-400 border border-slate-600">Drag</kbd>
                Pan
              </span>
              <span className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-slate-700 rounded font-mono text-teal-400 border border-slate-600">← →</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-slate-700 rounded font-mono text-teal-400 border border-slate-600">+/-</kbd>
                Zoom
              </span>
              <span className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-slate-700 rounded font-mono text-teal-400 border border-slate-600">R</kbd>
                Rotate
              </span>
              <span className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-slate-700 rounded font-mono text-teal-400 border border-slate-600">F</kbd>
                Fullscreen
              </span>
              <span className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-slate-700 rounded font-mono text-teal-400 border border-slate-600">0</kbd>
                Reset
              </span>
              <span className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-slate-700 rounded font-mono text-teal-400 border border-slate-600">ESC</kbd>
                Close
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle toolbar button */}
      <button
        onClick={() => setShowTools(!showTools)}
        className={`absolute ${showTools ? 'bottom-8' : 'bottom-4'} right-8 z-60 ${
          showTools 
            ? 'bg-linear-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/50' 
            : 'bg-linear-to-br from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-lg shadow-teal-500/50'
        } text-white px-6 py-3 rounded-2xl transition-all duration-200 hover:scale-110 flex items-center gap-2 group font-medium`}
        title={showTools ? 'Hide Tools' : 'Show Tools'}
      >
        {showTools ? (
          <>
            <FaTimes className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
            <span className="text-sm">Hide Tools</span>
          </>
        ) : (
          <>
            <FaAdjust className="w-5 h-5 group-hover:rotate-180 transition-transform duration-200" />
            <span className="text-sm">Show Tools</span>
          </>
        )}
      </button>

      {/* Navigation Arrows for Multiple Images */}
      {parsedImages.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`absolute left-4 top-1/2 -translate-y-1/2 z-30 ${
              currentIndex === 0 
                ? 'opacity-30 cursor-not-allowed bg-slate-700' 
                : 'bg-linear-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 hover:scale-110 shadow-lg shadow-teal-500/50'
            } text-white p-4 rounded-2xl transition-all duration-200 group`}
            title="Previous Image (←)"
          >
            <FaChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform duration-200" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === parsedImages.length - 1}
            className={`absolute right-4 top-1/2 -translate-y-1/2 z-30 ${
              currentIndex === parsedImages.length - 1 
                ? 'opacity-30 cursor-not-allowed bg-slate-700' 
                : 'bg-linear-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 hover:scale-110 shadow-lg shadow-teal-500/50'
            } text-white p-4 rounded-2xl transition-all duration-200 group`}
            title="Next Image (→)"
          >
            <FaChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </>
      )}

      {/* Thumbnail Sidebar (for multiple images) */}
      {parsedImages.length > 1 && (
        <div className={`absolute left-0 top-22 bottom-70 z-40 transition-transform duration-300 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="h-full w-40 bg-linear-to-b from-slate-900/98 via-slate-800/98 to-slate-900/98 backdrop-blur-xl shadow-2xl border-r border-teal-500/30 flex flex-col rounded-tr-3xl rounded-br-3xl overflow-hidden">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-teal-500/20 bg-linear-to-b from-slate-800/90 to-slate-800/50">
              <div className="text-center bg-slate-700/70 rounded-xl py-2.5 px-3 shadow-lg border border-slate-600/50">
                <div className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-1.5">Images</div>
                <div>
                  <span className="text-white font-bold text-xl">
                    {currentIndex + 1}
                  </span>
                  <span className="text-slate-400 mx-2">/</span>
                  <span className="text-slate-300 font-semibold text-lg">
                    {parsedImages.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-3 custom-scrollbar">
              {parsedImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative w-full aspect-square rounded-2xl overflow-hidden transition-all duration-300 group ${
                    index === currentIndex
                      ? 'ring-4 ring-teal-500 shadow-xl shadow-teal-500/50 scale-105'
                      : 'ring-2 ring-slate-600/50 hover:ring-teal-400 hover:scale-105 opacity-60 hover:opacity-100'
                  }`}
                  title={`Image ${index + 1}`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === currentIndex && (
                    <div className="absolute inset-0 bg-linear-to-t from-teal-500/50 via-teal-500/20 to-transparent" />
                  )}
                  <div className={`absolute bottom-2 right-2 ${
                    index === currentIndex 
                      ? 'bg-linear-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/50' 
                      : 'bg-slate-700/95'
                  } text-white text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-sm border ${
                    index === currentIndex ? 'border-white/20' : 'border-slate-600'
                  }`}>
                    {index + 1}
                  </div>
                  {index !== currentIndex && (
                    <div className="absolute inset-0 bg-slate-900/60 group-hover:bg-slate-900/30 transition-all duration-300" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Panel */}
      {showAIAnalysis && (aiAnalysis || analysisError) && (
        <div className="absolute right-4 top-24 bottom-24 z-40 w-96 max-w-full">
          <div className="h-full bg-gradient-to-b from-slate-900/98 via-slate-800/98 to-slate-900/98 backdrop-blur-xl shadow-2xl border-l border-purple-500/30 flex flex-col rounded-3xl overflow-hidden">
            {/* Panel Header */}
            <div className="p-4 border-b border-purple-500/20 bg-gradient-to-b from-purple-900/50 to-slate-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-500 rounded-xl blur-md opacity-60 animate-pulse" />
                    <div className="relative bg-gradient-to-br from-purple-500 to-pink-600 p-2.5 rounded-xl">
                      <HiSparkles className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">AI Analysis</h3>
                    <p className="text-xs text-purple-300">Powered by Gemini AI</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIAnalysis(false)}
                  className="bg-slate-700/50 hover:bg-slate-600/70 text-white p-2 rounded-lg transition-all duration-200 hover:scale-110"
                  title="Close Analysis"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {analysisError ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <FaExclamationTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-red-400 font-semibold mb-1">Analysis Error</h4>
                      <p className="text-red-300 text-sm">{analysisError}</p>
                    </div>
                  </div>
                </div>
              ) : aiAnalysis ? (
                <>
                  {/* Success Indicator */}
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 flex items-center gap-3">
                    <FaCheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-green-400 font-semibold text-sm">Analysis Complete</p>
                      <p className="text-green-300 text-xs">{imagingType}</p>
                    </div>
                  </div>

                  {/* Analysis Results */}
                  <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FaBrain className="w-4 h-4 text-purple-400" />
                      <h4 className="text-white font-semibold">Analysis Results</h4>
                    </div>
                    <div className="text-sm text-slate-200 space-y-3 whitespace-pre-wrap leading-relaxed">
                      {aiAnalysis.analysis}
                    </div>
                  </div>

                  {/* Timestamp */}
                  {aiAnalysis.analyzedAt && (
                    <div className="text-xs text-slate-400 text-center pt-2 border-t border-slate-700/50">
                      Analyzed: {new Date(aiAnalysis.analyzedAt).toLocaleString()}
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
                    <p className="text-yellow-300 text-xs leading-relaxed">
                      <strong className="text-yellow-400">Disclaimer:</strong> This AI analysis is for informational purposes only 
                      and should not replace professional medical diagnosis. Always consult with a qualified dentist for 
                      definitive diagnosis and treatment recommendations.
                    </p>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageViewerModal
