'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '@/app/components/ui/Button';
import Select from '@/app/components/ui/Select';
import Modal from '@/app/components/ui/Modal';
import { CheckCircle, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import { useLearningPaths } from '@/app/hooks/useLearningPath';
import { useJobs } from '@/app/hooks/useJobs';
import { getAllUsers } from '@/services/auth';
import { useAuth } from '@/app/CONTEXT/AuthProvider';

export default function JobsHeader({ setFilterLearningPath }) {
  const { learningPaths, fetchLearningPaths, assignLearningPathToAdmins,fetchLearningPathsToAdmins,adminLearningPaths } = useLearningPaths();
  const { fetchJobs } = useJobs();
  const { token,user } = useAuth();

  const [admins, setAdmins] = useState([]);
  const [selectedLearningPath, setSelectedLearningPath] = useState('');
  const [adminAssignments, setAdminAssignments] = useState({}); // { lpId: [adminIds] }

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    learningPathId: '',
    assignedAdminIds: []
  });

  // ✅ لو فيه Learning Paths حط أول واحد افتراضي
  useEffect(() => {
    if (learningPaths.length > 0) {
      setSelectedLearningPath('');
      setFormData(prev => ({
        ...prev,
        learningPathId: learningPaths[0].id
      }));
    }
  }, [learningPaths]);

  const fetchAdmins = async () => {
    try {
      const res = await getAllUsers({ token, role: 'ADMIN' });
      if (!res.success) return console.error(res.message);
      setAdmins(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetch=async()=>{
      // await fetchLearningPaths();
      await fetchJobs();
      await fetchAdmins();
      await fetchLearningPathsToAdmins('JOB');
      await fetchLearningPaths();
    }
    fetch();
  }, [ fetchLearningPathsToAdmins,fetchJobs, token]);

  const handleLearningPathChange = (e) => {
    const lpId = e.target.value;
    setSelectedLearningPath(lpId);
    setFilterLearningPath(lpId);
  };

  const handleAdminToggle = (adminId) => {
    
    setFormData(prev => ({
      ...prev,
      assignedAdminIds: prev.assignedAdminIds.includes(adminId)
        ? prev.assignedAdminIds.filter(id => id !== adminId)
        : [...prev.assignedAdminIds, adminId]
    }));
  };

  // ✅ فتح المودال مع تحميل البيانات القديمة لو موجودة
  const openModal = () => {
  const lp = learningPaths.find(lp => lp.id == selectedLearningPath);

  const existingAdmins =
    lp?.permissions
      ?.filter(p => p.section === "JOB")
      ?.map(p => p.userId) || [];

  console.log(existingAdmins, "existingAdmins", lp?.permissions
      ?.filter(p => p.section === "JOB"));

    setFormData({
      learningPathId: selectedLearningPath,
      assignedAdminIds: existingAdmins,
    });

    setModalOpen(true);
  };

  const handleSaveAssignments = async () => {
    if (!formData.learningPathId)
      return toast.error('Please select a Learning Path');

    try {
      await assignLearningPathToAdmins({
        learningPathId: Number(formData.learningPathId),
        data: {
          adminIds: formData.assignedAdminIds,
          section: 'job'
        },
      });

      // ✅ تحديث الـ state عشان يتحول الزرار لـ Edit
      setAdminAssignments((prev) => ({
        ...prev,
        [formData.learningPathId]: formData.assignedAdminIds,
      }));

      toast.success('Admins assigned successfully');
      setModalOpen(false);
    } catch (err) {
      toast.error('Failed to assign admins');
    }
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

const isEditMode =
  selectedLearningPath &&
  learningPaths
    .find(lp => lp.id == selectedLearningPath)
    ?.permissions
    ?.filter(p => p.section === "PROJECT")
    ?.length > 0;
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

      {/* Learning Path Filter */}
      <div className="flex gap-4 items-center">
        <Select
          label="Filter by Learning Path"
          value={selectedLearningPath}
          onChange={handleLearningPathChange}
          options={[
            { value: '', label: 'All Learning Paths' },
            ...learningPaths.map((lp) => ({
              value: lp.id,
              label: lp.title
            })),
          ]}
        />

        {selectedLearningPath && (
          <Button onClick={openModal} size="sm">
            {isEditMode ? 'Edit Admins' : 'Assign Admins'}
          </Button>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditMode ? 'Edit Admins' : 'Assign Admins to Learning Path'}
      >
        <div className="flex flex-col gap-4">
          <Select
            label="Learning Path"
            value={formData.learningPathId}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                learningPathId: e.target.value
              }))
            }
            options={learningPaths.map((lp) => ({
              value: lp.id,
              label: lp.title
            }))}
          />

          {admins.length > 0 ? (
            <motion.div
              custom={5}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
            >
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Users className="w-4 h-4 text-gray-500" />
                Assign to Admins
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-xl bg-gray-50">
                {admins.map((admin) => {
                  const isSelected =
                    formData.assignedAdminIds.includes(admin.id);

                  return (
                    <motion.div
                      key={admin.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAdminToggle(admin.id)}
                      className={`flex items-center justify-between p-2 rounded-lg border-2 cursor-pointer transition-all
                        ${isSelected
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 bg-white hover:border-indigo-300'
                        }`}
                    >
                      <span className="text-sm font-medium text-gray-800">
                        {admin.name}
                      </span>

                      {isSelected && (
                        <CheckCircle className="w-4 h-4 text-indigo-600" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-2 text-gray-500">
              No admins available
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAssignments}>
              {isEditMode ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}