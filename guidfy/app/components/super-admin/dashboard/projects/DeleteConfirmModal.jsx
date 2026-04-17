'use client';

import Modal from '@/app/components/ui/Modal';
import Button from '@/app/components/ui/Button';

export default function DeleteProjectConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  itemName = 'this project', 
  loading = false 
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Delete"
    >
      <p className="mb-4">
        Are you sure you want to delete <strong>{itemName}</strong>? 
        This action cannot be undone.
      </p>

      <div className="flex justify-end gap-3">
        <Button 
          variant="secondary" 
          onClick={onClose} 
          disabled={loading}
        >
          Cancel
        </Button>

        <Button 
          variant="danger" 
          onClick={onConfirm} 
          disabled={loading}
        >
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </Modal>
  );
}