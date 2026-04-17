'use client';

import { Plus } from 'lucide-react';
import Button from '@/app/components/ui/Button';
import Select from '@/app/components/ui/Select';

export default function ProjectsHeader({ openAddModal, filter, setFilter ,isDisabledAdd}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <h1 className="text-3xl font-bold text-gray-900">Manage Projects</h1>
      <div className="flex items-center gap-3">
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'DRAFT', label: 'Draft' },
            { value: 'PUBLISHED', label: 'Published' },
            { value: 'CLOSED', label: 'Closed' },
          ]}
        />
        <Button disabled={isDisabledAdd} onClick={openAddModal} variant={`${isDisabledAdd ? 'disabled' : 'primary'}`}>
          <Plus className="w-4 h-4 mr-2" /> Add Project
        </Button>
      </div>
    </div>
  );
}