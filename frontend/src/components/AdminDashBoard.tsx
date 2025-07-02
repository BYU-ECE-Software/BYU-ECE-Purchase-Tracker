import { useEffect, useState } from 'react';
import type { Order } from '../types/order';
import type { Item } from '../types/item';
import {
  fetchOrders,
  updateOrder,
  searchOrders,
} from '../api/purchaseTrackerApi';
import EditOrderModal from './EditOrderModal';
import SearchBar from './SearchBar';
import React from 'react';
import ViewOrderModal from './ViewOrderModal';

//Helper to format date as MM-DD-YYYY
const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // getMonth() is zero-based
  const day = String(date.getUTCDate()).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${month}-${day}-${year}`;
};

// Admin dashboard component for viewing and editing orders

const AdminDashboard = () => {
  // State to hold all orders
  const [orders, setOrders] = useState<Order[]>([]);

  // State to track Search Terms in the search bar
  const [searchTerm, setSearchTerm] = useState('');

  // State for the View Order Modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  // Modal state and data for the selected order
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // States for editing fields in the modal
  const [editedItems, setEditedItems] = useState<Item[]>([]);
  const [editedOrder, setEditedOrder] = useState<{
    tax: number | null;
    total: number | null;
    cardType: string | null;
    purchaseDate: string | null;
    receipt: string | null;
    status: string | null;
    vendor: string | null;
    professorName: string | null;
  }>({
    tax: null,
    total: null,
    cardType: null,
    purchaseDate: null,
    receipt: null,
    status: null,
    vendor: null,
    professorName: null,
  });

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
      // Reference API call to fetch all orders for the dashboard
      const orders = await fetchOrders();
      // Update state
      setOrders(sortOrders(orders));
    } catch (err) {
      console.error('Error loading orders:', err);
    }
  };

  // fetch all orders for the dashboard
  useEffect(() => {
    loadAndSetOrders();
  }, []);

  // Trigger the opening of the view order modal
  const openViewModal = (order: Order) => {
    setViewOrder(order);
    setIsViewModalOpen(true);
  };

  // Returns Tailwind button styling for the order status button based on status
  const getStatusButtonStyle = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-[#10A170] text-white hover:bg-[#006141]';
      case 'Purchased':
        return 'bg-[#FFB700] text-white hover:bg-[#cc9200]';
      case 'Requested':
        return 'bg-[#E61744] text-white hover:bg-[#A3082A]';
      case 'Cancelled':
        return 'bg-[#666666] text-white hover:bg-[#4d4d4d]';
    }
  };

  // Opens modal and loads selected order data into state
  const openEditModal = (order: Order) => {
    setSelectedOrder(order);
    setEditedItems(order.items.map((item) => ({ ...item })));
    setEditedOrder({
      tax: order.tax ?? null,
      total: order.total ?? null,
      cardType: order.cardType ?? null,
      purchaseDate: order.purchaseDate ?? null,
      receipt: order.receipt ?? null,
      status: order.status ?? null,
      vendor: order.vendor ?? null,
      professorName: order.professor
        ? `${order.professor.title} ${order.professor.firstName} ${order.professor.lastName}`
        : null,
    });

    setIsModalOpen(true);
  };

  // Closes modal and resets related state
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Updates status of a specific item in modal
  const handleItemStatusChange = (index: number, newStatus: string) => {
    const updatedItems = [...editedItems];
    updatedItems[index].status = newStatus;
    setEditedItems(updatedItems);
  };

  // Updates modal fields based on field name
  const handleOrderFieldChange = (field: string, value: any) => {
    const normalizedValue = value === '' || value === undefined ? null : value;
    setEditedOrder((prev) => ({
      ...prev,
      [field]: normalizedValue,
    }));
  };

  // PUT logic to update order and item data
  const handleSave = async (markComplete: boolean) => {
    if (!selectedOrder) return;

    try {
      // Determine status logic
      let status = selectedOrder.status;

      if (markComplete) {
        status = 'Completed';
      } else if (editedItems.length > 0) {
        const statuses = editedItems.map((item) => item.status);
        if (statuses.every((s) => s === 'Completed')) {
          status = 'Completed';
        } else if (statuses.some((s) => s === 'Requested')) {
          status = 'Requested';
        } else {
          status = 'Purchased';
        }
      } else {
        status = editedOrder.status ?? selectedOrder.status;
      }

      const {
        professorName, // remove this from payload
        ...orderFields
      } = editedOrder;

      const payload = {
        ...orderFields,
        items: editedItems.map(({ id, status }) => ({ id, status })),
        status,
      };

      await updateOrder(selectedOrder.id, payload);

      //Refresh orders
      await loadAndSetOrders();

      //  Special case: if no items, and switch was on, override _status manually
      if (markComplete && selectedOrder.items.length === 0) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === selectedOrder.id
              ? { ...order, _status: 'Completed' }
              : order
          )
        );
      }

      closeModal();
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
      <div className="flex justify-end mb-4">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSearch={handleSearch}
          onClear={handleClearSearch}
        />
      </div>

      {/* Table to display all order requests and their progress in the workflow */}
      <table className="w-full table-fixed border-collapse border">
        <thead className="bg-gray-100">
          {/* Table headers */}
          <tr>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Form Submitted</th>
            <th className="border px-4 py-2">Vendor</th>
            <th className="border px-4 py-2">Shipping</th>
            <th className="border px-4 py-2">Student Name</th>
            <th className="border px-4 py-2">Student Email</th>
            <th className="border px-4 py-2">View Order</th>
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
                    {/* Button that displays the status of an order and can be clicked to open the modal to edit info on the order */}
                    <button
                      onClick={() => openEditModal(order)}
                      className={`px-3 py-1 rounded font-medium ${getStatusButtonStyle(status)}`}
                    >
                      {status}
                    </button>
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
                    <button
                      onClick={() => openViewModal(order)}
                      className="text-byuRoyal underline hover:text-blue-900"
                    >
                      View
                    </button>
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {/* View Order Modal  */}
      <ViewOrderModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        order={viewOrder}
      />

      {/* Edit Order Modal*/}
      <EditOrderModal
        isOpen={isModalOpen}
        onClose={closeModal}
        items={editedItems}
        editedOrder={editedOrder}
        onItemStatusChange={handleItemStatusChange}
        onOrderFieldChange={handleOrderFieldChange}
        onSave={handleSave}
      />
    </div>
  );
};

export default AdminDashboard;
