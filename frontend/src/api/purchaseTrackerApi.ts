import type { Order } from '../types/order';

const API_URL = 'http://localhost:4000/api/orders';

export const fetchOrders = async (): Promise<Order[]> => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return await res.json();
};

export const createOrder = async (
  orderData: Partial<Order>
): Promise<Order> => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });

  if (!res.ok) throw new Error('Failed to create order');

  return await res.json();
};
