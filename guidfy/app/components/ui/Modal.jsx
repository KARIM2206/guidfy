// components/ui/Modal.jsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className = "bg-white rounded-lg p-6 max-w-md max-h-[80vh]",
  showHeader = true,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* الخلفية */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black"
            onClick={onClose}
          />
          {/* المحتوى */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`shadow-xl overflow-y-auto scrollbar-animated z-10 w-full mx-2 relative ${className}`}
          >
            {showHeader && (
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{title}</h2>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                  <X size={20} />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;