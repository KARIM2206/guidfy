
'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Edit,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  ChevronRight,
  Image as ImageIcon,
} from 'lucide-react';

import Table from '@/app/components/ui/Table';
import Button from '@/app/components/ui/Button';
import LearningPathForm from '@/app/components/super-admin/dashboard/LearningPathForm';
import DeleteModel from '@/app/components/admin/dashboard/roadmap/DeleteModel';
import LearningPathFilter from '@/app/components/super-admin/dashboard/LearningPathFilter';

import {
  useLearningPathsSA,
  useCreateLearningPath,
  useUpdateLearningPath,
  useDeleteLearningPath,
  useTogglePublish,
} from '@/app/hooks/useLearningPath';
import { useRoadmaps } from '@/app/hooks/useRoadmaps';

export default function LearningPathsPage() {
  // ─── Filter State ───
  const [filters, setFilters] = useState({
    level: '',
    category: '',
    search: '',
  });

  // ─── UI State ───
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [editingPath, setEditingPath] = useState(null);

  // ─── Queries ───
  const {
    data: lpData,
    isLoading: lpLoading,
    isFetching: lpFetching,
  } = useLearningPathsSA(filters);

  const {
    data: roadmapsData,
    isLoading: roadmapsLoading,
  } = useRoadmaps();

  // ─── Mutations ───
  const createMutation = useCreateLearningPath();
  const updateMutation = useUpdateLearningPath();
  const deleteMutation = useDeleteLearningPath();
  const publishMutation = useTogglePublish();

  // ─── Derived Data ───
  const learningPaths = lpData?.data ?? [];
  const roadmaps = roadmapsData?.data ?? roadmapsData ?? [];

  // Client-side filtering
  const filteredPaths = learningPaths.filter((path) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return path.title?.toLowerCase().includes(searchLower);
    }
    return true;
  });

  const loading =
    lpLoading ||
    lpFetching ||
    roadmapsLoading ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    publishMutation.isPending;

  // ─── Handlers ───
  const handleOpenModal = useCallback((path = null) => {
    setEditingPath(path);
    setModalOpen(true);
  }, []);

  const handleSubmit = useCallback(
    async (formData) => {
      if (editingPath) {
        await updateMutation.mutateAsync({ id: editingPath.id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      setModalOpen(false);
      setEditingPath(null);
    },
    [editingPath, createMutation, updateMutation]
  );

  const handleDelete = useCallback(async () => {
    if (deleteModal.id) {
      await deleteMutation.mutateAsync(deleteModal.id);
      setDeleteModal({ open: false, id: null });
    }
  }, [deleteModal.id, deleteMutation]);

  const handlePublishToggle = useCallback(
    (id) => publishMutation.mutate(id),
    [publishMutation]
  );

  // ─── Columns ───
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
    {
      key: 'projects',
      label: 'Projects',
      render: (row) => row.projects?.length || 0,
    },
    { key: 'estimatedDuration', label: 'Duration' },
    {
      key: 'isPublished',
      label: 'Status',
      render: (row) => (
        <span
          className={`px-2 py-1 text-xs rounded ${row.isPublished
            ? 'bg-green-100 text-green-600'
            : 'bg-gray-200 text-gray-600'
            }`}
        >
          {row.isPublished ? 'Published' : 'Draft'}
        </span>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Learning Paths</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={18} className="mr-2" /> Add Path
        </Button>
      </div>

      {/* Filters */}
      <LearningPathFilter filters={filters} setFilters={setFilters} />

      {/* Table */}
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
              onClick={() => handlePublishToggle(row.id)}
              className="text-gray-600 hover:text-black disabled:opacity-50"
              disabled={publishMutation.isPending}
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

      {/* Delete Modal */}
      <DeleteModel
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        confirmDelete={handleDelete}
      />

      {/* Form Modal */}
      <LearningPathForm
        initialData={editingPath}
        roadmaps={roadmaps}
        onSubmit={handleSubmit}
        isOpen={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingPath(null);
        }}
      />
    </motion.div>
  );
}