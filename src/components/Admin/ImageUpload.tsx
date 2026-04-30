import React, { useState } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadImage } from '../../utils/storage';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, label }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }

    // Validate file size (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-widest text-gray-400 block">{label}</label>
      
      <div className="relative group">
        {value ? (
          <div className="relative aspect-video rounded-sm overflow-hidden bg-gray-100 border border-gray-200">
            <img 
              src={value} 
              alt="Preview" 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" 
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-full text-xs font-medium hover:bg-gray-100 transition-colors">
                Change
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" disabled={isUploading} />
              </label>
              <button 
                type="button"
                onClick={() => onChange('')}
                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <label className={`
            flex flex-col items-center justify-center aspect-video rounded-sm border-2 border-dashed border-gray-200 
            hover:border-black hover:bg-gray-50 transition-all cursor-pointer bg-white
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}>
            {isUploading ? (
              <Loader2 size={24} className="animate-spin text-gray-400" />
            ) : (
              <>
                <Upload size={24} className="text-gray-400 mb-2" />
                <span className="text-xs text-gray-500 font-medium">Upload Image</span>
                <span className="text-[10px] text-gray-400 mt-1">JPG, PNG, WebP up to 5MB</span>
              </>
            )}
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" disabled={isUploading} />
          </label>
        )}
      </div>
      
      {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default ImageUpload;
