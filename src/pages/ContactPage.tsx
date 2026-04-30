import React, { useState } from 'react';
import Footer from '../components/layout/Footer';
import FadeIn from '../components/ui/FadeIn';
import { useSettings } from '../hooks/useSettings';
import { Section } from '../components/ui/Section';
import Typography from '../components/ui/Typography';
import { Instagram, Twitter, Mail, Plus, Minus } from 'lucide-react';
import { ContactForm } from '../components/ui/ContactForm';

import PageHero from '../components/ui/PageHero';

const ContactPage = () => {
  const { settings } = useSettings();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="bg-white">
      <PageHero 
        title="Hubungi Kami" 
        subtitle="Mari berdiskusi tentang proyek impian Anda."
        image={settings.contact_hero_image}
      />

      <Section>
        <div className="grid md:grid-cols-2 gap-12 md:gap-24">
          {/* Contact Details */}
          <div className="space-y-10 md:space-y-16">
            <FadeIn>
              <Typography variant="label" className="mb-4 md:mb-8 block">Hubungi Saya</Typography>
              <div className="space-y-6 md:space-y-8">
                <a href={`mailto:${settings.contact_email || 'hello@venapictures.com'}`} className="block group">
                  <Typography variant="label" className="text-gray-400 mb-1 md:mb-2">Email</Typography>
                  <Typography variant="h3" className="group-hover:translate-x-2 transition-transform duration-500 text-xl md:text-3xl">
                    {settings.contact_email || ''}
                  </Typography>
                </a>
                <div className="block">
                  <Typography variant="label" className="text-gray-400 mb-1 md:mb-2">Lokasi</Typography>
                  <Typography variant="h3" className="text-xl md:text-3xl">
                    {settings.contact_address || ''}
                  </Typography>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <Typography variant="label" className="mb-4 md:mb-8 block">Media Sosial</Typography>
              <div className="flex gap-6 md:gap-8">
                {settings.social_instagram && (
                  <a href={`https://instagram.com/${settings.social_instagram}`} className="text-gray-400 hover:text-black transition-colors">
                    <Instagram size={18} md:size={20} />
                  </a>
                )}
                {settings.social_twitter && (
                  <a href={`https://twitter.com/${settings.social_twitter}`} className="text-gray-400 hover:text-black transition-colors">
                    <Twitter size={18} md:size={20} />
                  </a>
                )}
                <a href="#" className="text-gray-400 hover:text-black transition-colors">
                  <Mail size={18} md:size={20} />
                </a>
              </div>
            </FadeIn>
          </div>

          {/* Contact Form */}
          <div className="mt-12 md:mt-0 flex justify-center md:justify-end">
            <FadeIn delay={0.3}>
              <div className="w-full max-w-md">
                <Typography variant="label" className="mb-8 block">Kirim Pesan</Typography>
                <ContactForm />
              </div>
            </FadeIn>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="mt-24 md:mt-40 border-t border-gray-100 pt-24 md:pt-40">
          <FadeIn>
            <div className="max-w-2xl mx-auto">
              <Typography variant="label" className="mb-12 block text-center">Pertanyaan Umum</Typography>
              <div className="space-y-2 md:space-y-4">
                {(settings.contact_faq || []).map((faq: any, idx: number) => (
                  <div key={idx} className="border-b border-gray-100 last:border-0">
                    <button 
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full py-4 md:py-6 flex items-center justify-between text-left group"
                    >
                      <Typography variant="h4" className="group-hover:italic transition-all text-sm md:text-base">{faq.q}</Typography>
                      {openFaq === idx ? <Minus size={14} md:size={16} /> : <Plus size={14} md:size={16} />}
                    </button>
                    <div className={`overflow-hidden transition-all duration-500 ${openFaq === idx ? 'max-h-40 pb-4 md:pb-6' : 'max-h-0'}`}>
                      <Typography variant="p" className="text-gray-500 max-w-md text-xs md:text-sm mx-auto">
                        {faq.a}
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </Section>

      <Footer />
    </div>
  );
};

export default ContactPage;
