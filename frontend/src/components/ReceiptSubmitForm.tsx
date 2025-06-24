import { useState, useEffect } from 'react';
import {
  createOrder,
  fetchLineMemoOptions,
  fetchProfessors,
} from '../api/purchaseTrackerApi';
import type { LineMemoOption } from '../types/lineMemoOption';
import type { Professor } from '../types/professor';

// Create a type for a receipt
interface Receipt {
  store: string;
  cardType: string;
  purchaseDate: string;
  subtotal: number;
  tax: number;
  total: number;
  receipt: File | null;
}

const ReceiptSubmitForm = () => {
  // Track the list of receipts the user wants to submit in state
  const [receipts, setReceipts] = useState<Receipt[]>([
    {
      store: '',
      cardType: '',
      purchaseDate: '',
      subtotal: 0,
      tax: 0,
      total: 0,
      receipt: null,
    },
  ]);

  // Form fields for order-level info
  const [purpose, setPurpose] = useState('');
  const [workdayCode, setWorkdayCode] = useState('');
  const [selectedLineMemoId, setSelectedLineMemoId] = useState('');
  const [selectedProfessorId, setSelectedProfessorId] = useState('');

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

  // Dropdown options for professor selection
  const [professors, setProfessors] = useState<Professor[]>([]);

  // Load available Professors from API mount
  useEffect(() => {
    const loadProfessors = async () => {
      try {
        const professors = await fetchProfessors();
        setProfessors(professors);
      } catch (err) {
        console.error('Failed to load professors:', err);
      }
    };

    loadProfessors();
  }, []);

  // Handle changes to any receipt field
  const handleReceiptChange = (
    index: number,
    field: keyof Receipt,
    value: any
  ) => {
    const updatedReceipt = [...receipts];
    updatedReceipt[index] = {
      ...updatedReceipt[index],
      [field]: field === 'receipt' ? value.target.files[0] : value,
    };
    setReceipts(updatedReceipt);
  };

  // Add a new receipt row
  const addReceipt = () => {
    setReceipts([
      ...receipts,
      {
        store: '',
        cardType: '',
        purchaseDate: '',
        subtotal: 0,
        tax: 0,
        total: 0,
        receipt: null,
      },
    ]);
  };

  // Delete a receipt row by index
  const deleteReceipt = (indexToDelete: number) => {
    const updatedReceipts = receipts.filter((_, r) => r !== indexToDelete);
    setReceipts(updatedReceipts);
  };

  // Submit form to backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      for (const receipt of receipts) {
        await createOrder({
          store: receipt.store,
          shippingPreference: undefined,
          professorId: Number(selectedProfessorId),
          purpose,
          workdayCode,
          userId: 2, // TEMPORARY: Replace this with real logic later
          lineMemoOptionId: Number(selectedLineMemoId),
          cardType: receipt.cardType,
          purchaseDate: receipt.purchaseDate,
          receipt: receipt.receipt ? receipt.receipt.name : undefined,
          subtotal: receipt.subtotal,
          tax: receipt.tax,
          total: receipt.total,
          items: [],
        });
      }

      alert('Receipts submitted successfully!');
      setReceipts([
        {
          store: '',
          cardType: '',
          purchaseDate: '',
          subtotal: 0,
          tax: 0,
          total: 0,
          receipt: null,
        },
      ]);
    } catch (error) {
      console.error('Error submitting receipts:', error);
      alert('Error submitting receipts.');
    }
  };

  // Purchase Request Form Rendering
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto mt-4 mb-8 p-6 bg-white shadow-md rounded-md space-y-6"
    >
      {/* Purchasing/Workday Details */}
      <h2 className="text-2xl text-byuNavy font-semibold mb-4">
        Purchasing Details
      </h2>

      <h2 className="text-l text-byuNavy mb-4">
        If submitting multiple receipts, the following purchasing detail
        information must be the same for each receipt (professor name, workday
        codes, etc). If you are submitting different receipts for differing
        reasons, please submit multiple forms.
      </h2>

      <div>
        <label className="block font-medium">Professor</label>
        <select
          value={selectedProfessorId}
          onChange={(e) => setSelectedProfessorId(e.target.value)}
          required
          className="w-full border border-gray-300 rounded p-2 text-byuNavy"
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

      <div className="text-byuNavy space-y-8">
        {/* Receipt Details */}
        <h2 className="text-2xl text-byuNavy font-semibold mb-4 mt-12">
          Receipts
        </h2>

        {receipts.map((receipt, index) => (
          <div
            key={index}
            className="border border-gray-300 p-4 rounded-md space-y-4 text-byuNavy"
          >
            <div>
              <label className="block font-medium">Store Name</label>
              <input
                type="text"
                value={receipt.store}
                onChange={(e) =>
                  handleReceiptChange(index, 'store', e.target.value)
                }
                required
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>

            <div>
              <span className="block font-medium mb-1">Type of Card</span>
              <div className="space-y-1">
                {['Campus Card', 'Off-campus Card'].map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`cardType-${index}`} //makes each radio button group unique for every receipt
                      value={option}
                      checked={receipt.cardType === option}
                      onChange={(e) =>
                        handleReceiptChange(index, 'cardType', e.target.value)
                      }
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-medium">Date Purchased</label>
              <input
                type="date"
                value={receipt.purchaseDate}
                onChange={(e) =>
                  handleReceiptChange(index, 'purchaseDate', e.target.value)
                }
                required
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>

            <div>
              <label className="block font-medium">Subtotal</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={receipt.subtotal}
                onChange={(e) =>
                  handleReceiptChange(
                    index,
                    'subtotal',
                    parseFloat(e.target.value)
                  )
                }
                required
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>

            <div>
              <label className="block font-medium">Tax</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={receipt.tax}
                onChange={(e) =>
                  handleReceiptChange(index, 'tax', parseFloat(e.target.value))
                }
                required
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>

            <div>
              <label className="block font-medium">Total</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={receipt.total}
                onChange={(e) =>
                  handleReceiptChange(
                    index,
                    'total',
                    parseFloat(e.target.value)
                  )
                }
                required
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>

            <div>
              <label className="block font-medium">Receipt Upload</label>
              <input
                type="file"
                onChange={(e) => handleReceiptChange(index, 'receipt', e)}
                className="block mt-1"
              />
            </div>

            {/* Delete Receipt button which appears if there are multiple receipts displayed */}
            {index > 0 && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => deleteReceipt(index)}
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

        {/* Button for user to add another receipt to their order */}
        <button
          type="button"
          onClick={addReceipt}
          className="flex items-center text-byuNavy hover:text-[#001f3f] font-medium space-x-1 hover:underline"
        >
          <span className="text-lg">+</span>
          <span>Add Another Receipt</span>
        </button>

        <div className="flex justify-center">
          <button
            type="submit"
            className="px-6 py-2 bg-byuRoyal text-white font-semibold rounded hover:bg-[#003a9a]"
          >
            Submit Receipts
          </button>
        </div>
      </div>
    </form>
  );
};

export default ReceiptSubmitForm;
