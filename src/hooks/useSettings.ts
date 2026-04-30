import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useSettings() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value');

      if (error) throw error;

      const settingsMap = (data || []).reduce((acc: any, item: any) => {
        acc[item.key] = item.value;
        return acc;
      }, {});

      setSettings(settingsMap);
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    // Use a unique channel name to avoid collisions when multiple components use this hook
    const channelId = Math.random().toString(36).substring(7);
    const channel = supabase
      .channel(`settings_changes_${channelId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
        fetchSettings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateSetting = async (key: string, value: any) => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ key, value }, { onConflict: 'key' });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error(`Error updating setting ${key}:`, err);
      return { success: false, error: err.message };
    }
  };

  return { settings, loading, updateSetting, refresh: fetchSettings };
}
