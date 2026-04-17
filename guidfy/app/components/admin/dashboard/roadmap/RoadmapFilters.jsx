// import { Search, Filter, Award } from "lucide-react";

// export default function RoadmapFilters({
//   searchQuery,
//   setSearchQuery,
//   selectedCategory,
//   setSelectedCategory,
//   selectedDifficulty,
//   setSelectedDifficulty,
//   categories,
//   difficulties
// }) {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//       {/* Search */}
//       <div className="md:col-span-2 relative">
//         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//         <input
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           placeholder="Search roadmaps..."
//           className="w-full pl-10 py-3 border rounded-xl"
//         />
//       </div>

//       {/* Category */}
//       <div className="relative">
//         <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//         <select
//           value={selectedCategory}
//           onChange={(e) => setSelectedCategory(e.target.value)}
//           className="w-full pl-10 py-3 border rounded-xl"
//         >
//           {categories.map(c => (
//             <option key={c} value={c}>
//               {c === "all" ? "All Categories" : c}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Difficulty */}
//       <div className="relative">
//         <Award className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
//         <select
//           value={selectedDifficulty}
//           onChange={(e) => setSelectedDifficulty(e.target.value)}
//           className="w-full pr-10 py-3 border rounded-xl"
//         >
//           {difficulties.map(d => (
//             <option key={d} value={d}>
//               {d === "all" ? "All Levels" : d}
//             </option>
//           ))}
//         </select>
//       </div>
//     </div>
//   );
// }

// components/roadmaps/RoadmapFilters.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import Button from '../../../ui/Button';
import { X } from 'lucide-react';
import { LEVEL_OPTIONS, CATEGORY_OPTIONS } from '../../../../utils/constants';

const RoadmapFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    search: '',
    level: '',
    category: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const handleReset = () => {
    const resetFilters = { search: '', level: '', category: '' };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

 const formVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  return (
    <motion.form
      variants={formVariants}
      initial="hidden"
      animate="visible"
      onSubmit={handleSubmit}
      className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-100 mb-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
        {/* Search Input */}
        <motion.div variants={itemVariants} className="space-y-1">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <Search size={16} className="text-gray-400" />
            Search
          </label>
          <Input
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search roadmaps..."
            className="w-full"
          />
        </motion.div>

        {/* Level Select */}
        <motion.div variants={itemVariants} className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Level</label>
          <Select
            name="level"
            value={filters.level}
            onChange={handleChange}
            options={[{ value: '', label: 'All levels' }, ...LEVEL_OPTIONS]}
          />
        </motion.div>

        {/* Category Select */}
        <motion.div variants={itemVariants} className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Category</label>
          <Select
            name="category"
            value={filters.category}
            onChange={handleChange}
            options={[{ value: '', label: 'All categories' }, ...CATEGORY_OPTIONS]}
          />
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex gap-2 pt-1">
          <Button
            type="submit"
            variant="primary"
            className="flex-1 gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Filter size={18} />
            Filter
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="flex-1 gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <X size={18} />
            Reset
          </Button>
        </motion.div>
      </div>
    </motion.form>
  );
};

export default RoadmapFilters;