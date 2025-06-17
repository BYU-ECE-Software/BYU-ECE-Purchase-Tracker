import type { LineMemoOption } from '../types/lineMemoOption';
import type { Order } from '../types/order';

const BASE_API_URL = 'http://localhost:4000/api';

export const fetchOrders = async (): Promise<Order[]> => {
  const res = await fetch(`${BASE_API_URL}/orders`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return await res.json();
};

export const createOrder = async (
  orderData: Partial<Order>
): Promise<Order> => {
  const res = await fetch(`${BASE_API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });

  if (!res.ok) throw new Error('Failed to create order');

  return await res.json();
};

export const fetchLineMemoOptions = async (): Promise<LineMemoOption[]> => {
  const res = await fetch(`${BASE_API_URL}/lineMemoOptions`);
  if (!res.ok) throw new Error('Failed to fetch line memo options');
  return await res.json();
};
