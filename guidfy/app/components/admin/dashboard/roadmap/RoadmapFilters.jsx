import { Search, Filter, Award } from "lucide-react";

export default function RoadmapFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty,
  categories,
  difficulties
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Search */}
      <div className="md:col-span-2 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search roadmaps..."
          className="w-full pl-10 py-3 border rounded-xl"
        />
      </div>

      {/* Category */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full pl-10 py-3 border rounded-xl"
        >
          {categories.map(c => (
            <option key={c} value={c}>
              {c === "all" ? "All Categories" : c}
            </option>
          ))}
        </select>
      </div>

      {/* Difficulty */}
      <div className="relative">
        <Award className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="w-full pr-10 py-3 border rounded-xl"
        >
          {difficulties.map(d => (
            <option key={d} value={d}>
              {d === "all" ? "All Levels" : d}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
