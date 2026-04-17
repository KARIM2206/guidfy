'use client';

import Modal from '@/app/components/ui/Modal';
import Button from '@/app/components/ui/Button';

export default function DeleteConfirmModal({ isOpen, setIsOpen, project, onDelete }) {
  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Confirm Delete">
      <p>Are you sure you want to delete "{project?.title}"? This action cannot be undone.</p>
      <div className="flex justify-end gap-3 mt-4">
        <Button variant="outline" onClick={()=>setIsOpen(false)}>Cancel</Button>
        <Button variant="danger" onClick={()=>{ onDelete(project.id); setIsOpen(false); }}>Delete</Button>
      </div>
    </Modal>
  );
}