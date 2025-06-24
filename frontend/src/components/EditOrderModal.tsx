import React from 'react';
import type { Item } from '../types/item';

// Props expected by the EditOrderModal component
interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  editedOrder: {
    subtotal: number | null;
    tax: number | null;
    total: number | null;
    cardType: string | null;
    purchaseDate: string | null;
    receipt: string | null;
    // add more editable fields here as needed
  };
  onOrderFieldChange: (field: string, value: any) => void;
  onItemStatusChange: (index: number, newStatus: string) => void;
  onSave: () => void;
}

// Dropdown options for item status
const statusOptions = ['Requested', 'Ordered', 'Completed', 'Cancelled'];

// Functional EditOrderModal Component
const EditOrderModal: React.FC<EditOrderModalProps> = ({
  isOpen,
  onClose,
  items,
  editedOrder,
  onItemStatusChange,
  onOrderFieldChange,
  onSave,
}) => {
  const [activeTab, setActiveTab] = React.useState<'items' | 'orderInfo'>(
    'items'
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[90%] max-w-2xl">
        <h2 className="text-xl text-byuNavy font-bold mb-4">Edit Order</h2>

        {/* Tab Navigation */}
        <div className="flex mb-4 border-b">
          <button
            onClick={() => setActiveTab('items')}
            className={`px-4 py-2 font-medium text-byuNavy ${activeTab === 'items' ? 'border-b-2 border-byuRoyal' : 'hover:underline'}`}
          >
            Item Status
          </button>
          <button
            onClick={() => setActiveTab('orderInfo')}
            className={`px-4 py-2 font-medium text-byuNavy ${activeTab === 'orderInfo' ? 'border-b-2 border-byuRoyal' : 'hover:underline'}`}
          >
            Order Info
          </button>
        </div>

        {/* Tab Content */}
        {/* Item Tab */}
        {activeTab === 'items' && (
          <div className="space-y-3">
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

        {/* Purchase Tab */}
        {activeTab === 'orderInfo' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="w-20 text-base font-normal text-byuNavy">
                Card Type:
              </label>
              <div className="flex space-x-6">
                {['Campus Card', 'Off-campus Card'].map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="cardType"
                      value={option}
                      checked={editedOrder.cardType === option}
                      onChange={(e) =>
                        onOrderFieldChange('cardType', e.target.value)
                      }
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="w-20 text-base font-normal text-byuNavy">
                Purchase Date:
              </label>
              <input
                type="date"
                value={editedOrder.purchaseDate?.slice(0, 10) ?? ''}
                onChange={(e) =>
                  onOrderFieldChange('purchaseDate', e.target.value)
                }
                className="flex-1 p-2 border rounded text-byuNavy"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="w-20 text-base font-normal text-byuNavy">
                Receipt:
              </label>
              <div className="flex-1 flex items-center space-x-2">
                {editedOrder.receipt && (
                  <span className="text-sm text-gray-700 truncate max-w-[200px]">
                    {editedOrder.receipt}
                  </span>
                )}
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onOrderFieldChange('receipt', file.name); // Just stores the name
                    }
                  }}
                  className="flex-1 p-2 border rounded text-byuNavy"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="w-20 text-base font-normal text-byuNavy">
                Subtotal:
              </label>
              <input
                type="number"
                value={editedOrder.subtotal ?? ''}
                onChange={(e) =>
                  onOrderFieldChange('subtotal', parseFloat(e.target.value))
                }
                className="flex-1 p-2 border rounded text-byuNavy"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="w-20 text-base font-normal text-byuNavy">
                Tax:
              </label>
              <input
                type="number"
                value={editedOrder.tax ?? ''}
                onChange={(e) =>
                  onOrderFieldChange('tax', parseFloat(e.target.value))
                }
                className="flex-1 p-2 border rounded text-byuNavy"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="w-20 text-base font-normal text-byuNavy">
                Total:
              </label>
              <input
                type="number"
                value={editedOrder.total ?? ''}
                onChange={(e) =>
                  onOrderFieldChange('total', parseFloat(e.target.value))
                }
                className="flex-1 p-2 border rounded text-byuNavy"
              />
            </div>
          </div>
        )}

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
