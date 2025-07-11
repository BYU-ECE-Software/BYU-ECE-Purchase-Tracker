import React, { useEffect, useState } from 'react';
import type { Order } from '../types/order';
import { fetchOrdersByUser } from '../api/purchaseTrackerApi';
import StudentOrderCard from './StudentOrderCard';

const StudentOrderHistoryList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = 2; // Replace with dynamic value when auth is set up

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
    <div className="px-6 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {orders.map((order) => (
          <StudentOrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
};

export default StudentOrderHistoryList;
