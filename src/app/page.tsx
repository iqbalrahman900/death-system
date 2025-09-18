'use client'

import { useState, useEffect } from 'react'
import CondolenceModal from '@/components/condolence-modal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Heart, Download, Shield, Images, Calendar } from 'lucide-react'

interface CondolenceCard {
  id: string
  name: string
  imageUrl: string
  createdAt: string
}

export default function HomePage() {
  const [cards, setCards] = useState<CondolenceCard[]>([])

  // Load cards from localStorage on component mount
  useEffect(() => {
    const savedCards = localStorage.getItem('condolenceCards')
    if (savedCards) {
      try {
        setCards(JSON.parse(savedCards))
      } catch (error) {
        console.error('Error loading saved cards:', error)
      }
    }
  }, [])

  // Save cards to localStorage whenever cards change
  useEffect(() => {
    localStorage.setItem('condolenceCards', JSON.stringify(cards))
  }, [cards])

  const handleCardCreated = (newCard: CondolenceCard) => {
    setCards(prev => [newCard, ...prev])
  }

  const handleDownloadCard = (card: CondolenceCard) => {
    const link = document.createElement('a')
    link.download = `condolence-${card.name.replace(/\s+/g, '_')}.png`
    link.href = card.imageUrl
    link.click()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const features = [
    {
      icon: Heart,
      title: 'Islamic Design',
      description: 'Respectful templates with Al-Fatihah and Quranic verses'
    },
    {
      icon: Download,
      title: 'Easy Download', 
      description: 'Save cards in high-quality PNG format'
    },
    {
      icon: Shield,
      title: 'Private & Secure',
      description: 'All data is stored only in your browser'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Badge variant="secondary" className="px-4 py-2">
            <BookOpen className="w-4 h-4 mr-2" />
            Beta Version 1.0 - {cards.length} Cards Created
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
            Islamic{' '}
            <span className="text-emerald-600">Death Record</span> System
          </h1>
          
          <p className="text-xl text-gray-600">
            Easily create meaningful and beautiful Islamic condolence cards
          </p>

          <div className="bg-emerald-800 text-white rounded-xl p-8">
            <div className="text-3xl mb-4" style={{ fontFamily: 'serif' }}>
              إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ
            </div>
            <p className="text-emerald-100 text-lg">
              "Indeed, we belong to Allah, and indeed to Him we will return"
            </p>
            <p className="text-emerald-200 text-sm mt-2">Al-Baqarah: 156</p>
          </div>

          <div className="pt-4">
            <CondolenceModal onCardCreated={handleCardCreated} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <Icon className="h-6 w-6 text-emerald-600" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      {cards.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Images className="h-6 w-6 text-emerald-600" />
                <h2 className="text-3xl font-bold text-gray-900">
                  Condolence Card Gallery
                </h2>
              </div>
              <p className="text-xl text-gray-600">
                {cards.length} condolence cards have been created
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {cards.map((card) => (
                <Card key={card.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  <div className="aspect-[3/4] relative">
                    <img
                      src={card.imageUrl}
                      alt={`Condolence card for ${card.name}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDownloadCard(card)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {card.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(card.createdAt)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <CondolenceModal onCardCreated={handleCardCreated} />
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {cards.length === 0 && (
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Images className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No Cards Created Yet
            </h2>
            <p className="text-gray-600 mb-8">
              Create your first condolence card to start building a beautiful memory gallery
            </p>
            <CondolenceModal onCardCreated={handleCardCreated} />
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Today for Free
          </h2>
          <p className="text-xl mb-8 text-emerald-100">
            Create beautiful Islamic condolence cards to honor the memory of loved ones. 
            Free, easy, and secure.
          </p>
          <CondolenceModal onCardCreated={handleCardCreated} />
        </div>
      </section>
    </div>
  )
}
