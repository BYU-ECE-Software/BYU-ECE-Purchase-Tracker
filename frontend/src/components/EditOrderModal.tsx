import React from 'react';
import type { Item } from '../types/order';

// Props expected by the EditOrderModal component
interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  editedOrder: {
    subtotal: number | null;
    tax: number | null;
    total: number | null;
    // add more editable fields here as needed
  };
  onOrderFieldChange: (field: string, value: any) => void;
  onItemStatusChange: (index: number, newStatus: string) => void;
  onSave: () => void;
}

// Dropdown options for item status
const statusOptions = ['Requested', 'Ordered', 'Completed', 'Cancelled'];

//Functional EditOrderModal Component
const EditOrderModal: React.FC<EditOrderModalProps> = ({
  isOpen,
  onClose,
  items,
  editedOrder,
  onItemStatusChange,
  onOrderFieldChange,
  onSave,
}) => {
  // Toggles display of individual item status dropdowns
  const [showItems, setShowItems] = React.useState(false);

  // Do not render anything if modal is not open
  if (!isOpen) return null;

  //Modal Display
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[90%] max-w-2xl">
        <h2 className="text-xl text-byuNavy font-bold mb-4">Edit Order</h2>

        <div className="mb-4">
          {/* Option for user to see each individual item within an order and update it's status */}
          <button
            onClick={() => setShowItems(!showItems)}
            className=" font-medium text-byuNavy hover:underline focus:outline-none"
          >
            {showItems ? 'Hide Items ▲' : 'Change Item Status ▼'}
          </button>

          {showItems && (
            <div className="mt-2 space-y-3">
              {items.map((item, idx) => (
                <div key={item.id}>
                  <label className="block text-byuNavy text-sm font-medium">
                    {item.name}
                  </label>
                  <select
                    value={item.status}
                    onChange={(e) => onItemStatusChange(idx, e.target.value)}
                    className="border p-2 rounded w-full text-byuNavy"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fields that will need to be edited after a purchase request has been initially made as it moves through the workflow */}
        <div className="mt-4 space-y-3">
          <input
            type="number"
            placeholder="Subtotal"
            value={editedOrder.subtotal ?? ''}
            onChange={(e) =>
              onOrderFieldChange('subtotal', parseFloat(e.target.value))
            }
            className="border p-2 rounded w-full text-byuNavy"
          />
          <input
            type="number"
            placeholder="Tax"
            value={editedOrder.tax ?? ''}
            onChange={(e) =>
              onOrderFieldChange('tax', parseFloat(e.target.value))
            }
            className="border p-2 rounded w-full text-byuNavy"
          />
          <input
            type="number"
            placeholder="Total"
            value={editedOrder.total ?? ''}
            onChange={(e) =>
              onOrderFieldChange('total', parseFloat(e.target.value))
            }
            className="border p-2 rounded w-full text-byuNavy"
          />
        </div>

        {/* Save and cancel buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-byuRoyal text-white rounded hover:bg-[#003a9a]"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditOrderModal;
