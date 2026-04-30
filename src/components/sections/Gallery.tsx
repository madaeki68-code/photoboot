import React, { useEffect, useState } from 'react';
import FadeIn from '../ui/FadeIn';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Project } from '../../types';
import { Section } from '../ui/Section';
import Typography from '../ui/Typography';
import { useNavigate } from 'react-router-dom';

const Gallery = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', ...Array.from(new Set(projects.map(p => p.tag))).filter(Boolean)];

  const displayProjects = activeCategory === 'All' 
    ? projects 
    : projects.filter(p => p.tag === activeCategory);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('order', { ascending: true });

      if (error) {
        throw error;
      }
      
      if (data) {
        const formattedProjects = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          location: item.location,
          mainImg: item.main_img,
          tag: item.tag,
          description: item.description,
          detailImages: item.detail_images || [],
          order: item.order
        }));
        setProjects(formattedProjects);
      }
      setLoading(false);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching gallery:', err);
      setError(err.message || 'Failed to load gallery');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    const channel = supabase
      .channel('projects_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchProjects();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  if (loading) {
    return (
      <Section id="gallery" className="flex justify-center">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-[#1F2021] rounded-full animate-spin" />
      </Section>
    );
  }

  return (
    <Section id="gallery">
      <div className="flex flex-col md:flex-row justify-between items-start mb-10 md:mb-24 gap-4 md:gap-0">
        <div className="text-sm flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1F2021] block" />
          <Typography variant="label">Gallery / ({(displayProjects.length).toString().padStart(2, '0')})</Typography>
        </div>
        <div className="md:text-right">
          <Typography variant="label" className="text-gray-400 mb-1 md:mb-2 block text-[9px] md:text-[10px]">Selected works</Typography>
          <Typography variant="h3">Visual Diary</Typography>
          {error && <p className="text-xs text-red-400 mt-2">Showing offline preview</p>}
        </div>
      </div>

      <FadeIn>
        <div className="flex flex-wrap gap-2 md:gap-3 mb-12 md:mb-20">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[9px] md:text-[10px] uppercase tracking-widest font-medium transition-all ${
                activeCategory === cat 
                  ? 'bg-[#1F2021] text-white shadow-lg shadow-black/10' 
                  : 'bg-white border border-gray-100 text-gray-400 hover:border-gray-300 hover:text-gray-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </FadeIn>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-x-12 md:gap-y-16">
        {displayProjects.map((proj, idx) => (
          <FadeIn key={proj.id} delay={idx * 0.1}>
            <div 
              className="group cursor-pointer"
              onClick={() => navigate(`/project/${proj.id}`)}
            >
              <div className="relative overflow-hidden rounded-sm mb-3 md:mb-6 bg-gray-50 aspect-[4/5]">
                {proj.mainImg ? (
                  <img 
                    src={proj.mainImg} 
                    alt={proj.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={24} md:size={32} strokeWidth={1} className="text-gray-200" />
                  </div>
                )}
                <div className="absolute top-3 right-3 md:top-6 md:right-6">
                  <span className="bg-white/90 backdrop-blur-sm text-[#1F2021] text-[8px] md:text-[10px] uppercase tracking-widest px-2 md:px-3 py-0.5 md:py-1 rounded-full">
                    {proj.tag}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-start md:items-end">
                <div>
                  <Typography variant="h3" className="mb-1 md:mb-2 leading-none tracking-tighter text-sm md:text-2xl">
                    {proj.title}
                  </Typography>
                  <Typography variant="p" className="text-[10px] md:text-xs opacity-60">
                    {proj.location}
                  </Typography>
                </div>
                <div className="hidden md:flex items-center gap-3">
                  <span className="text-[10px] text-gray-300 font-mono">/ 0{idx + 1}</span>
                  <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-[#1F2021] group-hover:text-white transition-all duration-500">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      <div className="mt-20 md:mt-40 flex flex-col items-center">
        <div className="w-px h-16 md:h-24 bg-gray-100 mb-8 md:mb-12" />
        <Typography variant="label" className="text-gray-400 mb-6 md:mb-8 block">Want to see more?</Typography>
        <a href="/gallery" className="group inline-flex items-center gap-4 bg-[#1F2021] text-white px-8 md:px-12 py-4 md:py-6 rounded-full text-xs md:text-sm font-medium hover:bg-gray-800 transition-all hover:scale-105 active:scale-95">
          View the full gallery 
          <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </div>
        </a>
      </div>
    </Section>
  );
};

export default Gallery;

