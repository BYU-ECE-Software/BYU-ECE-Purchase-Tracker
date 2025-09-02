import React, { useEffect, useState } from 'react';
import type { Order } from '../types/order';
import { fetchOrdersByUser } from '../api/purchaseTrackerApi';
import StudentOrderCard from './StudentOrderCard';
import { getStatusColor } from '../utils/getStatusColor';

const StudentOrderHistoryList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = 3; // Replace with dynamic value when auth is set up

  const statusLabels = [
    'Requested',
    'Purchased',
    'Completed',
    'Returned',
    'Cancelled',
  ];

  const total = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const statusCounts = orders.reduce(
    (acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  useEffect(() => {
    fetchOrdersByUser(userId)
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load your orders.');
        setLoading(false);
      });
  }, []);

  if (loading)
    return <p className="text-center text-gray-500">Loading orders...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (orders.length === 0)
    return <p className="text-center text-gray-500">You have no orders yet.</p>;

  return (
    <div className="flex flex-col lg:flex-row gap-8 px-6 py-10">
      {/* Left column: Overview */}
      <div className="lg:w-1/4 w-full">
        <div className="sticky top-40 bg-[#F6F6F8] border border-gray-200 rounded-xl p-6 text-byuNavy shadow-[0_0_8px_rgba(0,46,93,0.1)]">
          <div className="absolute top-0 bottom-0 left-0 w-1 bg-byuNavy rounded-l-xl"></div>
          <div className="mb-4 text-lg font-bold">
            {orders[0]?.user.fullName}
            <span>'s Purchase Overview</span>
          </div>

          {/* Totals */}
          <div className="flex flex-col gap-2 mb-4 text-base">
            <div>
              <span className="font-medium">Total Orders:</span> {orders.length}
            </div>
            <div>
              <span className="font-medium">Total Spent:</span> $
              {total.toFixed(2)}
            </div>
          </div>

          <hr className="border-gray-300 mb-4" />

          {/* Status counts */}
          <div className="flex flex-col gap-5 text-byuNavy text-base">
            {statusLabels.map((status) => (
              <div key={status} className="flex items-center justify-between">
                <span className="w-24 font-medium">{status}:</span>
                <span
                  className={`min-w-[2rem] text-center px-2 py-1 rounded-full text-sm font-bold leading-5 ${getStatusColor(
                    status
                  )}`}
                >
                  {statusCounts[status] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right column: Cards */}
      <div className="lg:w-3/4 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {orders.map((order) => (
            <StudentOrderCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentOrderHistoryList;
