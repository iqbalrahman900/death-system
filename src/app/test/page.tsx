'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Loader2, Database, Image, Users } from 'lucide-react'
import { supabase, testConnection } from '@/lib/supabase'

type TestStatus = 'pending' | 'testing' | 'success' | 'failed' | 'warning'
type OverallStatus = 'ready' | 'testing' | 'success' | 'failed'

interface Test {
  name: string
  status: TestStatus
  details?: string
  icon: React.ComponentType<any>
}

export default function TestSupabase() {
  const [tests, setTests] = useState<Test[]>([
    { name: 'Sambungan Database', status: 'pending', icon: Database },
    { name: 'Baca Data', status: 'pending', icon: Users },
    { name: 'Storage Access', status: 'pending', icon: Image },
  ])
  const [isRunning, setIsRunning] = useState(false)
  const [overallStatus, setOverallStatus] = useState<OverallStatus>('ready')

  const updateTest = (index: number, status: TestStatus, details = '') => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, details } : test
    ))
  }

  const runTests = async () => {
    setIsRunning(true)
    setOverallStatus('testing')

    try {
      // Test 1: Database Connection
      updateTest(0, 'testing')
      const connectionResult = await testConnection()
      
      if (!connectionResult.success) {
        const errorMsg = connectionResult.error?.message || 'Connection failed'
        throw new Error(`Connection failed: ${errorMsg}`)
      }
      updateTest(0, 'success', 'Database connected successfully')

      // Test 2: Read Data
      updateTest(1, 'testing')
      const { data: records, error: readError } = await supabase
        .from('death_records')
        .select('*')
        .limit(5)
      
      if (readError) {
        throw new Error(`Read failed: ${readError.message}`)
      }
      updateTest(1, 'success', `Found ${records?.length || 0} records`)

      // Test 3: Storage Access
      updateTest(2, 'testing')
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets()
      
      if (storageError) {
        throw new Error(`Storage failed: ${storageError.message}`)
      }
      
      const hasImagesBucket = buckets?.some(bucket => bucket.name === 'death-records-images')
      
      if (hasImagesBucket) {
        updateTest(2, 'success', 'Storage bucket accessible')
      } else {
        updateTest(2, 'warning', 'Bucket not found, but storage is accessible')
      }

      setOverallStatus('success')
    } catch (error) {
      console.error('Test failed:', error)
      setOverallStatus('failed')
      
      // Mark failed test
      const failedIndex = tests.findIndex(t => t.status === 'testing')
      if (failedIndex !== -1) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        updateTest(failedIndex, 'failed', errorMsg)
      }
    } finally {
      setIsRunning(false)
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'testing': 
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'success': 
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed': 
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning': 
        return <CheckCircle className="h-4 w-4 text-yellow-500" />
      default: 
        return <div className="h-4 w-4 bg-gray-300 rounded-full" />
    }
  }

  const getOverallBadge = () => {
    switch (overallStatus) {
      case 'testing': 
        return <Badge variant="secondary">Menguji...</Badge>
      case 'success': 
        return <Badge className="bg-green-600">Berjaya</Badge>
      case 'failed': 
        return <Badge variant="destructive">Gagal</Badge>
      default: 
        return <Badge variant="outline">Sedia</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Database className="h-6 w-6" />
              Ujian Sistem Supabase
            </CardTitle>
            <CardDescription>
              Menguji sambungan ke sistem rekod kematian dengan kredential anda
            </CardDescription>
            <div className="flex justify-center mt-2">
              {getOverallBadge()}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Test Results */}
            <div className="space-y-4">
              {tests.map((test, index) => {
                const Icon = test.icon
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="font-medium">{test.name}</div>
                        {test.details && (
                          <div className="text-sm text-gray-500">{test.details}</div>
                        )}
                      </div>
                    </div>
                    {getStatusIcon(test.status)}
                  </div>
                )
              })}
            </div>

            {/* Status Messages */}
            {overallStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-semibold">Sistem Berjaya Dihubungkan!</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  Sistem rekod kematian Islam anda telah sedia untuk digunakan. 
                  Anda boleh mula mencipta rekod baharu.
                </p>
              </div>
            )}

            {overallStatus === 'failed' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <XCircle className="h-4 w-4" />
                  <span className="font-semibold">Masalah Ditemui</span>
                </div>
                <div className="text-red-700 text-sm mt-2">
                  <p className="font-medium mb-2">Langkah penyelesaian:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Pastikan .env.local mempunyai kredential yang betul</li>
                    <li>Sahkan projek Supabase aktif</li>
                    <li>Jalankan setup SQL dalam Supabase dashboard</li>
                    <li>Semak Row Level Security policies</li>
                    <li>Cipta bucket 'death-records-images'</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Project Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-blue-800 font-medium mb-2">Maklumat Projek:</div>
              <div className="text-blue-700 text-sm space-y-1">
                <p>• Project ID: kgwtxjmylnvgokfjvhvc</p>
                <p>• URL: https://kgwtxjmylnvgokfjvhvc.supabase.co</p>
                <p>• Database: PostgreSQL dengan Row Level Security</p>
                <p>• Storage: Public bucket untuk imej</p>
              </div>
            </div>

            {/* Action Button */}
            <div className="text-center">
              <Button 
                onClick={runTests}
                disabled={isRunning}
                variant="outline"
              >
                {isRunning ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Database className="h-4 w-4 mr-2" />
                )}
                Uji Semula
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}