// Supported input field types used in the form UI
export type FieldType = 'text' | 'number' | 'checkbox' | 'radio';

/**
 * Defines metadata for a single form field.
 * @template T - The type of the full object this field belongs to.
 */
export type FieldConfig<T> = {
  // Label displayed in the UI for this field
  label: string;

  // Input type (text, number, checkbox, or radio)
  type: FieldType;

  // Whether the field is required for form submission
  required: boolean;
};

/**
 * Configuration object for generating a CRUD interface for a given model.
 * @template T - The full entity type (e.g. Professor, SpendCategory)
 * @template CreatePayload - The shape of the payload used for creation (defaults to Partial<T>)
 */
export type CrudConfig<T, CreatePayload = Partial<T>> = {
  // Defines how each form field should be rendered
  fields: {
    [K in keyof CreatePayload]: FieldConfig<T>;
  };

  // API handlers for CRUD operations
  api: {
    getAll: () => Promise<T[]>;
    create: (data: CreatePayload) => Promise<T>;
    update: (id: number, data: Partial<T>) => Promise<T>;
    remove: (id: number) => Promise<void>;
  };
};
