import React from 'react';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
  purchaseDate: string; // New prop
  setPurchaseDate: (value: string) => void; // New setter
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  onSearch,
  onClear,
  purchaseDate,
  setPurchaseDate,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="flex flex-col space-y-2 mb-4">
      {/* Top row: Search input + buttons */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border border-gray-300 rounded px-4 py-2 w-64"
        />
        <button
          onClick={onSearch}
          className="bg-byuRoyal text-white px-3 py-2 rounded hover:bg-[#003a9a]"
        >
          Search
        </button>
        {(searchTerm || purchaseDate) && (
          <button
            onClick={onClear}
            className="text-sm text-gray-600 underline hover:text-gray-800"
          >
            Clear
          </button>
        )}
      </div>

      {/* Date Picker Row */}
      <div className="flex items-center space-x-3 text-sm text-gray-700">
        <span>Search by date:</span>
        <input
          type="date"
          value={purchaseDate}
          onChange={(e) => {
            setPurchaseDate(e.target.value);
          }}
          className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-byuRoyal"
        />
      </div>
    </div>
  );
};

export default SearchBar;
