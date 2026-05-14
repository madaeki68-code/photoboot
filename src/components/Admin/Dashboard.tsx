import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  LogOut,
  LayoutGrid,
  MessageSquare,
  Settings as SettingsIcon,
  Package,
  CalendarCheck,
  Menu,
} from 'lucide-react';
import { Project } from '../../types';

// Tab components
import ProjectsTab from './tabs/ProjectsTab';
import MessagesTab from './tabs/MessagesTab';
import BookingsTab from './tabs/BookingsTab';
import PackagesTab from './tabs/PackagesTab';
import SettingsTab from './tabs/SettingsTab';

interface Message {
  id: string;
  name: string;
  email: string;
  inquiry_type: string;
  message: string;
  status: string;
  created_at: string;
}

interface Booking {
  id: string;
  name: string;
  whatsapp: string;
  location: string;
  event_category: string;
  event_date: string;
  package_name: string;
  promo_code: string;
  notes: string;
  payment_proof_url: string;
  status: string;
  created_at: string;
}

const TABS = [
  { key: 'projects', label: 'Proyek', icon: LayoutGrid },
  { key: 'messages', label: 'Pesan', icon: MessageSquare },
  { key: 'settings', label: 'Pengaturan', icon: SettingsIcon },
  { key: 'packages', label: 'Paket & Addons', icon: Package },
  { key: 'bookings', label: 'Booking', icon: CalendarCheck },
] as const;

export const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'projects';
  const setActiveTab = (tab: string) => setSearchParams({ tab });

  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ── Data fetching ──
  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('order', { ascending: true });
    if (error) { console.error(error); return; }
    setProjects(
      (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        location: item.location,
        mainImg: item.main_img,
        tag: item.tag,
        description: item.description,
        detailImages: item.detail_images || [],
        order: item.order,
      }))
    );
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error(error); return; }
    setMessages(data || []);
  };

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error(error); return; }
    setBookings(data || []);
  };

  useEffect(() => {
    fetchProjects();
    fetchMessages();
    fetchBookings();

    const chProjects = supabase
      .channel('dash_projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchProjects)
      .subscribe();

    const chMessages = supabase
      .channel('dash_messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchMessages)
      .subscribe();

    const chBookings = supabase
      .channel('dash_bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, fetchBookings)
      .subscribe();

    return () => {
      supabase.removeChannel(chProjects);
      supabase.removeChannel(chMessages);
      supabase.removeChannel(chBookings);
    };
  }, []);

  const unreadMessages = messages.filter((m) => m.status === 'unread').length;
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const activeTabLabel = TABS.find(t => t.key === activeTab)?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-8">
            <h2 className="text-2xl font-bold italic tracking-tighter text-[#1F2021]">Admin Panel</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mt-1">Management System</p>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {TABS.map(({ key, label, icon: Icon }) => {
              const badge =
                key === 'messages'
                  ? unreadMessages
                  : key === 'bookings'
                  ? pendingBookings
                  : 0;
              const isActive = activeTab === key;

              return (
                <button
                  key={key}
                  onClick={() => {
                    setActiveTab(key);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#1F2021] text-white shadow-lg shadow-gray-200'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    {label}
                  </div>
                  {badge > 0 && (
                    <span className={`w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center ${
                      key === 'bookings' ? 'bg-orange-500' : 'bg-red-500'
                    }`}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-50">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={18} /> Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100">
          <h2 className="text-xl font-bold italic tracking-tighter text-[#1F2021]">Admin</h2>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </header>

        <div className="flex-1 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">
              <span>Admin</span>
              <span>/</span>
              <span className="text-gray-900 font-semibold">{activeTabLabel}</span>
            </div>
            <h1 className="text-4xl font-medium tracking-tight text-[#1F2021]">{activeTabLabel}</h1>
          </div>

          {/* Tab Content with Animation */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'projects' && <ProjectsTab projects={projects} />}
            {activeTab === 'messages' && <MessagesTab messages={messages} />}
            {activeTab === 'bookings' && <BookingsTab bookings={bookings} />}
            {activeTab === 'packages' && <PackagesTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </div>
        </div>
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};
