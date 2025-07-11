//contains all api calls used throughout the frontend

import type { LineMemoOption } from '../types/lineMemoOption';
import type { NewOrderPayload } from '../types/newOrder';
import type { Order, OrderUpdatePayload } from '../types/order';
import type { Professor } from '../types/professor';
import type {
  SpendCategory,
  NewSpendCategoryPayload,
} from '../types/spendCategory';

//base api url used in every call
const BASE_API_URL = 'http://localhost:4000/api';

// ==========================
//   Order API Calls
// ==========================

// Fetch all Orders
export const fetchOrders = async (): Promise<Order[]> => {
  const res = await fetch(`${BASE_API_URL}/orders`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return await res.json();
};

// Create a new Order
export const createOrder = async (
  orderData: NewOrderPayload
): Promise<Order> => {
  const res = await fetch(`${BASE_API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });

  if (!res.ok) throw new Error('Failed to create order');

  return await res.json();
};

// Edit an Order
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

// Search Orders
export const searchOrders = async (query: string): Promise<Order[]> => {
  const res = await fetch(
    `${BASE_API_URL}/orders/search?query=${encodeURIComponent(query)}`
  );
  if (!res.ok) throw new Error('Failed to search orders');
  return await res.json();
};

// Fetch Orders by student Id
export const fetchOrdersByUser = async (userId: number): Promise<Order[]> => {
  const res = await fetch(`${BASE_API_URL}/orders/user/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch user orders');
  return await res.json();
};

// ==========================
//   Spend Category API Calls
// ==========================

// Fetch all Spend Categories
export const fetchAllSpendCategories = async (): Promise<SpendCategory[]> => {
  const res = await fetch(`${BASE_API_URL}/spendCategories`);
  if (!res.ok) throw new Error('Failed to fetch spend categories');
  return await res.json();
};

// Fetch only the Spend Categories visible to students
export const fetchStudentSpendCategories = async (): Promise<
  SpendCategory[]
> => {
  const res = await fetch(`${BASE_API_URL}/spendCategories/studentVisible`);
  if (!res.ok) throw new Error('Failed to fetch spend categories');
  return await res.json();
};

// Create Spend Category
export const createSpendCategory = async (
  categoryData: NewSpendCategoryPayload
): Promise<SpendCategory> => {
  const res = await fetch(`${BASE_API_URL}/spendCategories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoryData),
  });

  if (!res.ok) throw new Error('Failed to create spend category');

  return await res.json();
};

// ==========================
//   Line Memo API Calls
// ==========================

// Fetch all Line Memo Options
export const fetchLineMemoOptions = async (): Promise<LineMemoOption[]> => {
  const res = await fetch(`${BASE_API_URL}/lineMemoOptions`);
  if (!res.ok) throw new Error('Failed to fetch line memo options');
  return await res.json();
};

// ==========================
//   Professor API Calls
// ==========================

// Fetch all Professors
export const fetchProfessors = async (): Promise<Professor[]> => {
  const res = await fetch(`${BASE_API_URL}/professors`);
  if (!res.ok) throw new Error('Failed to fetch professors');
  return await res.json();
};
