import React, { useState, useEffect } from 'react';
import { Save, Globe } from 'lucide-react';
import { useSettings } from '../../../hooks/useSettings';
import DashboardSection from '../DashboardSection';
import FormField from '../FormField';
import ListCard from '../ListCard';
import Button from '../../ui/Button';
import ImageUpload from '../ImageUpload';

const SettingsTab: React.FC = () => {
  const { settings, updateSetting, refresh } = useSettings();
  const [isSaving, setIsSaving] = useState(false);

  const [settingsData, setSettingsData] = useState<Record<string, string>>({
    site_title: '',
    site_logo: '',
    site_logo_text: '',
    admin_signature: '',
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
    services_title: '',
  });

  const [siteServices, setSiteServices] = useState<any[]>([]);
  const [siteTeam, setSiteTeam] = useState<any[]>([]);
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
        site_logo: settings.site_logo || '',
        site_logo_text: settings.site_logo_text || '',
        admin_signature: settings.admin_signature || '',
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
      setSiteTeam(settings.site_team || []);
      setSiteShowcase(
        (settings.site_showcase || []).map((item: any) =>
          typeof item === 'string' ? { image: item, name: '' } : item
        )
      );
      setSiteTestimonials(settings.site_testimonials || []);
      setSiteStats(settings.site_stats || []);
      setServicesProcess(settings.services_process || []);
      setServicesPackages(settings.services_packages || []);
      setContactFaq(settings.contact_faq || []);
    }
  }, [settings]);

  const set = (key: string, value: string) =>
    setSettingsData((prev) => ({ ...prev, [key]: value }));

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsSaving(true);
    try {
      for (const [key, value] of Object.entries(settingsData)) {
        await updateSetting(key, value);
      }
      await updateSetting('site_services', siteServices);
      await updateSetting('site_team', siteTeam);
      await updateSetting('site_showcase', siteShowcase);
      await updateSetting('site_testimonials', siteTestimonials);
      await updateSetting('site_stats', siteStats);
      await updateSetting('services_process', servicesProcess);
      await updateSetting('services_packages', servicesPackages);
      await updateSetting('contact_faq', contactFaq);
      alert('Pengaturan berhasil diperbarui!');
      refresh();
    } catch {
      alert('Gagal menyimpan pengaturan.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── List helpers ──
  const updateListItem = <T,>(
    list: T[],
    setList: React.Dispatch<React.SetStateAction<T[]>>,
    idx: number,
    field: string,
    value: any
  ) => {
    const next = [...list];
    (next[idx] as any)[field] = value;
    setList(next);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-6">
        <Globe className="text-gray-400" size={20} />
        <div>
          <h2 className="text-xl font-medium tracking-tight">Konfigurasi Situs</h2>
          <p className="text-sm text-gray-500">
            Pengaturan teks dan visual global untuk portofolio Anda
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-24">
        {/* ── 1. Identity & Contact ── */}
        <DashboardSection
          title="Identity & Contact"
          description="Nama brand, logo, email, alamat, dan media sosial."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <ImageUpload
                label="Logo Situs (PNG/Transparent)"
                value={settingsData.site_logo}
                onChange={(url) => set('site_logo', url)}
              />
            </div>
            <div>
              <ImageUpload
                label="Tanda Tangan Admin (PNG)"
                value={settingsData.admin_signature}
                onChange={(url) => set('admin_signature', url)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Judul Situs" subtitle="Nama brand / tab browser">
              <input
                type="text"
                value={settingsData.site_title}
                onChange={(e) => set('site_title', e.target.value)}
                className="dashboard-input"
                placeholder="cth. Photoboot Studio"
              />
            </FormField>
            <FormField label="Logo Text" subtitle="Teks logo di navbar & footer (Fallback)">
              <input
                type="text"
                value={settingsData.site_logo_text}
                onChange={(e) => set('site_logo_text', e.target.value)}
                className="dashboard-input"
                placeholder="cth. PHOTOBOOT"
              />
            </FormField>
            <FormField label="Email Kontak" subtitle="Tampil di footer & menu">
              <input
                type="email"
                value={settingsData.contact_email}
                onChange={(e) => set('contact_email', e.target.value)}
                className="dashboard-input"
                placeholder="cth. hello@photoboot.id"
              />
            </FormField>
            <FormField label="Lokasi / Alamat" subtitle="Tampil di footer">
              <input
                type="text"
                value={settingsData.contact_address}
                onChange={(e) => set('contact_address', e.target.value)}
                className="dashboard-input"
                placeholder="cth. Jakarta, Indonesia"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-50">
            <FormField label="Instagram" subtitle="URL profil lengkap">
              <input
                type="text"
                value={settingsData.social_instagram}
                onChange={(e) => set('social_instagram', e.target.value)}
                className="dashboard-input"
                placeholder="https://instagram.com/username"
              />
            </FormField>
            <FormField label="Twitter / X" subtitle="URL profil lengkap">
              <input
                type="text"
                value={settingsData.social_twitter}
                onChange={(e) => set('social_twitter', e.target.value)}
                className="dashboard-input"
                placeholder="https://x.com/username"
              />
            </FormField>
            <FormField label="Pexels / Portfolio" subtitle="URL profil lengkap">
              <input
                type="text"
                value={settingsData.social_pexels}
                onChange={(e) => set('social_pexels', e.target.value)}
                className="dashboard-input"
                placeholder="https://pexels.com/@username"
              />
            </FormField>
          </div>
        </DashboardSection>

        {/* ── 2. Hero ── */}
        <DashboardSection title="Hero" description="Foto slideshow di halaman utama.">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['hero_image', 'hero_image_2', 'hero_image_3'] as const).map((key, i) => (
              <div key={key}>
                <ImageUpload
                  label={`Foto Hero ${i + 1}`}
                  value={settingsData[key]}
                  onChange={(url) => set(key, url)}
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Foto {['pertama', 'kedua', 'ketiga'][i]} slideshow
                </p>
              </div>
            ))}
          </div>
        </DashboardSection>

        {/* ── 3. About ── */}
        <DashboardSection
          title="About"
          description="Konten section About — judul, deskripsi, lokasi, dan dua foto."
        >
          <div className="space-y-6">
            <FormField label="Judul About" subtitle="Heading besar section About">
              <input
                type="text"
                value={settingsData.about_title}
                onChange={(e) => set('about_title', e.target.value)}
                className="dashboard-input"
                placeholder="cth. Photoboot Terbaik"
              />
            </FormField>
            <FormField label="Deskripsi About" subtitle="Paragraf deskripsi">
              <textarea
                rows={3}
                value={settingsData.about_description}
                onChange={(e) => set('about_description', e.target.value)}
                className="dashboard-textarea"
                placeholder="cth. Kalo Photobooth hadir untuk mengabadikan momen-momen paling murni..."
              />
            </FormField>
            <FormField label="Lokasi Foto" subtitle="Teks kecil di atas foto About">
              <input
                type="text"
                value={settingsData.about_location}
                onChange={(e) => set('about_location', e.target.value)}
                className="dashboard-input"
                placeholder="cth. Jakarta, Indonesia"
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <ImageUpload
                  label="Foto About 1"
                  value={settingsData.about_image}
                  onChange={(url) => set('about_image', url)}
                />
                <p className="text-[10px] text-gray-400 mt-1">Foto kiri (lebih tinggi)</p>
              </div>
              <div>
                <ImageUpload
                  label="Foto About 2"
                  value={settingsData.about_image_2}
                  onChange={(url) => set('about_image_2', url)}
                />
                <p className="text-[10px] text-gray-400 mt-1">Foto kanan (sedikit turun)</p>
              </div>
            </div>
          </div>
        </DashboardSection>

        {/* ── 4. Layanan ── */}
        <DashboardSection
          title="Layanan"
          description="Kartu layanan di section Services homepage."
          onAdd={() =>
            setSiteServices([
              ...siteServices,
              {
                num: (siteServices.length + 1).toString().padStart(2, '0'),
                title: '',
                desc: '',
              },
            ])
          }
          addLabel="Tambah Layanan"
        >
          <div className="space-y-6">
            <FormField label="Judul Section Layanan" subtitle="Heading besar di atas kartu layanan">
              <input
                type="text"
                value={settingsData.services_title}
                onChange={(e) => set('services_title', e.target.value)}
                className="dashboard-input"
                placeholder="cth. Mengabadikan moment Pernikahan Kamu."
              />
            </FormField>
            <div className="space-y-4">
              {siteServices.map((srv, idx) => (
                <ListCard
                  key={idx}
                  onRemove={() => setSiteServices(siteServices.filter((_, i) => i !== idx))}
                >
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={srv.num}
                      onChange={(e) =>
                        updateListItem(siteServices, setSiteServices, idx, 'num', e.target.value)
                      }
                      className="w-12 text-2xl font-bold border-none bg-transparent focus:ring-0 p-0 text-gray-300"
                      placeholder="01"
                    />
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={srv.title}
                        onChange={(e) =>
                          updateListItem(siteServices, setSiteServices, idx, 'title', e.target.value)
                        }
                        className="w-full font-medium border-none bg-transparent focus:ring-0 p-0"
                        placeholder="cth. Wedding Photobooth"
                      />
                      <textarea
                        value={srv.desc}
                        onChange={(e) =>
                          updateListItem(siteServices, setSiteServices, idx, 'desc', e.target.value)
                        }
                        className="w-full text-sm text-gray-500 border-none bg-transparent focus:ring-0 p-0 resize-none"
                        placeholder="cth. Souvenir instan elegan untuk para tamu."
                        rows={2}
                      />
                      <ImageUpload
                        label="Foto Layanan"
                        value={srv.image || ''}
                        onChange={(url) =>
                          updateListItem(siteServices, setSiteServices, idx, 'image', url)
                        }
                      />
                    </div>
                  </div>
                </ListCard>
              ))}
            </div>
          </div>
        </DashboardSection>

        {/* ── 5. Selected Works ── */}
        <DashboardSection
          title="Selected Works"
          description="Karya pilihan di halaman /works."
          onAdd={() => setSiteShowcase([...siteShowcase, { image: '', name: '' }])}
          addLabel="Tambah Karya"
        >
          <div className="space-y-4">
            {siteShowcase.map((item, idx) => {
              const safe =
                typeof item === 'string' ? { image: item, name: '' } : item;
              return (
                <ListCard
                  key={idx}
                  onRemove={() => setSiteShowcase(siteShowcase.filter((_, i) => i !== idx))}
                >
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={safe.name}
                      onChange={(e) => {
                        const next = siteShowcase.map((it, i) => {
                          const s =
                            typeof it === 'string' ? { image: it, name: '' } : { ...it };
                          return i === idx ? { ...s, name: e.target.value } : s;
                        });
                        setSiteShowcase(next);
                      }}
                      className="dashboard-input"
                      placeholder="cth. The Golden Hour Wedding"
                    />
                    <ImageUpload
                      label="Foto Karya"
                      value={safe.image || ''}
                      onChange={(url) => {
                        const next = siteShowcase.map((it, i) => {
                          const s =
                            typeof it === 'string' ? { image: it, name: '' } : { ...it };
                          return i === idx ? { ...s, image: url } : s;
                        });
                        setSiteShowcase(next);
                      }}
                    />
                  </div>
                </ListCard>
              );
            })}
          </div>
        </DashboardSection>

        {/* ── 6. Testimonials ── */}
        <DashboardSection
          title="Testimonials"
          description="Ulasan klien yang tampil di homepage."
          onAdd={() =>
            setSiteTestimonials([
              ...siteTestimonials,
              { quote: '', name: '', location: '', image: '' },
            ])
          }
          addLabel="Tambah Testimoni"
        >
          <div className="space-y-4">
            {siteTestimonials.map((t, idx) => (
              <ListCard
                key={idx}
                onRemove={() =>
                  setSiteTestimonials(siteTestimonials.filter((_, i) => i !== idx))
                }
              >
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-3">
                    <input
                      type="text"
                      value={t.name}
                      onChange={(e) =>
                        updateListItem(siteTestimonials, setSiteTestimonials, idx, 'name', e.target.value)
                      }
                      className="dashboard-input"
                      placeholder="Nama klien"
                    />
                    <input
                      type="text"
                      value={t.location}
                      onChange={(e) =>
                        updateListItem(siteTestimonials, setSiteTestimonials, idx, 'location', e.target.value)
                      }
                      className="dashboard-input"
                      placeholder="cth. Bali, Indonesia"
                    />
                    <textarea
                      value={t.quote}
                      onChange={(e) =>
                        updateListItem(siteTestimonials, setSiteTestimonials, idx, 'quote', e.target.value)
                      }
                      className="dashboard-textarea"
                      placeholder="Kutipan testimoni..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <ImageUpload
                      label="Foto Klien"
                      value={t.image}
                      onChange={(url) =>
                        updateListItem(siteTestimonials, setSiteTestimonials, idx, 'image', url)
                      }
                    />
                  </div>
                </div>
              </ListCard>
            ))}
          </div>
        </DashboardSection>

        {/* ── 7. Stats ── */}
        <DashboardSection
          title="Statistik"
          description="Angka-angka pencapaian yang tampil di halaman About."
          onAdd={() => setSiteStats([...siteStats, { label: '', value: '' }])}
          addLabel="Tambah Statistik"
        >
          <div className="space-y-4">
            {siteStats.map((stat, idx) => (
              <ListCard
                key={idx}
                onRemove={() => setSiteStats(siteStats.filter((_, i) => i !== idx))}
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">
                      Nilai
                    </label>
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) =>
                        updateListItem(siteStats, setSiteStats, idx, 'value', e.target.value)
                      }
                      className="dashboard-input"
                      placeholder="cth. 500+"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) =>
                        updateListItem(siteStats, setSiteStats, idx, 'label', e.target.value)
                      }
                      className="dashboard-input"
                      placeholder="cth. Acara Selesai"
                    />
                  </div>
                </div>
              </ListCard>
            ))}
          </div>
        </DashboardSection>

        {/* ── 8. Proses ── */}
        <DashboardSection
          title="Proses Kerja"
          description="Langkah-langkah proses yang tampil di halaman Services."
          onAdd={() =>
            setServicesProcess([
              ...servicesProcess,
              {
                step: (servicesProcess.length + 1).toString().padStart(2, '0'),
                title: '',
                desc: '',
              },
            ])
          }
          addLabel="Tambah Langkah"
        >
          <div className="space-y-4">
            {servicesProcess.map((proc, idx) => (
              <ListCard
                key={idx}
                onRemove={() =>
                  setServicesProcess(servicesProcess.filter((_, i) => i !== idx))
                }
              >
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={proc.step}
                    onChange={(e) =>
                      updateListItem(servicesProcess, setServicesProcess, idx, 'step', e.target.value)
                    }
                    className="w-12 text-2xl font-bold border-none bg-transparent focus:ring-0 p-0 text-gray-300"
                    placeholder="01"
                  />
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={proc.title}
                      onChange={(e) =>
                        updateListItem(servicesProcess, setServicesProcess, idx, 'title', e.target.value)
                      }
                      className="w-full font-medium border-none bg-transparent focus:ring-0 p-0"
                      placeholder="cth. Konsultasi"
                    />
                    <textarea
                      value={proc.desc}
                      onChange={(e) =>
                        updateListItem(servicesProcess, setServicesProcess, idx, 'desc', e.target.value)
                      }
                      className="w-full text-sm text-gray-500 border-none bg-transparent focus:ring-0 p-0 resize-none"
                      placeholder="cth. Diskusikan kebutuhan acara Anda bersama tim kami."
                      rows={2}
                    />
                  </div>
                </div>
              </ListCard>
            ))}
          </div>
        </DashboardSection>

        {/* ── 9. FAQ ── */}
        <DashboardSection
          title="FAQ"
          description="Pertanyaan yang sering diajukan."
          onAdd={() => setContactFaq([...contactFaq, { q: '', a: '' }])}
          addLabel="Tambah FAQ"
        >
          <div className="space-y-4">
            {contactFaq.map((faq, idx) => (
              <ListCard
                key={idx}
                onRemove={() => setContactFaq(contactFaq.filter((_, i) => i !== idx))}
              >
                <div className="space-y-3">
                  <input
                    type="text"
                    value={faq.q}
                    onChange={(e) =>
                      updateListItem(contactFaq, setContactFaq, idx, 'q', e.target.value)
                    }
                    className="dashboard-input"
                    placeholder="Pertanyaan..."
                  />
                  <textarea
                    value={faq.a}
                    onChange={(e) =>
                      updateListItem(contactFaq, setContactFaq, idx, 'a', e.target.value)
                    }
                    className="dashboard-textarea"
                    placeholder="Jawaban..."
                    rows={3}
                  />
                </div>
              </ListCard>
            ))}
          </div>
        </DashboardSection>

        {/* ── 10. Team ── */}
        <DashboardSection
          title="Tim Kami"
          description="Anggota tim yang tampil di homepage."
          onAdd={() =>
            setSiteTeam([
              ...siteTeam,
              { name: '', role: '', image: '' },
            ])
          }
          addLabel="Tambah Anggota Tim"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {siteTeam.map((member, idx) => (
              <ListCard
                key={idx}
                onRemove={() =>
                  setSiteTeam(siteTeam.filter((_, i) => i !== idx))
                }
              >
                <div className="space-y-4">
                  <ImageUpload
                    label="Foto Tim"
                    value={member.image}
                    onChange={(url) =>
                      updateListItem(siteTeam, setSiteTeam, idx, 'image', url)
                    }
                  />
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) =>
                      updateListItem(siteTeam, setSiteTeam, idx, 'name', e.target.value)
                    }
                    className="dashboard-input"
                    placeholder="Nama Lengkap"
                  />
                  <input
                    type="text"
                    value={member.role}
                    onChange={(e) =>
                      updateListItem(siteTeam, setSiteTeam, idx, 'role', e.target.value)
                    }
                    className="dashboard-input"
                    placeholder="Jabatan / Role"
                  />
                </div>
              </ListCard>
            ))}
          </div>
        </DashboardSection>

        <div className="pt-12 flex justify-end">
          <Button type="submit" isLoading={isSaving} className="rounded-full">
            Simpan Semua Perubahan
          </Button>
        </div>
      </form>

      {/* Sticky Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg px-6 py-4">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Perubahan belum disimpan — klik tombol untuk menyimpan.
          </p>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave()}
            className="flex items-center gap-2 bg-[#1F2021] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
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
    </div>
  );
};

export default SettingsTab;
