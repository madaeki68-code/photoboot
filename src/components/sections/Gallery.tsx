import React, { useEffect, useState } from 'react';
import FadeIn from '../ui/FadeIn';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Project } from '../../types';
import { Section } from '../ui/Section';
import Typography from '../ui/Typography';
import { Link, useNavigate } from 'react-router-dom';

const Gallery = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const categories = ['Semua', ...Array.from(new Set(projects.map(p => p.tag))).filter(Boolean)];

  const displayProjects = activeCategory === 'Semua' 
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
      setError(err.message || 'Gagal memuat galeri');
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
        <div className="w-12 h-12 border-4 border-gray-100 border-t-primary rounded-full animate-spin" />
      </Section>
    );
  }

  return (
    <Section id="gallery" className="bg-white">
      <div className="flex flex-col items-center text-center mb-12 md:mb-24 gap-8">
        <div className="max-w-2xl">
          <Typography variant="label" className="mb-6 block text-accent">Bagian 04 — Arsip</Typography>
          <Typography variant="h2">
            Portofolio Pengantin Photoboot.
          </Typography>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[10px] uppercase tracking-[0.3em] font-bold px-4 py-2 rounded-lg border transition-all ${
                activeCategory === cat 
                  ? 'border-primary bg-primary text-white' 
                  : 'border-gray-200 text-gray-400 hover:border-primary hover:text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 md:gap-x-5 gap-y-8 md:gap-y-12">
        {displayProjects.map((proj, idx) => (
          <FadeIn key={proj.id} delay={idx * 0.1}>
            <div 
              className="group cursor-pointer flex flex-col h-full"
              onClick={() => navigate(`/project/${proj.id}`)}
            >
              <div className="relative overflow-hidden aspect-[3/4] mb-3 bg-gray-100 rounded-xl">
                {proj.mainImg ? (
                  <img 
                    src={proj.mainImg} 
                    alt={proj.title} 
                    className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-1000 ease-expo" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={32} strokeWidth={1} className="text-gray-200" />
                  </div>
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-primary translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-expo shadow-2xl">
                    <ArrowRight size={24} className="-rotate-45" />
                  </div>
                </div>

                <div className="absolute top-6 right-6 mix-blend-difference text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Typography variant="cap" className="text-white text-[10px]">{proj.tag}</Typography>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-full mb-4">
                  <span className="text-[10px] font-mono text-gray-300">{(idx + 1).toString().padStart(2, '0')}</span>
                  <div className="h-[1px] w-8 bg-gray-100 mx-4 group-hover:w-12 group-hover:bg-accent transition-all duration-700" />
                  <Typography variant="label" className="text-accent !text-[9px] lowercase italic">{proj.location || 'Editorial'}</Typography>
                </div>
                
                <Typography variant="h3" className="text-base md:text-xl lg:text-2xl mb-3 leading-none tracking-tighter group-hover:text-accent transition-colors duration-300">
                  {proj.title}
                </Typography>

                <div className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-2">
                  <div className="w-4 h-px bg-primary" />
                  <Typography variant="label" className="text-[9px] tracking-widest">Lihat Detail</Typography>
                  <div className="w-4 h-px bg-primary" />
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      <div className="mt-32 flex flex-col items-center">
        <Typography variant="p" className="text-gray-400 italic font-medium tracking-tighter mb-12">Lebih banyak cerita yang menanti untuk diceritakan.</Typography>
        <Link to="/gallery" className="group flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full border border-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
            <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform" />
          </div>
          <Typography variant="label" className="tracking-[0.5em]">Masuk Arsip</Typography>
        </Link>
      </div>
    </Section>
  );
};

export default Gallery;

