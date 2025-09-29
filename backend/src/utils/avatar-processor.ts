import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

export interface AvatarProcessingOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
}

export class AvatarProcessor {
  private static readonly DEFAULT_OPTIONS: AvatarProcessingOptions = {
    width: 200,
    height: 200,
    quality: 90,
    format: 'jpeg'
  }

  /**
   * Process and resize an uploaded avatar image
   */
  static async processAvatar(
    inputPath: string, 
    outputPath: string, 
    options: AvatarProcessingOptions = {}
  ): Promise<void> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options }
    
    try {
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath)
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      // Process image with Sharp
      await sharp(inputPath)
        .resize(opts.width, opts.height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: opts.quality })
        .toFile(outputPath)

      // Remove original file after processing
      fs.unlinkSync(inputPath)
      
    } catch (error) {
      // Clean up files on error
      if (fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath)
      }
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath)
      }
      throw error
    }
  }

  /**
   * Validate image file
   */
  static async validateImage(filePath: string): Promise<boolean> {
    try {
      const metadata = await sharp(filePath).metadata()
      return !!(metadata.width && metadata.height)
    } catch {
      return false
    }
  }

  /**
   * Get image metadata
   */
  static async getImageMetadata(filePath: string) {
    try {
      return await sharp(filePath).metadata()
    } catch (error) {
      throw new Error('Invalid image file')
    }
  }

  /**
   * Generate optimized filename
   */
  static generateOptimizedFilename(originalFilename: string, userId: string): string {
    const timestamp = Date.now()
    const extension = 'jpg' // Always use jpg for processed avatars
    return `${userId}_${timestamp}.${extension}`
  }
}
