import React, { useEffect, useRef, useState } from 'react';
import type { Item } from '../types/item';
import type { Order } from '../types/order';
import type { Professor } from '../types/professor';
import type { LineMemoOption } from '../types/lineMemoOption';
import type { SpendCategory } from '../types/spendCategory';
import AddSpendCategoryModal from './addSpendCategoryModal';
import Toast from './Toast';
import type { ToastProps } from '../types/toast';
import {
  getSignedItemFileUrl,
  getSignedReceiptUrl,
} from '../api/purchaseTrackerApi';

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
  onSave: (newReceipts: File[], deletedReceipts: string[]) => void;
  markComplete: boolean;
  setMarkComplete: React.Dispatch<React.SetStateAction<boolean>>;
}

// Dropdown options for item status
const statusOptions = [
  'Requested',
  'Purchased',
  'Completed',
  'Returned',
  'Cancelled',
];

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
  markComplete,
  setMarkComplete,
}) => {
  // State to track which tab is currently active in the modal ("items" or "orderInfo")
  const [activeTab, setActiveTab] = React.useState<'items' | 'purchase'>(
    'items'
  );

  // State for "Mark all as Purchased" toggle (local to this modal)
  const [markAllPurchased, setMarkAllPurchased] = useState(false);

  // State for receipt files
  const [newReceipts, setNewReceipts] = useState<File[]>([]);
  const [deletedReceipts, setDeletedReceipts] = useState<string[]>([]);

  // State for the Add Spend Category Modal open/close
  const [isSCModalOpen, setIsSCModalOpen] = React.useState(false);

  //State to update spend categories
  const [localSpendCategories, setLocalSpendCategories] =
    React.useState(spendCategories);

  // State to control whether the Line Memo dropdown is shown.
  const [showLineMemo, setShowLineMemo] = React.useState(
    !!order.lineMemoOptionId
  );

  // Ref to the Line Memo dropdown <select> element, used for focusing when it's shown.
  const lineMemoRef = useRef<HTMLSelectElement>(null);

  // Toast State
  const [toast, setToast] = useState<Omit<
    ToastProps,
    'onClose' | 'duration'
  > | null>(null);

  // When the Line Memo dropdown becomes visible, automatically focus it for better UX.
  useEffect(() => {
    if (showLineMemo && lineMemoRef.current) {
      lineMemoRef.current.focus();
    }
  }, [showLineMemo]);

  // Required fields (not allowed to be cleared)
  const REQUIRED_FIELDS = [
    { key: 'professorId', label: 'Professor', section: 'purchase' as const },
    {
      key: 'spendCategoryId',
      label: 'Spend Category',
      section: 'purchase' as const,
    },
    { key: 'workTag', label: 'Work Tag', section: 'purchase' as const },
    { key: 'vendor', label: 'Vendor', section: 'purchase' as const },
    { key: 'purpose', label: 'Purpose', section: 'purchase' as const },
  ];

  // Helper + guarded save. To make sure all required fields are filled before actually saving
  const attemptSave = () => {
    const missing = REQUIRED_FIELDS.filter(({ key }) => {
      const v = (order as any)[key];
      return (
        v === null ||
        v === undefined ||
        (typeof v === 'string' && v.trim() === '')
      );
    });

    if (missing.length) {
      const first = missing[0];
      // switch to the tab that contains the first missing field
      if (first.section !== activeTab) setActiveTab(first.section);

      // focus the first missing field
      setTimeout(() => {
        const el = document.getElementById(
          `order-${first.key}`
        ) as HTMLElement | null;
        el?.focus();
      }, 0);

      // your existing toast UI
      setToast({
        type: 'error',
        title: 'Missing required fields',
        message: `Please fill: ${missing.map((m) => m.label).join(', ')}`,
      });
      return;
    }

    // all good → call your existing save
    onSave(newReceipts, deletedReceipts);
  };

  // Function to change all item status's to "completed" when toggled and "ordered" when toggled off
  const handleToggleComplete = () => {
    const newValue = !markComplete;
    setMarkComplete(newValue);

    if (items.length > 0) {
      const newStatus = newValue ? 'Completed' : 'Purchased';
      items.forEach((_, idx) => onItemStatusChange(idx, newStatus));
    } else {
      // Optional: update order status if no items (frontend-only)
      onOrderFieldChange('status', newValue ? 'Completed' : 'Purchased');
    }
  };

  // Toggle to mark all items as "Purchased"
  const handleTogglePurchased = () => {
    const newValue = !markAllPurchased;
    setMarkAllPurchased(newValue);

    // If we are marking all as Purchased, clear "Completed" toggle
    if (newValue && markComplete) {
      setMarkComplete(false);
    }

    if (items.length > 0) {
      const newStatus = newValue ? 'Purchased' : 'Requested';

      items.forEach((_, idx) => {
        onItemStatusChange(idx, newStatus);
      });
    } else {
      // If there are no items, just set the order status directly (frontend-only)
      onOrderFieldChange('status', newValue ? 'Purchased' : 'Requested');
    }
  };

  // Keep "Mark all as Purchased" toggle in sync with current item/order status
  useEffect(() => {
    if (!isOpen) return;

    if (items.length > 0) {
      // Toggle ON if every item is currently Purchased
      const allPurchased = items.every((item) => item.status === 'Purchased');
      setMarkAllPurchased(allPurchased);
    } else {
      // No items → fall back to overall order status
      setMarkAllPurchased(order.status === 'Purchased');
    }
  }, [isOpen, items, order.status]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 relative overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-lg"
        >
          ✕
        </button>

        <div className="flex justify-between items-center mb-4 pt-6">
          <h2 className="text-2xl font-bold text-byuNavy">Edit Order</h2>
          {/* User can mark the order as completed */}
          <div className="flex items-center space-x-2">
            <label
              htmlFor="mark-complete"
              className="text-base text-byuNavy font-medium"
            >
              Mark Order as Completed
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
            {/* Order Status */}
            {items.length === 0 && (
              <label className="flex items-center gap-2 font-semibold">
                Order Status:
                <select
                  value={order.status}
                  onChange={(e) => onOrderFieldChange('status', e.target.value)}
                  className="font-normal text-byuNavy border rounded px-2 py-1"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {/* Vendor */}
            <div className="flex items-start gap-2 text-sm">
              <span className="font-semibold text-byuNavy">Vendor:</span>
              <span className="">{order.vendor ?? ''}</span>
            </div>

            {/* Shipping Preference */}
            {order.shippingPreference && (
              <div className="flex items-start gap-2 text-sm">
                <span className="font-semibold">Shipping Preference:</span>
                <span>{order.shippingPreference}</span>
              </div>
            )}

            {/* Cart Link */}
            {order.cartLink && (
              <div className="flex items-start gap-2 text-sm">
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

            {items.length > 0 && (
              <div className="flex justify-end pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-byuNavy">
                    Mark all Items as Purchased
                  </span>
                  <button
                    onClick={handleTogglePurchased}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      markAllPurchased ? 'bg-byuRoyal' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        markAllPurchased ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
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
                    Item Status:
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
                    Attached File:{' '}
                    <button
                      onClick={async () => {
                        try {
                          const res = await getSignedItemFileUrl(
                            item.id,
                            item.file!
                          );
                          window.open(res, '_blank');
                        } catch (err) {
                          alert('Failed to open file.');
                          console.error(err);
                        }
                      }}
                      className="text-byuRoyal hover:underline ml-1"
                    >
                      View File
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Comments */}
            {order.comment && (
              <div className="py-2">
                <span className="block text-sm font-medium text-byuNavy mb-1">
                  Student Comments:
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
                id="order-professorId"
                value={order.professorId ?? ''}
                onChange={(e) =>
                  onOrderFieldChange('professorId', parseInt(e.target.value))
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
            <div className="flex items-center justify-between pt-0 pb-3 border-b border-gray-200 gap-4">
              <div className="flex flex-col w-1/2">
                <label className="text-sm font-medium text-byuNavy">
                  Work Tag
                </label>
                <input
                  id="order-workTag"
                  type="text"
                  value={order.workTag ?? ''}
                  onChange={(e) =>
                    onOrderFieldChange('workTag', e.target.value)
                  }
                  className="p-2 border rounded text-sm text-byuNavy w-full"
                />
              </div>

              <div className="flex flex-col w-1/2">
                <label className="text-sm font-medium text-byuNavy">
                  Spend Category
                </label>
                <select
                  id="order-spendCategoryId"
                  value={order.spendCategoryId ?? ''}
                  onChange={(e) => {
                    if (e.target.value === 'add-new') {
                      setIsSCModalOpen(true);
                    } else {
                      onOrderFieldChange(
                        'spendCategoryId',
                        parseInt(e.target.value)
                      );
                    }
                  }}
                  className="p-2 border rounded text-sm text-byuNavy w-full"
                >
                  <option value="" disabled hidden>
                    Select a spend category
                  </option>
                  {localSpendCategories.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.code} - {sc.description}
                    </option>
                  ))}
                  <option value="add-new">+ Add new Spend Category</option>
                </select>
              </div>
            </div>

            {/* Line Memo Row */}
            {showLineMemo ? (
              <div className="flex items-center justify-between pt-0 pb-3 border-b border-gray-200">
                <label className="text-sm font-medium text-byuNavy">
                  Line Memo
                </label>
                <div className="flex gap-2">
                  <select
                    ref={lineMemoRef}
                    value={order.lineMemoOptionId ?? ''}
                    onChange={(e) =>
                      onOrderFieldChange(
                        'lineMemoOptionId',
                        parseInt(e.target.value)
                      )
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
                  <button
                    onClick={() => {
                      onOrderFieldChange('lineMemoOptionId', null);
                      setShowLineMemo(false);
                    }}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end pt-0 pb-3">
                <button
                  onClick={() => setShowLineMemo(true)}
                  className="text-sm text-byuRoyal hover:underline"
                >
                  + Add Line Memo
                </button>
              </div>
            )}

            {/* Row: Purpose */}
            <div className="flex items-center justify-between pt-0 pb-3 border-b border-gray-200">
              <label className="text-sm font-medium text-byuNavy">
                Purpose
              </label>
              <input
                id="order-purpose"
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
                {/* Campus Card = false */}
                <label className="flex items-center gap-2 text-sm text-byuNavy">
                  <input
                    type="radio"
                    name="creditCard"
                    value="false"
                    checked={order.creditCard === false}
                    onChange={() => onOrderFieldChange('creditCard', false)}
                  />
                  Campus Card
                </label>

                {/* Credit Card = true */}
                <label className="flex items-center gap-2 text-sm text-byuNavy">
                  <input
                    type="radio"
                    name="creditCard"
                    value="true"
                    checked={order.creditCard === true}
                    onChange={() => onOrderFieldChange('creditCard', true)}
                  />
                  Credit Card
                </label>
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
                id="order-vendor"
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

            {/* Row: Receipts */}
            <div className="flex items-start justify-between pt-0 pb-3 border-b border-gray-200">
              {/* Fixed-width label on the left */}
              <label className="text-sm font-medium text-byuNavy w-1/2 pt-1">
                Receipts
              </label>

              {/* Right side: content area aligned with other form fields */}
              <div className="w-1/2 space-y-3">
                {/* Existing Files */}
                {order.receipt && order.receipt.length > 0 ? (
                  <ul className="space-y-1">
                    {order.receipt
                      .filter((filename) => !deletedReceipts.includes(filename)) // hide deleted ones
                      .map((filename, index) => (
                        <li
                          key={index}
                          className="flex items-center text-sm gap-2 w-full"
                        >
                          {/* View button on the left, outside the outlined pill */}
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const url = await getSignedReceiptUrl(
                                  order.id,
                                  filename
                                );
                                window.open(url, '_blank');
                              } catch (err) {
                                console.error('Failed to open receipt', err);
                                alert('Failed to open receipt.');
                              }
                            }}
                            className="text-byuRoyal hover:underline whitespace-nowrap shrink-0"
                          >
                            View
                          </button>

                          {/* Outlined pill with filename + trash icon on the right */}
                          <div className="flex items-center justify-between bg-gray-50 border rounded px-3 py-2 flex-1 min-w-0">
                            <span className="truncate text-gray-800">
                              {filename}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setDeletedReceipts((prev) => [
                                  ...prev,
                                  filename,
                                ])
                              }
                              className="ml-2 text-sm text-byuRedBright hover:text-byuRedDark shrink-0"
                              title="Delete receipt"
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
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic"></p>
                )}

                {/* New Files */}
                {newReceipts.length > 0 && (
                  <ul className="space-y-1">
                    {newReceipts.map((file, idx) => (
                      <li
                        key={idx}
                        className="flex items-center text-sm gap-2 w-full"
                      >
                        {/* View new (unsaved) receipt */}
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              const url = URL.createObjectURL(file);
                              window.open(url, '_blank');

                              // Optional: clean up after a bit
                              setTimeout(() => {
                                URL.revokeObjectURL(url);
                              }, 60_000);
                            } catch (err) {
                              console.error(
                                'Failed to preview receipt file',
                                err
                              );
                              alert('Failed to preview receipt.');
                            }
                          }}
                          className="text-byuRoyal hover:underline whitespace-nowrap shrink-0"
                        >
                          View
                        </button>

                        {/* Outlined pill with filename + trash */}
                        <div className="flex items-center justify-between bg-gray-50 border rounded px-3 py-2 flex-1 min-w-0">
                          <span className="truncate text-gray-800">
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setNewReceipts((prev) =>
                                prev.filter((_, fileIdx) => fileIdx !== idx)
                              )
                            }
                            className="text-[#E61744] hover:text-[#A3082A] ml-2 shrink-0"
                            title="Remove file"
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
                      </li>
                    ))}
                  </ul>
                )}

                {/* Upload Button */}
                {/* Upload Button aligned to right */}
                <div className="flex justify-end">
                  <label
                    htmlFor="receipt-upload"
                    className="inline-block cursor-pointer border border-byuNavy bg-gray-100 text-sm text-byuNavy px-3 py-1 rounded shadow-sm hover:bg-gray-200 transition"
                  >
                    {newReceipts.length === 0
                      ? 'Add Receipt'
                      : 'Add Another Receipt'}
                    <input
                      id="receipt-upload"
                      type="file"
                      multiple
                      onChange={(e) => {
                        const fileList = e.target.files;
                        if (fileList) {
                          setNewReceipts((prev) => [
                            ...prev,
                            ...Array.from(fileList),
                          ]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Row: Comments */}
            <div className="pt-0 pb-3">
              <label className="text-sm font-medium text-byuNavy">
                Secretary Comments
              </label>
              <textarea
                value={order.adminComment ?? ''}
                onChange={(e) =>
                  onOrderFieldChange('adminComment', e.target.value)
                }
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
            onClick={attemptSave}
            className="px-4 py-2 bg-byuRoyal text-white rounded hover:bg-[#003a9a]"
          >
            Save Changes
          </button>
        </div>

        {/* Add Spend Category Modal */}
        <AddSpendCategoryModal
          isOpen={isSCModalOpen}
          onClose={() => setIsSCModalOpen(false)}
          onCreate={(newCategory) => {
            setLocalSpendCategories([...localSpendCategories, newCategory]);
            onOrderFieldChange('spendCategoryId', newCategory.id); // select the newly created one
            setIsSCModalOpen(false);

            setToast({
              type: 'success',
              title: 'Spend Category Added',
              message: `“${newCategory.code}” was created successfully.`,
            });
          }}
          setToast={setToast}
        />
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in-out">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </div>
  );
};

export default EditOrderModal;
