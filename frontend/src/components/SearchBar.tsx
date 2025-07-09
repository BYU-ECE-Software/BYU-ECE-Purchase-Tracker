// Search Bar Component

import React from 'react';

// Define the props expected by the SearchBar component
interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  onSearch,
  onClear,
}) => {
  // Handle 'Enter' key press to trigger the search
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="flex items-center space-x-2 mb-4">
      {/* Search input field */}
      <input
        type="text"
        placeholder="Search orders..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        className="border border-gray-300 rounded px-4 py-2 w-64"
      />

      {/* Search button */}
      <button
        onClick={onSearch}
        className="bg-byuRoyal text-white px-3 py-2 rounded hover:bg-[#003a9a]"
      >
        Search
      </button>

      {/* Clear button (only shows if there's a search term) */}
      {searchTerm && (
        <button
          onClick={onClear}
          className="text-sm text-gray-600 underline hover:text-gray-800"
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default SearchBar;
