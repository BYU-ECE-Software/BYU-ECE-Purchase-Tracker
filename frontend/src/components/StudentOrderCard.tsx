import React, { useState } from 'react';
import type { Order } from '../types/order';
import { getStatusColor } from '../utils/getStatusColor';
import { formatDate } from '../utils/formatDate';
import { getSignedReceiptUrl } from '../api/purchaseTrackerApi';

type Props = {
  order: Order;
};

const StudentOrderCard: React.FC<Props> = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  const statusColor = getStatusColor(order.status);

  return (
    <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col justify-between transition hover:shadow-md text-byuNavy">
      {/* Status badge */}
      <div className="mb-2">
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor}`}
        >
          {order.status.toUpperCase()}
        </span>
      </div>

      {/* Vendor */}
      <h2 className="text-md font-bold mb-2">{order.vendor}</h2>

      {/* Item List */}
      {order.items.length > 0 && (
        <div className="mb-3">
          <ul className="text-sm list-disc list-inside space-y-1">
            {order.items.map((item) => (
              <li key={item.id}>
                {item.link ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-byuRoyal hover:underline font-medium"
                  >
                    {item.name}
                  </a>
                ) : (
                  <span className="font-medium">{item.name}</span>
                )}
                {item.quantity > 1 && <span> x{item.quantity} </span>}
                <span> ({item.status})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Date Submitted Row */}
      <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-3 mt-auto">
        <div>
          <div className="font-medium">Date Submitted</div>
          <div>{formatDate(order.requestDate)}</div>
        </div>
      </div>

      {/* Purchase Date/Total Row */}
      {order.purchaseDate && (
        <div className="flex justify-between items-center text-sm pt-3 mt-auto">
          <div>
            <div className="font-medium">Date Purchased</div>
            <div>{formatDate(order.purchaseDate)}</div>
          </div>

          <div>
            <div className="font-medium">Total</div>
            <div>${order.total}</div>
          </div>
        </div>
      )}

      {/* Expand/Collapse Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 text-sm text-byuRoyal font-semibold hover:underline self-start"
      >
        {expanded ? 'Hide Details' : 'More Details'}
      </button>

      {expanded && (
        <div className="mt-4 border-t pt-4 text-sm space-y-2">
          {order.shippingPreference && (
            <div>
              <span className="font-medium">Shipping:</span>{' '}
              {order.shippingPreference || '—'}
            </div>
          )}
          <div>
            <span className="font-medium ">Professor:</span>{' '}
            {order.professor.title} {order.professor.firstName}{' '}
            {order.professor.lastName}
          </div>
          <div>
            <span className="font-medium">Funding Code:</span> {order.workTag}-
            {order.spendCategory.code}
          </div>
          <div>
            <span className="font-medium">Purpose:</span> {order.purpose}
          </div>
          {order.tax && (
            <div>
              <span className="font-medium">Tax:</span>
              {' $'}
              {order.tax}
            </div>
          )}
          {order.total && (
            <div>
              <span className="font-medium">Total:</span>
              {' $'}
              {order.total}
            </div>
          )}
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
                    className="text-byuRoyal hover:underline mr-2"
                  >
                    View Receipt{showIndex}
                  </button>
                );
              })
            : '—'}
          {order.comment && (
            <div>
              <span className="font-medium">Comment:</span> {order.comment}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentOrderCard;
