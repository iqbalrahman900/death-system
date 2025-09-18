'use client'

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Upload, Download, Eye, User, Calendar, MapPin, Heart, Sparkles } from 'lucide-react'

interface FormData {
  fullName: string
  dateOfBirth: string
  dateOfDeath: string
  age: string
  placeOfDeath: string
  customMessage: string
}

const IslamicTemplateGenerator = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    dateOfBirth: '',
    dateOfDeath: '',
    age: '',
    placeOfDeath: '',
    customMessage: 'Semoga rohnya dicucuri rahmat dan ditempatkan dikalangan orang-orang yang beriman.'
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
      alert('Sila muat naik gambar dan masukkan nama penuh')
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
        
        // Draw circular photo
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
          const birthDate = new Date(formData.dateOfBirth).toLocaleDateString('ms-MY')
          const deathDate = new Date(formData.dateOfDeath).toLocaleDateString('ms-MY')
          ctx.font = '18px Arial, sans-serif'
          ctx.fillText(`${birthDate} - ${deathDate}`, centerX, 490)
        }

        // Age and place
        if (formData.age || formData.placeOfDeath) {
          ctx.font = '16px Arial, sans-serif'
          let infoText = ''
          if (formData.age) infoText += `Umur ${formData.age} tahun`
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
        
        // Message with word wrapping
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
        
        // Salam Takziah
        ctx.font = 'italic 36px Georgia, serif'
        ctx.fillText('Salam Takziah', centerX, y + 80)
        
        setGeneratedImage(canvas.toDataURL('image/png'))
      } catch (error) {
        console.error('Error generating image:', error)
        alert('Ralat berlaku semasa menjana kad.')
      } finally {
        setIsGenerating(false)
      }
    }
    
    img.src = imagePreview
  }

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a')
      link.download = `takziah-${formData.fullName.replace(/\s+/g, '_')}.png`
      link.href = generatedImage
      link.click()
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <Badge variant="secondary" className="px-4 py-2">
          <Sparkles className="w-4 h-4 mr-2" />
          Penjana Kad Takziah Islam
        </Badge>
        <h1 className="text-4xl font-bold text-gray-900">
          Cipta Kad Takziah Yang Indah
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Muat Naik Gambar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-white shadow-lg" 
                      />
                      <Badge variant="outline">Gambar dipilih</Badge>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                        <User className="h-12 w-12 text-gray-400" />
                      </div>
                      <p className="text-blue-600 hover:text-blue-700 font-medium">
                        Klik untuk muat naik gambar
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Maklumat Peribadi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nama Penuh *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Masukkan nama penuh"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">Tarikh Lahir</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="dateOfDeath">Tarikh Kematian</Label>
                  <Input
                    id="dateOfDeath"
                    name="dateOfDeath"
                    type="date"
                    value={formData.dateOfDeath}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Umur</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    placeholder="65"
                    value={formData.age}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="placeOfDeath">Tempat Kematian</Label>
                  <Input
                    id="placeOfDeath"
                    name="placeOfDeath"
                    placeholder="Kuala Lumpur"
                    value={formData.placeOfDeath}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mesej Takziah</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                name="customMessage"
                rows={4}
                value={formData.customMessage}
                onChange={handleInputChange}
                className="resize-none"
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
                Menjana...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Jana Kad Takziah
              </>
            )}
          </Button>
        </div>

        {/* Preview Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Pratonton Kad Takziah</CardTitle>
            </CardHeader>
            <CardContent>
              {generatedImage ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <img 
                      src={generatedImage} 
                      alt="Generated condolence card" 
                      className="max-w-full h-auto border rounded-lg shadow-lg mx-auto bg-black"
                      style={{ maxHeight: '600px' }}
                    />
                  </div>
                  
                  <Button onClick={downloadImage} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Muat Turun PNG
                  </Button>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p>Pratonton kad akan dipaparkan di sini</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}

export default IslamicTemplateGenerator