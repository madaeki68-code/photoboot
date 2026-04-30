import React, { useState } from 'react';
import { Upload, X, Loader2, Plus, Image as ImageIcon } from 'lucide-react';
import { uploadImage } from '../../utils/storage';

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  label: string;
}

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({ value, onChange, label }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        
        const url = await uploadImage(file);
        newUrls.push(url);
      }
      onChange([...value, ...newUrls]);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload images.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newUrls = [...value];
    newUrls.splice(index, 1);
    onChange(newUrls);
  };

  return (
    <div className="space-y-4">
      <label className="text-xs uppercase tracking-widest text-gray-400 block">{label}</label>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {value.map((url, idx) => (
          <div key={idx} className="relative aspect-square rounded-sm overflow-hidden bg-gray-100 border border-gray-200 group">
            {url ? (
              <img src={url} alt={`Detail ${idx + 1}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon size={20} strokeWidth={1} className="text-gray-300" />
              </div>
            )}
            <button 
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        
        <label className={`
          flex flex-col items-center justify-center aspect-square rounded-sm border-2 border-dashed border-gray-200 
          hover:border-black hover:bg-gray-50 transition-all cursor-pointer bg-white
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
          {isUploading ? (
            <Loader2 size={20} className="animate-spin text-gray-400" />
          ) : (
            <>
              <Plus size={20} className="text-gray-400 mb-1" />
              <span className="text-[10px] text-gray-500 font-medium">Add Images</span>
            </>
          )}
          <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" multiple disabled={isUploading} />
        </label>
      </div>
      
      {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default MultiImageUpload;
