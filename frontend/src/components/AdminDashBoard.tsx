import { useEffect, useState } from 'react';
import type { Order, Item } from '../types/order';
import { fetchOrders } from '../api/purchaseTrackerapi';
import EditOrderModal from './EditOrderModal';

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrderIds, setExpandedOrderIds] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editedItems, setEditedItems] = useState<Item[]>([]);
  const [subtotal, setSubtotal] = useState<number | null>(null);
  const [tax, setTax] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .catch((err) => console.error('Error fetching orders:', err));
  }, []);

  const toggleExpand = (orderId: number) => {
    setExpandedOrderIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const getOrderStatus = (items: Item[]) => {
    if (items.every((item) => item.status === 'Arrived')) {
      return 'Completed';
    }
    if (items.every((item) => item.status === 'Cancelled')) {
      return 'Cancelled';
    }
    if (
      items.some(
        (item) => item.status === 'Ordered' || item.status === 'Arrived'
      )
    ) {
      return 'Ordered';
    }
    return 'Requested';
  };

  const getStatusButtonStyle = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-[#10A170] text-white hover:bg-[#006141]';
      case 'Ordered':
        return 'bg-[#FFB700] text-white hover:bg-[#cc9200]';
      case 'Requested':
        return 'bg-[#E61744] text-white hover:bg-[#A3082A]';
      case 'Cancelled':
        return 'bg-[#666666] text-white hover:bg-[#4d4d4d]';
    }
  };

  const openEditModal = (order: Order) => {
    setSelectedOrder(order);
    setEditedItems(order.items.map((item) => ({ ...item })));
    setSubtotal(order.subtotal ?? null);
    setTax(order.tax ?? null);
    setTotal(order.total ?? null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleItemStatusChange = (index: number, newStatus: string) => {
    const updatedItems = [...editedItems];
    updatedItems[index].status = newStatus;
    setEditedItems(updatedItems);
  };

  const handleFieldChange = (
    field: 'subtotal' | 'tax' | 'total',
    value: number
  ) => {
    if (field === 'subtotal') setSubtotal(value);
    if (field === 'tax') setTax(value);
    if (field === 'total') setTotal(value);
  };

  const handleSave = () => {
    console.log('Save not yet implemented');
    console.log({ editedItems, subtotal, tax, total });
    closeModal();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Orders</h2>
      <table className="w-full table-auto border-collapse border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Order Placed</th>
            <th className="border px-4 py-2">Need By</th>
            <th className="border px-4 py-2">Store</th>
            <th className="border px-4 py-2">Shipping</th>
            <th className="border px-4 py-2">Student Name</th>
            <th className="border px-4 py-2">Student Email</th>
            <th className="border px-4 py-2">Professor</th>
            <th className="border px-4 py-2">Workday Code</th>
            <th className="border px-4 py-2">Purpose</th>
            <th className="border px-4 py-2">Total</th>
            <th className="border px-4 py-2">Expand</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const isExpanded = expandedOrderIds.includes(order.id);
            const status = getOrderStatus(order.items);
            return (
              <>
                <tr key={order.id} className="bg-white hover:bg-gray-50">
                  <td className="border px-4 py-2 text-center">
                    <button
                      onClick={() => openEditModal(order)}
                      className={`px-3 py-1 rounded font-medium ${getStatusButtonStyle(status)}`}
                    >
                      {status}
                    </button>
                  </td>
                  <td className="border px-4 py-2">
                    {order.requestDate?.slice(0, 10) || 'N/A'}
                  </td>
                  <td className="border px-4 py-2">
                    {order.needByDate?.slice(0, 10) || 'N/A'}
                  </td>
                  <td className="border px-4 py-2">{order.store}</td>
                  <td className="border px-4 py-2">
                    {order.shippingPreference}
                  </td>
                  <td className="border px-4 py-2">
                    {order.user.firstName} {order.user.lastName}
                  </td>
                  <td className="border px-4 py-2">{order.user.email}</td>
                  <td className="border px-4 py-2">{order.professor}</td>
                  <td className="border px-4 py-2">{order.workdayCode}</td>
                  <td className="border px-4 py-2">{order.purpose}</td>
                  <td className="border px-4 py-2">{order.total}</td>
                  <td className="border px-4 py-2 text-center">
                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="text-byuRoyal hover:underline"
                    >
                      {isExpanded ? 'Hide ▲' : 'Show ▼'}
                    </button>
                  </td>
                </tr>
                {isExpanded && (
                  <tr key={`items-${order.id}`}>
                    <td colSpan={7} className="border-t px-4 py-2 bg-gray-50">
                      <table className="w-full table-auto">
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
                                    className="text-byuRoyal underline"
                                  >
                                    link
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
              </>
            );
          })}
        </tbody>
      </table>
      <EditOrderModal
        isOpen={isModalOpen}
        onClose={closeModal}
        items={editedItems}
        subtotal={subtotal}
        tax={tax}
        total={total}
        onItemStatusChange={handleItemStatusChange}
        onFieldChange={handleFieldChange}
        onSave={handleSave}
      />
    </div>
  );
};

export default AdminDashboard;
