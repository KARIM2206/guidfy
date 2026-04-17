'use client'
import React from 'react'
import Button  from '../../../ui/Button'
import  Modal  from '../../../ui/Modal'
import { useNotifications } from '@/app/CONTEXT/NotificationContext'


const DeleteModel = ({isOpen,onClose,confirmDelete}) => {
   const { cleanupSocket } = useNotifications();
  const handleDelete = () => {
    cleanupSocket()
    confirmDelete()
    onClose()
  }
  return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2 text-red-600">
            <span>Confirm Deletion</span>
          </div>
        }
      >
        <div className="py-2">
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this step? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
  )
}

export default DeleteModel
