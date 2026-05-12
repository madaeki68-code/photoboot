import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import FadeIn from '../ui/FadeIn';
import { ArrowLeft, Loader2, MapPin, Tag, Calendar } from 'lucide-react';
import { Project } from '../../types';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Typography from '../ui/Typography';
import { Section } from '../ui/Section';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 800], [1, 1.1]);
  const heroY = useTransform(scrollY, [0, 400], [0, 100]);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setProject({
            id: data.id,
            title: data.title,
            location: data.location,
            mainImg: data.main_img,
            tag: data.tag,
            description: data.description,
            detailImages: data.detail_images || [],
            order: data.order
          });
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        navigate('/gallery');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
      </div>
    );
  }

  if (!project) return null;

  const onBack = () => navigate(-1);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[90vh] md:h-screen w-full overflow-hidden bg-black">
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="absolute inset-0"
        >
          <img 
            src={project.mainImg} 
            alt={project.title} 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
        </motion.div>

        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-24">
          <div className="max-w-[1400px] mx-auto w-full">
            <FadeIn direction="up">
              <div className="flex items-center gap-4 mb-8">
                <span className="w-12 h-px bg-white/40" />
                <Typography variant="label" className="text-white/80 tracking-[0.5em]">Karya Pilihan</Typography>
              </div>
              <Typography variant="h1" className="text-4xl md:text-6xl lg:text-7xl text-white mb-12 max-w-4xl italic font-medium tracking-tighter">
                {project.title}
              </Typography>
            </FadeIn>
          </div>
        </div>

        {/* Back Button Overlay */}
        <button 
          onClick={onBack}
          className="fixed top-12 left-8 md:left-12 z-50 mix-blend-difference group flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
            <ArrowLeft size={18} />
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">Kembali</span>
        </button>
      </section>

      {/* Project Info Section */}
      <Section className="bg-white !py-24 md:!py-40">
        <div className="grid md:grid-cols-12 gap-16 md:gap-24">
          <div className="md:col-span-4 space-y-12">
            <FadeIn>
              <div className="space-y-8">
                <div className="flex flex-col gap-2">
                  <Typography variant="label" className="text-accent">Lokasi</Typography>
                  <div className="flex items-center gap-2 text-primary/60">
                    <MapPin size={14} />
                    <Typography variant="p" className="text-sm italic">{project.location}</Typography>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Typography variant="label" className="text-accent">Kategori</Typography>
                  <div className="flex items-center gap-2 text-primary/60">
                    <Tag size={14} />
                    <Typography variant="p" className="text-sm italic">{project.tag}</Typography>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Typography variant="label" className="text-accent">Arsip No.</Typography>
                  <div className="flex items-center gap-2 text-primary/60">
                    <Calendar size={14} />
                    <Typography variant="p" className="text-sm italic">2024 / {(project.order + 1).toString().padStart(2, '0')}</Typography>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          <div className="md:col-span-8">
            <FadeIn delay={0.2}>
              <Typography variant="p" className="text-xl md:text-3xl leading-relaxed text-primary font-medium tracking-tighter italic mb-12">
                {project.description || "Setiap jepretan adalah narasi tentang emosi yang tertangkap dalam diam, menciptakan visual yang melampaui kata-kata."}
              </Typography>
              <div className="w-20 h-px bg-primary/10" />
            </FadeIn>
          </div>
        </div>
      </Section>

      {/* Immersive Gallery Grid */}
      <Section className="!pt-0 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12">
          {project.detailImages.map((img, idx) => {
            // Variation in grid sizes
            const isFullWidth = idx % 3 === 0;
            return (
              <FadeIn 
                key={idx} 
                className={`${isFullWidth ? 'md:col-span-2' : 'md:col-span-1'} overflow-hidden group`}
                delay={0.1}
              >
                <div className="relative aspect-[3/4] md:aspect-auto overflow-hidden bg-bg-soft">
                  <img 
                    src={img} 
                    alt={`Gallery ${idx + 1}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s] ease-out" 
                  />
                  <div className="absolute bottom-6 left-6 mix-blend-difference text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Typography variant="label" className="text-white/40">Visual {idx + 1}</Typography>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </Section>

      {/* Bottom Navigation */}
      <Section className="bg-bg-soft text-center !py-32">
        <FadeIn>
          <Typography variant="label" className="mb-12 block text-accent">Terima kasih telah melihat</Typography>
          <button 
            onClick={onBack}
            className="group inline-flex flex-col items-center gap-8"
          >
            <div className="relative w-24 h-24 rounded-full border border-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
              <ArrowLeft className="w-6 h-6 transition-transform group-hover:-translate-x-2" />
            </div>
            <Typography variant="h2" className="tracking-tighter">Kembali Ke Galeri</Typography>
          </button>
        </FadeIn>
      </Section>
    </div>
  );
};

export default ProjectDetail;

