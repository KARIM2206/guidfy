'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Table from '@/app/components/ui/Table';
import Modal from '@/app/components/ui/Modal';
import Button from '@/app/components/ui/Button';
import { Edit, Trash2, Plus, Eye, EyeOff, ChevronRight, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image'; // استيراد Image من next/image لتحسين الصور

import { useRoadmaps } from '@/app/hooks/useRoadmaps';
import { useLearningPaths } from '@/app/hooks/useLearningPath';
import LearningPathForm from '@/app/components/super-admin/dashboard/LearningPathForm';
import DeleteModel from '@/app/components/admin/dashboard/roadmap/DeleteModel';
import Link from 'next/link';
import LearningPathFilter from '@/app/components/super-admin/dashboard/LearningPathFilter';

export default function LearningPathsPage() {
  const {
    learningPaths,
    fetchLearningPaths,
    createLearningPath,
    editLearningPath,
    removeLearningPath,
    publishLearningPath,
    loading,
  } = useLearningPaths();

  const { roadmaps, fetchRoadmaps } = useRoadmaps();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [editingPath, setEditingPath] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    level: '',
    category: '',
    search: '',
  });

  useEffect(() => {
    fetchLearningPaths();
    fetchRoadmaps();
  }, []);

  // Apply filters to learningPaths
  const filteredPaths = learningPaths.filter((path) => {
    if (filters.level && path.level !== filters.level) return false;
    if (filters.category && path.category !== filters.category) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!path.title.toLowerCase().includes(searchLower)) return false;
    }
    return true;
  });

  // تعريف الأعمدة مع إضافة عمود الصورة
  const columns = [
    {
      key: 'image',
      label: 'Image',
      render: (row) => (
        <div className="flex items-center justify-center">
          {row.image ? (
            <div className="relative w-10 h-10 rounded-md overflow-hidden border border-gray-200">
          
             <Image
  src={`http://localhost:8000${row.image}`}
  alt={row.title}
  fill
  className="object-cover"
  sizes="40px"
  unoptimized
/>
            </div>
          ) : (
            <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
              <ImageIcon size={18} />
            </div>
          )}
        </div>
      ),
    },
    { key: 'title', label: 'Title' },
    { key: 'jobs', label: 'Jobs' },
    { key: 'projects', label: 'Projects', render: (row) => row.projects?.length || 0 },
    { key: 'estimatedDuration', label: 'Duration' },
    {
      key: 'isPublished',
      label: 'Status',
      render: (row) => (
        <span
          className={`px-2 py-1 text-xs rounded ${
            row.isPublished
              ? 'bg-green-100 text-green-600'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          {row?.isPublished ? 'Published' : 'Draft'}
        </span>
      ),
    },
  ];

  const handleOpenModal = (path = null) => {
    setEditingPath(path);
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    if (editingPath) {
      await editLearningPath(editingPath.id, formData);
    } else {
      await createLearningPath(formData);
    }
    fetchLearningPaths();
    setModalOpen(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Learning Paths</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={18} className="mr-2" /> Add Path
        </Button>
      </div>

      {/* Filter Component */}
      <LearningPathFilter filters={filters} setFilters={setFilters} />

      <Table
        columns={columns}
        data={filteredPaths}
        loading={loading}
        renderActions={(row) => (
          <div className="flex space-x-3 items-center">
            <Link
              href={`/super-admin/dashboard/learning-paths/${row.id}`}
              className="text-blue-600 hover:text-blue-800"
            >
              <ChevronRight size={18} />
            </Link>
            <button
              onClick={() => publishLearningPath(row.id)}
              className="text-gray-600 hover:text-black"
            >
              {row.isPublished ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>

            <button
              onClick={() => handleOpenModal(row)}
              className="text-blue-600 hover:text-blue-800"
            >
              <Edit size={18} />
            </button>

            <button
              onClick={() => setDeleteModal({ open: true, id: row.id })}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      />

      <DeleteModel
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal((prev) => ({ ...prev, open: false }))}
        confirmDelete={() => {
          removeLearningPath(deleteModal.id);
          setDeleteModal((prev) => ({ ...prev, open: false }));
        }}
      />

      <LearningPathForm
        initialData={editingPath}
        roadmaps={roadmaps}
        onSubmit={handleSubmit}
        isOpen={modalOpen}
        onCancel={() => setModalOpen(false)}
      />
    </motion.div>
  );
}