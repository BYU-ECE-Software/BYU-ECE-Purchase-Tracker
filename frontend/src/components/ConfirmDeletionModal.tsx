import React from 'react';

interface ConfirmDeletionModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  filesToDeleteCount: number;
}

const ConfirmDeletionModal: React.FC<ConfirmDeletionModalProps> = ({
  isOpen,
  onCancel,
  onConfirm,
  filesToDeleteCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md text-center shadow-lg">
        <h2 className="text-xl font-semibold text-byuNavy mb-4">
          Confirm File/Receipt Deletion
        </h2>
        <p className="text-gray-700 mb-4">
          {filesToDeleteCount} file{filesToDeleteCount > 1 ? 's' : ''} will be
          permanently deleted when marking this order as completed. Are you sure
          you want to continue?
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-byuRoyal text-white rounded hover:bg-[#003a9a]"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeletionModal;
