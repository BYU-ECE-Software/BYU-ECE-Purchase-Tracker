import React, { useEffect } from 'react';
import type { Item } from '../types/item';
import type { Order } from '../types/order';
import type { Professor } from '../types/professor';
import type { LineMemoOption } from '../types/lineMemoOption';
import type { SpendCategory } from '../types/spendCategory';

// Props expected by the EditOrderModal component
interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  items: Item[];
  professors: Professor[];
  lineMemoOptions: LineMemoOption[];
  spendCategories: SpendCategory[];
  onItemStatusChange: (index: number, newStatus: string) => void;
  onOrderFieldChange: (field: string, value: any) => void;
  onSave: (markComplete: boolean) => void;
}

// Dropdown options for item status
const statusOptions = ['Requested', 'Ordered', 'Completed', 'Cancelled'];

// Functional EditOrderModal Component
const EditOrderModal: React.FC<EditOrderModalProps> = ({
  isOpen,
  onClose,
  items,
  order,
  professors,
  lineMemoOptions,
  spendCategories,
  onItemStatusChange,
  onOrderFieldChange,
  onSave,
}) => {
  // State to track which tab is currently active in the modal ("items" or "orderInfo")
  const [activeTab, setActiveTab] = React.useState<'items' | 'purchase'>(
    'items'
  );
  // State to track whether the "Mark as Completed" switch is toggled on or off
  const [markComplete, setMarkComplete] = React.useState(false);

  useEffect(() => {
    setMarkComplete(order.status === 'Completed');
  }, [order.status]);

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
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 relative overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-byuNavy">Edit Order</h2>
          {/* User can mark the order as completed */}
          <div className="flex items-center space-x-2">
            <label
              htmlFor="mark-complete"
              className="text-base text-byuNavy font-medium"
            >
              Mark as Completed
            </label>
            <button
              onClick={handleToggleComplete}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${markComplete ? 'bg-byuRoyal' : 'bg-gray-300'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${markComplete ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex space-x-4 mb-4 border-b pb-2">
          <button
            onClick={() => setActiveTab('items')}
            className={`px-3 py-1 ${activeTab === 'items' ? 'border-b-2 border-byuNavy text-byuNavy font-semibold' : 'text-gray-500'}`}
          >
            Items
          </button>
          <button
            onClick={() => setActiveTab('purchase')}
            className={`px-3 py-1 ${activeTab === 'purchase' ? 'border-b-2 border-byuNavy text-byuNavy font-semibold' : 'text-gray-500'}`}
          >
            Purchase Info
          </button>
        </div>

        {/* Tab Content */}
        {/* Item Tab */}
        {activeTab === 'items' && (
          <div className="space-y-4 text-byuNavy text-base">
            {/* Vendor */}
            <div className="flex items-start gap-2">
              <span className="font-semibold text-byuNavy">Vendor:</span>
              <span className="">{order.vendor ?? ''}</span>
            </div>

            {/* Shipping Preference */}
            {order.shippingPreference && (
              <div className="flex items-start gap-2">
                <span className="font-semibold">Shipping Preference:</span>
                <span>{order.shippingPreference}</span>
              </div>
            )}

            {/* Cart Link */}
            {order.cartLink && (
              <div className="flex items-start gap-2">
                <a
                  href={order.cartLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-byuRoyal font-semibold flex items-center gap-1"
                >
                  Cart Link
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
              </div>
            )}

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

                {/* Optional file display */}
                {item.file && (
                  <div className="text-sm text-gray-600 break-all">
                    Attached File: <span title={item.file}>{item.file}</span>
                  </div>
                )}
              </div>
            ))}

            {/* Comments */}
            {order.comment && (
              <div className="py-2">
                <span className="block text-sm font-medium text-byuNavy mb-1">
                  Comments:
                </span>
                <span className="block text-sm text-gray-700 whitespace-pre-wrap">
                  {order.comment}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Purchase Tab */}
        {activeTab === 'purchase' && (
          <div className="space-y-2">
            {/* Row: Professor Name */}
            <div className="flex items-center justify-between pt-0 pb-3 border-b border-gray-200">
              <label className="text-sm font-medium text-byuNavy">
                Professor
              </label>
              <select
                value={order.professorId ?? ''}
                onChange={(e) =>
                  onOrderFieldChange('professorId', e.target.value)
                }
                className="p-2 border rounded text-sm text-byuNavy"
              >
                <option value="" disabled hidden>
                  Select a professor
                </option>
                {professors.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.title} {prof.firstName} {prof.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Row: Funding Code */}
            <div className="flex items-center justify-between pt-0 pb-3 border-b border-gray-200">
              <label className="text-sm font-medium text-byuNavy">
                Funding Code
              </label>
              <input
                type="text"
                value={order.operatingUnit ?? ''}
                onChange={(e) =>
                  onOrderFieldChange('operatingUnit', e.target.value)
                }
                className="p-2 border rounded text-sm text-byuNavy w-1/2"
              />
            </div>

            {/* Row: Line Memo Options */}
            <div className="flex items-center justify-between pt-0 pb-3 border-b border-gray-200">
              <label className="text-sm font-medium text-byuNavy">
                Line Memo
              </label>
              <select
                value={order.lineMemoOptionId ?? ''}
                onChange={(e) =>
                  onOrderFieldChange('lineMemoOptionId', e.target.value)
                }
                className="p-2 border rounded text-sm text-byuNavy"
              >
                <option value="" disabled hidden>
                  Select a line memo option
                </option>
                {lineMemoOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.id} - {option.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Row: Purpose */}
            <div className="flex items-center justify-between pt-0 pb-3 border-b border-gray-200">
              <label className="text-sm font-medium text-byuNavy">
                Purpose
              </label>
              <input
                type="text"
                value={order.purpose ?? ''}
                onChange={(e) => onOrderFieldChange('purpose', e.target.value)}
                className="p-2 border rounded text-sm text-byuNavy w-1/2"
              />
            </div>

            {/* Row: Card Type */}
            <div className="flex items-center justify-between pt-0 pb-3 border-b border-gray-200">
              <label className="text-sm font-medium text-byuNavy">
                Card Type
              </label>
              <div className="flex gap-4">
                {['Campus Card', 'Off-campus Card'].map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-2 text-sm text-byuNavy"
                  >
                    <input
                      type="radio"
                      name="cardType"
                      value={option}
                      checked={order.cardType === option}
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
            <div className="flex items-center justify-between pt-0 pb-3 border-b border-gray-200">
              <label className="text-sm font-medium text-byuNavy">
                Purchase Date
              </label>
              <input
                type="date"
                value={order.purchaseDate?.slice(0, 10) ?? ''}
                onChange={(e) =>
                  onOrderFieldChange('purchaseDate', e.target.value)
                }
                className="p-2 border rounded text-sm text-byuNavy w-1/2"
              />
            </div>

            {/* Row: Vendor */}
            <div className="flex items-center justify-between pt-0 pb-3 border-b border-gray-200">
              <label className="text-sm font-medium text-byuNavy">Vendor</label>
              <input
                type="text"
                value={order.vendor ?? ''}
                onChange={(e) => onOrderFieldChange('vendor', e.target.value)}
                className="p-2 border rounded text-sm text-byuNavy w-1/2"
              />
            </div>

            {/* Row: Tax */}
            <div className="flex items-center justify-between pt-0 pb-3 border-b border-gray-200">
              <label className="text-sm font-medium text-byuNavy">Tax</label>
              <input
                type="number"
                value={order.tax ?? ''}
                onChange={(e) =>
                  onOrderFieldChange('tax', parseFloat(e.target.value))
                }
                className="p-2 border rounded text-sm text-byuNavy w-1/2"
              />
            </div>

            {/* Row: Total */}
            <div className="flex items-center justify-between pt-0 pb-3 border-b border-gray-200">
              <label className="text-sm font-medium text-byuNavy">Total</label>
              <input
                type="number"
                value={order.total ?? ''}
                onChange={(e) =>
                  onOrderFieldChange('total', parseFloat(e.target.value))
                }
                className="p-2 border rounded text-sm text-byuNavy w-1/2"
              />
            </div>

            {/* Row: Receipt Upload */}
            <div className="flex items-center justify-between pt-0 pb-3 border-b border-gray-200">
              <label className="text-sm font-medium text-byuNavy">
                Receipt
              </label>
              <div className="flex items-center gap-2">
                {order.receipt && (
                  <span className="text-sm text-gray-600 truncate max-w-[200px]">
                    {order.receipt}
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

            {/* Row: Comments */}
            <div className="pt-0 pb-3">
              <label className="text-sm font-medium text-byuNavy">
                Comments
              </label>
              <textarea
                value={order.comment}
                onChange={(e) => onOrderFieldChange('comment', e.target.value)}
                placeholder="Any notes to add about the purchase..."
                className="w-full border border-gray-300 rounded p-2 resize-y min-h-[50px] text-sm text-byuNavy"
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
