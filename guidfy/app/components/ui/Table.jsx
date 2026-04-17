import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, MoreVertical } from 'lucide-react';

const Table = ({
  columns,
  data=[],
  renderActions,
  striped = false,
  hoverable = true,
  compact = false,
  loading = false,
  emptyMessage = 'No data available',
  onSort,
  sortColumn,
  sortDirection,
}) => {
  // Animation variants
  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.03, duration: 0.2 }
    }),
    exit: { opacity: 0, x: -10, transition: { duration: 0.1 } }
  };

  const getCellPadding = () => {
    return compact ? 'px-3 py-2' : 'px-4 py-3';
  };

  const renderSortIcon = (col) => {
    if (!col.sortable) return null;
    if (sortColumn !== col.key) {
      return <ChevronDown className="w-4 h-4 ml-1 text-gray-400 opacity-0 group-hover:opacity-100" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 ml-1 text-indigo-600" />
      : <ChevronDown className="w-4 h-4 ml-1 text-indigo-600" />;
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto scrollbar-animated">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`${getCellPadding()} text-nowrap font-medium text-gray-700 ${
                    col.sortable ? 'cursor-pointer select-none group' : ''
                  }`}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  <div className="flex items-center">
                    {col.label}
                    {renderSortIcon(col)}
                  </div>
                </th>
              ))}
              {renderActions && (
                <th className={`${getCellPadding()} font-medium text-gray-700`}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="wait">
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (renderActions ? 1 : 0)} className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="ml-3 text-gray-500">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (renderActions ? 1 : 0)} className="text-center py-8 text-gray-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <motion.tr
                    key={row.id || idx}
                    custom={idx}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={`
                      border-b border-gray-100 last:border-0
                      ${hoverable ? 'hover:bg-indigo-50/50 transition-colors duration-150' : ''}
                      ${striped && idx % 2 === 1 ? 'bg-gray-50/50' : ''}
                    `}
                  >
                    {columns.map((col) => (
                     <td 
  key={col.key} 
  className={`
    ${getCellPadding()} 
    max-w-[200px]     // الحد الأقصى للعرض
    truncate          // يقطع النص الطويل
    overflow-hidden 
    whitespace-nowrap 
    hover:overflow-visible 
    hover:whitespace-normal
    hover:z-10
    relative
  `}
  title={row[col.key]} // يظهر نص كامل كـ tooltip عند hover
>
  {col.render ? col.render(row) : row[col.key]}
</td>
                    ))}
                    {renderActions && (
                      <td className={getCellPadding()}>
                        {renderActions(row)}
                      </td>
                    )}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;