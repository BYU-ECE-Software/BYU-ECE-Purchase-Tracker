export interface SpendCategory {
  id: number;
  code: string;
  description: string;
  visibleToStudents: boolean;
}

export interface NewSpendCategoryPayload {
  code: string;
  description: string;
  visibleToStudents: boolean;
}
