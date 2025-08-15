import React from 'react';

type StatusFilterProps = {
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  onClearFilters: () => void;
};

const statuses = [
  'Requested',
  'Purchased',
  'Completed',
  'Returned',
  'Cancelled',
];

const StatusFilter: React.FC<StatusFilterProps> = ({
  selectedStatus,
  setSelectedStatus,
  onClearFilters,
}) => {
  return (
    <div className="flex items-center">
      <select
        className="border border-gray-300 text-byuNavy bg-white text-sm rounded-md px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-byuRoyal transition-all"
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
      >
        {/* Placeholder option */}
        <option value="" disabled hidden>
          Filter by Status
        </option>

        {/* Optional "All" option */}
        <option value="">All</option>

        {/* Actual status options */}
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

      {/* Clear Filters Button */}
      <button
        onClick={onClearFilters}
        className="ml-3 text-sm text-gray-600 hover:underline hover:text-gray-800"
      >
        Clear Filters
      </button>
    </div>
  );
};

export default StatusFilter;
