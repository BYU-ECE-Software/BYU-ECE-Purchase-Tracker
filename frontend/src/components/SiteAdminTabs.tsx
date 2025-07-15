interface AdminTabsProps<T extends string> {
  tabs: T[];
  activeTab: T;
  setActiveTab: (tab: T) => void;
}

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
