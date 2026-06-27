'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '@/app/components/ui/Button';
import Select from '@/app/components/ui/Select';
import Modal from '@/app/components/ui/Modal';
import { CheckCircle, Users, Filter, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useLearningPaths, useAssignAdmins } from '@/app/hooks/useLearningPath';
import { useJobs } from '@/app/hooks/useJobs';
import { getAllUsers } from '@/services/auth';
import { useAuth } from '@/app/CONTEXT/AuthProvider';

export default function JobsHeader({
  filter,
  setFilter,
  learningPathFilter,
  setLearningPathFilter,
  learningPaths
}) {
  const { fetchLearningPathsToAdmins, adminLearningPaths } = useLearningPaths();
  const { fetchJobs } = useJobs();
  const { token, user } = useAuth();

  const [admins, setAdmins] = useState([]);
  const [selectedLearningPath, setSelectedLearningPath] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    learningPathId: '',
    assignedAdminIds: []
  });

  const assignMutation = useAssignAdmins();

  const handleSaveAssignments = async () => {
    if (!formData.learningPathId) {
      toast.error('Please select a learning path first');
      return;
    }
    try {
      await assignMutation.mutateAsync({
        learningPathId: formData.learningPathId,
        data: { section: 'JOB', adminIds: formData.assignedAdminIds }
      });
      toast.success('Admins assigned successfully');
      setModalOpen(false);
    } catch (err) {
      toast.error('Failed to assign admins');
    }
  };

  // ✅ خيارات الحالة الصحيحة للسوبر أدمن
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'CLOSED', label: 'Closed' },
  ];

  // جلب البيانات مرة واحدة عند التحميل
  useEffect(() => {
    const fetchData = async () => {
      await fetchJobs();
      await fetchLearningPathsToAdmins('JOB');
      await fetchAdmins();
    };
    fetchData();
  }, [fetchJobs, fetchLearningPathsToAdmins]);

  const fetchAdmins = async () => {
    try {
      const res = await getAllUsers({ token, role: 'ADMIN' });
      if (res.success) setAdmins(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLearningPathChange = (e) => {
    const lpId = e.target.value;
    setSelectedLearningPath(lpId);
    setLearningPathFilter(lpId);
  };

  const handleAdminToggle = (adminId) => {
    // Only toggles selection for newly added admins, not existing ones
    // We handle logic inline to prevent toggling off existing admins with card click
  };

  const openModal = () => {
    const lp = learningPaths.find(lp => lp.id == selectedLearningPath);
    const existingAdmins = lp?.permissions
      ?.filter(p => p.section === "JOB")
      ?.map(p => p.userId) || [];

    setFormData({
      learningPathId: selectedLearningPath,
      assignedAdminIds: existingAdmins,
    });
    setModalOpen(true);
  };

  const isEditMode = selectedLearningPath &&
    learningPaths.find(lp => lp.id == selectedLearningPath)
      ?.permissions?.some(p => p.section === "JOB");

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
      {/* الجهة اليسرى: فلتر مسار التعلم + زر تعيين الأدمن */}
      <div className="flex flex-wrap items-center gap-4">
        <Select
          label="Learning Path"
          value={selectedLearningPath}
          onChange={handleLearningPathChange}
          options={[
            { value: '', label: 'All Learning Paths' },
            ...learningPaths.map((lp) => ({
              value: lp.id,
              label: lp.title
            })),
          ]}
          className="min-w-[240px]"
        />

        {selectedLearningPath && (
          <Button onClick={openModal} size="sm" className="mt-6 lg:mt-0">
            {isEditMode ? 'Edit Admins' : 'Assign Admins'}
          </Button>
        )}
      </div>

      {/* الجهة اليمنى: فلتر الحالة باستخدام الخيارات الصحيحة */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
        
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)} // ← مباشر بدون دوال زائدة
            options={statusOptions} // ✅ استخدمنا المصفوفة الصحيحة
            leftIcon={<Filter size={18} className="text-gray-500" />}
         />
        </div>
      </div>

      {/* مودال تعيين الأدمن */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditMode ? 'Edit Admins Assignment' : 'Assign Admins to Learning Path'}
      >
        <div className="flex flex-col gap-4">
          <Select
            label="Learning Path"
            value={formData.learningPathId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, learningPathId: e.target.value }))
            }
            options={learningPaths.map((lp) => ({
              value: lp.id,
              label: lp.title
            }))}
          />

          {admins.length > 0 ? (
            <motion.div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Users className="w-4 h-4 text-gray-500" />
                Select Admins
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto p-2 border border-gray-200 rounded-xl bg-gray-50">
                {admins.map((admin) => {
                  const isSelected = formData.assignedAdminIds.includes(admin.id);
                  return (
                    <motion.div
                      key={admin.id}
                      whileHover={{ scale: isSelected ? 1 : 1.02 }}
                      whileTap={{ scale: isSelected ? 1 : 0.98 }}
                      onClick={() => {
                        if (!isSelected) {
                          setFormData((prev) => ({
                            ...prev,
                            assignedAdminIds: [...prev.assignedAdminIds, admin.id]
                          }));
                        }
                      }}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                        isSelected 
                          ? 'border-indigo-200 bg-indigo-50/50 cursor-default' 
                          : 'border-gray-200 bg-white hover:border-indigo-300 cursor-pointer'
                      }`}
                    >
                      <span className="text-sm font-medium">{admin.name}</span>
                      {isSelected && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                            Assigned
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData((prev) => ({
                                ...prev,
                                assignedAdminIds: prev.assignedAdminIds.filter((id) => id !== admin.id)
                              }));
                            }}
                            className="p-1.5 hover:bg-red-100 text-red-500 rounded-md transition-colors"
                            title="Unassign"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <p className="text-gray-500 text-center py-4">No admins found</p>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAssignments} disabled={assignMutation.isPending}>
              {assignMutation.isPending ? 'Saving...' : (isEditMode ? 'Update Assignment' : 'Save Assignment')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}