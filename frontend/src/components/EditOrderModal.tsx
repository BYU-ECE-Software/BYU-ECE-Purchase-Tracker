import React, { useEffect } from 'react';
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
    status: string | null;
    vendor: string | null;
    professorName: string | null;
    // add more editable fields here as needed
  };
  onOrderFieldChange: (field: string, value: any) => void;
  onItemStatusChange: (index: number, newStatus: string) => void;
  onSave: (markComplete: boolean) => void;
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
  // State to track which tab is currently active in the modal ("items" or "orderInfo")
  const [activeTab, setActiveTab] = React.useState<'items' | 'orderInfo'>(
    'items'
  );
  // State to track whether the "Mark as Completed" switch is toggled on or off
  const [markComplete, setMarkComplete] = React.useState(false);

  useEffect(() => {
    if (editedOrder.status === 'Completed') {
      setMarkComplete(true);
    } else {
      setMarkComplete(false);
    }
  }, [editedOrder.status]);

  // Function to change all item status's to "completed" when toggled and "ordered" when toggled off
  const handleToggleComplete = () => {
    const newValue = !markComplete;
    setMarkComplete(newValue);

    if (items.length > 0) {
      const newStatus = newValue ? 'Completed' : 'Ordered';
      items.forEach((_, idx) => onItemStatusChange(idx, newStatus));
    } else {
      // Optional: update order status if no items (frontend-only)
      onOrderFieldChange('status', newValue ? 'Completed' : 'Purchased');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[90%] max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-byuNavy font-bold mb-4">Edit Order</h2>
          <div className="flex items-center space-x-2">
            {/* User can mark the entire order as completed */}
            <label
              htmlFor="mark-complete"
              className="text-base text-byuNavy font-medium"
            >
              Mark as Completed
            </label>
            <button
              onClick={handleToggleComplete}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                markComplete ? 'bg-byuRoyal' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  markComplete ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-4 border-b">
          <button
            onClick={() => setActiveTab('items')}
            className={`px-4 py-2 font-medium text-byuNavy ${activeTab === 'items' ? 'border-b-2 border-byuRoyal' : 'hover:underline'}`}
          >
            Items
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
          <div className="space-y-4">
            {/* Vendor display */}
            <div className="flex items-center gap-2 pb-2 text-base font-medium text-byuNavy">
              <span>Vendor:</span>
              <span className="font-normal">{editedOrder.vendor ?? ''}</span>
            </div>

            {/* Items List */}
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="border rounded p-4 bg-gray-50 shadow-sm space-y-2"
              >
                {/* Item name with optional link */}
                <div className="text-base font-semibold text-byuNavy">
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-byuRoyal flex items-center gap-1"
                    >
                      {item.name}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-byuRoyal"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 3h7m0 0v7m0-7L10 14"
                        />
                      </svg>
                    </a>
                  ) : (
                    item.name
                  )}
                </div>

                {/* Quantity and Status aligned horizontally */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-700">
                    Quantity: {item.quantity}
                  </span>

                  <label className="flex items-center gap-2 text-sm font-medium text-byuNavy">
                    Status:
                    <select
                      value={item.status}
                      onChange={(e) => onItemStatusChange(idx, e.target.value)}
                      className="border rounded px-2 py-1 text-sm text-byuNavy"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Purchase Tab */}
        {activeTab === 'orderInfo' && (
          <div className="space-y-4">
            {/* Row: Professor Name (read-only) */}
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="font-medium text-byuNavy col-span-1">
                Professor:
              </label>
              <span className=" text-byuNavy col-span-2">
                {editedOrder.professorName ?? ''}
              </span>
            </div>

            {/* Row: Vendor */}
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="font-medium text-byuNavy">Vendor:</label>
              <input
                type="text"
                value={editedOrder.vendor ?? ''}
                onChange={(e) => onOrderFieldChange('vendor', e.target.value)}
                className="col-span-2 p-2 border rounded text-byuNavy"
              />
            </div>

            {/* Row: Card Type */}
            <div className="grid grid-cols-3 items-start gap-4">
              <label className="font-medium text-byuNavy">Card Type:</label>
              <div className="col-span-2 flex flex-col sm:flex-row sm:items-center gap-4">
                {['Campus Card', 'Off-campus Card'].map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-2 text-sm text-byuNavy"
                  >
                    <input
                      type="radio"
                      name="cardType"
                      value={option}
                      checked={editedOrder.cardType === option}
                      onChange={(e) =>
                        onOrderFieldChange('cardType', e.target.value)
                      }
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            {/* Row: Purchase Date */}
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="font-medium text-byuNavy">Purchase Date:</label>
              <input
                type="date"
                value={editedOrder.purchaseDate?.slice(0, 10) ?? ''}
                onChange={(e) =>
                  onOrderFieldChange('purchaseDate', e.target.value)
                }
                className="col-span-2 p-2 border rounded text-byuNavy"
              />
            </div>

            {/* Row: Receipt Upload */}
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="font-medium text-byuNavy">Receipt:</label>
              <div className="col-span-2 flex items-center gap-2">
                {editedOrder.receipt && (
                  <span className="text-sm text-gray-600 truncate max-w-[200px]">
                    {editedOrder.receipt}
                  </span>
                )}
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onOrderFieldChange('receipt', file.name);
                    }
                  }}
                  className="p-2 border rounded text-byuNavy"
                />
              </div>
            </div>

            {/* Row: Subtotal */}
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="font-medium text-byuNavy">Subtotal:</label>
              <input
                type="number"
                value={editedOrder.subtotal ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  onOrderFieldChange(
                    'subtotal',
                    val === '' ? null : parseFloat(val)
                  );
                }}
                className="col-span-2 p-2 border rounded text-byuNavy"
              />
            </div>

            {/* Row: Tax */}
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="font-medium text-byuNavy">Tax:</label>
              <input
                type="number"
                value={editedOrder.tax ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  onOrderFieldChange(
                    'tax',
                    val === '' ? null : parseFloat(val)
                  );
                }}
                className="col-span-2 p-2 border rounded text-byuNavy"
              />
            </div>

            {/* Row: Total */}
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="font-medium text-byuNavy">Total:</label>
              <input
                type="number"
                value={editedOrder.total ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  onOrderFieldChange(
                    'total',
                    val === '' ? null : parseFloat(val)
                  );
                }}
                className="col-span-2 p-2 border rounded text-byuNavy"
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
            onClick={() => onSave(markComplete)}
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
