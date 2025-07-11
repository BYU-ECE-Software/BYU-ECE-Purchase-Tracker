import React, { useState } from 'react';
import type { Order } from '../types/order';
import { getStatusColor } from '../utils/getStatusColor';

type Props = {
  order: Order;
};

const StudentOrderCard: React.FC<Props> = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  const statusColor = getStatusColor(order.status);
  const formattedDate = new Date(order.requestDate).toLocaleDateString();
  const totalDisplay = order.total
    ? `$${order.total.toFixed(2)}`
    : 'Not purchased yet';

  return (
    <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col justify-between transition hover:shadow-md">
      {/* Status badge */}
      <div className="mb-2">
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor}`}
        >
          {order.status.toUpperCase()}
        </span>
      </div>

      {/* Vendor */}
      <h2 className="text-md font-bold text-[#002E5D] mb-2">{order.vendor}</h2>

      {/* Item List */}
      {order.items.length > 0 && (
        <div className="mb-3">
          <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
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
                <span className="text-gray-500"> ({item.status})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Meta Info Row */}
      <div className="flex justify-between items-center text-sm text-gray-600 border-t border-gray-100 pt-3 mt-auto">
        <div>
          <div className="font-medium">Date</div>
          <div className="text-gray-500">{formattedDate}</div>
        </div>
        <div>
          <div className="font-medium">Total</div>
          <div className="text-gray-500">{totalDisplay}</div>
        </div>
      </div>

      {/* Expand/Collapse Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 text-sm text-[#0057B7] font-semibold hover:underline self-start"
      >
        {expanded ? 'Hide Details' : 'More Details'}
      </button>

      {expanded && (
        <div className="mt-4 border-t pt-4 text-sm text-gray-700 space-y-2">
          <div>
            <span className="font-medium text-gray-600">Purpose:</span>{' '}
            {order.purpose}
          </div>
          <div>
            <span className="font-medium text-gray-600">Shipping:</span>{' '}
            {order.shippingPreference || '—'}
          </div>
          <div>
            <span className="font-medium text-gray-600">Professor:</span>{' '}
            {order.professor.title} {order.professor.firstName}{' '}
            {order.professor.lastName}
          </div>
          <div>
            <span className="font-medium text-gray-600">Funding Code:</span>{' '}
            {order.operatingUnit}-{order.spendCategory.code}
          </div>
          {order.comment && (
            <div>
              <span className="font-medium text-gray-600">Comment:</span>{' '}
              {order.comment}
            </div>
          )}
          {order.receipt && (
            <div>
              <span className="font-medium text-gray-600">Receipt:</span>{' '}
              <span className="underline">{order.receipt}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentOrderCard;
