// Props for the AdminTabs component, generic over string literal tab names
interface AdminTabsProps<T extends string> {
  tabs: T[]; // List of tab names
  activeTab: T; // Currently selected tab
  setActiveTab: (tab: T) => void; // Function to update active tab
}

// Generic AdminTabs component for rendering a vertical list of tab buttons
function AdminTabs<T extends string>({
  tabs,
  activeTab,
  setActiveTab,
}: AdminTabsProps<T>) {
  return (
    <div className="w-48 flex flex-col gap-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`text-left px-4 py-2 rounded ${
            activeTab === tab
              ? 'bg-byuNavy text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export default AdminTabs;
