import { useEffect, useState } from 'react';
import type { CrudConfig, FieldConfig } from '../types/crud';

interface Props<T extends { id: number }, CreatePayload> {
  title: string;
  config: CrudConfig<T, CreatePayload>;
}

export default function AdminCrudPanel<
  T extends { id: number },
  CreatePayload,
>({ title, config }: Props<T, CreatePayload>) {
  const [items, setItems] = useState<T[]>([]);
  const [formData, setFormData] = useState<Partial<CreatePayload>>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    config.api.getAll().then(setItems);
  }, [config]);

  const handleInputChange = (
    field: keyof CreatePayload,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        await config.api.update(editingId, formData as Partial<T>);
      } else {
        await config.api.create(formData as CreatePayload);
      }
      setFormData({});
      setEditingId(null);
      const updated = await config.api.getAll();
      setItems(updated);
    } catch (err) {
      console.error('Error saving:', err);
    }
  };

  const handleEdit = (item: T) => {
    const editable: Partial<CreatePayload> = {};
    for (const key in config.fields) {
      editable[key as keyof CreatePayload] = item[key as keyof T] as any;
    }
    setFormData(editable);
    setEditingId(item.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure?')) return;
    await config.api.remove(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="p-4 bg-white border rounded-lg shadow">
      <h2 className="text-xl font-semibold text-byuNavy mb-4">{title}</h2>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        {Object.entries(config.fields).map(([fieldName, fieldMetaRaw]) => {
          const field = fieldName as keyof CreatePayload;
          const meta = fieldMetaRaw as FieldConfig<CreatePayload>;
          const value =
            formData[field] ?? (meta.type === 'checkbox' ? false : '');

          return (
            <div key={fieldName}>
              <label className="block text-sm font-medium text-gray-700">
                {meta.label}
                {meta.required && <span className="text-red-500"> *</span>}
              </label>

              {meta.type === 'checkbox' ? (
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(e) => handleInputChange(field, e.target.checked)}
                  className="mt-1"
                />
              ) : (
                <input
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
        })}
        <button
          type="submit"
          className="bg-byuNavy text-white px-4 py-2 rounded hover:bg-byuBlue"
        >
          {editingId ? 'Update' : 'Add'}
        </button>
      </form>

      <table className="w-full text-sm border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            {Object.entries(config.fields).map(([fieldName, fieldMetaRaw]) => {
              const meta = fieldMetaRaw as FieldConfig<CreatePayload>;
              return (
                <th key={fieldName} className="p-2 border">
                  {meta.label}
                </th>
              );
            })}
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              {Object.keys(config.fields).map((fieldName) => (
                <td key={fieldName} className="p-2 border">
                  {String(item[fieldName as keyof T] ?? '')}
                </td>
              ))}
              <td className="p-2 border space-x-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
