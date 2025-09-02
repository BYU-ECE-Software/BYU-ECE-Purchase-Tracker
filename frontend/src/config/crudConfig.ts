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
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../api/purchaseTrackerApi';

import type { CrudConfig } from '../types/crud';
import type { Professor } from '../types/professor';
import type {
  SpendCategory,
  NewSpendCategoryPayload,
} from '../types/spendCategory';
import type { LineMemoOption } from '../types/lineMemoOption';
import type { User } from '../types/user';

/**
 * Central configuration for generating CRUD panels for different models.
 * Each key represents a tab title and includes:
 * - Noun for descriptor to display on toast
 * - Field definitions (for form rendering)
 * - API functions (for backend interaction)
 */
export const crudConfigs = {
  // Professors and Staff
  'Professors & Staff': {
    noun: 'Professor/Staff',
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
    noun: 'Spend Category',
    fields: {
      code: { label: 'Code', type: 'text', required: true },
      description: { label: 'Description', type: 'text', required: true },
      visibleToStudents: {
        label: 'Include as an Option for Students',
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
    // Hide Edit and Delete for the "Other" Spend Category
    canEdit: (sc) => sc.code?.trim().toLowerCase() !== 'other',
    canDelete: (sc) => sc.code?.trim().toLowerCase() !== 'other',
  } satisfies CrudConfig<SpendCategory, NewSpendCategoryPayload>,

  // Line Memo Options
  'Line Memos': {
    noun: 'Line Memo',
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

  // Students
  Students: {
    noun: 'Student',
    fields: {
      fullName: { label: 'Full Name', type: 'text', required: true },
      byuNetId: { label: 'BYU Net ID', type: 'text', required: true },
      email: { label: 'Email', type: 'text', required: true },
    },
    api: {
      getAll: fetchUsers,
      create: createUser,
      update: updateUser,
      remove: deleteUser,
    },
  } satisfies CrudConfig<User, Omit<User, 'id'>>,
};
