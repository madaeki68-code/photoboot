import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Section } from '../ui/Section';
import Typography from '../ui/Typography';
import { Carousel, TestimonialCard, iTestimonial } from '../ui/retro-testimonial';

const BACKGROUND_IMAGE =
  'https://images.unsplash.com/photo-1528458965990-428de4b1cb0d?q=80&w=800&auto=format&fit=crop';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop';

interface RawTestimonial {
  quote: string;
  name: string;
  location: string;
  image?: string;
}

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<iTestimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'site_testimonials')
          .single();

        if (error) throw error;

        const raw: RawTestimonial[] = Array.isArray(data?.value) ? data.value : [];

        setTestimonials(
          raw.map((t) => ({
            description: t.quote || '',
            name: t.name || '',
            designation: t.location || '',
            profileImage: t.image || FALLBACK_IMAGE,
          }))
        );
      } catch (err) {
        console.error('Error fetching testimonials:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();

    // Realtime: update otomatis kalau data berubah di admin
    const channel = supabase
      .channel('testimonials_settings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'settings', filter: 'key=eq.site_testimonials' },
        () => fetchTestimonials()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading || testimonials.length === 0) return null;

  const cards = testimonials.map((testimonial, index) => (
    <TestimonialCard
      testimonial={testimonial}
      index={index}
      layout
      backgroundImage={BACKGROUND_IMAGE}
    />
  ));

  return (
    <Section id="testimonials" className="bg-bg-soft overflow-hidden">
      <div className="max-w-4xl mb-12">
        <Typography variant="label" className="mb-6 block text-accent">
          Section 05 — Testimonials
        </Typography>
        <Typography variant="h2">
          Testimoni Pengantin.
        </Typography>
      </div>

      <Carousel items={cards} />
    </Section>
  );
};

export default Testimonials;
