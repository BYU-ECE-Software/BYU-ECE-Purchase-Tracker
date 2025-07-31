export interface NewItemPayload {
  name: string;
  quantity: number;
  status: string;
  link?: string;
  file?: File | null;
}
