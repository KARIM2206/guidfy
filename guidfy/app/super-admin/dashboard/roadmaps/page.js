'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Table from '@/app/components/ui/Table';
import Button from '@/app/components/ui/Button';
import { Edit, Trash2, Plus, Eye, EyeOff } from 'lucide-react';

import { useRoadmaps } from '@/app/hooks/useRoadmaps';
import { useLearningPaths } from '@/app/hooks/useLearningPath';
import RoadmapForm from '@/app/components/super-admin/dashboard/RoadmapsForm';
import DeleteModel from '@/app/components/admin/dashboard/roadmap/DeleteModel';

export default function RoadmapsPage() {
  const { roadmaps, fetchRoadmaps, createRoadmap , editRoadmap, removeRoadmap,toggleRoadmap,loading} = useRoadmaps();
  const { learningPaths, fetchLearningPaths } = useLearningPaths();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  // Load data
  useEffect(() => {
    fetchRoadmaps();
    fetchLearningPaths();
  }, []);

  // Table columns
 const columns = [
  { key: 'title', label: 'Title' },
  { key: 'slug', label: 'Slug' },
  { key: 'category', label: 'Category' },
  { key: 'level', label: 'Level' },
  { key: 'estimatedDuration', label: 'Duration' },
  { key: 'isPublished', label: 'Status',

    render: (row) =>(
       <span
         className={`px-2 py-1 text-xs rounded ${
           row.isPublished
             ? 'bg-green-100 text-green-600'
             : 'bg-gray-200 text-gray-600'
         }`}
       >
       {row.isPublished ? 'Published' : 'Draft'}
       </span>
     ),
   },
  {
    key: 'createdBy',
    label: 'Created By',
    render: (row) => row.createdBy?.name || '—', // هنا نعرض الاسم فقط
  },
  {
    key: 'stepsCount',
    label: 'Steps',
    render: (row) => row.steps?.length || 0,
  }
];

  // Open modal
  const handleOpenModal = (roadmap = null) => {
    setEditingRoadmap(roadmap);
    setModalOpen(true);
  };

  // Submit form
  const handleSubmit = async (formData) => {
    if (editingRoadmap) {
      await editRoadmap(editingRoadmap.id, formData);
    } else {
      await createRoadmap(formData);
    }
    fetchRoadmaps();
    setModalOpen(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Roadmaps</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={18} className="mr-2" /> Add Roadmap
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={roadmaps}
        renderActions={(row) => (
          <div className="flex space-x-3 items-center">
            {/* Toggle Published (if you want) */}
            <button onClick={() => toggleRoadmap(row.id)} className="text-gray-600 hover:text-black">
              {row.isPublished ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>

            {/* Edit */}
            <button onClick={() => handleOpenModal(row)} className="text-blue-600 hover:text-blue-800">
              <Edit size={18} />
            </button>

            {/* Delete */}
            <button onClick={() => setDeleteModal({ open: true, id: row.id })} className="text-red-600 hover:text-red-800">
              <Trash2 size={18} />
            </button>
          </div>
        )}
      />

      {/* Delete Modal */}
      <DeleteModel
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal(prev => ({ ...prev, open: false }))}
        confirmDelete={async () => {
          await removeRoadmap(deleteModal.id);
          fetchRoadmaps();
          setDeleteModal(prev => ({ ...prev, open: false }));
        }}
      />

      {/* Add/Edit Modal */}
      <RoadmapForm
        initialData={editingRoadmap}
        roadmaps={roadmaps}
        learningPaths={learningPaths}
        isOpen={modalOpen}
        loading={loading}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </motion.div>
  );
}