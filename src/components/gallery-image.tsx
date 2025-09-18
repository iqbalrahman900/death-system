'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

interface GalleryImageProps {
  src: string
  alt: string
  className?: string
  style?: React.CSSProperties
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void
}

export default function GalleryImage({ src, alt, className = '', style = {}, onError }: GalleryImageProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    setImageError(false)
    setImageLoaded(false)
  }, [src])

  const handleLoad = () => {
    setImageLoaded(true)
    console.log('✅ Image loaded successfully:', alt)
  }

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('❌ Image failed to load:', alt)
    console.error('Image src length:', src?.length)
    console.error('Image src starts with:', src?.substring(0, 50))
    setImageError(true)
    if (onError) onError(e)
  }

  if (imageError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={style}
      >
        <div className="text-center p-4">
          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500">Failed to load image</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {!imageLoaded && (
        <div 
          className={`flex items-center justify-center bg-gray-200 animate-pulse ${className}`}
          style={style}
        >
          <div className="text-center p-4">
            <div className="h-8 w-8 bg-gray-300 rounded mx-auto mb-2"></div>
            <p className="text-xs text-gray-400">Loading...</p>
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${!imageLoaded ? 'hidden' : ''}`}
        style={style}
        onLoad={handleLoad}
        onError={handleError}
      />
    </>
  )
}