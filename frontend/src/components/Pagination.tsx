import React from 'react';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  setPageSize,
}) => {
  const handleClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const [inputPage, setInputPage] = React.useState('');

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const delta = 1; // number of pages to show on either side of current

    for (let i = 1; i <= totalPages; i++) {
      // Always show first, last, current, and neighbors
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={`px-3 py-1 rounded-md text-sm border transition ${
              currentPage === i
                ? 'bg-byuNavy text-white border-byuNavy font-semibold'
                : 'bg-white border-byuNavy text-byuNavy hover:bg-byuNavy hover:text-white'
            }`}
          >
            {i}
          </button>
        );
      } else if (
        // Add ellipses only if the last entry isn't already ...
        pageNumbers[pageNumbers.length - 1] !== 'ellipsis'
      ) {
        pageNumbers.push(
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
            ...
          </span>
        );
        pageNumbers.push('ellipsis'); // placeholder to prevent double dots
      }
    }

    return pageNumbers.filter((el) => el !== 'ellipsis');
  };

  return (
    <div className="flex flex-col md:flex-row justify-center items-center mt-6 gap-4 flex-wrap">
      {/* Page navigation buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleClick(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md text-sm bg-white border border-byuNavy text-byuNavy hover:bg-byuNavy hover:text-white transition disabled:opacity-40"
        >
          Previous
        </button>

        {renderPageNumbers()}

        <button
          onClick={() => handleClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-md text-sm bg-white border border-byuNavy text-byuNavy hover:bg-byuNavy hover:text-white transition disabled:opacity-40"
        >
          Next
        </button>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="goToPage" className="text-sm text-byuNavy">
          Go to page:
        </label>
        <input
          id="goToPage"
          type="number"
          min={1}
          max={totalPages}
          value={inputPage}
          onChange={(e) => setInputPage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const page = Number(inputPage);
              if (page >= 1 && page <= totalPages) {
                onPageChange(page);
              }
            }
          }}
          className="w-20 border border-byuNavy text-byuNavy rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-byuNavy"
        />
      </div>

      {/* Page size selector */}
      <div className="flex items-center gap-2">
        <label htmlFor="pageSize" className="text-sm text-byuNavy font-normal">
          Orders per page:
        </label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            onPageChange(1);
          }}
          className="border border-byuNavy text-byuNavy bg-white rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-byuNavy transition"
        >
          {[10, 25, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Pagination;
