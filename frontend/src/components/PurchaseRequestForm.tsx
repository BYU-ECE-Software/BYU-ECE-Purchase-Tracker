import { useState, useEffect } from 'react';
import {
  createOrder,
  fetchProfessors,
  fetchStudentSpendCategories,
} from '../api/purchaseTrackerApi';
import type { Professor } from '../types/professor';
import type { SpendCategory } from '../types/spendCategory';

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

  // State for order-level info
  const [fullName, setFullName] = useState('');
  const [byuNetId, setByuNetId] = useState('');
  const [email, setEmail] = useState('');
  const [vendor, setVendor] = useState('');
  const [shipping, setShipping] = useState('');
  const [purpose, setPurpose] = useState('');
  const [workTag, setWorkTag] = useState('');
  const [selectedSpendCategoryId, setSelectedSpendCategoryId] = useState('');
  const [cartLink, setCartLink] = useState('');
  const [comment, setComment] = useState('');
  const [selectedProfessorId, setSelectedProfessorId] = useState('');

  // State for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // State to track 'other' spend category
  const [customSpendCategory, setCustomSpendCategory] = useState('');
  const [selectedSpendCategoryCode, setSelectedSpendCategoryCode] =
    useState('');

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
  const parseIntOrEmpty = (s: string) =>
    s === '' ? ('' as any) : parseInt(s, 10);

  // Map state value -> input value (never let the input see NaN) for tax and total
  const showNumOrEmpty = (n: any) => (Number.isFinite(n) ? n : '');

  // Handle changes to any item field (including file)
  const handleItemChange = <key extends keyof PurchaseItem>(
    index: number,
    field: key,
    value: PurchaseItem[key] | React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedItems = [...items];
    const updatedItem = { ...updatedItems[index] };

    if (field === 'file') {
      updatedItem[field] = (value as React.ChangeEvent<HTMLInputElement>).target
        .files?.[0] as PurchaseItem[key];
    } else {
      updatedItem[field] = value as PurchaseItem[key];
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

    // User must have entered either a cart link or an item and quantity before it will submit
    const hasCartLink = cartLink.trim() !== '';

    const hasValidItem = items.some(
      (item) => item.item.trim() !== '' && item.quantity > 0
    );

    if (!hasCartLink && !hasValidItem) {
      alert(
        'Please provide either a cart link or at least one item with name and quantity.'
      );
      return;
    }

    try {
      await createOrder({
        fullName,
        byuNetId,
        email,
        vendor,
        shippingPreference: shipping,
        professorId: Number(selectedProfessorId),
        purpose,
        workTag,
        spendCategoryId: Number(selectedSpendCategoryId),
        status: 'Requested',
        comment:
          selectedSpendCategoryCode === 'Other'
            ? `Spend Category: ${customSpendCategory}\n${comment}`
            : comment,
        cartLink,
        items: items
          .filter((i) => i.item.trim() !== '')
          .map((i) => ({
            name: i.item,
            quantity: i.quantity,
            status: 'Requested',
            link: i.link,
            file: i.file,
          })),
      });

      setShowConfirmModal(true);
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Error submitting request.');
    }
  };

  // Purchase Request Form Rendering
  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto mt-4 mb-8 p-6 bg-white shadow-md rounded-md space-y-6"
      >
        <div className="text-byuNavy space-y-8">
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

          {/* Order details */}
          <h2 className="text-2xl text-byuNavy font-semibold mb-4">
            Order Details
          </h2>

          <div>
            <label className="block font-medium">Vendor *</label>
            <input
              type="text"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              required
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>

          <div>
            <span className="block font-medium mb-1">Shipping Preference</span>
            <span className="block text-sm mb-2">
              Please note that while we’ll do our best to meet your preference,
              delivery dates aren’t guaranteed.
            </span>
            <div className="space-y-1">
              {[
                'Overnight / Next Day',
                'Standard',
                'Economy / Lowest Cost',
                'No Preference',
              ].map((option) => (
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
          <div className="space-y-2">
            <h2 className="text-2xl text-byuNavy font-semibold">Items</h2>

            <h2 className="text-base text-byuNavy">
              Please do one of the following: add a cart link or enter item
              details individually.
            </h2>
          </div>

          <div>
            <label className="block font-medium">Cart Link</label>
            <input
              type="url"
              value={cartLink}
              onChange={(e) => setCartLink(e.target.value)}
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>

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
                  className="w-full border border-gray-300 rounded p-2"
                />
              </div>

              <div>
                <label className="block font-medium">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={showNumOrEmpty(item.quantity)}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      'quantity',
                      parseIntOrEmpty(e.target.value)
                    )
                  }
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
          <div className="space-y-2">
            <h2 className="text-2xl text-byuNavy font-semibold">
              Funding Code
            </h2>

            <h2 className="text- text-byuNavy">
              Format: <br />
              Account Funding Code - Letters (GR, AC, CC, etc), followed by 5
              numbers. Ex. ACXXXXX <br />
              <br />
              Spend Category - Choose one of the following dropdown options or
              enter a different code manually
            </h2>
          </div>

          <div>
            <label className="block font-medium">Account Funding Code *</label>
            <input
              type="text"
              value={workTag}
              onChange={(e) => setWorkTag(e.target.value)}
              required
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>

          <div>
            <label className="block font-medium">Spend Category *</label>
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
              className="w-full border border-gray-300 rounded p-2"
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
              <label className="block font-medium">
                Custom Spend Category *
              </label>
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
            <label className="block font-medium">Professor/Staff *</label>
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
            <label className="block font-medium">Purpose * (be specific)</label>
            <span className="block text-sm mb-2">
              Note that Capstone purchases are to be done through the Capstone
              website, not here.
            </span>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>

          <div>
            <label className="block font-medium">Comments (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Any special instructions or notes about your request..."
              className="w-full border border-gray-300 rounded p-2 resize-y min-h-[100px]"
            />
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

      {/* Confirmation modal when a student submits their form */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md text-center shadow-lg">
            <h2 className="text-xl font-semibold text-byuNavy mb-4">
              Order Submitted
            </h2>
            <p className="text-gray-700">
              Your order was successfully submitted. It will be reviewed within
              2 business days. You can track the order status on your order
              history page. Reach out to the ECE secretaries
              (ecen_secretaries@byu.edu) with any questions.
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

export default PurchaseRequestForm;
