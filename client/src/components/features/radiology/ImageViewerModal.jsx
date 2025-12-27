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
  FaArrowsAltH
} from 'react-icons/fa'
import { useTheme } from '../../../contexts/ThemeContext'
import { Button } from '../../common'

const ImageViewerModal = ({ isOpen, onClose, images = [], initialIndex = 0, patientName = '' }) => {
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
  
  const containerRef = useRef(null)
  const imageRef = useRef(null)

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
            </div>
          </div>
          
          <div className="flex items-center gap-3">
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
                  saturate(${saturation}%)
                  ${isInverted ? 'invert(1)' : ''} 
                  ${sharpness > 0 ? `contrast(${100 + sharpness}%) brightness(${100 - sharpness * 0.1}%)` : ''}
                  drop-shadow(0 25px 50px rgba(0,0,0,0.5))
                `,
                transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
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
    </div>
  )
}

export default ImageViewerModal
