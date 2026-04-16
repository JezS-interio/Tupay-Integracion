'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getOrderById, updateOrderStatus, updatePaymentStatus, addOrderNotes } from '@/lib/firebase/orders';
import { Order, OrderStatus, PaymentStatus } from '@/types/order';
import toast from 'react-hot-toast';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadOrder();
  }, [resolvedParams.id]);

  const loadOrder = async () => {
    try {
      const data = await getOrderById(resolvedParams.id);
      if (data) {
        setOrder(data);
        setNotes(data.notes || '');
      } else {
        toast.error('Order not found');
        router.push('/admin/orders');
      }
    } catch (error) {
      console.error('Error loading order:', error);
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (status: OrderStatus) => {
    if (!order) return;

    setUpdating(true);
    try {
      const success = await updateOrderStatus(order.orderId, status);
      if (success) {
        toast.success('Order status updated');
        setOrder({ ...order, orderStatus: status });
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating status');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePaymentStatus = async (status: PaymentStatus) => {
    if (!order) return;

    setUpdating(true);
    try {
      const success = await updatePaymentStatus(order.orderId, status);
      if (success) {
        toast.success('Payment status updated');
        setOrder({ ...order, paymentStatus: status });
      } else {
        toast.error('Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Error updating payment status');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!order) return;

    setUpdating(true);
    try {
      const success = await addOrderNotes(order.orderId, notes);
      if (success) {
        toast.success('Notes saved');
        setOrder({ ...order, notes });
      } else {
        toast.error('Failed to save notes');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Error saving notes');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Order not found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/orders" className="text-blue hover:text-blue-dark mb-4 inline-block">
          ← Back to Orders
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-dark mb-2">Order {order.orderId}</h2>
            <p className="text-gray-600">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <span
              className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full ${getStatusColor(
                order.orderStatus
              )}`}
            >
              {order.orderStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-dark mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  {item.img && (
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={item.img}
                        alt={item.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-dark">{item.title}</h4>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-sm text-gray-600">
                      ${item.discountedPrice.toFixed(2)} each
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-dark">
                      ${(item.discountedPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium">${order.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-dark mb-4">Shipping Address</h3>
            <div className="text-gray-700 space-y-1">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="pt-2">Phone: {order.shippingAddress.phone}</p>
              <p>Email: {order.shippingAddress.email}</p>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-dark mb-4">Admin Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Add notes about this order..."
              className="w-full rounded-lg border border-gray-3 bg-gray-1 p-4 outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
            />
            <button
              onClick={handleSaveNotes}
              disabled={updating}
              className="mt-3 px-6 py-2 bg-blue text-white rounded-lg hover:bg-blue-dark transition-colors disabled:opacity-50"
            >
              {updating ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>

        {/* Right Column - Status & Actions */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-dark mb-4">Customer</h3>
            <div className="space-y-2">
              <p className="font-medium text-dark">{order.userName}</p>
              <p className="text-sm text-gray-600">{order.userEmail}</p>
            </div>
          </div>

          {/* Order Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-dark mb-4">Order Status</h3>
            <div className="space-y-2">
              {(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => handleUpdateOrderStatus(status)}
                    disabled={updating || order.orderStatus === status}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-colors text-left ${
                      order.orderStatus === status
                        ? 'bg-blue text-white'
                        : 'bg-gray-100 text-dark hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-dark mb-4">Payment Status</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-3">
                Method: {order.paymentMethod}
              </p>
              {(['pending', 'paid', 'failed', 'refunded'] as PaymentStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => handleUpdatePaymentStatus(status)}
                  disabled={updating || order.paymentStatus === status}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-colors text-left ${
                    order.paymentStatus === status
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-dark hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
