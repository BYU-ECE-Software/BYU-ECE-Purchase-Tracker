import React, { useState } from 'react';
import type { SpendCategory } from '../types/spendCategory';
import { createSpendCategory } from '../api/purchaseTrackerApi';

interface AddSpendCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newCategory: SpendCategory) => void;
  setToast: (toast: {
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
  }) => void;
}

const AddSpendCategoryModal: React.FC<AddSpendCategoryModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  setToast,
}) => {
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [visibleToStudents, setVisibleToStudents] = useState(false);

  const handleSubmit = async () => {
    try {
      const newCategory = await createSpendCategory({
        code,
        description,
        visibleToStudents,
      });

      onCreate(newCategory);
      onClose();
      setCode('');
      setDescription('');
      setVisibleToStudents(true);
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        title: 'Creation Failed',
        message: 'Something went wrong creating the category.',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-black text-xl"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold text-byuNavy mb-4">
          Add Spend Category
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-byuNavy">
              Code
            </label>
            <input
              type="text"
              className="w-full border rounded p-2 text-sm text-byuNavy"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Format: SCXXXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-byuNavy">
              Description
            </label>
            <input
              type="text"
              className="w-full border rounded p-2 text-sm text-byuNavy"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={visibleToStudents}
              onChange={(e) => setVisibleToStudents(e.target.checked)}
            />
            <label className="text-sm text-byuNavy">
              Include in Student Dropdown
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-byuRoyal text-white rounded hover:bg-[#003a9a]"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSpendCategoryModal;
