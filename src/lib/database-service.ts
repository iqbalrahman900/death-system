// src/lib/database-service.ts
import { supabase, DeathRecord } from './supabase'

export class DatabaseService {
  private bucketName = 'death-records-images'

  /**
   * Upload image to Supabase Storage
   */
  async uploadImage(file: File, fileName: string): Promise<string> {
    try {
      const timestamp = Date.now()
      const fileExt = file.name.split('.').pop() || 'jpg'
      const fullFileName = `original/${timestamp}_${fileName.replace(/\s+/g, '_')}.${fileExt}`

      console.log('📤 Uploading to bucket:', this.bucketName)
      console.log('📤 File name:', fullFileName)

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(fullFileName, file, {
          cacheControl: '3600',
          upsert: true // Allow overwrite if file exists
        })

      if (error) {
        console.error('Storage upload error:', error)
        throw new Error(`Storage error: ${error.message}`)
      }

      const { data: publicUrl } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(fullFileName)

      console.log('✅ Image uploaded successfully:', publicUrl.publicUrl)
      return publicUrl.publicUrl
    } catch (error: any) {
      console.error('Error uploading original image:', error)
      throw new Error(`Failed to upload image: ${error.message}`)
    }
  }

  /**
   * Upload canvas image (condolence card) to Supabase Storage
   */
  async uploadCanvasImage(dataURL: string, fileName: string): Promise<string> {
    try {
      // Convert data URL to blob
      const response = await fetch(dataURL)
      const blob = await response.blob()

      const timestamp = Date.now()
      const fullFileName = `condolence/${timestamp}_${fileName.replace(/\s+/g, '_')}.png`

      console.log('📤 Uploading condolence image to bucket:', this.bucketName)
      console.log('📤 File name:', fullFileName)

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(fullFileName, blob, {
          cacheControl: '3600',
          upsert: true, // Allow overwrite if file exists
          contentType: 'image/png'
        })

      if (error) {
        console.error('Condolence image upload error:', error)
        throw new Error(`Storage error: ${error.message}`)
      }

      const { data: publicUrl } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(fullFileName)

      console.log('✅ Condolence image uploaded successfully:', publicUrl.publicUrl)
      return publicUrl.publicUrl
    } catch (error: any) {
      console.error('Error uploading condolence image:', error)
      throw new Error(`Failed to upload condolence image: ${error.message}`)
    }
  }

  /**
   * Save death record to database
   */
  async saveDeathRecord(
    formData: any,
    originalImageUrl: string,
    condolenceImageUrl: string
  ): Promise<DeathRecord> {
    try {
      const record = {
        full_name: formData.fullName,
        date_of_birth: formData.dateOfBirth || null,
        date_of_death: formData.dateOfDeath || null,
        age: formData.age ? parseInt(formData.age) : null,
        place_of_death: formData.placeOfDeath || null,
        original_photo_url: originalImageUrl,
        condolence_image_url: condolenceImageUrl,
        custom_message: formData.customMessage || null,
        is_public: true
      }

      const { data, error } = await supabase
        .from('death_records')
        .insert([record])
        .select()
        .single()

      if (error) throw error

      console.log('✅ Death record saved to database:', data.id)
      return data
    } catch (error: any) {
      console.error('Error saving death record:', error)
      throw new Error(`Failed to save record: ${error.message}`)
    }
  }

  /**
   * Get all public death records from database
   */
  async getAllDeathRecords(): Promise<DeathRecord[]> {
    try {
      const { data, error } = await supabase
        .from('death_records')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      console.log(`✅ Loaded ${data?.length || 0} records from database`)
      return data || []
    } catch (error: any) {
      console.error('Error fetching death records:', error)
      throw new Error(`Failed to fetch records: ${error.message}`)
    }
  }

  /**
   * Search death records
   */
  async searchDeathRecords(searchTerm: string): Promise<DeathRecord[]> {
    try {
      const { data, error } = await supabase
        .from('death_records')
        .select('*')
        .eq('is_public', true)
        .or(`full_name.ilike.%${searchTerm}%,custom_message.ilike.%${searchTerm}%,place_of_death.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error: any) {
      console.error('Error searching death records:', error)
      throw new Error(`Failed to search records: ${error.message}`)
    }
  }

  /**
   * Complete workflow: Upload images and save record
   */
  async createCompleteRecord(
    formData: any,
    originalImage: File,
    condolenceImageDataURL: string
  ): Promise<DeathRecord> {
    try {
      console.log('🚀 Starting complete record creation...')

      // Step 1: Upload original image
      console.log('📤 Uploading original image...')
      const originalImageUrl = await this.uploadImage(originalImage, formData.fullName)

      // Step 2: Upload condolence image
      console.log('📤 Uploading condolence image...')
      const condolenceImageUrl = await this.uploadCanvasImage(condolenceImageDataURL, formData.fullName)

      // Step 3: Save record to database
      console.log('💾 Saving record to database...')
      const savedRecord = await this.saveDeathRecord(formData, originalImageUrl, condolenceImageUrl)

      console.log('✅ Complete record creation successful!')
      return savedRecord
    } catch (error: any) {
      console.error('❌ Failed to create complete record:', error)
      throw error
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService()