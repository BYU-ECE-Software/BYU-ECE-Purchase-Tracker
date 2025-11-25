import React from 'react';
import type { Order } from '../types/order';
import { formatDate } from '../utils/formatDate';
import {
  getSignedReceiptUrl,
  getSignedItemFileUrl,
} from '../api/purchaseTrackerApi';

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
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center p-4">
      {/* Outer shell: rounded + overflow-hidden for nice corners */}
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg relative overflow-hidden">
        {/* Close button (stays in the header area) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-lg z-20"
        >
          ✕
        </button>

        {/* HEADER BAND (fixed, not scrolling) */}
        <div className="px-6 pt-5 pb-3  bg-white relative z-10">
          <h2 className="text-2xl font-bold text-byuNavy">Order Details</h2>
        </div>

        {/* SCROLLABLE CONTENT AREA */}
        <div className="px-6 pb-6 pt-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-6 text-byuNavy text-base">
            {/* ====================== ITEMS & OVERVIEW ====================== */}
            <section>
              <h3 className="text-lg font-semibold text-byuNavy mb-2">
                Items &amp; Overview
              </h3>
              <div className="space-y-2">
                {/* Order Status */}
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-byuNavy">
                    Order Status
                  </span>
                  <span className="text-sm text-gray-700">
                    {order.status ?? '—'}
                  </span>
                </div>

                {/* Shipping Preference */}
                {order.shippingPreference && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-byuNavy">
                      Shipping Preference
                    </span>
                    <span className="text-sm text-gray-700">
                      {order.shippingPreference}
                    </span>
                  </div>
                )}

                {/* Cart Link */}
                {order.cartLink && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-byuNavy">
                      Cart Link
                    </span>
                    <a
                      href={order.cartLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline text-byuRoyal font-semibold flex items-center gap-1"
                    >
                      Open Cart
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

                {/* Items header + list only if there are items */}
                {order.items && order.items.length > 0 && (
                  <>
                    {/* Items header */}
                    <div className="flex items-center justify-between pt-3 pb-1 border-b border-gray-200 mt-2">
                      <span className="text-sm font-medium text-byuNavy">
                        Items
                      </span>
                      <span className="text-xs text-gray-500">
                        {order.items.length}{' '}
                        {order.items.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    {/* Items list (more compact) */}
                    <div className="mt-2 space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="border border-gray-200 rounded-lg p-3 bg-gray-50 shadow-sm space-y-1"
                        >
                          {/* Item name with optional link */}
                          <div className="text-sm font-semibold text-byuNavy">
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
                                  className="h-3 w-3 text-byuRoyal"
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
                            <span className="text-xs sm:text-sm text-gray-700">
                              Qty: {item.quantity}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-700">
                              Status: {item.status}
                            </span>
                          </div>

                          {/* Optional file display */}
                          {item.file && (
                            <div className="text-xs sm:text-sm text-gray-600 break-all">
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
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* ====================== PURCHASE INFO ====================== */}
            <section>
              <h3 className="text-lg font-semibold text-byuNavy mb-2">
                Purchase Info
              </h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-byuNavy">
                    Vendor
                  </span>
                  <span className="text-sm text-gray-700">
                    {order.vendor || ''}
                  </span>
                </div>

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
                    {order.workTag}-{order.spendCategory.code}
                  </span>
                </div>

                {order.lineMemoOption && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-byuNavy">
                      Line Memo
                    </span>
                    <span className="text-sm text-gray-700">
                      {order.lineMemoOption.id} –{' '}
                      {order.lineMemoOption.description}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-byuNavy">
                    Purpose
                  </span>
                  <span className="text-sm text-gray-700">
                    {order.purpose || ''}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-byuNavy">
                    Card Type
                  </span>
                  <span className="text-sm text-gray-700">
                    {order.creditCard === true
                      ? 'Credit Card'
                      : order.creditCard === false
                        ? 'Campus Card'
                        : ''}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-byuNavy">
                    Purchase Date
                  </span>
                  <span className="text-sm text-gray-700">
                    {order.purchaseDate ? formatDate(order.purchaseDate) : ''}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-byuNavy">Tax</span>
                  <span className="text-sm text-gray-700">
                    {order.tax != null ? `$${order.tax}` : ''}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-byuNavy">
                    Total
                  </span>
                  <span className="text-sm text-gray-700">
                    {order.total != null ? `$${order.total}` : ''}
                  </span>
                </div>

                <div className="flex items-start justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-byuNavy mt-1">
                    Receipt
                  </span>
                  <div className="flex flex-col gap-1 text-sm text-gray-700">
                    {order.receipt && order.receipt.length > 0
                      ? order.receipt.map((filename, index) => {
                          const showIndex =
                            order.receipt!.length > 1 ? ` ${index + 1}` : '';
                          return (
                            <button
                              key={index}
                              onClick={async () => {
                                try {
                                  const res = await getSignedReceiptUrl(
                                    order.id,
                                    filename
                                  );
                                  window.open(res, '_blank');
                                } catch (err) {
                                  alert('Failed to open receipt.');
                                  console.error(err);
                                }
                              }}
                              className="text-byuRoyal hover:underline mr-2 text-left"
                            >
                              View Receipt{showIndex}
                            </button>
                          );
                        })
                      : ''}
                  </div>
                </div>
              </div>
            </section>
            {/* ====================== COMMENTS (IF ANY) ====================== */}
            {order.adminComment && (
              <>
                <section>
                  <h3 className="text-sm font-medium text-byuNavy">
                    Secretary Comments
                  </h3>
                  <div className="py-2">
                    <span className="block text-xs text-gray-700 whitespace-pre-wrap">
                      {order.adminComment}
                    </span>
                  </div>
                </section>

                <hr className="border-gray-200" />
              </>
            )}

            {order.comment && (
              <>
                <section>
                  <h3 className="text-sm font-medium text-byuNavy">
                    Student Comments
                  </h3>
                  <div className="py-2">
                    <span className="block text-xs text-gray-700 whitespace-pre-wrap">
                      {order.comment}
                    </span>
                  </div>
                </section>

                <hr className="border-gray-200" />
              </>
            )}
            {/* ====================== STUDENT INFO ====================== */}
            <section>
              <h3 className="text-lg font-semibold text-byuNavy mb-2">
                Student Info
              </h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-byuNavy">Name</span>
                  <span className="text-sm text-gray-700">
                    {order.user.fullName}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-byuNavy">
                    Email
                  </span>
                  <span className="text-sm text-gray-700">
                    {order.user.email}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-byuNavy">
                    BYU Net ID
                  </span>
                  <span className="text-sm text-gray-700">
                    {order.user.byuNetId}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOrderModal;
