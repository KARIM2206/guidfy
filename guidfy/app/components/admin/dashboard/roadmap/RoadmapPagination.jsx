// components/roadmaps/RoadmapPagination.jsx
'use client';

import Button from '../../../ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';


const RoadmapPagination = ({ pagination, onPageChange }) => {
  const { page, totalPages } = pagination;

  const handlePrev = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) onPageChange(page + 1);
  };

  // Generate page numbers to display (e.g., 1 2 3 ... 10)
  const getPageNumbers = () => {
    const delta = 2; // pages before and after current
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-100"
    >
      <div className="text-sm text-gray-600">
        Page <span className="font-medium">{page}</span> of{' '}
        <span className="font-medium">{totalPages}</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={page === 1}
          className="!px-3 !py-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft size={18} className="mr-1" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {/* Page Numbers - visible on medium+ screens */}
        <div className="hidden md:flex items-center gap-1 mx-2">
          {getPageNumbers().map((item, index) => (
            <motion.button
              key={index}
              onClick={() => typeof item === 'number' && onPageChange(item)}
              disabled={typeof item !== 'number'}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                item === page
                  ? 'bg-blue-600 text-white'
                  : typeof item === 'number'
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-gray-400 cursor-default'
              }`}
              whileHover={typeof item === 'number' ? { scale: 1.1 } : {}}
              whileTap={typeof item === 'number' ? { scale: 0.9 } : {}}
            >
              {item}
            </motion.button>
          ))}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          onClick={handleNext}
          disabled={page === totalPages}
          className="!px-3 !py-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={18} className="ml-1" />
        </Button>
      </div>
    </motion.div>
  );
};

export default RoadmapPagination;