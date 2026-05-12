import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'projects';
  const setActiveTab = (tab: string) => setSearchParams({ tab });
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
    site_title: '',
    site_logo_text: '',
    hero_image: '',
    hero_image_2: '',
    hero_image_3: '',
    about_title: '',
    about_description: '',
    about_image: '',
    about_image_2: '',
    about_location: '',
    contact_email: '',
    contact_address: '',
    social_instagram: '',
    social_twitter: '',
    social_pexels: '',
    services_title: ''
  });

  const [siteServices, setSiteServices] = useState<any[]>([]);
  const [siteShowcase, setSiteShowcase] = useState<any[]>([]);
  const [siteTestimonials, setSiteTestimonials] = useState<any[]>([]);
  const [siteStats, setSiteStats] = useState<any[]>([]);
  const [servicesProcess, setServicesProcess] = useState<any[]>([]);
  const [servicesPackages, setServicesPackages] = useState<any[]>([]);
  const [contactFaq, setContactFaq] = useState<any[]>([]);

  useEffect(() => {
    if (settings) {
      setSettingsData({
        site_title: settings.site_title || '',
        site_logo_text: settings.site_logo_text || '',
        hero_image: settings.hero_image || '',
        hero_image_2: settings.hero_image_2 || '',
        hero_image_3: settings.hero_image_3 || '',
        about_title: settings.about_title || '',
        about_description: settings.about_description || '',
        about_image: settings.about_image || '',
        about_image_2: settings.about_image_2 || '',
        about_location: settings.about_location || '',
        contact_email: settings.contact_email || '',
        contact_address: settings.contact_address || '',
        social_instagram: settings.social_instagram || '',
        social_twitter: settings.social_twitter || '',
        social_pexels: settings.social_pexels || '',
        services_title: settings.services_title || '',
      });
      setSiteServices(settings.site_services || []);
      setSiteShowcase((settings.site_showcase || []).map((item: any) =>
        typeof item === 'string' ? { image: item, name: '' } : item
      ));
      setSiteTestimonials(settings.site_testimonials || []);
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

  const handleSaveSettings = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsSavingSettings(true);
    try {
      // Save basic settings
      for (const [key, value] of Object.entries(settingsData)) {
        await updateSetting(key, value);
      }
      // Save complex settings
      await updateSetting('site_services', siteServices);
      await updateSetting('site_showcase', siteShowcase);
      await updateSetting('site_testimonials', siteTestimonials);
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

  const handleAddShowcase = () => {
    setSiteShowcase([...siteShowcase, { image: '', name: '' }]);
  };

  const handleRemoveShowcase = (index: number) => {
    setSiteShowcase(siteShowcase.filter((_, i) => i !== index));
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
              {/* ── 1. IDENTITY & CONTACT ── */}
              <DashboardSection
                title="Identity & Contact"
                description="Nama brand, logo, email, alamat, dan media sosial."
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Judul Situs" subtitle="Nama brand / tab browser">
                    <input type="text" value={settingsData.site_title} onChange={(e) => setSettingsData({ ...settingsData, site_title: e.target.value })} className="dashboard-input" placeholder="cth. Photoboot Studio" />
                  </FormField>
                  <FormField label="Logo Text" subtitle="Teks logo di navbar & footer">
                    <input type="text" value={settingsData.site_logo_text} onChange={(e) => setSettingsData({ ...settingsData, site_logo_text: e.target.value })} className="dashboard-input" placeholder="cth. PHOTOBOOT" />
                  </FormField>
                  <FormField label="Email Kontak" subtitle="Tampil di footer & menu">
                    <input type="email" value={settingsData.contact_email} onChange={(e) => setSettingsData({ ...settingsData, contact_email: e.target.value })} className="dashboard-input" placeholder="cth. hello@photoboot.id" />
                  </FormField>
                  <FormField label="Lokasi / Alamat" subtitle="Tampil di footer">
                    <input type="text" value={settingsData.contact_address} onChange={(e) => setSettingsData({ ...settingsData, contact_address: e.target.value })} className="dashboard-input" placeholder="cth. Jakarta, Indonesia" />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-50">
                  <FormField label="Instagram" subtitle="URL profil lengkap">
                    <input type="text" value={settingsData.social_instagram} onChange={(e) => setSettingsData({ ...settingsData, social_instagram: e.target.value })} className="dashboard-input" placeholder="https://instagram.com/username" />
                  </FormField>
                  <FormField label="Twitter / X" subtitle="URL profil lengkap">
                    <input type="text" value={settingsData.social_twitter} onChange={(e) => setSettingsData({ ...settingsData, social_twitter: e.target.value })} className="dashboard-input" placeholder="https://x.com/username" />
                  </FormField>
                  <FormField label="Pexels / Portfolio" subtitle="URL profil lengkap">
                    <input type="text" value={settingsData.social_pexels} onChange={(e) => setSettingsData({ ...settingsData, social_pexels: e.target.value })} className="dashboard-input" placeholder="https://pexels.com/@username" />
                  </FormField>
                </div>
              </DashboardSection>

              {/* ── 2. HERO ── */}
              <DashboardSection title="Hero" description="Foto slideshow di halaman utama.">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <ImageUpload label="Foto Hero 1" value={settingsData.hero_image} onChange={(url) => setSettingsData({ ...settingsData, hero_image: url })} />
                    <p className="text-[10px] text-gray-400 mt-1">Foto pertama slideshow</p>
                  </div>
                  <div>
                    <ImageUpload label="Foto Hero 2" value={settingsData.hero_image_2} onChange={(url) => setSettingsData({ ...settingsData, hero_image_2: url })} />
                    <p className="text-[10px] text-gray-400 mt-1">Foto kedua slideshow</p>
                  </div>
                  <div>
                    <ImageUpload label="Foto Hero 3" value={settingsData.hero_image_3} onChange={(url) => setSettingsData({ ...settingsData, hero_image_3: url })} />
                    <p className="text-[10px] text-gray-400 mt-1">Foto ketiga slideshow</p>
                  </div>
                </div>
              </DashboardSection>

              {/* ── 3. ABOUT ── */}
              <DashboardSection title="About" description="Konten section About — judul, deskripsi, lokasi, dan dua foto.">
                <div className="space-y-6">
                  <FormField label="Judul About" subtitle="Heading besar section About">
                    <input type="text" value={settingsData.about_title} onChange={(e) => setSettingsData({ ...settingsData, about_title: e.target.value })} className="dashboard-input" placeholder="cth. Photoboot Terbaik " />
                  </FormField>
                  <FormField label="Deskripsi About" subtitle="Paragraf deskripsi + tampil di menu overlay">
                    <textarea rows={3} value={settingsData.about_description} onChange={(e) => setSettingsData({ ...settingsData, about_description: e.target.value })} className="dashboard-textarea" placeholder="cth. Kalo Photobooth hadir untuk mengabadikan momen-momen paling murni..." />
                  </FormField>
                  <FormField label="Lokasi Foto" subtitle="Teks kecil di atas foto About">
                    <input type="text" value={settingsData.about_location} onChange={(e) => setSettingsData({ ...settingsData, about_location: e.target.value })} className="dashboard-input" placeholder="cth. Jakarta, Indonesia" />
                  </FormField>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <ImageUpload label="Foto About 1" value={settingsData.about_image} onChange={(url) => setSettingsData({ ...settingsData, about_image: url })} />
                      <p className="text-[10px] text-gray-400 mt-1">Foto kiri (lebih tinggi)</p>
                    </div>
                    <div>
                      <ImageUpload label="Foto About 2" value={settingsData.about_image_2} onChange={(url) => setSettingsData({ ...settingsData, about_image_2: url })} />
                      <p className="text-[10px] text-gray-400 mt-1">Foto kanan (sedikit turun)</p>
                    </div>
                  </div>
                </div>
              </DashboardSection>

              {/* ── 4. LAYANAN ── */}
              <DashboardSection
                title="Layanan"
                description="Kartu layanan di section Services homepage."
                onAdd={handleAddService}
                addLabel="Tambah Layanan"
              >
                <div className="space-y-6">
                  <FormField label="Judul Section Layanan" subtitle="Heading besar di atas kartu layanan">
                    <input type="text" value={settingsData.services_title} onChange={(e) => setSettingsData({ ...settingsData, services_title: e.target.value })} className="dashboard-input" placeholder="cth. Mengabadikan moment Pernikahan Kamu." />
                  </FormField>
                  <div className="space-y-4">
                    {siteServices.map((srv, idx) => (
                      <ListCard key={idx} onRemove={() => handleRemoveService(idx)}>
                        <div className="flex gap-4">
                          <input type="text" value={srv.num} onChange={(e) => { const n = [...siteServices]; n[idx].num = e.target.value; setSiteServices(n); }} className="w-12 text-2xl font-bold border-none bg-transparent focus:ring-0 p-0 text-gray-300" placeholder="01" />
                          <div className="flex-1 space-y-2">
                            <input type="text" value={srv.title} onChange={(e) => { const n = [...siteServices]; n[idx].title = e.target.value; setSiteServices(n); }} className="w-full font-medium border-none bg-transparent focus:ring-0 p-0" placeholder="cth. Wedding Photobooth" />
                            <textarea value={srv.desc} onChange={(e) => { const n = [...siteServices]; n[idx].desc = e.target.value; setSiteServices(n); }} className="w-full text-sm text-gray-500 border-none bg-transparent focus:ring-0 p-0 resize-none" placeholder="cth. Souvenir instan elegan untuk para tamu." rows={2} />
                            <ImageUpload label="Foto Layanan" value={srv.image || ''} onChange={(url) => { const n = [...siteServices]; n[idx].image = url; setSiteServices(n); }} />
                          </div>
                        </div>
                      </ListCard>
                    ))}
                  </div>
                </div>
              </DashboardSection>

              {/* ── 5. SELECTED WORKS ── */}
              <DashboardSection
                title="Selected Works"
                description="Karya pilihan di halaman /works."
                onAdd={handleAddShowcase}
                addLabel="Tambah Karya"
              >
                <div className="space-y-4">
                  {siteShowcase.map((item, idx) => {
                    const safeItem = typeof item === 'string' ? { image: item, name: '' } : item;
                    return (
                      <ListCard key={idx} onRemove={() => handleRemoveShowcase(idx)}>
                        <div className="space-y-3">
                          <input type="text" value={safeItem.name} onChange={(e) => { const n = siteShowcase.map((it, i) => { const s = typeof it === 'string' ? { image: it, name: '' } : { ...it }; return i === idx ? { ...s, name: e.target.value } : s; }); setSiteShowcase(n); }} className="dashboard-input" placeholder="cth. The Golden Hour Wedding" />
                          <ImageUpload label="Foto Karya" value={safeItem.image || ''} onChange={(url) => { const n = siteShowcase.map((it, i) => { const s = typeof it === 'string' ? { image: it, name: '' } : { ...it }; return i === idx ? { ...s, image: url } : s; }); setSiteShowcase(n); }} />
                        </div>
                      </ListCard>
                    );
                  })}
                </div>
              </DashboardSection>

              {/* ── 6. TESTIMONIALS ── */}
              <DashboardSection
                title="Testimonials"
                description="Ulasan klien yang tampil di homepage."
                onAdd={handleAddTestimonial}
                addLabel="Tambah Testimoni"
              >
                <div className="space-y-4">
                  {siteTestimonials.map((t, idx) => (
                    <ListCard key={idx} onRemove={() => handleRemoveTestimonial(idx)}>
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-3">
                          <input type="text" value={t.name} onChange={(e) => { const n = [...siteTestimonials]; n[idx].name = e.target.value; setSiteTestimonials(n); }} className="dashboard-input" placeholder="Nama klien" />
                          <input type="text" value={t.location} onChange={(e) => { const n = [...siteTestimonials]; n[idx].location = e.target.value; setSiteTestimonials(n); }} className="dashboard-input" placeholder="cth. Bali, Indonesia" />
                          <textarea value={t.quote} onChange={(e) => { const n = [...siteTestimonials]; n[idx].quote = e.target.value; setSiteTestimonials(n); }} className="dashboard-textarea" placeholder="Kutipan testimoni..." rows={3} />
                        </div>
                        <div>
                          <ImageUpload label="Foto Klien" value={t.image} onChange={(url) => { const n = [...siteTestimonials]; n[idx].image = url; setSiteTestimonials(n); }} />
                        </div>
                      </div>
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

        {/* Sticky Save Bar for Settings */}
        {activeTab === 'settings' && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg px-6 py-4">
            <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
              <p className="text-sm text-gray-500">Perubahan belum disimpan — klik tombol untuk menyimpan.</p>
              <button
                type="button"
                disabled={isSavingSettings}
                onClick={() => handleSaveSettings()}
                className="flex items-center gap-2 bg-[#1F2021] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingSettings ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Simpan Semua Perubahan
                  </>
                )}
              </button>
            </div>
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
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
                        onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
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
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                        className="w-full border-b border-gray-200 py-2 focus:border-black outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-400">Description</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full border border-gray-200 p-4 rounded-sm focus:border-black outline-none transition-colors resize-none"
                      placeholder="Project description..."
                    />
                  </div>

                  <ImageUpload
                    label="Main Image"
                    value={formData.mainImg}
                    onChange={(url) => setFormData({ ...formData, mainImg: url })}
                  />

                  <MultiImageUpload
                    label="Detail Images"
                    value={formData.detailImages}
                    onChange={(urls) => setFormData({ ...formData, detailImages: urls })}
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
