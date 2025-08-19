// Supported form input types
export type FieldType = 'text' | 'number' | 'checkbox' | 'radio';

// Per-field UI metadata
export type FieldConfig = {
  label: string; // Text shown next to the input
  type: FieldType; // Which input to render: "text", "number", "checkbox", or "radio"
  required: boolean; // Whether the field is required for form submission
};

// Generic CRUD config for any model
export type CrudConfig<T, CreatePayload = Partial<T>> = {
  // Defines how each form field should be rendered
  fields: {
    [K in keyof CreatePayload]: FieldConfig;
  };

  // API operations
  api: {
    getAll: () => Promise<T[]>;
    create: (data: CreatePayload) => Promise<T>;
    update: (id: number, data: Partial<T>) => Promise<T>;
    remove: (id: number) => Promise<void>;
  };

  // Title/Name used in UI and toasts for each table
  noun: string;

  // Optional per-row permissions for the UI
  canEdit?: (item: T) => boolean; // whether to show the edit button
  canDelete?: (item: T) => boolean; // whether to show the delete button
};
