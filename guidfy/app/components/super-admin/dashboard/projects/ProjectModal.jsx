'use client';

import Modal from '@/app/components/ui/Modal';
import Input from '@/app/components/ui/Input';
import Textarea from '@/app/components/ui/Textarea';
import Select from '@/app/components/ui/Select';

export default function ProjectModal({ isOpen, setIsOpen, project, learningPaths }) {
  if (!project) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Project Details"
    >
      <div className="space-y-4">

        <Input label="Title" value={project.title} disabled />

        <Textarea label="Description" value={project.description} disabled />

        <Input
          label="Technologies"
          value={Array.isArray(project.technologies)
            ? project.technologies.join(', ')
            : ''}
          disabled
        />

        <Input label="Github URL" value={project.githubUrl || '-'} disabled />

        <Input label="Image" value={project.image || '-'} disabled />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            options={[
              { value: 'DRAFT', label: 'Draft' },
              { value: 'PUBLISHED', label: 'Published' },
              { value: 'CLOSED', label: 'Closed' },
            ]}
            value={project.status}
            disabled
          />

          <Select
            label="Learning Path"
            options={learningPaths.map(lp => ({
              value: lp.id,
              label: lp.title
            }))}
            value={project.learningPathId}
            disabled
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Featured" value={project.isFeatured ? 'Yes' : 'No'} disabled />
          <Input label="Likes" value={project.likes} disabled />
        </div>

      </div>
    </Modal>
  );
}