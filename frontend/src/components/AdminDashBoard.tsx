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
  // State to track which orders are expanded to show item details or purchase details
  const [expandedOrderIds, setExpandedOrderIds] = useState<number[]>([]);
  const [expandedPurchaseIds, setExpandedPurchaseIds] = useState<number[]>([]);
  // State to track Search Terms in the search bar
  const [searchTerm, setSearchTerm] = useState('');
  // State to track which comments are shown
  const [visibleCommentIds, setVisibleCommentIds] = useState<number[]>([]);
  // Modal state and data for the selected order
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  // States for editing fields in the modal
  const [editedItems, setEditedItems] = useState<Item[]>([]);
  const [editedOrder, setEditedOrder] = useState<{
    subtotal: number | null;
    tax: number | null;
    total: number | null;
    cardType: string | null;
    purchaseDate: string | null;
    receipt: string | null;
    status: string | null;
    vendor: string | null;
    professorName: string | null;
  }>({
    subtotal: null,
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

      // If both are in-progress, sort by needByDate (nulls last)
      if (isAInProgress && isBInProgress) {
        const dateA = a.needByDate
          ? new Date(a.needByDate).getTime()
          : Infinity;
        const dateB = b.needByDate
          ? new Date(b.needByDate).getTime()
          : Infinity;
        return dateA - dateB;
      }

      // If both are completed/cancelled, sort by requestDate descending
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

  // Toggle whether an order row is expanded to show item details
  const toggleExpand = (orderId: number) => {
    setExpandedOrderIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Toggle whether an order row is expanded to show purchase details
  const togglePurchaseExpand = (orderId: number) => {
    setExpandedPurchaseIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Toggle whether a comment is being shown
  const toggleCommentVisibility = (orderId: number) => {
    setVisibleCommentIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
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
      subtotal: order.subtotal ?? null,
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold mb-4">Orders</h2>
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
            <th className="border px-4 py-2">Need By</th>
            <th className="border px-4 py-2">Vendor</th>
            <th className="border px-4 py-2">Shipping</th>
            <th className="border px-4 py-2">Student Name</th>
            <th className="border px-4 py-2">Student Email</th>
            <th className="border px-4 py-2">Item Info</th>
            <th className="border px-4 py-2">Purchase Info</th>
            <th className="border px-4 py-2">Comments</th>
          </tr>
        </thead>
        <tbody>
          {/* Map through all orders and display them in the table */}
          {orders.map((order) => {
            const isExpanded = expandedOrderIds.includes(order.id);
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
                  <td
                    className={`border px-4 py-2 text-center ${
                      order.status === 'Requested' &&
                      order.needByDate &&
                      new Date(order.needByDate) < new Date()
                        ? 'text-red-600 font-semibold'
                        : ''
                    }`}
                  >
                    {order.needByDate ? formatDate(order.needByDate) : ''}
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
                  <td className="border px-4 py-2 text-center space-y-1">
                    {order.items.length > 0 && (
                      <button
                        onClick={() => toggleExpand(order.id)}
                        className="text-byuRoyal underline hover:text-blue-900 block mx-auto"
                      >
                        {isExpanded ? 'Hide Items' : 'Show Items'}
                      </button>
                    )}

                    {order.cartLink && (
                      <a
                        href={order.cartLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-byuRoyal underline hover:text-blue-900 block mx-auto"
                      >
                        Cart Link
                      </a>
                    )}
                  </td>

                  <td className="border px-4 py-2 text-center">
                    <button
                      onClick={() => togglePurchaseExpand(order.id)}
                      className="text-byuRoyal underline hover:text-blue-900"
                    >
                      {expandedPurchaseIds.includes(order.id) ? 'Hide' : 'Show'}
                    </button>
                  </td>
                  <td className="border px-4 py-2 text-center align-top">
                    {order.comment ? (
                      <div>
                        <button
                          onClick={() => toggleCommentVisibility(order.id)}
                          className="text-byuRoyal underline hover:text-blue-900"
                        >
                          {visibleCommentIds.includes(order.id)
                            ? 'Hide'
                            : 'View'}
                        </button>

                        {visibleCommentIds.includes(order.id) && (
                          <div className="mt-2 text-sm text-left break-words">
                            {order.comment}
                          </div>
                        )}
                      </div>
                    ) : (
                      ''
                    )}
                  </td>
                </tr>
                {/* sub table that displays if user wants to see individual item information for an order */}
                {isExpanded && order.items.length > 0 && (
                  <tr key={`items-${order.id}`}>
                    <td colSpan={10} className="border-t px-4 py-2 bg-gray-50">
                      <table className="min-w-full table-fixed">
                        <thead>
                          <tr>
                            <th className="px-2 py-1 text-left">Item Name</th>
                            <th className="px-2 py-1 text-left">Quantity</th>
                            <th className="px-2 py-1 text-left">Status</th>
                            <th className="px-2 py-1 text-left">Link</th>
                            <th className="px-2 py-1 text-left">File</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item) => (
                            <tr key={item.id}>
                              <td className="px-2 py-1">{item.name}</td>
                              <td className="px-2 py-1">{item.quantity}</td>
                              <td className="px-2 py-1">{item.status}</td>
                              <td className="px-2 py-1">
                                {item.link ? (
                                  <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-byuRoyal underline hover:text-blue-900"
                                  >
                                    Link
                                  </a>
                                ) : (
                                  ''
                                )}
                              </td>
                              <td className="px-2 py-1">
                                {item.file ? (
                                  <span title={item.file}>file</span>
                                ) : (
                                  ''
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
                {/* sub table that displays if user wants to see purchase info for an order */}
                {expandedPurchaseIds.includes(order.id) && (
                  <tr key={`purchase-${order.id}`}>
                    <td colSpan={10} className="border-t px-4 py-2 bg-blue-50">
                      <table className="min-w-full table-fixed">
                        <thead>
                          <tr>
                            <th className="px-2 py-1 text-left">Professor</th>
                            <th className="px-2 py-1 text-left">
                              Funding Code
                            </th>
                            <th className="px-2 py-1 text-left">
                              Line Memo Option
                            </th>
                            <th className="px-2 py-1 text-left">Purpose</th>
                            <th className="px-2 py-1 text-left">Card Type</th>
                            <th className="px-2 py-1 text-left">
                              Purchase Date
                            </th>
                            <th className="px-2 py-1 text-left">Receipt</th>
                            <th className="px-2 py-1 text-left">Subtotal</th>
                            <th className="px-2 py-1 text-left">Tax</th>
                            <th className="px-2 py-1 text-left">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="px-2 py-1">
                              {order.professor.title}{' '}
                              {order.professor.firstName}{' '}
                              {order.professor.lastName}
                            </td>
                            <td className="px-2 py-1">
                              {order.operatingUnit}-{order.spendCategory.code}
                            </td>
                            <td className="px-2 py-1">
                              {order.lineMemoOptionId} -{' '}
                              {order.lineMemoOption.description}
                            </td>
                            <td className="px-2 py-1">{order.purpose}</td>
                            <td className="px-2 py-1">
                              {order.cardType || '-'}
                            </td>
                            <td className="px-2 py-1">
                              {order.purchaseDate
                                ? formatDate(order.purchaseDate)
                                : '-'}
                            </td>
                            <td className="px-2 py-1">
                              {order.receipt ? (
                                <span title={order.receipt}>receipt</span>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="px-2 py-1">
                              {order.subtotal != null
                                ? `$${order.subtotal}`
                                : '-'}
                            </td>
                            <td className="px-2 py-1">
                              {order.tax != null ? `$${order.tax}` : '-'}
                            </td>
                            <td className="px-2 py-1">
                              {order.total != null ? `$${order.total}` : '-'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {/* Instance of the Modal Component that is used to edit info for an order */}
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
