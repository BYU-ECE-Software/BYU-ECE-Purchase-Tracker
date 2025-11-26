import type { NewItemPayload } from './newItem';

export interface NewOrderPayload {
  // panic mode user fields
  fullName: string;
  byuNetId: string;
  email: string;

  vendor: string;
  shippingPreference?: string;
  professorId: number;
  purpose: string;
  workTag: string;
  spendCategoryId: number;
  lineMemoOptionId?: number;
  status: string;
  comment?: string;
  cartLink?: string;
  adminComment?: string;
  items: NewItemPayload[];
  purchasedById?: number;

  // Receipt-specific fields only on receipt submission
  creditCard?: boolean;
  purchaseDate?: string;
  receipt?: File[];
  tax?: number;
  total?: number;
}
