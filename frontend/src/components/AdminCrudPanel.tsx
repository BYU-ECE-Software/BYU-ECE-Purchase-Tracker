// Template for the Site Admin Page. Allows for CRUD functionality on any desired fields

import { useEffect, useState, useRef } from 'react';
import type { CrudConfig, FieldConfig } from '../types/crud';
import type { ToastProps } from '../types/toast';

// Generic props: title to display and a CRUD config for a specific model
interface Props<T extends { id: number }, CreatePayload> {
  title: string;
  config: CrudConfig<T, CreatePayload>;
  setToast: (toast: Omit<ToastProps, 'onClose' | 'duration'>) => void;
}

// Generic reusable CRUD admin panel for any model with an `id`
export default function AdminCrudPanel<
  T extends { id: number },
  CreatePayload,
>({ title, config, setToast }: Props<T, CreatePayload>) {
  // State to store all records, form data, and editing ID
  const [items, setItems] = useState<T[]>([]);
  const [formData, setFormData] = useState<Partial<CreatePayload>>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Ref to auto-focus the first input when editing begins
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Load all records when the component mounts
  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        const data = await config.api.getAll();
        setItems(data);
      } catch (err) {
        console.error('Error loading items:', err);
        setToast({
          type: 'error',
          title: 'Error',
          message: `Failed to load ${config.noun}s. Please try again later.`,
        });
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [config, setToast]);

  // Update form field value when user types/selects input
  const handleInputChange = (
    field: keyof CreatePayload,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Submit handler for both create and update modes
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        await config.api.update(editingId, formData as Partial<T>);
        setToast({
          type: 'success',
          title: 'Success',
          message: `${config.noun} updated`,
        });
      } else {
        await config.api.create(formData as CreatePayload);
        setToast({
          type: 'success',
          title: 'Success',
          message: `${config.noun} created`,
        });
      }

      // Reset form and reload data
      setFormData({});
      setEditingId(null);
      const updated = await config.api.getAll();
      setItems(updated);
    } catch (err) {
      console.error('Error saving:', err);
      setToast({
        type: 'error',
        title: 'Error',
        message: `Failed to ${editingId ? 'update' : 'create'} ${config.noun}`,
      });
    }
  };

  // Trigger edit mode, populate form with selected record, and focus first input
  const handleEdit = (item: T) => {
    const editable: Partial<CreatePayload> = {};
    for (const key in config.fields) {
      editable[key as keyof CreatePayload] = item[key as keyof T] as any;
    }
    setFormData(editable);
    setEditingId(item.id);

    // Wait for input to render before setting focus
    setTimeout(() => {
      firstInputRef.current?.focus();
    }, 0);
  };

  // Confirm and delete a record
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete?')) return;
    try {
      await config.api.remove(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setToast({
        type: 'success',
        title: 'Success',
        message: `${config.noun} deleted`,
      });
    } catch (err) {
      console.error('Error deleting:', err);
      setToast({
        type: 'error',
        title: 'Error',
        message: `Failed to delete ${config.noun}`,
      });
    }
  };

  return (
    <div className="p-4 bg-white border rounded-lg shadow text-byuNavy">
      <h2 className="text-xl font-semibold text-byuNavy mb-4">{title}</h2>

      {/* Main layout: Form on the left, table on the right */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Form section */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 w-full lg:w-[45%] mb-6"
        >
          {Object.entries(config.fields).map(
            ([fieldName, fieldMetaRaw], index) => {
              const field = fieldName as keyof CreatePayload;
              const meta = fieldMetaRaw as FieldConfig<CreatePayload>;
              const value =
                formData[field] ?? (meta.type === 'checkbox' ? false : '');

              return (
                <div key={fieldName}>
                  <label className="block text-sm font-medium text-byuNavy">
                    {meta.label}
                    {meta.required && <span className="text-byuNavy"> *</span>}
                  </label>

                  {/* Render appropriate input type based on meta config */}
                  {meta.type === 'radio' ? (
                    <div className="flex gap-4 mt-1">
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name={String(field)}
                          value="true"
                          checked={value === true}
                          onChange={() => handleInputChange(field, true)}
                          required={meta.required}
                        />
                        Yes
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name={String(field)}
                          value="false"
                          checked={value === false}
                          onChange={() => handleInputChange(field, false)}
                        />
                        No
                      </label>
                    </div>
                  ) : meta.type === 'checkbox' ? (
                    <input
                      type="checkbox"
                      checked={Boolean(value)}
                      onChange={(e) =>
                        handleInputChange(field, e.target.checked)
                      }
                      className="mt-1"
                    />
                  ) : (
                    <input
                      ref={index === 0 ? firstInputRef : undefined} // attach ref to the first input
                      type={meta.type}
                      value={value as string | number}
                      onChange={(e) =>
                        handleInputChange(
                          field,
                          meta.type === 'number'
                            ? Number(e.target.value)
                            : e.target.value
                        )
                      }
                      required={meta.required}
                      className="mt-1 block w-full border border-gray-300 rounded p-2 text-sm"
                    />
                  )}
                </div>
              );
            }
          )}

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-byuNavy text-white px-4 py-2 rounded hover:bg-[#001F40]"
            >
              {editingId ? 'Save' : 'Add'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setFormData({});
                  setEditingId(null);
                }}
                className="bg-byuMediumGray text-white px-4 py-2 rounded hover:bg-[#4d4d4d]"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Table section */}
        <div className="w-full lg:w-[55%] overflow-x-auto">
          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading...</p>
          ) : (
            <table className="table-auto max-w-fit text-sm border border-gray-300 mx-auto">
              <thead className="bg-gray-100">
                <tr>
                  {/* Render table headers dynamically based on config */}
                  {Object.entries(config.fields).map(
                    ([fieldName, fieldMetaRaw]) => {
                      const meta = fieldMetaRaw as FieldConfig<CreatePayload>;
                      return (
                        <th
                          key={fieldName}
                          className="px-4 py-2 border whitespace-nowrap"
                        >
                          {meta.label}
                        </th>
                      );
                    }
                  )}
                  <th className="px-4 py-2 border whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    {/* Render table cells dynamically based on config */}
                    {Object.keys(config.fields).map((fieldName) => (
                      <td
                        key={fieldName}
                        className="px-4 py-2 border whitespace-nowrap"
                      >
                        {String(item[fieldName as keyof T] ?? '')}
                      </td>
                    ))}
                    <td className="px-4 py-2 border whitespace-nowrap">
                      <div className="flex justify-center gap-5">
                        <button
                          onClick={() => handleEdit(item)}
                          className="bg-byuRoyal text-white px-3 py-1 rounded hover:bg-[#003B9A] transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="bg-byuRedBright text-white px-3 py-1 rounded hover:bg-byuRedDark transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
