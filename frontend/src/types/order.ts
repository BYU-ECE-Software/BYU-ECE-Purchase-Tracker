import type { User } from './user';

export interface Item {
  id: number;
  name: string;
  quantity: number;
  status: string;
  link?: string;
  file?: string;
  orderId: number;
}

export interface Order {
  id: number;
  requestDate: string; // or `Date` if you're parsing it as a Date object
  store: string;
  needByDate?: string; // or `Date`
  shippingPreference: string;
  professorId: number;
  professor: {
    id: number;
    firstName: string;
    lastName: string;
    title?: string;
    email?: string;
  };
  purpose: string;
  workdayCode: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  userId: number;
  user: User;
  items: Item[];
  lineMemoOptionId: number;
  lineMemoOption: {
    id: number;
    description: string;
  };
}

export interface OrderUpdatePayload {
  [key: string]: any;
  items?: { id: number; [key: string]: any }[];
}
