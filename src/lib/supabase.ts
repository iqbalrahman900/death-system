// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// TypeScript interfaces for our data
export interface DeathRecord {
  id?: string
  created_at?: string
  updated_at?: string
  full_name: string
  date_of_birth?: string
  date_of_death: string
  age?: number
  gender?: string
  father_name?: string
  mother_name?: string
  spouse_name?: string
  place_of_birth?: string
  place_of_death?: string
  burial_location?: string
  original_photo_url?: string
  condolence_image_url?: string
  cause_of_death?: string
  obituary?: string
  family_contact?: string
  is_public?: boolean
  created_by?: string
}

// Test connection function with proper error handling
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('death_records')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Connection test failed:', error)
      return { 
        success: false, 
        error: {
          message: error.message || 'Unknown database error',
          code: error.code || 'UNKNOWN'
        }
      }
    }
    
    console.log('✅ Supabase connected successfully!')
    return { success: true }
  } catch (err) {
    console.error('Connection test error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
    return { 
      success: false, 
      error: {
        message: errorMessage,
        code: 'NETWORK_ERROR'
      }
    }
  }
}