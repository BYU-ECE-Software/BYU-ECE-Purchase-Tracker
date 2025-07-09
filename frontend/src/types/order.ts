import type { User } from './user';
import type { Professor } from './professor';
import type { LineMemoOption } from './lineMemoOption';
import type { Item } from './item';
import type { SpendCategory } from './spendCategory';

export interface Order {
  id: number;
  requestDate: string;
  vendor: string;
  shippingPreference?: string;
  professorId: number;
  professor: Professor;
  purpose: string;
  operatingUnit: string;
  spendCategoryId: number;
  spendCategory: SpendCategory;
  tax?: number;
  total?: number;
  userId: number;
  user: User;
  items: Item[];
  lineMemoOptionId: number;
  lineMemoOption: LineMemoOption;
  cardType?: string;
  purchaseDate?: string;
  receipt?: string;
  status: string;
  comment?: string;
  cartLink?: string;
}

export interface OrderUpdatePayload {
  [key: string]: any;
  items?: { id: number; [key: string]: any }[];
}
