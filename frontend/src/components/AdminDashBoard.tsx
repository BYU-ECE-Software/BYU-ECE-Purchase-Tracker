import { useCallback, useEffect, useRef, useState } from 'react';
import type { Order } from '../types/order';
import type { Item } from '../types/item';
import type { Professor } from '../types/professor';
import {
  fetchOrders,
  updateOrder,
  fetchLineMemoOptions,
  fetchProfessors,
  fetchAllSpendCategories,
  sendEmail,
} from '../api/purchaseTrackerApi';
import EditOrderModal from './EditOrderModal';
import SearchBar from './SearchBar';
import React from 'react';
import ViewOrderModal from './ViewOrderModal';
import type { SpendCategory } from '../types/spendCategory';
import type { LineMemoOption } from '../types/lineMemoOption';
import { getStatusColor } from '../utils/getStatusColor';
import { formatDate } from '../utils/formatDate';
import { BarsArrowDownIcon, BarsArrowUpIcon } from '@heroicons/react/24/solid';
import StatusFilter from './StatusFilter';
import Pagination from './Pagination';
import Toast from './Toast';
import type { ToastProps } from '../types/toast';
import ConfirmDeletionModal from './ConfirmDeletionModal';

// Function that adds a confirm deletion hook for deleted receipt images and item files. to use in handleSave
function useConfirmDeletion() {
  const [isOpen, setIsOpen] = useState(false);
  const [count, setCount] = useState(0);

  // Allow null and initialize as null
  const resolverRef = useRef<((ok: boolean) => void) | null>(null);

  const confirm = (n: number) =>
    new Promise<boolean>((resolve) => {
      setCount(n);
      setIsOpen(true);
      resolverRef.current = resolve;
    });

  const onCancel = () => {
    setIsOpen(false);
    resolverRef.current?.(false);
    resolverRef.current = null; // tidy up
  };

  const onConfirm = () => {
    setIsOpen(false);
    resolverRef.current?.(true);
    resolverRef.current = null; // tidy up
  };

  return { isOpen, count, confirm, onCancel, onConfirm };
}

// Admin dashboard component for viewing and editing orders

const AdminDashboard = () => {
  // State to hold all orders
  const [orders, setOrders] = useState<Order[]>([]);

  // State to track Search Terms in the search bar
  const [searchTerm, setSearchTerm] = useState('');

  // State for the View Order Modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  // State for the Edit Order Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedOrder, setEditedOrder] = useState<Order | null>(null);
  const [editedItems, setEditedItems] = useState<Item[]>([]);
  const [markComplete, setMarkComplete] = useState(false);

  // State for Confirm Deletion Modal
  const {
    isOpen: showDeleteConfirm,
    count: pendingDeleteCount,
    confirm: confirmDeletion,
    onCancel: handleCancelDeletion,
    onConfirm: handleConfirmDeletionClick,
  } = useConfirmDeletion();

  // States for dropdowns
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [spendCategories, setSpendCategories] = useState<SpendCategory[]>([]);
  const [lineMemoOptions, setLineMemoOptions] = useState<LineMemoOption[]>([]);

  // State for sorting/filtering
  const [sortBy, setSortBy] = useState('requestDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [hasUserSorted, setHasUserSorted] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [date, setDate] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // State for Toast
  const [toast, setToast] = useState<Omit<
    ToastProps,
    'onClose' | 'duration'
  > | null>(null);

  // Sort logic for load up of orders
  const sortOrders = (orders: Order[]): Order[] => {
    return orders.sort((a, b) => {
      // Separates in progress orders (those that have an order status of "Ordered" or "Requested")
      const isAInProgress =
        a.status === 'Requested' || a.status === 'Purchased';
      const isBInProgress =
        b.status === 'Requested' || b.status === 'Purchased';

      // In-progress orders go first
      if (isAInProgress && !isBInProgress) return -1;
      if (!isAInProgress && isBInProgress) return 1;

      // Within each group, sort by requestDate descending
      const requestA = new Date(a.requestDate).getTime();
      const requestB = new Date(b.requestDate).getTime();
      return requestB - requestA;
    });
  };

  // Load up orders for the main dashboard
  const loadAndSetOrders = useCallback(async () => {
    try {
      const res = await fetchOrders({
        page: currentPage,
        pageSize,
        sortBy,
        order: sortOrder,
        status: selectedStatus || undefined,
        query: searchTerm.trim() || undefined,
      });
      const data = hasUserSorted ? res.data : sortOrders(res.data);
      setOrders(data);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Error loading orders:', err);
    }
  }, [
    currentPage,
    pageSize,
    sortBy,
    sortOrder,
    selectedStatus,
    searchTerm,
    hasUserSorted,
  ]);

  // Handles table sorting logic
  const handleSort = (field: string) => {
    setHasUserSorted(true);
    if (field === sortBy) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // fetch all orders for the dashboard
  useEffect(() => {
    loadAndSetOrders();
  }, [
    sortBy,
    sortOrder,
    selectedStatus,
    currentPage,
    pageSize,
    loadAndSetOrders,
  ]);

  // Load up professors for dropdown
  useEffect(() => {
    const loadProfessors = async () => {
      try {
        const data = await fetchProfessors();
        setProfessors(data);
      } catch (err) {
        console.error('Failed to load professors:', err);
      }
    };

    loadProfessors();
  }, []);

  // Load up line memo options for dropdown
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const options = await fetchLineMemoOptions();
        setLineMemoOptions(options);
      } catch (err) {
        console.error('Failed to load line memo options:', err);
      }
    };

    loadOptions();
  }, []);

  // Load up spend categories for dropdown
  useEffect(() => {
    const loadSpendCategories = async () => {
      try {
        const categories = await fetchAllSpendCategories();
        setSpendCategories(categories);
      } catch (err) {
        console.error('Failed to load spend categories:', err);
      }
    };

    loadSpendCategories();
  }, []);

  // Trigger the opening of the view order modal
  const openViewModal = (order: Order) => {
    setViewOrder(order);
    setIsViewModalOpen(true);
  };

  // Opens edit modal and loads order data into state
  const openEditModal = (order: Order) => {
    setEditedOrder(order);
    setEditedItems(order.items.map((item) => ({ ...item })));
    setIsEditModalOpen(true);
    setMarkComplete(order.status === 'Completed');
  };

  // Closes edit modal and resets related state
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditedOrder(null);
    setMarkComplete(false);
  };

  // edit fields on an order
  const handleOrderFieldChange = (field: string, value: any) => {
    const isNumNaN = typeof value === 'number' && Number.isNaN(value);
    const normalizedValue =
      value === '' || value === undefined || isNumNaN ? null : value;

    setEditedOrder((prev) => ({
      ...prev!,
      [field]: normalizedValue,
    }));
  };

  // Updates status of a specific item in edit modal
  const handleItemStatusChange = (index: number, newStatus: string) => {
    const updatedItems = [...editedItems];
    updatedItems[index].status = newStatus;
    setEditedItems(updatedItems);
  };

  // PUT logic to update order and item data
  const handleSave = async (newReceipts: File[], deletedReceipts: string[]) => {
    if (!editedOrder) return;

    try {
      // Determine status logic
      let status = editedOrder.status;

      if (markComplete) {
        status = 'Completed';
      } else if (editedItems.length > 0) {
        const statuses = editedItems.map((item) => item.status);

        if (statuses.every((s) => s === 'Completed')) {
          status = 'Completed';
        } else if (statuses.every((s) => s === 'Returned')) {
          status = 'Returned';
        } else if (statuses.every((s) => s === 'Cancelled')) {
          status = 'Cancelled';
        } else if (statuses.some((s) => s === 'Requested')) {
          status = 'Requested';
        } else {
          status = 'Purchased';
        }
      }

      // If status is changed to 'Purchased', send email notification to user
      if(status === 'Purchased') {
        try {
          await sendEmail(
            editedOrder.user.email,
            "ECE Order Purchased!",
            editedOrder.user.fullName,
            `Your order with the ECE Department has been purchased! We will notify you when it has arrived.`,
          );
        } catch (emailErr) {
          console.error('Failed to send purchase email:', emailErr);
        }
      }

      // if status is marked as 'Completed' make sure that user knows that files will be deleted
      if (status === 'Completed') {
        // Add all receipts that are going to be deleted
        const prospectiveDeletedReceipts = [
          ...deletedReceipts,
          ...(editedOrder.receipt ?? []),
        ];

        // Add all item files that are going to be deleted
        const prospectiveDeletedItemFiles = editedItems
          .map((item) => item.file)
          .filter((file): file is string => !!file);

        // Get the count of how many files will be deleted
        const willDeleteCount =
          prospectiveDeletedItemFiles.length +
          prospectiveDeletedReceipts.length;

        // if there are items to be deleted, call the confirmDeletion function which pops up the confirmation modal before continuing
        if (willDeleteCount > 0) {
          const ok = await confirmDeletion(willDeleteCount);
          if (!ok) return; // user cancelled - stop here
        }
      }

      // Now move forward with actual deletion because user said to continue
      // Only compute deleted files if Completed, otherwise array stays empty
      let deletedItemFiles: string[] = [];

      // Auto-delete receipts and item files if status is marked as 'Completed'
      if (status === 'Completed') {
        // Add all existing receipt filenames to the deletedReceipts list
        deletedReceipts = [...deletedReceipts, ...(editedOrder.receipt ?? [])];

        // Add all item files to be deleted
        deletedItemFiles = editedItems
          .map((item) => item.file)
          .filter((file): file is string => !!file);

        // Prevent new files from being uploaded by clearing the array
        newReceipts = [];
      }

      // Strip unneccesary fields
      const { user, professor, spendCategory, lineMemoOption, ...rest } =
        editedOrder;

      // Prepare payload for your existing updateOrder API
      const payload = {
        ...rest,
        items: editedItems.map(({ id, status }) => ({ id, status })),
        status,
        receipt: newReceipts, // receipt files to upload
        deletedReceipts, // receipt files to remove
        deletedItemFiles, // item files to remove
      };

      // Use your FormData-aware helper
      await updateOrder(editedOrder.id, payload);

      await loadAndSetOrders();

      closeEditModal();
      setToast({
        type: 'success',
        title: 'Order Updated',
        message: 'The order was updated successfully!',
      });
    } catch (err) {
      console.error('Failed to update order:', err);
      setToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Something went wrong while updating the order.',
      });
    }
  };

  // Function for the Search Bar. Fetches filtered orders from the backend
  const handleSearch = useCallback(async () => {
    try {
      if (!searchTerm.trim() && !date.trim()) return;

      const res = await fetchOrders({
        page: currentPage,
        pageSize,
        sortBy,
        order: sortOrder,
        status: selectedStatus || undefined,
        query: searchTerm.trim() || undefined,
        date: date || undefined,
      });

      const data = hasUserSorted ? res.data : sortOrders(res.data);
      setOrders(data);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Search error:', err);
      setToast({
        type: 'error',
        title: 'Search Failed',
        message: 'Something went wrong while searching orders.',
      });
    }
  }, [
    searchTerm,
    date,
    currentPage,
    pageSize,
    sortBy,
    sortOrder,
    selectedStatus,
    hasUserSorted,
    setOrders,
    setTotalPages,
    setToast,
  ]);

  // Trigger search when a date is selected
  useEffect(() => {
    if (date) {
      handleSearch();
    }
  }, [date, handleSearch]);

  // Clearing the Search Bar when done
  const handleClearSearch = async () => {
    setSearchTerm('');
    setDate('');
    setCurrentPage(1);

    try {
      const res = await fetchOrders({
        page: 1,
        pageSize,
        sortBy,
        order: sortOrder,
        status: selectedStatus || undefined,
        query: undefined, // ✅ explicitly omit search
      });

      const data = hasUserSorted ? res.data : sortOrders(res.data);
      setOrders(data);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Failed to clear search:', err);
      setToast({
        type: 'error',
        title: 'Failed to clear search',
        message: 'Something went wrong while reloading the orders.',
      });
    }
  };

  // Keep "Mark Complete" toggle in sync with item or order status
  useEffect(() => {
    if (editedItems.length > 0) {
      const allCompleted = editedItems.every(
        (item) => item.status === 'Completed'
      );
      setMarkComplete(allCompleted);
    } else if (editedOrder) {
      setMarkComplete(editedOrder.status === 'Completed');
    }
  }, [editedItems, editedOrder?.status]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        {/* Left-aligned filter */}
        <div>
          <StatusFilter
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            onClearFilters={() => {
              setSelectedStatus('');
              setSearchTerm('');
              setDate('');
              setSortBy('requestDate');
              setSortOrder('desc');
              setHasUserSorted(false);
              loadAndSetOrders(); // triggers your original sortOrders logic
            }}
          />
        </div>

        {/* Right-aligned search */}
        <div className="flex justify-end">
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSearch={handleSearch}
            onClear={handleClearSearch}
            purchaseDate={date}
            setPurchaseDate={setDate}
          />
        </div>
      </div>

      {/* Table to display all order requests and their progress in the workflow */}
      <table className="w-full table-fixed border-collapse border text-byuNavy">
        <thead className="bg-gray-100">
          {/* Table headers */}
          <tr>
            <th
              className="border px-4 py-2 cursor-pointer"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center justify-center gap-2">
                Status
                {sortBy === 'status' ? (
                  sortOrder === 'asc' ? (
                    <BarsArrowUpIcon className="h-4 w-4 text-byuNavy" />
                  ) : (
                    <BarsArrowDownIcon className="h-4 w-4 text-byuNavy" />
                  )
                ) : (
                  <BarsArrowDownIcon className="h-4 w-4 text-byuMediumGray" />
                )}
              </div>
            </th>
            <th
              className="border px-4 py-2 cursor-pointer"
              onClick={() => handleSort('requestDate')}
            >
              <div className="flex items-center justify-center gap-2">
                Form Submitted
                {sortBy === 'requestDate' ? (
                  sortOrder === 'asc' ? (
                    <BarsArrowUpIcon className="h-4 w-4 text-byuNavy" />
                  ) : (
                    <BarsArrowDownIcon className="h-4 w-4 text-byuNavy" />
                  )
                ) : (
                  <BarsArrowDownIcon className="h-4 w-4 text-byuMediumGray" />
                )}
              </div>
            </th>
            <th
              className="border px-4 py-2 cursor-pointer"
              onClick={() => handleSort('purchaseDate')}
            >
              <div className="flex items-center justify-center gap-2">
                Purchase Date
                {sortBy === 'purchaseDate' ? (
                  sortOrder === 'asc' ? (
                    <BarsArrowUpIcon className="h-4 w-4 text-byuNavy" />
                  ) : (
                    <BarsArrowDownIcon className="h-4 w-4 text-byuNavy" />
                  )
                ) : (
                  <BarsArrowDownIcon className="h-4 w-4 text-byuMediumGray" />
                )}
              </div>
            </th>
            <th
              className="border px-4 py-2 cursor-pointer"
              onClick={() => handleSort('vendor')}
            >
              <div className="flex items-center justify-center gap-2">
                Vendor
                {sortBy === 'vendor' ? (
                  sortOrder === 'asc' ? (
                    <BarsArrowUpIcon className="h-4 w-4 text-byuNavy" />
                  ) : (
                    <BarsArrowDownIcon className="h-4 w-4 text-byuNavy" />
                  )
                ) : (
                  <BarsArrowDownIcon className="h-4 w-4 text-byuMediumGray" />
                )}
              </div>
            </th>
            <th
              className="border px-4 py-2 cursor-pointer"
              onClick={() => handleSort('shippingPreference')}
            >
              <div className="flex items-center justify-center gap-2">
                Shipping
                {sortBy === 'shippingPreference' ? (
                  sortOrder === 'asc' ? (
                    <BarsArrowUpIcon className="h-4 w-4 text-byuNavy" />
                  ) : (
                    <BarsArrowDownIcon className="h-4 w-4 text-byuNavy" />
                  )
                ) : (
                  <BarsArrowDownIcon className="h-4 w-4 text-byuMediumGray" />
                )}
              </div>
            </th>
            <th
              className="border px-4 py-2 cursor-pointer"
              onClick={() => handleSort('total')}
            >
              <div className="flex items-center justify-center gap-2">
                Total
                {sortBy === 'total' ? (
                  sortOrder === 'asc' ? (
                    <BarsArrowUpIcon className="h-4 w-4 text-byuNavy" />
                  ) : (
                    <BarsArrowDownIcon className="h-4 w-4 text-byuNavy" />
                  )
                ) : (
                  <BarsArrowDownIcon className="h-4 w-4 text-byuMediumGray" />
                )}
              </div>
            </th>
            <th
              className="border px-4 py-2 cursor-pointer"
              onClick={() => handleSort('studentName')}
            >
              <div className="flex items-center justify-center gap-2">
                Student Name
                {sortBy === 'studentName' ? (
                  sortOrder === 'asc' ? (
                    <BarsArrowUpIcon className="h-4 w-4 text-byuNavy" />
                  ) : (
                    <BarsArrowDownIcon className="h-4 w-4 text-byuNavy" />
                  )
                ) : (
                  <BarsArrowDownIcon className="h-4 w-4 text-byuMediumGray" />
                )}
              </div>
            </th>
            <th
              className="border px-4 py-2 cursor-pointer"
              onClick={() => handleSort('professor')}
            >
              <div className="flex items-center justify-center gap-2">
                Professor
                {sortBy === 'professor' ? (
                  sortOrder === 'asc' ? (
                    <BarsArrowUpIcon className="h-4 w-4 text-byuNavy" />
                  ) : (
                    <BarsArrowDownIcon className="h-4 w-4 text-byuNavy" />
                  )
                ) : (
                  <BarsArrowDownIcon className="h-4 w-4 text-byuMediumGray" />
                )}
              </div>
            </th>
            <th className="border px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {/* Map through all orders and display them in the table */}
          {orders.map((order) => {
            const status = order.status ?? 'Requested';
            return (
              <React.Fragment key={order.id}>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="border px-4 py-2 text-center">
                    {/* Displays the color-coded status of the order */}
                    <span
                      className={`px-3 py-1 rounded font-medium inline-block ${getStatusColor(
                        status
                      )}`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {order.requestDate ? formatDate(order.requestDate) : 'N/A'}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {order.purchaseDate ? formatDate(order.purchaseDate) : ''}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {order.vendor}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {order.shippingPreference}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {order.total != null ? `$${order.total}` : ''}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {order.user.fullName}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {order.professor.title} {order.professor.firstName}{' '}
                    {order.professor.lastName}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => openViewModal(order)}
                        className="px-3 py-1 border border-byuNavy text-byuNavy rounded hover:bg-byuNavy hover:text-white transition-colors duration-150 text-sm font-medium"
                      >
                        View
                      </button>
                      <button
                        onClick={() => openEditModal(order)}
                        className="px-3 py-1 border border-byuRoyal text-byuRoyal rounded hover:bg-byuRoyal hover:text-white transition-colors duration-150 text-sm font-medium"
                      >
                        Update
                      </button>
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {/* Table Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
        pageSize={pageSize}
        setPageSize={setPageSize}
      />

      {/* View Order Modal  */}
      <ViewOrderModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        order={viewOrder}
      />

      {/* Edit Order Modal*/}
      {isEditModalOpen && editedOrder && (
        <EditOrderModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          order={editedOrder} // ✅ TS now knows it's never null
          items={editedItems}
          professors={professors}
          lineMemoOptions={lineMemoOptions}
          spendCategories={spendCategories}
          markComplete={markComplete}
          setMarkComplete={setMarkComplete}
          onItemStatusChange={handleItemStatusChange}
          onOrderFieldChange={handleOrderFieldChange}
          onSave={handleSave}
        />
      )}

      {/* Confirm Delete Modal for Files */}
      <ConfirmDeletionModal
        isOpen={showDeleteConfirm}
        onCancel={handleCancelDeletion}
        onConfirm={handleConfirmDeletionClick}
        filesToDeleteCount={pendingDeleteCount}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in-out">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
