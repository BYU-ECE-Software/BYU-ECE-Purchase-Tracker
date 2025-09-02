import { useState, useEffect } from 'react';
import {
  createOrder,
  fetchProfessors,
  fetchStudentSpendCategories,
} from '../api/purchaseTrackerApi';
import type { Professor } from '../types/professor';
import type { SpendCategory } from '../types/spendCategory';

// Create a type for a receipt
interface Receipt {
  vendor: string;
  purpose: string;
  creditCard: boolean | null;
  purchaseDate: string;
  tax: number;
  total: number;
  receipt: File | null;
  comment: string;
}

const ReceiptSubmitForm = () => {
  // Track the list of receipts the user wants to submit in state
  const [receipts, setReceipts] = useState<Receipt[]>([
    {
      vendor: '',
      purpose: '',
      creditCard: null,
      purchaseDate: '',
      tax: 0,
      total: 0,
      receipt: null,
      comment: '',
    },
  ]);

  // Form fields for order-level info
  const [fullName, setFullName] = useState('');
  const [byuNetId, setByuNetId] = useState('');
  const [email, setEmail] = useState('');
  const [workTag, setWorkTag] = useState('');
  const [selectedSpendCategoryId, setSelectedSpendCategoryId] = useState('');
  const [selectedProfessorId, setSelectedProfessorId] = useState('');

  // State to track 'other' spend category
  const [customSpendCategory, setCustomSpendCategory] = useState('');
  const [selectedSpendCategoryCode, setSelectedSpendCategoryCode] =
    useState('');

  // State for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Dropdown options for spend category selection
  const [spendCategories, setSpendCategories] = useState<SpendCategory[]>([]);

  // Load available spend categories from API mount
  useEffect(() => {
    const loadSpendCategories = async () => {
      try {
        const categories = await fetchStudentSpendCategories();
        setSpendCategories(categories);
      } catch (err) {
        console.error('Failed to load spend categories:', err);
      }
    };

    loadSpendCategories();
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

  // Map input string -> number or '' (so clearing the field doesn't produce NaN) for tax and total
  const parseNumOrEmpty = (s: string) => (s === '' ? ('' as any) : Number(s));

  // Map state value -> input value (never let the input see NaN) for tax and total
  const showNumOrEmpty = (n: any) => (Number.isFinite(n) ? n : '');

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
        vendor: '',
        purpose: '',
        creditCard: null,
        purchaseDate: '',
        tax: 0,
        total: 0,
        receipt: null,
        comment: '',
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
          fullName,
          byuNetId,
          email,
          vendor: receipt.vendor,
          shippingPreference: undefined,
          professorId: Number(selectedProfessorId),
          purpose: receipt.purpose,
          workTag,
          spendCategoryId: Number(selectedSpendCategoryId),
          creditCard: receipt.creditCard ?? undefined,
          purchaseDate: receipt.purchaseDate,
          receipt: receipt.receipt ? [receipt.receipt] : undefined,
          tax: receipt.tax,
          total: receipt.total,
          status: 'Purchased',
          comment:
            selectedSpendCategoryCode === 'Other'
              ? `Spend Category: ${customSpendCategory}\n${receipt.comment}`
              : receipt.comment,
          cartLink: undefined,
          items: [],
        });
      }

      setShowConfirmModal(true);
      setReceipts([
        {
          vendor: '',
          purpose: '',
          creditCard: null,
          purchaseDate: '',
          tax: 0,
          total: 0,
          receipt: null,
          comment: '',
        },
      ]);
    } catch (error) {
      console.error('Error submitting receipts:', error);
      alert('Error submitting receipts.');
    }
  };

  // Purchase Request Form Rendering
  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto mt-4 mb-8 p-6 text-byuNavy space-y-8 bg-white shadow-md rounded-md"
      >
        {/* Purchasing/Workday Details */}
        <h2 className="text-base text-byuNavy mb-4">
          All receipts on one form submission must use the same funding code. If
          you are submitting receipts with different funding codes, please
          submit multiple forms.
        </h2>

        {/* Student Information */}
        <h2 className="text-2xl text-byuNavy font-semibold mb-4">
          Student Information
        </h2>

        <div>
          <label className="block font-medium">Full Name *</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        <div>
          <label className="block font-medium">
            BYU Net ID (not your id number) *
          </label>
          <input
            type="text"
            value={byuNetId}
            onChange={(e) => setByuNetId(e.target.value)}
            required
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        <div>
          <label className="block font-medium">Email *</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl text-byuNavy font-semibold">Funding Code</h2>

          <h2 className="text-base text-byuNavy">
            Format: <br />
            Account Funding Code - Letters (GR, AC, CC, etc), followed by 5
            numbers. Ex. ACXXXXX <br />
            <br />
            Spend Category - Choose one of the following dropdown options or
            enter a different code manually
          </h2>
        </div>

        <div>
          <label className="block font-medium text-byuNavy">
            Account Funding Code *
          </label>
          <input
            type="text"
            value={workTag}
            onChange={(e) => setWorkTag(e.target.value)}
            required
            className="w-full border text-byuNavy border-gray-300 rounded p-2"
          />
        </div>

        <div>
          <label className="block font-medium text-byuNavy">
            Spend Category *
          </label>
          <select
            value={selectedSpendCategoryId}
            onChange={(e) => {
              const selectedId = e.target.value;
              setSelectedSpendCategoryId(selectedId);

              const selected = spendCategories.find(
                (sc) => sc.id.toString() === selectedId
              );
              setSelectedSpendCategoryCode(selected?.code || '');

              // If user selects "Other", show the input and reset any previous custom value
              if (selected?.code === 'Other') {
                setCustomSpendCategory('');
              }
            }}
            required
            className="w-full border text-byuNavy border-gray-300 rounded p-2"
          >
            <option value="" disabled hidden>
              Select a spend category
            </option>
            {spendCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.code} - {category.description}
              </option>
            ))}
          </select>
        </div>

        {/* If user selects 'Other' spend category, this question pops up to allow them to manually enter a SC */}
        {selectedSpendCategoryCode === 'Other' && (
          <div className="mt-2">
            <label className="block font-medium">Custom Spend Category *</label>
            <input
              type="text"
              value={customSpendCategory}
              onChange={(e) => setCustomSpendCategory(e.target.value)}
              required
              className="w-full border border-gray-300 rounded p-2"
              placeholder="Format: SCXXXX"
            />
          </div>
        )}

        <h2 className="text-2xl text-byuNavy font-semibold mb-4">
          Purchasing Details
        </h2>

        <div>
          <label className="block font-medium text-byuNavy">
            Professor/Staff *
          </label>
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

        <div className="text-byuNavy space-y-8">
          {/* Receipt Details */}
          <h2 className="text-2xl text-byuNavy font-semibold mb-4 mt-12">
            Receipts
          </h2>

          {receipts.map((receipt, index) => (
            <div
              key={index}
              className="border border-gray-300 p-4 rounded-md space-y-8 text-byuNavy"
            >
              <div>
                <label className="block font-medium">Vendor *</label>
                <input
                  type="text"
                  value={receipt.vendor}
                  onChange={(e) =>
                    handleReceiptChange(index, 'vendor', e.target.value)
                  }
                  required
                  className="w-full border border-gray-300 rounded p-2"
                />
              </div>

              <div>
                <label className="block font-medium">
                  Purpose * (be specific)
                </label>
                <span className="block text-sm mb-2">
                  Note that Capstone purchases are to be done through the
                  Capstone website, not here.
                </span>
                <input
                  type="text"
                  value={receipt.purpose}
                  onChange={(e) =>
                    handleReceiptChange(index, 'purpose', e.target.value)
                  }
                  required
                  className="w-full border border-gray-300 rounded p-2"
                />
              </div>

              <div>
                <span className="block font-medium mb-1">Type of Card *</span>
                <div className="space-y-1">
                  {/* Campus Card = false */}
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`creditCard-${index}`} // unique per receipt
                      value="false"
                      checked={receipt.creditCard === false}
                      onChange={() =>
                        handleReceiptChange(index, 'creditCard', false)
                      }
                      required
                    />
                    <span>Campus Card</span>
                  </label>

                  {/* Credit Card = true */}
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`creditCard-${index}`}
                      value="true"
                      checked={receipt.creditCard === true}
                      onChange={() =>
                        handleReceiptChange(index, 'creditCard', true)
                      }
                    />
                    <span>Credit Card</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-medium">Date Purchased *</label>
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
                <label className="block font-medium">Tax *</label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={showNumOrEmpty(receipt.tax)}
                  onChange={(e) =>
                    handleReceiptChange(
                      index,
                      'tax',
                      parseNumOrEmpty(e.target.value)
                    )
                  }
                  required
                  className="w-full border border-gray-300 rounded p-2"
                />
              </div>

              <div>
                <label className="block font-medium">Total *</label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={showNumOrEmpty(receipt.total)}
                  onChange={(e) =>
                    handleReceiptChange(
                      index,
                      'total',
                      parseNumOrEmpty(e.target.value)
                    )
                  }
                  required
                  className="w-full border border-gray-300 rounded p-2"
                />
              </div>

              <div>
                <label className="block font-medium">Receipt Upload *</label>
                <input
                  type="file"
                  onChange={(e) => handleReceiptChange(index, 'receipt', e)}
                  required
                  className="block mt-1"
                />
              </div>

              <div>
                <label className="block font-medium">Comments (optional)</label>
                <textarea
                  value={receipt.comment}
                  onChange={(e) =>
                    handleReceiptChange(index, 'comment', e.target.value)
                  }
                  placeholder="Any special instructions or notes about your purchase..."
                  className="w-full border border-gray-300 rounded p-2 resize-y min-h-[100px]"
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

      {/* Confirmation modal when a student submits their form */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md text-center shadow-lg">
            <h2 className="text-xl font-semibold text-byuNavy mb-4">
              Order Submitted
            </h2>
            <p className="text-gray-700">
              Your order was successfully submitted. Reach out to the ECE
              secretaries (ecen_secretaries@byu.edu) with any questions.
            </p>
            <button
              onClick={() => setShowConfirmModal(false)}
              className="mt-6 px-4 py-2 bg-byuRoyal text-white rounded hover:bg-[#003a9a]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ReceiptSubmitForm;
