'use client';

import { Clock, CheckCircle, XCircle } from 'lucide-react';

export default function StatusBadge({ status, onChange }) {
  const config = {
    DRAFT: { icon: Clock, color: 'bg-gray-100 text-gray-700', label: 'Draft' },
    PUBLISHED: { icon: CheckCircle, color: 'bg-green-100 text-green-700', label: 'Published' },
    CLOSED: { icon: XCircle, color: 'bg-red-100 text-red-700', label: 'Closed' },
  };

  const handleChange = (e) => {
    if (onChange) onChange(e.target.value);
  };

  return (
    <select
      value={status}
      onChange={handleChange}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border border-gray-300 bg-white"
    >
      {Object.keys(config).map((key) => {
        const { label } = config[key];
        return (
          <option key={key} value={key}>
            {label}
          </option>
        );
      })}
    </select>
  );
}