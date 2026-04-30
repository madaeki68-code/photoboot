import React from 'react';
import { Trash2 } from 'lucide-react';

interface ListCardProps {
  onRemove: () => void;
  children: React.ReactNode;
  className?: string;
}

const ListCard: React.FC<ListCardProps> = ({ onRemove, children, className = '' }) => {
  return (
    <div className={`p-4 md:p-6 bg-gray-50 rounded-sm relative group border border-transparent hover:border-gray-200 transition-all ${className}`}>
      <button 
        type="button" 
        onClick={onRemove} 
        className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200"
      >
        <Trash2 size={16} />
      </button>
      {children}
    </div>
  );
};

export default ListCard;
