import type { NewItemPayload } from './newItem';

export interface NewOrderPayload {
  vendor: string;
  shippingPreference?: string;
  professorId: number;
  purpose: string;
  operatingUnit: string;
  spendCategoryId: number;
  userId: number;
  lineMemoOptionId?: number;
  status: string;
  comment?: string;
  cartLink?: string;
  items: NewItemPayload[];

  // Receipt-specific fields only on receipt submission
  cardType?: string;
  purchaseDate?: string;
  receipt?: string;
  tax?: number;
  total?: number;
}
