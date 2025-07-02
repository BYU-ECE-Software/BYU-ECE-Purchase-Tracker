import React, { useState } from 'react';
import type { Order } from '../types/order';

interface ViewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const ViewOrderModal: React.FC<ViewOrderModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const [activeTab, setActiveTab] = useState<'items' | 'purchase' | 'student'>(
    'items'
  );

  const formatDatePlain = (isoString: string): string => {
    const [year, month, day] = isoString.split('T')[0].split('-');
    return `${month}/${day}/${year}`;
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 relative overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-lg"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold text-byuNavy mb-4">Order Details</h2>

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
          <button
            onClick={() => setActiveTab('student')}
            className={`px-3 py-1 ${activeTab === 'student' ? 'border-b-2 border-byuNavy text-byuNavy font-semibold' : 'text-gray-500'}`}
          >
            Student Info
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

            {order.items.map((item) => (
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
                  <span className="text-sm text-gray-700">
                    Status: {item.status}
                  </span>
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

        {/* Purchase Info Tab */}
        {activeTab === 'purchase' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">
                Professor
              </span>
              <span className="text-sm text-gray-700">
                {order.professor?.title} {order.professor?.firstName}{' '}
                {order.professor?.lastName}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">
                Funding Code
              </span>
              <span className="text-sm text-gray-700">
                {order.operatingUnit}-{order.spendCategory.code}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">
                Line Memo
              </span>
              <span className="text-sm text-gray-700">
                {order.lineMemoOption?.id} - {order.lineMemoOption?.description}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Purpose</span>
              <span className="text-sm text-gray-700">
                {order.purpose || '-'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">
                Card Type
              </span>
              <span className="text-sm text-gray-700">
                {order.cardType || '—'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">
                Purchase Date
              </span>
              <span className="text-sm text-gray-700">
                {order.purchaseDate ? formatDatePlain(order.purchaseDate) : '—'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Vendor</span>
              <span className="text-sm text-gray-700">
                {order.vendor || '—'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Tax</span>
              <span className="text-sm text-gray-700">
                {order.tax != null ? `$${order.tax}` : '—'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Total</span>
              <span className="text-sm text-gray-700">
                {order.total != null ? `$${order.total}` : '—'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Receipt</span>
              <span className="text-sm text-gray-700">
                {order.receipt ? (
                  <span title={order.receipt}>{order.receipt}</span>
                ) : (
                  '—'
                )}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Total</span>
              <span className="text-sm text-gray-700">
                {order.total != null ? `$${order.total}` : '—'}
              </span>
            </div>

            {order.comment && (
              <div className="py-2 border-b border-gray-200">
                <span className="block text-sm font-medium text-byuNavy mb-1">
                  Comments:
                </span>
                <span className="block text-sm text-gray-700 whitespace-pre-wrap">
                  {order.comment || '—'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Student Info Tab */}
        {activeTab === 'student' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Name</span>
              <span className="text-sm text-gray-700">
                {order.user.firstName} {order.user.lastName}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">
                BYU Email
              </span>
              <span className="text-sm text-gray-700">{order.user.email}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">BYU ID</span>
              <span className="text-sm text-gray-700">{order.user.byuId}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Net ID</span>
              <span className="text-sm text-gray-700"></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewOrderModal;
