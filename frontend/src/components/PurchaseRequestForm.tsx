import { useState, useEffect } from 'react';
import { createOrder, fetchLineMemoOptions } from '../api/purchaseTrackerApi';
import type { LineMemoOption } from '../types/lineMemoOption';

// Type for an individual item being purchased
interface PurchaseItem {
  item: string;
  quantity: number;
  link: string;
  file: File | null;
}

const PurchaseRequestForm = () => {
  // Track the list of items the user wants to purchase
  const [items, setItems] = useState<PurchaseItem[]>([
    { item: '', quantity: 1, link: '', file: null },
  ]);

  // Form fields for order-level info
  const [storeName, setStoreName] = useState('');
  const [dateNeeded, setDateNeeded] = useState('');
  const [shipping, setShipping] = useState('');
  const [professorName, setProfessorName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [workdayCode, setWorkdayCode] = useState('');
  const [selectedLineMemoId, setSelectedLineMemoId] = useState('');

  // Dropdown options for line memo selection
  const [lineMemoOptions, setLineMemoOptions] = useState<LineMemoOption[]>([]);

  // Load available line memo options from API mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const options = await fetchLineMemoOptions();
        setLineMemoOptions(options);
      } catch (err) {
        console.error('Failed to load line memo options:', err);
      }
    };

    loadOptions();
  }, []);

  // Handle changes to any item field (including file)
  const handleItemChange = (
    index: number,
    field: keyof PurchaseItem,
    value: any
  ) => {
    const updatedItems = [...items];
    const updatedItem = { ...updatedItems[index] };

    if (field === 'file') {
      updatedItem[field] = value.target.files[0];
    } else {
      updatedItem[field] = value;
    }

    updatedItems[index] = updatedItem;
    setItems(updatedItems);
  };

  // Add a new item row
  const addItem = () => {
    setItems([...items, { item: '', quantity: 1, link: '', file: null }]);
  };

  // Delete an item row by index
  const deleteItem = (indexToDelete: number) => {
    const updatedItems = items.filter((_, i) => i !== indexToDelete);
    setItems(updatedItems);
  };

  // Submit form to backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newOrder = await createOrder({
        store: storeName,
        needByDate: dateNeeded,
        shippingPreference: shipping,
        professor: professorName,
        purpose,
        workdayCode,
        userId: 2, // TEMPORARY: Replace this with real logic later
        lineMemoOptionId: Number(selectedLineMemoId),
        items: items.map((i) => ({
          name: i.item,
          quantity: i.quantity,
          status: 'Requested',
          link: i.link,
          file: i.file ? i.file.name : null, // Note: still doesn't upload file yet
        })),
      });

      console.log('Order created:', newOrder);
      alert('Request submitted successfully!');
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Error submitting request.');
    }
  };

  // Purchase Request Form Rendering
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto mt-4 mb-8 p-6 bg-white shadow-md rounded-md space-y-6"
    >
      <h2 className="text-2xl text-byuNavy font-semibold mb-4">
        Order Details
      </h2>

      {/* Order details */}
      <div className="text-byuNavy space-y-8">
        <div>
          <label className="block font-medium">Store Name</label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            required
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        <div>
          <label className="block font-medium">Date Needed</label>
          <input
            type="date"
            value={dateNeeded}
            onChange={(e) => setDateNeeded(e.target.value)}
            required
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        <div>
          <span className="block font-medium mb-1">Shipping Preference</span>
          <div className="space-y-1">
            {['Overnight', 'Regular', 'Any'].map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="shipping"
                  value={option}
                  checked={shipping === option}
                  onChange={(e) => setShipping(e.target.value)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Item Details */}
        <h2 className="text-2xl text-byuNavy font-semibold mb-4">Items</h2>

        {items.map((item, index) => (
          <div
            key={index}
            className="border border-gray-300 p-4 rounded-md space-y-4 text-byuNavy"
          >
            <div>
              <label className="block font-medium">Item Name</label>
              <input
                type="text"
                value={item.item}
                onChange={(e) =>
                  handleItemChange(index, 'item', e.target.value)
                }
                required
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>

            <div>
              <label className="block font-medium">Quantity</label>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  handleItemChange(index, 'quantity', Number(e.target.value))
                }
                required
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>

            <div>
              <label className="block font-medium">Link</label>
              <input
                type="url"
                value={item.link}
                onChange={(e) =>
                  handleItemChange(index, 'link', e.target.value)
                }
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>

            <div>
              <label className="block font-medium">File Upload</label>
              <input
                type="file"
                onChange={(e) => handleItemChange(index, 'file', e)}
                className="block mt-1"
              />
            </div>

            {/* Delete Item button which appears if there are multiple items displayed */}
            {index > 0 && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => deleteItem(index)}
                  className="text-[#E61744] hover:text-[#A3082A]"
                  title="Delete item"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Button for user to add another item to their order */}
        <button
          type="button"
          onClick={addItem}
          className="flex items-center text-byuNavy hover:text-[#001f3f] font-medium space-x-1 hover:underline"
        >
          <span className="text-lg">+</span>
          <span>Add Another Item</span>
        </button>

        {/* Purchasing/Workday Details */}
        <h2 className="text-2xl text-byuNavy font-semibold mb-4">
          Purchasing Details
        </h2>

        <div>
          <label className="block font-medium">Professor Name</label>
          <input
            type="text"
            value={professorName}
            onChange={(e) => setProfessorName(e.target.value)}
            required
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        <div>
          <label className="block font-medium">Purpose</label>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            required
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        <div>
          <label className="block font-medium">Workday Code</label>
          <input
            type="text"
            value={workdayCode}
            onChange={(e) => setWorkdayCode(e.target.value)}
            required
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        <div>
          <label className="block font-medium">Line Memo Options</label>
          <select
            value={selectedLineMemoId}
            onChange={(e) => setSelectedLineMemoId(e.target.value)}
            required
            className="w-full border border-gray-300 rounded p-2 text-byuNavy"
          >
            <option value="" disabled hidden>
              Select an option
            </option>
            {lineMemoOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.description}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="px-6 py-2 bg-byuRoyal text-white font-semibold rounded hover:bg-[#003a9a]"
          >
            Submit Request
          </button>
        </div>
      </div>
    </form>
  );
};

export default PurchaseRequestForm;
