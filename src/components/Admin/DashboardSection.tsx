import React from 'react';
import { Plus } from 'lucide-react';

interface DashboardSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
  actions?: React.ReactNode;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({ 
  title, 
  description, 
  children, 
  onAdd, 
  addLabel,
  actions 
}) => {
  return (
    <div className="grid md:grid-cols-3 gap-6 md:gap-8 pt-8 md:pt-12 border-t border-gray-100 first:border-t-0 first:pt-0">
      <div>
        <h3 className="font-medium mb-1 text-lg">{title}</h3>
        <p className="text-xs text-gray-400">{description}</p>
        <div className="flex flex-col gap-2 mt-4">
          {onAdd && (
            <button 
              type="button" 
              onClick={onAdd} 
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Plus size={16} /> {addLabel || `Add ${title}`}
            </button>
          )}
          {actions}
        </div>
      </div>
      <div className="md:col-span-2 space-y-8">
        {children}
      </div>
    </div>
  );
};

export default DashboardSection;
