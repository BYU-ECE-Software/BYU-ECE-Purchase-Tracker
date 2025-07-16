import {
  fetchProfessors,
  createProfessor,
  updateProfessor,
  deleteProfessor,
  fetchAllSpendCategories,
  createSpendCategory,
  updateSpendCategory,
  deleteSpendCategory,
  fetchLineMemoOptions,
  createLineMemo,
  updateLineMemo,
  deleteLineMemo,
} from '../api/purchaseTrackerApi';

import type { CrudConfig } from '../types/crud';
import type { Professor } from '../types/professor';
import type {
  SpendCategory,
  NewSpendCategoryPayload,
} from '../types/spendCategory';
import type { LineMemoOption } from '../types/lineMemoOption';

/**
 * Central configuration for generating CRUD panels for different models.
 * Each key represents a tab title and includes:
 * - Field definitions (for form rendering)
 * - API functions (for backend interaction)
 */
export const crudConfigs = {
  // Professors and Staff
  'Professors & Staff': {
    fields: {
      firstName: { label: 'First Name', type: 'text', required: true },
      lastName: { label: 'Last Name', type: 'text', required: true },
      title: { label: 'Title', type: 'text', required: false },
      email: { label: 'Email', type: 'text', required: false },
    },
    api: {
      getAll: fetchProfessors,
      create: createProfessor,
      update: updateProfessor,
      remove: deleteProfessor,
    },
  } satisfies CrudConfig<Professor, Omit<Professor, 'id'>>,

  // Spend Categories
  'Spend Categories': {
    fields: {
      code: { label: 'Code', type: 'text', required: true },
      description: { label: 'Description', type: 'text', required: true },
      visibleToStudents: {
        label: 'Include in Student Dropdown',
        type: 'radio',
        required: true,
      },
    },
    api: {
      getAll: fetchAllSpendCategories,
      create: createSpendCategory,
      update: updateSpendCategory,
      remove: deleteSpendCategory,
    },
  } satisfies CrudConfig<SpendCategory, NewSpendCategoryPayload>,

  // Line Memo Options
  'Line Memos': {
    fields: {
      id: { label: 'Code', type: 'number', required: true },
      description: { label: 'Description', type: 'text', required: true },
    },
    api: {
      getAll: fetchLineMemoOptions,
      create: createLineMemo,
      update: updateLineMemo,
      remove: deleteLineMemo,
    },
  } satisfies CrudConfig<LineMemoOption, LineMemoOption>,
};
