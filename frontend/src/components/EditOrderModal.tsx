import React from 'react';
import type { Item } from '../types/order';

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  subtotal: number | null;
  tax: number | null;
  total: number | null;
  onItemStatusChange: (index: number, newStatus: string) => void;
  onFieldChange: (field: 'subtotal' | 'tax' | 'total', value: number) => void;
  onSave: () => void;
}

const statusOptions = ['Requested', 'Ordered', 'Arrived', 'Cancelled'];

const EditOrderModal: React.FC<EditOrderModalProps> = ({
  isOpen,
  onClose,
  items,
  subtotal,
  tax,
  total,
  onItemStatusChange,
  onFieldChange,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[90%] max-w-2xl">
        <h2 className="text-xl text-byuNavy font-bold mb-4">Edit Order</h2>

        {items.map((item, idx) => (
          <div key={item.id} className="mb-3">
            <span className="block text-byuNavy font-medium">{item.name}</span>
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

        <div className="mt-4 space-y-3">
          <input
            type="number"
            placeholder="Subtotal"
            value={subtotal ?? ''}
            onChange={(e) =>
              onFieldChange('subtotal', parseFloat(e.target.value))
            }
            className="border p-2 rounded w-full"
          />
          <input
            type="number"
            placeholder="Tax"
            value={tax ?? ''}
            onChange={(e) => onFieldChange('tax', parseFloat(e.target.value))}
            className="border p-2 rounded w-full"
          />
          <input
            type="number"
            placeholder="Total"
            value={total ?? ''}
            onChange={(e) => onFieldChange('total', parseFloat(e.target.value))}
            className="border p-2 rounded w-full"
          />
        </div>

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
