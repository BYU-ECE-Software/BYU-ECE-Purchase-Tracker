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
type FetchOrdersOptions = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  status?: string;
  query?: string;
  date?: string;
};

export const fetchOrders = async (
  options: FetchOrdersOptions = {}
): Promise<{
  data: Order[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}> => {
  const {
    page = 1,
    pageSize = 25,
    sortBy = 'requestDate',
    order = 'desc',
    status,
    query,
    date,
  } = options;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    sortBy,
    order,
  });

  // Filter by a certain status if one has been selected
  if (status) queryParams.append('status', status);

  // Filter by search query if one has been entered
  if (query) queryParams.append('query', query);

  // Filter by date (requested or purchased) if one has been selected
  if (date) queryParams.append('date', date);

  const res = await fetch(`${BASE_API_URL}/orders?${queryParams.toString()}`);
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

// Update a spend category
export const updateSpendCategory = async (
  id: number,
  updatedData: Partial<SpendCategory>
): Promise<SpendCategory> => {
  const res = await fetch(`${BASE_API_URL}/spendCategories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData),
  });

  if (!res.ok) throw new Error('Failed to update spend category');
  return res.json();
};

// Delete a spend category
export const deleteSpendCategory = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE_API_URL}/spendCategories/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) throw new Error('Failed to delete spend category');
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

// Create a new line memo option
export const createLineMemo = async (
  newOption: LineMemoOption
): Promise<LineMemoOption> => {
  const res = await fetch(`${BASE_API_URL}/lineMemoOptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newOption),
  });

  if (!res.ok) throw new Error('Failed to create line memo option');
  return res.json();
};

// Update a line memo option
export const updateLineMemo = async (
  id: number,
  updatedData: Partial<LineMemoOption>
): Promise<LineMemoOption> => {
  const res = await fetch(`${BASE_API_URL}/lineMemoOptions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData),
  });

  if (!res.ok) throw new Error('Failed to update line memo option');
  return res.json();
};

// Delete a line memo option
export const deleteLineMemo = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE_API_URL}/lineMemoOptions/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) throw new Error('Failed to delete line memo option');
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

// Create a new professor
export const createProfessor = async (
  newProfessor: Omit<Professor, 'id'>
): Promise<Professor> => {
  const res = await fetch(`${BASE_API_URL}/professors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newProfessor),
  });

  if (!res.ok) throw new Error('Failed to create professor');
  return res.json();
};

// Update a professor
export const updateProfessor = async (
  id: number,
  updatedData: Partial<Professor>
): Promise<Professor> => {
  const res = await fetch(`${BASE_API_URL}/professors/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData),
  });

  if (!res.ok) throw new Error('Failed to update professor');
  return res.json();
};

// Delete a professor
export const deleteProfessor = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE_API_URL}/professors/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) throw new Error('Failed to delete professor');
};
