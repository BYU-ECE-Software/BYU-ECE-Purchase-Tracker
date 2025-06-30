import type { User } from './user';
import type { Professor } from './professor';
import type { LineMemoOption } from './lineMemoOption';
import type { Item } from './item';

export interface Order {
  id: number;
  requestDate: string;
  vendor: string;
  needByDate?: string;
  shippingPreference?: string;
  professorId: number;
  professor: Professor;
  purpose: string;
  operatingUnit: string;
  spendCategory?: string;
  subtotal?: number;
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
