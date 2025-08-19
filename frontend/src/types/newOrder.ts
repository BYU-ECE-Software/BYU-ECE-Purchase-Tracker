import type { NewItemPayload } from './newItem';

export interface NewOrderPayload {
  vendor: string;
  shippingPreference?: string;
  professorId: number;
  purpose: string;
  workTag: string;
  spendCategoryId: number;
  userId: number;
  lineMemoOptionId?: number;
  status: string;
  comment?: string;
  cartLink?: string;
  items: NewItemPayload[];

  // Receipt-specific fields only on receipt submission
  creditCard?: boolean;
  purchaseDate?: string;
  receipt?: File[];
  tax?: number;
  total?: number;
}
