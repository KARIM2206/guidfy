'use client';

import Modal from '@/app/components/ui/Modal';
import Input from '@/app/components/ui/Input';
import Textarea from '@/app/components/ui/Textarea';
import Select from '@/app/components/ui/Select';

export default function JobModal({ isOpen, setIsOpen, job ,learningPaths}) {
  if (!job) return null;
console.log(job,'\n job in job modal' , learningPaths,'\n learning paths in job modal');

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Job Details"
    >
      <div className="space-y-4">
        <Input label="Title" value={job.title} disabled />
        <Textarea label="Description" value={job.description} disabled />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Company" value={job.company} disabled />
          <Input label="Location" value={job.location} disabled />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Salary" value={job.salary} disabled />
          <Select
            label="Job Type"
            options={[
              { value: 'REMOTE', label: 'Remote' },
              { value: 'ONSITE', label: 'Onsite' },
              { value: 'HYBRID', label: 'Hybrid' },
            ]}
            value={job.jobType}
            disabled
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Learning Path"
            options={learningPaths.map((lp) => ({ value: lp.id, label: lp.title }))}
            value={job.learningPathId}
            disabled
          />
          <Input type="date" label="Deadline" value={job.deadline?.split('T')[0]} disabled />
        </div>
      </div>
    </Modal>
  );
}