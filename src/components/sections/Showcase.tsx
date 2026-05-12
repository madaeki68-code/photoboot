import React from 'react';
import FadeIn from '../ui/FadeIn';
import { Link } from 'react-router-dom';
import { Section } from '../ui/Section';
import Typography from '../ui/Typography';
import { useSettings } from '../../hooks/useSettings';
import { Image as ImageIcon } from 'lucide-react';

interface ShowcaseItem {
  image: string;
  name: string;
}

const Showcase = () => {
  const { settings } = useSettings();

  const raw: any[] = settings.site_showcase || [];
  const items: ShowcaseItem[] = raw
    .filter(Boolean)
    .map((item) =>
      typeof item === 'string'
        ? { image: item, name: '' }
        : { image: item.image || '', name: item.name || '' }
    );

  if (items.length === 0) return null;

  return (
    <div className="bg-white">
      {/* Header */}
      <Section className="pb-0">
        <div className="flex flex-col items-center text-center gap-8 pb-16 border-b border-gray-100">
          <div>
            <Typography variant="label" className="mb-4 block text-accent">
              Section 02 — Selected Works
            </Typography>
            <Typography variant="h2">
              A curation of moments that define our vision.
            </Typography>
          </div>
          <Link
            to="/gallery"
            className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] font-bold"
          >
            <span>Explore Archive</span>
            <div className="w-8 h-[1px] bg-primary group-hover:w-16 transition-all duration-300" />
          </Link>
        </div>
      </Section>

      {/* Card Grid */}
      <Section>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 md:gap-x-5 gap-y-8 md:gap-y-12">
          {items.map((item, idx) => (
            <FadeIn key={idx} delay={idx * 0.08}>
              <div className="group flex flex-col h-full bg-gray-50 rounded-2xl p-3 border border-gray-100 hover:border-gray-200 transition-colors duration-300 cursor-pointer">
                {/* Image — tinggi mengikuti rasio asli gambar */}
                <div className="relative overflow-hidden rounded-xl mb-3 bg-gray-100">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-auto block group-hover:scale-105 transition-all duration-700"
                    />
                  ) : (
                    <div className="aspect-[2/3] w-full flex items-center justify-center">
                      <ImageIcon size={32} strokeWidth={1} className="text-gray-200" />
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="flex-1 flex flex-col items-center text-center px-1">
                  <div className="flex items-center justify-center w-full mb-2">
                    <span className="text-[10px] font-mono text-gray-300">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <div className="h-[1px] w-6 bg-gray-100 mx-3 group-hover:w-8 group-hover:bg-accent transition-all duration-700" />
                    <Typography variant="label" className="text-accent !text-[9px] lowercase italic">
                      work
                    </Typography>
                  </div>
                  <Typography
                    variant="h3"
                    className="text-sm md:text-base lg:text-lg mb-2 leading-none tracking-tighter group-hover:text-accent transition-colors duration-300"
                  >
                    {item.name || `Work ${(idx + 1).toString().padStart(2, '0')}`}
                  </Typography>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>
    </div>
  );
};

export default Showcase;
