import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Section } from '../ui/Section';
import Typography from '../ui/Typography';

interface TeamMember {
  name: string;
  role: string;
  image: string;
}

const Team = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeam = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'site_team')
        .single();

      if (error) throw error;
      setTeam(Array.isArray(data?.value) ? data.value : []);
    } catch (err) {
      console.error('Error fetching team:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();

    const channel = supabase
      .channel('team_settings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'settings', filter: 'key=eq.site_team' },
        () => fetchTeam()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading || team.length === 0) return null;

  return (
    <Section id="team" className="bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <div className="max-w-4xl mb-20 text-center mx-auto">
          <Typography variant="label" className="mb-6 block text-gray-400 uppercase tracking-[0.3em]">
            Section 06 — Our Team
          </Typography>
          <Typography variant="h2" className="mb-6">
            Tim di Balik Layar.
          </Typography>
          <Typography variant="p" className="text-gray-500 max-w-lg mx-auto">
            Orang-orang berdedikasi yang memastikan setiap momen Anda tertangkap dengan sempurna.
          </Typography>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto px-4 sm:px-6">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100 mb-4 relative">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    No Photo
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div className="text-center px-1">
                <Typography variant="h4" className="mb-1 text-base sm:text-lg font-black uppercase tracking-tight">
                  {member.name}
                </Typography>
                <Typography variant="p" className="text-xs sm:text-sm text-gray-400 uppercase tracking-widest font-bold">
                  {member.role}
                </Typography>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default Team;
