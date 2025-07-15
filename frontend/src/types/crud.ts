export type FieldType = 'text' | 'number' | 'checkbox';

export type FieldConfig<T> = {
  label: string;
  type: FieldType;
  required: boolean;
};

export type CrudConfig<T, CreatePayload = Partial<T>> = {
  fields: {
    [K in keyof CreatePayload]: FieldConfig<T>;
  };
  api: {
    getAll: () => Promise<T[]>;
    create: (data: CreatePayload) => Promise<T>;
    update: (id: number, data: Partial<T>) => Promise<T>;
    remove: (id: number) => Promise<void>;
  };
};
