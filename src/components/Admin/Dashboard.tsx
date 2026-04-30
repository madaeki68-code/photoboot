import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit2, Trash2, LogOut, X, Save, 
  Image as ImageIcon, MessageSquare, LayoutGrid, 
  Settings as SettingsIcon, Globe, ChevronRight, 
  CheckCircle2, Mail, MapPin, Instagram, Twitter, ExternalLink 
} from 'lucide-react';
import { Project } from '../../types';
import { useSettings } from '../../hooks/useSettings';
import DashboardSection from './DashboardSection';
import FormField from './FormField';
import ListCard from './ListCard';
import Button from '../ui/Button';
import ImageUpload from './ImageUpload';
import MultiImageUpload from './MultiImageUpload';

interface Message {
  id: string;
  name: string;
  email: string;
  inquiry_type: string;
  message: string;
  status: string;
  created_at: string;
}

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<'projects' | 'messages' | 'settings'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const { settings, updateSetting, refresh: refreshSettings } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    mainImg: '',
    tag: '',
    description: '',
    detailImages: [] as string[],
    order: 0
  });

  const [settingsData, setSettingsData] = useState<Record<string, string>>({
    hero_title: '',
    hero_subtitle: '',
    hero_image: '',
    hero_image_2: '',
    hero_image_3: '',
    about_title: '',
    about_description: '',
    about_image: '',
    about_location: '',
    about_philosophy_title: '',
    about_philosophy_desc: '',
    about_philosophy_image: '',
    gallery_hero_title: '',
    gallery_hero_subtitle: '',
    gallery_featured_title: '',
    gallery_featured_subtitle: '',
    gallery_featured_image: '',
    site_title: '',
    site_logo_text: '',
    site_footer_text: '',
    contact_email: '',
    contact_address: '',
    social_instagram: '',
    social_twitter: '',
    social_pexels: ''
  });

  const [siteServices, setSiteServices] = useState<any[]>([]);
  const [siteTestimonials, setSiteTestimonials] = useState<any[]>([]);
  const [siteShowcase, setSiteShowcase] = useState<string[]>([]);
  const [siteStats, setSiteStats] = useState<any[]>([]);
  const [servicesProcess, setServicesProcess] = useState<any[]>([]);
  const [servicesPackages, setServicesPackages] = useState<any[]>([]);
  const [contactFaq, setContactFaq] = useState<any[]>([]);

  useEffect(() => {
    if (settings) {
      setSettingsData({
        hero_title: settings.hero_title || '',
        hero_subtitle: settings.hero_subtitle || '',
        hero_image: settings.hero_image || '',
        hero_image_2: settings.hero_image_2 || '',
        hero_image_3: settings.hero_image_3 || '',
        about_title: settings.about_title || '',
        about_description: settings.about_description || '',
        about_image: settings.about_image || '',
        about_location: settings.about_location || '',
        about_philosophy_title: settings.about_philosophy_title || '',
        about_philosophy_desc: settings.about_philosophy_desc || '',
        about_philosophy_image: settings.about_philosophy_image || '',
        gallery_hero_title: settings.gallery_hero_title || '',
        gallery_hero_subtitle: settings.gallery_hero_subtitle || '',
        gallery_featured_title: settings.gallery_featured_title || '',
        gallery_featured_subtitle: settings.gallery_featured_subtitle || '',
        gallery_featured_image: settings.gallery_featured_image || '',
        site_title: settings.site_title || '',
        site_logo_text: settings.site_logo_text || '',
        site_footer_text: settings.site_footer_text || '',
        contact_email: settings.contact_email || '',
        contact_address: settings.contact_address || '',
        social_instagram: settings.social_instagram || '',
        social_twitter: settings.social_twitter || '',
        social_pexels: settings.social_pexels || '',
        about_hero_image: settings.about_hero_image || '',
        services_hero_image: settings.services_hero_image || '',
        gallery_hero_image: settings.gallery_hero_image || '',
        contact_hero_image: settings.contact_hero_image || ''
      });
      setSiteServices(settings.site_services || []);
      setSiteTestimonials(settings.site_testimonials || []);
      setSiteShowcase(settings.site_showcase || []);
      setSiteStats(settings.site_stats || []);
      setServicesProcess(settings.services_process || []);
      setServicesPackages(settings.services_packages || []);
      setContactFaq(settings.contact_faq || []);
    }
  }, [settings]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;
      
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
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchMessages();

    const channelProjects = supabase
      .channel('projects_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchProjects();
      })
      .subscribe();

    const channelMessages = supabase
      .channel('messages_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channelProjects);
      supabase.removeChannel(channelMessages);
    };
  }, []);

  const handleUpdateMessageStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pesan ini?')) {
      try {
        const { error } = await supabase
          .from('messages')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  };

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        location: project.location,
        mainImg: project.mainImg,
        tag: project.tag,
        description: project.description || '',
        detailImages: project.detailImages,
        order: project.order
      });
    } else {
      setEditingProject(null);
      setFormData({
        title: '',
        location: '',
        mainImg: '',
        tag: '',
        description: '',
        detailImages: [],
        order: projects.length
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title: formData.title,
      location: formData.location,
      main_img: formData.mainImg,
      tag: formData.tag,
      description: formData.description,
      detail_images: formData.detailImages,
      order: formData.order,
    };

    try {
      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(data)
          .eq('id', editingProject.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([data]);
        if (error) throw error;
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Gagal menyimpan proyek. Pastikan kebijakan RLS mengizinkan Anda untuk menulis ke database dan Anda sudah masuk.');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      // Save basic settings
      for (const [key, value] of Object.entries(settingsData)) {
        await updateSetting(key, value);
      }
      // Save complex settings
      await updateSetting('site_services', siteServices);
      await updateSetting('site_testimonials', siteTestimonials);
      await updateSetting('site_showcase', siteShowcase);
      await updateSetting('site_stats', siteStats);
      await updateSetting('services_process', servicesProcess);
      await updateSetting('services_packages', servicesPackages);
      await updateSetting('contact_faq', contactFaq);

      alert('Pengaturan berhasil diperbarui!');
      refreshSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Gagal menyimpan pengaturan.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAddService = () => {
    setSiteServices([...siteServices, { num: (siteServices.length + 1).toString().padStart(2, '0'), title: '', desc: '' }]);
  };

  const handleRemoveService = (index: number) => {
    setSiteServices(siteServices.filter((_, i) => i !== index));
  };

  const handleAddTestimonial = () => {
    setSiteTestimonials([...siteTestimonials, { quote: '', name: '', location: '', image: '' }]);
  };

  const handleRemoveTestimonial = (index: number) => {
    setSiteTestimonials(siteTestimonials.filter((_, i) => i !== index));
  };

  const handleAddStat = () => {
    setSiteStats([...siteStats, { label: '', value: '' }]);
  };

  const handleRemoveStat = (index: number) => {
    setSiteStats(siteStats.filter((_, i) => i !== index));
  };

  const handleAddProcess = () => {
    setServicesProcess([...servicesProcess, { step: (servicesProcess.length + 1).toString().padStart(2, '0'), title: '', desc: '' }]);
  };

  const handleRemoveProcess = (index: number) => {
    setServicesProcess(servicesProcess.filter((_, i) => i !== index));
  };

  const handleAddPackage = () => {
    setServicesPackages([...servicesPackages, { name: '', price: '', features: [] }]);
  };

  const handleRemovePackage = (index: number) => {
    setServicesPackages(servicesPackages.filter((_, i) => i !== index));
  };

  const handleAddFaq = () => {
    setContactFaq([...contactFaq, { q: '', a: '' }]);
  };

  const handleRemoveFaq = (index: number) => {
    setContactFaq(contactFaq.filter((_, i) => i !== index));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus proyek ini?')) {
      try {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-32 pb-24 px-4 md:px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-medium tracking-tighter mb-2">Dashboard</h1>
            <p className="text-gray-500">Kelola portofolio dan pertanyaan Anda</p>
          </div>
          <div className="flex gap-4">
            <div className="flex bg-gray-200 p-1 rounded-full mr-4 overflow-x-auto">
              <button
                onClick={() => setActiveTab('projects')}
                className={`flex items-center gap-2 px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'projects' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <LayoutGrid size={14} md:size={16} /> Proyek
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex items-center gap-2 px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'messages' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <MessageSquare size={14} md:size={16} /> Pesan
                {messages.filter(m => m.status === 'unread').length > 0 && (
                  <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-red-500 text-white text-[9px] md:text-[10px] flex items-center justify-center">
                    {messages.filter(m => m.status === 'unread').length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <SettingsIcon size={14} md:size={16} /> Pengaturan
              </button>
            </div>
            
            {activeTab === 'projects' && (
              <button 
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 bg-[#1F2021] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-all"
              >
                <Plus size={18} /> Tambah Proyek
              </button>
            )}
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 border border-gray-200 px-6 py-3 rounded-full text-sm font-medium hover:bg-white transition-all"
            >
              <LogOut size={18} /> Keluar
            </button>
          </div>
        </div>

        {activeTab === 'projects' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <motion.div 
                layout
                key={project.id}
                className="bg-white rounded-sm overflow-hidden shadow-sm border border-gray-100 group"
              >
              <div className="aspect-[4/3] overflow-hidden relative bg-gray-50 flex items-center justify-center">
                {project.mainImg ? (
                  <img 
                    src={project.mainImg} 
                    alt={project.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-300">
                    <ImageIcon size={32} strokeWidth={1} />
                    <span className="text-[10px] uppercase tracking-widest font-medium">No Image</span>
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenModal(project)}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(project.id)}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-medium tracking-tight">{project.title}</h3>
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-1 rounded">
                    {project.tag}
                  </span>
                </div>
                <p className="text-sm text-gray-500">Dipotret di {project.location}</p>
              </div>
            </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-widest text-gray-500">
                    <th className="p-6 font-medium">Status</th>
                    <th className="p-6 font-medium">Tanggal</th>
                    <th className="p-6 font-medium">Nama</th>
                    <th className="p-6 font-medium">Pertanyaan</th>
                    <th className="p-6 font-medium">Pesan</th>
                    <th className="p-6 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {messages.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-gray-500">
                        Belum ada pesan.
                      </td>
                    </tr>
                  ) : messages.map((msg) => (
                    <tr key={msg.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-medium tracking-widest ${msg.status === 'unread' ? 'bg-red-50 text-red-600' : msg.status === 'read' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                          {msg.status}
                        </span>
                      </td>
                      <td className="p-6 text-gray-500">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-6 hover:text-blue-600">
                        <a href={`mailto:${msg.email}`} className="font-medium inline-flex flex-col">
                          {msg.name}
                          <span className="text-xs text-gray-400 font-normal">{msg.email}</span>
                        </a>
                      </td>
                      <td className="p-6">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {msg.inquiry_type}
                        </span>
                      </td>
                      <td className="p-6 max-w-xs truncate text-gray-600" title={msg.message}>
                        {msg.message}
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                          {msg.status === 'unread' && (
                            <button
                              onClick={() => handleUpdateMessageStatus(msg.id, 'read')}
                              className="text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                            >
                              Tandai Dibaca
                            </button>
                          )}
                          {msg.status === 'read' && (
                            <button
                              onClick={() => handleUpdateMessageStatus(msg.id, 'archived')}
                              className="text-xs font-medium text-gray-600 hover:text-gray-800 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            >
                              Arsipkan
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="text-xs font-medium text-red-600 hover:text-red-800 px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-6">
              <Globe className="text-gray-400" />
              <div>
                <h2 className="text-xl font-medium tracking-tight">Konfigurasi Situs</h2>
                <p className="text-sm text-gray-500">Pengaturan teks dan visual global untuk portofolio Anda</p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-24">
              {/* Identity & Basic Contact */}
              <DashboardSection 
                title="Identity & Contact" 
                description="Manage your brand title, logo, and core contact information."
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Judul Situs" subtitle="Vena Pictures">
                    <input type="text" value={settingsData.site_title} onChange={(e) => setSettingsData({...settingsData, site_title: e.target.value})} className="dashboard-input" />
                  </FormField>
                  <FormField label="Contact Email">
                    <input type="email" value={settingsData.contact_email} onChange={(e) => setSettingsData({...settingsData, contact_email: e.target.value})} className="dashboard-input" />
                  </FormField>
                  <FormField label="Location Display">
                    <input type="text" value={settingsData.contact_address} onChange={(e) => setSettingsData({...settingsData, contact_address: e.target.value})} className="dashboard-input" />
                  </FormField>
                  <div className="md:col-span-2">
                    <ImageUpload 
                      label="About Page Image" 
                      value={settingsData.about_image} 
                      onChange={(url) => setSettingsData({...settingsData, about_image: url})} 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-50">
                  <FormField label="Instagram">
                    <input type="text" value={settingsData.social_instagram} onChange={(e) => setSettingsData({...settingsData, social_instagram: e.target.value})} className="dashboard-input" />
                  </FormField>
                  <FormField label="Twitter / X">
                    <input type="text" value={settingsData.social_twitter} onChange={(e) => setSettingsData({...settingsData, social_twitter: e.target.value})} className="dashboard-input" />
                  </FormField>
                  <FormField label="Pexels / Portfolio">
                    <input type="text" value={settingsData.social_pexels} onChange={(e) => setSettingsData({...settingsData, social_pexels: e.target.value})} className="dashboard-input" />
                  </FormField>
                </div>
              </DashboardSection>

              {/* Hero & About Content */}
              <DashboardSection title="Hero & Philosophy" description="Configure the main hero section and your brand philosophy.">
                <div className="space-y-8">
                    <FormField label="Philosophy Title">
                      <input type="text" value={settingsData.about_philosophy_title} onChange={(e) => setSettingsData({...settingsData, about_philosophy_title: e.target.value})} className="dashboard-input" />
                    </FormField>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ImageUpload 
                      label="Gambar Hero Utama" 
                      value={settingsData.hero_image} 
                      onChange={(url) => setSettingsData({...settingsData, hero_image: url})} 
                    />
                    <ImageUpload 
                      label="Gambar Hero 2" 
                      value={settingsData.hero_image_2} 
                      onChange={(url) => setSettingsData({...settingsData, hero_image_2: url})} 
                    />
                    <ImageUpload 
                      label="Gambar Hero 3" 
                      value={settingsData.hero_image_3} 
                      onChange={(url) => setSettingsData({...settingsData, hero_image_3: url})} 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ImageUpload 
                      label="Gambar Filosofi" 
                      value={settingsData.about_philosophy_image} 
                      onChange={(url) => setSettingsData({...settingsData, about_philosophy_image: url})} 
                    />
                  </div>
                  <FormField label="Philosophy Description">
                    <textarea rows={3} value={settingsData.about_philosophy_desc} onChange={(e) => setSettingsData({...settingsData, about_philosophy_desc: e.target.value})} className="dashboard-textarea" />
                  </FormField>
                  </div>
                <div className="pt-8 border-t border-gray-50">
                  <p className="text-sm font-medium mb-4">Page Hero Images</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <ImageUpload 
                      label="Hero Tentang" 
                      value={settingsData.about_hero_image} 
                      onChange={(url) => setSettingsData({...settingsData, about_hero_image: url})} 
                    />
                    <ImageUpload 
                      label="Hero Layanan" 
                      value={settingsData.services_hero_image} 
                      onChange={(url) => setSettingsData({...settingsData, services_hero_image: url})} 
                    />
                    <ImageUpload 
                      label="Hero Galeri" 
                      value={settingsData.gallery_hero_image} 
                      onChange={(url) => setSettingsData({...settingsData, gallery_hero_image: url})} 
                    />
                    <ImageUpload 
                      label="Hero Kontak" 
                      value={settingsData.contact_hero_image} 
                      onChange={(url) => setSettingsData({...settingsData, contact_hero_image: url})} 
                    />
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium">Achievement Stats</p>
                    <button type="button" onClick={handleAddStat} className="text-xs text-blue-600 hover:underline">+ Add Stat</button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {siteStats.map((stat, idx) => (
                      <ListCard key={idx} onRemove={() => handleRemoveStat(idx)} className="p-4">
                        <input type="text" value={stat.value} onChange={(e) => {
                          const newStats = [...siteStats];
                          newStats[idx].value = e.target.value;
                          setSiteStats(newStats);
                        }} className="w-full text-lg font-bold border-none bg-transparent focus:ring-0 p-0" placeholder="00" />
                        <input type="text" value={stat.label} onChange={(e) => {
                           const newStats = [...siteStats];
                           newStats[idx].label = e.target.value;
                           setSiteStats(newStats);
                        }} className="w-full text-[10px] uppercase tracking-widest text-gray-400 border-none bg-transparent focus:ring-0 p-0" placeholder="Label" />
                      </ListCard>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium">Testimonials</p>
                    <button type="button" onClick={handleAddTestimonial} className="text-xs text-blue-600 hover:underline">+ Add Testimonial</button>
                  </div>
                  <div className="space-y-4">
                    {siteTestimonials.map((t, idx) => (
                      <ListCard key={idx} onRemove={() => handleRemoveTestimonial(idx)}>
                        <div className="grid md:grid-cols-3 gap-6">
                          <div className="md:col-span-2 space-y-4">
                            <input type="text" value={t.name} onChange={(e) => {
                              const newT = [...siteTestimonials];
                              newT[idx].name = e.target.value;
                              setSiteTestimonials(newT);
                            }} className="w-full font-bold border-none bg-transparent focus:ring-0 p-0" placeholder="Client Name" />
                            <input type="text" value={t.location} onChange={(e) => {
                              const newT = [...siteTestimonials];
                              newT[idx].location = e.target.value;
                              setSiteTestimonials(newT);
                            }} className="w-full text-xs text-gray-400 border-none bg-transparent focus:ring-0 p-0" placeholder="Location" />
                            <textarea value={t.quote} onChange={(e) => {
                              const newT = [...siteTestimonials];
                              newT[idx].quote = e.target.value;
                              setSiteTestimonials(newT);
                            }} className="w-full text-sm text-gray-500 border-none bg-transparent focus:ring-0 p-0 resize-none" placeholder="The quote..." rows={3} />
                          </div>
                          <div>
                            <ImageUpload 
                              label="Client Image" 
                              value={t.image} 
                              onChange={(url) => {
                                const newT = [...siteTestimonials];
                                newT[idx].image = url;
                                setSiteTestimonials(newT);
                              }} 
                            />
                          </div>
                        </div>
                      </ListCard>
                    ))}
                  </div>
                </div>
              </DashboardSection>

              {/* Gallery Archive */}
              <DashboardSection title="Gallery & Showcase" description="Manage the archive page headers and featured spotlight.">
                <div className="grid grid-cols-2 gap-6">
                  <FormField label="Hero Title">
                    <input type="text" value={settingsData.gallery_hero_title} onChange={(e) => setSettingsData({...settingsData, gallery_hero_title: e.target.value})} className="dashboard-input" />
                  </FormField>
                  <FormField label="Hero Subtitle">
                    <input type="text" value={settingsData.gallery_hero_subtitle} onChange={(e) => setSettingsData({...settingsData, gallery_hero_subtitle: e.target.value})} className="dashboard-input" />
                  </FormField>
                </div>
                
                <div className="pt-6 border-t border-gray-50">
                  <MultiImageUpload 
                    label="Portfolio Showcase" 
                    value={siteShowcase} 
                    onChange={(urls) => setSiteShowcase(urls)} 
                  />
                </div>

                <div className="space-y-6 pt-6 border-t border-gray-50">
                  <p className="text-sm font-medium">Featured Spotlight</p>
                  <div className="grid grid-cols-2 gap-6">
                    <FormField label="Spotlight Title">
                      <input type="text" value={settingsData.gallery_featured_title} onChange={(e) => setSettingsData({...settingsData, gallery_featured_title: e.target.value})} className="dashboard-input" />
                    </FormField>
                    <FormField label="Spotlight Subtitle">
                      <input type="text" value={settingsData.gallery_featured_subtitle} onChange={(e) => setSettingsData({...settingsData, gallery_featured_subtitle: e.target.value})} className="dashboard-input" />
                    </FormField>
                  </div>
                  <ImageUpload 
                    label="Gallery Featured Image" 
                    value={settingsData.gallery_featured_image} 
                    onChange={(url) => setSettingsData({...settingsData, gallery_featured_image: url})} 
                  />
                </div>
              </DashboardSection>

              {/* Services & Packages */}
              <DashboardSection 
                title="Services & Pricing" 
                description="Manage your workflow process and investment packages."
                actions={
                  <div className="flex flex-col gap-2 mt-4">
                    <button type="button" onClick={handleAddProcess} className="text-xs text-blue-600 hover:underline">+ Add Process Step</button>
                    <button type="button" onClick={handleAddPackage} className="text-xs text-blue-600 hover:underline">+ Add Package</button>
                  </div>
                }
              >
                <div className="space-y-12">
                  <div className="space-y-4">
                    <p className="text-sm font-medium">Work Process</p>
                    <div className="grid grid-cols-1 gap-4">
                      {servicesProcess.map((step, idx) => (
                        <ListCard key={idx} onRemove={() => handleRemoveProcess(idx)}>
                          <div className="flex gap-4">
                            <input type="text" value={step.step} onChange={(e) => {
                              const newSteps = [...servicesProcess];
                              newSteps[idx].step = e.target.value;
                              setServicesProcess(newSteps);
                            }} className="w-12 text-2xl font-bold border-none bg-transparent focus:ring-0 p-0 text-gray-300" />
                            <div className="flex-1 space-y-2">
                              <input type="text" value={step.title} onChange={(e) => {
                                const newSteps = [...servicesProcess];
                                newSteps[idx].title = e.target.value;
                                setServicesProcess(newSteps);
                              }} className="w-full font-medium border-none bg-transparent focus:ring-0 p-0" placeholder="Title" />
                              <textarea value={step.desc} onChange={(e) => {
                                const newSteps = [...servicesProcess];
                                newSteps[idx].desc = e.target.value;
                                setServicesProcess(newSteps);
                              }} className="w-full text-sm text-gray-500 border-none bg-transparent focus:ring-0 p-0 resize-none" placeholder="Description" rows={2} />
                            </div>
                          </div>
                        </ListCard>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm font-medium">Investment Packages</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {servicesPackages.map((pkg, idx) => (
                        <ListCard key={idx} onRemove={() => handleRemovePackage(idx)}>
                          <input type="text" value={pkg.name} onChange={(e) => {
                            const newPkgs = [...servicesPackages];
                            newPkgs[idx].name = e.target.value;
                            setServicesPackages(newPkgs);
                          }} className="w-full font-bold border-none bg-transparent focus:ring-0 p-0 mb-1" placeholder="Package Name" />
                          <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-xs text-gray-400">$</span>
                            <input type="text" value={pkg.price} onChange={(e) => {
                              const newPkgs = [...servicesPackages];
                              newPkgs[idx].price = e.target.value;
                              setServicesPackages(newPkgs);
                            }} className="w-24 text-2xl font-bold border-none bg-transparent focus:ring-0 p-0" placeholder="000" />
                          </div>
                          <FormField label="Features (comma separated)">
                            <textarea value={pkg.features.join(', ')} onChange={(e) => {
                              const newPkgs = [...servicesPackages];
                              newPkgs[idx].features = e.target.value.split(',').map(s => s.trim()).filter(s => s !== '');
                              setServicesPackages(newPkgs);
                            }} className="w-full text-xs text-gray-500 border-none bg-transparent focus:ring-0 p-0 resize-none" rows={3} />
                          </FormField>
                        </ListCard>
                      ))}
                    </div>
                  </div>
                </div>
              </DashboardSection>

              {/* FAQs */}
              <DashboardSection 
                title="FAQs" 
                description="Manage common questions and answers."
                onAdd={handleAddFaq}
                addLabel="Add FAQ"
              >
                <div className="space-y-4">
                  {contactFaq.map((faq, idx) => (
                    <ListCard key={idx} onRemove={() => handleRemoveFaq(idx)}>
                      <input type="text" value={faq.q} onChange={(e) => {
                        const newFaq = [...contactFaq];
                        newFaq[idx].q = e.target.value;
                        setContactFaq(newFaq);
                      }} className="w-full font-medium border-none bg-transparent focus:ring-0 p-0 mb-2" placeholder="Question" />
                      <textarea value={faq.a} onChange={(e) => {
                        const newFaq = [...contactFaq];
                        newFaq[idx].a = e.target.value;
                        setContactFaq(newFaq);
                      }} className="w-full text-sm text-gray-500 border-none bg-transparent focus:ring-0 p-0 resize-none" rows={2} placeholder="Answer" />
                    </ListCard>
                  ))}
                </div>
              </DashboardSection>

              <div className="pt-12 flex justify-end">
                <Button 
                  type="submit"
                  isLoading={isSavingSettings}
                  className="rounded-full"
                >
                  Simpan Semua Perubahan
                </Button>
              </div>
            </form>
          </div>
        )}

        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden"
              >
                <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-2xl font-medium tracking-tighter">
                    {editingProject ? 'Edit Proyek' : 'Proyek Baru'}
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black">
                    <X size={24} />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-400">Judul</label>
                      <input 
                        required
                        type="text" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full border-b border-gray-200 py-2 focus:border-black outline-none transition-colors"
                        placeholder="Project title"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-400">Lokasi</label>
                      <input 
                        required
                        type="text" 
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full border-b border-gray-200 py-2 focus:border-black outline-none transition-colors"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-400">Tag</label>
                      <input 
                        required
                        type="text" 
                        value={formData.tag}
                        onChange={(e) => setFormData({...formData, tag: e.target.value})}
                        className="w-full border-b border-gray-200 py-2 focus:border-black outline-none transition-colors"
                        placeholder="e.g. Editorial, Portrait"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-400">Order</label>
                      <input 
                        required
                        type="number" 
                        value={formData.order}
                        onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                        className="w-full border-b border-gray-200 py-2 focus:border-black outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-400">Description</label>
                    <textarea 
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full border border-gray-200 p-4 rounded-sm focus:border-black outline-none transition-colors resize-none"
                      placeholder="Project description..."
                    />
                  </div>

                  <ImageUpload 
                    label="Main Image" 
                    value={formData.mainImg} 
                    onChange={(url) => setFormData({...formData, mainImg: url})} 
                  />

                  <MultiImageUpload 
                    label="Detail Images" 
                    value={formData.detailImages} 
                    onChange={(urls) => setFormData({...formData, detailImages: urls})} 
                  />

                  <button 
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-[#1F2021] text-white py-4 rounded-full font-medium hover:bg-gray-800 transition-all"
                  >
                    <Save size={18} /> Simpan Proyek
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
