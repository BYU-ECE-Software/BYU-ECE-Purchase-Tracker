export interface Item {
  id: number;
  name: string;
  quantity: number;
  status: string;
  link?: string;
  file?: string;
  orderId: number;
}
