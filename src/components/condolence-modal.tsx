'use client'

import React, { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Upload, Download, Eye, User, Plus, Sparkles } from 'lucide-react'

interface FormData {
  fullName: string
  dateOfBirth: string
  dateOfDeath: string
  age: string
  placeOfDeath: string
  customMessage: string
}

interface CondolenceCard {
  id: string
  name: string
  imageUrl: string
  createdAt: string
}

interface CondolenceModalProps {
  onCardCreated: (card: CondolenceCard) => void
}

export default function CondolenceModal({ onCardCreated }: CondolenceModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    dateOfBirth: '',
    dateOfDeath: '',
    age: '',
    placeOfDeath: '',
    customMessage: 'May his/her soul be showered with mercy and placed among the righteous.'
  })
  
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [generatedImage, setGeneratedImage] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const generateCondolenceImage = () => {
    if (!uploadedImage || !formData.fullName) {
      alert('Please upload an image and enter the full name')
      return
    }

    setIsGenerating(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    
    img.onload = () => {
      try {
        canvas.width = 600
        canvas.height = 800
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        // Black background
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // AL FATIHAH title
        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 32px Arial, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('AL FATIHAH', canvas.width / 2, 60)
        
        // Arabic text
        ctx.font = '28px Arial, sans-serif'
        ctx.fillText('إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ', canvas.width / 2, 120)
        
        // Circular photo
        const centerX = canvas.width / 2
        const centerY = 300
        const radius = 120
        
        ctx.save()
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.clip()
        
        const aspectRatio = img.width / img.height
        let drawWidth = radius * 2.2
        let drawHeight = drawWidth / aspectRatio
        
        if (drawHeight < radius * 2.2) {
          drawHeight = radius * 2.2
          drawWidth = drawHeight * aspectRatio
        }
        
        ctx.drawImage(img, centerX - drawWidth/2, centerY - drawHeight/2, drawWidth, drawHeight)
        ctx.restore()
        
        // Circle border
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.strokeStyle = '#FFFFFF'
        ctx.lineWidth = 3
        ctx.stroke()
        
        // Name
        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 28px Arial, sans-serif'
        ctx.fillText(formData.fullName.toUpperCase(), centerX, 460)
        
        // Dates
        if (formData.dateOfBirth && formData.dateOfDeath) {
          const birthDate = new Date(formData.dateOfBirth).toLocaleDateString('en-GB')
          const deathDate = new Date(formData.dateOfDeath).toLocaleDateString('en-GB')
          ctx.font = '18px Arial, sans-serif'
          ctx.fillText(`${birthDate} - ${deathDate}`, centerX, 490)
        }

        // Age and place
        if (formData.age || formData.placeOfDeath) {
          ctx.font = '16px Arial, sans-serif'
          let infoText = ''
          if (formData.age) infoText += `Age ${formData.age}`
          if (formData.age && formData.placeOfDeath) infoText += ' • '
          if (formData.placeOfDeath) infoText += formData.placeOfDeath
          ctx.fillText(infoText, centerX, 515)
        }
        
        // Horizontal line
        ctx.strokeStyle = '#FFFFFF'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(50, 560)
        ctx.lineTo(canvas.width - 50, 560)
        ctx.stroke()
        
        // Message with wrapping
        const message = formData.customMessage
        ctx.font = '20px Arial, sans-serif'
        
        const words = message.split(' ')
        let line = ''
        let y = 600
        const maxWidth = canvas.width - 60
        const lineHeight = 30
        
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' '
          const metrics = ctx.measureText(testLine)
          
          if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line.trim(), centerX, y)
            line = words[n] + ' '
            y += lineHeight
          } else {
            line = testLine
          }
        }
        ctx.fillText(line.trim(), centerX, y)
        
        // Condolence message
        ctx.font = 'italic 36px Georgia, serif'
        ctx.fillText('With Deepest Sympathy', centerX, y + 80)
        
        const dataURL = canvas.toDataURL('image/png')
        setGeneratedImage(dataURL)
      } catch (error) {
        console.error('Error generating image:', error)
        alert('An error occurred while generating the card.')
      } finally {
        setIsGenerating(false)
      }
    }
    
    img.src = imagePreview
  }

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a')
      link.download = `condolence-${formData.fullName.replace(/\s+/g, '_')}.png`
      link.href = generatedImage
      link.click()
    }
  }

  const saveAndClose = () => {
    if (generatedImage && formData.fullName) {
      const newCard: CondolenceCard = {
        id: Date.now().toString(),
        name: formData.fullName,
        imageUrl: generatedImage,
        createdAt: new Date().toISOString()
      }
      
      onCardCreated(newCard)
      
      // Reset form
      setFormData({
        fullName: '',
        dateOfBirth: '',
        dateOfDeath: '',
        age: '',
        placeOfDeath: '',
        customMessage: 'May his/her soul be showered with mercy and placed among the righteous.'
      })
      setUploadedImage(null)
      setImagePreview('')
      setGeneratedImage('')
      setIsOpen(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700">
            <Plus className="mr-2 h-5 w-5" />
            Create Condolence Card
          </Button>
        </DialogTrigger>
        
        <DialogContent className="w-full max-w-2xl lg:max-w-6xl max-h-[90vh] overflow-y-auto sm:rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Islamic Condolence Card Generator
            </DialogTitle>
            <DialogDescription>
              Create a beautiful and meaningful Islamic condolence card
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            {/* Form Section */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upload Photo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      {imagePreview ? (
                        <div className="space-y-2">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-24 h-24 object-cover rounded-full mx-auto border-2 border-white shadow-md" 
                          />
                          <Badge variant="outline" className="text-xs">Photo selected</Badge>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                            <User className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                            Click to upload photo
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="fullName" className="text-sm">Full Name *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="Enter full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="dateOfBirth" className="text-sm">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="dateOfDeath" className="text-sm">Date of Death</Label>
                      <Input
                        id="dateOfDeath"
                        name="dateOfDeath"
                        type="date"
                        value={formData.dateOfDeath}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="age" className="text-sm">Age</Label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        placeholder="65"
                        value={formData.age}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="placeOfDeath" className="text-sm">Place of Death</Label>
                      <Input
                        id="placeOfDeath"
                        name="placeOfDeath"
                        placeholder="Kuala Lumpur"
                        value={formData.placeOfDeath}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Condolence Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    name="customMessage"
                    rows={3}
                    value={formData.customMessage}
                    onChange={handleInputChange}
                    className="resize-none text-sm"
                  />
                </CardContent>
              </Card>

              <Button 
                onClick={generateCondolenceImage}
                disabled={!uploadedImage || !formData.fullName || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Generate Condolence Card
                  </>
                )}
              </Button>
            </div>

            {/* Preview Section */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedImage ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <img 
                          src={generatedImage} 
                          alt="Generated condolence card" 
                          className="max-w-full h-auto border rounded-lg shadow-lg mx-auto bg-black"
                          style={{ maxHeight: '400px' }}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button onClick={downloadImage} variant="outline" className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        
                        <Button onClick={saveAndClose} className="flex-1">
                          <Plus className="h-4 w-4 mr-2" />
                          Save & Close
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 text-gray-500">
                      <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm">Preview will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>
  )
}
