import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Save, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { Project } from '../../../types';
import ImageUpload from '../ImageUpload';
import MultiImageUpload from '../MultiImageUpload';

interface ProjectsTabProps {
  projects: Project[];
}

const emptyForm = {
  title: '',
  location: '',
  mainImg: '',
  tag: '',
  description: '',
  detailImages: [] as string[],
  order: 0,
};

const ProjectsTab: React.FC<ProjectsTabProps> = ({ projects }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState(emptyForm);

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
        order: project.order,
      });
    } else {
      setEditingProject(null);
      setFormData({ ...emptyForm, order: projects.length });
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
        const { error } = await supabase.from('projects').update(data).eq('id', editingProject.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('projects').insert([data]);
        if (error) throw error;
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Gagal menyimpan proyek. Pastikan kebijakan RLS mengizinkan Anda untuk menulis ke database.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus proyek ini?')) return;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <>
      {/* Add Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#1F2021] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-all"
        >
          <Plus size={18} /> Tambah Proyek
        </button>
      </div>

      {/* Grid */}
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

      {/* Modal */}
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
                      placeholder="e.g. Wedding, Portrait"
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
                  <label className="text-xs uppercase tracking-widest text-gray-400">Deskripsi</label>
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
    </>
  );
};

export default ProjectsTab;
