//contains all api calls used throughout the frontend

import type { LineMemoOption } from '../types/lineMemoOption';
import type { Order, OrderUpdatePayload } from '../types/order';
import type { Professor } from '../types/professor';

//base api url used in every call
const BASE_API_URL = 'http://localhost:4000/api';

// API Call to Fetch all Orders
export const fetchOrders = async (): Promise<Order[]> => {
  const res = await fetch(`${BASE_API_URL}/orders`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return await res.json();
};

// API Call to Create a new Order
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

// API Call to Edit an Order
export const updateOrder = async (
  orderId: number,
  updatedData: OrderUpdatePayload
): Promise<Order> => {
  const res = await fetch(`${BASE_API_URL}/orders/${orderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData),
  });

  if (!res.ok) throw new Error('Failed to update order');

  return await res.json();
};

// API Call to Fetch all Line Memo Options
export const fetchLineMemoOptions = async (): Promise<LineMemoOption[]> => {
  const res = await fetch(`${BASE_API_URL}/lineMemoOptions`);
  if (!res.ok) throw new Error('Failed to fetch line memo options');
  return await res.json();
};

//API Call to Fetch all Professors
export const fetchProfessors = async (): Promise<Professor[]> => {
  const res = await fetch(`${BASE_API_URL}/professors`);
  if (!res.ok) throw new Error('Failed to fetch professors');
  return await res.json();
};

// API call to Search Orders
export const searchOrders = async (query: string): Promise<Order[]> => {
  const res = await fetch(
    `${BASE_API_URL}/orders/search?query=${encodeURIComponent(query)}`
  );
  if (!res.ok) throw new Error('Failed to search orders');
  return await res.json();
};
