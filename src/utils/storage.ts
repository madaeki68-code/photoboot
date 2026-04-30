import { supabase } from '../lib/supabase';

// Image compression settings
const MAX_WIDTH = 1280; // Optimized for portfolio quality and file size
const QUALITY = 0.6;    // Sweet spot for WebP compression

/**
 * Compresses an image and converts it to WebP format.
 */
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Failed to get canvas context'));

        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Image compression failed'));
          },
          'image/webp',
          QUALITY
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Uploads a file to Supabase Storage and returns the public URL.
 * Automatically compresses and converts to WebP.
 */
export async function uploadImage(file: File, bucket: string = 'gallery'): Promise<string> {
  // Compress and convert to WebP
  const compressedBlob = await compressImage(file);
  
  // Create a new filename with .webp extension
  const randomId = Math.random().toString(36).substring(2);
  const fileName = `${randomId}_${Date.now()}.webp`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, compressedBlob, {
      contentType: 'image/webp',
      upsert: true
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Uploads multiple files and returns an array of public URLs.
 */
export async function uploadMultipleImages(files: FileList | File[], bucket: string = 'gallery'): Promise<string[]> {
  const uploadPromises = Array.from(files).map(file => uploadImage(file, bucket));
  return Promise.all(uploadPromises);
}
