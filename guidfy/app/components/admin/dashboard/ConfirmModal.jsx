'use client'
import React from 'react'
import Button  from '../../ui/Button'
import  Modal  from '../../ui/Modal'


const ConfirmModal = ({isOpen,onClose,confirmToggle}) => {
  return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2 text-red-600">
            <span>Confirm Toggle</span>
          </div>
        }
      >
        <div className="py-2">
          <p className="text-gray-600 mb-6">
            Are you sure you want to toggle this step?
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
              variant="primary"
              onClick={confirmToggle}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
             Confirm
            </Button>
          </div>
        </div>
      </Modal>
  )
}

export default ConfirmModal
