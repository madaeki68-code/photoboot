import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import FadeIn from '../ui/FadeIn';
import { ArrowLeft } from 'lucide-react';
import { Project } from '../../types';

const ProjectDetail = ({ project, onBack }: { project: Project, onBack: () => void, key?: React.Key }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [project]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white pt-32 pb-40"
    >
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid md:grid-cols-12 gap-12 md:gap-24 mb-24">
          <div className="md:col-span-4 md:sticky md:top-32 h-fit">
            <FadeIn direction="right">
              <h1 className="text-5xl md:text-8xl font-medium tracking-tighter mb-6 leading-[0.9]">{project.title}</h1>
              <p className="text-xl text-gray-500 mb-8">Dipotret di {project.location}</p>
              
              {project.description && (
                <p className="text-lg text-gray-400 mb-12 leading-relaxed max-w-sm">
                  {project.description}
                </p>
              )}
              
              <div className="flex items-center gap-6 mb-12">
                <span className="text-xs text-gray-400 font-mono">/ 0{project.order + 1}</span>
                <div className="w-32 h-px bg-gray-100" />
              </div>

              <button 
                onClick={onBack}
                className="group flex items-center gap-3 text-sm font-medium hover:opacity-60 transition-opacity"
              >
                <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-[#1F2021] group-hover:text-white transition-all">
                  <ArrowLeft size={16} />
                </div>
                Kembali ke galeri
              </button>
            </FadeIn>
          </div>

          <div className="md:col-span-8 space-y-12 md:space-y-24">
            {project.detailImages.map((img, idx) => (
              <FadeIn key={idx} direction="up" delay={idx % 3 * 0.1}>
                <div className="overflow-hidden rounded-sm bg-gray-50 mb-12 last:mb-0">
                  <img 
                    src={img} 
                    alt={`Detail ${idx + 1}`} 
                    className="w-full h-auto object-cover transition-all duration-700" 
                  />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        <div className="mt-40 flex justify-center items-center border-t border-gray-100 pt-12">
          <button 
            onClick={onBack}
            className="group flex flex-col items-center gap-4 text-sm font-medium hover:opacity-60 transition-opacity"
          >
            <div className="w-16 h-16 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-[#1F2021] group-hover:text-white transition-all">
              <ArrowLeft size={24} />
            </div>
            Kembali ke galeri utama
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectDetail;
