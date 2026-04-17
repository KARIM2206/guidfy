'use client';

import Modal from '@/app/components/ui/Modal';
import Input from '@/app/components/ui/Input';
import Textarea from '@/app/components/ui/Textarea';
import Select from '@/app/components/ui/Select';
import Button from '@/app/components/ui/Button';
import { useState, useEffect, useRef } from 'react';
import { useLearningPaths } from '@/app/hooks/useLearningPath';

export default function ProjectModal({ isOpen, setIsOpen, mode, project, onCreate, onEdit }) {

  const { adminLearningPaths, fetchLearningPathsToAdmins } = useLearningPaths();

  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    technologies: '',
    githubUrl: '',
    image: null,
    learningPathId: '',
    isFeatured: false,
    status: 'DRAFT',
  });

  const [imagePreview, setImagePreview] = useState('');
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    fetchLearningPathsToAdmins('PROJECT').catch(console.error);
  }, []);

  useEffect(() => {
    if (mode === 'add' && adminLearningPaths.length > 0 && !form.learningPathId) {
      setForm(prev => ({ ...prev, learningPathId: adminLearningPaths[0].id }));
    }
  }, [adminLearningPaths, mode]);

  useEffect(() => {

    if (project) {

      let imgUrl = project.image || '';

      if (imgUrl.startsWith('/')) {
        imgUrl = `http://localhost:8000${imgUrl}`;
      }

      setImagePreview(imgUrl);

      setForm({
        ...project,
        technologies: project.technologies?.join(', ') || '',
        image: null,
      });

    } else {

      setForm({
        title: '',
        description: '',
        technologies: '',
        githubUrl: '',
        image: null,
        learningPathId: '',
        isFeatured: false,
        status: 'DRAFT',
      });

      setImagePreview('');
      setImageError('');
    }

  }, [project]);

  const handleChange = (e) => {

    const { name, value, type, checked } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

  };

  const handleFile = (file) => {

    if (!file.type.startsWith('image/')) {
      setImageError('Please select an image file');
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setForm(prev => ({
      ...prev,
      image: file
    }));

    setImagePreview(previewUrl);
    setImageError('');
  };

  const onFileSelect = (e) => {

    const file = e.target.files?.[0];

    if (file) handleFile(file);

  };

  const onDrop = (e) => {

    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];

    if (file) handleFile(file);

  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    const payload = {
      ...form,
      technologies: form.technologies
        ? form.technologies.split(',').map(t => t.trim())
        : [],
    };

    if (mode === 'add') await onCreate(payload);

    if (mode === 'edit') await onEdit(project.id, payload);

    setIsOpen(false);

  };

  const isViewOnly = mode === 'view';

  return (

    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title={
        mode === 'add'
          ? 'Add Project'
          : mode === 'edit'
          ? 'Edit Project'
          : 'View Project'
      }
    >

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Title */}
        <Input
          name="title"
          label="Title"
          value={form.title}
          onChange={handleChange}
          disabled={isViewOnly}
          required
        />

        {/* Description */}
        <Textarea
          name="description"
          label="Description"
          value={form.description}
          onChange={handleChange}
          disabled={isViewOnly}
          rows={4}
        />

        {/* Image Upload */}
        <div className="space-y-3">

          <label className="block text-sm font-medium">
            Project Image
          </label>

          <div
            onClick={() => !isViewOnly && fileInputRef.current?.click()}
            onDrop={onDrop}
            onDragOver={onDragOver}
            className={`
              border-2 border-dashed rounded-xl p-4
              cursor-pointer transition
              ${imagePreview ? 'border-green-400' : 'border-gray-300'}
            `}
          >

            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileSelect}
              accept="image/*"
              className="hidden"
              disabled={isViewOnly}
            />

            {imagePreview ? (

              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />

            ) : (

              <p className="text-center text-gray-500 py-8">
                Drag & drop image here or click to upload
              </p>

            )}

          </div>

          {imageError && (
            <p className="text-red-500 text-sm">
              {imageError}
            </p>
          )}

        </div>

        {/* Technologies */}
        <Input
          name="technologies"
          label="Technologies (comma separated)"
          value={form.technologies}
          onChange={handleChange}
          disabled={isViewOnly}
        />

        {/* GitHub */}
        <Input
          name="githubUrl"
          label="GitHub URL"
          value={form.githubUrl}
          onChange={handleChange}
          disabled={isViewOnly}
        />

        {/* Learning Path */}
        <Select
          name="learningPathId"
          label="Learning Path"
          options={adminLearningPaths.map(lp => ({
            value: lp.id,
            label: lp.title
          }))}
          value={form.learningPathId}
          onChange={(e) =>
            setForm({
              ...form,
              learningPathId: Number(e.target.value)
            })
          }
          disabled={isViewOnly}
        />

        {/* Featured */}
        <div className="flex items-center gap-2">

          <input
            type="checkbox"
            name="isFeatured"
            checked={form.isFeatured}
            onChange={handleChange}
            disabled={isViewOnly}
          />

          <label>Featured</label>

        </div>

        {!isViewOnly && (

          <div className="flex justify-end gap-3">

            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>

            <Button type="submit">
              {mode === 'add' ? 'Create Project' : 'Save Changes'}
            </Button>

          </div>

        )}

      </form>

    </Modal>

  );
}