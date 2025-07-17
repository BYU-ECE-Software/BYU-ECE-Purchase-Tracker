import { useEffect, useState } from 'react';
import type { Order } from '../types/order';
import type { Item } from '../types/item';
import type { Professor } from '../types/professor';
import {
  fetchOrders,
  updateOrder,
  searchOrders,
  fetchLineMemoOptions,
  fetchProfessors,
  fetchAllSpendCategories,
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

  // States for dropdowns
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [spendCategories, setSpendCategories] = useState<SpendCategory[]>([]);
  const [lineMemoOptions, setLineMemoOptions] = useState<LineMemoOption[]>([]);

  // State for sorting/filtering
  const [sortBy, setSortBy] = useState('requestDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [hasUserSorted, setHasUserSorted] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(50);

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
  const loadAndSetOrders = async () => {
    try {
      const res = await fetchOrders({
        page: currentPage,
        pageSize,
        sortBy,
        order: sortOrder,
        status: selectedStatus || undefined,
      });
      const data = hasUserSorted ? res.data : sortOrders(res.data);
      setOrders(data);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Error loading orders:', err);
    }
  };

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
  }, [sortBy, sortOrder, selectedStatus, currentPage, pageSize]);

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
  };

  // Closes edit modal and resets related state
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditedOrder(null);
  };

  // edit fields on an order
  const handleOrderFieldChange = (field: string, value: any) => {
    const normalizedValue = value === '' || value === undefined ? null : value;
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
  const handleSave = async (markComplete: boolean) => {
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

      const { user, professor, spendCategory, lineMemoOption, ...rest } =
        editedOrder;

      const payload = {
        ...rest,
        items: editedItems.map(({ id, status }) => ({ id, status })),
        status,
      };

      await updateOrder(editedOrder.id, payload);

      //Refresh orders
      await loadAndSetOrders();

      //  Special case: if no items, and switch was on, override _status manually
      if (markComplete && editedOrder.items.length === 0) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === editedOrder.id
              ? { ...order, _status: 'Completed' }
              : order
          )
        );
      }

      closeEditModal();
      alert('Order updated sucessfully!');
    } catch (err) {
      console.error('Failed to update order:', err);
      alert('Something went wrong updating the order.');
    }
  };

  // Function for the Search Bar. Fetches filtered orders from the backend
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      const data = await searchOrders(searchTerm);
      setOrders(sortOrders(data));
    } catch (err) {
      console.error('Search error:', err);
      alert('Failed to search orders');
    }
  };

  // Clearing the Search Bar when done
  const handleClearSearch = async () => {
    setSearchTerm('');
    await loadAndSetOrders(); // Refetch all orders
  };

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
              onClick={() => handleSort('studentEmail')}
            >
              <div className="flex items-center justify-center gap-2">
                Student Email
                {sortBy === 'studentEmail' ? (
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
                      className={`px-3 py-1 rounded font-medium inline-block ${getStatusColor(status)}`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {order.requestDate ? formatDate(order.requestDate) : 'N/A'}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {order.vendor}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {order.shippingPreference}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {order.user.firstName} {order.user.lastName}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {order.user.email}
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
          onItemStatusChange={handleItemStatusChange}
          onOrderFieldChange={handleOrderFieldChange}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
