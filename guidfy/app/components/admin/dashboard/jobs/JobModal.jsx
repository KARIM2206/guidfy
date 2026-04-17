'use client';

import Modal from '@/app/components/ui/Modal';
import Input from '@/app/components/ui/Input';
import Textarea from '@/app/components/ui/Textarea';
import Select from '@/app/components/ui/Select';
import Button from '@/app/components/ui/Button';
import { useState, useEffect } from 'react';
import { useLearningPaths } from '@/app/hooks/useLearningPath';

export default function JobModal({ isOpen, setIsOpen, mode, job, onCreate, onEdit }) {
  const { adminLearningPaths, fetchLearningPathsToAdmins } = useLearningPaths();

  const [form, setForm] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    salary: '',
    jobType: 'REMOTE',
    learningPathId: '',
    deadline: '',
  });

  // ✅ fetch learning paths
  useEffect(() => {
    const fetchLearningPaths = async () => {
      try {
        await fetchLearningPathsToAdmins('JOB');
      } catch (error) {
        console.error('Error fetching learning paths:', error);
      }
    };
    fetchLearningPaths();
  }, []);

  // ✅ set default learningPathId لما الداتا تيجي
  useEffect(() => {
    if (adminLearningPaths.length > 0 && !form.learningPathId) {
      setForm(prev => ({
        ...prev,
        learningPathId: adminLearningPaths[0].id,
      }));
    }
  }, [adminLearningPaths]);

  // ✅ handle edit / reset بدون تدمير learningPathId
  useEffect(() => {
    if (job) {
      setForm({
        ...job,
        learningPathId: Number(job.learningPathId),
        deadline: job.deadline?.split('T')[0],
      });
    } else {
      setForm(prev => ({
        ...prev,
        title: '',
        description: '',
        company: '',
        location: '',
        salary: '',
        jobType: 'REMOTE',
        deadline: '',
        // ❌ مش بنرجع learningPathId فاضي
      }));
    }
  }, [job]);

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('form before submit:', form);

    // ✅ validation مهم جدًا
    if (!form.learningPathId || isNaN(Number(form.learningPathId))) {
      return alert('Invalid Learning Path');
    }

    if (mode === 'add') await onCreate(form);
    if (mode === 'edit') await onEdit(job.id, form);

    setIsOpen(false);

    // ✅ reset نظيف
    setForm({
      title: '',
      description: '',
      company: '',
      location: '',
      salary: '',
      jobType: 'REMOTE',
      learningPathId: adminLearningPaths[0]?.id || '',
      deadline: '',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title={mode === 'add' ? 'Add Job' : mode === 'edit' ? 'Edit Job' : 'View Job'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <Input
          name="title"
          label="Title"
          value={form.title}
          onChange={handleChange}
          disabled={mode === 'view'}
          required
        />

        <Textarea
          name="description"
          label="Description"
          value={form.description}
          onChange={handleChange}
          disabled={mode === 'view'}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            name="company"
            label="Company"
            value={form.company}
            onChange={handleChange}
            disabled={mode === 'view'}
            required
          />
          <Input
            name="location"
            label="Location"
            value={form.location}
            onChange={handleChange}
            disabled={mode === 'view'}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            name="salary"
            label="Salary"
            value={form.salary}
            onChange={handleChange}
            disabled={mode === 'view'}
            required
          />

          <Select
            name="jobType"
            label="Job Type"
            options={[
              { value: 'REMOTE', label: 'Remote' },
              { value: 'ONSITE', label: 'Onsite' },
              { value: 'HYBRID', label: 'Hybrid' },
            ]}
            value={form.jobType}
            onChange={(e) =>
              setForm({ ...form, jobType: e.target.value })
            }
            disabled={mode === 'view'}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            name="learningPathId"
            label="Learning Path"
            options={adminLearningPaths.map((lp) => ({
              value: lp.id,
              label: lp.title,
            }))}
            value={form.learningPathId}
            onChange={(e) =>
              setForm({
                ...form,
                learningPathId: Number(e.target.value), // ✅ دايمًا رقم
              })
            }
            disabled={mode === 'view'}
          />

          <Input
            type="date"
            name="deadline"
            label="Deadline"
            value={form.deadline}
            onChange={handleChange}
            disabled={mode === 'view'}
            required
          />
        </div>

        {mode !== 'view' && (
          <div className="flex justify-end gap-3">
            <Button type="submit" variant="primary">
              {mode === 'add' ? 'Create Job' : 'Save Changes'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
}