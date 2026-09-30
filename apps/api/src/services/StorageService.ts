import path from 'path';
import crypto from 'crypto';

export interface IStorageService {
  upload(fileBuffer: Buffer, mimetype: string, originalName: string): Promise<string>;
  delete(fileUrl: string): Promise<void>;
  getUrl(key: string): string;
}

/**
 * MockStorageAdapter for $0 local development
 * Since we don't have S3 or Cloudinary configured yet,
 * this mock adapter simulates the interface and returns a fake URL.
 * In a real Vercel deployment, files cannot be saved to the local disk,
 * so we MUST swap this with a CloudinaryAdapter in production.
 */
import fs from 'fs';

export class LocalStorageAdapter implements IStorageService {
  private uploadDir: string;
  private baseUrl: string;

  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads');
    this.baseUrl = process.env.API_URL || 'http://localhost:5000';
    
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(fileBuffer: Buffer, mimetype: string, originalName: string): Promise<string> {
    const ext = path.extname(originalName) || `.${mimetype.split('/')[1]}`;
    const filename = `${crypto.randomBytes(16).toString('hex')}${ext}`;
    const filePath = path.join(this.uploadDir, filename);
    
    await fs.promises.writeFile(filePath, fileBuffer);
    
    return `${this.baseUrl}/uploads/${filename}`;
  }

  async delete(fileUrl: string): Promise<void> {
    try {
      const filename = fileUrl.split('/').pop();
      if (filename) {
        const filePath = path.join(this.uploadDir, filename);
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
      }
    } catch (err) {
      console.error(`[LocalStorage] Error deleting file: ${fileUrl}`, err);
    }
  }

  getUrl(key: string): string {
    return `${this.baseUrl}/uploads/${key}`;
  }
}

export const storageService = new LocalStorageAdapter();
