'use client';
import { Briefcase } from 'lucide-react';
import Button from '@/app/components/ui/Button';

export default function EmptyState({ openAddModal }) {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh]">
      <div className="bg-white shadow-xl rounded-3xl p-12 text-center max-w-md">
        <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <Briefcase className="w-12 h-12 text-gray-400"/>
        </div>
        <h3 className="text-xl font-semibold mb-2">No Jobs Yet</h3>
        <p className="text-gray-500 mb-6">Create your first job posting to get started.</p>
        <Button onClick={openAddModal} variant="primary">Create Your First Job</Button>
      </div>
    </div>
  );
}